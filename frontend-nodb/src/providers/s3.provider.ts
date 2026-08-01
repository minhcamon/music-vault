import type { IStorageProvider, StorageFile, StorageProviderMeta } from './base.provider';

export class S3StorageProvider implements IStorageProvider {
  public readonly meta: StorageProviderMeta = {
    type: 'S3',
    name: 'AWS S3 / Cloudflare R2 / MinIO',
    iconName: 'Database',
    description: 'Kết nối trực tiếp tới S3 Bucket hoặc Cloudflare R2 công khai / Presigned',
    configFields: [
      {
        key: 'endpoint',
        label: 'Bucket Endpoint URL',
        type: 'text',
        placeholder: 'https://my-bucket.r2.cloudflarestorage.com',
        required: true,
      },
      {
        key: 'bucketName',
        label: 'Tên Bucket',
        type: 'text',
        placeholder: 'my-music-vault',
        required: true,
      },
    ],
  };

  private endpoint: string = '';
  private bucketName: string = '';

  public async init(config: Record<string, any>): Promise<boolean> {
    this.endpoint = config.endpoint || '';
    this.bucketName = config.bucketName || '';
    return true;
  }

  public async validateConfig(config: Record<string, any>): Promise<{ valid: boolean; error?: string }> {
    if (!config.endpoint || !config.bucketName) {
      return { valid: false, error: 'Vui lòng nhập đầy đủ Endpoint URL và tên Bucket' };
    }
    return { valid: true };
  }

  public async listFiles(): Promise<StorageFile[]> {
    if (!this.endpoint) return [];

    try {
      // Fetching XML manifest or JSON manifest if available
      const manifestUrl = `${this.endpoint.replace(/\/$/, '')}/manifest.json?bucket=${encodeURIComponent(this.bucketName)}`;
      const res = await fetch(manifestUrl);
      if (res.ok) {
        const files = await res.json();
        return files.map((file: any) => ({
          id: file.key || file.name,
          name: file.name || file.key,
          path: file.key || file.name,
          size: file.size || 0,
          mimeType: file.mimeType || 'audio/flac',
          fileRef: file,
        }));
      }
    } catch (e) {
      console.warn('S3 list manifest fallback error:', e);
    }
    return [];
  }

  public async readRange(fileRef: any, start: number, end: number): Promise<ArrayBuffer> {
    const key = fileRef.key || fileRef.name || fileRef;
    const fileUrl = `${this.endpoint.replace(/\/$/, '')}/${key}`;
    const res = await fetch(fileUrl, {
      headers: {
        Range: `bytes=${start}-${end}`,
      },
    });
    return await res.arrayBuffer();
  }

  public async getStreamUrl(fileRef: any): Promise<string> {
    const key = fileRef.key || fileRef.name || fileRef;
    return `${this.endpoint.replace(/\/$/, '')}/${key}`;
  }
}
