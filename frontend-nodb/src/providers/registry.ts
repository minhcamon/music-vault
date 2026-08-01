import type { IStorageProvider, StorageProviderMeta } from './base.provider';
import type { SourceType } from '../types';

type ProviderFactory = () => IStorageProvider;

export class ProviderRegistry {
  private static providers = new Map<SourceType, ProviderFactory>();

  public static register(type: SourceType, factory: ProviderFactory) {
    this.providers.set(type, factory);
  }

  public static getProvider(type: SourceType): IStorageProvider | undefined {
    const factory = this.providers.get(type);
    return factory ? factory() : undefined;
  }

  public static getAllMetas(): StorageProviderMeta[] {
    return Array.from(this.providers.values()).map(factory => factory().meta);
  }
}
