import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ToastProvider } from './components/Toast/ToastContext';
import { LoadingProvider } from './components/Loading/LoadingContext';
import App from './App.jsx'
import './styles/index.css'
import './styles/global.css'


createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <LoadingProvider>
      <ToastProvider>
        <App />
      </ToastProvider>
    </LoadingProvider>
  </BrowserRouter>
)