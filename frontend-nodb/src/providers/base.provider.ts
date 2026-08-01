import type { SourceType } from '../types';

export interface ProviderFormField {
  key: string;
  label: string;
  type: 'text' | 'password' | 'select' | 'folder_picker';
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  options?: { label: string; value: string }[];
}

export interface StorageProviderMeta {
  type: SourceType;
  name: string;
  iconName: string;
  description: string;
  configFields: ProviderFormField[];
}

export interface StorageFile {
  id: string;          // relative path or file ID
  name: string;
  path: string;
  size: number;
  mimeType: string;
  fileRef?: any;       // FileSystemFileHandle, File, or Cloud File Metadata
  folderCoverBlobUrl?: string; // Cover image (cover.png/jpg) found in the same folder
}

export interface IStorageProvider {
  readonly meta: StorageProviderMeta;

  // Initialize with source config
  init(config: Record<string, any>): Promise<boolean>;

  // Validate configuration input before saving
  validateConfig(config: Record<string, any>): Promise<{ valid: boolean; error?: string }>;

  // List all audio files from source
  listFiles(): Promise<StorageFile[]>;

  // Read range bytes for ID3 / Vorbis metadata parsing
  readRange(fileRef: any, start: number, end: number): Promise<ArrayBuffer>;

  // Get stream URL or Blob URL for audio player
  getStreamUrl(fileRef: any): Promise<string>;
}
