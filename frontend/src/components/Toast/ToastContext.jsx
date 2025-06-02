
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import Toast from './Toast';

const ToastContext = createContext();


export function ToastProvider({ children }) {
  const [toastProps, setToastProps] = useState({
    visible: false,
    variant: 'info',
    title: '',
    subtitle: '',
    duration: 2500,
  });

  
  const showToast = useCallback(({ variant = 'info', title, subtitle = '', duration = 2500 }) => {
    setToastProps({ visible: true, variant, title, subtitle, duration });
  }, []);

  
  useEffect(() => {
    if (!toastProps.visible) return;
    const timer = setTimeout(() => {
      setToastProps(prev => ({ ...prev, visible: false }));
    }, toastProps.duration);
    return () => clearTimeout(timer);
  }, [toastProps.visible, toastProps.duration]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Toast
        visible={toastProps.visible}
        variant={toastProps.variant}
        message={{ title: toastProps.title, subtitle: toastProps.subtitle }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}
