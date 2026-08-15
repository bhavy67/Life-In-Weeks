import { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import type { ViewMode } from '../types';
import type { SharedState } from '../utils/shareUtils';
import { useLifeGrid } from '../hooks/useLifeGrid';
import LifeGrid from './Grid/LifeGrid';
import QuoteFooter from './QuoteFooter';

const VIEW_MODES: { id: ViewMode; label: string }[] = [
  { id: 'weeks', label: 'Weeks' },
  { id: 'months', label: 'Months' },
  { id: 'years', label: 'Years' },
];

const FALLBACK_NAME = '';

export default function SharedView({ state }: { state: SharedState }) {
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    window.innerWidth < 640 ? 'years' : 'weeks',
  );

  const user = { name: FALLBACK_NAME, birthday: state.birthday, lifespan: state.lifespan };
  const grid = useLifeGrid(user, state.milestones, state.eras);

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-app)]">
      {/* Shared banner */}
      <div className="bg-[var(--bg-surface)] border-b border-[var(--border-faint)] px-4 py-2 flex items-center justify-between gap-4 flex-shrink-0">
        <p className="text-[var(--text-muted)] text-xs truncate">
          Someone's life grid ·{' '}
          <span className="text-[var(--text-tertiary)]">
            {grid.pctLived.toFixed(1)}% lived · {grid.weeksLeft.toLocaleString()} weeks left
          </span>
        </p>
        <a
          href="/"
          className="flex items-center gap-1.5 text-xs bg-[var(--btn-bg)] text-[var(--btn-text)] px-3 py-1.5 rounded-lg font-medium hover:bg-[var(--btn-hover)] transition-colors whitespace-nowrap flex-shrink-0"
        >
          Map your own <ExternalLink size={11} />
        </a>
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--border-faint)] flex-shrink-0">
        <div className="text-[var(--text-muted)] text-xs tracking-[0.25em] uppercase select-none">
          Life in Weeks
        </div>

        <div className="flex gap-0.5 bg-[var(--bg-toggle)] border border-[var(--border-faint)] rounded-lg p-0.5">
          {VIEW_MODES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              className={[
                'px-2.5 sm:px-3 py-1 rounded-md text-xs transition-all duration-150',
                viewMode === id
                  ? 'bg-[var(--bg-active)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-tertiary)]',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="w-20 hidden sm:block" />
      </header>

      {/* Grid */}
      <main className="flex-1 overflow-auto p-4 sm:p-6">
        <LifeGrid
          viewMode={viewMode}
          lifespan={state.lifespan}
          birthday={state.birthday}
          currentWeekIndex={grid.currentWeekIndex}
          currentMonthIndex={grid.currentMonthIndex}
          currentYearIndex={grid.currentYearIndex}
          eraMap={grid.eraMap}
          milestoneWeekSet={grid.milestoneWeekSet}
          milestoneMonthSet={grid.milestoneMonthSet}
          milestoneYearSet={grid.milestoneYearSet}
          milestoneMap={grid.milestoneMap}
          onCellClick={() => {}}
          animateIn={false}
        />
      </main>

      <QuoteFooter />
    </div>
  );
}
