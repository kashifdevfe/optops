import { Router } from 'express';
import { bannerController } from '../controllers/banner.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createBannerSchema, updateBannerSchema } from '../dto/banner.dto.js';

const router = Router();

// Public route (for ecommerce frontend)
router.get('/public', optionalAuth, bannerController.getPublicBanners);

// Authenticated routes
router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/', bannerController.getBanners);
router.post('/', validate(createBannerSchema), bannerController.createBanner);
router.patch('/:id', validate(updateBannerSchema), bannerController.updateBanner);
router.delete('/:id', bannerController.deleteBanner);

export default router;
