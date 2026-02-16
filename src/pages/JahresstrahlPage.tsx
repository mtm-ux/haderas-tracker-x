import React, { useEffect, useState, useCallback } from 'react';
import { TimelineEvent } from '@/types';
import { timelineService } from '@/services/timelineService';
import { Timeline } from '@/components/jahresstrahl/Timeline';

export const JahresstrahlPage: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreEvents = useCallback(async (page: number = 1, append: boolean = false) => {
    setIsLoading(true);
    try {
      // Calculate date range (this year)
      const now = new Date();
      const startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      const endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];

      // Fetch events from service
      const response = await timelineService.fetchEvents(startDate, endDate, page, 20);
      
      if (append) {
        setEvents((prev) => [...prev, ...response.events]);
      } else {
        setEvents(response.events);
      }

      // Check if there are more events to load
      const totalLoaded = append ? events.length + response.events.length : response.events.length;
      setHasMore(totalLoaded < (response.pagination?.total ?? 0));
      setCurrentPage(page);
    } catch (error) {
      console.error('Error loading timeline events:', error);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [events.length]);

  // Initial load
  useEffect(() => {
    loadMoreEvents(1, false);
  }, []);

  const handleLoadMore = () => {
    loadMoreEvents(currentPage + 1, true);
  };

  return (
    <Timeline 
      events={events} 
      isLoading={isLoading}
      onLoadMore={handleLoadMore}
      hasMore={hasMore}
    />
  );
};
