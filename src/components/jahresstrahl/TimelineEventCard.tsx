import React, { useState } from 'react';
import { TimelineEvent } from '@/types';
import { ChevronDown, TrendingUp, TrendingDown } from 'lucide-react';

interface EventCardProps {
  event: TimelineEvent;
  positioned: boolean;
  style?: React.CSSProperties;
  onSelect?: (event: TimelineEvent) => void;
}

export const TimelineEventCard: React.FC<EventCardProps> = ({
  event,
  positioned,
  style,
  onSelect,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Calculate size based on importance
  const sizeClass = {
    1: 'w-16 h-16 text-[10px]',
    2: 'w-20 h-20 text-xs',
    3: 'w-24 h-24 text-xs',
    4: 'w-28 h-28 text-sm',
    5: 'w-32 h-32 text-sm',
  }[event.importance];

  // Category badge colors
  const categoryColors = {
    macro: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
    earnings: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    economic: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
    geopolitical: 'bg-red-500/20 text-red-300 border-red-500/40',
    central_bank: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    other: 'bg-app-border text-app-muted border-app-border',
  };

  const categoryColor = categoryColors[event.category] || categoryColors.other;

  // Importance indicators
  const importanceStars = Array(event.importance)
    .fill(null)
    .map((_, i) => i);

  if (!positioned) {
    return (
      <div className="text-app-muted text-xs p-2 border border-app-border rounded-lg">
        <p>Loading position...</p>
      </div>
    );
  }

  return (
    <div
      style={style}
      className={`${sizeClass} ${categoryColor} border rounded-lg p-2 md:p-3 flex flex-col justify-between cursor-pointer hover:shadow-lg transition-shadow`}
      onClick={() => onSelect?.(event)}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Importance indicator */}
      <div className="flex gap-0.5">
        {importanceStars.map((_, i) => (
          <div
            key={i}
            className="w-1 h-1 rounded-full bg-current opacity-60"
          />
        ))}
      </div>

      {/* Title */}
      <div className="line-clamp-2 font-semibold leading-tight">{event.title}</div>

      {/* Assets & Region */}
      <div className="text-[9px] opacity-75">
        <span className="font-mono">{event.assets.join(', ')}</span>
        <span className="block">{event.region}</span>
      </div>

      {/* Expand indicator */}
      {event.price_impact && (
        <div className="flex justify-end">
          <ChevronDown className="w-3 h-3 opacity-50" />
        </div>
      )}

      {/* Expanded preview */}
      {isExpanded && event.price_impact && (
        <div className="absolute mt-2 p-2 bg-app-bg border border-app-border rounded text-[9px] whitespace-nowrap">
          {Object.entries(event.price_impact).map(([symbol, impact]) => (
            <div key={symbol} className="flex items-center gap-1">
              <span>{symbol}</span>
              {impact > 0 ? (
                <TrendingUp className="w-2 h-2 text-success" />
              ) : (
                <TrendingDown className="w-2 h-2 text-danger" />
              )}
              <span className={impact > 0 ? 'text-success' : 'text-danger'}>
                {impact.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
