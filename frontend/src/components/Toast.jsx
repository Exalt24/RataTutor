import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import '../styles/components/toast.css';

const VARIANT_STYLES = {
  success: 'toast-success',
  error:   'toast-error',
  info:    'toast-info',
};

export default function Toast({ visible, variant = 'info', children, duration = 2500, onClose }) {
  const [internalVisible, setInternalVisible] = useState(visible);
  const mountNode = document.getElementById('portal-root');
  if (!mountNode) return null;

  useEffect(() => {
    if (visible) {
      setInternalVisible(true);

      const timer = setTimeout(() => {
        setInternalVisible(false);
        onClose?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  return createPortal(
    <div className={`toast ${VARIANT_STYLES[variant]} ${internalVisible ? 'visible' : ''}`}>
      {children}
    </div>,
    mountNode
  );
}
