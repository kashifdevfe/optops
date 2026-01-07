import { z } from 'zod';

export const createOrderSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string().min(1, 'Customer phone is required'),
  customerAddress: z.string().min(1, 'Customer address is required'),
  prescriptionNotes: z.string().optional(),
  // Custom order fields
  isCustomOrder: z.boolean().optional().default(false),
  frameName: z.string().optional(),
  rightEyeSphere: z.string().optional(),
  rightEyeCylinder: z.string().optional(),
  rightEyeAxis: z.string().optional(),
  leftEyeSphere: z.string().optional(),
  leftEyeCylinder: z.string().optional(),
  leftEyeAxis: z.string().optional(),
  nearAdd: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
    })
  ).min(1, 'At least one item is required'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['pending', 'confirmed', 'ready', 'completed']),
});

export type CreateOrderDto = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusDto = z.infer<typeof updateOrderStatusSchema>;


