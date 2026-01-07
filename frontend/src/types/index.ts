export interface Company {
  id: string;
  name: string;
  email: string;
  address?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  isActive: boolean;
  ecommerceEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
  themeSettings?: ThemeSettings;
}

export interface ThemeSettings {
  id: string;
  companyId: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  fontFamily: string;
  logoUrl: string | null;
  uiConfig: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  company: Company;
  user: User;
  themeSettings?: ThemeSettings;
}

export interface UpdateCompanySettingsDto {
  name?: string;
  address?: string;
  phone?: string;
  whatsapp?: string;
  ecommerceEnabled?: boolean;
}

export interface UpdateThemeSettingsDto {
  primaryColor?: string;
  secondaryColor?: string;
  backgroundColor?: string;
  surfaceColor?: string;
  textColor?: string;
  fontFamily?: string;
  logoUrl?: string | null;
  uiConfig?: Record<string, any>;
}

export interface CreateUserDto {
  email: string;
  name: string;
  password: string;
  role?: 'user' | 'admin';
}

export interface UpdateUserDto {
  email?: string;
  name?: string;
  password?: string;
  role?: 'user' | 'admin';
  isActive?: boolean;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  orderNo: string;
  customerId: string;
  customer?: Customer;
  rightEyeSphere: string;
  rightEyeCylinder: string;
  rightEyeAxis: string;
  leftEyeSphere: string;
  leftEyeCylinder: string;
  leftEyeAxis: string;
  nearAdd: string;
  total: number;
  received: number;
  remaining: number;
  frame: string;
  lens: string;
  entryDate: string | null;
  deliveryDate: string | null;
  status: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type?: 'Frame' | 'Lens' | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
}

export interface InventoryItem {
  id: string;
  name: string;
  unitPrice: number; // Cost price (purchase price)
  itemCode: string;
  totalStock: number;
  categoryId: string;
  category: Category;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalCustomers: number;
  totalSales: number;
  totalInventoryItems: number;
  todayOrders: number;
  monthlySales: Record<string, number>;
  salesByCategory: Record<string, number>;
  topSellingItems: Array<{ name: string; count: number }>;
  salesByStatus: Record<string, number>;
  weeklySales: Record<string, number>;
  monthlyRevenue: Record<string, number>;
  monthlyProfit: Record<string, number>;
  inventoryByCategory: Record<string, number>;
}

export interface CreateCustomerDto {
  name: string;
  phone: string;
  address: string;
}

export interface UpdateCustomerDto {
  name?: string;
  phone?: string;
  address?: string;
}

export interface CreateSaleDto {
  customerId: string;
  rightEyeSphere?: string;
  rightEyeCylinder?: string;
  rightEyeAxis?: string;
  leftEyeSphere?: string;
  leftEyeCylinder?: string;
  leftEyeAxis?: string;
  nearAdd?: string;
  total: number;
  received?: number;
  frame: string;
  lens: string;
  entryDate?: string;
  deliveryDate?: string;
  status?: string;
}

export interface UpdateSaleDto {
  customerId?: string;
  orderNo?: string;
  rightEyeSphere?: string;
  rightEyeCylinder?: string;
  rightEyeAxis?: string;
  leftEyeSphere?: string;
  leftEyeCylinder?: string;
  leftEyeAxis?: string;
  nearAdd?: string;
  total?: number;
  received?: number;
  frame?: string;
  lens?: string;
  entryDate?: string | null;
  deliveryDate?: string | null;
  status?: string;
}

export interface CreateInventoryItemDto {
  name: string;
  unitPrice: number;
  totalStock?: number;
  categoryId: string;
}

export interface UpdateInventoryItemDto {
  name?: string;
  unitPrice?: number;
  itemCode?: string;
  totalStock?: number;
  categoryId?: string;
}

export interface CreateCategoryDto {
  name: string;
  type?: 'Frame' | 'Lens';
}

export interface UpdateCategoryDto {
  name: string;
  type?: 'Frame' | 'Lens';
}

export interface CalculateClpcDto {
  backVertexDistance?: number;
  rightEyeSphere: number;
  rightEyeCylinder: number;
  rightEyeAxis: number;
  leftEyeSphere: number;
  leftEyeCylinder: number;
  leftEyeAxis: number;
}

export interface ClpcResult {
  rightEye: {
    sphere: number;
    cylinder: number;
    axis: number;
  };
  leftEye: {
    sphere: number;
    cylinder: number;
    axis: number;
  };
}

