import { Outlet } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, IconButton, Badge } from '@mui/material';
import { ShoppingCart, Menu } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useState } from 'react';
import logoImage from '../assets/isbopt.png';

export const Layout = () => {
  const { getTotalItems } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#FFFFFF' }}>
      <AppBar position="sticky" sx={{ bgcolor: '#FFFFFF', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)' }}>
        <Container maxWidth="xl">
          <Toolbar sx={{ justifyContent: 'space-between', py: 2, minHeight: '80px !important' }}>
            <Box
              component={Link}
              to="/"
              sx={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                '&:hover': {
                  opacity: 0.9,
                },
                transition: 'opacity 0.2s ease-in-out',
              }}
            >
              <Box
                component="img"
                src={logoImage}
                alt="Islamabad Optics Logo"
                sx={{
                  height: { xs: 50, md: 60 },
                  width: 'auto',
                  maxWidth: { xs: '200px', md: '250px' },
                  objectFit: 'contain',
                }}
              />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Typography
                component={Link}
                to="/products"
                sx={{
                  color: 'text.primary',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -4,
                    left: 0,
                    width: 0,
                    height: '2px',
                    bgcolor: 'primary.main',
                    transition: 'width 0.3s ease',
                  },
                  '&:hover::after': {
                    width: '100%',
                  },
                }}
              >
                Products
              </Typography>
              <IconButton
                onClick={() => navigate('/cart')}
                sx={{
                  color: 'text.primary',
                  '&:hover': {
                    color: 'primary.main',
                  },
                }}
              >
                <Badge
                  badgeContent={getTotalItems()}
                  sx={{
                    '& .MuiBadge-badge': {
                      bgcolor: 'primary.main',
                      color: 'black',
                      fontWeight: 700,
                    },
                  }}
                >
                  <ShoppingCart />
                </Badge>
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Box 
        component="main" 
        sx={{ 
          flexGrow: 1,
          backgroundColor: '#FFFFFF',
          position: 'relative',
        }}
      >
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
        <Box sx={{ position: 'relative', zIndex: 1 }}>
          <Outlet />
        </Box>
      </Box>
      <Box
        component="footer"
        sx={{
          bgcolor: '#FFFFFF',
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          py: 6,
          mt: 'auto',
        }}
      >
        <Container maxWidth="xl">
          <Typography
            variant="body2"
            align="center"
            sx={{ color: 'text.secondary', letterSpacing: '0.1em' }}
          >
            © 2024 ISLAMABAD OPTICS. ALL RIGHTS RESERVED.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

