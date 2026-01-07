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
  Chip,
} from '@mui/material';
import { productApi } from '../services/api';
import { Product } from '../types';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import logoImage from '../assets/isbopt.png';

export const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    const loadFeatured = async () => {
      try {
        const products = await productApi.getProducts({ featured: true });
        setFeaturedProducts(products.slice(0, 6));
      } catch (error) {
        console.error('Failed to load featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    loadFeatured();
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
  };

  return (
    <Box sx={{ backgroundColor: '#FFFFFF', position: 'relative' }}>
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
      <Box
        sx={{
          position: 'relative',
          minHeight: { xs: '70vh', md: '85vh' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFFFFF',
          overflow: 'hidden',
          zIndex: 1,
        }}
      >
        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <Box
            component="img"
            src={logoImage}
            alt="Islamabad Optics Logo"
            sx={{
              maxWidth: { xs: '280px', md: '400px' },
              height: 'auto',
              mb: 4,
              mx: 'auto',
              display: 'block',
              filter: 'drop-shadow(0 4px 20px rgba(212, 175, 55, 0.3))',
            }}
          />
          <Typography
            variant="h5"
            sx={{
              mb: 6,
              color: '#666666',
              maxWidth: '700px',
              mx: 'auto',
              fontWeight: 400,
              letterSpacing: '0.02em',
              fontSize: { xs: '1rem', md: '1.25rem' },
            }}
          >
            Premium Eyewear for the Modern Visionary
          </Typography>
          <Button
            variant="contained"
            size="large"
            sx={{
              px: 5,
              py: 1.75,
              fontSize: '1rem',
              letterSpacing: '0.02em',
              borderRadius: '8px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
              '&:hover': {
                boxShadow: '0 6px 16px rgba(212, 175, 55, 0.4)',
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
            onClick={() => navigate('/products')}
          >
            Explore Collection
          </Button>
        </Container>
      </Box>

      <Container maxWidth="xl" sx={{ py: { xs: 6, md: 12 }, position: 'relative', zIndex: 1 }}>
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontWeight: 700,
              mb: 2,
              letterSpacing: '-0.02em',
              color: '#1A1A1A',
              fontSize: { xs: '2rem', md: '2.5rem' },
            }}
          >
            Featured Collection
          </Typography>
          <Box
            sx={{
              width: 60,
              height: 4,
              bgcolor: 'primary.main',
              mx: 'auto',
              borderRadius: '2px',
            }}
          />
        </Box>
        {loading ? (
          <Typography align="center">Loading...</Typography>
        ) : featuredProducts.length === 0 ? (
          <Typography align="center" color="text.secondary">
            No featured products available
          </Typography>
        ) : (
          <Grid container spacing={4}>
            {featuredProducts.map((product) => {
              // Parse images similar to ProductsPage
              const parseImage = (images: string): string => {
                if (!images || !images.trim()) return '/placeholder.jpg';
                
                // If already a data URL or http URL, return as is
                if (images.startsWith('data:') || images.startsWith('http')) {
                  return images;
                }
                
                try {
                  // Try to parse as JSON
                  const parsed = JSON.parse(images);
                  let imageUrl = '';
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    imageUrl = parsed[0];
                  } else {
                    imageUrl = parsed;
                  }
                  
                  if (!imageUrl) return '/placeholder.jpg';
                  
                  // If it's a base64 string without prefix, add it
                  if (!imageUrl.startsWith('data:') && !imageUrl.startsWith('http')) {
                    const trimmed = imageUrl.trim();
                    if (trimmed.startsWith('/9j/') || trimmed.startsWith('iVBORw') || trimmed.length > 100) {
                      return `data:image/jpeg;base64,${trimmed}`;
                    }
                  }
                  return imageUrl;
                } catch {
                  // Not JSON, try comma-separated or single base64
                  if (images.includes(',')) {
                    const imageArray = images.split(',').filter(Boolean);
                    const firstImage = imageArray[0]?.trim() || '';
                    if (!firstImage) return '/placeholder.jpg';
                    if (firstImage.startsWith('data:') || firstImage.startsWith('http')) {
                      return firstImage;
                    }
                    if (firstImage.startsWith('/9j/') || firstImage.startsWith('iVBORw') || firstImage.length > 100) {
                      return `data:image/jpeg;base64,${firstImage}`;
                    }
                    return firstImage;
                  }
                  
                  // Single base64 string
                  const trimmed = images.trim();
                  if (trimmed.startsWith('data:') || trimmed.startsWith('http')) {
                    return trimmed;
                  }
                  if (trimmed.startsWith('/9j/') || trimmed.startsWith('iVBORw') || trimmed.length > 100) {
                    return `data:image/jpeg;base64,${trimmed}`;
                  }
                  return trimmed || '/placeholder.jpg';
                }
              };
              
              const imageUrl = parseImage(product.images);
              return (
                <Grid item xs={12} sm={6} md={4} key={product.id}>
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
                      }}
                    >
                      <Box
                        component="img"
                        src={imageUrl}
                        alt={product.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/placeholder.jpg';
                        }}
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
                        sx={{ fontWeight: 700, fontSize: '1.25rem', mb: 2 }}
                      >
                        Rs {product.price.toLocaleString()}
                      </Typography>
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
                          bgcolor: 'primary.main',
                          color: '#000000',
                          fontWeight: 600,
                          textTransform: 'none',
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

