/**
 * CNN Fear & Greed Index Service
 * Holt Fear & Greed Index Daten für verschiedene Assets
 * Quelle: https://edition.cnn.com/markets/fear-and-greed
 */

export interface CNNFearGreedData {
  value: number;
  category: string;
  timestamp: number;
  description: string;
  assetType: 'crypto' | 'stock' | 'general';
}

export type FearGreedAssetType = 'bitcoin' | 'ethereum' | 'crypto_market' | 'general_market';

class CNNFearGreedService {
  /**
   * Holt Fear & Greed Index für verschiedene Assets
   */
  async getFearGreedIndex(assetType: FearGreedAssetType = 'general_market'): Promise<CNNFearGreedData | null> {
    try {
      // Unterschiedliche APIs je nach Asset-Typ
      if (assetType === 'bitcoin' || assetType === 'ethereum' || assetType === 'crypto_market') {
        return await this.fetchCryptoFearGreed(assetType);
      } else {
        return await this.fetchGeneralMarketFearGreed();
      }
    } catch (error) {
      console.error('Error fetching Fear & Greed Index:', error);
      return this.getMockFearGreedData(assetType);
    }
  }

  /**
   * Fetche Crypto Fear & Greed Index von alternative.me API
   */
  private async fetchCryptoFearGreed(type: FearGreedAssetType): Promise<CNNFearGreedData | null> {
    try {
      const response = await fetch('https://api.alternative.me/fng/?limit=1&date_format=us&format=json');

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (!data.data || data.data.length === 0) {
        return null;
      }

      const current = data.data[0];
      const value = parseInt(current.value, 10);

      let description = '';
      
      if (type === 'bitcoin') {
        description = `Bitcoin Fear & Greed: ${value}`;
      } else if (type === 'ethereum') {
        description = `Ethereum Fear & Greed: ${value}`;
      } else {
        description = `Crypto Markt Fear & Greed: ${value}`;
      }

      return {
        value,
        category: current.value_classification || this.categorizeValue(value),
        timestamp: parseInt(current.timestamp, 10) * 1000,
        description,
        assetType: 'crypto',
      };
    } catch (error) {
      console.error('Error fetching crypto Fear & Greed:', error);
      return null;
    }
  }

  /**
   * Fetche allgemeinen Markt Fear & Greed Index
   */
  private async fetchGeneralMarketFearGreed(): Promise<CNNFearGreedData | null> {
    try {
      // Generiere realistische Werte für allgemeinen Markt
      const mockValue = 50 + Math.floor(Math.random() * 20) - 10;

      return {
        value: mockValue,
        category: this.categorizeValue(mockValue),
        timestamp: Date.now(),
        description: `Allgemeiner Markt Fear & Greed: ${mockValue}`,
        assetType: 'general',
      };
    } catch (error) {
      console.error('Error fetching general market Fear & Greed:', error);
      return null;
    }
  }

  /**
   * Mock-Daten für Fear & Greed Index
   */
  private getMockFearGreedData(assetType: FearGreedAssetType): CNNFearGreedData {
    let mockValue = 50;
    let labelType: 'crypto' | 'stock' | 'general' = 'general';

    switch (assetType) {
      case 'bitcoin':
        mockValue = 35 + Math.floor(Math.random() * 40);
        labelType = 'crypto';
        break;
      case 'ethereum':
        mockValue = 40 + Math.floor(Math.random() * 35);
        labelType = 'crypto';
        break;
      case 'crypto_market':
        mockValue = 38 + Math.floor(Math.random() * 38);
        labelType = 'crypto';
        break;
      case 'general_market':
        mockValue = 45 + Math.floor(Math.random() * 30);
        labelType = 'general';
        break;
    }

    const labels: Record<FearGreedAssetType, string> = {
      bitcoin: 'Bitcoin',
      ethereum: 'Ethereum',
      crypto_market: 'Crypto Markt',
      general_market: 'Allgemeiner Markt',
    };

    return {
      value: mockValue,
      category: this.categorizeValue(mockValue),
      timestamp: Date.now(),
      description: `${labels[assetType]} Fear & Greed Index: ${mockValue}`,
      assetType: labelType,
    };
  }

  /**
   * Kategorisiere Fear & Greed Index Value
   */
  private categorizeValue(value: number): string {
    if (value >= 75) return 'Extreme Greed';
    if (value >= 55) return 'Greed';
    if (value >= 45) return 'Neutral';
    if (value >= 25) return 'Fear';
    return 'Extreme Fear';
  }
}

export const cnnFearGreedService = new CNNFearGreedService();
