import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardMedia,
  Button,
  Chip,
  TextField,
  Divider,
} from '@mui/material';
import { productApi } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';

export const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      setLoading(true);
      const data = await productApi.getProduct(id!);
      setProduct(data);
    } catch (error) {
      console.error('Failed to load product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      navigate('/cart');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!product) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Product not found</Typography>
      </Container>
    );
  }

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
    <Box sx={{ bgcolor: '#FFFFFF', minHeight: '100vh', py: { xs: 4, md: 8 }, position: 'relative' }}>
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
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={6}>
          <Grid item xs={12} md={6}>
            <Card
              sx={{
                borderRadius: '12px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                overflow: 'hidden',
              }}
            >
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '100%',
                  overflow: 'hidden',
                  bgcolor: '#F5F7FA',
                }}
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
                }}
                onError={(e) => {
                  // Fallback to placeholder if image fails to load
                  (e.target as HTMLImageElement).src = '/placeholder.jpg';
                }}
              />
              </Box>
            </Card>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box>
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  mb: 3,
                  letterSpacing: '-0.02em',
                  fontSize: { xs: '2rem', md: '2.5rem' },
                  color: '#1A1A1A',
                }}
              >
                {product.name}
              </Typography>
            <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
              <Chip 
                label={product.category} 
                sx={{
                  bgcolor: 'rgba(212, 175, 55, 0.1)',
                  color: 'primary.main',
                  fontWeight: 600,
                }}
              />
              {product.gender && (
                <Chip 
                  label={product.gender}
                  sx={{
                    bgcolor: '#F5F7FA',
                    color: '#666666',
                    fontWeight: 500,
                  }}
                />
              )}
              {product.featured && (
                <Chip 
                  label="Featured"
                  sx={{
                    bgcolor: 'rgba(212, 175, 55, 0.15)',
                    color: 'primary.main',
                    fontWeight: 600,
                  }}
                />
              )}
            </Box>
            <Typography
              variant="h4"
              color="primary.main"
              sx={{ fontWeight: 700, mb: 4, fontSize: { xs: '2rem', md: '2.5rem' } }}
            >
              Rs {product.price.toLocaleString()}
            </Typography>
            <Divider sx={{ my: 3 }} />
            {product.description && (
              <Typography variant="body1" sx={{ mb: 3 }}>
                {product.description}
              </Typography>
            )}
            <Box sx={{ mb: 3 }}>
              {product.frameType && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Frame Type:</strong> {product.frameType}
                </Typography>
              )}
              {product.lensType && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Lens Type:</strong> {product.lensType}
                </Typography>
              )}
              {product.frameSize && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Frame Size:</strong> {product.frameSize}
                </Typography>
              )}
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Stock:</strong> {product.inStock ? `${product.stockCount} available` : 'Out of Stock'}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 3 }}>
              <TextField
                type="number"
                label="Quantity"
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                inputProps={{ min: 1, max: product.stockCount }}
                sx={{ 
                  width: 120,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '8px',
                  },
                }}
              />
            </Box>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleAddToCart}
              disabled={!product.inStock || quantity > product.stockCount}
              sx={{
                py: 2,
                mb: 2,
                borderRadius: '8px',
                bgcolor: 'primary.main',
                color: '#000000',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                '&:hover': {
                  bgcolor: 'primary.dark',
                  boxShadow: '0 6px 16px rgba(212, 175, 55, 0.4)',
                  transform: 'translateY(-2px)',
                },
                '&:disabled': {
                  bgcolor: '#E0E0E0',
                  color: '#9E9E9E',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Add to Cart
            </Button>
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => {
                addToCart(product, quantity);
                navigate('/checkout?customOrder=true');
              }}
              disabled={!product.inStock || quantity > product.stockCount}
              sx={{
                py: 2,
                borderRadius: '8px',
                borderColor: 'primary.main',
                borderWidth: '2px',
                color: 'primary.main',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                '&:hover': {
                  borderColor: 'primary.dark',
                  borderWidth: '2px',
                  bgcolor: 'rgba(212, 175, 55, 0.08)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.2)',
                },
                '&:disabled': {
                  borderColor: '#E0E0E0',
                  color: '#9E9E9E',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              Order with Prescription
            </Button>
          </Box>
        </Grid>
      </Grid>
      </Container>
    </Box>
  );
};

