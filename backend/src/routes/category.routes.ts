import { Router } from 'express';
import { categoryController } from '../controllers/category.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../dto/category.dto.js';

const router = Router();

// GET routes - authenticate is optional (allows public ecommerce frontend)
router.get('/', optionalAuth, categoryController.getCategories);
router.get('/:id', optionalAuth, categoryController.getCategory);

// Protected routes - require authentication
router.use(authenticate);
router.use(enforceTenantIsolation);

router.post('/', validate(createCategorySchema), categoryController.createCategory);
router.patch('/:id', validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;

