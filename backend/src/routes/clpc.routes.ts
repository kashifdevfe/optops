import { Router } from 'express';
import { clpcController } from '../controllers/clpc.controller.js';
import { validate } from '../middleware/validation.middleware.js';
import { calculateClpcSchema } from '../dto/clpc.dto.js';

const router = Router();

router.post('/calculate', validate(calculateClpcSchema), clpcController.calculate);

export default router;
