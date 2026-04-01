import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Conditionally load Emergent visual edit scripts only when explicitly enabled
// Set VITE_ENABLE_EMERGENT=true in a .env when you need the tooling
if (import.meta.env.VITE_ENABLE_EMERGENT === 'true' && window.self !== window.top) {
  const emergentMain = document.createElement('script');
  emergentMain.src = 'https://assets.emergent.sh/scripts/emergent-main.js';
  emergentMain.async = true;
  document.head.appendChild(emergentMain);

  const debugMonitorScript = document.createElement('script');
  debugMonitorScript.src = 'https://assets.emergent.sh/scripts/debug-monitor.js';
  debugMonitorScript.async = true;
  document.head.appendChild(debugMonitorScript);
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
