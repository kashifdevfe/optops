import { Response } from 'express';
import { bannerService } from '../services/banner.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export const bannerController = {
    async getBanners(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.companyId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const banners = await bannerService.getBanners(req.companyId);
            res.json(banners);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async getPublicBanners(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            // If authenticated, get banners for company; otherwise get all public banners
            if (req.companyId) {
                const banners = await bannerService.getActiveBanners(req.companyId);
                res.json(banners);
            } else {
                const banners = await bannerService.getPublicBanners();
                res.json(banners);
            }
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    async createBanner(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.companyId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const banner = await bannerService.createBanner(req.companyId, req.body);
            res.status(201).json(banner);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async updateBanner(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.companyId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const banner = await bannerService.updateBanner(req.companyId, req.params.id, req.body);
            res.json(banner);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    async deleteBanner(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            if (!req.companyId) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            await bannerService.deleteBanner(req.companyId, req.params.id);
            res.json({ success: true });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },
};
