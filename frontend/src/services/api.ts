import axios, { AxiosError } from 'axios';
import { API_URL } from '../config/api.js';
import type {
  AuthResponse,
  Company,
  ThemeSettings,
  UpdateCompanySettingsDto,
  UpdateThemeSettingsDto,
  User,
  CreateUserDto,
  UpdateUserDto,
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  Sale,
  CreateSaleDto,
  UpdateSaleDto,
  InventoryItem,
  CreateInventoryItemDto,
  UpdateInventoryItemDto,
  Category,
  CreateCategoryDto,
  UpdateCategoryDto,
  DashboardStats,
  CalculateClpcDto,
  ClpcResult,
  Audit,
  AuditItem,
  AuditItemDto,
  CreateAuditDto,
  UpdateAuditDto,
  AuditSummary,
  GetAuditsResponse,
  Employee,
  Salary,
  Bill,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  CreateSalaryDto,
  UpdateSalaryDto,
  CreateBillDto,
  UpdateBillDto,
  SalarySummary,
  BillSummary,
} from '../types/index.js';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    // Don't intercept admin routes
    if (error.config?.url?.includes('/admin/')) {
      return Promise.reject(error);
    }
    
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/')) {
      try {
        await api.post('/auth/refresh');
        return api.request(error.config!);
      } catch {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  signup: async (data: { name: string; email: string; password: string; userEmail: string; userName: string; address?: string; phone?: string; whatsapp?: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },
  login: async (data: { email: string; password: string }): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/auth/logout');
  },
  refresh: async (): Promise<void> => {
    await api.post('/auth/refresh');
  },
  forgotPassword: async (email: string): Promise<{ email: string; message: string }> => {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },
};

export const companyApi = {
  getCompany: async (): Promise<Company> => {
    const response = await api.get('/company/me');
    return response.data;
  },
  updateSettings: async (data: UpdateCompanySettingsDto): Promise<Company> => {
    const response = await api.patch('/company/settings', data);
    return response.data;
  },
  updateThemeSettings: async (data: UpdateThemeSettingsDto): Promise<ThemeSettings> => {
    const response = await api.patch('/company/theme-settings', data);
    return response.data;
  },
  updatePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const response = await api.patch('/company/password', { currentPassword, newPassword });
    return response.data;
  },
};

export const userApi = {
  getUsers: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },
  createUser: async (data: CreateUserDto): Promise<User> => {
    const response = await api.post('/users', data);
    return response.data;
  },
  updateUser: async (id: string, data: UpdateUserDto): Promise<User> => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },
  deleteUser: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export const customerApi = {
  getCustomers: async (): Promise<Customer[]> => {
    const response = await api.get('/customers');
    return response.data;
  },
  createCustomer: async (data: CreateCustomerDto): Promise<Customer> => {
    const response = await api.post('/customers', data);
    return response.data;
  },
  updateCustomer: async (id: string, data: UpdateCustomerDto): Promise<Customer> => {
    const response = await api.patch(`/customers/${id}`, data);
    return response.data;
  },
  deleteCustomer: async (id: string): Promise<void> => {
    await api.delete(`/customers/${id}`);
  },
};

export const saleApi = {
  getSales: async (): Promise<Sale[]> => {
    const response = await api.get('/sales');
    return response.data;
  },
  createSale: async (data: CreateSaleDto): Promise<Sale> => {
    const response = await api.post('/sales', data);
    return response.data;
  },
  updateSale: async (id: string, data: UpdateSaleDto): Promise<Sale> => {
    const response = await api.patch(`/sales/${id}`, data);
    return response.data;
  },
  deleteSale: async (id: string): Promise<void> => {
    await api.delete(`/sales/${id}`);
  },
};

export const inventoryApi = {
  getInventoryItems: async (categoryId?: string): Promise<InventoryItem[]> => {
    const response = await api.get('/inventory', { params: { category: categoryId } });
    return response.data;
  },
  getInventorySummary: async (): Promise<{ totalItems: number; totalStock: number; totalValue: number; items: InventoryItem[] }> => {
    const response = await api.get('/inventory/summary');
    return response.data;
  },
  getTotalInventoryValue: async (): Promise<{ totalValue: number }> => {
    const response = await api.get('/inventory/total-value');
    return response.data;
  },
  createInventoryItem: async (data: CreateInventoryItemDto): Promise<InventoryItem> => {
    const response = await api.post('/inventory', data);
    return response.data;
  },
  updateInventoryItem: async (id: string, data: UpdateInventoryItemDto): Promise<InventoryItem> => {
    const response = await api.patch(`/inventory/${id}`, data);
    return response.data;
  },
  deleteInventoryItem: async (id: string): Promise<void> => {
    await api.delete(`/inventory/${id}`);
  },
};

