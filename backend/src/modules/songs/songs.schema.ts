import { z } from 'zod';

export const createSongSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  artist: z.string().min(1, 'Artist is required'),
  album: z.string().min(1, 'Album is required'),
  duration: z.number().positive('Duration must be positive'),
  fileUrl: z.string().url('File URL must be valid'),
  coverUrl: z.string().url().optional(),
  format: z.string().default('FLAC'),
  bitrate: z.string().default('24-bit / 96kHz'),
});

export const updateSongSchema = createSongSchema.partial();

export type CreateSongDTO = z.infer<typeof createSongSchema>;
export type UpdateSongDTO = z.infer<typeof updateSongSchema>;
