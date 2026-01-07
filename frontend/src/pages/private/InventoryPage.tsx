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
  Tabs,
  Tab,
  MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import { inventoryApi, categoryApi } from '../../services/api.js';
import type { InventoryItem, CreateInventoryItemDto, UpdateInventoryItemDto, Category } from '../../types/index.js';
import { formatCurrency } from '../../utils/currency.js';
import { CategoryManager } from '../../components/inventory/CategoryManager.js';
import SettingsIcon from '@mui/icons-material/Settings';

export const InventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [categoryManagerOpen, setCategoryManagerOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<CreateInventoryItemDto>({
    name: '',
    unitPrice: 0,
    totalStock: 0,
    categoryId: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const loadingCategoriesRef = useRef(false); // Prevent duplicate calls
  const loadingItemsRef = useRef(false); // Prevent duplicate calls

  useEffect(() => {
    // Prevent duplicate calls (especially important with React.StrictMode)
    if (loadingCategoriesRef.current) {
      return;
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (categories.length > 0 && !selectedCategoryId) {
      setSelectedCategoryId(categories[0].id);
    }
  }, [categories, selectedCategoryId]);

  useEffect(() => {
    if (selectedCategoryId) {
      loadItems();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoryId]); // Only depend on selectedCategoryId to avoid cascading calls

  const loadCategories = async () => {
    if (loadingCategoriesRef.current) return; // Prevent duplicate calls
    loadingCategoriesRef.current = true;
    try {
      const data = await categoryApi.getCategories();
      setCategories(data);
      if (data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load categories');
    } finally {
      loadingCategoriesRef.current = false;
    }
  };

  const loadItems = async () => {
    if (!selectedCategoryId || loadingItemsRef.current) return; // Prevent duplicate calls
    loadingItemsRef.current = true;
    try {
      setLoading(true);
      const data = await inventoryApi.getInventoryItems(selectedCategoryId);
      setItems(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load inventory');
    } finally {
      setLoading(false);
      loadingItemsRef.current = false;
    }
  };

  const handleCategoryChange = (_event: React.SyntheticEvent, newValue: string) => {
    setSelectedCategoryId(newValue);
  };

  const handleOpen = (item?: InventoryItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        unitPrice: item.unitPrice,
        totalStock: item.totalStock,
        categoryId: item.categoryId,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        unitPrice: 0,
        totalStock: 0,
        categoryId: selectedCategoryId || '',
      });
    }
    setOpen(true);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
  };

  const handleChange = (field: keyof CreateInventoryItemDto) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'unitPrice' || field === 'totalStock' 
      ? (e.target.value === '' ? undefined : parseFloat(e.target.value) || 0) 
      : e.target.value;
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setSuccess(false);

      if (editingItem) {
        await inventoryApi.updateInventoryItem(editingItem.id, formData);
      } else {
        await inventoryApi.createInventoryItem(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        loadItems();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save inventory item');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this item?')) {
      return;
    }

    try {
      await inventoryApi.deleteInventoryItem(id);
      loadItems();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete item');
    }
  };

  const handleExport = () => {
    const categoryName = categories.find(c => c.id === selectedCategoryId)?.name || 'All';
    const csvContent = [
      ['NAME', 'UNIT PRICE', 'ITEM CODE', 'TOTAL STOCK REMAINING'].join(','),
      ...items.map((item) => [
        item.name, 
        item.unitPrice, 
        item.itemCode, 
        item.totalStock
      ].join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${categoryName}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculate total inventory value
  const totalInventoryValue = items.reduce((sum, item) => {
    return sum + (item.unitPrice * item.totalStock);
  }, 0);

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
          Inventory
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage your inventory items across different categories
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" startIcon={<SettingsIcon />} onClick={() => setCategoryManagerOpen(true)}>
            Manage Categories
          </Button>
          <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExport}>
            Export To Excel
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Add Item
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
          <Tabs value={selectedCategoryId || ''} onChange={handleCategoryChange} sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}>
            {categories.map((category) => (
              <Tab 
                key={category.id} 
                label={category.type ? `${category.name} (${category.type})` : category.name} 
                value={category.id} 
              />
            ))}
          </Tabs>

          <TableContainer sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>NAME</TableCell>
                  <TableCell>UNIT PRICE</TableCell>
                  <TableCell>ITEM CODE</TableCell>
                  <TableCell>TOTAL STOCK REMAINING</TableCell>
                  <TableCell align="right">TOTAL VALUE</TableCell>
                  <TableCell align="right">ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((item) => {
                  const itemTotalValue = item.unitPrice * item.totalStock;
                  return (
                    <TableRow key={item.id}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell>{item.itemCode}</TableCell>
                      <TableCell>{item.totalStock}</TableCell>
                      <TableCell align="right">{formatCurrency(itemTotalValue)}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" onClick={() => handleOpen(item)}>
                          <EditIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(item.id)} color="error">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Total Inventory Summary */}
          <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            <TableContainer>
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={5} align="right" sx={{ fontWeight: 600, fontSize: '1rem' }}>
                      Total Inventory Value ({categories.find(c => c.id === selectedCategoryId)?.name || 'All'}):
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'primary.main' }}>
                      {formatCurrency(totalInventoryValue)}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </CardContent>
      </Card>

      <CategoryManager
        open={categoryManagerOpen}
        onClose={() => setCategoryManagerOpen(false)}
        onCategoryChange={() => {
          loadCategories();
          if (selectedCategoryId) {
            loadItems();
          }
        }}
      />

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingItem ? 'Edit Inventory Item' : 'Add Inventory Item'}</DialogTitle>
        <DialogContent>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Item {editingItem ? 'updated' : 'created'} successfully
            </Alert>
          )}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField fullWidth label="Name" value={formData.name} onChange={handleChange('name')} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Unit Price (Cost)"
                type="number"
                value={formData.unitPrice}
                onChange={handleChange('unitPrice')}
                required
                helperText="Purchase/cost price"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Total Stock"
                type="number"
                value={formData.totalStock}
                onChange={handleChange('totalStock')}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={formData.categoryId}
                onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                required
              >
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.name} {category.type ? `(${category.type})` : ''}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={success}>
            {editingItem ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
