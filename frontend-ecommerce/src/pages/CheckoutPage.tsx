import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Grid,
  Divider,
  FormControlLabel,
  Switch,
  Collapse,
} from '@mui/material';
import { useCart } from '../context/CartContext';
import { orderApi } from '../services/api';

export const CheckoutPage = () => {
  const { cart, getTotalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [isCustomOrder, setIsCustomOrder] = useState(searchParams.get('customOrder') === 'true');
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    prescriptionNotes: '',
    rightEyeSphere: '',
    rightEyeCylinder: '',
    rightEyeAxis: '',
    leftEyeSphere: '',
    leftEyeCylinder: '',
    leftEyeAxis: '',
    nearAdd: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData: any = {
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        prescriptionNotes: formData.prescriptionNotes || undefined,
        items: cart.map((item) => ({
          productId: item.product.id,
          quantity: item.quantity,
        })),
      };

      if (isCustomOrder) {
        orderData.isCustomOrder = true;
        if (formData.rightEyeSphere) orderData.rightEyeSphere = formData.rightEyeSphere;
        if (formData.rightEyeCylinder) orderData.rightEyeCylinder = formData.rightEyeCylinder;
        if (formData.rightEyeAxis) orderData.rightEyeAxis = formData.rightEyeAxis;
        if (formData.leftEyeSphere) orderData.leftEyeSphere = formData.leftEyeSphere;
        if (formData.leftEyeCylinder) orderData.leftEyeCylinder = formData.leftEyeCylinder;
        if (formData.leftEyeAxis) orderData.leftEyeAxis = formData.leftEyeAxis;
        if (formData.nearAdd) orderData.nearAdd = formData.nearAdd;
      }

      const order = await orderApi.createOrder(orderData);
      clearCart();
      navigate(`/order-confirmation/${order.id}`);
    } catch (error: any) {
      console.error('Failed to create order:', error);
      alert(error.response?.data?.error || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
          Checkout
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Card
                sx={{
                  borderRadius: '12px',
                  border: '1px solid rgba(0, 0, 0, 0.08)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                  backgroundColor: '#FFFFFF',
                }}
              >
                <CardContent>
                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                  Customer Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Full Name"
                      required
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Phone Number"
                      required
                      value={formData.customerPhone}
                      onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Address"
                      required
                      multiline
                      rows={3}
                      value={formData.customerAddress}
                      onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Prescription Notes (Optional)"
                      multiline
                      rows={4}
                      value={formData.prescriptionNotes}
                      onChange={(e) => setFormData({ ...formData, prescriptionNotes: e.target.value })}
                      placeholder="Please provide any prescription details or special requirements..."
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          borderRadius: '8px',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Divider sx={{ my: 3, borderColor: 'rgba(212, 175, 55, 0.2)' }} />
                    <Box sx={{ 
                      p: 2.5, 
                      bgcolor: 'rgba(212, 175, 55, 0.05)', 
                      border: '1px solid rgba(212, 175, 55, 0.2)',
                      borderRadius: '8px',
                    }}>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={isCustomOrder}
                            onChange={(e) => setIsCustomOrder(e.target.checked)}
                            color="primary"
                            sx={{
                              '& .MuiSwitch-switchBase.Mui-checked': {
                                color: '#D4AF37',
                              },
                              '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                                backgroundColor: '#D4AF37',
                              },
                            }}
                          />
                        }
                        label={
                          <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            Custom Order with Prescription
                          </Typography>
                        }
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, ml: 4.5 }}>
                        Enable this option to add your eye prescription details for custom lenses
                      </Typography>
                    </Box>
                  </Grid>
                  <Collapse in={isCustomOrder}>
                    <Grid item xs={12}>
                      <Box sx={{ mt: 3, mb: 3 }}>
                        <Typography 
                          variant="h6" 
                          sx={{ 
                            fontWeight: 700, 
                            mb: 3,
                            p: 2,
                            color: 'primary.main',
                            textTransform: 'uppercase',
                            letterSpacing: '0.1em',
                            fontSize: '1rem',
                          }}
                        >
                          Eye Prescription Details
                        </Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ 
                        p: 2, 
                        mb: 2, 
                        bgcolor: 'rgba(212, 175, 55, 0.03)',
                        border: '1px solid rgba(212, 175, 55, 0.1)',
                      }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            mb: 2, 
                            fontWeight: 600,
                            color: 'text.primary',
                            fontSize: '0.95rem',
                          }}
                        >
                          Right Eye (OD)
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Sphere"
                              type="number"
                              value={formData.rightEyeSphere}
                              onChange={(e) => setFormData({ ...formData, rightEyeSphere: e.target.value })}
                              placeholder="e.g., -2.50"
                              inputProps={{ step: '0.25' }}
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Cylinder"
                              type="number"
                              value={formData.rightEyeCylinder}
                              onChange={(e) => setFormData({ ...formData, rightEyeCylinder: e.target.value })}
                              placeholder="e.g., -0.75"
                              inputProps={{ step: '0.25' }}
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Axis"
                              type="number"
                              value={formData.rightEyeAxis}
                              onChange={(e) => setFormData({ ...formData, rightEyeAxis: e.target.value })}
                              placeholder="e.g., 180"
                              inputProps={{ min: 0, max: 180 }}
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                    <Grid item xs={12}>
                      <Box sx={{ 
                        p: 2.5, 
                        mb: 2, 
                        bgcolor: 'rgba(212, 175, 55, 0.03)',
                        border: '1px solid rgba(212, 175, 55, 0.1)',
                        borderRadius: '8px',
                      }}>
                        <Typography 
                          variant="subtitle1" 
                          sx={{ 
                            mb: 2, 
                            fontWeight: 600,
                            color: '#1A1A1A',
                            fontSize: '0.95rem',
                          }}
                        >
                          Left Eye (OS)
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Sphere"
                              type="number"
                              value={formData.leftEyeSphere}
                              onChange={(e) => setFormData({ ...formData, leftEyeSphere: e.target.value })}
                              placeholder="e.g., -2.50"
                              inputProps={{ step: '0.25' }}
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Cylinder"
                              type="number"
                              value={formData.leftEyeCylinder}
                              onChange={(e) => setFormData({ ...formData, leftEyeCylinder: e.target.value })}
                              placeholder="e.g., -0.75"
                              inputProps={{ step: '0.25' }}
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                },
                              }}
                            />
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <TextField
                              fullWidth
                              label="Axis"
                              type="number"
                              value={formData.leftEyeAxis}
                              onChange={(e) => setFormData({ ...formData, leftEyeAxis: e.target.value })}
                              placeholder="e.g., 180"
                              inputProps={{ min: 0, max: 180 }}
                              size="small"
                              sx={{
                                '& .MuiOutlinedInput-root': {
                                  borderRadius: '8px',
                                },
                              }}
                            />
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="Near Add (Optional)"
                        type="number"
                        value={formData.nearAdd}
                        onChange={(e) => setFormData({ ...formData, nearAdd: e.target.value })}
                        placeholder="e.g., +2.00"
                        inputProps={{ step: '0.25' }}
                        sx={{ 
                          mt: 3, 
                          ml: { sm: 2 },
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                          },
                        }}
                      />
                    </Grid>
                  </Collapse>
                </Grid>
              </CardContent>
            </Card>
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
                {cart.map((item) => (
                  <Box key={item.product.id} sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {item.product.name} x {item.quantity}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rs {(item.product.price * item.quantity).toLocaleString()}
                    </Typography>
                  </Box>
                ))}
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
                  type="submit"
                  variant="contained"
                  fullWidth
                  size="large"
                  disabled={loading}
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
                    '&:disabled': {
                      bgcolor: '#E0E0E0',
                      color: '#9E9E9E',
                    },
                    transition: 'all 0.2s ease-in-out',
                  }}
                >
                  {loading ? 'Placing Order...' : 'Place Order'}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </form>
      </Container>
    </Box>
  );
};


