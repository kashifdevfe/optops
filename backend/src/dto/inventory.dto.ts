import { z } from 'zod';

export const createInventoryItemSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  unitPrice: z.number().min(0, 'Unit price must be positive'),
  totalStock: z.number().int().min(0).default(0),
  categoryId: z.string().min(1, 'Category is required'),
});

export const updateInventoryItemSchema = z.object({
  name: z.string().min(1).optional(),
  unitPrice: z.number().min(0).optional(),
  itemCode: z.string().min(1).optional(),
  totalStock: z.number().int().min(0).optional(),
  categoryId: z.string().min(1).optional(),
});

export type CreateInventoryItemDto = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemDto = z.infer<typeof updateInventoryItemSchema>;
