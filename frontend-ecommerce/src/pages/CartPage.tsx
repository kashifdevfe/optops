import { Container, Typography, Box, Card, CardContent, Button, IconButton, Grid, Divider } from '@mui/material';
import { Delete, Add, Remove } from '@mui/icons-material';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';

export const CartPage = () => {
  const { cart, updateQuantity, removeFromCart, getTotalPrice, getTotalItems } = useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Your cart is empty
        </Typography>
        <Button variant="contained" onClick={() => navigate('/products')}>
          Continue Shopping
        </Button>
      </Container>
    );
  }

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
      <Container maxWidth="lg" sx={{ py: 4, position: 'relative', zIndex: 1 }}>
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            mb: 4, 
            fontWeight: 700,
            color: '#1A1A1A',
            fontSize: { xs: '1.75rem', md: '2rem' },
          }}
        >
          Shopping Cart
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            {cart.map((item) => {
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
            
            const imageUrl = parseImage(item.product.images);
            
            return (
              <Card 
                key={item.product.id} 
                sx={{ 
                  mb: 2,
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    <Box
                      component="img"
                      src={imageUrl}
                      alt={item.product.name}
                      sx={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 1 }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/placeholder.jpg';
                      }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                        {item.product.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        {item.product.category}
                      </Typography>
                      <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700, mb: 2 }}>
                        Rs {item.product.price.toLocaleString()}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Remove />
                        </IconButton>
                        <Typography sx={{ minWidth: 40, textAlign: 'center' }}>
                          {item.quantity}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                          disabled={item.quantity >= item.product.stockCount}
                        >
                          <Add />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => removeFromCart(item.product.id)}
                          sx={{ ml: 'auto' }}
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Grid>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              backgroundColor: '#FFFFFF',
              position: 'sticky',
              top: 20,
            }}
          >
            <CardContent>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 2, 
                  fontWeight: 700,
                  color: '#1A1A1A',
                }}
              >
                Order Summary
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography>Items ({getTotalItems()})</Typography>
                <Typography>Rs {getTotalPrice().toLocaleString()}</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Total
                </Typography>
                <Typography variant="h6" color="primary.main" sx={{ fontWeight: 700 }}>
                  Rs {getTotalPrice().toLocaleString()}
                </Typography>
              </Box>
              <Button
                variant="contained"
                fullWidth
                size="large"
                onClick={() => navigate('/checkout')}
                sx={{ 
                  py: 1.75,
                  borderRadius: '8px',
                  fontWeight: 600,
                  textTransform: 'none',
                  fontSize: '1rem',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
                  '&:hover': {
                    boxShadow: '0 6px 16px rgba(212, 175, 55, 0.4)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      </Container>
    </Box>
  );
};


