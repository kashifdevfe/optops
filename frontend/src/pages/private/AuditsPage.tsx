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
  Select,
  FormControl,
  InputLabel,
  Paper,
  Divider,
  Checkbox,
  FormControlLabel,
  Collapse,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { auditApi, inventoryApi } from '../../services/api.js';
import type { Audit, CreateAuditDto, UpdateAuditDto, AuditSummary, InventoryItem, AuditItemDto } from '../../types/index.js';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/currency.js';

export const AuditsPage: React.FC = () => {
  const [audits, setAudits] = useState<Audit[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [summary, setSummary] = useState<AuditSummary>({
    totalAudits: 0,
    totalInventoryValue: 0,
    totalSalesValue: 0,
    totalDiscrepancies: 0,
    totalGrossSales: 0,
    totalCOGS: 0,
    totalNetProfit: 0,
    avgProfitMargin: 0,
  });
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingAudit, setEditingAudit] = useState<Audit | null>(null);
  const [formData, setFormData] = useState<CreateAuditDto>({
    auditDate: format(new Date(), 'yyyy-MM-dd'),
    startDate: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd'),
    period: undefined,
    notes: '',
    includeExpenses: false,
    items: [],
  });
  const [auditItems, setAuditItems] = useState<Record<string, { expected: number; actual: number; notes?: string }>>({});
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [viewingAudit, setViewingAudit] = useState<Audit | null>(null);
  const loadingRef = useRef(false); // Prevent duplicate calls

  useEffect(() => {
    // Prevent duplicate calls (especially important with React.StrictMode)
    if (loadingRef.current) {
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    if (loadingRef.current) return; // Prevent duplicate calls
    loadingRef.current = true;
    try {
      setLoading(true);
      const [auditsResult, items] = await Promise.all([
        auditApi.getAudits({ period: 'all' }),
        auditApi.getInventoryItemsForAudit(),
      ]);
      setAudits(auditsResult.audits);
      setSummary(auditsResult.summary);
      setInventoryItems(items);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load audits');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleOpen = (audit?: Audit) => {
    if (audit) {
      setEditingAudit(audit);
      const itemsMap: Record<string, { expected: number; actual: number; notes?: string }> = {};
      audit.items.forEach((item) => {
        itemsMap[item.inventoryItemId] = {
          expected: item.expectedQuantity,
          actual: item.actualQuantity,
          notes: item.notes || undefined,
        };
      });
      setAuditItems(itemsMap);
      setFormData({
        auditDate: format(new Date(audit.auditDate), 'yyyy-MM-dd'),
        startDate: audit.startDate ? format(new Date(audit.startDate), 'yyyy-MM-dd') : format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
        endDate: audit.endDate ? format(new Date(audit.endDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd'),
        period: audit.period || undefined,
        notes: audit.notes || '',
        includeExpenses: audit.includeExpenses || false,
        items: audit.items.map((item) => ({
          inventoryItemId: item.inventoryItemId,
          expectedQuantity: item.expectedQuantity,
          actualQuantity: item.actualQuantity,
          notes: item.notes || undefined,
        })),
      });
    } else {
      setEditingAudit(null);
      const itemsMap: Record<string, { expected: number; actual: number; notes?: string }> = {};
      inventoryItems.forEach((item) => {
        itemsMap[item.id] = {
          expected: item.totalStock, // Auto-populate with current stock
          actual: item.totalStock, // Pre-fill with current stock for convenience
        };
      });
      setAuditItems(itemsMap);
      setFormData({
        auditDate: format(new Date(), 'yyyy-MM-dd'),
        startDate: format(new Date(new Date().setDate(new Date().getDate() - 30)), 'yyyy-MM-dd'),
        endDate: format(new Date(), 'yyyy-MM-dd'),
        period: undefined,
        notes: '',
        includeExpenses: false,
        items: [],
      });
    }
    setOpen(true);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingAudit(null);
    setAuditItems({});
  };

  const handleItemChange = (itemId: string, field: 'expected' | 'actual' | 'notes', value: number | string) => {
    setAuditItems((prev) => ({
      ...prev,
      [itemId]: {
        ...prev[itemId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setSuccess(false);

      // Convert auditItems to CreateAuditDto format
      // expectedQuantity is optional - backend will auto-calculate from current stock
      const items: AuditItemDto[] = Object.entries(auditItems)
        .filter(([_, data]) => data.actual !== undefined && data.actual >= 0)
        .map(([inventoryItemId, data]) => ({
          inventoryItemId,
          actualQuantity: data.actual || 0,
          notes: data.notes,
          // expectedQuantity is optional - backend uses current stock
        }));

      if (items.length === 0) {
        setError('Please add at least one item to audit');
        return;
      }

      const submitData: CreateAuditDto = {
        auditDate: formData.auditDate,
        startDate: formData.startDate,
        endDate: formData.endDate,
        notes: formData.notes,
        includeExpenses: formData.includeExpenses,
        items,
      };

      if (editingAudit) {
        await auditApi.updateAudit(editingAudit.id, submitData);
      } else {
        await auditApi.createAudit(submitData);
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        loadData();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save audit');
    }
  };

  const handleView = (audit: Audit) => {
    setViewingAudit(audit);
    setViewDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this audit?')) {
      return;
    }

    try {
      await auditApi.deleteAudit(id);
      loadData();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete audit');
    }
  };

  const formatDate = (date: string) => {
    try {
      return format(new Date(date), 'MMM dd, yyyy');
    } catch {
      return date;
    }
  };


  const getDiscrepancyColor = (discrepancy: number) => {
    if (discrepancy === 0) return 'success';
    if (discrepancy > 0) return 'info';
    return 'error';
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
          Inventory Audits
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Conduct physical inventory audits, track discrepancies, and monitor inventory value with sales data
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: 3 }}>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            New Audit
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Audits
              </Typography>
              <Typography variant="h4">{summary.totalAudits}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Gross Sales
              </Typography>
              <Typography variant="h4" color="success.main">
                {formatCurrency(summary.totalGrossSales || summary.totalSalesValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Cost of Goods Sold
              </Typography>
              <Typography variant="h4" color="warning.main">
                {formatCurrency(summary.totalCOGS || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Net Profit
              </Typography>
              <Typography variant="h4" color={summary.totalNetProfit >= 0 ? 'success.main' : 'error.main'}>
                {formatCurrency(summary.totalNetProfit || 0)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Profit Margin
              </Typography>
              <Typography variant="h4" color="primary.main">
                {summary.avgProfitMargin ? `${summary.avgProfitMargin.toFixed(1)}%` : '0%'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Inventory Value
              </Typography>
              <Typography variant="h4" color="info.main">
                {formatCurrency(summary.totalInventoryValue)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Total Discrepancies
              </Typography>
              <Typography variant="h4" color="error.main">
                {formatCurrency(summary.totalDiscrepancies)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Card>
        <CardContent>
          <TableContainer sx={{ maxHeight: 600, overflow: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>DATE</TableCell>
                  <TableCell>DATE RANGE</TableCell>
                  <TableCell>ITEMS</TableCell>
                  <TableCell>GROSS SALES</TableCell>
                  <TableCell>COST OF GOODS SOLD</TableCell>
                  <TableCell>NET PROFIT</TableCell>
                  <TableCell>EXPENSES</TableCell>
                  <TableCell>FINAL NET PROFIT</TableCell>
                  <TableCell>MARGIN</TableCell>
                  <TableCell>INVENTORY VALUE</TableCell>
                  <TableCell align="right">ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {audits.map((audit) => {
                  const totalDiscrepancies = audit.items.reduce(
                    (sum, item) => sum + Math.abs(item.discrepancy) * item.unitPrice,
                    0
                  );
                  return (
                    <TableRow key={audit.id}>
                      <TableCell>{formatDate(audit.auditDate)}</TableCell>
                      <TableCell>
                        {audit.startDate && audit.endDate ? (
                          <Typography variant="body2">
                            {formatDate(audit.startDate)} - {formatDate(audit.endDate)}
                          </Typography>
                        ) : (
                          <Chip
                            label={audit.period ? audit.period.toUpperCase() : 'N/A'}
                            size="small"
                            color={audit.period === 'month' ? 'primary' : audit.period === 'year' ? 'success' : 'default'}
                          />
                        )}
                      </TableCell>
                      <TableCell>{audit.items.length}</TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600} color="success.main">
                          {formatCurrency(audit.grossSales || audit.totalSalesValue)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="warning.main">
                          {formatCurrency(audit.costOfGoodsSold || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          fontWeight={600}
                          color={audit.netProfit >= 0 ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(audit.netProfit || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {audit.includeExpenses ? (
                          <Typography variant="body2" color="error.main">
                            {formatCurrency(audit.totalExpenses || 0)}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        {audit.includeExpenses ? (
                          <Typography
                            variant="body2"
                            fontWeight={600}
                            color={audit.finalNetProfit >= 0 ? 'success.main' : 'error.main'}
                          >
                            {formatCurrency(audit.finalNetProfit || 0)}
                          </Typography>
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            N/A
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={`${(audit.profitMargin || 0).toFixed(1)}%`}
                          size="small"
                          color={audit.profitMargin >= 20 ? 'success' : audit.profitMargin >= 10 ? 'warning' : 'error'}
                        />
                      </TableCell>
                      <TableCell>{formatCurrency(audit.totalInventoryValue)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleView(audit)} title="View Details">
                          <VisibilityIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleOpen(audit)} title="Edit">
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(audit.id)} color="error" title="Delete">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {audits.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={11} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">
                        No audits found
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
        <DialogTitle>{editingAudit ? 'Edit Audit' : 'New Inventory Audit'}</DialogTitle>
        <DialogContent>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Audit {editingAudit ? 'updated' : 'created'} successfully
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Audit Date"
                type="date"
                value={formData.auditDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, auditDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Start Date"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                Start date for sales analysis
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="End Date"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                required
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                End date for sales analysis
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.includeExpenses || false}
                    onChange={(e) => setFormData((prev) => ({ ...prev, includeExpenses: e.target.checked }))}
                  />
                }
                label="Include expenses (bills and salaries) in net profit calculation"
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, ml: 4, display: 'block' }}>
                If checked, bills and salaries for the date range will be deducted from net profit
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes (Optional)"
                multiline
                rows={2}
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                placeholder="Add any notes about this audit..."
              />
            </Grid>
            <Grid item xs={12}>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ mb: 1 }}>
                Inventory Items
              </Typography>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>How it works:</strong> Expected quantities are automatically calculated from current stock (synced with sales). 
                    Simply enter the actual quantities you physically count. The system will calculate:
                  </Typography>
                  <Box component="ul" sx={{ mt: 1, mb: 0, pl: 2 }}>
                    <li>Gross Sales (total revenue for the selected period)</li>
                    <li>Cost of Goods Sold (cost of frames and lenses sold)</li>
                    <li>Net Profit (Gross Sales - Cost of Goods Sold)</li>
                    <li>Profit Margin (Net Profit / Gross Sales × 100%)</li>
                    <li>Inventory discrepancies (difference between expected and actual)</li>
                  </Box>
                </Alert>
              </Box>
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ITEM NAME</TableCell>
                      <TableCell>CATEGORY</TableCell>
                      <TableCell>UNIT PRICE</TableCell>
                      <TableCell>EXPECTED QTY (Auto)</TableCell>
                      <TableCell>ACTUAL QTY</TableCell>
                      <TableCell>DISCREPANCY</TableCell>
                      <TableCell>NOTES</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {inventoryItems.map((item) => {
                      const auditItem = auditItems[item.id] || { expected: item.totalStock, actual: item.totalStock };
                      const discrepancy = auditItem.actual - auditItem.expected;
                      return (
                        <TableRow key={item.id}>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.category?.name || 'N/A'}</TableCell>
                          <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={auditItem.expected}
                              disabled
                              sx={{ 
                                '& .MuiInputBase-input': { 
                                  backgroundColor: 'action.disabledBackground',
                                  color: 'text.secondary'
                                }
                              }}
                              inputProps={{ min: 0, style: { width: '80px' } }}
                              helperText="Auto from stock"
                              FormHelperTextProps={{ sx: { margin: 0, fontSize: '0.65rem' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              type="number"
                              value={auditItem.actual}
                              onChange={(e) =>
                                handleItemChange(item.id, 'actual', parseInt(e.target.value) || 0)
                              }
                              inputProps={{ min: 0, style: { width: '80px' } }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={discrepancy > 0 ? `+${discrepancy}` : discrepancy}
                              color={getDiscrepancyColor(discrepancy)}
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            <TextField
                              size="small"
                              value={auditItem.notes || ''}
                              onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                              placeholder="Notes..."
                              inputProps={{ style: { width: '120px' } }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={success}>
            {editingAudit ? 'Update' : 'Create'} Audit
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Audit Details Dialog */}
      <Dialog open={viewDialogOpen} onClose={() => setViewDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Audit Details - {viewingAudit && formatDate(viewingAudit.auditDate)}</DialogTitle>
        <DialogContent>
          {viewingAudit && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3, mt: 1 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">Gross Sales</Typography>
                      <Typography variant="h6" color="success.main">
                        {formatCurrency(viewingAudit.grossSales || viewingAudit.totalSalesValue)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">Cost of Goods Sold</Typography>
                      <Typography variant="h6" color="warning.main">
                        {formatCurrency(viewingAudit.costOfGoodsSold || 0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">Net Profit</Typography>
                      <Typography variant="h6" color={viewingAudit.netProfit >= 0 ? 'success.main' : 'error.main'}>
                        {formatCurrency(viewingAudit.netProfit || 0)}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="body2" color="text.secondary">Profit Margin</Typography>
                      <Typography variant="h6">
                        {(viewingAudit.profitMargin || 0).toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                {viewingAudit.includeExpenses && (
                  <>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">Total Expenses</Typography>
                          <Typography variant="h6" color="error.main">
                            {formatCurrency(viewingAudit.totalExpenses || 0)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="body2" color="text.secondary">Final Net Profit</Typography>
                          <Typography variant="h6" color={viewingAudit.finalNetProfit >= 0 ? 'success.main' : 'error.main'}>
                            {formatCurrency(viewingAudit.finalNetProfit || 0)}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </>
                )}
              </Grid>

              {viewingAudit.categoryBreakdown && (
                <Box sx={{ mt: 3 }}>
                  <Typography variant="h6" sx={{ mb: 2 }}>
                    Category Breakdown
                  </Typography>
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Category</TableCell>
                          <TableCell align="right">Items Sold</TableCell>
                          <TableCell align="right">Total Cost</TableCell>
                          <TableCell align="right">Total Revenue</TableCell>
                          <TableCell align="right">Total Profit</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {(() => {
                          try {
                            if (!viewingAudit.categoryBreakdown) {
                              return (
                                <TableRow>
                                  <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      No category breakdown data available
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              );
                            }

                            const breakdown = typeof viewingAudit.categoryBreakdown === 'string' 
                              ? JSON.parse(viewingAudit.categoryBreakdown) 
                              : viewingAudit.categoryBreakdown;
                            
                            if (!breakdown || Object.keys(breakdown).length === 0) {
                              return (
                                <TableRow>
                                  <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                      No category breakdown data available
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              );
                            }

                            return (
                              <>
                                {Object.entries(breakdown).map(([categoryId, data]: [string, any]) => (
                                  <TableRow key={categoryId}>
                                    <TableCell>
                                      <Typography variant="body2" fontWeight={600}>
                                        {data.categoryName || 'Uncategorized'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell align="right">{data.itemsSold || 0}</TableCell>
                                    <TableCell align="right">{formatCurrency(data.totalCost || 0)}</TableCell>
                                    <TableCell align="right">{formatCurrency(data.totalRevenue || 0)}</TableCell>
                                    <TableCell align="right">
                                      <Typography
                                        variant="body2"
                                        color={data.totalProfit >= 0 ? 'success.main' : 'error.main'}
                                        fontWeight={600}
                                      >
                                        {formatCurrency(data.totalProfit || 0)}
                                      </Typography>
                                    </TableCell>
                                  </TableRow>
                                ))}
                                <TableRow sx={{ backgroundColor: 'action.hover' }}>
                                  <TableCell>
                                    <Typography variant="body2" fontWeight={700}>
                                      TOTAL
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2" fontWeight={700}>
                                      {Object.values(breakdown).reduce(
                                        (sum: number, data: any) => sum + (data.itemsSold || 0),
                                        0
                                      )}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2" fontWeight={700}>
                                      {formatCurrency(
                                        Object.values(breakdown).reduce(
                                          (sum: number, data: any) => sum + (data.totalCost || 0),
                                          0
                                        )
                                      )}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2" fontWeight={700}>
                                      {formatCurrency(
                                        Object.values(breakdown).reduce(
                                          (sum: number, data: any) => sum + (data.totalRevenue || 0),
                                          0
                                        )
                                      )}
                                    </Typography>
                                  </TableCell>
                                  <TableCell align="right">
                                    <Typography variant="body2" fontWeight={700} color={viewingAudit.netProfit >= 0 ? 'success.main' : 'error.main'}>
                                      {formatCurrency(viewingAudit.netProfit || 0)}
                                    </Typography>
                                  </TableCell>
                                </TableRow>
                              </>
                            );
                          } catch (error) {
                            return (
                              <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 2 }}>
                                  <Typography variant="body2" color="error.main">
                                    Error parsing category breakdown data
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            );
                          }
                        })()}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
