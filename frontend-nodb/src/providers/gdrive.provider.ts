import type { IStorageProvider, StorageFile, StorageProviderMeta } from './base.provider';

export class GoogleDriveProvider implements IStorageProvider {
  public readonly meta: StorageProviderMeta = {
    type: 'GDRIVE',
    name: 'Google Drive',
    iconName: 'Cloud',
    description: 'Kết nối Google Drive qua BFF Proxy bảo mật (Không nhúng API Key trên browser)',
    configFields: [
      {
        key: 'folderId',
        label: 'Google Drive Folder ID hoặc Đường dẫn (Link)',
        type: 'text',
        placeholder: '1A2b3C4d5E6f... hoặc https://drive.google.com/drive/folders/...',
        required: true,
      },
    ],
  };

  private folderId: string = '';

  private extractFolderId(input: string): string {
    if (!input) return '';
    const folderMatch = input.match(/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch) return folderMatch[1];
    const idMatch = input.match(/id=([a-zA-Z0-9_-]+)/);
    if (idMatch) return idMatch[1];
    return input.trim();
  }

  public async init(config: Record<string, any>): Promise<boolean> {
    this.folderId = this.extractFolderId(config.folderId || '');
    return true;
  }

  public async validateConfig(config: Record<string, any>): Promise<{ valid: boolean; error?: string }> {
    if (!config.folderId) {
      return { valid: false, error: 'Vui lòng nhập Folder ID hoặc Link Google Drive' };
    }
    return { valid: true };
  }

  public async listFiles(): Promise<StorageFile[]> {
    if (!this.folderId) {
      console.warn('GoogleDriveProvider: Thiếu folderId');
      return [];
    }

    try {
      const url = `/api/gdrive/files?folderId=${encodeURIComponent(this.folderId)}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        console.error(`Google Drive Proxy Error (${res.status}):`, errorData);
        throw new Error(errorData.error || `BFF Proxy HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      const files = data.files || [];

      return files.map((file: any) => ({
        id: file.id,
        name: file.name,
        path: file.name,
        size: parseInt(file.size || '0', 10),
        mimeType: file.mimeType || 'audio/mpeg',
        fileRef: file.id,
      }));
    } catch (err: any) {
      console.error('Google Drive list error:', err);
      return [];
    }
  }

  public async readRange(fileRef: any, start: number, end: number): Promise<ArrayBuffer> {
    const fileId = typeof fileRef === 'string' ? fileRef : fileRef.id || fileRef;
    const url = `/api/gdrive/media?fileId=${encodeURIComponent(fileId)}`;
    const res = await fetch(url, {
      headers: {
        Range: `bytes=${start}-${end}`,
      },
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch media range from BFF: ${res.statusText}`);
    }
    return await res.arrayBuffer();
  }

  public async getStreamUrl(fileRef: any): Promise<string> {
    const fileId = typeof fileRef === 'string' ? fileRef : fileRef.id || fileRef;
    return `/api/gdrive/media?fileId=${encodeURIComponent(fileId)}`;
  }
}
