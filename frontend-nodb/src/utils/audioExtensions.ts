export const SUPPORTED_AUDIO_EXTENSIONS = [
  '.flac',
  '.mp3',
  '.wav',
  '.m4a',
  '.aac',
  '.ogg',
  '.opus',
  '.alac',
  '.aiff',
  '.wma',
  '.dsf',
  '.dff',
] as const;

export const SUPPORTED_IMAGE_EXTENSIONS = [
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.bmp',
  '.gif',
] as const;

export function isAudioFile(filename: string): boolean {
  if (!filename) return false;
  const lower = filename.toLowerCase().trim();
  return SUPPORTED_AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

export function isImageFile(filename: string): boolean {
  if (!filename) return false;
  const lower = filename.toLowerCase().trim();
  return SUPPORTED_IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
