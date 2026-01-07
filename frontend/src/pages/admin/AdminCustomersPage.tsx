import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Grid,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { adminApi } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  createdAt: string;
  company: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    sales: number;
  };
}

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const loadingRef = useRef(false); // Prevent duplicate calls

  useEffect(() => {
    // Prevent duplicate calls (especially important with React.StrictMode)
    if (loadingRef.current) {
      return;
    }
    const loadCustomers = async () => {
      loadingRef.current = true;
      try {
        const data = await adminApi.getCustomers();
        setCustomers(data);
        setFilteredCustomers(data);
      } catch (error) {
        console.error('Failed to load customers:', error);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };
    loadCustomers();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCustomers(customers);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(query) ||
          customer.phone.toLowerCase().includes(query) ||
          customer.address.toLowerCase().includes(query) ||
          customer.company.name.toLowerCase().includes(query)
      );
      setFilteredCustomers(filtered);
    }
  }, [searchQuery, customers]);

  const handleViewDetails = async (customerId: string) => {
    try {
      const details = await adminApi.getCustomerDetails(customerId);
      setSelectedCustomer(details);
      setDialogOpen(true);
    } catch (error) {
      console.error('Failed to load customer details:', error);
    }
  };

  const handleEdit = async (customerId: string) => {
    try {
      const details = await adminApi.getCustomerDetails(customerId);
      setEditFormData({
        name: details.name,
        phone: details.phone,
        address: details.address,
      });
      setSelectedCustomer(details);
      setEditDialogOpen(true);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load customer details');
    }
  };

  const handleUpdate = async () => {
    if (!selectedCustomer) return;
    setError('');
    try {
      const updated = await adminApi.updateCustomer(selectedCustomer.id, {
        name: editFormData.name,
        phone: editFormData.phone,
        address: editFormData.address,
      });
      setCustomers(customers.map((c) => (c.id === updated.id ? updated : c)));
      setEditDialogOpen(false);
      setSelectedCustomer(null);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update customer');
    }
  };

  const handleDeleteClick = (customerId: string) => {
    setCustomerToDelete(customerId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;
    try {
      await adminApi.deleteCustomer(customerToDelete);
      setCustomers(customers.filter((c) => c.id !== customerToDelete));
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete customer');
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Customers
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search customers by name, phone, address, or company..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
          }}
          sx={{ maxWidth: 600 }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Company</TableCell>
              <TableCell>Total Sales</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  {searchQuery ? 'No customers match your search' : 'No customers found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>{customer.name}</TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell>{customer.address}</TableCell>
                  <TableCell>{customer.company.name}</TableCell>
                  <TableCell>
                    <Chip label={customer._count.sales} color="primary" size="small" />
                  </TableCell>
                  <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(customer.id)}
                      color="primary"
                      title="View Details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(customer.id)}
                      color="warning"
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(customer.id)}
                      color="error"
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Customer Details</DialogTitle>
        <DialogContent>
          {selectedCustomer && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Name
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedCustomer.name}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Phone
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedCustomer.phone}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Address
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedCustomer.address}
              </Typography>

              <Typography variant="body2" color="text.secondary">
                Company
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {selectedCustomer.company?.name} ({selectedCustomer.company?.email})
              </Typography>

              {selectedCustomer.sales && selectedCustomer.sales.length > 0 && (
                <>
                  <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                    Sales History ({selectedCustomer.sales.length})
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Order No</TableCell>
                          <TableCell>Frame</TableCell>
                          <TableCell>Lens</TableCell>
                          <TableCell>Total</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Delivery Date</TableCell>
                          <TableCell>Created</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedCustomer.sales.map((sale: any) => (
                          <TableRow key={sale.id}>
                            <TableCell>{sale.orderNo}</TableCell>
                            <TableCell>{sale.frame}</TableCell>
                            <TableCell>{sale.lens}</TableCell>
                            <TableCell>${sale.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Chip
                                label={sale.status}
                                size="small"
                                color={
                                  sale.status === 'completed'
                                    ? 'success'
                                    : sale.status === 'pending'
                                    ? 'warning'
                                    : 'default'
                                }
                              />
                            </TableCell>
                            <TableCell>
                              {sale.deliveryDate
                                ? new Date(sale.deliveryDate).toLocaleDateString()
                                : 'N/A'}
                            </TableCell>
                            <TableCell>{new Date(sale.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Customer</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Customer Name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Address"
                multiline
                rows={3}
                value={editFormData.address}
                onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Update
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Customer</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this customer? This action cannot be undone and will delete all associated sales records.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

