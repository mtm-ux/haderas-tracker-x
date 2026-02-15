import { ApiClient } from './apiClient';
import { NewsItem } from '@/types';

class CryptoPanicService {
  private client: ApiClient;
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_CRYPTOPANIC_API_KEY || '';
    this.client = new ApiClient('https://cryptopanic.com/api/v1');
  }

  setStatusCallback(callback: (status: 'connected' | 'connecting' | 'error') => void): void {
    this.client.setStatusCallback(callback);
  }

  private getParams(): Record<string, string> {
    return { auth_token: this.apiKey };
  }

  /**
   * Holt News für bestimmte Crypto-Währungen
   */
  async getNews(currencies?: string[]): Promise<NewsItem[]> {
    if (!this.apiKey || this.apiKey.includes('your_cryptopanic_api_key_here')) {
      console.warn('CryptoPanic API key not configured');
      return [];
    }

    try {
      const params: any = {
        ...this.getParams(),
        public: 'true',
      };

      if (currencies && currencies.length > 0) {
        params.currencies = currencies.join(',');
      }

      const response = await this.client.get<{ results: any[] }>('/posts/', {
        params,
      });

      return response.results.slice(0, 20).map((post: any) => ({
        id: post.id,
        title: post.title,
        url: post.url,
        source: post.source.title,
        publishedAt: post.published_at,
        domain: post.domain,
      }));
    } catch (error) {
      console.error('CryptoPanic news error:', error);
      return [];
    }
  }
}

export const cryptoPanicService = new CryptoPanicService();
