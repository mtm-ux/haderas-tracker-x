import { TimelineEvent, TimelineEventResponse } from '@/types';

export const timelineService = {
  /**
   * Fetch events für einen Zeitraum
   * Mit Pagination: Unterstützt Load More Funktionalität
   */
  async fetchEvents(
    startDate: string,
    endDate: string,
    page: number = 1,
    limit: number = 20
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
      // Fallback mit besseren Mock-Daten
      return {
        events: getMockTimelineEvents(page, limit),
        pagination: {
          total: 52, // 1 Jahr mit verschiedenen Events pro Woche
          page,
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
  getCategories() {
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
 * Realistische Mock-Daten für Jahresstrahl
 * Generiert Events für das gesamte Jahr mit Pagination
 */
function getMockTimelineEvents(page: number = 1, limit: number = 20): TimelineEvent[] {
  const today = new Date();
  const year = today.getFullYear();
  const allEvents: TimelineEvent[] = [];

  // Generiere realistische Events über das ganze Jahr
  const eventTemplates: Array<Omit<TimelineEvent, 'id'>> = [
    // Q1
    {
      date: new Date(year, 0, 10).toISOString(),
      title: 'Fed Funds Conference',
      category: 'central_bank' as const,
      importance: 5,
      assets: ['SPX', 'DXY'],
      region: 'US',
      summary: 'Federal Reserve Communications',
      price_impact: { SPX: 1.2, DXY: 0.5 },
    },
    {
      date: new Date(year, 0, 25).toISOString(),
      title: 'Apple Q1 Earnings',
      category: 'earnings' as const,
      importance: 4,
      assets: ['AAPL', 'QQQ'],
      region: 'US',
      summary: 'Apple reports record revenue',
      price_impact: { AAPL: 5.2, QQQ: 1.8 },
    },
    {
      date: new Date(year, 1, 5).toISOString(),
      title: 'CPI Release January',
      category: 'economic' as const,
      importance: 5,
      assets: ['TLT', 'GLD'],
      region: 'US',
      summary: 'Inflation data comes in hotter than expected',
      price_impact: { TLT: -2.1, GLD: 1.8 },
    },
    {
      date: new Date(year, 1, 15).toISOString(),
      title: 'ECB Rate Decision',
      category: 'central_bank' as const,
      importance: 4,
      assets: ['EURUSD', 'STOXX600'],
      region: 'EU',
      summary: 'European Central Bank decision',
      price_impact: {},
    },
    {
      date: new Date(year, 2, 10).toISOString(),
      title: 'Geopolitical Escalation',
      category: 'geopolitical' as const,
      importance: 4,
      assets: ['CL', 'GC', 'JNUG'],
      region: 'GLOBAL',
      summary: 'Tensions rise affecting energy and safe-haven assets',
      price_impact: { CL: 3.2, GC: 2.1 },
    },
    // Q2
    {
      date: new Date(year, 3, 5).toISOString(),
      title: 'FOMC Meeting',
      category: 'central_bank' as const,
      importance: 5,
      assets: ['SPX', 'BND'],
      region: 'US',
      summary: 'Fed signals future rate cuts',
      price_impact: { SPX: 3.1, BND: 1.5 },
    },
    {
      date: new Date(year, 3, 20).toISOString(),
      title: 'Microsoft Q3 Earnings',
      category: 'earnings' as const,
      importance: 5,
      assets: ['MSFT', 'QQQ'],
      region: 'US',
      summary: 'Strong AI-driven earnings growth',
      price_impact: { MSFT: 6.2, QQQ: 2.8 },
    },
    {
      date: new Date(year, 4, 2).toISOString(),
      title: 'Labor Report April',
      category: 'economic' as const,
      importance: 5,
      assets: ['SPX', 'VIX'],
      region: 'US',
      summary: 'Strong job creation continues',
      price_impact: { SPX: 2.1 },
    },
    {
      date: new Date(year, 4, 15).toISOString(),
      title: 'China GDP Release',
      category: 'economic' as const,
      importance: 4,
      assets: ['QQQ', 'ASHR'],
      region: 'ASIA',
      summary: 'Mixed economic indicators',
      price_impact: {},
    },
    {
      date: new Date(year, 5, 1).toISOString(),
      title: 'Fed Rate Hike Decision',
      category: 'central_bank' as const,
      importance: 5,
      assets: ['DXY', 'TLT'],
      region: 'US',
      summary: 'Unexpected rate hike due to inflation',
      price_impact: { DXY: 1.2, TLT: -3.5 },
    },
    // Q3
    {
      date: new Date(year, 6, 10).toISOString(),
      title: 'Amazon Q2 Earnings',
      category: 'earnings' as const,
      importance: 4,
      assets: ['AMZN', 'QQQ'],
      region: 'US',
      summary: 'Cloud revenues exceed expectations',
      price_impact: { AMZN: 4.5 },
    },
    {
      date: new Date(year, 7, 5).toISOString(),
      title: 'August Inflation Data',
      category: 'economic' as const,
      importance: 5,
      assets: ['SPX', 'VIX'],
      region: 'US',
      summary: 'Inflation moderates significantly',
      price_impact: { SPX: 2.8, VIX: -8.2 },
    },
    {
      date: new Date(year, 7, 25).toISOString(),
      title: 'Jackson Hole Symposium',
      category: 'central_bank' as const,
      importance: 4,
      assets: ['SPX', 'DXY'],
      region: 'US',
      summary: 'Fed Chair discusses economic outlook',
      price_impact: { SPX: 1.5 },
    },
    {
      date: new Date(year, 8, 10).toISOString(),
      title: 'NVIDIA Earnings Report',
      category: 'earnings' as const,
      importance: 5,
      assets: ['NVDA', 'QQQ'],
      region: 'US',
      summary: 'Record GPU demand drives earnings',
      price_impact: { NVDA: 7.2, QQQ: 2.1 },
    },
    {
      date: new Date(year, 8, 20).toISOString(),
      title: 'Fed Rate Cut Decision',
      category: 'central_bank' as const,
      importance: 5,
      assets: ['SPX', 'BND'],
      region: 'US',
      summary: 'First rate cut of the cycle',
      price_impact: { SPX: 2.3, BND: 0.8 },
    },
    // Q4
    {
      date: new Date(year, 9, 5).toISOString(),
      title: 'Q3 GDP Growth',
      category: 'economic' as const,
      importance: 4,
      assets: ['SPX', 'DXY'],
      region: 'US',
      summary: 'Gross Domestic Product growth report',
      price_impact: { SPX: 1.2 },
    },
    {
      date: new Date(year, 10, 1).toISOString(),
      title: 'US Election Impact',
      category: 'geopolitical' as const,
      importance: 5,
      assets: ['SPX', 'VIX', 'DXY'],
      region: 'US',
      summary: 'Election results influence market outlook',
      price_impact: { SPX: 3.5, VIX: -12.1 },
    },
    {
      date: new Date(year, 10, 15).toISOString(),
      title: 'Thanksgiving Market Close',
      category: 'other' as const,
      importance: 2,
      assets: ['SPX'],
      region: 'US',
      summary: 'Extended Thanksgiving weekend',
      price_impact: {},
    },
    {
      date: new Date(year, 11, 5).toISOString(),
      title: 'December FOMC Meeting',
      category: 'central_bank' as const,
      importance: 5,
      assets: ['SPX', 'DXY'],
      region: 'US',
      summary: 'Final Fed decision of the year',
      price_impact: { SPX: 2.1 },
    },
    {
      date: new Date(year, 11, 20).toISOString(),
      title: 'Year-End Portfolio Review',
      category: 'other' as const,
      importance: 3,
      assets: ['SPX', 'AGG', 'GLD'],
      region: 'GLOBAL',
      summary: 'Market wrapping up for 2026',
      price_impact: {},
    },
  ];

  // Sortiere nach Datum
  // Füge Unique IDs zu den Event Templates hinzu
  const templatesWithIds = eventTemplates.map((evt, idx) => ({
    ...evt,
    id: `evt-${idx + 1}`,
  }));
  allEvents.push(...templatesWithIds);
  allEvents.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Return the events with IDs already added above
  const eventWithIds = allEvents;

  // Pagination
  const start = (page - 1) * limit;
  const end = start + limit;

  return eventWithIds.slice(start, end);
}
