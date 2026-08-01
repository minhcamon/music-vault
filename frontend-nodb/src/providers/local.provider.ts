import type { IStorageProvider, StorageFile, StorageProviderMeta } from './base.provider';

export class LocalStorageProvider implements IStorageProvider {
  public readonly meta: StorageProviderMeta = {
    type: 'LOCAL',
    name: 'Thư mục máy tính (Local FS)',
    iconName: 'Folder',
    description: 'Quét trực tiếp nhạc từ ổ đĩa máy tính qua Web File System Access API',
    configFields: [],
  };

  private directoryHandle?: any;

  public async init(config: Record<string, any>): Promise<boolean> {
    if (config.directoryHandle) {
      this.directoryHandle = config.directoryHandle;
    }
    return true;
  }

  public async validateConfig(config: Record<string, any>): Promise<{ valid: boolean; error?: string }> {
    if (!config.directoryHandle) {
      return { valid: false, error: 'Vui lòng chọn 1 thư mục trên máy tính' };
    }
    return { valid: true };
  }

  public async listFiles(): Promise<StorageFile[]> {
    if (!this.directoryHandle) {
      return [];
    }

    const audioFiles: StorageFile[] = [];
    const audioExtensions = ['.flac', '.mp3', '.wav', '.m4a', '.aac', '.ogg'];
    const imageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

    async function scanDirectory(handle: any, currentPath: string) {
      const entries: any[] = [];
      let folderCoverBlobUrl: string | undefined = undefined;
      let coverFileEntry: any = null;

      // First pass: gather entries and look for cover image
      for await (const entry of handle.values()) {
        entries.push(entry);
        if (entry.kind === 'file') {
          const lowerName = entry.name.toLowerCase();
          const ext = lowerName.slice(lowerName.lastIndexOf('.'));
          if (imageExtensions.includes(ext)) {
            if (
              lowerName.includes('cover') ||
              lowerName.includes('folder') ||
              lowerName.includes('front') ||
              lowerName.includes('album') ||
              !coverFileEntry
            ) {
              coverFileEntry = entry;
            }
          }
        }
      }

      if (coverFileEntry) {
        try {
          const imgFile = await coverFileEntry.getFile();
          folderCoverBlobUrl = URL.createObjectURL(imgFile);
        } catch (e) {
          console.warn(`Could not read cover image ${coverFileEntry.name}:`, e);
        }
      }

      // Second pass: process audio files & recurse subdirectories
      for (const entry of entries) {
        if (entry.kind === 'file') {
          const ext = entry.name.slice(entry.name.lastIndexOf('.')).toLowerCase();
          if (audioExtensions.includes(ext)) {
            const file = await entry.getFile();
            audioFiles.push({
              id: `${currentPath}/${entry.name}`,
              name: entry.name,
              path: `${currentPath}/${entry.name}`,
              size: file.size,
              mimeType: file.type || 'audio/flac',
              fileRef: file,
              folderCoverBlobUrl,
            });
          }
        } else if (entry.kind === 'directory') {
          await scanDirectory(entry, `${currentPath}/${entry.name}`);
        }
      }
    }

    await scanDirectory(this.directoryHandle, this.directoryHandle.name);
    return audioFiles;
  }

  public async readRange(fileRef: any, start: number, end: number): Promise<ArrayBuffer> {
    const file: File = fileRef;
    const blob = file.slice(start, end);
    return await blob.arrayBuffer();
  }

  public async getStreamUrl(fileRef: any): Promise<string> {
    const file: File = fileRef;
    return URL.createObjectURL(file);
  }
}
