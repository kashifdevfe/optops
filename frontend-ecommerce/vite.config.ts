import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    headers: {
      // Content Security Policy - protects against XSS and other attacks
      // Using proxy for API means we can use 'self' for connect-src
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for Vite dev
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // Allow inline styles (MUI)
        "img-src 'self' data: https: blob:", // Allow images
        "font-src 'self' data: https://fonts.gstatic.com", // Allow fonts
        "connect-src 'self' ws://localhost:3001", // API via proxy (same-origin), WebSocket for HMR
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
        secure: false,
      },
    },
  },
  // Also set headers for preview/production build
  preview: {
    port: 3001,
    headers: {
      'Content-Security-Policy': [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline'", // Remove unsafe-eval in production
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data: https://fonts.gstatic.com",
        "connect-src 'self'", // In production, API should be same origin or configure your API URL
        "frame-src 'none'",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'",
        "frame-ancestors 'none'",
        "upgrade-insecure-requests",
      ].join('; '),
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    },
  },
});

