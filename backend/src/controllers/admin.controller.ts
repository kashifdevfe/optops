import { Response } from 'express';
import { adminService } from '../services/admin.service.js';
import { AuthenticatedRequest } from '../types/index.js';

export const adminController = {
  async login(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
      }

      const result = await adminService.login(email, password);

      if (!req.session) {
        console.error('Session not initialized!');
        res.status(500).json({ error: 'Session not initialized' });
        return;
      }

      req.session.adminEmail = result.email;
      req.session.isAdmin = true;

      // Save session and then respond
      req.session.save((err) => {
        if (err) {
          console.error('Session save error:', err);
          res.status(500).json({ error: 'Failed to save session' });
          return;
        }
        res.json(result);
      });
    } catch (error: any) {
      console.error('Login error:', error.message);
      res.status(401).json({ error: error.message });
    }
  },

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (req.session) {
        req.session.adminEmail = undefined;
        req.session.isAdmin = undefined;
        req.session.destroy((err) => {
          if (err) {
            console.error('Session destroy error:', err);
            res.status(500).json({ error: 'Failed to destroy session' });
            return;
          }
          res.json({ message: 'Logged out successfully' });
        });
      } else {
        res.json({ message: 'Logged out successfully' });
      }
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllCompanies(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const companies = await adminService.getAllCompanies();
      res.json(companies);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCompanyDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const company = await adminService.getCompanyDetails(id);
      if (!company) {
        res.status(404).json({ error: 'Company not found' });
        return;
      }
      res.json(company);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getAllCustomers(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const customers = await adminService.getAllCustomers();
      res.json(customers);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getCustomerDetails(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const customer = await adminService.getCustomerDetails(id);
      if (!customer) {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }
      res.json(customer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async updateCompany(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const company = await adminService.updateCompany(id, updateData);
      res.json(company);
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Company not found' });
        return;
      }
      if (error.code === 'P2002') {
        res.status(400).json({ error: 'Email already exists' });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  },

  async deleteCompany(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await adminService.deleteCompany(id);
      res.json({ message: 'Company deleted successfully' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Company not found' });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  },

  async updateCustomer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const customer = await adminService.updateCustomer(id, updateData);
      res.json(customer);
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  },

  async deleteCustomer(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await adminService.deleteCustomer(id);
      res.json({ message: 'Customer deleted successfully' });
    } catch (error: any) {
      if (error.code === 'P2025') {
        res.status(404).json({ error: 'Customer not found' });
        return;
      }
      res.status(500).json({ error: error.message });
    }
  },
};

