import { z } from 'zod';

export const createEmployeeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  position: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  salary: z.number().min(0, 'Salary must be positive').default(0),
  isActive: z.boolean().default(true),
});

export const updateEmployeeSchema = z.object({
  name: z.string().min(1).optional(),
  position: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  salary: z.number().min(0).optional(),
  isActive: z.boolean().optional(),
});

export const createSalarySchema = z.object({
  employeeId: z.string().min(1, 'Employee is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  month: z.number().int().min(1).max(12, 'Month must be between 1 and 12'),
  year: z.number().int().min(2000).max(2100),
  paymentDate: z.string().optional(),
  status: z.enum(['pending', 'paid', 'overdue']).default('pending'),
  notes: z.string().optional(),
});

export const updateSalarySchema = z.object({
  employeeId: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  month: z.number().int().min(1).max(12).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  paymentDate: z.string().optional(),
  status: z.enum(['pending', 'paid', 'overdue']).optional(),
  notes: z.string().optional(),
});

export const createBillSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  category: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  paymentDate: z.string().optional(),
  status: z.enum(['outstanding', 'paid', 'overdue']).default('outstanding'),
  notes: z.string().optional(),
});

export const updateBillSchema = z.object({
  description: z.string().min(1).optional(),
  amount: z.number().min(0).optional(),
  category: z.string().optional(),
  dueDate: z.string().optional(),
  paymentDate: z.string().optional(),
  status: z.enum(['outstanding', 'paid', 'overdue']).optional(),
  notes: z.string().optional(),
});

export type CreateEmployeeDto = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeDto = z.infer<typeof updateEmployeeSchema>;
export type CreateSalaryDto = z.infer<typeof createSalarySchema>;
export type UpdateSalaryDto = z.infer<typeof updateSalarySchema>;
export type CreateBillDto = z.infer<typeof createBillSchema>;
export type UpdateBillDto = z.infer<typeof updateBillSchema>;

