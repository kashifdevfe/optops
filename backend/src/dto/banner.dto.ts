import { z } from 'zod';

export const createBannerSchema = z.object({
    title: z.string().min(1, 'Title is required'),
    subtitle: z.string().optional(),
    imageUrl: z.string().min(1, 'Image is required'),
    linkUrl: z.string().optional(),
    isActive: z.boolean().default(true),
    sortOrder: z.number().int().min(0).default(0),
});

export const updateBannerSchema = createBannerSchema.partial();

export type CreateBannerDto = z.infer<typeof createBannerSchema>;
export type UpdateBannerDto = z.infer<typeof updateBannerSchema>;
