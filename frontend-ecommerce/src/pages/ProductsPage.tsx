import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from '@mui/material';
import { productApi } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    gender: '',
    minPrice: '',
    maxPrice: '',
  });
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    loadProducts();
  }, [filters]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productApi.getProducts({
        category: filters.category || undefined,
        gender: filters.gender || undefined,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
      });
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  return (
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', position: 'relative' }}>
      {/* Subtle background pattern */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(0,0,0,0.02) 1px, transparent 0)',
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
          opacity: 0.4,
          zIndex: 0,
        }}
      />
      <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              mb: 2,
              letterSpacing: '-0.02em',
              fontSize: { xs: '2rem', md: '3rem' },
              color: '#1A1A1A',
            }}
          >
            Our Collection
          </Typography>
          <Box
            sx={{
              width: 80,
              height: 4,
              bgcolor: 'primary.main',
              mx: 'auto',
              borderRadius: '2px',
            }}
          />
        </Box>

      <Box
        sx={{
          mb: 6,
          display: 'flex',
          gap: 2,
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        <FormControl 
          sx={{ 
            minWidth: 180,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        >
          <InputLabel sx={{ color: '#666666' }}>Category</InputLabel>
          <Select
            value={filters.category}
            label="Category"
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            sx={{
              color: '#1A1A1A',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.12)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.2)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }}
          >
            <MenuItem value="">All Categories</MenuItem>
            <MenuItem value="Eyeglasses">Eyeglasses</MenuItem>
            <MenuItem value="Sunglasses">Sunglasses</MenuItem>
            <MenuItem value="Contact Lenses">Contact Lenses</MenuItem>
            <MenuItem value="Frames">Frames</MenuItem>
          </Select>
        </FormControl>
        <FormControl 
          sx={{ 
            minWidth: 180,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        >
          <InputLabel sx={{ color: '#666666' }}>Gender</InputLabel>
          <Select
            value={filters.gender}
            label="Gender"
            onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
            sx={{
              color: '#1A1A1A',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.12)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(0, 0, 0, 0.2)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: 'primary.main',
              },
            }}
          >
            <MenuItem value="">All Genders</MenuItem>
            <MenuItem value="Men">Men</MenuItem>
            <MenuItem value="Women">Women</MenuItem>
            <MenuItem value="Unisex">Unisex</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="Min Price"
          type="number"
          value={filters.minPrice}
          onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
          sx={{ 
            width: 150,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />
        <TextField
          label="Max Price"
          type="number"
          value={filters.maxPrice}
          onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
          sx={{ 
            width: 150,
            '& .MuiOutlinedInput-root': {
              borderRadius: '8px',
            },
          }}
        />
      </Box>

      {loading ? (
        <Typography align="center">Loading...</Typography>
      ) : products.length === 0 ? (
        <Typography align="center" color="text.secondary">
          No products found
        </Typography>
      ) : (
        <Grid container spacing={4}>
          {products.map((product) => {
            // Handle both base64 images and comma-separated URLs
            let imageUrl = '';
            const images = product.images || '';
            
            if (!images) {
              imageUrl = '/placeholder.jpg';
            } else if (images.startsWith('data:') || images.startsWith('http')) {
              // Already has proper prefix
              imageUrl = images;
            } else {
              try {
                // Try to parse as JSON array first
                const parsed = JSON.parse(images);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  imageUrl = parsed[0];
                } else {
                  imageUrl = parsed;
                }
              } catch {
                // If not JSON, try comma-separated
                const imageArray = images.split(',').filter(Boolean);
                imageUrl = imageArray[0] || images;
              }
              
              // If it's a base64 string without prefix, add it
              if (imageUrl && !imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
                const trimmed = imageUrl.trim();
                if (trimmed.startsWith('/9j/') || trimmed.startsWith('iVBORw') || trimmed.length > 100) {
                  imageUrl = `data:image/jpeg;base64,${trimmed}`;
                }
              }
            }

            return (
              <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                <Card
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                    overflow: 'hidden',
                    borderRadius: '12px',
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                    backgroundColor: '#FFFFFF',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      boxShadow: '0 12px 24px rgba(0, 0, 0, 0.12)',
                      transform: 'translateY(-8px)',
                    },
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: '100%',
                      paddingTop: '100%',
                      overflow: 'hidden',
                      bgcolor: '#F5F7FA',
                      borderRadius: '12px 12px 0 0',
                      cursor: 'pointer',
                    }}
                    onClick={() => navigate(`/products/${product.id}`)}
                  >
                    <Box
                      component="img"
                      src={imageUrl || '/placeholder.jpg'}
                      alt={product.name}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.5s ease',
                        '&:hover': {
                          transform: 'scale(1.1)',
                        },
                      }}
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        (e.target as HTMLImageElement).src = '/placeholder.jpg';
                      }}
                    />
                  </Box>
                  <CardContent sx={{ flexGrow: 1, p: 3 }}>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 700,
                        mb: 1,
                        fontSize: '1.125rem',
                        letterSpacing: '0.01em',
                        color: '#1A1A1A',
                      }}
                    >
                      {product.name}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ mb: 2, fontSize: '0.875rem', color: '#666666' }}
                    >
                      {product.category}
                      {product.gender && ` • ${product.gender}`}
                    </Typography>
                    <Typography
                      variant="h6"
                      color="primary.main"
                      sx={{ fontWeight: 700, fontSize: '1.25rem' }}
                    >
                      Rs {product.price.toLocaleString()}
                    </Typography>
                    {!product.inStock && (
                      <Chip
                        label="Out of Stock"
                        sx={{
                          mt: 1,
                          bgcolor: '#FFE0E0',
                          color: '#D32F2F',
                          fontSize: '0.75rem',
                          fontWeight: 600,
                        }}
                        size="small"
                      />
                    )}
                  </CardContent>
                  <CardActions sx={{ p: 3, pt: 0, flexDirection: 'column', gap: 1.5 }}>
                    <Button
                      fullWidth
                      variant="outlined"
                      onClick={() => navigate(`/products/${product.id}`)}
                      sx={{
                        borderRadius: '8px',
                        borderColor: 'rgba(0, 0, 0, 0.12)',
                        color: '#1A1A1A',
                        fontWeight: 600,
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: 'primary.main',
                          bgcolor: 'rgba(212, 175, 55, 0.08)',
                        },
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      onClick={() => handleAddToCart(product)}
                      disabled={!product.inStock}
                      sx={{
                        borderRadius: '8px',
                        textTransform: 'none',
                        fontWeight: 600,
                        bgcolor: 'primary.main',
                        color: '#000000',
                        boxShadow: '0 2px 8px rgba(212, 175, 55, 0.3)',
                        '&:hover': {
                          bgcolor: 'primary.dark',
                          boxShadow: '0 4px 12px rgba(212, 175, 55, 0.4)',
                        },
                        '&:disabled': {
                          bgcolor: '#E0E0E0',
                          color: '#9E9E9E',
                        },
                      }}
                    >
                      Add to Cart
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
      </Container>
    </Box>
  );
};

