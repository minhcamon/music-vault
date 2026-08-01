import { ProviderRegistry } from './registry';
import { LocalStorageProvider } from './local.provider';
import { GoogleDriveProvider } from './gdrive.provider';
import { S3StorageProvider } from './s3.provider';

// Register built-in providers
ProviderRegistry.register('LOCAL', () => new LocalStorageProvider());
ProviderRegistry.register('GDRIVE', () => new GoogleDriveProvider());
ProviderRegistry.register('S3', () => new S3StorageProvider());

export * from './base.provider';
export * from './registry';
export * from './local.provider';
export * from './gdrive.provider';
export * from './s3.provider';
