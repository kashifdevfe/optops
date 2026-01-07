import React, { useState, useEffect, useRef } from 'react';
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
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Alert,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { ecommerceApi, EcommerceOrder } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { useAppSelector } from '../../hooks/redux.js';

export const EcommerceOrdersPage: React.FC = () => {
  const { company } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<EcommerceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<EcommerceOrder | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const loadingRef = useRef(false); // Prevent duplicate calls

  useEffect(() => {
    // Prevent duplicate calls (especially important with React.StrictMode)
    if (loadingRef.current) {
      return;
    }
    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (loadingRef.current) return; // Prevent duplicate calls
    loadingRef.current = true;
    try {
      setLoading(true);
      const data = await ecommerceApi.getOrders();
      setOrders(data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load orders');
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  };

  const handleViewDetails = async (orderId: string) => {
    try {
      const order = await ecommerceApi.getOrder(orderId);
      setSelectedOrder(order);
      setDialogOpen(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to load order details');
    }
  };

  const handleDelivered = (order: EcommerceOrder) => {
    // Format phone number (remove any non-numeric characters except +)
    let phoneNumber = order.customerPhone.replace(/[^\d+]/g, '');
    
    // If phone doesn't start with +, assume it's a local number and add country code
    // You may need to adjust this based on your country code (92 for Pakistan)
    if (!phoneNumber.startsWith('+')) {
      // Remove leading 0 if present
      if (phoneNumber.startsWith('0')) {
        phoneNumber = phoneNumber.substring(1);
      }
      phoneNumber = `92${phoneNumber}`; // Pakistan country code, adjust as needed
    } else {
      phoneNumber = phoneNumber.substring(1); // Remove + for WhatsApp URL
    }

    // Create delivery message with company name and amount
    const companyName = company?.name || 'Our Company';
    const amount = order.totalAmount.toFixed(2);
    const message = `Hello ${order.customerName}, we have sent your order #${order.orderNumber}. You will receive it in 5-7 working days. Amount: Rs ${amount}. Thank you for your purchase!\n\n${companyName}`;

    // Encode message for URL
    const encodedMessage = encodeURIComponent(message);
    
    // Open WhatsApp with pre-filled message
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleCompleted = async (orderId: string) => {
    try {
      await ecommerceApi.updateOrderStatus(orderId, 'completed');
      loadOrders(); // Reload orders to reflect the status change
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to mark order as completed');
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 3, fontWeight: 700 }}>
        Ecommerce Orders
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Number</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Total Amount</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No orders found
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell>{order.orderNumber}</TableCell>
                  <TableCell>{order.customerName}</TableCell>
                  <TableCell>{order.customerPhone}</TableCell>
                  <TableCell>Rs {order.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={order.isCustomOrder ? 'Custom' : 'Regular'}
                      color={order.isCustomOrder ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton 
                      size="small" 
                      onClick={() => handleViewDetails(order.id)} 
                      color="primary"
                      sx={{ mr: 1 }}
                      title="View Details"
                    >
                      <VisibilityIcon />
                    </IconButton>
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      onClick={() => handleDelivered(order)}
                      sx={{ textTransform: 'none', mr: 1 }}
                    >
                      Delivered
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      onClick={() => handleCompleted(order.id)}
                      disabled={order.status === 'completed'}
                      sx={{ textTransform: 'none' }}
                    >
                      {order.status === 'completed' ? 'Completed' : 'Mark Completed'}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Details Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Order Details - {selectedOrder?.orderNumber}</DialogTitle>
        <DialogContent>
          {selectedOrder && (
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Customer Name
                </Typography>
                <Typography variant="body1">{selectedOrder.customerName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{selectedOrder.customerPhone}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Address
                </Typography>
                <Typography variant="body1">{selectedOrder.customerAddress}</Typography>
              </Grid>
              {selectedOrder.isCustomOrder && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      Custom Order Details
                    </Typography>
                  </Grid>
                  {selectedOrder.frameName && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Frame Name
                      </Typography>
                      <Typography variant="body1">{selectedOrder.frameName}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Right Eye
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.rightEyeSphere || '0'} / {selectedOrder.rightEyeCylinder || '0'} /{' '}
                      {selectedOrder.rightEyeAxis || '0'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Left Eye
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.leftEyeSphere || '0'} / {selectedOrder.leftEyeCylinder || '0'} /{' '}
                      {selectedOrder.leftEyeAxis || '0'}
                    </Typography>
                  </Grid>
                  {selectedOrder.nearAdd && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Near Add
                      </Typography>
                      <Typography variant="body1">{selectedOrder.nearAdd}</Typography>
                    </Grid>
                  )}
                </>
              )}
              {selectedOrder.prescriptionNotes && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">
                    Prescription Notes
                  </Typography>
                  <Typography variant="body1">{selectedOrder.prescriptionNotes}</Typography>
                </Grid>
              )}
              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
                      Order Items
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Product</TableCell>
                            <TableCell>Quantity</TableCell>
                            <TableCell>Price</TableCell>
                            <TableCell>Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.items.map((item) => (
                            <TableRow key={item.id}>
                              <TableCell>{item.product?.name || 'N/A'}</TableCell>
                              <TableCell>{item.quantity}</TableCell>
                              <TableCell>Rs {item.price.toFixed(2)}</TableCell>
                              <TableCell>Rs {(item.price * item.quantity).toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </>
              )}
              <Grid item xs={12}>
                <Typography variant="h6" sx={{ mt: 2 }}>
                  Total Amount: Rs {selectedOrder.totalAmount.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

