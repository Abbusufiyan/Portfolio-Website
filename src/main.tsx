import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { SmoothScrolling } from './components/smooth-scrolling';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SmoothScrolling>
      <App />
    </SmoothScrolling>
  </React.StrictMode>
);
