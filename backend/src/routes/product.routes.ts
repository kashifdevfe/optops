import { Router } from 'express';
import { productController } from '../controllers/product.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createProductSchema, updateProductSchema, getProductsQuerySchema } from '../dto/product.dto.js';

const router = Router();

// GET routes - authenticate is optional (allows public ecommerce frontend)
// If auth token is present, it will filter by companyId
router.get('/', optionalAuth, validate(getProductsQuerySchema, 'query'), productController.getProducts);
router.get('/:id', optionalAuth, productController.getProduct);

router.use(authenticate);
router.use(enforceTenantIsolation);

router.post('/', validate(createProductSchema), productController.createProduct);
router.patch('/:id', validate(updateProductSchema), productController.updateProduct);
router.delete('/:id', productController.deleteProduct);

export default router;


