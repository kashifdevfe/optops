import { z } from 'zod';

export const calculateClpcSchema = z.object({
  backVertexDistance: z.number().min(0).optional().default(12),
  rightEyeSphere: z.number(),
  rightEyeCylinder: z.number(),
  rightEyeAxis: z.number(),
  leftEyeSphere: z.number(),
  leftEyeCylinder: z.number(),
  leftEyeAxis: z.number(),
});

export type CalculateClpcDto = z.infer<typeof calculateClpcSchema>;
