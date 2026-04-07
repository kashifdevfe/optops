import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { categoryApi } from '../../services/api.js';
import type { Category, CreateCategoryDto, UpdateCategoryDto } from '../../types/index.js';

interface CategoryManagerProps {
  open: boolean;
  onClose: () => void;
  onCategoryChange: () => void;
}

export const CategoryManager: React.FC<CategoryManagerProps> = ({ open, onClose, onCategoryChange }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<{ name: string; type?: string }>({ name: '', type: undefined });
  const [typeMode, setTypeMode] = useState<'none' | 'frame' | 'lens' | 'custom'>('none');
  const [customType, setCustomType] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (open) {
      loadCategories();
    }
  }, [open]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryApi.getCategories();
      setCategories(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      const existingType = category.type || undefined;
      setFormData({ name: category.name, type: existingType });
      if (!existingType) {
        setTypeMode('none');
        setCustomType('');
      } else if (existingType === 'Frame') {
        setTypeMode('frame');
        setCustomType('');
      } else if (existingType === 'Lens') {
        setTypeMode('lens');
        setCustomType('');
      } else {
        setTypeMode('custom');
        setCustomType(existingType);
      }
    } else {
      setEditingCategory(null);
      setFormData({ name: '', type: undefined });
      setTypeMode('none');
      setCustomType('');
    }
    setDialogOpen(true);
    setError(null);
    setSuccess(false);
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditingCategory(null);
    setFormData({ name: '', type: undefined });
    setTypeMode('none');
    setCustomType('');
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async () => {
    try {
      setError(null);
      setSuccess(false);

      if (editingCategory) {
        await categoryApi.updateCategory(editingCategory.id, formData as UpdateCategoryDto);
      } else {
        await categoryApi.createCategory(formData as CreateCategoryDto);
      }

      setSuccess(true);
      setTimeout(() => {
        handleClose();
        loadCategories();
        onCategoryChange();
      }, 1000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category? This action cannot be undone if there are inventory items in this category.')) {
      return;
    }

    try {
      await categoryApi.deleteCategory(id);
      loadCategories();
      onCategoryChange();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete category');
    }
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>Manage Categories</DialogTitle>
        <DialogContent>
          <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpen()}>
              Add Category
            </Button>
          </Box>

          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>NAME</TableCell>
                  <TableCell>TYPE</TableCell>
                  <TableCell align="right">ITEMS COUNT</TableCell>
                  <TableCell align="right">ACTIONS</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell>{category.name}</TableCell>
                    <TableCell>{category.type || '-'}</TableCell>
                    <TableCell align="right">{category._count?.items || 0}</TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => handleOpen(category)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(category.id)}
                        color="error"
                        disabled={(category._count?.items || 0) > 0}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={dialogOpen} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingCategory ? 'Edit Category' : 'Add Category'}</DialogTitle>
        <DialogContent>
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Category {editingCategory ? 'updated' : 'created'} successfully
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
                label="Category Name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                required
                autoFocus
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Type (for Sales)</InputLabel>
                <Select
                  value={typeMode}
                  onChange={(e) => {
                    const mode = e.target.value as 'none' | 'frame' | 'lens' | 'custom';
                    setTypeMode(mode);
                    if (mode === 'none') {
                      setCustomType('');
                      setFormData((prev) => ({ ...prev, type: undefined }));
                    } else if (mode === 'frame') {
                      setCustomType('');
                      setFormData((prev) => ({ ...prev, type: 'Frame' }));
                    } else if (mode === 'lens') {
                      setCustomType('');
                      setFormData((prev) => ({ ...prev, type: 'Lens' }));
                    } else {
                      // custom
                      setFormData((prev) => ({ ...prev, type: customType.trim() || undefined }));
                    }
                  }}
                  label="Type (for Sales)"
                >
                  <MenuItem value="none">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value="frame">Frame</MenuItem>
                  <MenuItem value="lens">Lens</MenuItem>
                  <MenuItem value="custom">Custom</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {typeMode === 'custom' && (
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Custom Type"
                  value={customType}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomType(val);
                    setFormData((prev) => ({ ...prev, type: val.trim() || undefined }));
                  }}
                  placeholder="e.g. Accessories, Solution, Service..."
                />
              </Grid>
            )}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={success || !formData.name.trim()}>
            {editingCategory ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

