import { Router } from 'express';
import { saleController } from '../controllers/sale.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createSaleSchema, updateSaleSchema } from '../dto/sale.dto.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/', saleController.getSales);
router.post('/', validate(createSaleSchema), saleController.createSale);
router.patch('/:id', validate(updateSaleSchema), saleController.updateSale);
router.delete('/:id', saleController.deleteSale);

export default router;
