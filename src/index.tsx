// filepath: /d:/GitHub/SBE_viewer/gis-viewer-app/src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom';
import './style/style.css';
import App from './App';

document.title = "SBE Viewer";
const link = document.createElement('link');
link.rel = 'icon';
link.href = 'favicon.ico';
document.head.appendChild(link);


ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);