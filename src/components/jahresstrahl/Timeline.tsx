import React, { useEffect, useState, useMemo } from 'react';
import { TimelineEvent } from '@/types';
import { timelineService } from '@/services/timelineService';
import { TimelineFilterBar } from './TimelineFilterBar';
import { TimelineEventCard } from './TimelineEventCard';
import { TimelineDetailPanel } from './TimelineDetailPanel';
import { Card } from '@/components/common/Card';
import { Loader } from '@/components/common/Loader';
import { Calendar } from 'lucide-react';

interface TimelineProps {
  events?: TimelineEvent[];
  isLoading?: boolean;
}

export const Timeline: React.FC<TimelineProps> = ({
  events = [],
  isLoading = false,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  // Static events reference (in real app, from React Query)
  useEffect(() => {
    if (!events.length) {
      // No events provided
    }
  }, [events]);

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

  // Calculate timeline positions
  const timelineMetrics = useMemo(() => {
    if (!filteredEvents.length) return { minDate: 0, maxDate: 0, range: 0 };

    const dates = filteredEvents.map((e) => new Date(e.date).getTime());
    const minDate = Math.min(...dates);
    const maxDate = Math.max(...dates);

    return {
      minDate,
      maxDate,
      range: maxDate - minDate,
    };
  }, [filteredEvents]);

  // Position events on timeline
  const positionedEvents = useMemo(
    () =>
      filteredEvents.map((event, index) => {
        const eventDate = new Date(event.date).getTime();
        const position =
          timelineMetrics.range === 0
            ? 50
            : ((eventDate - timelineMetrics.minDate) / timelineMetrics.range) * 100;

        return {
          event,
          position,
          isAbove: index % 2 === 0,
        };
      }),
    [filteredEvents, timelineMetrics]
  );

  return (
    <div className="h-full overflow-y-auto p-3 md:p-6 space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Calendar className="w-6 h-6 text-primary-400" />
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-app-text">Jahresstrahl</h2>
          <p className="text-sm text-app-muted mt-1">
            Interaktiver Zeitstrahl für Finanzmarkt-Ereignisse
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

      {/* Timeline */}
      <Card className="h-[500px] flex flex-col" title="Timeline">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="flex items-center justify-center h-full text-app-muted">
            <p>Keine Events für diese Filter gefunden</p>
          </div>
        ) : (
          <div className="flex-1 min-h-0 overflow-x-auto overflow-y-hidden">
            <div className="relative px-4 py-8" style={{ minWidth: '100%' }}>
              {/* Central Timeline Line */}
              <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-gradient-to-r from-app-border via-primary-500/50 to-app-border" />

              {/* Vertical Markers und Labels */}
              <div className="relative h-96">
                {/* Events above timeline */}
                <div className="absolute top-0 inset-x-0 h-1/2 space-y-4 px-2">
                  {positionedEvents
                    .filter((item) => item.isAbove)
                    .map(({ event, position }) => (
                      <div
                        key={event.id}
                        className="absolute flex justify-center"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                      >
                        {/* Connection line */}
                        <div className="w-0.5 h-12 bg-app-border" />
                        {/* Event card */}
                        <div className="absolute top-12">
                          <TimelineEventCard
                            event={event}
                            positioned
                            onSelect={setSelectedEvent}
                          />
                        </div>
                      </div>
                    ))}
                </div>

                {/* Events below timeline */}
                <div className="absolute bottom-0 inset-x-0 h-1/2 space-y-4 px-2">
                  {positionedEvents
                    .filter((item) => !item.isAbove)
                    .map(({ event, position }) => (
                      <div
                        key={event.id}
                        className="absolute flex justify-center"
                        style={{ left: `${position}%`, transform: 'translateX(-50%)' }}
                      >
                        {/* Event card */}
                        <div className="absolute bottom-12">
                          <TimelineEventCard
                            event={event}
                            positioned
                            onSelect={setSelectedEvent}
                          />
                        </div>
                        {/* Connection line */}
                        <div className="w-0.5 h-12 bg-app-border" />
                      </div>
                    ))}
                </div>

                {/* Center point markers */}
                {positionedEvents.map(({ position }) => (
                  <div
                    key={`marker-${position}`}
                    className="absolute top-1/2 w-2 h-2 rounded-full bg-primary-400 shadow-md transform -translate-x-1/2 -translate-y-1/2"
                    style={{ left: `${position}%` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

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
