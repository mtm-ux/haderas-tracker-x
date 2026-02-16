import React, { useState } from 'react';
import { Eye, Edit3 } from 'lucide-react';
import { DeepResearchItem } from '@/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Props {
  item: DeepResearchItem;
  onChange: (markdown: string) => void;
}

export const LongformModule: React.FC<Props> = ({ item, onChange }) => {
  const [mode, setMode] = useState<'edit' | 'preview'>('edit');
  const value = item.longformMarkdown ?? '';

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 text-xs text-app-muted">
          <span>📚 Longform-Analyse (Markdown)</span>
        </div>
        <div className="flex items-center gap-1 text-[11px]">
          <button
            onClick={() => setMode('edit')}
            className={`px-2 py-1 rounded-l border border-app-border ${
              mode === 'edit' ? 'bg-app-bg text-app-text' : 'bg-app-surface text-app-muted'
            }`}
          >
            <Edit3 className="inline w-3 h-3 mr-1" />
            Edit
          </button>
          <button
            onClick={() => setMode('preview')}
            className={`px-2 py-1 rounded-r border border-app-border border-l-0 ${
              mode === 'preview' ? 'bg-app-bg text-app-text' : 'bg-app-surface text-app-muted'
            }`}
          >
            <Eye className="inline w-3 h-3 mr-1" />
            Preview
          </button>
        </div>
      </div>

      {mode === 'edit' ? (
        <textarea
          className="flex-1 min-h-[180px] bg-app-bg border border-app-border rounded-lg px-3 py-2 text-xs text-app-text placeholder-app-muted focus:outline-none focus:border-primary-500 resize-none"
          placeholder="# These\n\nSchreibe hier deine ausführliche Fundamentalanalyse in Markdown (Überschriften, Bulletpoints, Tabellen mit |, Checklisten mit - [ ] ...)."
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="flex-1 min-h-[180px] bg-app-bg border border-app-border rounded-lg px-3 py-2 text-xs text-app-text overflow-y-auto prose prose-invert max-w-none">
          {value ? (
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {value}
            </ReactMarkdown>
          ) : (
            <p className="text-app-muted">
              Noch keine Analyse vorhanden. Wechsle in den Edit-Modus, um zu starten.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

