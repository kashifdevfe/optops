import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
// import { disableInspect } from './utils/disableInspect.js';

// Disable inspect mode - DISABLED
// disableInspect();

ReactDOM.createRoot(document.getElementById('root')!).render(
  // Note: React.StrictMode intentionally double-invokes effects in development
  // to help detect side effects. This can cause API calls to appear twice in dev tools.
  // In production, effects only run once. Guards have been added to prevent duplicate calls.
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
