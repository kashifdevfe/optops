import { Router } from 'express';
import { categoryController } from '../controllers/category.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createCategorySchema, updateCategorySchema } from '../dto/category.dto.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategory);
router.post('/', validate(createCategorySchema), categoryController.createCategory);
router.patch('/:id', validate(updateCategorySchema), categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

export default router;

