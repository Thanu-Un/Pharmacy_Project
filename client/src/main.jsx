import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import './i18n';

// Global fetch interceptor to automatically attach JWT token to all requests
const originalFetch = window.fetch.bind(window);
window.fetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  
  if (token) {
    // Check if headers is a Headers instance
    if (options.headers instanceof Headers) {
      options.headers.set('Authorization', `Bearer ${token}`);
    } else {
      options.headers = {
        ...options.headers,
        'Authorization': `Bearer ${token}`
      };
    }
  }
  
  return originalFetch(url, options);
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
