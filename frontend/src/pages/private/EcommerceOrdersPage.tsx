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
  Tooltip,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { ecommerceApi, EcommerceOrder } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { useAppSelector } from '../../hooks/redux.js';

export const EcommerceOrdersPage: React.FC = () => {
  const { company, themeSettings } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<EcommerceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<EcommerceOrder | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [error, setError] = useState('');

  const loadingRef = useRef(false);

  useEffect(() => {
    if (loadingRef.current) return;
    loadOrders();
  }, []);

  const loadOrders = async () => {
    if (loadingRef.current) return;
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
    let phoneNumber = order.customerPhone.replace(/[^\d+]/g, '');
    if (!phoneNumber.startsWith('+')) {
      if (phoneNumber.startsWith('0')) phoneNumber = phoneNumber.substring(1);
      phoneNumber = `92${phoneNumber}`;
    } else {
      phoneNumber = phoneNumber.substring(1);
    }
    const companyName = company?.name || 'Our Company';
    const amount = order.totalAmount.toFixed(2);
    const message = `Hello ${order.customerName}, we have sent your order #${order.orderNumber}. You will receive it in 5-7 working days. Amount: Rs ${amount}. Thank you for your purchase!\n\n${companyName}`;
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleCompleted = async (orderId: string) => {
    try {
      await ecommerceApi.updateOrderStatus(orderId, 'completed');
      loadOrders();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to mark order as completed');
    }
  };

  const handleDownloadPdf = (order: EcommerceOrder) => {
    const companyName = company?.name || 'Company';
    const logoUrl = themeSettings?.logoUrl || '';
    const address = company?.address || '';
    const phone = company?.phone || '';
    const email = company?.email || '';
    const orderDate = new Date(order.createdAt).toLocaleDateString('en-PK', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const itemsRows =
      order.items && order.items.length > 0
        ? order.items
            .map(
              (item, i) => `
          <tr style="background:${i % 2 === 0 ? '#f9fafc' : '#fff'}">
            <td style="padding:10px 14px;border-bottom:1px solid #e8eaf0;">${item.product?.name || 'N/A'}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e8eaf0;text-align:center;">${item.quantity}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e8eaf0;text-align:right;">Rs ${item.price.toFixed(2)}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e8eaf0;text-align:right;">Rs ${(item.price * item.quantity).toFixed(2)}</td>
          </tr>`
            )
            .join('')
        : `<tr><td colspan="4" style="padding:14px;text-align:center;color:#999;">No items</td></tr>`;

    const prescriptionBlock = order.isCustomOrder
      ? `
      <div style="margin-top:24px;padding:0 32px;">
        <h3 style="font-size:13px;font-weight:700;color:#374151;border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-bottom:14px;letter-spacing:.5px;text-transform:uppercase;">Prescription</h3>
        <table style="width:100%;border-collapse:collapse;font-size:13px;">
          <thead>
            <tr style="background:#f3f4f6;">
              <th style="padding:8px 12px;text-align:left;font-weight:600;color:#6b7280;"></th>
              <th style="padding:8px 12px;text-align:center;font-weight:600;color:#6b7280;">Sphere</th>
              <th style="padding:8px 12px;text-align:center;font-weight:600;color:#6b7280;">Cylinder</th>
              <th style="padding:8px 12px;text-align:center;font-weight:600;color:#6b7280;">Axis</th>
            </tr>
          </thead>
          <tbody>
            <tr style="background:#fff;">
              <td style="padding:8px 12px;font-weight:600;color:#374151;">Right Eye (OD)</td>
              <td style="padding:8px 12px;text-align:center;">${order.rightEyeSphere || '—'}</td>
              <td style="padding:8px 12px;text-align:center;">${order.rightEyeCylinder || '—'}</td>
              <td style="padding:8px 12px;text-align:center;">${order.rightEyeAxis || '—'}</td>
            </tr>
            <tr style="background:#f9fafc;">
              <td style="padding:8px 12px;font-weight:600;color:#374151;">Left Eye (OS)</td>
              <td style="padding:8px 12px;text-align:center;">${order.leftEyeSphere || '—'}</td>
              <td style="padding:8px 12px;text-align:center;">${order.leftEyeCylinder || '—'}</td>
              <td style="padding:8px 12px;text-align:center;">${order.leftEyeAxis || '—'}</td>
            </tr>
            ${order.nearAdd ? `<tr style="background:#fff;"><td style="padding:8px 12px;font-weight:600;color:#374151;">Near Add</td><td colspan="3" style="padding:8px 12px;">${order.nearAdd}</td></tr>` : ''}
            ${order.frameName ? `<tr style="background:#f9fafc;"><td style="padding:8px 12px;font-weight:600;color:#374151;">Frame</td><td colspan="3" style="padding:8px 12px;">${order.frameName}</td></tr>` : ''}
          </tbody>
        </table>
        ${order.prescriptionNotes ? `<p style="margin-top:10px;font-size:12px;color:#6b7280;"><strong>Notes:</strong> ${order.prescriptionNotes}</p>` : ''}
      </div>`
      : '';

    const printContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Invoice - ${order.orderNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{font-family:'Inter',sans-serif;background:#fff;color:#1f2937;font-size:13px;}
    @page{size:A4;margin:16mm;}
    @media print{body{print-color-adjust:exact;-webkit-print-color-adjust:exact;}}
  </style>
</head>
<body>
  <div style="display:flex;align-items:flex-start;justify-content:space-between;padding:24px 32px 20px;border-bottom:3px solid #1e40af;">
    <div style="display:flex;align-items:center;gap:16px;">
      ${logoUrl ? `<img src="${logoUrl}" alt="Logo" style="max-height:64px;max-width:140px;object-fit:contain;"/>` : ''}
      <div>
        <div style="font-size:22px;font-weight:800;color:#1e40af;letter-spacing:-0.5px;">${companyName}</div>
        ${address ? `<div style="font-size:11px;color:#6b7280;margin-top:3px;">${address}</div>` : ''}
        ${phone ? `<div style="font-size:11px;color:#6b7280;">Tel: ${phone}</div>` : ''}
        ${email ? `<div style="font-size:11px;color:#6b7280;">${email}</div>` : ''}
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:26px;font-weight:800;color:#1e40af;letter-spacing:2px;">INVOICE</div>
      <div style="font-size:13px;font-weight:600;color:#374151;margin-top:4px;font-family:monospace;">#${order.orderNumber}</div>
      <div style="font-size:11px;color:#6b7280;margin-top:4px;">${orderDate}</div>
      <div style="margin-top:8px;display:inline-block;background:#dcfce7;color:#166534;font-size:11px;font-weight:700;padding:4px 14px;border-radius:999px;letter-spacing:.5px;text-transform:uppercase;">&#10003; Completed</div>
    </div>
  </div>

  <div style="padding:20px 32px 0;display:flex;gap:24px;flex-wrap:wrap;">
    <div style="background:#f1f5f9;border-radius:10px;padding:16px 20px;min-width:220px;">
      <div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Bill To</div>
      <div style="font-size:15px;font-weight:700;color:#1f2937;">${order.customerName}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:4px;">${order.customerPhone}</div>
      <div style="font-size:12px;color:#6b7280;margin-top:2px;">${order.customerAddress}</div>
    </div>
    <div style="background:#f1f5f9;border-radius:10px;padding:16px 20px;min-width:160px;">
      <div style="font-size:10px;font-weight:700;color:#6b7280;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Order Type</div>
      <div style="font-size:13px;font-weight:600;color:#1e40af;">${order.isCustomOrder ? 'Custom Order' : 'Regular Order'}</div>
    </div>
  </div>

  <div style="padding:20px 32px 0;">
    <div style="font-size:11px;font-weight:700;color:#374151;text-transform:uppercase;letter-spacing:.8px;border-bottom:2px solid #e5e7eb;padding-bottom:6px;margin-bottom:0;">Order Items</div>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#1e40af;color:#fff;">
          <th style="padding:10px 14px;text-align:left;font-weight:600;">Product</th>
          <th style="padding:10px 14px;text-align:center;font-weight:600;">Qty</th>
          <th style="padding:10px 14px;text-align:right;font-weight:600;">Unit Price</th>
          <th style="padding:10px 14px;text-align:right;font-weight:600;">Total</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>
  </div>

  <div style="padding:16px 32px 0;display:flex;justify-content:flex-end;">
    <div style="background:#1e40af;color:#fff;border-radius:10px;padding:14px 28px;min-width:200px;text-align:right;">
      <div style="font-size:10px;font-weight:600;opacity:.75;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Total Amount</div>
      <div style="font-size:22px;font-weight:800;">Rs ${order.totalAmount.toFixed(2)}</div>
    </div>
  </div>

  ${prescriptionBlock}

  <div style="margin-top:48px;padding:16px 32px;border-top:1px solid #e5e7eb;display:flex;justify-content:space-between;align-items:center;">
    <div style="font-size:11px;color:#9ca3af;">Thank you for your order!</div>
    <div style="font-size:13px;font-weight:700;color:#1e40af;">${companyName}</div>
    <div style="font-size:11px;color:#9ca3af;">Generated: ${new Date().toLocaleString()}</div>
  </div>

  <script>
    window.onload = function() {
      window.print();
      window.onafterprint = function() { window.close(); };
    };
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
    }
  };

  if (loading) return <LoadingSpinner />;

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
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {order.orderNumber}
                    </Typography>
                  </TableCell>
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
                <Typography variant="body2" color="text.secondary">Customer Name</Typography>
                <Typography variant="body1">{selectedOrder.customerName}</Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">Phone</Typography>
                <Typography variant="body1">{selectedOrder.customerPhone}</Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary">Address</Typography>
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
                      <Typography variant="body2" color="text.secondary">Frame Name</Typography>
                      <Typography variant="body1">{selectedOrder.frameName}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Right Eye</Typography>
                    <Typography variant="body1">
                      {selectedOrder.rightEyeSphere || '0'} / {selectedOrder.rightEyeCylinder || '0'} /{' '}
                      {selectedOrder.rightEyeAxis || '0'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">Left Eye</Typography>
                    <Typography variant="body1">
                      {selectedOrder.leftEyeSphere || '0'} / {selectedOrder.leftEyeCylinder || '0'} /{' '}
                      {selectedOrder.leftEyeAxis || '0'}
                    </Typography>
                  </Grid>
                  {selectedOrder.nearAdd && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">Near Add</Typography>
                      <Typography variant="body1">{selectedOrder.nearAdd}</Typography>
                    </Grid>
                  )}
                </>
              )}
              {selectedOrder.prescriptionNotes && (
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Prescription Notes</Typography>
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
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          {selectedOrder?.status === 'completed' && (
            <Tooltip title="Download branded PDF invoice with company stamp">
              <Button
                variant="contained"
                color="primary"
                startIcon={<PictureAsPdfIcon />}
                onClick={() => handleDownloadPdf(selectedOrder)}
                sx={{ textTransform: 'none', fontWeight: 600 }}
              >
                Download PDF
              </Button>
            </Tooltip>
          )}
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
