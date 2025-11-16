import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// 1. Import Bootstrap's CSS file for styling
import 'bootstrap/dist/css/bootstrap.css';

// 2. Import the Router from react-router-dom
import { BrowserRouter as Router } from 'react-router-dom';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* 3. Wrap your entire <App> in the <Router> */}
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);

reportWebVitals();