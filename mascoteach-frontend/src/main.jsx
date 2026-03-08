import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { MascotProvider } from './contexts/MascotContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <MascotProvider>
        <App />
      </MascotProvider>
    </AuthProvider>
  </React.StrictMode>
);
