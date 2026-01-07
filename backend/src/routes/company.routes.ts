import { Router } from 'express';
import { companyController } from '../controllers/company.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { updateCompanySettingsSchema, updateThemeSettingsSchema } from '../dto/company.dto.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/me', companyController.getCompany);
router.patch('/settings', validate(updateCompanySettingsSchema), companyController.updateSettings);
router.patch('/theme-settings', validate(updateThemeSettingsSchema), companyController.updateThemeSettings);
router.patch('/password', companyController.updatePassword);

export default router;
