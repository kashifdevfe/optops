import prisma from '../config/database.js';
import { CreateBannerDto, UpdateBannerDto } from '../dto/banner.dto.js';

export const bannerService = {
    async getBanners(companyId: string) {
        return await prisma.banner.findMany({
            where: { companyId },
            orderBy: { sortOrder: 'asc' },
        });
    },

    async getActiveBanners(companyId: string) {
        return await prisma.banner.findMany({
            where: { companyId, isActive: true },
            orderBy: { sortOrder: 'asc' },
        });
    },

    async getPublicBanners() {
        // Get banners from all ecommerce-enabled companies
        const companiesWithEcommerce = await prisma.company.findMany({
            where: { ecommerceEnabled: true },
            select: { id: true },
        });
        const companyIds = companiesWithEcommerce.map((c: any) => c.id);
        if (companyIds.length === 0) return [];

        return await prisma.banner.findMany({
            where: {
                companyId: { in: companyIds },
                isActive: true,
            },
            orderBy: { sortOrder: 'asc' },
        });
    },

    async createBanner(companyId: string, data: CreateBannerDto) {
        return await prisma.banner.create({
            data: {
                ...data,
                companyId,
            },
        });
    },

    async updateBanner(companyId: string, bannerId: string, data: UpdateBannerDto) {
        const banner = await prisma.banner.findFirst({
            where: { id: bannerId, companyId },
        });

        if (!banner) {
            throw new Error('Banner not found');
        }

        return await prisma.banner.update({
            where: { id: bannerId },
            data,
        });
    },

    async deleteBanner(companyId: string, bannerId: string) {
        const banner = await prisma.banner.findFirst({
            where: { id: bannerId, companyId },
        });

        if (!banner) {
            throw new Error('Banner not found');
        }

        await prisma.banner.delete({
            where: { id: bannerId },
        });

        return { success: true };
    },
};
