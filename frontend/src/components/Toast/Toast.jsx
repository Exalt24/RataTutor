import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import '../../styles/components/toast.css';

const VARIANT_STYLES = {
  success: 'toast-success',
  error:   'toast-error',
  info:    'toast-info',
};

export default function Toast({
  visible,
  variant = 'info',
  message,         // { title: string, subtitle?: string }
  duration = 2500, // not strictly necessary here, since ToastProvider handles timing
  onClose,         // ToastProvider never passes this
}) {
  // The toast shows while `visible` is true until its own timer expires. `expired` is cleared when it is shown again
  // (React's "adjust state while rendering" pattern), so no state is set synchronously inside the effect.
  const [expired, setExpired] = useState(false);
  const [prevVisible, setPrevVisible] = useState(visible);
  if (visible !== prevVisible) {
    setPrevVisible(visible);
    if (visible) setExpired(false);
  }
  const internalVisible = visible && !expired;
  const mountNode = document.getElementById('portal-root');

  useEffect(() => {
    if (!mountNode || !visible) return;
    const timer = setTimeout(() => {
      setExpired(true);
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [mountNode, visible, duration, onClose]);

  if (!mountNode) return null;

  return createPortal(
    <div className={`toast ${VARIANT_STYLES[variant]} ${internalVisible ? 'visible' : ''}`}>
      {message ? (
        <>
          <span className="pixel-accent">{message.title}</span>
          {message.subtitle && (
            <span className="pixel-accent" style={{ marginLeft: '.5rem' }}>
              {message.subtitle}
            </span>
          )}
        </>
      ) : null}
    </div>,
    mountNode
  );
}
