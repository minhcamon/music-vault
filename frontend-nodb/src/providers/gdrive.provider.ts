import type { IStorageProvider, StorageFile, StorageProviderMeta } from './base.provider';

export class GoogleDriveProvider implements IStorageProvider {
  public readonly meta: StorageProviderMeta = {
    type: 'GDRIVE',
    name: 'Google Drive',
    iconName: 'Cloud',
    description: 'Kết nối trực tiếp tới Google Drive API v3 để quét & phát nhạc',
    configFields: [
      {
        key: 'folderId',
        label: 'Google Drive Folder ID / Link',
        type: 'text',
        placeholder: '1A2b3C4d5E6f...',
        required: true,
      },
      {
        key: 'apiKey',
        label: 'Google API Key (Tùy chọn cho public folder)',
        type: 'password',
        placeholder: 'AIzaSy...',
      },
    ],
  };

  private folderId: string = '';
  private apiKey: string = '';

  public async init(config: Record<string, any>): Promise<boolean> {
    this.folderId = config.folderId || '';
    this.apiKey = config.apiKey || '';
    return true;
  }

  public async validateConfig(config: Record<string, any>): Promise<{ valid: boolean; error?: string }> {
    if (!config.folderId) {
      return { valid: false, error: 'Vui lòng nhập Folder ID Google Drive' };
    }
    return { valid: true };
  }

  public async listFiles(): Promise<StorageFile[]> {
    if (!this.folderId) return [];

    try {
      const query = `'${this.folderId}' in parents and (mimeType contains 'audio/' or name contains '.flac' or name contains '.mp3') and trashed = false`;
      const url = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,size,webContentLink)&key=${this.apiKey}`;
      
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Google Drive API Error: ${res.statusText}`);
      }

      const data = await res.json();
      const files = data.files || [];

      return files.map((file: any) => ({
        id: file.id,
        name: file.name,
        path: file.name,
        size: parseInt(file.size || '0', 10),
        mimeType: file.mimeType || 'audio/flac',
        fileRef: file,
      }));
    } catch (err: any) {
      console.warn('Google Drive list error:', err);
      return [];
    }
  }

  public async readRange(fileRef: any, start: number, end: number): Promise<ArrayBuffer> {
    const fileId = fileRef.id || fileRef;
    const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${this.apiKey}`;
    const res = await fetch(url, {
      headers: {
        Range: `bytes=${start}-${end}`,
      },
    });
    return await res.arrayBuffer();
  }

  public async getStreamUrl(fileRef: any): Promise<string> {
    const fileId = fileRef.id || fileRef;
    return `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&key=${this.apiKey}`;
  }
}
