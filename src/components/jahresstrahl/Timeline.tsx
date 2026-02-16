import React, { useState, useMemo } from 'react';
import { TimelineEvent } from '@/types';
import { timelineService } from '@/services/timelineService';
import { TimelineFilterBar } from './TimelineFilterBar';
import { TimelineEventCard } from './TimelineEventCard';
import { TimelineDetailPanel } from './TimelineDetailPanel';
import { Card } from '@/components/common/Card';
import { Loader } from '@/components/common/Loader';
import { Calendar, ChevronDown } from 'lucide-react';

interface TimelineProps {
  events?: TimelineEvent[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({
  events = [],
  isLoading = false,
  onLoadMore,
  hasMore = false,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  // Filter and sort events
  const filteredEvents = useMemo(() => {
    let filtered = [...(events || [])];

    // Apply filters
    if (selectedCategory) {
      filtered = timelineService.filterEventsByCategory(filtered, selectedCategory);
    }
    if (selectedYear) {
      filtered = timelineService.filterEventsByYear(filtered, selectedYear);
    }
    if (selectedAsset) {
      filtered = timelineService.filterEventsByAsset(filtered, selectedAsset);
    }

    // Sort by date ascending
    return timelineService.sortByDate(filtered, true);
  }, [events, selectedCategory, selectedYear, selectedAsset]);

  // Group events by month
  const eventsByMonth = useMemo(() => {
    const grouped = new Map<string, TimelineEvent[]>();
    
    filteredEvents.forEach((event) => {
      const date = new Date(event.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      grouped.get(monthKey)!.push(event);
    });

    return grouped;
  }, [filteredEvents]);

  // Format month label
  const getMonthLabel = (monthKey: string) => {
    const [year, month] = monthKey.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('de-DE', { month: 'long', year: 'numeric' });
  };

  return (
    <div className="h-full overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Calendar className="w-6 h-6 text-primary-400" />
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-app-text">Jahresstrahl</h2>
          <p className="text-sm text-app-muted mt-1">
            Interaktiver Zeitstrahl für Finanzmarkt-Ereignisse ({filteredEvents.length} Events)
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <TimelineFilterBar
        events={events}
        selectedCategory={selectedCategory}
        selectedYear={selectedYear}
        selectedAsset={selectedAsset}
        onCategoryChange={setSelectedCategory}
        onYearChange={setSelectedYear}
        onAssetChange={setSelectedAsset}
      />

      {/* Timeline mit Monats-Gruppierung */}
      {isLoading && events.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <Loader />
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-app-muted">Keine Events für diese Filter gefunden</p>
        </Card>
      ) : (
        <>
          {/* Vertical Timeline View mit Monats-Markierungen */}
          <div className="space-y-8">
            {Array.from(eventsByMonth.entries()).map(([monthKey, monthEvents]) => (
              <div key={monthKey}>
                {/* Month Marker */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-sm font-bold text-primary-400 uppercase tracking-wider">
                    {getMonthLabel(monthKey)}
                  </div>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-primary-500/50 to-transparent" />
                  <span className="text-xs text-app-muted px-2 py-1 bg-app-bg rounded">
                    {monthEvents.length} {monthEvents.length === 1 ? 'Event' : 'Events'}
                  </span>
                </div>

                {/* Events in this month */}
                <div className="space-y-3 pl-4 border-l-2 border-primary-500/30">
                  {monthEvents.map((event) => (
                    <div
                      key={event.id}
                      className="relative pl-4 cursor-pointer group"
                      onClick={() => setSelectedEvent(event)}
                    >
                      {/* Timeline dot */}
                      <div className="absolute -left-[17px] top-1 w-4 h-4 rounded-full bg-primary-500 border-4 border-app-surface shadow-md group-hover:scale-125 transition-transform" />

                      {/* Event Card */}
                      <TimelineEventCard
                        event={event}
                        onSelect={setSelectedEvent}
                        positioned={false}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Load More Button */}
          {hasMore && onLoadMore && (
            <div className="flex justify-center pt-4">
              <button
                onClick={onLoadMore}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-primary-500/20 border border-primary-500/50 rounded-lg text-primary-400 hover:bg-primary-500/30 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader />
                    Laden...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Mehr Events laden
                  </>
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Event Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="p-4">
          <div className="text-2xl font-bold text-primary-400">{filteredEvents.length}</div>
          <p className="text-xs text-app-muted">Events</p>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-success">
            {filteredEvents.filter((e) => e.importance >= 4).length}
          </div>
          <p className="text-xs text-app-muted">Wichtig</p>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-emerald-400">
            {new Set(filteredEvents.flatMap((e) => e.assets)).size}
          </div>
          <p className="text-xs text-app-muted">Unique Assets</p>
        </Card>
        <Card className="p-4">
          <div className="text-2xl font-bold text-primary-300">
            {filteredEvents.reduce((sum, e) => sum + (e.price_impact ? Object.keys(e.price_impact).length : 0), 0)}
          </div>
          <p className="text-xs text-app-muted">Price Impacts</p>
        </Card>
      </div>

      {/* Detail Panel */}
      <TimelineDetailPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  );
};
