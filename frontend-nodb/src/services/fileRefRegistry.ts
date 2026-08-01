export class FileRefRegistry {
  private static registry = new Map<string, any>();

  public static set(songId: string, fileRef: any) {
    if (songId && fileRef) {
      this.registry.set(songId, fileRef);
    }
  }

  public static get(songId: string): any {
    return this.registry.get(songId);
  }

  public static clear() {
    this.registry.clear();
  }
}
