// Use relative path to leverage Vite proxy (works with CSP 'self')
// This makes API calls appear as same-origin, which is more secure
const getApiBaseURL = () => {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  // Use proxy path in both dev and production (Vite proxy handles dev, server handles prod)
  return '/api';
};

export const API_URL = getApiBaseURL();
