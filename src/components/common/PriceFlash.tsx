import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getChangeColor } from '@/utils/formatters';

interface PriceFlashProps {
  value: number;
  formatter: (value: number) => string;
  className?: string;
}

export const PriceFlash: React.FC<PriceFlashProps> = ({ value, formatter, className = '' }) => {
  const [prevValue, setPrevValue] = useState(value);
  const [flashColor, setFlashColor] = useState<string | null>(null);

  useEffect(() => {
    if (value !== prevValue) {
      const change = value - prevValue;
      setFlashColor(change > 0 ? '#26a69a' : '#ef5350');

      const timer = setTimeout(() => {
        setFlashColor(null);
      }, 500);

      setPrevValue(value);

      return () => clearTimeout(timer);
    }
  }, [value, prevValue]);

  const colorClass = flashColor 
    ? '' 
    : getChangeColor(value - prevValue);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={value}
        initial={{ opacity: 0.7 }}
        animate={{ 
          opacity: 1,
          color: flashColor || undefined,
        }}
        exit={{ opacity: 0.7 }}
        transition={{ duration: 0.3 }}
        className={`${colorClass} ${className}`}
        style={flashColor ? { color: flashColor } : undefined}
      >
        {formatter(value)}
      </motion.span>
    </AnimatePresence>
  );
};
