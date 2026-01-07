import { Router } from 'express';
import { auditController } from '../controllers/audit.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { validateRequest } from '../middleware/validation.middleware.js';

const router = Router();

router.use(authenticate);

router.get('/inventory-items', auditController.getInventoryItemsForAudit.bind(auditController));
router.get('/', auditController.getAudits.bind(auditController));
router.get('/:id', auditController.getAudit.bind(auditController));
router.post('/', auditController.createAudit.bind(auditController));
router.patch('/:id', auditController.updateAudit.bind(auditController));
router.delete('/:id', auditController.deleteAudit.bind(auditController));

export default router;

