import { TimelineEvent, TimelineEventResponse } from '@/types';

export const timelineService = {
  /**
   * Fetch events für einen Zeitraum
   * Mit Pagination: 3 Monate pro Request
   */
  async fetchEvents(
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 50
  ): Promise<TimelineEventResponse> {
    try {
      const params = new URLSearchParams({
        start: startDate,
        end: endDate,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`/api/events?${params}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch timeline events:', error);
      // Fallback mock data
      return {
        events: getMockTimelineEvents(),
        pagination: {
          total: 0,
          page: 1,
          limit,
        },
      };
    }
  },

  /**
   * Filter functionality
   */
  filterEventsByCategory(events: TimelineEvent[], category: string | null): TimelineEvent[] {
    if (!category) return events;
    return events.filter((e) => e.category === category);
  },

  filterEventsByYear(events: TimelineEvent[], year: number | null): TimelineEvent[] {
    if (!year) return events;
    return events.filter((e) => new Date(e.date).getFullYear() === year);
  },

  filterEventsByAsset(events: TimelineEvent[], asset: string | null): TimelineEvent[] {
    if (!asset) return events;
    return events.filter((e) => e.assets.includes(asset.toUpperCase()));
  },

  /**
   * Sorting by date
   */
  sortByDate(events: TimelineEvent[], ascending: boolean = true): TimelineEvent[] {
    return [...events].sort((a, b) => {
      const timeA = new Date(a.date).getTime();
      const timeB = new Date(b.date).getTime();
      return ascending ? timeA - timeB : timeB - timeA;
    });
  },

  /**
   * Group events by month
   */
  groupByMonth(
    events: TimelineEvent[]
  ): Map<string, TimelineEvent[]> {
    const grouped = new Map<string, TimelineEvent[]>();

    events.forEach((event) => {
      const date = new Date(event.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!grouped.has(monthKey)) {
        grouped.set(monthKey, []);
      }
      grouped.get(monthKey)!.push(event);
    });

    return grouped;
  },

  /**
   * Extract unique years from events
   */
  getUniqueYears(events: TimelineEvent[]): number[] {
    const years = new Set(events.map((e) => new Date(e.date).getFullYear()));
    return Array.from(years).sort((a, b) => a - b);
  },

  /**
   * Extract unique assets from events
   */
  getUniqueAssets(events: TimelineEvent[]): string[] {
    const assets = new Set<string>();
    events.forEach((e) => e.assets.forEach((a) => assets.add(a)));
    return Array.from(assets).sort();
  },

  /**
   * Get categories from events
   */
  getCategories(events: TimelineEvent[]) {
    const categories = [
      { id: 'macro', label: 'Makro', color: 'bg-blue-500/20 text-blue-300' },
      { id: 'earnings', label: 'Earnings', color: 'bg-emerald-500/20 text-emerald-300' },
      { id: 'economic', label: 'Wirtschaft', color: 'bg-yellow-500/20 text-yellow-300' },
      { id: 'geopolitical', label: 'Geopolitik', color: 'bg-red-500/20 text-red-300' },
      { id: 'central_bank', label: 'Zentralbank', color: 'bg-purple-500/20 text-purple-300' },
      { id: 'other', label: 'Sonstiges', color: 'bg-app-border text-app-muted' },
    ];
    return categories;
  },
};

/**
 * Mock data für Entwicklung
 */
function getMockTimelineEvents(): TimelineEvent[] {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  return [
    {
      id: 'evt-1',
      date: new Date(today.getFullYear(), 2, 15).toISOString(),
      title: 'Fed Interest Rate Decision',
      category: 'central_bank',
      importance: 5,
      assets: ['BTC', 'SPX'],
      region: 'US',
      summary: 'Federal Reserve announces interest rate decision',
      description:
        'The Fed is expected to maintain rates or signal future cuts depending on inflation data.',
      price_impact: { BTC: -2.4, SPX: 1.2 },
    },
    {
      id: 'evt-2',
      date: new Date(today.getFullYear(), 2, 20).toISOString(),
      title: 'Apple Q2 Earnings',
      category: 'earnings',
      importance: 4,
      assets: ['AAPL'],
      region: 'US',
      summary: 'Apple reports quarterly earnings beating expectations',
      price_impact: { AAPL: 3.5 },
    },
    {
      id: 'evt-3',
      date: new Date(today.getFullYear(), 1, 10).toISOString(),
      title: 'CPI Release - Inflation Data',
      category: 'economic',
      importance: 5,
      assets: ['TLT', 'GLD', 'USD'],
      region: 'US',
      summary: 'US inflation data influences market expectations',
      price_impact: { TLT: -2.1, GLD: 1.8 },
    },
    {
      id: 'evt-4',
      date: new Date(today.getFullYear(), 0, 25).toISOString(),
      title: 'Geopolitical Tensions Rise',
      category: 'geopolitical',
      importance: 3,
      assets: ['CL', 'GC', 'UUP'],
      region: 'GLOBAL',
      summary: 'Global tensions affect energy and safe-haven assets',
      price_impact: { CL: 2.3 },
    },
  ];
}
