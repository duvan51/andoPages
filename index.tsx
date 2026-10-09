
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { TenantProvider } from './context/TenantContext';
import { CartProvider } from './context/CartContext';
import { CustomerAuthProvider } from './context/CustomerAuthContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <TenantProvider>
      <CartProvider>
        <CustomerAuthProvider>
          <App />
        </CustomerAuthProvider>
      </CartProvider>
    </TenantProvider>
  </React.StrictMode>
);
