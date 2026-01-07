import { Router } from 'express';
import { dashboardController } from '../controllers/dashboard.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../middleware/tenant.middleware.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/stats', dashboardController.getStats);

export default router;
