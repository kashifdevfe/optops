import { Router } from 'express';
import { salaryController } from '../controllers/salary.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { enforceTenantIsolation } from '../middleware/tenant.middleware.js';
import { validate } from '../middleware/validation.middleware.js';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  createSalarySchema,
  updateSalarySchema,
  createBillSchema,
  updateBillSchema,
} from '../dto/salary.dto.js';

const router = Router();

router.use(authenticate);
router.use(enforceTenantIsolation);

// Employee routes
router.get('/employees', salaryController.getEmployees);
router.get('/employees/:id', salaryController.getEmployeeById);
router.post('/employees', validate(createEmployeeSchema), salaryController.createEmployee);
router.patch('/employees/:id', validate(updateEmployeeSchema), salaryController.updateEmployee);
router.delete('/employees/:id', salaryController.deleteEmployee);

// Salary routes
router.get('/salaries', salaryController.getSalaries);
router.get('/salaries/:id', salaryController.getSalaryById);
router.post('/salaries', validate(createSalarySchema), salaryController.createSalary);
router.patch('/salaries/:id', validate(updateSalarySchema), salaryController.updateSalary);
router.delete('/salaries/:id', salaryController.deleteSalary);

// Bill routes
router.get('/bills', salaryController.getBills);
router.get('/bills/:id', salaryController.getBillById);
router.post('/bills', validate(createBillSchema), salaryController.createBill);
router.patch('/bills/:id', validate(updateBillSchema), salaryController.updateBill);
router.delete('/bills/:id', salaryController.deleteBill);

// Summary routes
router.get('/summary/salary', salaryController.getSalarySummary);
router.get('/summary/bill', salaryController.getBillSummary);

export default router;

