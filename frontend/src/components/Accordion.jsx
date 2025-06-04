'use client';
import React, { isValidElement } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

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
  return <div className={`grid grid-cols-2 gap-2 ${className}`}>{children}</div>;
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
      className={`
        group p-4 cursor-pointer font-semibold flex justify-between items-center
        text-black transition-all
        ${isActive ? `${pastelHeaderActive}` : `${pastelHeader}`}
        ${pastelHoverLight} ${pastelHeaderHover}
      `}
      onClick={() => onChangeIndex(value)}
    >
      {children}
      {!customIcon && (
        <ChevronDown
          className={`transition-transform text-[#5e4149] hover:text-[#ff7c99] ${isActive ? 'rotate-180' : 'rotate-0'}`}
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
          initial={{ height: 0, overflow: 'hidden' }}
          animate={{ height: 'auto', overflow: 'hidden' }}
          exit={{ height: 0 }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
          className={`group bg-pink-50 transition-all ${className}`}
        >
          <motion.article
            initial={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
            animate={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0% 100%)' }}
            exit={{ clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' }}
            transition={{ type: 'spring', duration: 0.4, bounce: 0 }}
            className="p-3 text-sm text-gray-800"
          >
            {children}
          </motion.article>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
