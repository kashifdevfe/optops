import { z } from 'zod';

// Helper to transform empty strings to null
const emptyStringToNull = <T extends z.ZodTypeAny>(schema: T) =>
  z.preprocess((val) => (val === '' ? null : val), schema);

export const createProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: emptyStringToNull(z.string().nullable().optional()),
  price: z.number().min(0, 'Price must be positive'),
  images: z.string().min(1, 'At least one image is required'),
  category: z.enum(['Eyeglasses', 'Sunglasses', 'Contact Lenses', 'Frames']),
  gender: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      if (['Men', 'Women', 'Unisex'].includes(val as string)) return val;
      return null;
    },
    z.enum(['Men', 'Women', 'Unisex']).nullable().optional()
  ),
  frameType: emptyStringToNull(z.string().nullable().optional()),
  lensType: emptyStringToNull(z.string().nullable().optional()),
  frameSize: emptyStringToNull(z.string().nullable().optional()),
  inStock: z.boolean().default(true),
  stockCount: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema.partial();

export const getProductsQuerySchema = z.object({
  category: z.enum(['Eyeglasses', 'Sunglasses', 'Contact Lenses', 'Frames']).optional(),
  gender: z.enum(['Men', 'Women', 'Unisex']).optional(),
  frameType: z.string().optional(),
  minPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  maxPrice: z.string().optional().transform((val) => (val ? parseFloat(val) : undefined)),
  featured: z.string().optional().transform((val) => {
    if (val === undefined || val === null) return undefined;
    return val === 'true' || val === '1';
  }),
});

export type CreateProductDto = z.infer<typeof createProductSchema>;
export type UpdateProductDto = z.infer<typeof updateProductSchema>;
export type GetProductsQueryDto = z.infer<typeof getProductsQuerySchema>;