export const dashboardApi = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get('/dashboard/stats');
    return response.data;
  },
};

export const clpcApi = {
  calculate: async (data: CalculateClpcDto): Promise<ClpcResult> => {
    const response = await api.post('/clpc/calculate', data);
    return response.data;
  },
};

export const auditApi = {
  getInventoryItemsForAudit: async (): Promise<InventoryItem[]> => {
    const response = await api.get('/audits/inventory-items');
    return response.data;
  },
  getAudits: async (params?: { startDate?: string; endDate?: string; period?: 'week' | 'month' | 'year' | 'all' }): Promise<GetAuditsResponse> => {
    const response = await api.get('/audits', { params });
    return response.data;
  },
  getAudit: async (id: string): Promise<Audit> => {
    const response = await api.get(`/audits/${id}`);
    return response.data;
  },
  createAudit: async (data: CreateAuditDto): Promise<Audit> => {
    const response = await api.post('/audits', data);
    return response.data;
  },
  updateAudit: async (id: string, data: UpdateAuditDto): Promise<Audit> => {
    const response = await api.patch(`/audits/${id}`, data);
    return response.data;
  },
  deleteAudit: async (id: string): Promise<void> => {
    await api.delete(`/audits/${id}`);
  },
};

export const categoryApi = {
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },
  getCategory: async (id: string): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },
  createCategory: async (data: CreateCategoryDto): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },
  updateCategory: async (id: string, data: UpdateCategoryDto): Promise<Category> => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

export const adminApi = {
  login: async (data: { email: string; password: string }): Promise<{ email: string; isAdmin: boolean }> => {
    const response = await api.post('/admin/login', data);
    return response.data;
  },
  logout: async (): Promise<void> => {
    await api.post('/admin/logout');
  },
  getCompanies: async (): Promise<any[]> => {
    const response = await api.get('/admin/companies');
    return response.data;
  },
  getCompanyDetails: async (id: string): Promise<any> => {
    const response = await api.get(`/admin/companies/${id}`);
    return response.data;
  },
  getCustomers: async (): Promise<any[]> => {
    const response = await api.get('/admin/customers');
    return response.data;
  },
  getCustomerDetails: async (id: string): Promise<any> => {
    const response = await api.get(`/admin/customers/${id}`);
    return response.data;
  },
  updateCompany: async (id: string, data: {
    name?: string;
    email?: string;
    address?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    isActive?: boolean;
    ecommerceEnabled?: boolean;
    password?: string;
  }): Promise<any> => {
    const response = await api.put(`/admin/companies/${id}`, data);
    return response.data;
  },
  deleteCompany: async (id: string): Promise<void> => {
    await api.delete(`/admin/companies/${id}`);
  },
  updateCustomer: async (id: string, data: {
    name?: string;
    phone?: string;
    address?: string;
  }): Promise<any> => {
    const response = await api.put(`/admin/customers/${id}`, data);
    return response.data;
  },
  deleteCustomer: async (id: string): Promise<void> => {
    await api.delete(`/admin/customers/${id}`);
  },
};

export const salaryApi = {
  // Employee methods
  getEmployees: async (): Promise<Employee[]> => {
    const response = await api.get('/salary/employees');
    return response.data;
  },
  getEmployee: async (id: string): Promise<Employee> => {
    const response = await api.get(`/salary/employees/${id}`);
    return response.data;
  },
  createEmployee: async (data: CreateEmployeeDto): Promise<Employee> => {
    const response = await api.post('/salary/employees', data);
    return response.data;
  },
  updateEmployee: async (id: string, data: UpdateEmployeeDto): Promise<Employee> => {
    const response = await api.patch(`/salary/employees/${id}`, data);
    return response.data;
  },
  deleteEmployee: async (id: string): Promise<void> => {
    await api.delete(`/salary/employees/${id}`);
  },

  // Salary methods
  getSalaries: async (employeeId?: string): Promise<Salary[]> => {
    const params = employeeId ? { employeeId } : {};
    const response = await api.get('/salary/salaries', { params });
    return response.data;
  },
  getSalary: async (id: string): Promise<Salary> => {
    const response = await api.get(`/salary/salaries/${id}`);
    return response.data;
  },
  createSalary: async (data: CreateSalaryDto): Promise<Salary> => {
    const response = await api.post('/salary/salaries', data);
    return response.data;
  },
  updateSalary: async (id: string, data: UpdateSalaryDto): Promise<Salary> => {
    const response = await api.patch(`/salary/salaries/${id}`, data);
    return response.data;
  },
  deleteSalary: async (id: string): Promise<void> => {
    await api.delete(`/salary/salaries/${id}`);
  },

  // Bill methods
  getBills: async (status?: string): Promise<Bill[]> => {
    const params = status ? { status } : {};
    const response = await api.get('/salary/bills', { params });
    return response.data;
  },
  getBill: async (id: string): Promise<Bill> => {
    const response = await api.get(`/salary/bills/${id}`);
    return response.data;
  },
  createBill: async (data: CreateBillDto): Promise<Bill> => {
    const response = await api.post('/salary/bills', data);
    return response.data;
  },
  updateBill: async (id: string, data: UpdateBillDto): Promise<Bill> => {
    const response = await api.patch(`/salary/bills/${id}`, data);
    return response.data;
  },
  deleteBill: async (id: string): Promise<void> => {
    await api.delete(`/salary/bills/${id}`);
  },

  // Summary methods
  getSalarySummary: async (): Promise<SalarySummary> => {
    const response = await api.get('/salary/summary/salary');
    return response.data;
  },
  getBillSummary: async (): Promise<BillSummary> => {
    const response = await api.get('/salary/summary/bill');
    return response.data;
  },
};

