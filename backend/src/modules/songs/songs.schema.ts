import { z } from 'zod';

export const createSongSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  duration: z.number().default(0),
  fileUrl: z.string(),
  relativePath: z.string(),
  coverUrl: z.string().optional(),
  format: z.string().default('FLAC'),
  bitrate: z.string().optional(),
  sampleRate: z.number().optional(),
  bitDepth: z.number().optional(),
  trackNumber: z.number().optional(),
  discNumber: z.number().optional(),
  genre: z.string().optional(),
  sourceId: z.string(),
  artistId: z.string().optional(),
  albumId: z.string().optional(),
});

export const updateSongSchema = createSongSchema.partial();

export type CreateSongDTO = z.infer<typeof createSongSchema>;
export type UpdateSongDTO = z.infer<typeof updateSongSchema>;
