import { createPortal } from 'react-dom';

const VARIANT_STYLES = {
  success: 'toast-success',
  error:   'toast-error',
  info:    'toast-info',
};

export default function Toast({ visible, variant = 'info', children }) {
  const mountNode = document.getElementById('portal-root');
  if (!mountNode) return null;

  return createPortal(
    <div className={`toast ${VARIANT_STYLES[variant]} ${visible ? 'visible' : ''}`}>
      {children}
    </div>,
    mountNode
  );
}