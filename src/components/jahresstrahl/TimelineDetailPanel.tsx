import React from 'react';
import { TimelineEvent } from '@/types';
import { X, ExternalLink, TrendingUp, TrendingDown, MapPin } from 'lucide-react';

interface DetailPanelProps {
  event: TimelineEvent | null;
  onClose: () => void;
}

export const TimelineDetailPanel: React.FC<DetailPanelProps> = ({ event, onClose }) => {
  if (!event) return null;

  const categoryLabels: Record<string, string> = {
    macro: 'Makroökonomie',
    earnings: 'Earnings Report',
    economic: 'Wirtschaftliche Indikatoren',
    geopolitical: 'Geopolitische Entwicklung',
    central_bank: 'Zentralbank-Entscheidung',
    other: 'Sonstiges',
  };

  const formattedDate = new Date(event.date).toLocaleDateString('de-DE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center z-50">
      {/* Modal backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Panel */}
      <div className="relative bg-app-surface border border-app-border rounded-t-lg md:rounded-lg w-full md:w-96 max-h-[80vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="sticky top-0 bg-app-surface border-b border-app-border flex items-center justify-between p-4 md:p-5">
          <div>
            <span className="inline-block text-[10px] font-semibold px-2 py-1 rounded bg-primary-500/20 text-primary-300 mb-2">
              {categoryLabels[event.category] || event.category.toUpperCase()}
            </span>
            <h2 className="text-lg md:text-xl font-bold text-app-text line-clamp-2">
              {event.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-app-bg rounded-lg transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-app-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-5 space-y-4">
          {/* Meta Info */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <div className="text-xs text-app-muted mb-1">Datum & Zeit</div>
              <div className="text-sm font-semibold text-app-text">{formattedDate}</div>
            </div>
            <div>
              <div className="text-xs text-app-muted mb-1">Region</div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-primary-400" />
                <span className="text-sm font-semibold text-app-text">{event.region}</span>
              </div>
            </div>
          </div>

          {/* Assets Affected */}
          <div>
            <div className="text-xs font-semibold text-app-muted mb-2">Betroffene Assets</div>
            <div className="flex flex-wrap gap-2">
              {event.assets.map((asset) => (
                <span
                  key={asset}
                  className="px-2 py-1 bg-app-bg border border-app-border rounded text-sm font-mono text-primary-300"
                >
                  {asset}
                </span>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="text-xs font-semibold text-app-muted mb-2">Zusammenfassung</div>
            <p className="text-sm text-app-text leading-relaxed">{event.summary}</p>
          </div>

          {/* Description */}
          {event.description && (
            <div>
              <div className="text-xs font-semibold text-app-muted mb-2">Details</div>
              <p className="text-sm text-app-text leading-relaxed">{event.description}</p>
            </div>
          )}

          {/* Price Impact */}
          {event.price_impact && Object.keys(event.price_impact).length > 0 && (
            <div>
              <div className="text-xs font-semibold text-app-muted mb-2">
                Erwartete Preisauswirkung
              </div>
              <div className="space-y-2">
                {Object.entries(event.price_impact).map(([symbol, impact]) => (
                  <div
                    key={symbol}
                    className="flex items-center justify-between p-2 bg-app-bg border border-app-border rounded"
                  >
                    <span className="font-mono font-semibold text-app-text">{symbol}</span>
                    <div className="flex items-center gap-2">
                      {impact > 0 ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-success" />
                          <span className="text-sm font-semibold text-success">
                            +{impact.toFixed(2)}%
                          </span>
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4 text-danger" />
                          <span className="text-sm font-semibold text-danger">
                            {impact.toFixed(2)}%
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Source */}
          {event.source && (
            <div className="pt-4 border-t border-app-border">
              <a
                href={event.source}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs text-primary-400 hover:text-primary-300 transition-colors"
              >
                <span>Quelle anzeigen</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
