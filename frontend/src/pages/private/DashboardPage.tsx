import React, { useEffect, useState, useRef } from 'react';
import { Box, Typography, Grid, Card, CardContent, useTheme, alpha } from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import { dashboardApi } from '../../services/api.js';
import type { DashboardStats } from '../../types/index.js';
import { LoadingSpinner } from '../../components/common/LoadingSpinner.js';
import { formatCurrency } from '../../utils/currency.js';

export const DashboardPage: React.FC = () => {
  const theme = useTheme();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false); // Prevent duplicate calls

  useEffect(() => {
    // Prevent duplicate calls (especially important with React.StrictMode)
    if (loadingRef.current) {
      return;
    }

    const loadStats = async () => {
      loadingRef.current = true;
      try {
        const data = await dashboardApi.getStats();
        // Ensure all expected properties exist with default values
        setStats({
          totalCustomers: data?.totalCustomers || 0,
          totalSales: data?.totalSales || 0,
          totalInventoryItems: data?.totalInventoryItems || 0,
          todayOrders: data?.todayOrders || 0,
          monthlySales: data?.monthlySales || {},
          salesByCategory: data?.salesByCategory || {},
          topSellingItems: Array.isArray(data?.topSellingItems) ? data.topSellingItems : [],
          salesByStatus: data?.salesByStatus || {},
          weeklySales: data?.weeklySales || {},
          monthlyRevenue: data?.monthlyRevenue || {},
          monthlyProfit: data?.monthlyProfit || {},
          inventoryByCategory: data?.inventoryByCategory || {},
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
        // Set default empty stats on error
        setStats({
          totalCustomers: 0,
          totalSales: 0,
          totalInventoryItems: 0,
          todayOrders: 0,
          monthlySales: {},
          salesByCategory: {},
          topSellingItems: [],
          salesByStatus: {},
          weeklySales: {},
          monthlyRevenue: {},
          monthlyProfit: {},
          inventoryByCategory: {},
        });
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    };
    loadStats();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Prepare chart data
  const salesByCategoryData = stats?.salesByCategory && typeof stats.salesByCategory === 'object' && stats.salesByCategory !== null
    ? Object.entries(stats.salesByCategory)
        .filter(([label]) => label)
        .map(([label, value]) => ({
          name: String(label).length > 15 ? String(label).substring(0, 15) + '...' : String(label),
          value: Number(value) || 0,
        }))
        .filter(item => item.value > 0)
    : [];

  const salesByStatusData = stats?.salesByStatus && typeof stats.salesByStatus === 'object' && stats.salesByStatus !== null
    ? Object.entries(stats.salesByStatus)
        .filter(([label]) => label)
        .map(([label, value]) => ({
          name: String(label).charAt(0).toUpperCase() + String(label).slice(1),
          value: Number(value) || 0,
        }))
        .filter(item => item.value > 0)
    : [];

  const revenueProfitData = stats?.monthlyRevenue && typeof stats.monthlyRevenue === 'object' && stats.monthlyRevenue !== null
    ? Object.keys(stats.monthlyRevenue).map(key => ({
        name: String(key),
        revenue: Number(stats.monthlyRevenue[key]) || 0,
        profit: Number(stats.monthlyProfit?.[key]) || 0,
      }))
    : [];

  const weeklySalesData = stats?.weeklySales && typeof stats.weeklySales === 'object' && stats.weeklySales !== null
    ? Object.entries(stats.weeklySales)
        .filter(([week]) => week)
        .map(([week, value]) => ({ name: String(week), sales: Number(value) || 0 }))
    : [];

  const topSellingItemsData = stats?.topSellingItems && Array.isArray(stats.topSellingItems)
    ? stats.topSellingItems
        .filter(item => item && item.name && item.count !== undefined && item.count !== null)
        .map(item => ({
          name: String(item.name).length > 20 ? String(item.name).substring(0, 20) + '...' : String(item.name),
          count: Number(item.count) || 0,
        }))
        .filter(item => item.count > 0)
        .slice(0, 10)
    : [];

  const inventoryByCategoryData = stats?.inventoryByCategory && typeof stats.inventoryByCategory === 'object' && stats.inventoryByCategory !== null && !Array.isArray(stats.inventoryByCategory)
    ? Object.entries(stats.inventoryByCategory)
        .filter(([key, value]) => key && value != null)
        .map(([key, value]) => {
          const numValue = Number(value);
          return !isNaN(numValue) ? { name: String(key), value: numValue } : null;
        })
        .filter((item): item is { name: string; value: number } => item !== null)
        .filter(item => item.value > 0)
    : [];

  // Color palette
  const COLORS = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.info.main,
    theme.palette.error.main,
  ];

  const statCards = [
    {
      title: 'Total Customers',
      value: stats?.totalCustomers || 0,
      description: 'Total customers registered',
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.primary.main,
    },
    {
      title: 'Sales (Completed)',
      value: stats?.totalSales || 0,
      description: 'Completed sales',
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.success.main,
    },
    {
      title: 'Inventory Items',
      value: stats?.totalInventoryItems || 0,
      description: 'Total inventory items',
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.info.main,
    },
    {
      title: "Today's Orders",
      value: stats?.todayOrders || 0,
      description: 'Orders placed today',
      icon: <TrendingUpIcon sx={{ fontSize: 32 }} />,
      color: theme.palette.warning.main,
    },
  ];

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1, fontWeight: 700, color: 'text.primary' }}>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
        Welcome back! Here's what's happening with your business today.
      </Typography>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {statCards.map((stat, index) => (
          <Grid item xs={12} sm={6} md={3} key={index}>
            <Card
              sx={{
                position: 'relative',
                overflow: 'visible',
                borderRadius: '12px',
                border: '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                backgroundColor: '#FFFFFF',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  background: `linear-gradient(90deg, ${stat.color} 0%, ${alpha(stat.color, 0.5)} 100%)`,
                  borderRadius: '12px 12px 0 0',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box>
                    <Typography variant="body2" sx={{ color: 'text.secondary', mb: 0.5, fontWeight: 500 }}>
                      {stat.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {stat.value.toLocaleString()}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: alpha(stat.color, 0.08),
                      color: stat.color,
                    }}
                  >
                    {stat.icon}
                  </Box>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {stat.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        {/* Sales by Category Pie Chart */}
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              backgroundColor: '#FFFFFF',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                Sales by Category
              </Typography>
              {salesByCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={salesByCategoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      innerRadius={30}
                      fill={theme.palette.primary.main}
                      dataKey="value"
                    >
                      {salesByCategoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: theme.shape.borderRadius,
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No category data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Revenue vs Profit Line Chart */}
        <Grid item xs={12} md={8}>
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              backgroundColor: '#FFFFFF',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                Revenue vs Profit (Last 6 Months)
              </Typography>
              {revenueProfitData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={revenueProfitData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="name"
                      stroke={theme.palette.text.secondary}
                      style={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis
                      stroke={theme.palette.text.secondary}
                      style={{ fill: theme.palette.text.secondary }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: theme.shape.borderRadius,
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke={theme.palette.success.main}
                      name="Revenue"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke={theme.palette.info.main}
                      name="Profit (Est.)"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No revenue data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Sales by Status Pie Chart */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              backgroundColor: '#FFFFFF',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                Sales by Status
              </Typography>
              {salesByStatusData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={salesByStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      innerRadius={30}
                      fill={theme.palette.primary.main}
                      dataKey="value"
                    >
                      {salesByStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: theme.shape.borderRadius,
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No status data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Top Selling Items */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              backgroundColor: '#FFFFFF',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                Top Selling Items
              </Typography>
              {topSellingItemsData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={topSellingItemsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis
                      type="number"
                      stroke={theme.palette.text.secondary}
                      style={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis
                      type="category"
                      dataKey="name"
                      stroke={theme.palette.text.secondary}
                      style={{ fill: theme.palette.text.secondary }}
                      width={120}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: theme.shape.borderRadius,
                      }}
                    />
                    <Legend />
                    <Bar dataKey="count" fill={theme.palette.warning.main} name="Sales Count" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No items data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Weekly Sales Trend */}
        <Grid item xs={12} md={6}>
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              backgroundColor: '#FFFFFF',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                Weekly Sales Trend (Last 8 Weeks)
              </Typography>
              {weeklySalesData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={weeklySalesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="name"
                      stroke={theme.palette.text.secondary}
                      style={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis
                      stroke={theme.palette.text.secondary}
                      style={{ fill: theme.palette.text.secondary }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: theme.shape.borderRadius,
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="sales"
                      stroke={theme.palette.secondary.main}
                      name="Sales"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No weekly data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Inventory Value by Category */}
        <Grid item xs={12}>
          <Card
            sx={{
              borderRadius: '12px',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
              backgroundColor: '#FFFFFF',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 600, color: 'text.primary' }}>
                Inventory Value by Category
              </Typography>
              {inventoryByCategoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={inventoryByCategoryData}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
                    <XAxis
                      dataKey="name"
                      stroke={theme.palette.text.secondary}
                      style={{ fill: theme.palette.text.secondary }}
                    />
                    <YAxis
                      stroke={theme.palette.text.secondary}
                      style={{ fill: theme.palette.text.secondary }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: theme.shape.borderRadius,
                      }}
                    />
                    <Legend />
                    <Bar dataKey="value" fill={theme.palette.info.main} name="Inventory Value" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <Box sx={{ height: 350, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    No inventory data available
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
