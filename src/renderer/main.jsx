import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n';
import { restoreInterfaceTheme } from './features/settings/interfaceThemes';

// Self-hosted fonts (bundled by Vite, served from the app origin instead of Google's CDN)
import '@fontsource-variable/inter';
import '@fontsource-variable/inter/wght-italic.css';
import '@fontsource-variable/merriweather';
import '@fontsource-variable/merriweather/wght-italic.css';
import '@fontsource-variable/jetbrains-mono';
import '@fontsource-variable/jetbrains-mono/wght-italic.css';

import './index.css';
import './features/settings/lightThemes.css';

restoreInterfaceTheme();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </React.StrictMode>
);


