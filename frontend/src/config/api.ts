// API Base URL Configuration
const getApiBaseURL = () => {
  // Check for environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // In production, use the full backend URL
  if (import.meta.env.PROD) {
    return 'https://backend-8bufyhvwf-kashifmhmds-projects.vercel.app';
  }

  // In development, use relative path for Vite proxy
  return '/api';
};

export const API_URL = getApiBaseURL();
