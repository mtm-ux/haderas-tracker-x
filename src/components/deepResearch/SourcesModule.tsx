import React, { useState } from 'react';
import { Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import { DeepResearchItem, DeepResearchSource, SourceType } from '@/types';
import { generateId } from '@/utils/formatters';

interface Props {
  item: DeepResearchItem;
  onChange: (sources: DeepResearchSource[]) => void;
}

const TYPE_LABELS: { value: SourceType; label: string }[] = [
  { value: 'news', label: 'News' },
  { value: 'report', label: 'Report' },
  { value: 'pdf', label: 'PDF' },
  { value: 'video', label: 'Video' },
  { value: 'other', label: 'Sonstiges' },
];

export const SourcesModule: React.FC<Props> = ({ item, onChange }) => {
  const [draft, setDraft] = useState<Partial<DeepResearchSource>>({
    url: '',
    title: '',
    date: '',
    type: 'other',
  });

  const sources = item.sources ?? [];

  const addSource = () => {
    if (!draft.url || !draft.title) return;
    const next: DeepResearchSource = {
      id: generateId(),
      url: draft.url!,
      title: draft.title!,
      date: draft.date || new Date().toISOString().slice(0, 10),
      type: (draft.type as SourceType) || 'other',
      notes: draft.notes,
    };
    onChange([...sources, next]);
    setDraft({ url: '', title: '', date: '', type: 'other' });
  };

  const removeSource = (id: string) => {
    onChange(sources.filter((s) => s.id !== id));
  };

  return (
    <div className="h-full flex flex-col text-xs">
      <div className="flex items-center justify-between mb-2">
        <span className="text-app-muted flex items-center gap-1">
          🔗 Quellen & Dokumente
        </span>
      </div>

      {/* Form */}
      <div className="grid grid-cols-2 gap-2 mb-2">
        <input
          type="text"
          placeholder="Titel"
          value={draft.title ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          className="bg-app-bg border border-app-border rounded px-2 py-1 text-xs text-app-text placeholder-app-muted focus:outline-none focus:border-primary-500"
        />
        <input
          type="date"
          value={draft.date ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, date: e.target.value }))}
          className="bg-app-bg border border-app-border rounded px-2 py-1 text-xs text-app-text placeholder-app-muted focus:outline-none focus:border-primary-500"
        />
        <input
          type="url"
          placeholder="URL"
          value={draft.url ?? ''}
          onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))}
          className="col-span-2 bg-app-bg border border-app-border rounded px-2 py-1 text-xs text-app-text placeholder-app-muted focus:outline-none focus:border-primary-500"
        />
        <select
          value={draft.type ?? 'other'}
          onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as SourceType }))}
          className="bg-app-bg border border-app-border rounded px-2 py-1 text-xs text-app-text focus:outline-none focus:border-primary-500"
        >
          {TYPE_LABELS.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          onClick={addSource}
          className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded bg-primary-500/20 text-primary-300 hover:bg-primary-500/30"
        >
          <Plus className="w-3 h-3" />
          Hinzufügen
        </button>
      </div>

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto border border-app-border rounded-md bg-app-bg/60">
        {sources.length === 0 ? (
          <div className="p-3 text-app-muted">
            Noch keine Quellen gespeichert. Füge oben Links zu PDFs, Artikeln oder Berichten hinzu.
          </div>
        ) : (
          <ul className="divide-y divide-app-border">
            {sources.map((source) => (
              <li key={source.id} className="px-3 py-2 flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[11px] text-app-muted">
                      <LinkIcon className="w-3 h-3" />
                      {TYPE_LABELS.find((t) => t.value === source.type)?.label ?? source.type}
                    </span>
                    <span className="text-[10px] text-app-muted">
                      {source.date}
                    </span>
                  </div>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-app-text hover:text-primary-300 truncate"
                    title={source.title}
                  >
                    {source.title}
                  </a>
                  {source.notes && (
                    <p className="mt-0.5 text-[11px] text-app-muted truncate">
                      {source.notes}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => removeSource(source.id)}
                  className="p-1 text-danger hover:bg-app-surface rounded"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

