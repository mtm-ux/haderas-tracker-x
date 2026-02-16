import React, { useEffect, useState } from 'react';
import { ExternalLink, Newspaper } from 'lucide-react';
import { Card } from '@/components/common/Card';
import { Loader } from '@/components/common/Loader';
import { useStore } from '@/store';
import { marketService } from '@/services/marketService';
import { NewsItem } from '@/types';
import { formatDate } from '@/utils/formatters';

export const NewsWidget: React.FC = () => {
  const { selectedAsset } = useStore();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedAsset) {
      setNews([]);
      return;
    }


    let isMounted = true;

    const fetchNews = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await marketService.getNews(selectedAsset);
        if (isMounted) {
          setNews(data);
        }
      } catch (err) {
        if (isMounted) {
          setError('Fehler beim Laden der News');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchNews();

    return () => {
      isMounted = false;
    };
  }, [selectedAsset?.id]);

  if (!selectedAsset) {
    return (
      <Card title="News" className="h-full">
        <div className="flex items-center justify-center h-full">
          <p className="text-app-muted text-sm">
            Wähle ein Asset aus
          </p>
        </div>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card title="News" className="h-full">
        <div className="flex items-center justify-center h-full">
          <Loader size="md" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card title="News" className="h-full">
        <div className="flex items-center justify-center h-full">
          <p className="text-danger text-sm">{error}</p>
        </div>
      </Card>
    );
  }

  if (news.length === 0) {
    return (
      <Card title="News" className="h-full">
        <div className="flex items-center justify-center h-full p-4 text-center">
          <p className="text-app-muted text-sm">
            Keine News verfügbar für {selectedAsset.symbol}.<br />
            (Stelle sicher, dass API-Keys in .env konfiguriert sind)
          </p>
        </div>
      </Card>
    );
  }

  return (
    <Card title="News" className="h-full flex flex-col" noPadding>
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className="divide-y divide-app-border">
          {news.map((item) => (
            <a
              key={item.id}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-4 hover:bg-app-bg transition-colors group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Newspaper className="w-3 h-3 text-primary-500 flex-shrink-0" />
                    <span className="text-xs text-app-muted truncate">
                      {item.source}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-app-text group-hover:text-primary-400 transition-colors line-clamp-2 mb-1">
                    {item.title}
                  </h4>
                  <div className="text-xs text-app-muted">
                    {formatDate(new Date(item.publishedAt).getTime())}
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-app-muted group-hover:text-primary-400 transition-colors flex-shrink-0 mt-1" />
              </div>
            </a>
          ))}
        </div>
      </div>
    </Card>
  );
};
