import * as mmb from 'music-metadata-browser';

export interface ParsedMetadata {
  title: string;
  artist: string;
  album: string;
  duration: number;
  format: string;
  bitrate?: string;
  sampleRate?: number;
  bitDepth?: number;
  trackNumber?: number;
  discNumber?: number;
  genre?: string;
  year?: number;
  coverBlobUrl?: string;
}

export class MetadataService {
  private static getNativeTagValue(
    native: Record<string, any[]> | undefined,
    targetKeys: string[]
  ): string | undefined {
    if (!native) return undefined;
    const lowerKeys = targetKeys.map((k) => k.toLowerCase());

    for (const tagFormat of Object.keys(native)) {
      const tagArray = native[tagFormat];
      if (Array.isArray(tagArray)) {
        for (const tag of tagArray) {
          if (tag && tag.id) {
            const lowerId = String(tag.id).toLowerCase();
            if (lowerKeys.includes(lowerId)) {
              if (tag.value !== undefined && tag.value !== null && tag.value !== '') {
                return Array.isArray(tag.value) ? tag.value.join(', ') : String(tag.value);
              }
            }
          }
        }
      }
    }
    return undefined;
  }

  /**
   * Direct Binary Header Scanner: Reads raw bytes to extract ARTIST=..., ALBUM=..., TITLE=...
   * if music-metadata-browser fails to parse non-standard FLAC or ID3 headers.
   */
  private static async scanRawBufferForTags(file: Blob): Promise<{ artist?: string; album?: string; title?: string }> {
    try {
      const slice = file.slice(0, 512 * 1024); // First 512KB header
      const arrayBuffer = await slice.arrayBuffer();
      const uint8 = new Uint8Array(arrayBuffer);
      const textUtf8 = new TextDecoder('utf-8', { fatal: false }).decode(uint8);

      let artist: string | undefined = undefined;
      let album: string | undefined = undefined;
      let title: string | undefined = undefined;

      // Vorbis Comment Tag Patterns: KEY=VALUE
      const artistMatch = textUtf8.match(/(?:ALBUMARTIST|ALBUM ARTIST|ARTIST|PERFORMER)=([^\x00-\x1F\x7F]+)/i);
      if (artistMatch && artistMatch[1]) {
        const clean = artistMatch[1].trim();
        if (clean && !clean.includes('==')) artist = clean;
      }

      const albumMatch = textUtf8.match(/ALBUM=([^\x00-\x1F\x7F]+)/i);
      if (albumMatch && albumMatch[1]) {
        const clean = albumMatch[1].trim();
        if (clean && !clean.includes('==')) album = clean;
      }

      const titleMatch = textUtf8.match(/TITLE=([^\x00-\x1F\x7F]+)/i);
      if (titleMatch && titleMatch[1]) {
        const clean = titleMatch[1].trim();
        if (clean && !clean.includes('==')) title = clean;
      }

      return { artist, album, title };
    } catch (e) {
      return {};
    }
  }

  public static async calculateAudioDuration(file: Blob): Promise<number> {
    return new Promise((resolve) => {
      try {
        const url = URL.createObjectURL(file);
        const audio = new Audio();
        audio.preload = 'metadata';
        audio.onloadedmetadata = () => {
          const d = audio.duration;
          URL.revokeObjectURL(url);
          resolve(isFinite(d) && !isNaN(d) ? d : 0);
        };
        audio.onerror = () => {
          URL.revokeObjectURL(url);
          resolve(0);
        };
        audio.src = url;
      } catch (e) {
        resolve(0);
      }
    });
  }

