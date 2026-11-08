import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Select,
  MenuItem,
  FormControl,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import axios from 'axios';

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  prescriptionNotes?: string;
  isCustomOrder?: boolean;
  frameName?: string;
  rightEyeSphere?: string;
  rightEyeCylinder?: string;
  rightEyeAxis?: string;
  leftEyeSphere?: string;
  leftEyeCylinder?: string;
  leftEyeAxis?: string;
  nearAdd?: string;
  status: string;
  totalAmount: number;
  items: any[];
  createdAt: string;
}

const parseItemImage = (images?: string | null): string => {
  if (!images || !images.trim()) return '';

  const trimmed = images.trim();
  if (trimmed.startsWith('data:') || trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed) && parsed.length > 0) {
      const first = parsed[0];
      if (!first) return '';
      if (typeof first === 'string') {
        const firstTrimmed = first.trim();
        if (firstTrimmed.startsWith('data:') || firstTrimmed.startsWith('http://') || firstTrimmed.startsWith('https://')) {
          return firstTrimmed;
        }
        if (firstTrimmed.startsWith('/9j/') || firstTrimmed.startsWith('iVBORw') || firstTrimmed.length > 100) {
          return `data:image/jpeg;base64,${firstTrimmed}`;
        }
        return firstTrimmed;
      }
    }
    if (typeof parsed === 'string') {
      const parsedTrimmed = parsed.trim();
      if (parsedTrimmed.startsWith('data:') || parsedTrimmed.startsWith('http://') || parsedTrimmed.startsWith('https://')) {
        return parsedTrimmed;
      }
      if (parsedTrimmed.startsWith('/9j/') || parsedTrimmed.startsWith('iVBORw') || parsedTrimmed.length > 100) {
        return `data:image/jpeg;base64,${parsedTrimmed}`;
      }
      return parsedTrimmed;
    }
  } catch {
    if (trimmed.includes(',')) {
      const first = trimmed.split(',')[0].trim();
      if (first.startsWith('data:') || first.startsWith('http://') || first.startsWith('https://')) {
        return first;
      }
      if (first.startsWith('/9j/') || first.startsWith('iVBORw') || first.length > 100) {
        return `data:image/jpeg;base64,${first}`;
      }
      return first;
    }
  }

  if (trimmed.startsWith('/9j/') || trimmed.startsWith('iVBORw') || trimmed.length > 100) {
    return `data:image/jpeg;base64,${trimmed}`;
  }

  return trimmed;
};

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await axios.get('/api/ecommerce/orders', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(response.data);
    } catch (error) {
      console.error('Failed to load orders:', error);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.patch(
        `/api/ecommerce/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'ready':
        return 'secondary';
      case 'completed':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" sx={{ mb: 4, fontWeight: 700 }}>
        Orders
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order Number</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} hover>
                <TableCell sx={{ fontFamily: 'monospace', fontWeight: 600 }}>{order.orderNumber}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>{order.customerPhone}</TableCell>
                <TableCell>{order.customerAddress}</TableCell>
                <TableCell>Rs {order.totalAmount.toLocaleString()}</TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    >
                      <MenuItem value="pending">Pending</MenuItem>
                      <MenuItem value="confirmed">Confirmed</MenuItem>
                      <MenuItem value="ready">Ready</MenuItem>
                      <MenuItem value="completed">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                <TableCell align="center">
                  <Tooltip title="View Order Details">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleViewDetails(order)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Details Modal */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Order Details - {selectedOrder?.orderNumber}
        </DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Customer Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedOrder.customerName}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  Phone
                </Typography>
                <Typography variant="body1">{selectedOrder.customerPhone}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">
                  Delivery Address
                </Typography>
                <Typography variant="body1">{selectedOrder.customerAddress}</Typography>
              </Grid>

              {selectedOrder.isCustomOrder && (
                <>
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mt: 1, mb: 1, fontWeight: 600 }}>
                      Custom Order Prescription
                    </Typography>
                  </Grid>
                  {selectedOrder.frameName && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Selected Frame
                      </Typography>
                      <Typography variant="body1">{selectedOrder.frameName}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Right Eye (OD)
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.rightEyeSphere || '0'} / {selectedOrder.rightEyeCylinder || '0'} / {selectedOrder.rightEyeAxis || '0'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Left Eye (OS)
                    </Typography>
                    <Typography variant="body1">
                      {selectedOrder.leftEyeSphere || '0'} / {selectedOrder.leftEyeCylinder || '0'} / {selectedOrder.leftEyeAxis || '0'}
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
                    <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                      Order Items
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow sx={{ bgcolor: 'action.hover' }}>
                            <TableCell sx={{ width: 70, fontWeight: 600 }}>Picture</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Product</TableCell>
                            <TableCell align="center" sx={{ fontWeight: 600 }}>Quantity</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Price</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Total</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {selectedOrder.items.map((item, idx) => {
                            const itemImage = parseItemImage(item.product?.images);
                            return (
                              <TableRow key={item.id || idx} hover>
                                <TableCell sx={{ py: 1 }}>
                                  {itemImage ? (
                                    <Tooltip title="Click to view full picture" arrow>
                                      <Box
                                        component="img"
                                        src={itemImage}
                                        alt={item.product?.name || 'Item picture'}
                                        onClick={() => setPreviewImage(itemImage)}
                                        sx={{
                                          width: 52,
                                          height: 52,
                                          objectFit: 'cover',
                                          borderRadius: 1.5,
                                          border: '1px solid',
                                          borderColor: 'divider',
                                          display: 'block',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s ease-in-out',
                                          '&:hover': {
                                            transform: 'scale(1.08)',
                                            boxShadow: 2,
                                          },
                                        }}
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src = '/placeholder.jpg';
                                        }}
                                      />
                                    </Tooltip>
                                  ) : (
                                    <Box
                                      sx={{
                                        width: 52,
                                        height: 52,
                                        bgcolor: 'action.hover',
                                        borderRadius: 1.5,
                                        border: '1px dashed',
                                        borderColor: 'divider',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'text.disabled',
                                      }}
                                    >
                                      <ImageIcon sx={{ fontSize: 24 }} />
                                    </Box>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                    {item.product?.name || 'Product'}
                                  </Typography>
                                  {item.product?.category && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      {item.product.category}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  <Chip label={item.quantity} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell align="right">
                                  Rs {Number(item.price).toFixed(2)}
                                </TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>
                                  Rs {(Number(item.price) * item.quantity).toFixed(2)}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Grid>
                </>
              )}

              <Grid item xs={12}>
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    Total: Rs {Number(selectedOrder.totalAmount).toLocaleString()}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Picture Enlarge Modal */}
      <Dialog
        open={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Item Picture
          </Typography>
          <IconButton size="small" onClick={() => setPreviewImage(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', p: 3, pt: 1 }}>
          {previewImage && (
            <Box
              component="img"
              src={previewImage}
              alt="Item picture preview"
              sx={{
                maxWidth: '100%',
                maxHeight: '65vh',
                objectFit: 'contain',
                borderRadius: 2,
                boxShadow: 2,
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};


