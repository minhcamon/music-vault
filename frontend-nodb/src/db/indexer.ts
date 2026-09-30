import { db } from './database';
import { ProviderRegistry } from '../providers';
import { MetadataService } from '../services/metadata.service';
import { FileRefRegistry } from '../services/fileRefRegistry';
import { syncMetrics } from '../utils/syncMetrics';
import { isAudioFile } from '../utils/audioExtensions';
import type { StorageSource, Song, Album, Artist } from '../types';

export interface ScanOptions {
  force?: boolean;
}

export class LibraryIndexer {
  /**
   * Diff-based Incremental Source Synchronization
   */
  public static async scanSource(
    source: StorageSource,
    onProgress?: (processed: number, total: number, currentFile: string) => void,
    options?: ScanOptions
  ): Promise<{ songsAdded: number; songsSkipped: number; errors: number }> {
    syncMetrics.reset();
    const provider = ProviderRegistry.getProvider(source.type);
    if (!provider) {
      throw new Error(`Provider type ${source.type} not found in registry`);
    }

    await provider.init(source.config);
    syncMetrics.recordFilesListRequest();
    const rawFiles = await provider.listFiles();
    // Strictly filter out non-audio files (e.g. cover.jpg, folder.png, .cue, .log)
    const files = rawFiles.filter((f) => isAudioFile(f.name || f.path || ''));
    const total = files.length;
    let processed = 0;
    let songsAdded = 0;
    let songsSkipped = 0;
    let errors = 0;

    // 1. Load existing local songs for this source into a Map and purge any legacy non-audio records
    const existingSongs = await db.songs.where('sourceId').equals(source.id).toArray();
    const invalidSongIds: string[] = [];
    const localSongMap = new Map<string, Song>();

    for (const s of existingSongs) {
      if (!isAudioFile(s.path || s.title || s.id)) {
        invalidSongIds.push(s.id);
        continue;
      }
      const remoteKey = s.remoteId || (s.id.includes(':') ? s.id.split(':').slice(1).join(':') : s.path || s.id);
      localSongMap.set(remoteKey, s);
    }

    if (invalidSongIds.length > 0) {
      await db.songs.bulkDelete(invalidSongIds);
    }

    const remoteFileIdSet = new Set<string>();
    const songsToSave: Song[] = [];
    const BATCH_SIZE = 50;

    // Helper to flush current batch
    const flushBatch = async () => {
      if (songsToSave.length > 0) {
        await db.songs.bulkPut(songsToSave);
        songsToSave.length = 0;
      }
    };

    // 2. Iterate through remote files and diff
    for (const file of files) {
      try {
        processed++;
        onProgress?.(processed, total, file.name);
        remoteFileIdSet.add(file.id);

        const songId = `${source.id}:${file.id}`;
        if (file.fileRef) {
          FileRefRegistry.set(songId, file.fileRef);
        }

        const fingerprint =
          file.md5Checksum ||
          (file.modifiedTime ? `${file.modifiedTime}:${file.size}` : `${file.size}`);

        const localSong = localSongMap.get(file.id);

        // Check if file is completely unchanged
        if (
          !options?.force &&
          localSong &&
          localSong.remoteFingerprint === fingerprint &&
          localSong.indexStatus === 'ok'
        ) {
          songsSkipped++;
          syncMetrics.recordFileSkipped();
          continue;
        }

        // Check if file is a legacy v1 migration (has metadata but no fingerprint)
        if (
          !options?.force &&
          localSong &&
          !localSong.remoteFingerprint &&
          localSong.indexStatus === 'ok'
        ) {
          // Update fingerprint only, keep existing parsed metadata
          const updatedSong: Song = {
            ...localSong,
            remoteId: file.id,
            remoteFingerprint: fingerprint,
            remoteSize: file.size,
            remoteModifiedTime: file.modifiedTime,
          };
          songsToSave.push(updatedSong);
          songsSkipped++;
          syncMetrics.recordFileSkipped();

          if (songsToSave.length >= BATCH_SIZE) {
            await flushBatch();
          }
          continue;
        }

        // Needs full parsing (New or Modified)
        let parsedTag;
        if (file.fileRef instanceof File || file.fileRef instanceof Blob) {
          parsedTag = await MetadataService.parseBlobOrFile(file.fileRef, file.path || file.name);
          syncMetrics.recordFileParsed();
        } else {
          // Fallback for remote cloud files: read first 512KB for ID3/Vorbis header
          try {
            syncMetrics.recordReadRangeRequest();
            // Small 80ms delay between remote calls to respect anti-bot threshold
            await new Promise((resolve) => setTimeout(resolve, 80));
            const buffer = await provider.readRange(file.fileRef || file.id, 0, 512 * 1024);
            const blob = new Blob([buffer], { type: file.mimeType });
            parsedTag = await MetadataService.parseBlobOrFile(blob, file.path || file.name);
            syncMetrics.recordFileParsed();
          } catch (e) {
            console.warn(`[Indexer] Could not parse range tag for ${file.name}, fallback to filename:`, e);
            parsedTag = await MetadataService.parseBlobOrFile(new Blob([]), file.path || file.name);
            syncMetrics.recordParseError();
          }
        }

        let effectiveCoverId = parsedTag.coverId;
        // If no embedded cover, check folder image
        if (!effectiveCoverId && file.folderCoverBlobUrl) {
          try {
            const resp = await fetch(file.folderCoverBlobUrl);
            const blob = await resp.blob();
            const processedCover = await MetadataService.processCoverArt(blob);
            if (processedCover) {
              effectiveCoverId = processedCover.coverId;
            }
          } catch (_e) {
            // ignore folder cover error
          }
        }

        const song: Song = {
          id: songId,
          sourceId: source.id,
          remoteId: file.id,
          remoteFingerprint: fingerprint,
          remoteSize: file.size,
          remoteModifiedTime: file.modifiedTime,
          indexStatus: 'ok',
          title: parsedTag.title,
          artist: parsedTag.artist,
          album: parsedTag.album,
          duration: parsedTag.duration,
          format: parsedTag.format,
          bitrate: parsedTag.bitrate,
          sampleRate: parsedTag.sampleRate,
          bitDepth: parsedTag.bitDepth,
          trackNumber: parsedTag.trackNumber,
          discNumber: parsedTag.discNumber,
          genre: parsedTag.genre,
          year: parsedTag.year,
          path: file.path,
          coverId: effectiveCoverId,
          createdAt: localSong?.createdAt || new Date().toISOString(),
        };

        songsToSave.push(song);
        songsAdded++;

        if (songsToSave.length >= BATCH_SIZE) {
          await flushBatch();
        }
      } catch (e) {
        console.error(`Error indexing file ${file.name}:`, e);
        errors++;
        syncMetrics.recordParseError();
      }
    }

    // Flush any remaining songs
    await flushBatch();

    // 3. Mark missing files (present in DB but deleted on cloud)
    const missingSongs: Song[] = [];
    for (const [remoteId, song] of localSongMap.entries()) {
      if (!remoteFileIdSet.has(remoteId) && song.indexStatus !== 'missing') {
        missingSongs.push({
          ...song,
          indexStatus: 'missing',
          missingSince: song.missingSince || new Date().toISOString(),
        });
      }
    }
    if (missingSongs.length > 0) {
      await db.songs.bulkPut(missingSongs);
    }

    // 4. Album cover healing for legacy albums (fetch 1 sample file per album without coverId)
    const allActiveSongs = await db.songs
      .where('sourceId')
      .equals(source.id)
      .filter((s) => s.indexStatus === 'ok')
      .toArray();

    const albumMap = new Map<string, { title: string; artist: string; year?: number; coverId?: string; songCount: number; sampleSong?: Song }>();
    const artistMap = new Map<string, { name: string; songCount: number; albumSet: Set<string> }>();

    for (const song of allActiveSongs) {
      const cleanAlbumTitle = song.album.trim();
      const cleanArtistName = song.artist.trim();
      const albumKey = `${cleanAlbumTitle}:::${cleanArtistName}`;

      if (!albumMap.has(albumKey)) {
        albumMap.set(albumKey, {
          title: cleanAlbumTitle,
          artist: cleanArtistName,
          year: song.year,
          coverId: song.coverId,
          songCount: 1,
          sampleSong: song,
        });
      } else {
        const item = albumMap.get(albumKey)!;
        item.songCount++;
        if (!item.coverId && song.coverId) {
          item.coverId = song.coverId;
        }
      }

      const artistKey = cleanArtistName;
      if (!artistMap.has(artistKey)) {
        artistMap.set(artistKey, {
          name: cleanArtistName,
          songCount: 1,
          albumSet: new Set([cleanAlbumTitle]),
        });
      } else {
        const item = artistMap.get(artistKey)!;
        item.songCount++;
        item.albumSet.add(cleanAlbumTitle);
      }
    }

    // Attempt heal albums without coverId
    for (const item of albumMap.values()) {
      if (!item.coverId && item.sampleSong && item.sampleSong.remoteId) {
        try {
          syncMetrics.recordReadRangeRequest();
          const buffer = await provider.readRange(item.sampleSong.remoteId, 0, 512 * 1024);
          const blob = new Blob([buffer], { type: 'audio/flac' });
          const parsed = await MetadataService.parseBlobOrFile(blob, item.sampleSong.path);
          if (parsed.coverId) {
            item.coverId = parsed.coverId;
            // Update all songs of this album
            const songsToHeal = allActiveSongs.filter(
              (s) => s.album.trim() === item.title && s.artist.trim() === item.artist && !s.coverId
            );
            for (const s of songsToHeal) {
              s.coverId = parsed.coverId;
            }
            if (songsToHeal.length > 0) {
              await db.songs.bulkPut(songsToHeal);
            }
          }
        } catch (_e) {
          // healing is best-effort
        }
      }
    }

    // 5. Build and persist updated Albums & Artists arrays
    const albumsToSave: Album[] = [];
    for (const [key, item] of albumMap.entries()) {
      albumsToSave.push({
        id: `alb:${key}`,
        title: item.title,
        artist: item.artist,
        songCount: item.songCount,
        year: item.year,
        coverId: item.coverId,
      });
    }

    const artistsToSave: Artist[] = [];
    for (const [key, item] of artistMap.entries()) {
      artistsToSave.push({
        id: `art:${key}`,
        name: item.name,
        songCount: item.songCount,
        albumCount: item.albumSet.size,
      });
    }

    await db.transaction('rw', [db.albums, db.artists, db.sources], async () => {
      if (albumsToSave.length > 0) {
        await db.albums.bulkPut(albumsToSave);
      }
      if (artistsToSave.length > 0) {
        await db.artists.bulkPut(artistsToSave);
      }
      await db.sources.update(source.id, {
        lastScannedAt: new Date().toISOString(),
        lastSyncAt: new Date().toISOString(),
        lastSyncResult: 'ok',
        songCount: allActiveSongs.length,
      });
    });

    syncMetrics.finish();
    return { songsAdded, songsSkipped, errors };
  }
}
