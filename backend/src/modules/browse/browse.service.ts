import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { AppError } from '../../shared/errors/app-error.js';

export interface DirectoryItem {
  name: string;
  path: string;
  isDirectory: boolean;
  audioCount: number;
}

export class BrowseService {
  async getDrives(): Promise<string[]> {
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      const drives: string[] = [];
      // Test drive letters A: to Z:
      for (let i = 65; i <= 90; i++) {
        const driveLetter = String.fromCharCode(i) + ':\\';
        try {
          if (fs.existsSync(driveLetter)) {
            drives.push(driveLetter);
          }
        } catch {
          // Ignore unaccessible drives
        }
      }
      return drives.length > 0 ? drives : ['C:\\'];
    } else {
      return ['/'];
    }
  }

  async getDirectoryContents(targetPath?: string): Promise<{ currentPath: string; parentPath: string | null; items: DirectoryItem[] }> {
    let currentPath = targetPath ? path.normalize(targetPath) : '';
    if (!currentPath) {
      const drives = await this.getDrives();
      currentPath = drives[0] || 'C:\\';
    }

    if (!fs.existsSync(currentPath)) {
      throw new AppError(`Path does not exist: ${currentPath}`, 404);
    }

    const stat = fs.statSync(currentPath);
    if (!stat.isDirectory()) {
      throw new AppError(`Path is not a directory: ${currentPath}`, 400);
    }

    const parentPath = path.dirname(currentPath) !== currentPath ? path.dirname(currentPath) : null;
    const items: DirectoryItem[] = [];

    const validAudioExts = new Set(['.flac', '.wav', '.mp3', '.m4a', '.alac', '.ogg']);

    try {
      const files = fs.readdirSync(currentPath, { withFileTypes: true });

      for (const file of files) {
        // Skip hidden files and system directories
        if (file.name.startsWith('.') || file.name.startsWith('$') || file.name === 'System Volume Information') {
          continue;
        }

        const fullPath = path.join(currentPath, file.name);

        if (file.isDirectory()) {
          let audioCount = 0;
          try {
            const subFiles = fs.readdirSync(fullPath);
            audioCount = subFiles.filter((f) => validAudioExts.has(path.extname(f).toLowerCase())).length;
          } catch {
            // Ignore restricted directories
          }

          items.push({
            name: file.name,
            path: fullPath,
            isDirectory: true,
            audioCount,
          });
        }
      }
    } catch (err: any) {
      throw new AppError(`Failed to read directory: ${err.message}`, 400);
    }

    // Sort items alphabetically
    items.sort((a, b) => a.name.localeCompare(b.name));

    return {
      currentPath,
      parentPath,
      items,
    };
  }
}
