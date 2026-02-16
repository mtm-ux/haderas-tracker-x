import React, { useEffect, useMemo, useState } from 'react';
import { Brain, Plus, User, ChevronDown, Info, Trash2, ChevronUp } from 'lucide-react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import { Card } from '@/components/common/Card';
import { useStore } from '@/store';
import { useLivePrice } from '@/hooks/useLivePrice';
import { marketService } from '@/services/marketService';
import { Asset, DeepResearchStatus, SearchResult, DeepResearchChatMessage } from '@/types';
import { LongformModule } from '@/components/deepResearch/LongformModule';
import { SourcesModule } from '@/components/deepResearch/SourcesModule';
import { StickyNotesModule } from '@/components/deepResearch/StickyNotesModule';
import { WatchlistComparisonModule } from '@/components/deepResearch/WatchlistComparisonModule';
import { BacktestModule } from '@/components/deepResearch/BacktestModule';
import { geminiService, GeminiChatMessage } from '@/services/geminiService';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ResponsiveGridLayout = WidthProvider(Responsive);

const STATUS_OPTIONS: { value: DeepResearchStatus; label: string }[] = [
  { value: 'in_arbeit', label: '🛠️ In Arbeit' },
  { value: 'fragen', label: '❓ Fragen' },
  { value: 'erledigt', label: '✅ Erledigt' },
  { value: 'gem', label: '💎 Gem' },
];