  public static async parseBlobOrFile(
    file: File | Blob,
    filePath: string
  ): Promise<ParsedMetadata> {
    const fileName = filePath.split(/[/\\]/).pop() || filePath;
    const cleanFileName = fileName.replace(/\.[^/.]+$/, '');

    // 1. Filename pattern parsing (e.g. "RPT MCK - Elegie.flac" or "RPT MCK - HVL - Elegie.flac")
    let fnArtist: string | undefined = undefined;
    let fnAlbum: string | undefined = undefined;
    let fnTitle: string | undefined = undefined;

    if (cleanFileName.includes(' - ')) {
      const parts = cleanFileName.split(' - ').map((s) => s.trim());
      if (parts.length === 2) {
        fnArtist = parts[0];
        fnTitle = parts[1];
      } else if (parts.length >= 3) {
        fnArtist = parts[0];
        fnAlbum = parts[1];
        fnTitle = parts.slice(2).join(' - ');
      }
    }

    // 2. Folder Path Fallback for Album & Artist
    const pathParts = filePath.split(/[/\\]/).filter(Boolean);
    let pathAlbum = fnAlbum || 'Album chưa biết';
    let pathArtist = fnArtist || 'Nghệ sĩ chưa biết';

    if (pathParts.length >= 2 && !fnAlbum) {
      pathAlbum = pathParts[pathParts.length - 2];
    }
    if (pathParts.length >= 3 && !fnArtist) {
      pathArtist = pathParts[pathParts.length - 3];
    } else if (pathAlbum.includes(' - ') && !fnArtist) {
      const [art, alb] = pathAlbum.split(' - ');
      if (art && alb) {
        pathArtist = art.trim();
        pathAlbum = alb.trim();
      }
    }

    let parsedTitle: string | undefined = undefined;
    let parsedArtist: string | undefined = undefined;
    let parsedAlbum: string | undefined = undefined;
    let parsedDuration = 0;
    let coverBlobUrl: string | undefined = undefined;
    let codec = fileName.split('.').pop()?.toUpperCase() || 'FLAC';
    let bitrate: string | undefined = undefined;
    let sampleRate: number | undefined = undefined;
    let bitDepth: number | undefined = undefined;
    let trackNumber: number | undefined = undefined;
    let discNumber: number | undefined = undefined;
    let genre: string | undefined = undefined;
    let year: number | undefined = undefined;

    try {
      const metadata = await mmb.parseBlob(file);
      const common = metadata.common;
      const format = metadata.format;
      const native = metadata.native;

      if (common.picture && common.picture.length > 0) {
        const pic = common.picture[0];
        const buffer = pic.data.buffer.slice(
          pic.data.byteOffset,
          pic.data.byteOffset + pic.data.byteLength
        ) as ArrayBuffer;
        const blob = new Blob([buffer], { type: pic.format });
        coverBlobUrl = URL.createObjectURL(blob);
      }

      // Title
      const nativeTitle = this.getNativeTagValue(native, ['TITLE', 'TIT2', 'nam', '©nam']);
      parsedTitle = common.title || nativeTitle || fnTitle;

      // Artist
      const nativeArtist = this.getNativeTagValue(native, [
        'ARTIST',
        'ALBUMARTIST',
        'ALBUM ARTIST',
        'CONTRIBUTING ARTISTS',
        'CONTRIBUTINGARTISTS',
        'PERFORMER',
        'TPE1',
        'TPE2',
        'aART',
        '©ART',
      ]);
      const rawArtist =
        common.artist ||
        common.albumartist ||
        (common.artists && common.artists.length > 0 ? common.artists.join(', ') : undefined) ||
        nativeArtist ||
        common.composer;
      if (rawArtist) {
        parsedArtist = Array.isArray(rawArtist) ? rawArtist.join(', ') : String(rawArtist);
      }

      // Album
      const nativeAlbum = this.getNativeTagValue(native, ['ALBUM', 'TALB', '©alb']);
      const rawAlbum = common.album || nativeAlbum;
      if (rawAlbum) {
        parsedAlbum = Array.isArray(rawAlbum) ? rawAlbum.join(', ') : String(rawAlbum);
      }

      // Year
      const nativeYear = this.getNativeTagValue(native, ['DATE', 'YEAR', 'TDRC', 'TYER', '©day']);
      year = common.year;
      if (!year && nativeYear) {
        const y = parseInt(nativeYear.slice(0, 4), 10);
        if (!isNaN(y)) year = y;
      }

      // Track Number
      const nativeTrack = this.getNativeTagValue(native, ['TRACKNUMBER', 'TRACK', 'TRCK', 'trkn']);
      trackNumber = common.track?.no || undefined;
      if (!trackNumber && nativeTrack) {
        const t = parseInt(nativeTrack.split('/')[0], 10);
        if (!isNaN(t)) trackNumber = t;
      }

      discNumber = common.disk?.no || undefined;
      genre = common.genre ? common.genre.join(', ') : undefined;

      // Audio format info
      codec = format.container || format.codec || codec;
      sampleRate = format.sampleRate;
      bitDepth = format.bitsPerSample;
      parsedDuration = format.duration || 0;

      if (bitDepth && sampleRate) {
        bitrate = `${bitDepth}-bit / ${(sampleRate / 1000).toFixed(1)}kHz`;
      } else if (format.bitrate) {
        bitrate = `${Math.round(format.bitrate / 1000)} kbps`;
      }
    } catch (e) {
      console.warn(`mmb.parseBlob fallback for ${filePath}:`, e);
    }

    // Direct Binary Header Scan Fallback if parsedArtist or parsedAlbum is still missing
    if (!parsedArtist || !parsedAlbum || !parsedTitle) {
      const rawTags = await this.scanRawBufferForTags(file);
      if (!parsedArtist && rawTags.artist) parsedArtist = rawTags.artist;
      if (!parsedAlbum && rawTags.album) parsedAlbum = rawTags.album;
      if (!parsedTitle && rawTags.title) parsedTitle = rawTags.title;
    }

    // HTML5 Audio Duration Fallback
    if (!parsedDuration || parsedDuration === 0) {
      parsedDuration = await this.calculateAudioDuration(file);
    }

    // Final Field Merging
    const finalTitle = (parsedTitle || cleanFileName).trim();
    const finalArtist = (parsedArtist || pathArtist).trim();
    const finalAlbum = (parsedAlbum || pathAlbum).trim();

    return {
      title: finalTitle,
      artist: finalArtist,
      album: finalAlbum,
      duration: parsedDuration,
      format: codec.toUpperCase(),
      bitrate: bitrate || 'Lossless',
      sampleRate,
      bitDepth,
      trackNumber,
      discNumber,
      genre,
      year,
      coverBlobUrl,
    };
  }
}
