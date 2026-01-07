import { z } from 'zod';

export const updateCompanySettingsSchema = z.object({
  name: z.string().min(1).optional(),
  address: z.string().optional(),
  phone: z.string().optional(),
  whatsapp: z.string().optional(),
  ecommerceEnabled: z.boolean().optional(),
});

export const updateThemeSettingsSchema = z.object({
  primaryColor: z.string().optional(),
  secondaryColor: z.string().optional(),
  backgroundColor: z.string().optional(),
  surfaceColor: z.string().optional(),
  textColor: z.string().optional(),
  fontFamily: z.string().optional(),
  logoUrl: z.string().nullable().optional(),
  uiConfig: z.record(z.any()).optional(),
});

export type UpdateCompanySettingsDto = z.infer<typeof updateCompanySettingsSchema>;
export type UpdateThemeSettingsDto = z.infer<typeof updateThemeSettingsSchema>;
