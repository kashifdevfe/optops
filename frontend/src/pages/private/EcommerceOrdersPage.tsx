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
import PrintIcon from '@mui/icons-material/Print';
import ImageIcon from '@mui/icons-material/Image';
import CloseIcon from '@mui/icons-material/Close';
import { ecommerceApi, EcommerceOrder } from '../../services/api.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { useAppSelector } from '../../hooks/redux.js';

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
    // If not JSON, check comma separated
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

export const EcommerceOrdersPage: React.FC = () => {
  const { company, themeSettings } = useAppSelector((state) => state.auth);
  const [orders, setOrders] = useState<EcommerceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<EcommerceOrder | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
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

  const handlePrintReceipt = (order: EcommerceOrder) => {
    const companyName = company?.name || 'Company';
    const logoUrl = themeSettings?.logoUrl || '';
    const address = company?.address || '';
    const phone = company?.phone || '';
    const email = company?.email || '';
    const orderDate = new Date(order.createdAt).toLocaleString('en-PK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    const statusLabel = (order.status || 'pending').replace(/_/g, ' ').toUpperCase();

    const itemsRows =
      order.items && order.items.length > 0
        ? order.items
            .map((item) => {
              const name = item.product?.name || 'Item';
              const meta = [item.product?.category, item.product?.frameType, item.product?.frameSize]
                .filter(Boolean)
                .join(' · ');
              return `
          <tr>
            <td class="item-name">
              <div class="name">${name}</div>
              ${meta ? `<div class="meta">${meta}</div>` : ''}
            </td>
            <td class="num">${item.quantity}</td>
            <td class="num">Rs ${item.price.toFixed(2)}</td>
            <td class="num">Rs ${(item.price * item.quantity).toFixed(2)}</td>
          </tr>`;
            })
            .join('')
        : `<tr><td colspan="4" class="empty">No items</td></tr>`;

    const prescriptionBlock = order.isCustomOrder
      ? `
      <div class="section">
        <div class="section-title">Prescription</div>
        <table class="rx-table">
          <thead>
            <tr>
              <th></th>
              <th>SPH</th>
              <th>CYL</th>
              <th>AXIS</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>OD (R)</td>
              <td>${order.rightEyeSphere || '—'}</td>
              <td>${order.rightEyeCylinder || '—'}</td>
              <td>${order.rightEyeAxis || '—'}</td>
            </tr>
            <tr>
              <td>OS (L)</td>
              <td>${order.leftEyeSphere || '—'}</td>
              <td>${order.leftEyeCylinder || '—'}</td>
              <td>${order.leftEyeAxis || '—'}</td>
            </tr>
          </tbody>
        </table>
        ${order.nearAdd ? `<div class="rx-note"><strong>Near Add:</strong> ${order.nearAdd}</div>` : ''}
        ${order.frameName ? `<div class="rx-note"><strong>Frame:</strong> ${order.frameName}</div>` : ''}
        ${order.prescriptionNotes ? `<div class="rx-note"><strong>Notes:</strong> ${order.prescriptionNotes}</div>` : ''}
      </div>`
      : order.prescriptionNotes
        ? `<div class="section"><div class="section-title">Notes</div><div class="rx-note">${order.prescriptionNotes}</div></div>`
        : '';

    const printContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>Receipt - ${order.orderNumber}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
    *{margin:0;padding:0;box-sizing:border-box;}
    body{
      font-family:'IBM Plex Sans',sans-serif;
      background:#f3f4f6;
      color:#111827;
      font-size:12.5px;
      line-height:1.45;
    }
    .receipt{
      width:80mm;
      max-width:100%;
      margin:16px auto;
      background:#fff;
      padding:18px 16px 22px;
      box-shadow:0 8px 24px rgba(0,0,0,.08);
    }
    .center{text-align:center;}
    .logo{max-height:56px;max-width:160px;object-fit:contain;margin-bottom:8px;}
    .brand{font-size:18px;font-weight:700;letter-spacing:-.2px;}
    .muted{color:#6b7280;font-size:11px;}
    .divider{
      border:0;
      border-top:1px dashed #d1d5db;
      margin:12px 0;
    }
    .title{
      font-size:13px;
      font-weight:700;
      letter-spacing:1.4px;
      text-transform:uppercase;
      margin-bottom:6px;
    }
    .order-no{
      font-family:'IBM Plex Mono',monospace;
      font-weight:600;
      font-size:12px;
    }
    .meta-row{
      display:flex;
      justify-content:space-between;
      gap:8px;
      margin:4px 0;
      font-size:11.5px;
    }
    .customer{
      margin-top:2px;
    }
    .customer .name{font-weight:700;font-size:13px;}
    .section{margin-top:4px;}
    .section-title{
      font-size:10.5px;
      font-weight:700;
      text-transform:uppercase;
      letter-spacing:.8px;
      color:#4b5563;
      margin-bottom:6px;
    }
    table.items{
      width:100%;
      border-collapse:collapse;
    }
    table.items th{
      font-size:10px;
      text-transform:uppercase;
      letter-spacing:.5px;
      color:#6b7280;
      font-weight:600;
      padding:0 0 6px;
      border-bottom:1px solid #e5e7eb;
      text-align:left;
    }
    table.items th.num,
    table.items td.num{text-align:right;}
    table.items td{
      padding:8px 0;
      border-bottom:1px dotted #e5e7eb;
      vertical-align:top;
    }
    .item-name .name{font-weight:600;}
    .item-name .meta{font-size:10.5px;color:#6b7280;margin-top:2px;}
    .empty{text-align:center;color:#9ca3af;padding:12px 0;}
    .totals{
      margin-top:10px;
    }
    .totals .row{
      display:flex;
      justify-content:space-between;
      align-items:baseline;
      margin:4px 0;
    }
    .totals .grand{
      margin-top:8px;
      padding-top:8px;
      border-top:2px solid #111827;
      font-size:15px;
      font-weight:700;
    }
    .rx-table{width:100%;border-collapse:collapse;font-size:11.5px;}
    .rx-table th,.rx-table td{padding:4px 2px;text-align:center;}
    .rx-table th{color:#6b7280;font-size:10px;text-transform:uppercase;}
    .rx-table td:first-child,.rx-table th:first-child{text-align:left;font-weight:600;}
    .rx-note{font-size:11.5px;margin-top:4px;color:#374151;}
    .footer{
      margin-top:14px;
      text-align:center;
      font-size:11px;
      color:#6b7280;
    }
    .status{
      display:inline-block;
      margin-top:6px;
      padding:2px 8px;
      border:1px solid #d1d5db;
      border-radius:999px;
      font-size:10px;
      font-weight:600;
      letter-spacing:.4px;
    }
    @page{size:auto;margin:8mm;}
    @media print{
      body{background:#fff;}
      .receipt{box-shadow:none;margin:0 auto;width:80mm;}
      body{print-color-adjust:exact;-webkit-print-color-adjust:exact;}
    }
  </style>
</head>
<body>
  <div class="receipt">
    <div class="center">
      ${logoUrl ? `<img class="logo" src="${logoUrl}" alt="Logo"/>` : ''}
      <div class="brand">${companyName}</div>
      ${address ? `<div class="muted">${address}</div>` : ''}
      ${phone ? `<div class="muted">Tel: ${phone}</div>` : ''}
      ${email ? `<div class="muted">${email}</div>` : ''}
    </div>

    <hr class="divider"/>

    <div class="center">
      <div class="title">Sales Receipt</div>
      <div class="order-no">#${order.orderNumber}</div>
      <div class="muted" style="margin-top:4px;">${orderDate}</div>
      <div class="status">${statusLabel}</div>
    </div>

    <hr class="divider"/>

    <div class="customer">
      <div class="section-title">Customer</div>
      <div class="name">${order.customerName}</div>
      <div class="muted">${order.customerPhone}</div>
      <div class="muted">${order.customerAddress}</div>
      <div class="meta-row" style="margin-top:6px;">
        <span class="muted">Order type</span>
        <span>${order.isCustomOrder ? 'Custom' : 'Regular'}</span>
      </div>
    </div>

    <hr class="divider"/>

    <div class="section">
      <table class="items">
        <thead>
          <tr>
            <th>Item</th>
            <th class="num">Qty</th>
            <th class="num">Price</th>
            <th class="num">Total</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>
    </div>

    <div class="totals">
      <div class="row grand">
        <span>TOTAL</span>
        <span>Rs ${order.totalAmount.toFixed(2)}</span>
      </div>
    </div>

    ${prescriptionBlock ? `<hr class="divider"/>${prescriptionBlock}` : ''}

    <hr class="divider"/>

    <div class="footer">
      <div>Thank you for your purchase!</div>
      <div style="margin-top:4px;">${companyName}</div>
      <div style="margin-top:8px;font-size:10px;">Printed ${new Date().toLocaleString('en-PK')}</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
        window.onafterprint = function() { window.close(); };
      }, 250);
    };
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=420,height=720');
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
        <DialogTitle
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            pr: 2,
          }}
        >
          <Typography component="span" variant="h6" sx={{ fontWeight: 600 }}>
            Order Details - {selectedOrder?.orderNumber}
          </Typography>
          {selectedOrder && (
            <Button
              variant="contained"
              size="small"
              startIcon={<PrintIcon />}
              onClick={() => handlePrintReceipt(selectedOrder)}
              sx={{ textTransform: 'none', fontWeight: 600, flexShrink: 0 }}
            >
              Print
            </Button>
          )}
        </DialogTitle>
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
                    <Typography variant="h6" sx={{ mt: 2, mb: 1, fontWeight: 600 }}>
                      Order Items
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 1.5, overflow: 'hidden' }}>
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
                          {selectedOrder.items.map((item) => {
                            const itemImage = parseItemImage(item.product?.images);
                            return (
                              <TableRow key={item.id} hover>
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
                                    {item.product?.name || 'N/A'}
                                  </Typography>
                                  {item.product?.category && (
                                    <Typography variant="caption" color="text.secondary" display="block">
                                      {item.product.category}
                                      {item.product.frameType ? ` • ${item.product.frameType}` : ''}
                                      {item.product.frameSize ? ` • Size: ${item.product.frameSize}` : ''}
                                    </Typography>
                                  )}
                                </TableCell>
                                <TableCell align="center">
                                  <Chip label={item.quantity} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell align="right">Rs {item.price.toFixed(2)}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 600 }}>
                                  Rs {(item.price * item.quantity).toFixed(2)}
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
                <Typography variant="h6" sx={{ mt: 2, fontWeight: 700 }}>
                  Total Amount: Rs {selectedOrder.totalAmount.toFixed(2)}
                </Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Product Image Enlarge Dialog */}
      <Dialog
        open={Boolean(previewImage)}
        onClose={() => setPreviewImage(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
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
    </Box>
  );
};
