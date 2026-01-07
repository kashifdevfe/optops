import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store/index.js';
import { useAppSelector } from './hooks/redux.js';
import { createAppTheme } from './utils/theme.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';
import { AuthInitializer } from './components/common/AuthInitializer.js';
import { DashboardLayout } from './components/layouts/DashboardLayout.js';
import { LandingPage } from './pages/public/LandingPage.js';
import { LoginPage } from './pages/public/LoginPage.js';
import { SignupPage } from './pages/public/SignupPage.js';
import { ForgotPasswordPage } from './pages/public/ForgotPasswordPage.js';
import { DashboardPage } from './pages/private/DashboardPage.js';
import { CompanySettingsPage } from './pages/private/CompanySettingsPage.js';
import { ThemeSettingsPage } from './pages/private/ThemeSettingsPage.js';
import { UsersPage } from './pages/private/UsersPage.js';
import { CustomersPage } from './pages/private/CustomersPage.js';
import { SalesPage } from './pages/private/SalesPage.js';
import { InventoryPage } from './pages/private/InventoryPage.js';
import { CalculatorsPage } from './pages/private/CalculatorsPage.js';
import { AuditsPage } from './pages/private/AuditsPage.js';
import { SalaryPage } from './pages/private/SalaryPage.js';
import { EcommerceProductsPage } from './pages/private/EcommerceProductsPage.js';
import { EcommerceOrdersPage } from './pages/private/EcommerceOrdersPage.js';
import { AdminLoginPage } from './pages/admin/AdminLoginPage.js';
import { AdminCompaniesPage } from './pages/admin/AdminCompaniesPage.js';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage.js';
import { AdminLayout } from './components/layouts/AdminLayout.js';
import { AdminProtectedRoute } from './components/common/AdminProtectedRoute.js';

const AppRoutes: React.FC = () => {
  const { themeSettings, isAuthenticated } = useAppSelector((state) => state.auth);
  const theme = createAppTheme(themeSettings);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
        <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        <Route path="/signup" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <SignupPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/sales" element={<SalesPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/calculators" element={<CalculatorsPage />} />
          <Route path="/clpc" element={<Navigate to="/calculators" replace />} />
          <Route path="/audits" element={<AuditsPage />} />
          <Route path="/salary" element={<SalaryPage />} />
          <Route path="/ecommerce" element={<Navigate to="/ecommerce/products" replace />} />
          <Route path="/ecommerce/products" element={<EcommerceProductsPage />} />
          <Route path="/ecommerce/orders" element={<EcommerceOrdersPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/company" element={<CompanySettingsPage />} />
          <Route path="/theme" element={<ThemeSettingsPage />} />
        </Route>
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route path="/admin/companies" element={<AdminCompaniesPage />} />
          <Route path="/admin/customers" element={<AdminCustomersPage />} />
        </Route>
      </Routes>
    </ThemeProvider>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthInitializer>
          <AppRoutes />
        </AuthInitializer>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
