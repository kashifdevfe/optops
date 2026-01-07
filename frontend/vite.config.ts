import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    headers: {
      // Content Security Policy - protects against XSS and other attacks
      // Using proxy for API means we can use 'self' for connect-src
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for Vite dev
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Allow inline styles (MUI)
        "img-src 'self' data: https: blob:", // Allow images
        "font-src 'self' data: https://fonts.gstatic.com", // Allow fonts
        "connect-src 'self' http://localhost:5000 ws://localhost:5173", // Allow API (will use proxy once config updates), WebSocket for HMR
        "frame-src 'none'", // Block iframes
        "object-src 'none'", // Block objects
        "base-uri 'self'", // Restrict base tag
        "form-action 'self'", // Restrict form submissions
        "frame-ancestors 'none'", // Prevent clickjacking
      ].join('; '),
      // Additional security headers
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    },
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  // Also set headers for preview/production build
  preview: {
    port: 5173,
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'", // Remove unsafe-eval in production
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data: https://fonts.gstatic.com",
        // Allow API calls to backend URL (will be set via env var)
        `connect-src 'self' ${process.env.VITE_API_URL || ''}`,
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
      ].filter(Boolean).join('; '),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    },
  },
});
