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
    if (!source) throw new AppError(`Source not found: ${sourceId}`, 404);

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
          const metadata = await musicMetadata.parseFile(filePath);
          const title = metadata.common.title || path.basename(filePath, path.extname(filePath));
          const artistName = metadata.common.artist || metadata.common.albumartist || 'Unknown Artist';
          const albumTitle = metadata.common.album || 'Unknown Album';
          const year = metadata.common.year || null;
          const duration = metadata.format.duration || 0;
          const format = metadata.format.container || path.extname(filePath).replace('.', '').toUpperCase();
          const sampleRate = metadata.format.sampleRate || null;
          const bitDepth = metadata.format.bitsPerSample || null;
          const bitrate = metadata.format.bitrate
            ? `${Math.round(metadata.format.bitrate / 1000)} kbps`
            : bitDepth && sampleRate
            ? `${bitDepth}-bit / ${sampleRate / 1000}kHz`
            : 'Lossless';
          const trackNumber = metadata.common.track.no || null;
          const discNumber = metadata.common.disk.no || null;
          const genre = metadata.common.genre ? metadata.common.genre.join(', ') : null;

          // Process Cover Art
          let coverUrl: string | null = null;
          if (metadata.common.picture && metadata.common.picture.length > 0) {
            const picture = metadata.common.picture[0];
            const coverFileName = `${sourceId}-${Buffer.from(relativePath).toString('hex').substring(0, 16)}.jpg`;
            const coverPath = path.join(this.publicCoversDir, coverFileName);
            fs.writeFileSync(coverPath, picture.data);
            coverUrl = `/covers/${coverFileName}`;
          }

          // Upsert Artist
          const artist = await this.prisma.artist.upsert({
            where: { name: artistName },
            update: {},
            create: { name: artistName },
          });

          // Upsert Album
          let album = null;
          if (albumTitle) {
            album = await this.prisma.album.upsert({
              where: { title_artistId: { title: albumTitle, artistId: artist.id } },
              update: { coverUrl: coverUrl || undefined },
              create: { title: albumTitle, artistId: artist.id, year, coverUrl },
            });
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
          console.error(`Error parsing file ${filePath}:`, err);
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

      return { success: true, filesAdded, filesUpdated, filesDeleted, errorsCount };
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

    const list = fs.readdirSync(dirPath);
    for (const file of list) {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      if (stat && stat.isDirectory()) {
        results.push(...this.getAudioFilesRecursively(fullPath));
      } else {
        const ext = path.extname(file).toLowerCase();
        if (validExts.has(ext)) {
          results.push(fullPath);
        }
      }
    }
    return results;
  }
}
