import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Grid,
  MenuItem,
  Chip,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  Paper,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { salaryApi } from '../../services/api.js';
import type {
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
} from '../../types/index.js';
import { formatCurrency } from '../../utils/currency.js';
import { format } from 'date-fns';

export const SalaryPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [salaries, setSalaries] = useState<Salary[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [salarySummary, setSalarySummary] = useState<SalarySummary>({
    totalEmployees: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    totalSalaries: 0,
  });
  const [billSummary, setBillSummary] = useState<BillSummary>({
    totalBills: 0,
    totalOutstanding: 0,
    totalPaid: 0,
    totalOverdue: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Employee dialog state
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [employeeFormData, setEmployeeFormData] = useState<CreateEmployeeDto>({
    name: '',
    position: '',
    phone: '',
    email: '',
    address: '',
    salary: 0,
    isActive: true,
  });

  // Salary dialog state
  const [salaryOpen, setSalaryOpen] = useState(false);
  const [editingSalary, setEditingSalary] = useState<Salary | null>(null);
  const [salaryFormData, setSalaryFormData] = useState<CreateSalaryDto>({
    employeeId: '',
    amount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: 'pending',
  });

  // Bill dialog state
  const [billOpen, setBillOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<Bill | null>(null);
  const [billFormData, setBillFormData] = useState<CreateBillDto>({
    description: '',
    amount: 0,
    category: '',
    dueDate: format(new Date(), 'yyyy-MM-dd'),
    status: 'outstanding',
  });

  useEffect(() => {
    loadData();
  }, [tabValue]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [employeesData, salariesData, billsData, salarySummaryData, billSummaryData] = await Promise.all([
        salaryApi.getEmployees(),
        salaryApi.getSalaries(),
        salaryApi.getBills(),
        salaryApi.getSalarySummary(),
        salaryApi.getBillSummary(),
      ]);
      setEmployees(employeesData);
      setSalaries(salariesData);
      setBills(billsData);
      setSalarySummary(salarySummaryData);
      setBillSummary(billSummaryData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  // Employee handlers
  const handleEmployeeOpen = (employee?: Employee) => {
    if (employee) {
      setEditingEmployee(employee);
      setEmployeeFormData({
        name: employee.name,
        position: employee.position || '',
        phone: employee.phone || '',
        email: employee.email || '',
        address: employee.address || '',
        salary: employee.salary,
        isActive: employee.isActive,
      });
    } else {
      setEditingEmployee(null);
      setEmployeeFormData({
        name: '',
        position: '',
        phone: '',
        email: '',
        address: '',
        salary: 0,
        isActive: true,
      });
    }
    setEmployeeOpen(true);
    setError(null);
    setSuccess(false);
  };

  const handleEmployeeClose = () => {
    setEmployeeOpen(false);
    setEditingEmployee(null);
  };

  const handleEmployeeSubmit = async () => {
    try {
      setError(null);
      setSuccess(false);
      if (editingEmployee) {
        // Clean up form data for update - only send non-empty fields
        const updateData: UpdateEmployeeDto = {};
        if (employeeFormData.name) updateData.name = employeeFormData.name;
        if (employeeFormData.position !== undefined) updateData.position = employeeFormData.position || null;
        if (employeeFormData.phone !== undefined) updateData.phone = employeeFormData.phone || null;
        if (employeeFormData.email !== undefined) updateData.email = employeeFormData.email || null;
        if (employeeFormData.address !== undefined) updateData.address = employeeFormData.address || null;
        if (employeeFormData.salary !== undefined) updateData.salary = employeeFormData.salary;
        if (employeeFormData.isActive !== undefined) updateData.isActive = employeeFormData.isActive;
        await salaryApi.updateEmployee(editingEmployee.id, updateData);
      } else {
        await salaryApi.createEmployee(employeeFormData);
      }
      setSuccess(true);
      setTimeout(() => {
        handleEmployeeClose();
        loadData();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save employee');
    }
  };

  const handleEmployeeDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await salaryApi.deleteEmployee(id);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete employee');
    }
  };

  // Salary handlers
  const handleSalaryOpen = (salary?: Salary) => {
    if (salary) {
      setEditingSalary(salary);
      setSalaryFormData({
        employeeId: salary.employeeId,
        amount: salary.amount,
        month: salary.month,
        year: salary.year,
        paymentDate: salary.paymentDate ? format(new Date(salary.paymentDate), 'yyyy-MM-dd') : undefined,
        status: salary.status,
        notes: salary.notes || undefined,
      });
    } else {
      setEditingSalary(null);
      setSalaryFormData({
        employeeId: employees.length > 0 ? employees[0].id : '',
        amount: 0,
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        status: 'pending',
      });
    }
    setSalaryOpen(true);
    setError(null);
    setSuccess(false);
  };

  const handleSalaryClose = () => {
    setSalaryOpen(false);
    setEditingSalary(null);
  };

  const handleSalarySubmit = async () => {
    try {
      setError(null);
      setSuccess(false);
      if (editingSalary) {
        // Clean up form data for update
        const updateData: UpdateSalaryDto = {};
        if (salaryFormData.employeeId) updateData.employeeId = salaryFormData.employeeId;
        if (salaryFormData.amount !== undefined) updateData.amount = salaryFormData.amount;
        if (salaryFormData.month !== undefined) updateData.month = salaryFormData.month;
        if (salaryFormData.year !== undefined) updateData.year = salaryFormData.year;
        if (salaryFormData.paymentDate !== undefined) updateData.paymentDate = salaryFormData.paymentDate || undefined;
        if (salaryFormData.status) updateData.status = salaryFormData.status;
        if (salaryFormData.notes !== undefined) updateData.notes = salaryFormData.notes || undefined;
        await salaryApi.updateSalary(editingSalary.id, updateData);
      } else {
        await salaryApi.createSalary(salaryFormData);
      }
      setSuccess(true);
      setTimeout(() => {
        handleSalaryClose();
        loadData();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save salary');
    }
  };

  const handleSalaryDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this salary record?')) return;
    try {
      await salaryApi.deleteSalary(id);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete salary');
    }
  };

  // Bill handlers
  const handleBillOpen = (bill?: Bill) => {
    if (bill) {
      setEditingBill(bill);
      setBillFormData({
        description: bill.description,
        amount: bill.amount,
        category: bill.category || '',
        dueDate: format(new Date(bill.dueDate), 'yyyy-MM-dd'),
        paymentDate: bill.paymentDate ? format(new Date(bill.paymentDate), 'yyyy-MM-dd') : undefined,
        status: bill.status,
        notes: bill.notes || undefined,
      });
    } else {
      setEditingBill(null);
      setBillFormData({
        description: '',
        amount: 0,
        category: '',
        dueDate: format(new Date(), 'yyyy-MM-dd'),
        status: 'outstanding',
      });
    }
    setBillOpen(true);
    setError(null);
    setSuccess(false);
  };

  const handleBillClose = () => {
    setBillOpen(false);
    setEditingBill(null);
  };

  const handleBillSubmit = async () => {
    try {
      setError(null);
      setSuccess(false);
      if (editingBill) {
        // Clean up form data for update
        const updateData: UpdateBillDto = {};
        if (billFormData.description) updateData.description = billFormData.description;
        if (billFormData.amount !== undefined) updateData.amount = billFormData.amount;
        if (billFormData.category !== undefined) updateData.category = billFormData.category || undefined;
        if (billFormData.dueDate) updateData.dueDate = billFormData.dueDate;
        if (billFormData.paymentDate !== undefined) updateData.paymentDate = billFormData.paymentDate || undefined;
        if (billFormData.status) updateData.status = billFormData.status;
        if (billFormData.notes !== undefined) updateData.notes = billFormData.notes || undefined;
        await salaryApi.updateBill(editingBill.id, updateData);
      } else {
        await salaryApi.createBill(billFormData);
      }
      setSuccess(true);
      setTimeout(() => {
        handleBillClose();
        loadData();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save bill');
    }
  };

  const handleBillDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this bill?')) return;
    try {
      await salaryApi.deleteBill(id);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete bill');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'overdue':
        return 'error';
      case 'pending':
      case 'outstanding':
        return 'warning';
      default:
        return 'default';
    }
  };

  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
          Salary & Bills Management
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage employees, salaries, and outstanding bills
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Tabs value={tabValue} onChange={(_, newValue) => setTabValue(newValue)} sx={{ mb: 3 }}>
        <Tab label="Employees" />
        <Tab label="Salaries" />
        <Tab label="Bills" />
      </Tabs>

      {/* Employees Tab */}
      {tabValue === 0 && (
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleEmployeeOpen()}>
              Add Employee
            </Button>
          </Box>

          <Card>
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>NAME</TableCell>
                      <TableCell>POSITION</TableCell>
                      <TableCell>PHONE</TableCell>
                      <TableCell>EMAIL</TableCell>
                      <TableCell>MONTHLY SALARY</TableCell>
                      <TableCell>STATUS</TableCell>
                      <TableCell align="right">ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {employees.map((employee) => (
                      <TableRow key={employee.id}>
                        <TableCell>{employee.name}</TableCell>
                        <TableCell>{employee.position || '-'}</TableCell>
                        <TableCell>{employee.phone || '-'}</TableCell>
                        <TableCell>{employee.email || '-'}</TableCell>
                        <TableCell>{formatCurrency(employee.salary)}</TableCell>
                        <TableCell>
                          <Chip
                            label={employee.isActive ? 'Active' : 'Inactive'}
                            color={employee.isActive ? 'success' : 'default'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleEmployeeOpen(employee)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleEmployeeDelete(employee.id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {employees.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No employees found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Salaries Tab */}
      {tabValue === 1 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Employees
                  </Typography>
                  <Typography variant="h4">{salarySummary.totalEmployees}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Paid
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(salarySummary.totalPaid)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Pending
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {formatCurrency(salarySummary.totalPending)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Overdue
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {formatCurrency(salarySummary.totalOverdue)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleSalaryOpen()}>
              Add Salary
            </Button>
          </Box>

          <Card>
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>EMPLOYEE</TableCell>
                      <TableCell>MONTH/YEAR</TableCell>
                      <TableCell>AMOUNT</TableCell>
                      <TableCell>PAYMENT DATE</TableCell>
                      <TableCell>STATUS</TableCell>
                      <TableCell align="right">ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {salaries.map((salary) => (
                      <TableRow key={salary.id}>
                        <TableCell>{salary.employee?.name || 'N/A'}</TableCell>
                        <TableCell>
                          {monthNames[salary.month - 1]} {salary.year}
                        </TableCell>
                        <TableCell>{formatCurrency(salary.amount)}</TableCell>
                        <TableCell>
                          {salary.paymentDate ? format(new Date(salary.paymentDate), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip label={salary.status.toUpperCase()} color={getStatusColor(salary.status)} size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleSalaryOpen(salary)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleSalaryDelete(salary.id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {salaries.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No salary records found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Bills Tab */}
      {tabValue === 2 && (
        <Box>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Bills
                  </Typography>
                  <Typography variant="h4">{billSummary.totalBills}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Outstanding
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {formatCurrency(billSummary.totalOutstanding)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Total Paid
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {formatCurrency(billSummary.totalPaid)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Overdue
                  </Typography>
                  <Typography variant="h4" color="error.main">
                    {formatCurrency(billSummary.totalOverdue)}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleBillOpen()}>
              Add Bill
            </Button>
          </Box>

          <Card>
            <CardContent>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>DESCRIPTION</TableCell>
                      <TableCell>CATEGORY</TableCell>
                      <TableCell>AMOUNT</TableCell>
                      <TableCell>DUE DATE</TableCell>
                      <TableCell>PAYMENT DATE</TableCell>
                      <TableCell>STATUS</TableCell>
                      <TableCell align="right">ACTIONS</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bills.map((bill) => (
                      <TableRow key={bill.id}>
                        <TableCell>{bill.description}</TableCell>
                        <TableCell>{bill.category || '-'}</TableCell>
                        <TableCell>{formatCurrency(bill.amount)}</TableCell>
                        <TableCell>{format(new Date(bill.dueDate), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>
                          {bill.paymentDate ? format(new Date(bill.paymentDate), 'MMM dd, yyyy') : '-'}
                        </TableCell>
                        <TableCell>
                          <Chip label={bill.status.toUpperCase()} color={getStatusColor(bill.status)} size="small" />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton size="small" onClick={() => handleBillOpen(bill)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton size="small" onClick={() => handleBillDelete(bill.id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {bills.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                          <Typography variant="body2" color="text.secondary">
                            No bills found
                          </Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Box>
      )}

      {/* Employee Dialog */}
      <Dialog open={employeeOpen} onClose={handleEmployeeClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingEmployee ? 'Edit Employee' : 'Add Employee'}</DialogTitle>
        <DialogContent>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Employee {editingEmployee ? 'updated' : 'created'} successfully
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Name"
                value={employeeFormData.name}
                onChange={(e) => setEmployeeFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Position"
                value={employeeFormData.position}
                onChange={(e) => setEmployeeFormData((prev) => ({ ...prev, position: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Monthly Salary"
                type="number"
                value={employeeFormData.salary}
                onChange={(e) => setEmployeeFormData((prev) => ({ ...prev, salary: parseFloat(e.target.value) || 0 }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={employeeFormData.phone}
                onChange={(e) => setEmployeeFormData((prev) => ({ ...prev, phone: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={employeeFormData.email}
                onChange={(e) => setEmployeeFormData((prev) => ({ ...prev, email: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={2}
                value={employeeFormData.address}
                onChange={(e) => setEmployeeFormData((prev) => ({ ...prev, address: e.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={employeeFormData.isActive ? 'active' : 'inactive'}
                  label="Status"
                  onChange={(e) => setEmployeeFormData((prev) => ({ ...prev, isActive: e.target.value === 'active' }))}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEmployeeClose}>Cancel</Button>
          <Button onClick={handleEmployeeSubmit} variant="contained" disabled={success}>
            {editingEmployee ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Salary Dialog */}
      <Dialog open={salaryOpen} onClose={handleSalaryClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingSalary ? 'Edit Salary' : 'Add Salary'}</DialogTitle>
        <DialogContent>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Salary {editingSalary ? 'updated' : 'created'} successfully
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth required>
                <InputLabel>Employee</InputLabel>
                <Select
                  value={salaryFormData.employeeId}
                  label="Employee"
                  onChange={(e) => setSalaryFormData((prev) => ({ ...prev, employeeId: e.target.value }))}
                >
                  {employees.filter(e => e.isActive).map((employee) => (
                    <MenuItem key={employee.id} value={employee.id}>
                      {employee.name} - {formatCurrency(employee.salary)}/month
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={salaryFormData.amount}
                onChange={(e) => setSalaryFormData((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth required>
                <InputLabel>Month</InputLabel>
                <Select
                  value={salaryFormData.month}
                  label="Month"
                  onChange={(e) => setSalaryFormData((prev) => ({ ...prev, month: Number(e.target.value) }))}
                >
                  {monthNames.map((month, index) => (
                    <MenuItem key={index} value={index + 1}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Year"
                type="number"
                value={salaryFormData.year}
                onChange={(e) => setSalaryFormData((prev) => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={salaryFormData.paymentDate || ''}
                onChange={(e) => setSalaryFormData((prev) => ({ ...prev, paymentDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={salaryFormData.status}
                  label="Status"
                  onChange={(e) => setSalaryFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={salaryFormData.notes || ''}
                onChange={(e) => setSalaryFormData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleSalaryClose}>Cancel</Button>
          <Button onClick={handleSalarySubmit} variant="contained" disabled={success}>
            {editingSalary ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Bill Dialog */}
      <Dialog open={billOpen} onClose={handleBillClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBill ? 'Edit Bill' : 'Add Bill'}</DialogTitle>
        <DialogContent>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Bill {editingBill ? 'updated' : 'created'} successfully
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                value={billFormData.description}
                onChange={(e) => setBillFormData((prev) => ({ ...prev, description: e.target.value }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                value={billFormData.amount}
                onChange={(e) => setBillFormData((prev) => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Category"
                value={billFormData.category}
                onChange={(e) => setBillFormData((prev) => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Utilities, Rent, Supplies"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={billFormData.dueDate}
                onChange={(e) => setBillFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Payment Date"
                type="date"
                value={billFormData.paymentDate || ''}
                onChange={(e) => setBillFormData((prev) => ({ ...prev, paymentDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={billFormData.status}
                  label="Status"
                  onChange={(e) => setBillFormData((prev) => ({ ...prev, status: e.target.value as any }))}
                >
                  <MenuItem value="outstanding">Outstanding</MenuItem>
                  <MenuItem value="paid">Paid</MenuItem>
                  <MenuItem value="overdue">Overdue</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                multiline
                rows={2}
                value={billFormData.notes || ''}
                onChange={(e) => setBillFormData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleBillClose}>Cancel</Button>
          <Button onClick={handleBillSubmit} variant="contained" disabled={success}>
            {editingBill ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

