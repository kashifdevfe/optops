import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

const router = Router();

// Test endpoint to check session
router.get('/check', requireAdmin, (req, res) => {
  res.json({ message: 'Super Admin session is valid', session: req.session });
});

router.post('/login', adminController.login);
router.post('/logout', adminController.logout);
router.get('/companies', requireAdmin, adminController.getAllCompanies);
router.get('/companies/:id', requireAdmin, adminController.getCompanyDetails);
router.put('/companies/:id', requireAdmin, adminController.updateCompany);
router.delete('/companies/:id', requireAdmin, adminController.deleteCompany);
router.get('/customers', requireAdmin, adminController.getAllCustomers);
router.get('/customers/:id', requireAdmin, adminController.getCustomerDetails);
router.put('/customers/:id', requireAdmin, adminController.updateCustomer);
router.delete('/customers/:id', requireAdmin, adminController.deleteCustomer);

export default router;

