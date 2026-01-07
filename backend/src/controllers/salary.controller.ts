import { Response } from 'express';
import { AuthenticatedRequest } from '../types/index.js';
import { salaryService } from '../services/salary.service.js';

export const salaryController = {
  // Employee endpoints
  async getEmployees(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const employees = await salaryService.getEmployees(req.companyId);
      res.json(employees);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getEmployeeById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const employee = await salaryService.getEmployeeById(req.companyId, req.params.id);
      res.json(employee);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async createEmployee(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const employee = await salaryService.createEmployee(req.companyId, req.body);
      res.status(201).json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateEmployee(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const employee = await salaryService.updateEmployee(req.companyId, req.params.id, req.body);
      res.json(employee);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteEmployee(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      await salaryService.deleteEmployee(req.companyId, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Salary endpoints
  async getSalaries(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const employeeId = req.query.employeeId as string | undefined;
      const salaries = await salaryService.getSalaries(req.companyId, employeeId);
      res.json(salaries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getSalaryById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const salary = await salaryService.getSalaryById(req.companyId, req.params.id);
      res.json(salary);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async createSalary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const salary = await salaryService.createSalary(req.companyId, req.body);
      res.status(201).json(salary);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateSalary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const salary = await salaryService.updateSalary(req.companyId, req.params.id, req.body);
      res.json(salary);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteSalary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      await salaryService.deleteSalary(req.companyId, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Bill endpoints
  async getBills(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const status = req.query.status as string | undefined;
      const bills = await salaryService.getBills(req.companyId, status);
      res.json(bills);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getBillById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const bill = await salaryService.getBillById(req.companyId, req.params.id);
      res.json(bill);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  },

  async createBill(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const bill = await salaryService.createBill(req.companyId, req.body);
      res.status(201).json(bill);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async updateBill(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const bill = await salaryService.updateBill(req.companyId, req.params.id, req.body);
      res.json(bill);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  async deleteBill(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      await salaryService.deleteBill(req.companyId, req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  },

  // Summary endpoints
  async getSalarySummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const summary = await salaryService.getSalarySummary(req.companyId);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },

  async getBillSummary(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      if (!req.companyId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const summary = await salaryService.getBillSummary(req.companyId);
      res.json(summary);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  },
};

