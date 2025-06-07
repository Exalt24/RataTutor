'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import React, { isValidElement } from 'react';

const pastelActiveLight = 'bg-gradient-to-br from-[#FFE1E7] via-[#FFB3C4] to-[#FF90A8]';
const pastelHoverLight = 'hover:from-[#FFB3C4] hover:via-[#FF90A8] hover:to-[#FF6B8A]';
const pastelBorderLight = 'border-[#FF90A8]';
const pastelHeaderHover = 'hover:bg-[#FFC1CF]';
const pastelHeaderActive = 'bg-[#FF90A8]';
const pastelHeader = 'bg-[#FFB3C4]';

const AccordionContext = React.createContext({
  isActive: false,
  value: '',
  onChangeIndex: () => {},
});
const useAccordion = () => React.useContext(AccordionContext);

export function AccordionContainer({ children, className }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ${className}`}>
      {children}
    </div>
  );
}

export function AccordionWrapper({ children }) {
  return <div>{children}</div>;
}

export function Accordion({ children, multiple, defaultValue }) {
  const [activeIndex, setActiveIndex] = React.useState(
    multiple
      ? defaultValue
        ? Array.isArray(defaultValue)
          ? defaultValue
          : [defaultValue]
        : []
      : defaultValue
        ? Array.isArray(defaultValue)
          ? [defaultValue[0]]
          : [defaultValue]
        : []
  );

  function onChangeIndex(value) {
    setActiveIndex((currentActiveIndex) => {
      if (!multiple) return value === currentActiveIndex[0] ? [] : [value];
      return currentActiveIndex.includes(value)
        ? currentActiveIndex.filter((i) => i !== value)
        : [...currentActiveIndex, value];
    });
  }

  return React.Children.map(children, (child) => {
    if (!isValidElement(child)) return null;
    const value = child.props.value ?? '';
    const isActive = multiple
      ? activeIndex.includes(value)
      : activeIndex[0] === value;
    return (
      <AccordionContext.Provider value={{ isActive, value, onChangeIndex }}>
        {React.cloneElement(child)}
      </AccordionContext.Provider>
    );
  });
}

export function AccordionItem({ children, value }) {
  const { isActive } = useAccordion();
  return (
    <div
      data-active={isActive || undefined}
      data-value={value}
      className={`
        rounded-xl overflow-hidden mb-3 border-2 transition-all 
        ${isActive
          ? `${pastelActiveLight} ${pastelBorderLight} `
          : `bg-white ${pastelBorderLight} hover:shadow-md`}
      `}
    >
      {children}
    </div>
  );
}

export function AccordionHeader({ children, customIcon, className }) {
  const { isActive, value, onChangeIndex } = useAccordion();
  return (
    <motion.div
      data-active={isActive || undefined}
      className={`group cursor-pointer font-semibold flex justify-between items-center
        text-black transition-all
        px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base
        min-w-full sm:min-w-[315px]
        ${isActive ? pastelHeaderActive : pastelHeader}
        ${pastelHoverLight} ${pastelHeaderHover}
        ${className || ''}`
      }
      onClick={() => onChangeIndex(value)}
    >
      {children}
      {!customIcon && (
        <ChevronDown
          className={`transition-transform text-[#5e4149] hover:text-[#ff7c99] ${
            isActive ? 'rotate-180' : 'rotate-0'
          }`}
        />
      )}
    </motion.div>
  );
}

export function AccordionPanel({ children, className }) {
  const { isActive } = useAccordion();
  return (
    <AnimatePresence initial={true}>
      {isActive && (
        <motion.div
          data-active={isActive || undefined}
          initial={{ height: 0 }}
          animate={{ height: 'auto' }}
          exit={{ height: 0 }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          className={`group bg-pink-50 ${className}`}
          style={{ overflow: 'hidden' }}
        >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base text-gray-800"
        >
          {children}
        </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
