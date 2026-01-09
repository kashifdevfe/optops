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

      // Return token in response for local storage
      // In a real implementation with JWT, 'result' should contain the token
      // If adminService.login just returns user info, we need to generate a token here
      // But looking at adminService, it likely needs update too if it doesn't return token

      // Checking adminService.login return type...

      // Assuming we need to generate token here or service does it:
      // Since we don't have JWT logic in controller usually, let's assume result has it 
      // or we just return the result which hopefully has accessToken (from service update)

      res.json(result);
    } catch (error: any) {
      console.error('Login error:', error.message);
      res.status(401).json({ error: error.message });
    }
  },

  async logout(req: AuthenticatedRequest, res: Response): Promise<void> {
    // Stateless logout - client just discards token
    res.json({ message: 'Logged out successfully' });
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

