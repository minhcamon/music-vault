import { db } from './database';
import { ProviderRegistry } from '../providers';
import { MetadataService } from '../services/metadata.service';
import { FileRefRegistry } from '../services/fileRefRegistry';
import type { StorageSource, Song, Album, Artist } from '../types';

export class LibraryIndexer {
  public static async scanSource(
    source: StorageSource,
    onProgress?: (processed: number, total: number, currentFile: string) => void
  ): Promise<{ songsAdded: number; errors: number }> {
    const provider = ProviderRegistry.getProvider(source.type);
    if (!provider) {
      throw new Error(`Provider type ${source.type} not found in registry`);
    }

    await provider.init(source.config);
    const files = await provider.listFiles();
    const total = files.length;
    let processed = 0;
    let songsAdded = 0;
    let errors = 0;

    const songsToSave: Song[] = [];
    const albumMap = new Map<string, { title: string; artist: string; year?: number; coverBlobUrl?: string; songCount: number }>();
    const artistMap = new Map<string, { name: string; songCount: number; albumSet: Set<string> }>();

    for (const file of files) {
      try {
        processed++;
        onProgress?.(processed, total, file.name);

        let parsedTag;
        if (file.fileRef instanceof File || file.fileRef instanceof Blob) {
          parsedTag = await MetadataService.parseBlobOrFile(file.fileRef, file.path || file.name);
        } else {
          // Fallback cho remote cloud files: đọc 512KB đầu để trích xuất thẻ ID3/Vorbis
          try {
            // Thêm delay nhỏ 80ms giữa các file để không kích hoạt hệ thống Google Drive Anti-Bot
            await new Promise((resolve) => setTimeout(resolve, 80));
            const buffer = await provider.readRange(file.fileRef || file.id, 0, 512 * 1024);
            const blob = new Blob([buffer], { type: file.mimeType });
            parsedTag = await MetadataService.parseBlobOrFile(blob, file.path || file.name);
          } catch (e) {
            console.warn(`[Indexer] Không thể đọc băm tag cho file ${file.name}, chuyển sang tự động bóc tách tên file:`, e);
            parsedTag = await MetadataService.parseBlobOrFile(new Blob([]), file.path || file.name);
          }
        }

        // Cover Art Priority: Embedded picture > Folder image (cover.png/jpg)
        const effectiveCoverUrl = parsedTag.coverBlobUrl || file.folderCoverBlobUrl;

        const songId = `${source.id}:${file.id}`;
        
        // Register live File reference in In-Memory registry
        if (file.fileRef) {
          FileRefRegistry.set(songId, file.fileRef);
        }

        const song: Song = {
          id: songId,
          sourceId: source.id,
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
          coverBlobUrl: effectiveCoverUrl,
          createdAt: new Date().toISOString(),
        };

        songsToSave.push(song);
        songsAdded++;

        // Track Album (Clean Normalization)
        const cleanAlbumTitle = parsedTag.album.trim();
        const cleanArtistName = parsedTag.artist.trim();
        const albumKey = `${cleanAlbumTitle}:::${cleanArtistName}`;

        if (!albumMap.has(albumKey)) {
          albumMap.set(albumKey, {
            title: cleanAlbumTitle,
            artist: cleanArtistName,
            year: parsedTag.year,
            coverBlobUrl: effectiveCoverUrl,
            songCount: 1,
          });
        } else {
          const item = albumMap.get(albumKey)!;
          item.songCount++;
          if (!item.coverBlobUrl && effectiveCoverUrl) {
            item.coverBlobUrl = effectiveCoverUrl;
          }
        }

        // Track Artist
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
      } catch (e) {
        console.error(`Error indexing file ${file.name}:`, e);
        errors++;
      }
    }

    // Build Albums array
    const albumsToSave: Album[] = [];
    for (const [key, item] of albumMap.entries()) {
      const albumId = `alb:${key}`;
      albumsToSave.push({
        id: albumId,
        title: item.title,
        artist: item.artist,
        songCount: item.songCount,
        year: item.year,
        coverBlobUrl: item.coverBlobUrl,
      });
    }

    // Build Artists array
    const artistsToSave: Artist[] = [];
    for (const [key, item] of artistMap.entries()) {
      const artistId = `art:${key}`;
      artistsToSave.push({
        id: artistId,
        name: item.name,
        songCount: item.songCount,
        albumCount: item.albumSet.size,
      });
    }

    // Execute SINGLE ATOMIC BATCH TRANSACTION in Dexie
    await db.transaction('rw', [db.songs, db.albums, db.artists, db.sources], async () => {
      if (songsToSave.length > 0) {
        await db.songs.bulkPut(songsToSave);
      }
      if (albumsToSave.length > 0) {
        await db.albums.bulkPut(albumsToSave);
      }
      if (artistsToSave.length > 0) {
        await db.artists.bulkPut(artistsToSave);
      }

      await db.sources.update(source.id, {
        lastScannedAt: new Date().toISOString(),
        songCount: songsAdded,
      });
    });

    return { songsAdded, errors };
  }
}
