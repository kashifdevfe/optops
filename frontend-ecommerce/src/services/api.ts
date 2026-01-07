import axios from 'axios';

// Use relative path to leverage Vite proxy (works with CSP 'self')
// This makes API calls appear as same-origin, which is more secure
const getApiBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Use proxy path in both dev and production (Vite proxy handles dev, server handles prod)
  return '/api/ecommerce';
};

const api = axios.create({
  baseURL: getApiBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Include cookies in requests
});

export const productApi = {
  getProducts: async (filters?: {
    category?: string;
    gender?: string;
    frameType?: string;
    minPrice?: number;
    maxPrice?: number;
    featured?: boolean;
  }) => {
    const params = new URLSearchParams();
    if (filters?.category) params.append('category', filters.category);
    if (filters?.gender) params.append('gender', filters.gender);
    if (filters?.frameType) params.append('frameType', filters.frameType);
    if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
    if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
    if (filters?.featured !== undefined) params.append('featured', filters.featured.toString());
    
    const response = await api.get(`/products?${params.toString()}`);
    return response.data;
  },

  getProduct: async (id: string) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
};

export const orderApi = {
  createOrder: async (data: any) => {
    const response = await api.post('/orders', data);
    return response.data;
  },
};

