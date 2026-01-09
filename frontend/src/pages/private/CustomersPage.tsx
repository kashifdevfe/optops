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
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { customerApi } from '../../services/api.js';
import type { Customer, CreateCustomerDto, UpdateCustomerDto } from '../../types/index.js';

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CreateCustomerDto>({
    name: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [promotionOpen, setPromotionOpen] = useState(false);
  const [promotionMessage, setPromotionMessage] = useState('');
  const loadingRef = useRef(false); // Prevent duplicate calls

  const handleSendPromotion = () => {
    // Extract numbers
    const numbers = customers
      .map(c => c.phone)
      .filter(p => p) // Remove empty
      .map(p => {
        // Basic cleanup
        let clean = p.replace(/[^\d+]/g, '');
        if (!clean.startsWith('+') && clean.startsWith('0')) {
          clean = '92' + clean.substring(1); // Default to local code if simple 0 start
        }
        return clean;
      });

    // Unique numbers only
    const uniqueNumbers = [...new Set(numbers)];

    // Copy to clipboard (comma separated for most tools)
    const clipboardText = uniqueNumbers.join(',');

    navigator.clipboard.writeText(clipboardText).then(() => {
      alert(`Copied ${uniqueNumbers.length} phone numbers to clipboard!`);
      setPromotionOpen(false);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert('Failed to copy numbers. Please try again.');
    });
  };

  useEffect(() => {
    // Prevent duplicate calls (especially important with React.StrictMode)
    if (loadingRef.current) {
      return;
    }
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    if (loadingRef.current) return; // Prevent duplicate calls
    loadingRef.current = true;
    try {
      setLoading(true);
      const data = await customerApi.getCustomers();
      setCustomers(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load customers');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleOpen = (customer?: Customer) => {
    if (customer) {
      setEditingCustomer(customer);
      setFormData({
        name: customer.name,
        phone: customer.phone,
        address: customer.address,
      });
    } else {
      setEditingCustomer(null);
      setFormData({
        name: '',
        phone: '',
        address: '',
      });
    }
    setOpen(true);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCustomer(null);
    setFormData({
      name: '',
      phone: '',
      address: '',
    });
  };

  const handleChange = (field: keyof CreateCustomerDto) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setSuccess(false);

      if (editingCustomer) {
        await customerApi.updateCustomer(editingCustomer.id, formData);
      } else {
        await customerApi.createCustomer(formData);
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        loadCustomers();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save customer');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) {
      return;
    }

    try {
      await customerApi.deleteCustomer(id);
      loadCustomers();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete customer');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
          Customers
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Manage your customer database
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button variant="outlined" startIcon={<EditIcon />} onClick={() => setPromotionOpen(true)}>
            Send Promotion
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
            Add Customer
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
          <TableContainer sx={{ borderRadius: 2, border: 1, borderColor: 'divider' }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Phone</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer.id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.phone}</TableCell>
                    <TableCell>{customer.address}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpen(customer)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" onClick={() => handleDelete(customer.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCustomer ? 'Edit Customer' : 'Add Customer'}</DialogTitle>
        <DialogContent>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Customer {editingCustomer ? 'updated' : 'created'} successfully
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
                value={formData.name}
                onChange={handleChange('name')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={handleChange('phone')}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleChange('address')}
                required
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={success}>
            {editingCustomer ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={promotionOpen} onClose={() => setPromotionOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Send Promotion</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            To send a message to all customers, we will copy their phone numbers to your clipboard. You can then paste them into a WhatsApp Broadcast list or Bulk SMS tool.
          </Typography>
          <TextField
            fullWidth
            label="Message (Optional - for your reference)"
            multiline
            rows={4}
            value={promotionMessage}
            onChange={(e) => setPromotionMessage(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPromotionOpen(false)}>Cancel</Button>
          <Button onClick={handleSendPromotion} variant="contained">
            Copy All Numbers
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
