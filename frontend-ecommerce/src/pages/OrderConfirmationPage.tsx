import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Typography, Box, Card, CardContent, Button } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';

export const OrderConfirmationPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (orderId) {
      setOrder({ orderNumber: orderId });
    }
  }, [orderId]);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box sx={{ textAlign: 'center' }}>
        <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
        <Typography variant="h4" component="h1" sx={{ mb: 2, fontWeight: 700 }}>
          Order Placed Successfully!
        </Typography>
        {order && (
          <Typography variant="h6" color="text.secondary" sx={{ mb: 4 }}>
            Order Number: {order.orderNumber}
          </Typography>
        )}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Thank you for your order! We have received your request and will contact you shortly
              to confirm the details.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You will receive a confirmation call or message on the phone number you provided.
            </Typography>
          </CardContent>
        </Card>
        <Button component={Link} to="/products" variant="contained" size="large">
          Continue Shopping
        </Button>
      </Box>
    </Container>
  );
};


