'use client';
import React, {
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { motion, AnimatePresence, MotionConfig } from 'framer-motion';

const DialogContext = React.createContext(null);

function useDialog() {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useDialog must be used within a DialogProvider');
  return context;
}

function DialogProvider({ children, transition }) {
  const [isOpen, setIsOpen] = useState(false);
  const uniqueId = useId();
  const triggerRef = useRef(null);
  const contextValue = useMemo(
    () => ({ isOpen, setIsOpen, uniqueId, triggerRef }),
    [isOpen, uniqueId]
  );
  return (
    <DialogContext.Provider value={contextValue}>
      <MotionConfig transition={transition || { type: 'spring', stiffness: 60, damping: 20, duration: 1.2 }}>
        {children}
      </MotionConfig>
    </DialogContext.Provider>
  );
}

function Dialog({ children, transition }) {
  return (
    <DialogProvider transition={transition}>
      {children}
    </DialogProvider>
  );
}

function DialogTrigger({ children, className, style }) {
    const { setIsOpen, uniqueId } = useDialog();
  
    return (
      <motion.div
        layoutId={`dialog-${uniqueId}`}
        className={`relative ${className || ''}`}
        style={style}
        role="button"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </motion.div>
    );
  }  

function DialogContainer({ children, className }) {
  const { isOpen, setIsOpen, uniqueId } = useDialog();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return (
    <AnimatePresence initial={false} mode="sync">
      {isOpen && (
        <>
          <motion.div
            key={`backdrop-${uniqueId}`}
            className="fixed inset-0 h-full w-full z-40 bg-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <div
            className={`fixed top-[25%] inset-x-0 z-50 w-fit mx-auto ${className || ''}`}
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
          >
            {children}
          </div>
        </>
      )}
    </AnimatePresence>
  );
}


function DialogContent({ children, className, style }) {
  const { uniqueId } = useDialog();
  return (
    <motion.div
      key={`content-${uniqueId}`}
      layoutId={`content-${uniqueId}`}
      className={`bg-gradient-to-br from-blue-100 via-blue-200 to-cyan-100 dark:bg-gray-800 w-full max-w-2xl z-50 p-10 rounded-2xl shadow-xl relative ${className || ''}`}
      style={style}
      initial={{ opacity: 0, scale: 0.95, y: -30 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -30 }}
    >
      {children}
    </motion.div>
  );
}

function DialogTitle({ children, className }) {
  return <h2 className={`text-xl text-left font-bold mb-2 ${className || ''}`}>{children}</h2>;
}

function DialogDescription({ children, className }) {
  return <div className={`text-sm text-gray-600 ${className || ''}`}>{children}</div>;
}

function DialogClose({ className }) {
  const { setIsOpen } = useDialog();
}

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogContainer,
  DialogTitle,
  DialogDescription,
  DialogClose,
};
