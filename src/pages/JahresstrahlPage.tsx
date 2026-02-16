import React, { useEffect, useState } from 'react';
import { TimelineEvent } from '@/types';
import { timelineService } from '@/services/timelineService';
import { Timeline } from '@/components/jahresstrahl/Timeline';

export const JahresstrahlPage: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      setIsLoading(true);
      try {
        // Calculate date range (this year)
        const now = new Date();
        const startDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        const endDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];

        // Fetch events from service
        const response = await timelineService.fetchEvents(startDate, endDate);
        setEvents(response.events);
      } catch (error) {
        console.error('Error loading timeline events:', error);
        // Falls back to mock data from service
        const response = await timelineService.fetchEvents(
          new Date().toISOString().split('T')[0],
          new Date().toISOString().split('T')[0]
        );
        setEvents(response.events);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  return <Timeline events={events} isLoading={isLoading} />;
};
