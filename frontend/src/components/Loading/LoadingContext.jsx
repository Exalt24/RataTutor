import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [visible, setVisible] = useState(false);

  // Stable functions and a stable value: consumers can list them as effect dependencies without re-running every render.
  const showLoading = useCallback(() => setVisible(true), []);
  const hideLoading = useCallback(() => setVisible(false), []);
  const value = useMemo(() => ({ showLoading, hideLoading }), [showLoading, hideLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      {visible && <LoadingSpinner />}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error("useLoading must be used within a <LoadingProvider>");
  }
  return context;
}
