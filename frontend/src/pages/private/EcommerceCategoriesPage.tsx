import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Typography,
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
  Chip,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import { ecommerceCategoryApi } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

interface EcommerceCategory {
  id: string;
  name: string;
  type: string | null;
}

export const EcommerceCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<EcommerceCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<EcommerceCategory | null>(null);
  const [editingCategory, setEditingCategory] = useState<EcommerceCategory | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadingRef = useRef(false);

  useEffect(() => {
    if (loadingRef.current) return;
    loadCategories();
  }, []);

  const loadCategories = async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    try {
      setLoading(true);
      const data = await ecommerceCategoryApi.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load categories');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleOpenDialog = (category?: EcommerceCategory) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
    } else {
      setEditingCategory(null);
      setName('');
    }
    setError('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setName('');
    setError('');
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Category name is required');
      return;
    }
    try {
      setError('');
      if (editingCategory) {
        await ecommerceCategoryApi.updateCategory(editingCategory.id, name.trim());
        setSuccess('Category updated successfully');
      } else {
        await ecommerceCategoryApi.createCategory(name.trim());
        setSuccess('Category created successfully');
      }
      handleCloseDialog();
      loadingRef.current = false;
      loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save category');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!categoryToDelete) return;
    try {
      await ecommerceCategoryApi.deleteCategory(categoryToDelete.id);
      setSuccess('Category deleted successfully');
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      loadingRef.current = false;
      loadCategories();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete category');
      setDeleteDialogOpen(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <CategoryIcon sx={{ color: 'primary.main', fontSize: 32 }} />
          <Typography variant="h4" sx={{ fontWeight: 700 }}>
            Ecommerce Categories
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Add Category
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Manage the categories used in your ecommerce store. These categories appear as dropdown options when adding or editing products.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Category Name</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 6 }}>
                  <CategoryIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1, display: 'block', mx: 'auto' }} />
                  <Typography color="text.secondary">
                    No ecommerce categories yet. Click "Add Category" to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat, index) => (
                <TableRow key={cat.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Typography fontWeight={600}>{cat.name}</Typography>
                  </TableCell>
                  <TableCell>
                    <Chip label="Ecommerce" color="primary" size="small" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(cat)}
                      title="Edit"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => {
                        setCategoryToDelete(cat);
                        setDeleteDialogOpen(true);
                      }}
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

      {/* Add / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="xs" fullWidth>
        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            fullWidth
            label="Category Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            sx={{ mt: 1 }}
            placeholder="e.g. Eyeglasses, Sunglasses, Contact Lenses…"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={!name.trim()}
          >
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Category</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{categoryToDelete?.name}</strong>?
            Products using this category will keep their current category value.
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
