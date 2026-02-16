import React, { useState } from 'react';
import { StockQuote } from '@/types';
import { stockService } from '@/services/stockService';
import { X, GripVertical } from 'lucide-react';

interface StockItemProps {
  stock: StockQuote;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent<HTMLDivElement>, symbol: string) => void;
  onRemove?: (symbol: string) => void;
  onClick?: (stock: StockQuote) => void;
}

export const StockItem: React.FC<StockItemProps> = ({
  stock,
  isDragging = false,
  onDragStart,
  onRemove,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const changeColor = stockService.getChangeColor(stock.change_percent);
  const formattedPrice = stockService.formatPrice(stock.price);
  const formattedChange = stockService.formatChangePercent(stock.change_percent);
  const formattedChangeValue = stockService.formatChangeValue(stock.change_value);

  return (
    <div
      draggable
      onDragStart={onDragStart ? (e) => onDragStart(e, stock.symbol) : undefined}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick?.(stock)}
      className={`
        flex items-center justify-between gap-3 px-4 py-3 md:py-4
        bg-app-surface border border-app-border rounded-lg
        hover:bg-app-bg transition-colors cursor-pointer
        ${isDragging ? 'opacity-50 bg-app-bg/50' : ''}
        group
      `}
    >
      {/* Drag Handle + Symbol + Name */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {onDragStart && (
          <div className="text-app-muted hover:text-app-text transition-colors cursor-grab active:cursor-grabbing flex-shrink-0">
            <GripVertical className="w-4 h-4" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Symbol - Large and Bold */}
          <div className="text-lg md:text-xl font-bold text-app-text leading-tight">
            {stock.symbol}
          </div>

          {/* Name - Smaller, Muted */}
          <div className="text-xs md:text-sm text-app-muted truncate">
            {stock.name}
          </div>
        </div>
      </div>

      {/* Price Block - Right Aligned */}
      <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
        {/* Price */}
        <div className="text-base md:text-lg font-bold text-app-text">
          {formattedPrice}
        </div>

        {/* Change Percentage + Value */}
        <div className={`flex items-center gap-1 text-xs md:text-sm font-semibold ${changeColor}`}>
          <span>{formattedChange}</span>
          <span className="text-app-muted">·</span>
          <span>{formattedChangeValue}</span>
        </div>
      </div>

      {/* Remove Button - Hidden until Hover */}
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(stock.symbol);
          }}
          className={`
            p-2 rounded-lg transition-colors flex-shrink-0
            ${isHovered ? 'bg-danger/20 text-danger hover:bg-danger/30' : 'text-app-muted group-hover:text-danger'}
          `}
          title="Remove from watchlist"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
