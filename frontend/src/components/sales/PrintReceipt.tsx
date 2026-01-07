import React, { useRef, useEffect } from 'react';
import { Box, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow, Paper } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import type { Sale, Customer, Company, ThemeSettings } from '../../types/index.js';
import { format } from 'date-fns';
import { formatCurrency } from '../../utils/currency.js';

interface PrintReceiptProps {
  sale: Sale;
  customer: Customer;
  company: Company;
  themeSettings: ThemeSettings | null;
  onClose: () => void;
}

export const PrintReceipt: React.FC<PrintReceiptProps> = ({ sale, customer, company, themeSettings, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  // Get company details from company data or use defaults
  const companyAddress = company.address || 'Shops 1-3 (Basement), Faisal Plaza, Near ZAH Medical Centre, Abubakkar Block, H-13, Islamabad';
  const companyPhone = company.phone || '+92 3299112277';
  const companyWhatsApp = company.whatsapp || '+92 3299112277';

  const formatBalance = (amount: number) => {
    if (amount < 0) {
      return `Rs ${amount.toLocaleString()}`;
    }
    return formatCurrency(amount);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${company.name}</title>
          <meta charset="utf-8">
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            @media print {
              @page {
                margin: 0;
                size: auto;
              }
              body { 
                margin: 0;
                padding: 10mm;
              }
              /* Remove browser print headers/footers - user must disable in browser settings */
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
              background: white;
              margin: 0;
              padding: 20px;
              display: flex;
              justify-content: center;
            }
            /* Hide any browser default text */
            body::before,
            body::after {
              display: none !important;
              content: none !important;
            }
            .receipt-container {
              width: 100%;
              max-width: 80mm;
              margin: 0 auto;
              background: white;
              padding: 8px;
            }
            .company-header {
              text-align: center;
              margin-bottom: 16px;
            }
            .company-name {
              font-weight: bold;
              font-size: 16px;
              text-transform: uppercase;
              margin: 8px 0;
              letter-spacing: 1px;
            }
            .company-info {
              font-size: 11px;
              margin: 3px 0;
            }
            .divider {
              border-top: 1px dashed #000;
              margin: 8px 0;
            }
            .two-column {
              display: flex;
              gap: 16px;
              margin: 8px 0;
            }
            .column {
              flex: 1;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              margin: 4px 0;
              font-size: 11px;
            }
            .info-label {
              font-weight: bold;
            }
            .special-note {
              margin: 8px 0;
              font-size: 11px;
            }
            .special-note-title {
              font-weight: bold;
              margin-bottom: 4px;
            }
            .prescription-table {
              width: 100%;
              border-collapse: collapse;
              margin: 8px 0;
              font-size: 10px;
            }
            .prescription-table th,
            .prescription-table td {
              border: 1px solid #000;
              padding: 4px;
              text-align: center;
              font-family: 'Courier New', monospace;
            }
            .prescription-table th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            .add-section {
              text-align: center;
              margin: 16px 0;
            }
            .add-title {
              font-weight: bold;
              font-size: 12px;
              margin-bottom: 4px;
            }
            .add-value {
              font-size: 16px;
            }
            .footer {
              text-align: center;
              font-size: 10px;
              margin-top: 16px;
              padding-top: 8px;
              border-top: 1px dashed #000;
            }
          </style>
        </head>
        <body>
          <div class="receipt-container">
            <div class="company-header">
              <div class="company-name">${company.name}</div>
              <div class="company-info">${companyAddress}</div>
              <div class="company-info">Phone: ${companyPhone}</div>
              <div class="company-info">WhatsApp: ${companyWhatsApp}</div>
              <div class="company-info">Currency: PKR - Pakistani Rupee (Rs)</div>
            </div>
            
            <div class="divider"></div>
            
            <div class="two-column">
              <div class="column">
                <div class="info-row">
                  <span class="info-label">Tracking ID:</span>
                  <span>${sale.orderNo}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Patient Name:</span>
                  <span>${customer.name}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">WhatsApp:</span>
                  <span>${customer.phone}</span>
                </div>
              </div>
              <div class="column">
                <div class="info-row">
                  <span class="info-label">Frame:</span>
                  <span>${sale.frame}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Lens:</span>
                  <span>${sale.lens}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Total:</span>
                  <span>${formatCurrency(sale.total)}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Advance:</span>
                  <span>${formatCurrency(sale.received)}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Balance:</span>
                  <span>${formatBalance(sale.remaining)}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Delivery Date:</span>
                  <span>${sale.deliveryDate ? format(new Date(sale.deliveryDate), 'yyyy-MM-dd') : 'N/A'}</span>
                </div>
              </div>
            </div>
            
            <div class="divider"></div>
            
            <div class="special-note">
              <div class="special-note-title">Special Note</div>
              <div style="min-height: 15px;"></div>
            </div>
            
            <div class="divider"></div>
            
            <table class="prescription-table">
              <thead>
                <tr>
                  <th colspan="4">Right Eye</th>
                  <th colspan="4">Left Eye</th>
                </tr>
                <tr>
                  <th>SPH</th>
                  <th>CYL</th>
                  <th>AXIS</th>
                  <th>VA</th>
                  <th>SPH</th>
                  <th>CYL</th>
                  <th>AXIS</th>
                  <th>VA</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>${sale.rightEyeSphere}</td>
                  <td>${sale.rightEyeCylinder}</td>
                  <td>${sale.rightEyeAxis}</td>
                  <td>-</td>
                  <td>${sale.leftEyeSphere}</td>
                  <td>${sale.leftEyeCylinder}</td>
                  <td>${sale.leftEyeAxis}</td>
                  <td>-</td>
                </tr>
              </tbody>
            </table>
            
            <div class="add-section">
              <div class="add-title">ADD</div>
              <div class="add-value">+${sale.nearAdd || '0.00'}</div>
            </div>
            
            <div class="footer">
              Thank you for your business!
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(receiptHTML);
    printWindow.document.close();
    
    // Wait for content to load before printing
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        // Don't close immediately, let user see preview
      }, 100);
    };
  };

  return (
    <Box>
      <Box sx={{ mb: 2, p: 2, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }} className="no-print">
        <Box>
          <Button variant="contained" startIcon={<PrintIcon />} onClick={handlePrint} sx={{ mr: 3 }}>
            Print
          </Button>
          <Button variant="outlined" onClick={onClose}>
            Close
          </Button>
        </Box>
      </Box>

      <Paper 
        ref={printRef} 
        sx={{ 
          p: 2, 
          maxWidth: '80mm',
          mx: 'auto', 
          bgcolor: 'white',
          fontFamily: "'Courier New', monospace",
          fontSize: '12px',
          '@media print': { 
            boxShadow: 'none', 
            border: 'none', 
            padding: '10mm 5mm',
            maxWidth: '80mm',
            width: '80mm'
          } 
        }}
      >
        {/* Company Header - Centered POS Style */}
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Typography 
            sx={{ 
              fontWeight: 700, 
              textTransform: 'uppercase', 
              fontSize: '16px',
              letterSpacing: '1px',
              mb: 1,
              fontFamily: "'Courier New', monospace"
            }}
          >
            {company.name}
          </Typography>
          <Typography sx={{ fontSize: '11px', mb: 0.5, fontFamily: "'Courier New', monospace" }}>
            {companyAddress}
          </Typography>
          <Typography sx={{ fontSize: '11px', mb: 0.5, fontFamily: "'Courier New', monospace" }}>
            Phone: {companyPhone}
          </Typography>
          <Typography sx={{ fontSize: '11px', mb: 0.5, fontFamily: "'Courier New', monospace" }}>
            WhatsApp: {companyWhatsApp}
          </Typography>
          <Typography sx={{ fontSize: '11px', mt: 0.5, fontFamily: "'Courier New', monospace" }}>
            Currency: PKR - Pakistani Rupee (Rs)
          </Typography>
        </Box>

        {/* Divider */}
        <Box sx={{ borderTop: '1px dashed #000', my: 1.5 }} />

        {/* Customer and Order Information - Two columns POS Style */}
        <Box sx={{ display: 'flex', gap: 2, mb: 1.5, fontSize: '11px' }}>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, fontFamily: "'Courier New', monospace" }}>
                Tracking ID:
              </Typography>
              <Typography sx={{ fontSize: '11px', fontFamily: "'Courier New', monospace" }}>
                {sale.orderNo}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, fontFamily: "'Courier New', monospace" }}>
                Patient Name:
              </Typography>
              <Typography sx={{ fontSize: '11px', fontFamily: "'Courier New', monospace" }}>
                {customer.name}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, fontFamily: "'Courier New', monospace" }}>
                WhatsApp:
              </Typography>
              <Typography sx={{ fontSize: '11px', fontFamily: "'Courier New', monospace" }}>
                {customer.phone}
              </Typography>
            </Box>
          </Box>

          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, fontFamily: "'Courier New', monospace" }}>
                Frame:
              </Typography>
              <Typography sx={{ fontSize: '11px', fontFamily: "'Courier New', monospace" }}>
                {sale.frame}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, fontFamily: "'Courier New', monospace" }}>
                Lens:
              </Typography>
              <Typography sx={{ fontSize: '11px', fontFamily: "'Courier New', monospace" }}>
                {sale.lens}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, fontFamily: "'Courier New', monospace" }}>
                Total:
              </Typography>
              <Typography sx={{ fontSize: '11px', fontFamily: "'Courier New', monospace" }}>
                {formatCurrency(sale.total)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, fontFamily: "'Courier New', monospace" }}>
                Advance:
              </Typography>
              <Typography sx={{ fontSize: '11px', fontFamily: "'Courier New', monospace" }}>
                {formatCurrency(sale.received)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, fontFamily: "'Courier New', monospace" }}>
                Balance:
              </Typography>
              <Typography sx={{ fontSize: '11px', fontFamily: "'Courier New', monospace" }}>
                {formatBalance(sale.remaining)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '11px', fontWeight: 700, fontFamily: "'Courier New', monospace" }}>
                Delivery Date:
              </Typography>
              <Typography sx={{ fontSize: '11px', fontFamily: "'Courier New', monospace" }}>
                {sale.deliveryDate ? format(new Date(sale.deliveryDate), 'yyyy-MM-dd') : 'N/A'}
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Divider */}
        <Box sx={{ borderTop: '1px dashed #000', my: 1.5 }} />

        {/* Special Note */}
        <Box sx={{ mb: 1.5 }}>
          <Typography sx={{ fontWeight: 700, mb: 0.5, fontSize: '11px', fontFamily: "'Courier New', monospace" }}>
            Special Note
          </Typography>
          <Typography sx={{ fontSize: '11px', minHeight: '15px', fontFamily: "'Courier New', monospace" }}>
            {/* Add special note field if available */}
          </Typography>
        </Box>

        {/* Divider */}
        <Box sx={{ borderTop: '1px dashed #000', my: 1.5 }} />

        {/* Prescription Table - Compact POS Style */}
        <Box>
          <Table sx={{ '& .MuiTableCell-root': { fontFamily: "'Courier New', monospace", fontSize: '10px', padding: '4px' } }}>
            <TableHead>
              <TableRow>
                <TableCell colSpan={4} sx={{ border: '1px solid #000', textAlign: 'center', fontWeight: 700, fontSize: '10px', py: 0.5 }}>
                  Right Eye
                </TableCell>
                <TableCell colSpan={4} sx={{ border: '1px solid #000', textAlign: 'center', fontWeight: 700, fontSize: '10px', py: 0.5 }}>
                  Left Eye
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', fontWeight: 700, fontSize: '10px', py: 0.5 }}>SPH</TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', fontWeight: 700, fontSize: '10px', py: 0.5 }}>CYL</TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', fontWeight: 700, fontSize: '10px', py: 0.5 }}>AXIS</TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', fontWeight: 700, fontSize: '10px', py: 0.5 }}>VA</TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', fontWeight: 700, fontSize: '10px', py: 0.5 }}>SPH</TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', fontWeight: 700, fontSize: '10px', py: 0.5 }}>CYL</TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', fontWeight: 700, fontSize: '10px', py: 0.5 }}>AXIS</TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', fontWeight: 700, fontSize: '10px', py: 0.5 }}>VA</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', fontSize: '10px', py: 0.5 }}>{sale.rightEyeSphere}</TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', fontSize: '10px', py: 0.5 }}>{sale.rightEyeCylinder}</TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', fontSize: '10px', py: 0.5 }}>{sale.rightEyeAxis}</TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', fontSize: '10px', py: 0.5 }}>-</TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', fontSize: '10px', py: 0.5 }}>{sale.leftEyeSphere}</TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', fontSize: '10px', py: 0.5 }}>{sale.leftEyeCylinder}</TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', fontSize: '10px', py: 0.5 }}>{sale.leftEyeAxis}</TableCell>
                <TableCell sx={{ border: '1px solid #000', textAlign: 'center', fontSize: '10px', py: 0.5 }}>-</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </Box>

        {/* ADD Section - Centered */}
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 0.5, fontSize: '12px', fontFamily: "'Courier New', monospace" }}>
            ADD
          </Typography>
          <Typography sx={{ fontSize: '16px', fontFamily: "'Courier New', monospace" }}>
            +{sale.nearAdd || '0.00'}
          </Typography>
        </Box>

        {/* Footer */}
        <Box sx={{ borderTop: '1px dashed #000', mt: 2, pt: 1, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '10px', fontFamily: "'Courier New', monospace" }}>
            Thank you for your business!
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
};
