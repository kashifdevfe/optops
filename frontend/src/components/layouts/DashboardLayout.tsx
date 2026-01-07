import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  useTheme,
  alpha,
  Stack,
  Chip,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import InventoryIcon from '@mui/icons-material/Inventory';
import SettingsIcon from '@mui/icons-material/Settings';
import PaletteIcon from '@mui/icons-material/Palette';
import LogoutIcon from '@mui/icons-material/Logout';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PersonIcon from '@mui/icons-material/Person';
import CalculateIcon from '@mui/icons-material/Calculate';
import ReceiptIcon from '@mui/icons-material/Receipt';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import StoreIcon from '@mui/icons-material/Store';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { useAppSelector, useAppDispatch } from '../../hooks/redux.js';
import { logout, clearAuth } from '../../store/slices/authSlice.js';

const DRAWER_WIDTH = 280;

const settingsItems = [
  { text: 'Users', icon: <PeopleIcon />, path: '/users' },
  { text: 'Company Settings', icon: <SettingsIcon />, path: '/company' },
  { text: 'Theme Settings', icon: <PaletteIcon />, path: '/theme' },
];

export const DashboardLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user, company, themeSettings } = useAppSelector((state) => state.auth);

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Sales', icon: <ShoppingCartIcon />, path: '/sales' },
    { text: 'Customers', icon: <PersonIcon />, path: '/customers' },
    { text: 'Inventory', icon: <InventoryIcon />, path: '/inventory' },
    { text: 'Calculators', icon: <CalculateIcon />, path: '/calculators' },
    { text: 'Audits', icon: <ReceiptIcon />, path: '/audits' },
    { text: 'Salary & Bills', icon: <AttachMoneyIcon />, path: '/salary' },
    ...(company?.ecommerceEnabled
      ? [
          { text: 'Ecommerce Mgt', icon: <StoreIcon />, path: '/ecommerce', divider: true },
          { text: 'Products', icon: <ShoppingBagIcon />, path: '/ecommerce/products' },
          { text: 'Orders', icon: <ReceiptIcon />, path: '/ecommerce/orders' },
        ]
      : []),
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleMenuClose(); // Close menu first
    try {
      // Clear Redux state and localStorage immediately
      dispatch(clearAuth());
      localStorage.clear();
      // Try to call logout API (may fail, but we've already cleared everything)
      await dispatch(logout()).unwrap();
    } catch (error) {
      // Even if logout API fails, we've already cleared everything
      console.error('Logout error:', error);
    }
    // Navigate to login page
    navigate('/login', { replace: true });
  };

  const isActive = (path: string) => location.pathname === path;

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 3,
          minHeight: 64,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        {themeSettings?.logoUrl ? (
          <Box
            component="img"
            src={themeSettings.logoUrl}
            alt={company?.name || 'Company Logo'}
            sx={{
              maxHeight: 48,
              maxWidth: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {company?.name || 'OptOps'}
          </Typography>
        )}
      </Toolbar>

      <Box sx={{ flexGrow: 1, overflow: 'auto', py: 2 }}>
        <List sx={{ px: 2 }}>
          {menuItems.map((item, index) => {
            const active = isActive(item.path);
            const showDivider = (item as any).divider && index > 0;
            return (
              <React.Fragment key={item.text}>
                {showDivider && <Divider sx={{ my: 2 }} />}
                <ListItem disablePadding sx={{ mb: 0.5 }}>
                  <ListItemButton
                    onClick={() => {
                      navigate(item.path);
                      setMobileOpen(false);
                    }}
                    sx={{
                      borderRadius: 2,
                      minHeight: 44,
                      px: 2,
                      backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                      color: active ? theme.palette.primary.main : 'text.primary',
                      '&:hover': {
                        backgroundColor: active ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.action.hover, 0.04),
                      },
                      '& .MuiListItemIcon-root': {
                        color: active ? theme.palette.primary.main : 'text.secondary',
                        minWidth: 40,
                      },
                      '& .MuiListItemText-primary': {
                        fontWeight: active ? 600 : 400,
                      },
                    }}
                  >
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              </React.Fragment>
            );
          })}
        </List>

        <Divider sx={{ my: 2, mx: 2 }} />

        <Box sx={{ px: 2, mb: 1 }}>
          <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
            Settings
          </Typography>
        </Box>

        <List sx={{ px: 2 }}>
          {settingsItems.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => {
                    navigate(item.path);
                    setMobileOpen(false);
                  }}
                  sx={{
                    borderRadius: 2,
                    minHeight: 44,
                    px: 2,
                    backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
                    color: active ? theme.palette.primary.main : 'text.primary',
                    '&:hover': {
                      backgroundColor: active ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.action.hover, 0.04),
                    },
                    '& .MuiListItemIcon-root': {
                      color: active ? theme.palette.primary.main : 'text.secondary',
                      minWidth: 40,
                    },
                    '& .MuiListItemText-primary': {
                      fontWeight: active ? 600 : 400,
                    },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.text} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', backgroundColor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { sm: `${DRAWER_WIDTH}px` },
          backgroundColor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
          color: 'text.primary',
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3 } }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          <Box sx={{ flexGrow: 1 }} />

          <Stack direction="row" spacing={2} alignItems="center">
            <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                {company?.name}
              </Typography>
            </Box>
            <IconButton onClick={handleMenuOpen} sx={{ p: 0 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'primary.main',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {user?.name.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  boxShadow: '0 0 2px 0 rgba(145, 158, 171, 0.08), 0 12px 24px -4px rgba(145, 158, 171, 0.08)',
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider' }}>
                <Typography variant="subtitle2" noWrap>
                  {user?.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" noWrap>
                  {user?.email}
                </Typography>
              </Box>
              <MenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  handleLogout();
                }} 
                sx={{ py: 1.5 }}
              >
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                Logout
              </MenuItem>
            </Menu>
          </Stack>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{
          width: { sm: DRAWER_WIDTH },
          flexShrink: { sm: 0 },
        }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: DRAWER_WIDTH,
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { sm: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          backgroundColor: '#F5F7FA',
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
          }}
        />
        <Toolbar />
        <Box sx={{ p: { xs: 2, sm: 3 }, position: 'relative', zIndex: 1 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};