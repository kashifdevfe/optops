import prisma from '../config/database.js';
import { CreateEmployeeDto, UpdateEmployeeDto, CreateSalaryDto, UpdateSalaryDto, CreateBillDto, UpdateBillDto } from '../dto/salary.dto.js';

export const salaryService = {
  // Employee methods
  async getEmployees(companyId: string) {
    return await prisma.employee.findMany({
      where: { companyId },
      orderBy: { name: 'asc' },
    });
  },

  async getEmployeeById(companyId: string, employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, companyId },
      include: { salaries: { orderBy: [{ year: 'desc' }, { month: 'desc' }] } },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    return employee;
  },

  async createEmployee(companyId: string, data: CreateEmployeeDto) {
    return await prisma.employee.create({
      data: {
        ...data,
        companyId,
      },
    });
  },

  async updateEmployee(companyId: string, employeeId: string, data: UpdateEmployeeDto) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Clean up data - convert empty strings to null
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.position !== undefined) updateData.position = data.position || null;
    if (data.phone !== undefined) updateData.phone = data.phone || null;
    if (data.email !== undefined) updateData.email = data.email || null;
    if (data.address !== undefined) updateData.address = data.address || null;
    if (data.salary !== undefined) updateData.salary = data.salary;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    return await prisma.employee.update({
      where: { id: employeeId },
      data: updateData,
    });
  },

  async deleteEmployee(companyId: string, employeeId: string) {
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, companyId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    await prisma.employee.delete({
      where: { id: employeeId },
    });

    return { success: true };
  },

  // Salary methods
  async getSalaries(companyId: string, employeeId?: string) {
    const where: any = { companyId };
    if (employeeId) {
      where.employeeId = employeeId;
    }

    return await prisma.salary.findMany({
      where,
      include: { employee: true },
      orderBy: [{ year: 'desc' }, { month: 'desc' }],
    });
  },

  async getSalaryById(companyId: string, salaryId: string) {
    const salary = await prisma.salary.findFirst({
      where: { id: salaryId, companyId },
      include: { employee: true },
    });

    if (!salary) {
      throw new Error('Salary not found');
    }

    return salary;
  },

  async createSalary(companyId: string, data: CreateSalaryDto) {
    // Check if employee exists
    const employee = await prisma.employee.findFirst({
      where: { id: data.employeeId, companyId },
    });

    if (!employee) {
      throw new Error('Employee not found');
    }

    // Check if salary for this month/year already exists
    const existing = await prisma.salary.findFirst({
      where: {
        employeeId: data.employeeId,
        month: data.month,
        year: data.year,
        companyId,
      },
    });

    if (existing) {
      throw new Error('Salary for this month and year already exists');
    }

    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : null;

    return await prisma.salary.create({
      data: {
        ...data,
        paymentDate,
        companyId,
      },
      include: { employee: true },
    });
  },

  async updateSalary(companyId: string, salaryId: string, data: UpdateSalaryDto) {
    const salary = await prisma.salary.findFirst({
      where: { id: salaryId, companyId },
    });

    if (!salary) {
      throw new Error('Salary not found');
    }

    // Clean up data - only include defined fields
    const updateData: any = {};
    if (data.employeeId !== undefined) updateData.employeeId = data.employeeId;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.month !== undefined) updateData.month = data.month;
    if (data.year !== undefined) updateData.year = data.year;
    if (data.paymentDate !== undefined) {
      updateData.paymentDate = data.paymentDate ? new Date(data.paymentDate) : null;
    }
    if (data.status !== undefined) updateData.status = data.status;
    if (data.notes !== undefined) updateData.notes = data.notes || null;

    // If month/year/employeeId is being updated, check for duplicates
    if (data.employeeId !== undefined || data.month !== undefined || data.year !== undefined) {
      const employeeId = data.employeeId !== undefined ? data.employeeId : salary.employeeId;
      const month = data.month !== undefined ? data.month : salary.month;
      const year = data.year !== undefined ? data.year : salary.year;

      const existing = await prisma.salary.findFirst({
        where: {
          employeeId,
          month,
          year,
          companyId,
          NOT: { id: salaryId },
        },
      });

      if (existing) {
        throw new Error('Salary for this month and year already exists for this employee');
      }
    }

    return await prisma.salary.update({
      where: { id: salaryId },
      data: updateData,
      include: { employee: true },
    });
  },

  async deleteSalary(companyId: string, salaryId: string) {
    const salary = await prisma.salary.findFirst({
      where: { id: salaryId, companyId },
    });

    if (!salary) {
      throw new Error('Salary not found');
    }

    await prisma.salary.delete({
      where: { id: salaryId },
    });

    return { success: true };
  },

  // Bill methods
  async getBills(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) {
      where.status = status;
    }

    return await prisma.bill.findMany({
      where,
      orderBy: { dueDate: 'asc' },
    });
  },

  async getBillById(companyId: string, billId: string) {
    const bill = await prisma.bill.findFirst({
      where: { id: billId, companyId },
    });

    if (!bill) {
      throw new Error('Bill not found');
    }

    return bill;
  },

  async createBill(companyId: string, data: CreateBillDto) {
    const dueDate = new Date(data.dueDate);
    const paymentDate = data.paymentDate ? new Date(data.paymentDate) : null;

    // Auto-set status based on dates
    let status = data.status || 'outstanding';
    if (paymentDate) {
      status = 'paid';
    } else if (dueDate < new Date()) {
      status = 'overdue';
    }

    return await prisma.bill.create({
      data: {
        ...data,
        dueDate,
        paymentDate,
        status,
        companyId,
      },
    });
  },

  async updateBill(companyId: string, billId: string, data: UpdateBillDto) {
    const bill = await prisma.bill.findFirst({
      where: { id: billId, companyId },
    });

    if (!bill) {
      throw new Error('Bill not found');
    }

    // Clean up data - only include defined fields
    const updateData: any = {};
    if (data.description !== undefined) updateData.description = data.description;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.category !== undefined) updateData.category = data.category || null;
    if (data.dueDate !== undefined) {
      updateData.dueDate = new Date(data.dueDate);
    }
    if (data.paymentDate !== undefined) {
      updateData.paymentDate = data.paymentDate ? new Date(data.paymentDate) : null;
    }
    if (data.notes !== undefined) updateData.notes = data.notes || null;

    // Auto-update status based on payment date
    if (updateData.paymentDate !== undefined) {
      if (updateData.paymentDate) {
        updateData.status = 'paid';
      } else {
        const dueDate = updateData.dueDate || bill.dueDate;
        updateData.status = dueDate < new Date() ? 'overdue' : 'outstanding';
      }
    } else if (updateData.dueDate && !updateData.paymentDate && !bill.paymentDate) {
      updateData.status = updateData.dueDate < new Date() ? 'overdue' : 'outstanding';
    } else if (data.status !== undefined) {
      updateData.status = data.status;
    }

    return await prisma.bill.update({
      where: { id: billId },
      data: updateData,
    });
  },

  async deleteBill(companyId: string, billId: string) {
    const bill = await prisma.bill.findFirst({
      where: { id: billId, companyId },
    });

    if (!bill) {
      throw new Error('Bill not found');
    }

    await prisma.bill.delete({
      where: { id: billId },
    });

    return { success: true };
  },

  // Summary methods
  async getSalarySummary(companyId: string) {
    const employees = await prisma.employee.count({ where: { companyId, isActive: true } });
    const salaries = await prisma.salary.findMany({ where: { companyId } });

    const totalPaid = salaries
      .filter((s: any) => s.status === 'paid')
      .reduce((sum: number, s: any) => sum + s.amount, 0);

    const totalPending = salaries
      .filter((s: any) => s.status === 'pending')
      .reduce((sum: number, s: any) => sum + s.amount, 0);

    const totalOverdue = salaries
      .filter((s: any) => s.status === 'overdue')
      .reduce((sum: number, s: any) => sum + s.amount, 0);

    return {
      totalEmployees: employees,
      totalPaid,
      totalPending,
      totalOverdue,
      totalSalaries: salaries.length,
    };
  },

  async getBillSummary(companyId: string) {
    const bills = await prisma.bill.findMany({ where: { companyId } });

    const totalOutstanding = bills
      .filter((b: any) => b.status === 'outstanding')
      .reduce((sum: number, b: any) => sum + b.amount, 0);

    const totalPaid = bills
      .filter((b: any) => b.status === 'paid')
      .reduce((sum: number, b: any) => sum + b.amount, 0);

    const totalOverdue = bills
      .filter((b: any) => b.status === 'overdue')
      .reduce((sum: number, b: any) => sum + b.amount, 0);

    return {
      totalBills: bills.length,
      totalOutstanding,
      totalPaid,
      totalOverdue,
    };
  },
};

