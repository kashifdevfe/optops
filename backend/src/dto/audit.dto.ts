import { z } from 'zod';

export const auditItemSchema = z.object({
  inventoryItemId: z.string().min(1, 'Inventory item ID is required'),
  expectedQuantity: z.number().int().min(0, 'Expected quantity must be non-negative').optional(), // Auto-calculated from current stock
  actualQuantity: z.number().int().min(0, 'Actual quantity must be non-negative'),
  notes: z.string().optional(),
});

export const createAuditSchema = z.object({
  auditDate: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  period: z.enum(['week', 'month', 'year']).optional(), // Deprecated, kept for backward compatibility
  notes: z.string().optional(),
  includeExpenses: z.boolean().default(false), // Whether to include bills and salaries
  items: z.array(auditItemSchema).min(1, 'At least one item is required'),
});

export const updateAuditSchema = z.object({
  auditDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z.enum(['week', 'month', 'year']).optional(),
  notes: z.string().optional(),
  includeExpenses: z.boolean().optional(),
  items: z.array(auditItemSchema).optional(),
});

export const getAuditsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z.enum(['week', 'month', 'year', 'all']).optional(),
});

export type AuditItemDto = z.infer<typeof auditItemSchema>;
export type CreateAuditDto = z.infer<typeof createAuditSchema>;
export type UpdateAuditDto = z.infer<typeof updateAuditSchema>;
export type GetAuditsQueryDto = z.infer<typeof getAuditsQuerySchema>;

