import { Router } from 'express';
import authRoutes from './auth.routes.js';
import companyRoutes from './company.routes.js';
import userRoutes from './user.routes.js';
import customerRoutes from './customer.routes.js';
import saleRoutes from './sale.routes.js';
import inventoryRoutes from './inventory.routes.js';
import categoryRoutes from './category.routes.js';
import dashboardRoutes from './dashboard.routes.js';
import clpcRoutes from './clpc.routes.js';
import auditRoutes from './audit.routes.js';
import productRoutes from './product.routes.js';
import orderRoutes from './order.routes.js';
import salaryRoutes from './salary.routes.js';
import adminRoutes from './admin.routes.js';

const router = Router();

// Handle OPTIONS for all routes - CORS preflight
router.options('*', (_req, res) => {
  res.status(204).end();
});

router.use('/auth', authRoutes);
router.use('/admin', adminRoutes);
router.use('/company', companyRoutes);
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/sales', saleRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/categories', categoryRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/clpc', clpcRoutes);
router.use('/audits', auditRoutes);
router.use('/ecommerce/products', productRoutes);
router.use('/ecommerce/orders', orderRoutes);
router.use('/salary', salaryRoutes);

export default router;
