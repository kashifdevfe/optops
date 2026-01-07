import { Router } from 'express';
import { userController } from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import { createUserSchema, updateUserSchema } from '../dto/user.dto.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

router.get('/', userController.getUsers);
router.post('/', validate(createUserSchema), userController.createUser);
router.patch('/:id', validate(updateUserSchema), userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;
