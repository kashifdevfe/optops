import { z } from 'zod';

export const createSaleSchema = z.object({
  customerId: z.string().min(1, 'Customer ID is required'),
  rightEyeSphere: z.string().default('0'),
  rightEyeCylinder: z.string().default('0'),
  rightEyeAxis: z.string().default('0'),
  leftEyeSphere: z.string().default('0'),
  leftEyeCylinder: z.string().default('0'),
  leftEyeAxis: z.string().default('0'),
  nearAdd: z.string().default('0'),
  total: z.number().min(0, 'Total must be positive'),
  received: z.number().min(0).default(0),
  frame: z.string().min(1, 'Frame is required'),
  lens: z.string().min(1, 'Lens is required'),
  entryDate: z.string().optional(),
  deliveryDate: z.string().optional(),
  status: z.string().default('pending'),
});

export const updateSaleSchema = z.object({
  customerId: z.string().min(1).optional(),
  orderNo: z.string().min(1).optional(),
  rightEyeSphere: z.string().optional(),
  rightEyeCylinder: z.string().optional(),
  rightEyeAxis: z.string().optional(),
  leftEyeSphere: z.string().optional(),
  leftEyeCylinder: z.string().optional(),
  leftEyeAxis: z.string().optional(),
  nearAdd: z.string().optional(),
  total: z.number().min(0).optional(),
  received: z.number().min(0).optional(),
  frame: z.string().optional(),
  lens: z.string().optional(),
  entryDate: z.string().nullable().optional(),
  deliveryDate: z.string().nullable().optional(),
  status: z.string().optional(),
});

export type CreateSaleDto = z.infer<typeof createSaleSchema>;
export type UpdateSaleDto = z.infer<typeof updateSaleSchema>;
