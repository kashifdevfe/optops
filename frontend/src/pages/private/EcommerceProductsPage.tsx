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
  Grid,
  Alert,
  Chip,
  Card,
  CardMedia,
  FormControlLabel,
  Switch,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { ecommerceApi, EcommerceProduct, CreateEcommerceProductDto } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';

export const EcommerceProductsPage: React.FC = () => {
  const [products, setProducts] = useState<EcommerceProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<EcommerceProduct | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<CreateEcommerceProductDto>({
    name: '',
    description: '',
    price: 0,
    images: '',
    category: 'Eyeglasses',
    gender: '',
    frameType: '',
    lensType: '',
    frameSize: '',
    inStock: true,
    stockCount: 0,
    featured: false,
  });
  const [imagePreview, setImagePreview] = useState<string>('');

  const loadingRef = useRef(false); // Prevent duplicate calls

  useEffect(() => {
    // Prevent duplicate calls (especially important with React.StrictMode)
    if (loadingRef.current) {
      return;
    }
    loadProducts();
  }, []);

  const loadProducts = async () => {
    if (loadingRef.current) return; // Prevent duplicate calls
    loadingRef.current = true;
    try {
      setLoading(true);
      const data = await ecommerceApi.getProducts();
      setProducts(data || []);
      setError('');
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError(err.response?.data?.error || 'Failed to load products');
      setProducts([]);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const compressImage = (file: File, maxWidth: number = 1200, maxHeight: number = 1200, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Calculate new dimensions
          if (width > height) {
            if (width > maxWidth) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedBase64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB before compression)
      if (file.size > 10 * 1024 * 1024) {
        setError('Image file is too large. Please select an image smaller than 10MB.');
        return;
      }

      try {
        // Compress the image
        const compressedBase64 = await compressImage(file);
        setFormData({ ...formData, images: compressedBase64 });
        setImagePreview(compressedBase64);
        setError('');
      } catch (err) {
        setError('Failed to process image. Please try again.');
        console.error('Image compression error:', err);
      }
    }
  };

  const handleOpenDialog = (product?: EcommerceProduct) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || '',
        price: product.price,
        images: product.images,
        category: product.category,
        gender: product.gender || '',
        frameType: product.frameType || '',
        lensType: product.lensType || '',
        frameSize: product.frameSize || '',
        inStock: product.inStock,
        stockCount: product.stockCount,
        featured: product.featured,
      });
      const parsedImages = parseImages(product.images);
      setImagePreview(parsedImages[0] || '');
    } else {
      setEditingProduct(null);
      setFormData({
        name: '',
        description: '',
        price: 0,
        images: '',
        category: 'Eyeglasses',
        gender: '',
        frameType: '',
        lensType: '',
        frameSize: '',
        inStock: true,
        stockCount: 0,
        featured: false,
      });
      setImagePreview('');
    }
    setDialogOpen(true);
    setError('');
    setSuccess('');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingProduct(null);
    setImagePreview('');
    // Reset form data
    setFormData({
      name: '',
      description: '',
      price: 0,
      images: '',
      category: 'Eyeglasses',
      gender: '',
      frameType: '',
      lensType: '',
      frameSize: '',
      inStock: true,
      stockCount: 0,
      featured: false,
    });
  };

  const handleSubmit = async () => {
    try {
      setError('');
      setSuccess('');
      
      // Validate required fields
      if (!formData.name || !formData.name.trim()) {
        setError('Product name is required');
        return;
      }
      
      if (formData.price <= 0) {
        setError('Price must be greater than 0');
        return;
      }
      
      if (!formData.images || !formData.images.trim()) {
        setError('Please upload an image');
        return;
      }
      
      // Prepare data - convert empty strings to null/undefined for optional fields
      const submitData: any = {
        name: formData.name.trim(),
        description: formData.description?.trim() || null,
        price: formData.price,
        images: formData.images,
        category: formData.category,
        gender: formData.gender && formData.gender.trim() ? formData.gender.trim() : null,
        frameType: formData.frameType && formData.frameType.trim() ? formData.frameType.trim() : null,
        lensType: formData.lensType && formData.lensType.trim() ? formData.lensType.trim() : null,
        frameSize: formData.frameSize && formData.frameSize.trim() ? formData.frameSize.trim() : null,
        inStock: formData.inStock,
        stockCount: formData.stockCount || 0,
        featured: formData.featured || false,
      };
      
      if (editingProduct) {
        await ecommerceApi.updateProduct(editingProduct.id, submitData);
        setSuccess('Product updated successfully');
      } else {
        await ecommerceApi.createProduct(submitData);
        setSuccess('Product created successfully');
      }
      handleCloseDialog();
      // Reload products immediately - add small delay to ensure DB transaction is committed
      setTimeout(() => {
        loadProducts();
      }, 300);
    } catch (err: any) {
      console.error('Product save error:', err);
      let errorMessage = 'Failed to save product';
      
      if (err.response?.data) {
        if (typeof err.response.data.error === 'string') {
          errorMessage = err.response.data.error;
        } else if (err.response.data.details && Array.isArray(err.response.data.details)) {
          errorMessage = err.response.data.details.map((d: any) => 
            `${d.path?.join('.') || 'field'}: ${d.message}`
          ).join(', ');
        } else if (err.response.data.error) {
          errorMessage = JSON.stringify(err.response.data.error);
        }
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      console.error('Full error response:', err.response?.data);
    }
  };

  const handleDelete = async () => {
    if (!productToDelete) return;
    try {
      await ecommerceApi.deleteProduct(productToDelete);
      setDeleteDialogOpen(false);
      setProductToDelete(null);
      loadProducts();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete product');
    }
  };

  const parseImages = (images: string): string[] => {
    if (!images || !images.trim()) return [];
    
    // If already a data URL or http URL, return as is
    if (images.startsWith('data:') || images.startsWith('http')) {
      return [images];
    }
    
    try {
      // Try to parse as JSON
      const parsed = JSON.parse(images);
      if (Array.isArray(parsed)) {
        return parsed.map(img => {
          if (!img) return '';
          // If already has data URL prefix or http, return as is
          if (img.startsWith('data:') || img.startsWith('http')) {
            return img;
          }
          // Check if it's base64 (JPEG starts with /9j/, PNG starts with iVBORw)
          if (img.startsWith('/9j/') || img.startsWith('iVBORw')) {
            return `data:image/jpeg;base64,${img}`;
          }
          // If it's a long string without prefix, assume it's base64
          if (img.length > 100) {
            return `data:image/jpeg;base64,${img}`;
          }
          return img;
        }).filter(Boolean);
      }
      // Single value in JSON
      const img = parsed;
      if (!img) return [];
      if (img.startsWith('data:') || img.startsWith('http')) {
        return [img];
      }
      if (img.startsWith('/9j/') || img.startsWith('iVBORw') || img.length > 100) {
        return [`data:image/jpeg;base64,${img}`];
      }
      return [img];
    } catch {
      // Not JSON, try comma-separated or single base64
      if (images.includes(',')) {
        return images.split(',').filter(Boolean).map(img => {
          const trimmed = img.trim();
          if (!trimmed) return '';
          if (trimmed.startsWith('data:') || trimmed.startsWith('http')) {
            return trimmed;
          }
          if (trimmed.startsWith('/9j/') || trimmed.startsWith('iVBORw') || trimmed.length > 100) {
            return `data:image/jpeg;base64,${trimmed}`;
          }
          return trimmed;
        }).filter(Boolean);
      }
      // Single base64 string - check if it needs prefix
      const trimmed = images.trim();
      if (trimmed.startsWith('data:') || trimmed.startsWith('http')) {
        return [trimmed];
      }
      // If it's a long string, assume it's base64
      if (trimmed.startsWith('/9j/') || trimmed.startsWith('iVBORw') || trimmed.length > 100) {
        return [`data:image/jpeg;base64,${trimmed}`];
      }
      return [trimmed];
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>
          Ecommerce Products
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Add Product
        </Button>
      </Box>

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
              <TableCell>Image</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Category</TableCell>
              <TableCell>Price</TableCell>
              <TableCell>Stock</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Featured</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} align="center">
                  No products found
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => {
                const images = parseImages(product.images);
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      {images[0] ? (
                        <CardMedia
                          component="img"
                          image={images[0]}
                          alt={product.name}
                          sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                          onError={(e) => {
                            console.error('Image load error:', images[0]?.substring(0, 50));
                            (e.target as HTMLImageElement).src = '/placeholder.jpg';
                          }}
                        />
                      ) : (
                        <Box sx={{ width: 60, height: 60, bgcolor: 'grey.300', borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Typography variant="caption" color="text.secondary">No Image</Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>Rs {product.price.toFixed(2)}</TableCell>
                    <TableCell>{product.stockCount}</TableCell>
                    <TableCell>
                      <Chip
                        label={product.inStock ? 'In Stock' : 'Out of Stock'}
                        color={product.inStock ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={product.featured ? 'Featured' : 'Regular'}
                        color={product.featured ? 'primary' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => handleOpenDialog(product)} color="primary">
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => {
                          setProductToDelete(product.id);
                          setDeleteDialogOpen(true);
                        }}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                multiline
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                required
                inputProps={{ min: 0, step: 0.01 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Stock Count"
                type="number"
                value={formData.stockCount}
                onChange={(e) => setFormData({ ...formData, stockCount: parseInt(e.target.value) || 0 })}
                inputProps={{ min: 0 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                SelectProps={{ native: true }}
                required
              >
                <option value="Eyeglasses">Eyeglasses</option>
                <option value="Sunglasses">Sunglasses</option>
                <option value="Contact Lenses">Contact Lenses</option>
                <option value="Frames">Frames</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                SelectProps={{ native: true }}
              >
                <option value="">Select Gender</option>
                <option value="Men">Men</option>
                <option value="Women">Women</option>
                <option value="Unisex">Unisex</option>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Frame Type"
                value={formData.frameType}
                onChange={(e) => setFormData({ ...formData, frameType: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Lens Type"
                value={formData.lensType}
                onChange={(e) => setFormData({ ...formData, lensType: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Frame Size"
                value={formData.frameSize}
                onChange={(e) => setFormData({ ...formData, frameSize: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <input
                accept="image/*"
                style={{ display: 'none' }}
                id="image-upload"
                type="file"
                onChange={handleImageUpload}
              />
              <label htmlFor="image-upload">
                <Button variant="outlined" component="span" fullWidth>
                  Upload Image
                </Button>
              </label>
              {imagePreview && (
                <Box sx={{ mt: 2 }}>
                  <Card>
                    <CardMedia
                      component="img"
                      image={imagePreview}
                      alt="Preview"
                      sx={{ maxHeight: 200, objectFit: 'contain' }}
                      onError={(e) => {
                        console.error('Preview image load error:', imagePreview?.substring(0, 50));
                        setError('Failed to load image preview. Please try uploading again.');
                        setImagePreview('');
                      }}
                    />
                  </Card>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  />
                }
                label="In Stock"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                  />
                }
                label="Featured"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" disabled={!formData.name || formData.price <= 0}>
            {editingProduct ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Product</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to delete this product? This action cannot be undone.</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDelete} variant="contained" color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

