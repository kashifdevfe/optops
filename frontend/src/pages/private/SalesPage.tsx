import React, { useState, useEffect, useRef } from 'react';
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
  Paper,
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
  Tooltip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import PrintIcon from '@mui/icons-material/Print';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import ErrorIcon from '@mui/icons-material/Error';
import { saleApi, customerApi, inventoryApi, categoryApi } from '../../services/api.js';
import type { Sale, CreateSaleDto, UpdateSaleDto, Customer, InventoryItem, Category } from '../../types/index.js';
import { format } from 'date-fns';
import { useAppSelector } from '../../hooks/redux.js';
import { PrintReceipt } from '../../components/sales/PrintReceipt.js';
import { formatCurrency } from '../../utils/currency.js';

export const SalesPage: React.FC = () => {
  const { company, themeSettings } = useAppSelector((state) => state.auth);
  const [sales, setSales] = useState<Sale[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [frames, setFrames] = useState<InventoryItem[]>([]);
  const [lenses, setLenses] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [formData, setFormData] = useState<CreateSaleDto>({
    customerId: '',
    rightEyeSphere: '0',
    rightEyeCylinder: '0',
    rightEyeAxis: '0',
    leftEyeSphere: '0',
    leftEyeCylinder: '0',
    leftEyeAxis: '0',
    nearAdd: '0',
    total: 0,
    received: 0,
    frame: '',
    lens: '',
    status: 'pending',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const loadingRef = useRef(false); // Prevent duplicate calls

  useEffect(() => {
    // Prevent duplicate calls (especially important with React.StrictMode)
    if (loadingRef.current) {
      return;
    }
    loadData();
  }, []);

  const loadFramesAndLenses = async () => {
    try {
      const categoriesData = await categoryApi.getCategories();
      
      // Find Frame and Lens categories by type
      const frameCategories = categoriesData.filter((cat: Category) => cat.type === 'Frame');
      const lensCategories = categoriesData.filter((cat: Category) => cat.type === 'Lens');

      // Fetch inventory items for all Frame and Lens categories
      const [framesData, lensesData] = await Promise.all([
        frameCategories.length > 0 
          ? Promise.all(frameCategories.map((cat: Category) => inventoryApi.getInventoryItems(cat.id))).then((results) => results.flat())
          : Promise.resolve([]),
        lensCategories.length > 0
          ? Promise.all(lensCategories.map((cat: Category) => inventoryApi.getInventoryItems(cat.id))).then((results) => results.flat())
          : Promise.resolve([]),
      ]);

      setFrames(framesData);
      setLenses(lensesData);
    } catch (err: any) {
      console.error('Failed to load frames and lenses:', err);
    }
  };

  const loadData = async () => {
    if (loadingRef.current) return; // Prevent duplicate calls
    loadingRef.current = true;
    try {
      setLoading(true);
      const [salesData, customersData] = await Promise.all([
        saleApi.getSales(),
        customerApi.getCustomers(),
      ]);
      setSales(salesData);
      setCustomers(customersData);

      // Load frames and lenses
      await loadFramesAndLenses();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load data');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleOpen = async (sale?: Sale) => {
    // Reload frames and lenses to ensure fresh data
    await loadFramesAndLenses();
    
    if (sale) {
      setEditingSale(sale);
      setFormData({
        customerId: sale.customerId,
        rightEyeSphere: sale.rightEyeSphere,
        rightEyeCylinder: sale.rightEyeCylinder,
        rightEyeAxis: sale.rightEyeAxis,
        leftEyeSphere: sale.leftEyeSphere,
        leftEyeCylinder: sale.leftEyeCylinder,
        leftEyeAxis: sale.leftEyeAxis,
        nearAdd: sale.nearAdd,
        total: sale.total,
        received: sale.received,
        frame: sale.frame,
        lens: sale.lens,
        entryDate: sale.entryDate ? format(new Date(sale.entryDate), 'yyyy-MM-dd') : undefined,
        deliveryDate: sale.deliveryDate ? format(new Date(sale.deliveryDate), 'yyyy-MM-dd') : undefined,
        status: sale.status,
      });
    } else {
      setEditingSale(null);
      setFormData({
        customerId: '',
        rightEyeSphere: '0',
        rightEyeCylinder: '0',
        rightEyeAxis: '0',
        leftEyeSphere: '0',
        leftEyeCylinder: '0',
        leftEyeAxis: '0',
        nearAdd: '0',
        total: 0,
        received: 0,
        frame: '',
        lens: '',
        status: 'pending',
      });
    }
    setOpen(true);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSale(null);
  };

  const handleChange = (field: keyof CreateSaleDto) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'total' || field === 'received' ? parseFloat(e.target.value) || 0 : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setSuccess(false);

      if (editingSale) {
        await saleApi.updateSale(editingSale.id, formData);
      } else {
        await saleApi.createSale(formData);
      }

      setSuccess(true);
      setTimeout(async () => {
        handleClose();
        await loadData();
        // Reload frames and lenses after sale operations to reflect stock changes
        await loadFramesAndLenses();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save sale');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this sale?')) {
      return;
    }

    try {
      await saleApi.deleteSale(id);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete sale');
    }
  };

  const handleStatusToggle = async (sale: Sale) => {
    try {
      await saleApi.updateSale(sale.id, {
        status: sale.status === 'completed' ? 'pending' : 'completed',
      });
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update status');
    }
  };

  const formatPrescription = (sphere: string, cylinder: string, axis: string) => {
    return `${sphere}/${cylinder}/${axis}`;
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'Invalid Date';
    try {
      return format(new Date(date), 'yyyy-MM-dd');
    } catch {
      return 'Invalid Date';
    }
  };

  const getDeliveryDateStatus = (deliveryDate: string | null) => {
    if (!deliveryDate) return null;
    try {
      const delivery = new Date(deliveryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      delivery.setHours(0, 0, 0, 0);
      
      const diffTime = delivery.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays < 0) {
        return { status: 'passed', days: Math.abs(diffDays), message: `Delivery date passed ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} ago` };
      } else if (diffDays <= 3) {
        return { status: 'near', days: diffDays, message: `Delivery date is in ${diffDays} day${diffDays !== 1 ? 's' : ''}` };
      }
      return null;
    } catch {
      return null;
    }
  };

  const handlePrint = (sale: Sale) => {
    setSelectedSale(sale);
    setPrintDialogOpen(true);
  };

  const handleClosePrintDialog = () => {
    setPrintDialogOpen(false);
    setSelectedSale(null);
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
          Sales
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage your sales orders and customer prescriptions
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Add Sale
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer sx={{ maxHeight: 600, overflow: 'auto', borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>CUSTOMER</TableCell>
                  <TableCell>ORDER NO</TableCell>
                  <TableCell>RIGHT EYE</TableCell>
                  <TableCell>LEFT EYE</TableCell>
                  <TableCell>NEAR ADD</TableCell>
                  <TableCell>TOTAL</TableCell>
                  <TableCell>RECEIVED</TableCell>
                  <TableCell>REMAINING</TableCell>
                  <TableCell>FRAME</TableCell>
                  <TableCell>LENS</TableCell>
                  <TableCell>ENTRY</TableCell>
                  <TableCell>DELIVERY</TableCell>
                  <TableCell>STATUS</TableCell>
                  <TableCell align="right">ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sales.map((sale) => (
                  <TableRow key={sale.id}>
                    <TableCell>{sale.customer?.name || 'N/A'}</TableCell>
                    <TableCell>{sale.orderNo}</TableCell>
                    <TableCell>
                      {formatPrescription(sale.rightEyeSphere, sale.rightEyeCylinder, sale.rightEyeAxis)}
                    </TableCell>
                    <TableCell>
                      {formatPrescription(sale.leftEyeSphere, sale.leftEyeCylinder, sale.leftEyeAxis)}
                    </TableCell>
                    <TableCell>{sale.nearAdd}</TableCell>
                    <TableCell>{formatCurrency(sale.total)}</TableCell>
                    <TableCell>{formatCurrency(sale.received)}</TableCell>
                    <TableCell>{formatCurrency(sale.remaining)}</TableCell>
                    <TableCell>{sale.frame}</TableCell>
                    <TableCell>{sale.lens}</TableCell>
                    <TableCell>{formatDate(sale.entryDate)}</TableCell>
                    <TableCell>
                      {(() => {
                        const deliveryStatus = getDeliveryDateStatus(sale.deliveryDate);
                        const deliveryDateText = formatDate(sale.deliveryDate);
                        
                        if (deliveryStatus) {
                          if (deliveryStatus.status === 'passed') {
                            return (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <ErrorIcon sx={{ color: 'error.main', fontSize: '1.2rem' }} />
                                <Typography sx={{ color: 'error.main', fontWeight: 600 }}>
                                  {deliveryDateText}
                                </Typography>
                              </Box>
                            );
                          } else if (deliveryStatus.status === 'near') {
                            return (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <WarningIcon sx={{ color: 'warning.main', fontSize: '1.2rem' }} />
                                <Typography sx={{ color: 'warning.main', fontWeight: 600 }}>
                                  {deliveryDateText}
                                </Typography>
                              </Box>
                            );
                          }
                        }
                        
                        return deliveryDateText;
                      })()}
                    </TableCell>
                    <TableCell>
                      {(() => {
                        const deliveryStatus = getDeliveryDateStatus(sale.deliveryDate);
                        const isCompleted = sale.status === 'completed';
                        
                        let buttonColor: 'success' | 'warning' | 'error' | 'default' = 'default';
                        let icon = null;
                        let tooltipText = isCompleted ? 'Mark as Pending' : 'Mark as Complete';
                        
                        if (!isCompleted && deliveryStatus) {
                          if (deliveryStatus.status === 'passed') {
                            buttonColor = 'error';
                            icon = <ErrorIcon sx={{ mr: 0.5, fontSize: '1rem' }} />;
                            tooltipText = `${deliveryStatus.message}. Click to mark as complete.`;
                          } else if (deliveryStatus.status === 'near') {
                            buttonColor = 'warning';
                            icon = <WarningIcon sx={{ mr: 0.5, fontSize: '1rem' }} />;
                            tooltipText = `${deliveryStatus.message}. Click to mark as complete.`;
                          }
                        } else if (isCompleted) {
                          buttonColor = 'success';
                          icon = <CheckCircleIcon sx={{ mr: 0.5, fontSize: '1rem' }} />;
                        }
                        
                        return (
                          <Tooltip title={tooltipText} arrow>
                            <Button
                              variant={isCompleted ? 'contained' : 'outlined'}
                              color={buttonColor}
                              size="small"
                              onClick={() => handleStatusToggle(sale)}
                              startIcon={icon || (isCompleted ? <CheckCircleIcon /> : null)}
                              sx={{ minWidth: 100 }}
                            >
                              {isCompleted ? 'Complete' : 'Pending'}
                            </Button>
                          </Tooltip>
                        );
                      })()}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpen(sale)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(sale.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handlePrint(sale)}>
                        <PrintIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>{editingSale ? 'Edit Sale' : 'Add Sale'}</DialogTitle>
        <DialogContent>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Sale {editingSale ? 'updated' : 'created'} successfully
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Customer"
                value={formData.customerId}
                onChange={(e) => setFormData((prev) => ({ ...prev, customerId: e.target.value }))}
                required
              >
                {customers.map((customer) => (
                  <MenuItem key={customer.id} value={customer.id}>
                    {customer.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Right Eye
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Sphere" value={formData.rightEyeSphere} onChange={handleChange('rightEyeSphere')} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Cylinder" value={formData.rightEyeCylinder} onChange={handleChange('rightEyeCylinder')} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Axis" value={formData.rightEyeAxis} onChange={handleChange('rightEyeAxis')} />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 1 }}>
                Left Eye
              </Typography>
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Sphere" value={formData.leftEyeSphere} onChange={handleChange('leftEyeSphere')} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Cylinder" value={formData.leftEyeCylinder} onChange={handleChange('leftEyeCylinder')} />
            </Grid>
            <Grid item xs={4}>
              <TextField fullWidth label="Axis" value={formData.leftEyeAxis} onChange={handleChange('leftEyeAxis')} />
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField fullWidth label="Near Add" value={formData.nearAdd} onChange={handleChange('nearAdd')} />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Frame"
                value={formData.frame}
                onChange={(e) => setFormData((prev) => ({ ...prev, frame: e.target.value }))}
                required
              >
                <MenuItem value="">
                  <em>Select Frame</em>
                </MenuItem>
                {frames.map((frame) => (
                  <MenuItem key={frame.id} value={frame.name}>
                    {frame.name} {frame.totalStock > 0 ? `(Stock: ${frame.totalStock})` : '(Out of Stock)'}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                select
                label="Lens"
                value={formData.lens}
                onChange={(e) => setFormData((prev) => ({ ...prev, lens: e.target.value }))}
                required
              >
                <MenuItem value="">
                  <em>Select Lens</em>
                </MenuItem>
                {lenses.map((lens) => (
                  <MenuItem key={lens.id} value={lens.name}>
                    {lens.name} {lens.totalStock > 0 ? `(Stock: ${lens.totalStock})` : '(Out of Stock)'}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Total"
                type="number"
                value={formData.total}
                onChange={handleChange('total')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Received"
                type="number"
                value={formData.received}
                onChange={handleChange('received')}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Remaining"
                type="number"
                value={formData.total - formData.received}
                disabled
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Entry Date"
                type="date"
                value={formData.entryDate || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, entryDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Delivery Date"
                type="date"
                value={formData.deliveryDate || ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, deliveryDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={success}>
            {editingSale ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={printDialogOpen} onClose={handleClosePrintDialog} maxWidth="lg" fullWidth>
        <DialogContent sx={{ p: 0 }}>
          {selectedSale && company && themeSettings && selectedSale.customer && (
            <PrintReceipt
              sale={selectedSale}
              customer={selectedSale.customer}
              company={company}
              themeSettings={themeSettings}
              onClose={handleClosePrintDialog}
            />
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};
