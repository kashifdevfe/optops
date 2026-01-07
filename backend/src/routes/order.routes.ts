import { Router } from 'express';
import { orderController } from '../controllers/order.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createOrderSchema, updateOrderStatusSchema } from '../dto/order.dto.js';

const router = Router();

// POST order creation - optional auth (for public ecommerce frontend)
// If auth is present, it will use that companyId, otherwise determine from products
router.post('/', optionalAuth, validate(createOrderSchema), orderController.createOrder);

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrder);
router.patch('/:id/status', validate(updateOrderStatusSchema), orderController.updateOrderStatus);

export default router;


