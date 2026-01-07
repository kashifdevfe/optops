import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createInventoryItemSchema, updateInventoryItemSchema } from '../dto/inventory.dto.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/', inventoryController.getInventoryItems);
router.get('/summary', inventoryController.getInventorySummary);
router.get('/total-value', inventoryController.getTotalInventoryValue);
router.post('/', validate(createInventoryItemSchema), inventoryController.createInventoryItem);
router.patch('/:id', validate(updateInventoryItemSchema), inventoryController.updateInventoryItem);
router.delete('/:id', inventoryController.deleteInventoryItem);

export default router;
