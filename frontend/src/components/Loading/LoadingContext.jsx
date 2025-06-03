import { createContext, useContext, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [visible, setVisible] = useState(false);

  const showLoading = () => setVisible(true);
  const hideLoading = () => setVisible(false);

  return (
    <LoadingContext.Provider value={{ showLoading, hideLoading }}>
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
