import React from 'react';
import { DeepResearchItem } from '@/types';

interface Props {
  item: DeepResearchItem;
  onChange: (notes: string) => void;
}

export const StickyNotesModule: React.FC<Props> = ({ item, onChange }) => {
  const value = item.stickyNotes ?? '';

  return (
    <div className="h-full flex flex-col text-xs">
      <div className="mb-2 text-app-muted">
        💡 Sticky Notes – schnelle Gedankenblitze (separat von der Analyse)
      </div>
      <textarea
        className="flex-1 min-h-[120px] bg-[#facc1533] dark:bg-[#facc1533] border border-yellow-500/40 rounded-lg px-3 py-2 text-xs text-app-text placeholder-app-muted focus:outline-none focus:border-yellow-400 resize-none"
        placeholder="Kurznotizen, Ideen, ToDos..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