export interface EcommerceProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string; // JSON string or base64
  category: string;
  gender?: string;
  frameType?: string;
  lensType?: string;
  frameSize?: string;
  inStock: boolean;
  stockCount: number;
  featured: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface EcommerceOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  prescriptionNotes?: string;
  isCustomOrder: boolean;
  frameName?: string;
  rightEyeSphere?: string;
  rightEyeCylinder?: string;
  rightEyeAxis?: string;
  leftEyeSphere?: string;
  leftEyeCylinder?: string;
  leftEyeAxis?: string;
  nearAdd?: string;
  status: string;
  totalAmount: number;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  items?: EcommerceOrderItem[];
}

export interface EcommerceOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product?: EcommerceProduct;
}

export interface CreateEcommerceProductDto {
  name: string;
  description?: string;
  price: number;
  images: string; // base64 or JSON string
  category: string;
  gender?: string;
  frameType?: string;
  lensType?: string;
  frameSize?: string;
  inStock?: boolean;
  stockCount?: number;
  featured?: boolean;
}

export interface CreateEcommerceOrderDto {
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  prescriptionNotes?: string;
  isCustomOrder?: boolean;
  frameName?: string;
  rightEyeSphere?: string;
  rightEyeCylinder?: string;
  rightEyeAxis?: string;
  leftEyeSphere?: string;
  leftEyeCylinder?: string;
  leftEyeAxis?: string;
  nearAdd?: string;
  items: {
    productId: string;
    quantity: number;
  }[];
}

export const ecommerceApi = {
  // Products
  getProducts: async (filters?: {
    category?: string;
    gender?: string;
    frameType?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
  }): Promise<EcommerceProduct[]> => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.gender) params.append('gender', filters.gender);
    if (filters?.frameType) params.append('frameType', filters.frameType);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
    const response = await api.get(`/ecommerce/products?${params.toString()}`);
    return response.data;
  },
  getProduct: async (id: string): Promise<EcommerceProduct> => {
    const response = await api.get(`/ecommerce/products/${id}`);
    return response.data;
  },
  createProduct: async (data: CreateEcommerceProductDto): Promise<EcommerceProduct> => {
    const response = await api.post('/ecommerce/products', data);
    return response.data;
  },
  updateProduct: async (id: string, data: Partial<CreateEcommerceProductDto>): Promise<EcommerceProduct> => {
    const response = await api.patch(`/ecommerce/products/${id}`, data);
    return response.data;
  },
  deleteProduct: async (id: string): Promise<void> => {
    await api.delete(`/ecommerce/products/${id}`);
  },
  // Orders
  getOrders: async (): Promise<EcommerceOrder[]> => {
    const response = await api.get('/ecommerce/orders');
    return response.data;
  },
  getOrder: async (id: string): Promise<EcommerceOrder> => {
    const response = await api.get(`/ecommerce/orders/${id}`);
    return response.data;
  },
  createOrder: async (data: CreateEcommerceOrderDto): Promise<EcommerceOrder> => {
    const response = await api.post('/ecommerce/orders', data);
    return response.data;
  },
  updateOrderStatus: async (id: string, status: string): Promise<EcommerceOrder> => {
    const response = await api.patch(`/ecommerce/orders/${id}/status`, { status });
    return response.data;
  },
};
