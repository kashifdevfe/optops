import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  images: string;
  category: string;
  gender?: string;
  inStock: boolean;
  stockCount: number;
  featured: boolean;
}

export const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    images: '',
    category: 'Eyeglasses',
    gender: '',
    frameType: '',
    lensType: '',
    frameSize: '',
    inStock: true,
    stockCount: '',
    featured: false,
  });

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/ecommerce/products', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts(response.data);
    } catch (error) {
      console.error('Failed to load products:', error);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const data = {
        ...formData,
        price: parseFloat(formData.price),
        stockCount: parseInt(formData.stockCount),
      };

      if (editing) {
        await axios.patch(`/api/ecommerce/products/${editing.id}`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('/api/ecommerce/products', data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setOpen(false);
      setEditing(null);
      resetForm();
      loadProducts();
    } catch (error) {
      console.error('Failed to save product:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/ecommerce/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      loadProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      images: '',
      category: 'Eyeglasses',
      gender: '',
      frameType: '',
      lensType: '',
      frameSize: '',
      inStock: true,
      stockCount: '',
      featured: false,
    });
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
          Products
        </Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpen(true)}>
          Add Product
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Featured</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>{product.name}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell>Rs {product.price.toLocaleString()}</TableCell>
                <TableCell>{product.stockCount}</TableCell>
                <TableCell>{product.featured ? 'Yes' : 'No'}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setEditing(product);
                      setFormData({
                        name: product.name,
                        description: product.description || '',
                        price: product.price.toString(),
                        images: product.images,
                        category: product.category,
                        gender: product.gender || '',
                        frameType: '',
                        lensType: '',
                        frameSize: '',
                        inStock: product.inStock,
                        stockCount: product.stockCount.toString(),
                        featured: product.featured,
                      });
                      setOpen(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(product.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => { setOpen(false); setEditing(null); resetForm(); }} maxWidth="md" fullWidth>
        <DialogTitle>{editing ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <TextField
              fullWidth
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Images (comma-separated URLs)"
              value={formData.images}
              onChange={(e) => setFormData({ ...formData, images: e.target.value })}
              required
            />
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={formData.category}
                label="Category"
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <MenuItem value="Eyeglasses">Eyeglasses</MenuItem>
                <MenuItem value="Sunglasses">Sunglasses</MenuItem>
                <MenuItem value="Contact Lenses">Contact Lenses</MenuItem>
                <MenuItem value="Frames">Frames</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                label="Gender"
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Men">Men</MenuItem>
                <MenuItem value="Women">Women</MenuItem>
                <MenuItem value="Unisex">Unisex</MenuItem>
              </Select>
            </FormControl>
            <TextField
              fullWidth
              label="Stock Count"
              type="number"
              value={formData.stockCount}
              onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                />
              }
              label="In Stock"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={formData.featured}
                  onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                />
              }
              label="Featured"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setOpen(false); setEditing(null); resetForm(); }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained">
            {editing ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};


