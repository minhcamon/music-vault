import { z } from 'zod';

export const createSourceSchema = z.object({
  name: z.string().min(1, 'Source name is required'),
  path: z.string().min(1, 'Source folder path is required'),
});

export const updateSourceSchema = z.object({
  name: z.string().min(1).optional(),
  enabled: z.boolean().optional(),
});

export type CreateSourceDTO = z.infer<typeof createSourceSchema>;
export type UpdateSourceDTO = z.infer<typeof updateSourceSchema>;
