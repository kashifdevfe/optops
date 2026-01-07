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
  Card,
  CardContent,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  TextField,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import { adminApi } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

interface Company {
  id: string;
  name: string;
  email: string;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  isActive: boolean;
  ecommerceEnabled?: boolean;
  createdAt: string;
  _count: {
    customers: number;
    sales: number;
    inventoryItems: number;
    users: number;
  };
}

export const AdminCompaniesPage: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    address: '',
    phone: '',
    whatsapp: '',
    isActive: true,
    ecommerceEnabled: false,
    password: '',
  });
  const [error, setError] = useState('');
  const loadingRef = useRef(false); // Prevent duplicate calls

  useEffect(() => {
    // Prevent duplicate calls (especially important with React.StrictMode)
    if (loadingRef.current) {
      return;
    }
    const loadCompanies = async () => {
      loadingRef.current = true;
      try {
        const data = await adminApi.getCompanies();
        setCompanies(data);
        setFilteredCompanies(data);
      } catch (error) {
        console.error('Failed to load companies:', error);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };
    loadCompanies();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCompanies(companies);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = companies.filter(
        (company) =>
          company.name.toLowerCase().includes(query) ||
          company.email.toLowerCase().includes(query) ||
          (company.phone && company.phone.toLowerCase().includes(query)) ||
          (company.address && company.address.toLowerCase().includes(query))
      );
      setFilteredCompanies(filtered);
    }
  }, [searchQuery, companies]);

  const handleViewDetails = async (companyId: string) => {
    try {
      const details = await adminApi.getCompanyDetails(companyId);
      setSelectedCompany(details);
      setDialogOpen(true);
    } catch (error) {
      console.error('Failed to load company details:', error);
    }
  };

  const handleEdit = async (companyId: string) => {
    try {
      const details = await adminApi.getCompanyDetails(companyId);
      setEditFormData({
        name: details.name,
        email: details.email,
        address: details.address || '',
        phone: details.phone || '',
        whatsapp: details.whatsapp || '',
        isActive: details.isActive,
        ecommerceEnabled: details.ecommerceEnabled || false,
        password: '',
      });
      setSelectedCompany(details);
      setEditDialogOpen(true);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to load company details');
    }
  };

  const handleUpdate = async () => {
    if (!selectedCompany) return;
    setError('');
    try {
      const updateData: any = {
        name: editFormData.name,
        email: editFormData.email,
        address: editFormData.address || null,
        phone: editFormData.phone || null,
        whatsapp: editFormData.whatsapp || null,
        isActive: editFormData.isActive,
        ecommerceEnabled: editFormData.ecommerceEnabled,
      };
      
      // Only include password if it's provided
      if (editFormData.password.trim() !== '') {
        updateData.password = editFormData.password;
      }
      
      const updated = await adminApi.updateCompany(selectedCompany.id, updateData);
      setCompanies(companies.map((c) => (c.id === updated.id ? updated : c)));
      setEditDialogOpen(false);
      setSelectedCompany(null);
      setEditFormData({ ...editFormData, password: '' }); // Clear password field
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to update company');
    }
  };

  const handleDeleteClick = (companyId: string) => {
    setCompanyToDelete(companyId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!companyToDelete) return;
    try {
      await adminApi.deleteCompany(companyToDelete);
      setCompanies(companies.filter((c) => c.id !== companyToDelete));
      setDeleteDialogOpen(false);
      setCompanyToDelete(null);
    } catch (error: any) {
      setError(error.response?.data?.error || 'Failed to delete company');
      setDeleteDialogOpen(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Companies
      </Typography>

      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search companies by name, email, phone, or address..."
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
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Customers</TableCell>
              <TableCell>Sales</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Ecommerce</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredCompanies.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} align="center">
                  {searchQuery ? 'No companies match your search' : 'No companies found'}
                </TableCell>
              </TableRow>
            ) : (
              filteredCompanies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell>{company.name}</TableCell>
                  <TableCell>{company.email}</TableCell>
                  <TableCell>{company.phone || 'N/A'}</TableCell>
                  <TableCell>{company._count.customers}</TableCell>
                  <TableCell>{company._count.sales}</TableCell>
                  <TableCell>
                    <Chip
                      label={company.isActive ? 'Active' : 'Inactive'}
                      color={company.isActive ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={company.ecommerceEnabled ? 'Enabled' : 'Disabled'}
                      color={company.ecommerceEnabled ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(company.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(company.id)}
                      color="primary"
                      title="View Details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(company.id)}
                      color="warning"
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(company.id)}
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
        <DialogTitle>Company Details</DialogTitle>
        <DialogContent>
          {selectedCompany && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Name
                </Typography>
                <Typography variant="body1">{selectedCompany.name}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Email
                </Typography>
                <Typography variant="body1">{selectedCompany.email}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{selectedCompany.phone || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  WhatsApp
                </Typography>
                <Typography variant="body1">{selectedCompany.whatsapp || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1">{selectedCompany.address || 'N/A'}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                  Statistics
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h4">{selectedCompany._count?.customers || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Customers
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h4">{selectedCompany._count?.sales || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Sales
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h4">{selectedCompany._count?.inventoryItems || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Inventory Items
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Card>
                      <CardContent>
                        <Typography variant="h4">{selectedCompany._count?.users || 0}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Users
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Grid>
              {selectedCompany.customers && selectedCompany.customers.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                    Recent Customers ({selectedCompany.customers.length})
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Name</TableCell>
                          <TableCell>Phone</TableCell>
                          <TableCell>Sales</TableCell>
                          <TableCell>Created</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedCompany.customers.slice(0, 5).map((customer: any) => (
                          <TableRow key={customer.id}>
                            <TableCell>{customer.name}</TableCell>
                            <TableCell>{customer.phone}</TableCell>
                            <TableCell>{customer._count?.sales || 0}</TableCell>
                            <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Grid>
              )}
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Company</DialogTitle>
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
                label="Company Name"
                value={editFormData.name}
                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={editFormData.phone}
                onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="WhatsApp"
                value={editFormData.whatsapp}
                onChange={(e) => setEditFormData({ ...editFormData, whatsapp: e.target.value })}
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
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormData.isActive}
                    onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                  />
                }
                label="Active"
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormData.ecommerceEnabled}
                    onChange={(e) => setEditFormData({ ...editFormData, ecommerceEnabled: e.target.checked })}
                  />
                }
                label="Ecommerce Management Enabled"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="New Password (leave empty to keep current password)"
                type="password"
                value={editFormData.password}
                onChange={(e) => setEditFormData({ ...editFormData, password: e.target.value })}
                helperText="Only fill this if you want to change the password"
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
        <DialogTitle>Delete Company</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this company? This action cannot be undone and will delete all associated data (customers, sales, inventory, etc.).
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

