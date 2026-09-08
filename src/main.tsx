import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { ToastProvider } from './components/common/ToastProvider.tsx';
import { I18nProvider } from './i18n/I18nContext.tsx';
import { SaveToBuyProvider } from './context/SaveToBuyContext';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider language="uz">
      <ToastProvider>
        <SaveToBuyProvider>
          <App />
        </SaveToBuyProvider>
      </ToastProvider>
    </I18nProvider>
  </StrictMode>,
);