export const DeepResearchPage: React.FC = () => {
  const {
    users,
    activeUserId,
    addUser,
    setActiveUser,
    removeUser,
    deepResearchItems,
    activeDeepResearchItemId,
    setActiveDeepResearchItem,
    upsertDeepResearchItemForAsset,
    updateDeepResearchStatus,
    updateDeepResearchNotes,
    updateDeepResearchLongform,
    updateDeepResearchStickyNotes,
    updateDeepResearchSources,
    updateDeepResearchBacktestConfig,
    updateDeepResearchChatMessages,
    deepResearchLayouts,
    setDeepResearchLayouts,
  } = useStore();

  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<DeepResearchChatMessage[]>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const activeUser = useMemo(
    () => users.find((u) => u.id === activeUserId) || users[0],
    [users, activeUserId],
  );

  const activeItem = useMemo(
    () => deepResearchItems.find((item) => item.id === activeDeepResearchItemId) || null,
    [deepResearchItems, activeDeepResearchItemId],
  );

  const { priceData } = useLivePrice(activeItem?.asset ?? null, 60000);

  // Sync Chat-History mit dem aktiven Research-Item
  useEffect(() => {
    if (activeItem?.chatMessages) {
      setChatMessages(activeItem.chatMessages);
    } else {
      setChatMessages([]);
    }
    setChatError(null);
    setIsChatLoading(false);
  }, [activeItem?.id]);

  const handleCreateUser = () => {
    if (!newUserName.trim()) return;
    addUser(newUserName);
    setNewUserName('');
    setIsCreatingUser(false);
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setIsSearching(true);
    try {
      const results = await marketService.search(query);
      setSearchResults(results);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectAsset = (result: SearchResult) => {
    const asset: Asset = {
      id: result.id,
      symbol: result.symbol,
      name: result.name,
      type: result.type,
    };
    upsertDeepResearchItemForAsset(asset);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleStatusChange = (status: DeepResearchStatus) => {
    if (!activeItem) return;
    updateDeepResearchStatus(activeItem.id, status);
  };

  const handleNotesChange = (value: string) => {
    if (!activeItem) return;
    updateDeepResearchNotes(activeItem.id, value);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !activeItem) return;
    
    // Check if Gemini API is configured
    if (!geminiService.isConfigured) {
      setChatError(
        '❌ Gemini API nicht konfiguriert. Bitte VITE_GEMINI_API_KEY in .env.local setzen und die App neu laden.'
      );
      return;
    }
    
    const question = chatInput.trim();
    setChatInput('');
    setChatError(null);

    const nextMessages: DeepResearchChatMessage[] = [
      ...chatMessages,
      { role: 'user', content: question },
    ];

    setChatMessages(nextMessages);
    setIsChatLoading(true);

    try {
      const geminiMessages: GeminiChatMessage[] = nextMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const answerMarkdown = await geminiService.generateResearchAnswer(
        activeItem.asset,
        geminiMessages,
      );

      const withAssistant: DeepResearchChatMessage[] = [
        ...nextMessages,
        { role: 'assistant', content: answerMarkdown },
      ];

      setChatMessages(withAssistant);
      updateDeepResearchChatMessages(activeItem.id, withAssistant);
    } catch (err: any) {
      console.error('Gemini chat error:', err);
      setChatError(
        err?.message ??
          '❌ Fehler bei der Kommunikation mit dem Gemini AI Service. Stelle sicher, dass der API-Key gültig ist und das Rate-Limit nicht überschritten wurde.'
      );
    } finally {
      setIsChatLoading(false);
    }
  };

  const userItems = useMemo(
    () => (activeUser ? deepResearchItems.filter((i) => i.userId === activeUser.id) : []),
    [deepResearchItems, activeUser],
  );

  return (
    <div className="h-full overflow-y-auto p-3 md:p-6">
      <div className="max-w-6xl mx-auto space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Brain className="w-5 h-5 text-primary-400" />
              Deep Research
            </h2>
            <p className="text-sm text-app-muted mt-1 max-w-2xl">
              Benutzerbasiertes Research-Board für fokussierte Analysen ohne Chart – mit Notizen, Status
              und AI-Unterstützung pro Ticker.
            </p>
          </div>

          {/* User selector */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen((prev) => !prev)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-app-border bg-app-bg hover:border-primary-500/60 text-sm"
              >
                <User className="w-4 h-4 text-primary-400" />
                <span>{activeUser?.name ?? 'Kein User'}</span>
                {isUserMenuOpen ? (
                  <ChevronUp className="w-3 h-3 text-app-muted" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-app-muted" />
                )}
              </button>
              {/* Dropdown mit Auswahl + Löschoption */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-1 w-56 rounded-lg border border-app-border bg-app-surface shadow-lg text-sm z-50">
                  {users.map((user) => {
                    const isOnlyUser = users.length === 1;
                    const isActive = user.id === activeUser?.id;
                    return (
                      <div
                        key={user.id}
                        className={`flex items-center justify-between px-3 py-1.5 ${
                          isActive ? 'bg-primary-500/10' : 'hover:bg-app-bg'
                        }`}
                      >
                        <button
                          onClick={() => {
                            setActiveUser(user.id);
                            setIsUserMenuOpen(false);
                          }}
                          className={`flex-1 text-left ${
                            isActive ? 'text-primary-300' : 'text-app-text'
                          }`}
                        >
                          {user.name}
                        </button>
                        {!isOnlyUser && (
                          <button
                            onClick={() => {
                              const confirmed = window.confirm(
                                `User "${user.name}" und alle zugehörigen Research-Daten wirklich löschen?`,
                              );
                              if (!confirmed) return;
                              removeUser(user.id);
                            }}
                            className="ml-2 p-1 text-danger hover:bg-app-bg rounded"
                            title="User löschen"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            <button
              onClick={() => setIsCreatingUser(true)}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-app-border hover:border-primary-500/60 text-xs text-app-muted"
            >
              <Plus className="w-3 h-3" />
              User anlegen
            </button>
          </div>
        </div>

        {/* Create user inline form */}
        {isCreatingUser && (
          <Card className="max-w-md">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateUser()}
                placeholder="Name des Users"
                className="flex-1 bg-app-bg border border-app-border rounded px-3 py-2 text-sm text-app-text focus:outline-none focus:border-primary-500"
                autoFocus
              />
              <button
                onClick={handleCreateUser}
                className="px-3 py-2 rounded-lg bg-primary-500/20 text-primary-300 text-xs hover:bg-primary-500/30"
              >
                Speichern
              </button>
              <button
                onClick={() => {
                  setIsCreatingUser(false);
                  setNewUserName('');
                }}
                className="px-3 py-2 rounded-lg border border-app-border text-xs text-app-muted hover:bg-app-bg"
              >
                Abbrechen
              </button>
            </div>
          </Card>
        )}

        {/* Search + current ticker / status */}
        <Card className="flex flex-col gap-3">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex-1">
              <label className="text-xs font-medium text-app-muted">Ticker suchen (Stocks & Crypto)</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Symbol oder Name..."
                className="mt-1 w-full bg-app-bg border border-app-border rounded-lg px-3 py-2 text-sm text-app-text placeholder-app-muted focus:outline-none focus:border-primary-500"
              />
              {isSearching && (
                <p className="mt-1 text-[11px] text-app-muted">Suche läuft...</p>
              )}
              {searchResults.length > 0 && (
                <div className="mt-2 max-h-56 overflow-y-auto border border-app-border rounded-lg bg-app-surface">
                  {searchResults.map((result) => (
                    <button
                      key={`${result.type}-${result.id}`}
                      onClick={() => handleSelectAsset(result)}
                      className="w-full px-3 py-2 text-left text-xs hover:bg-app-bg border-b border-app-border last:border-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="truncate">
                          <div className="font-semibold text-app-text">
                            {result.symbol}
                          </div>
                          <div className="text-[11px] text-app-muted truncate">
                            {result.name}
                          </div>
                        </div>
                        <span className="text-[10px] px-2 py-1 rounded bg-app-bg text-app-muted">
                          {result.type === 'crypto' ? 'Crypto' : 'Aktie'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1">
              <label className="text-xs font-medium text-app-muted">Aktiver Research-Ticker</label>
              {activeItem ? (
                <div className="mt-1 flex flex-col gap-1 border border-app-border rounded-lg px-3 py-2 bg-app-bg/60">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-sm font-semibold text-app-text">
                        {activeItem.asset.symbol}
                      </div>
                      <div className="text-[11px] text-app-muted truncate max-w-[220px]">
                        {activeItem.asset.name}
                      </div>
                    </div>
                    <div className="text-[10px] px-2 py-1 rounded bg-app-surface text-app-muted">
                      {activeItem.asset.type === 'crypto' ? 'Crypto' : 'Aktie'}
                    </div>
                  </div>

                  {/* Status selector */}
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-[11px] text-app-muted whitespace-nowrap">
                      Status:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => handleStatusChange(opt.value)}
                          className={`px-2 py-1 rounded-full text-[11px] border transition-colors ${
                            activeItem.status === opt.value
                              ? 'border-primary-500 bg-primary-500/10 text-primary-300'
                              : 'border-app-border bg-app-surface text-app-muted hover:bg-app-bg'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mt-1 text-sm text-app-muted">
                  Noch kein Ticker ausgewählt. Suche links oben nach einem Symbol und wähle es aus, um einen
                  Research-Eintrag anzulegen.
                </p>
              )}
            </div>
          </div>

          {/* Market header – nur wenn Asset + Preisdaten vorhanden */}
          {activeItem && priceData && (
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3 text-xs bg-app-bg border border-app-border rounded-lg px-3 py-2">
              <div>
                <div className="text-app-muted">Preis (USD)</div>
                <div className="text-sm font-semibold text-app-text">
                  {priceData.price.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD',
                    maximumFractionDigits: 4,
                  })}
                </div>
              </div>
              <div>
                <div className="text-app-muted">24h Änderung</div>
                <div
                  className={`text-sm font-semibold ${
                    priceData.change24h >= 0 ? 'text-success' : 'text-danger'
                  }`}
                >
                  {priceData.change24h.toFixed(2)} / {priceData.changePercent24h.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-app-muted">Market Cap</div>
                <div className="text-sm text-app-text">
                  {priceData.marketCap
                    ? '$ ' + (priceData.marketCap / 1_000_000_000).toFixed(2) + 'B'
                    : '–'}
                </div>
              </div>
              <div>
                <div className="text-app-muted">Letztes Update</div>
                <div className="text-sm text-app-text">
                  {new Date(priceData.lastUpdate).toLocaleTimeString()}
                </div>
              </div>
            </div>
          )}
        </Card>

        {/* Research items list for active user */}
        {userItems.length > 0 && (
          <Card title="Research-Einträge (aktueller User)" className="max-h-60 overflow-y-auto">
            <div className="space-y-1">
              {userItems.map((item) => {
                const statusLabel = STATUS_OPTIONS.find((s) => s.value === item.status)?.label ?? '';
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveDeepResearchItem(item.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between gap-2 hover:bg-app-bg ${
                      item.id === activeItem?.id ? 'bg-primary-500/10 border border-primary-500/40' : ''
                    }`}
                  >
                    <div className="truncate">
                      <div className="font-semibold text-app-text">
                        {item.asset.symbol}
                      </div>
                      <div className="text-[11px] text-app-muted truncate max-w-[220px]">
                        {item.asset.name}
                      </div>
                    </div>
                    <span className="text-[11px] text-app-muted whitespace-nowrap">
                      {statusLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>
        )}

        {/* Grid layout with modular Research-Widgets */}
        <div className="flex-1 min-h-[500px]">
          <ResponsiveGridLayout
            className="layout"
            layouts={deepResearchLayouts as any}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={90}
            onLayoutChange={(_current, all) => setDeepResearchLayouts(all as any)}
            draggableHandle=".drag-handle"
            isDraggable
            isResizable
            compactType="vertical"
          >
            {/* Notes / Spreadsheet space + Sticky Notes */}
            <div key="notes" className="bg-app-surface rounded-lg overflow-hidden border border-app-border flex flex-col">
              <div className="drag-handle cursor-move h-8 bg-app-border/80 hover:bg-primary-500/50 transition-colors shrink-0 flex items-center justify-between px-3">
                <span className="text-[11px] text-app-muted">📝 Research Notizen & Tabellen</span>
              </div>
              <div className="flex-1 min-h-0 p-3 space-y-3 overflow-y-auto">
                {activeItem ? (
                  <>
                    <textarea
                      className="w-full min-h-[120px] bg-app-bg border border-app-border rounded-lg px-3 py-2 text-xs text-app-text placeholder-app-muted focus:outline-none focus:border-primary-500 resize-none"
                      placeholder="Freier Research-Bereich. Du kannst hier Notizen, Tabellen (z.B. mit ; oder | getrennt) und Ideen sammeln."
                      value={activeItem.notes}
                      onChange={(e) => handleNotesChange(e.target.value)}
                    />
                    <StickyNotesModule
                      item={activeItem}
                      onChange={(val) => updateDeepResearchStickyNotes(activeItem.id, val)}
                    />
                  </>
                ) : (
                  <p className="text-xs text-app-muted">
                    Wähle zuerst einen Ticker oben aus, um Notizen zu diesem Asset zu speichern.
                  </p>
                )}
              </div>
            </div>

            {/* AI Chatbot space */}
            <div key="chat" className="bg-app-surface rounded-lg overflow-hidden border border-app-border flex flex-col">
              <div className="drag-handle cursor-move h-8 bg-app-border/80 hover:bg-primary-500/50 transition-colors shrink-0 flex items-center justify-between px-3">
                <span className="text-[11px] text-app-muted">🤖 AI Research Chat</span>
              </div>
              <div className="flex-1 min-h-0 flex flex-col">
                <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
                  {chatMessages.length === 0 && (
                    <div className="text-app-muted space-y-1">
                      <p>
                        Stelle hier gezielte Fragen zu deinem ausgewählten Ticker (Fundamentaldaten, Narrative,
                        Risiken, Vergleich, …).
                      </p>
                      <p className="text-[11px] flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Die Antworten kommen von Gemini (Markdown), Kontext ist dein aktueller Ticker.
                      </p>
                      <p className="text-[11px]">
                        Tipp: Schreibe konkrete Prompts wie z.B.:
                        <br />
                        - „Bewerte das Wachstumspotential im Vergleich zur Branche.“
                        <br />
                        - „Liste mir die wichtigsten Chancen und Risiken stichpunktartig auf.“
                      </p>
                    </div>
                  )}
                  {chatMessages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`max-w-[90%] rounded-lg px-3 py-2 whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'ml-auto bg-primary-500/20 text-primary-50'
                          : 'mr-auto bg-app-bg text-app-text border border-app-border'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      ) : (
                        msg.content
                      )}
                    </div>
                  ))}
                </div>
                <div className="border-t border-app-border p-2 flex items-center gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSendChat())}
                    placeholder={
                      activeItem
                        ? `Frage zur Analyse von ${activeItem.asset.symbol} stellen…`
                        : 'Wähle zuerst einen Ticker, dann stelle deine Frage…'
                    }
                    disabled={!activeItem || isChatLoading}
                    className="flex-1 bg-app-bg border border-app-border rounded-lg px-3 py-1.5 text-xs text-app-text placeholder-app-muted focus:outline-none focus:border-primary-500 disabled:opacity-60"
                  />
                  <button
                    onClick={handleSendChat}
                    disabled={!activeItem || isChatLoading}
                    className="px-3 py-1.5 rounded-lg bg-primary-500/80 text-xs text-white hover:bg-primary-500 disabled:opacity-50"
                  >
                    {isChatLoading ? 'Sendet…' : 'Senden'}
                  </button>
                </div>
                {chatError && (
                  <div className="px-3 pb-2 text-[11px] text-danger">
                    {chatError}
                  </div>
                )}
                {!geminiService.isConfigured && (
                  <div className="px-3 pb-2 text-[11px] text-yellow-400 flex items-start gap-1">
                    <Info className="w-3 h-3 mt-0.5" />
                    <span>
                      Gemini ist noch nicht konfiguriert. Setze <code>VITE_GEMINI_API_KEY</code> in den GitHub
                      Secrets, damit der AI-Chat Antworten liefern kann.
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Longform-Analysen */}
            <div key="slot3" className="bg-app-surface rounded-lg overflow-hidden border border-app-border flex flex-col">
              <div className="drag-handle cursor-move h-8 bg-app-border/80 hover:bg-primary-500/50 transition-colors shrink-0 flex items-center px-3">
                <span className="text-[11px] text-app-muted">📚 Longform-Analyse</span>
              </div>
              <div className="flex-1 min-h-0 p-3">
                {activeItem ? (
                  <LongformModule
                    item={activeItem}
                    onChange={(md) => updateDeepResearchLongform(activeItem.id, md)}
                  />
                ) : (
                  <p className="text-xs text-app-muted">
                    Wähle zuerst einen Ticker, um eine ausführliche Analyse zu verfassen.
                  </p>
                )}
              </div>
            </div>

            {/* Quellen + Watchlist-Vergleich + Backtest in einem modularen Block */}
            <div key="slot4" className="bg-app-surface rounded-lg overflow-hidden border border-app-border flex flex-col">
              <div className="drag-handle cursor-move h-8 bg-app-border/80 hover:bg-primary-500/50 transition-colors shrink-0 flex items-center px-3">
                <span className="text-[11px] text-app-muted">🔎 Quellen, Vergleiche & Backtest</span>
              </div>
              <div className="flex-1 min-h-0 p-3 space-y-3 overflow-y-auto">
                {activeItem ? (
                  <>
                    <SourcesModule
                      item={activeItem}
                      onChange={(sources) =>
                        updateDeepResearchSources(activeItem.id, () => sources)
                      }
                    />
                    <WatchlistComparisonModule item={activeItem} />
                    <BacktestModule
                      item={activeItem}
                      onChange={(cfg) => updateDeepResearchBacktestConfig(activeItem.id, () => cfg)}
                    />
                  </>
                ) : (
                  <p className="text-xs text-app-muted">
                    Wähle zuerst einen Ticker, um Quellen, Peer-Vergleiche und Backtests zu konfigurieren.
                  </p>
                )}
              </div>
            </div>
          </ResponsiveGridLayout>
        </div>

        {/* API Integration Hint */}
        <Card className="text-xs text-app-muted space-y-1">
          <p className="font-semibold text-app-text">Hinweis zu benötigten APIs</p>
          <ul className="list-disc list-inside space-y-1">
            <li>
              <span className="font-semibold">AI Chatbot</span>: Hierfür brauchst du einen LLM-Anbieter
              (z.B. OpenAI, Anthropic oder ein eigenes Backend mit lokalem Modell). Technisch würdest du die
              Fragen aus dem Chat-Input an eine Chat-Completions-API schicken und die Antwort im Chat-Modul
              anzeigen.
            </li>
            <li>
              <span className="font-semibold">Marktdaten</span>: Werden bereits über die bestehenden{' '}
              <code>CoinGecko</code>- und <code>Finnhub</code>-Integrationen geladen (siehe{' '}
              <code>marketService</code>), daher ist für den Header keine zusätzliche API nötig.
            </li>
            <li>
              <span className="font-semibold">User & Research-Daten</span>: Aktuell lokale Speicherung via{' '}
              <code>localStorage</code> (siehe <code>storage.ts</code>). Für Multi-Device-Sync wäre ein Backend
              (z.B. Supabase, Firebase, eigene REST-API) nötig.
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
};

