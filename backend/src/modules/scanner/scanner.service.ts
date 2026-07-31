import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';
import * as musicMetadata from 'music-metadata';
import { AppError } from '../../shared/errors/app-error.js';

export class ScannerService {
  private readonly publicCoversDir: string;

  constructor(private readonly prisma: PrismaClient) {
    this.publicCoversDir = path.join(process.cwd(), 'public', 'covers');
    if (!fs.existsSync(this.publicCoversDir)) {
      fs.mkdirSync(this.publicCoversDir, { recursive: true });
    }
  }

  async scanSource(sourceId: string) {
    const source = await this.prisma.source.findUnique({ where: { id: sourceId } });
    if (!source) throw new AppError(`Nguồn nhạc không tồn tại trong hệ thống: ${sourceId}`, 404);

    if (!fs.existsSync(source.path)) {
      throw new AppError(`Thư mục không tồn tại trên ổ đĩa: ${source.path}`, 400);
    }

    const scanLog = await this.prisma.scanLog.create({
      data: { sourceId, status: 'IN_PROGRESS' },
    });

    let filesAdded = 0;
    let filesUpdated = 0;
    let filesDeleted = 0;
    let errorsCount = 0;

    try {
      const audioFiles = this.getAudioFilesRecursively(source.path);
      const existingSongs = await this.prisma.song.findMany({ where: { sourceId } });
      const existingPathMap = new Map<string, any>(existingSongs.map((s: any) => [s.relativePath, s]));

      const currentPathSet = new Set<string>();

      for (const filePath of audioFiles) {
        const relativePath = path.relative(source.path, filePath);
        currentPathSet.add(relativePath);

        try {
          let title = path.basename(filePath, path.extname(filePath));
          let artistName = 'Unknown Artist';
          let albumTitle = 'Unknown Album';
          let year: number | null = null;
          let duration = 0;
          let format = path.extname(filePath).replace('.', '').toUpperCase();
          let sampleRate: number | null = null;
          let bitDepth: number | null = null;
          let bitrate: string | null = 'Lossless';
          let trackNumber: number | null = null;
          let discNumber: number | null = null;
          let genre: string | null = null;
          let coverUrl: string | null = null;

          try {
            const metadata = await musicMetadata.parseFile(filePath);
            if (metadata.common.title) title = metadata.common.title;
            if (metadata.common.artist || metadata.common.albumartist) {
              artistName = metadata.common.artist || metadata.common.albumartist || 'Unknown Artist';
            }
            if (metadata.common.album) albumTitle = metadata.common.album;
            if (metadata.common.year) year = metadata.common.year;
            if (metadata.format.duration) duration = metadata.format.duration;
            if (metadata.format.container) format = metadata.format.container.toUpperCase();
            if (metadata.format.sampleRate) sampleRate = metadata.format.sampleRate;
            if (metadata.format.bitsPerSample) bitDepth = metadata.format.bitsPerSample;
            if (metadata.format.bitrate) {
              bitrate = `${Math.round(metadata.format.bitrate / 1000)} kbps`;
            } else if (bitDepth && sampleRate) {
              bitrate = `${bitDepth}-bit / ${sampleRate / 1000}kHz`;
            }
            if (metadata.common.track?.no) trackNumber = metadata.common.track.no;
            if (metadata.common.disk?.no) discNumber = metadata.common.disk.no;
            if (metadata.common.genre?.length) genre = metadata.common.genre.join(', ');

            // Process Cover Art
            if (metadata.common.picture && metadata.common.picture.length > 0) {
              const picture = metadata.common.picture[0];
              const coverFileName = `${sourceId}-${Buffer.from(relativePath).toString('hex').substring(0, 16)}.jpg`;
              const coverPath = path.join(this.publicCoversDir, coverFileName);
              fs.writeFileSync(coverPath, picture.data);
              coverUrl = `/covers/${coverFileName}`;
            }
          } catch (metaErr) {
            console.warn(`Không đọc được metadata tag của file ${filePath}, dùng thông tin fallback:`, metaErr);
          }

          // Safe Artist Lookup/Create
          let artist = await this.prisma.artist.findFirst({ where: { name: artistName } });
          if (!artist) {
            artist = await this.prisma.artist.create({ data: { name: artistName } });
          }

          // Safe Album Lookup/Create
          let album = null;
          if (albumTitle) {
            album = await this.prisma.album.findFirst({
              where: { title: albumTitle, artistId: artist.id },
            });
            if (!album) {
              album = await this.prisma.album.create({
                data: { title: albumTitle, artistId: artist.id, year, coverUrl },
              });
            } else if (coverUrl && !album.coverUrl) {
              await this.prisma.album.update({
                where: { id: album.id },
                data: { coverUrl },
              });
            }
          }

          const existingSong = existingPathMap.get(relativePath);
          if (existingSong) {
            await this.prisma.song.update({
              where: { id: existingSong.id },
              data: {
                title,
                duration,
                format,
                bitrate,
                sampleRate,
                bitDepth,
                trackNumber,
                discNumber,
                genre,
                coverUrl: coverUrl || existingSong.coverUrl,
                artistId: artist.id,
                albumId: album ? album.id : null,
                missing: false,
              },
            });
            filesUpdated++;
          } else {
            await this.prisma.song.create({
              data: {
                title,
                duration,
                fileUrl: filePath,
                relativePath,
                coverUrl,
                format,
                bitrate,
                sampleRate,
                bitDepth,
                trackNumber,
                discNumber,
                genre,
                sourceId,
                artistId: artist.id,
                albumId: album ? album.id : null,
              },
            });
            filesAdded++;
          }
        } catch (err) {
          console.error(`Lỗi xử lý file ${filePath}:`, err);
          errorsCount++;
        }
      }

      // Mark missing songs
      for (const [relPath, song] of existingPathMap.entries()) {
        if (!currentPathSet.has(relPath) && !song.missing) {
          await this.prisma.song.update({
            where: { id: song.id },
            data: { missing: true },
          });
          filesDeleted++;
        }
      }

      await this.prisma.source.update({
        where: { id: sourceId },
        data: { lastScannedAt: new Date() },
      });

      await this.prisma.scanLog.update({
        where: { id: scanLog.id },
        data: {
          status: 'COMPLETED',
          filesAdded,
          filesUpdated,
          filesDeleted,
          completedAt: new Date(),
        },
      });

      return { success: true, filesAdded, filesUpdated, filesDeleted, errorsCount, totalAudioFiles: audioFiles.length };
    } catch (err: any) {
      await this.prisma.scanLog.update({
        where: { id: scanLog.id },
        data: { status: 'FAILED', errors: err.message, completedAt: new Date() },
      });
      throw err;
    }
  }

  private getAudioFilesRecursively(dirPath: string): string[] {
    const validExts = new Set(['.flac', '.wav', '.mp3', '.m4a', '.alac', '.ogg']);
    const results: string[] = [];

    if (!fs.existsSync(dirPath)) return results;

    try {
      const list = fs.readdirSync(dirPath);
      for (const file of list) {
        // Skip hidden/system files
        if (file.startsWith('.') || file.startsWith('$') || file === 'System Volume Information') {
          continue;
        }

        const fullPath = path.join(dirPath, file);
        try {
          const stat = fs.statSync(fullPath);
          if (stat && stat.isDirectory()) {
            results.push(...this.getAudioFilesRecursively(fullPath));
          } else {
            const ext = path.extname(file).toLowerCase();
            if (validExts.has(ext)) {
              results.push(fullPath);
            }
          }
        } catch {
          // Ignore restricted files/folders
        }
      }
    } catch {
      // Ignore restricted directory listing errors
    }

    return results;
  }
}
