import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import * as Sentry from "@sentry/react";
import { GrowthBook, GrowthBookProvider } from "@growthbook/growthbook-react";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  integrations: [],
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV
});

// Configura GrowthBook
const growthbook = new GrowthBook({
  features: {
    "show-experiment-button": { defaultValue: true }
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <GrowthBookProvider growthbook={growthbook}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </GrowthBookProvider>
  </React.StrictMode>
);

reportWebVitals();
