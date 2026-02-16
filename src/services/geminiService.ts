import { Asset } from '@/types';

interface GeminiContentPart {
  text?: string;
}

interface GeminiContent {
  role?: string;
  parts: GeminiContentPart[];
}

export interface GeminiChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

class GeminiService {
  private readonly apiKey: string | undefined;
  private readonly model: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
    this.model = 'gemini-1.5-flash-latest';
  }

  get isConfigured() {
    return !!this.apiKey && !this.apiKey.toLowerCase().includes('your_gemini_api_key_here');
  }

  /**
   * Baut den Chat-Kontext aus bisherigen Nachrichten und Asset-Infos.
   */
  private buildContents(asset: Asset | null, messages: GeminiChatMessage[]): GeminiContent[] {
    const systemIntro: GeminiContent = {
      role: 'user',
      parts: [
        {
          text:
            'Du bist ein Research-Assistent für Aktien und Krypto. ' +
            'Antworte immer in prägnantem Markdown (Überschriften, Bulletpoints, Tabellen nur wenn sinnvoll). ' +
            'Keine Anlageberatung, nur strukturierte Information.',
        },
      ],
    };

    const assetContext: GeminiContent | null = asset
      ? {
          role: 'user',
          parts: [
            {
              text: `Kontext zum aktuellen Asset:\n` +
                `- Symbol: ${asset.symbol}\n` +
                `- Name: ${asset.name}\n` +
                `- Typ: ${asset.type === 'crypto' ? 'Kryptowährung' : 'Aktie'}\n`,
            },
          ],
        }
      : null;

    const history: GeminiContent[] = messages.map((m) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    return [systemIntro, ...(assetContext ? [assetContext] : []), ...history];
  }

  /**
   * Ruft die Gemini-API auf und gibt eine Markdown-Antwort zurück.
   *
   * WICHTIG: Der API-Key wird über Vite (VITE_GEMINI_API_KEY) zur Build-Zeit injiziert.
   * Beim Hosting auf GitHub Pages muss das Secret im Repository unter demselben Namen gesetzt sein.
   */
  async generateResearchAnswer(
    asset: Asset | null,
    messages: GeminiChatMessage[],
  ): Promise<string> {
    if (!this.isConfigured) {
      console.warn('Gemini API key not configured');
      throw new Error(
        'Gemini API ist nicht konfiguriert. Bitte VITE_GEMINI_API_KEY in den GitHub Secrets setzen.',
      );
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;

    const body = {
      contents: this.buildContents(asset, messages),
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 1024,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Gemini error status:', response.status, await response.text());
      throw new Error('Fehler bei der Kommunikation mit der Gemini API');
    }

    const json: any = await response.json();
    const text =
      json?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || '').join('\n').trim() || '';

    if (!text) {
      throw new Error('Gemini Antwort leer');
    }

    return text;
  }
}

export const geminiService = new GeminiService();

