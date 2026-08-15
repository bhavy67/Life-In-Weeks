import { format } from 'date-fns';
import type { Milestone } from '../types';
import { getWeekDateRange, ageAtWeek } from '../utils/dateUtils';

interface Props {
  milestones: Milestone[];
  birthday: string;
  onSelectWeek: (weekIndex: number) => void;
}

export default function MemoriesView({ milestones, birthday, onSelectWeek }: Props) {
  if (milestones.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 p-8 text-center">
        <p className="text-[var(--text-tertiary)] text-sm">No memories pinned yet.</p>
        <p className="text-[var(--text-muted)] text-xs">Click any past week on the grid to add one.</p>
      </div>
    );
  }

  const sorted = [...milestones].sort((a, b) => {
    if (a.weekIndex !== b.weekIndex) return a.weekIndex - b.weekIndex;
    if (a.date && b.date) return a.date.localeCompare(b.date);
    if (a.date) return -1;
    if (b.date) return 1;
    return 0;
  });

  return (
    <div className="flex-1 overflow-auto p-4 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {sorted.map(m => (
          <button
            key={m.id}
            onClick={() => onSelectWeek(m.weekIndex)}
            className="text-left bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4 hover:border-[var(--border-elevated)] transition-colors"
          >
            <div className="text-2xl">{m.emoji || '·'}</div>
            <div className="text-[var(--text-primary)] text-sm font-medium mt-2 leading-snug">{m.title}</div>
            {m.description && (
              <div className="text-[var(--text-tertiary)] text-xs mt-1 line-clamp-2">{m.description}</div>
            )}
            <div className="flex items-center gap-1.5 mt-2.5 pt-2.5 border-t border-[var(--border-faint)]">
              <span className="text-[11px] font-semibold tracking-wide text-[var(--text-secondary)]">Age {ageAtWeek(m.weekIndex)}</span>
              <span className="text-[var(--border-elevated)]">·</span>
              <span className="text-[var(--text-muted)] text-[10px] font-mono">
                {m.date
                  ? format(new Date(m.date + 'T00:00:00'), 'MMM d, yyyy')
                  : getWeekDateRange(m.weekIndex, birthday)}
              </span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
