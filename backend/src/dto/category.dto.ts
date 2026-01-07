import { z } from 'zod';

// Helper to transform empty string to undefined
const typeSchema = z.preprocess(
  (val) => (val === '' ? undefined : val),
  z.enum(['Frame', 'Lens']).optional()
);

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  type: typeSchema,
});

export const updateCategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  type: typeSchema,
});

export type CreateCategoryDto = z.infer<typeof createCategorySchema>;
export type UpdateCategoryDto = z.infer<typeof updateCategorySchema>;

