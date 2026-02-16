import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  action?: React.ReactNode;
  noPadding?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  title,
  action,
  noPadding = false,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-app-surface border border-app-border rounded-lg shadow-lg ${className}`}
    >
      {title && (
        <div className="px-4 py-3 border-b border-app-border flex items-center justify-between">
          <h3 className="text-sm font-semibold text-app-text">{title}</h3>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className={`flex-1 min-h-0 ${noPadding ? '' : 'p-4'} ${className.includes('flex') ? 'flex flex-col' : ''}`}>
        {children}
      </div>
    </motion.div>
  );
};