export interface AuditItem {
  id: string;
  auditId: string;
  inventoryItemId: string;
  expectedQuantity: number;
  actualQuantity: number;
  discrepancy: number;
  unitPrice: number;
  totalValue: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  inventoryItem?: InventoryItem;
}

export interface AuditCategoryBreakdown {
  categoryName: string;
  itemsSold: number;
  totalCost: number;
  totalRevenue: number;
  totalProfit: number;
  items: Array<{
    itemName: string;
    quantity: number;
    unitPrice: number;
    totalCost: number;
    totalRevenue: number;
    profit: number;
  }>;
}

export interface Audit {
  id: string;
  auditDate: string;
  startDate: string | null;
  endDate: string | null;
  period: 'week' | 'month' | 'year' | null;
  notes: string | null;
  totalInventoryValue: number;
  totalSalesValue: number;
  grossSales: number;
  costOfGoodsSold: number;
  netProfit: number;
  profitMargin: number;
  includeExpenses: boolean;
  totalExpenses: number;
  finalNetProfit: number;
  categoryBreakdown: string | null; // JSON string
  companyId: string;
  createdAt: string;
  updatedAt: string;
  items: AuditItem[];
}

export interface AuditItemDto {
  inventoryItemId: string;
  expectedQuantity?: number; // Optional - auto-calculated from current stock
  actualQuantity: number;
  notes?: string;
}

export interface CreateAuditDto {
  auditDate?: string;
  startDate: string;
  endDate: string;
  period?: 'week' | 'month' | 'year';
  notes?: string;
  includeExpenses?: boolean;
  items: AuditItemDto[];
}

export interface UpdateAuditDto {
  auditDate?: string;
  startDate?: string;
  endDate?: string;
  period?: 'week' | 'month' | 'year';
  notes?: string;
  includeExpenses?: boolean;
  items?: AuditItemDto[];
}

export interface AuditSummary {
  totalAudits: number;
  totalInventoryValue: number;
  totalSalesValue: number;
  totalGrossSales: number;
  totalCOGS: number;
  totalNetProfit: number;
  avgProfitMargin: number;
  totalDiscrepancies: number;
}

export interface GetAuditsResponse {
  audits: Audit[];
  summary: AuditSummary;
}

export interface Employee {
  id: string;
  name: string;
  position: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  salary: number;
  isActive: boolean;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  salaries?: Salary[];
}

export interface Salary {
  id: string;
  employeeId: string;
  employee?: Employee;
  amount: number;
  month: number;
  year: number;
  paymentDate: string | null;
  status: 'pending' | 'paid' | 'overdue';
  notes: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Bill {
  id: string;
  description: string;
  amount: number;
  category: string | null;
  dueDate: string;
  paymentDate: string | null;
  status: 'outstanding' | 'paid' | 'overdue';
  notes: string | null;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeDto {
  name: string;
  position?: string;
  phone?: string;
  email?: string;
  address?: string;
  salary?: number;
  isActive?: boolean;
}

export interface UpdateEmployeeDto {
  name?: string;
  position?: string;
  phone?: string;
  email?: string;
  address?: string;
  salary?: number;
  isActive?: boolean;
}

export interface CreateSalaryDto {
  employeeId: string;
  amount: number;
  month: number;
  year: number;
  paymentDate?: string;
  status?: 'pending' | 'paid' | 'overdue';
  notes?: string;
}

export interface UpdateSalaryDto {
  employeeId?: string;
  amount?: number;
  month?: number;
  year?: number;
  paymentDate?: string;
  status?: 'pending' | 'paid' | 'overdue';
  notes?: string;
}

export interface CreateBillDto {
  description: string;
  amount: number;
  category?: string;
  dueDate: string;
  paymentDate?: string;
  status?: 'outstanding' | 'paid' | 'overdue';
  notes?: string;
}

export interface UpdateBillDto {
  description?: string;
  amount?: number;
  category?: string;
  dueDate?: string;
  paymentDate?: string;
  status?: 'outstanding' | 'paid' | 'overdue';
  notes?: string;
}

export interface SalarySummary {
  totalEmployees: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalSalaries: number;
}

export interface BillSummary {
  totalBills: number;
  totalOutstanding: number;
  totalPaid: number;
  totalOverdue: number;
}
