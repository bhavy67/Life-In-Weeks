import type { Era, Milestone } from '../types';

interface Props {
  name: string;
  pctLived: number;
  weeksLeft: number;
  currentWeekIndex: number;
  preciseAge: { years: number; months: number };
  milestones: Milestone[];
  eras: Era[];
  onAddEra: () => void;
  onEditEra: (era: Era) => void;
}

export default function Sidebar({
  name,
  pctLived,
  weeksLeft,
  currentWeekIndex,
  preciseAge,
  milestones,
  eras,
  onAddEra,
  onEditEra,
}: Props) {
  const weeksUntil = (targetAge: number) =>
    Math.max(0, targetAge * 52 - currentWeekIndex);

  return (
    <div className="space-y-6 text-sm">
      {/* Name + age */}
      <div>
        <div className="text-[var(--text-tertiary)] text-xs uppercase tracking-widest mb-1">Your life</div>
        <div className="text-[var(--text-primary)] text-lg font-light">{name}</div>
        <div className="text-[var(--text-tertiary)] text-xs mt-0.5">
          {preciseAge.years} years, {preciseAge.months} months old
        </div>
      </div>

      {/* Progress */}
      <div>
        <div className="flex justify-between text-xs text-[var(--text-tertiary)] mb-2">
          <span>{currentWeekIndex.toLocaleString()} weeks lived</span>
          <span>{pctLived.toFixed(1)}%</span>
        </div>
        <div className="h-[3px] bg-[var(--progress-track)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--progress-fill)] rounded-full transition-all duration-500"
            style={{ width: `${pctLived}%` }}
          />
        </div>
        <div className="text-[var(--text-muted)] text-xs mt-2">
          {weeksLeft.toLocaleString()} weeks remaining
        </div>
      </div>

      {/* Upcoming milestones */}
      <div className="space-y-2">
        <div className="text-[var(--text-muted)] text-xs uppercase tracking-widest mb-3">Milestones ahead</div>
        {[40, 50, 60, 70].map((age) => {
          const weeks = weeksUntil(age);
          if (weeks === 0) return null;
          return (
            <div key={age} className="flex justify-between text-xs">
              <span className="text-[var(--text-tertiary)]">Age {age}</span>
              <span className="text-[var(--text-muted)] font-mono">
                {weeks.toLocaleString()} weeks
              </span>
            </div>
          );
        })}
      </div>

      {/* Memories count */}
      <div className="border-t border-[var(--border-faint)] pt-4">
        <div className="flex justify-between items-center">
          <span className="text-[var(--text-tertiary)] text-xs uppercase tracking-widest">Memories pinned</span>
          <span className="text-[var(--text-primary)] text-lg font-light">{milestones.length}</span>
        </div>
      </div>

      {/* Eras */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <div className="text-[var(--text-muted)] text-xs uppercase tracking-widest">Eras</div>
          <button
            onClick={onAddEra}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] text-xs transition-colors"
          >
            + Add era
          </button>
        </div>
        {eras.length === 0 && (
          <div className="text-[var(--text-muted)] text-xs">
            Color-code phases of your life.
          </div>
        )}
        <div className="space-y-2">
          {eras.map((era) => (
            <button
              key={era.id}
              onClick={() => onEditEra(era)}
              className="w-full flex items-center gap-2 text-left hover:bg-[var(--bg-hover)] rounded px-1 py-0.5 transition-colors group"
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: era.color }}
              />
              <span className="text-[var(--text-tertiary)] text-xs group-hover:text-[var(--text-secondary)] truncate">
                {era.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
