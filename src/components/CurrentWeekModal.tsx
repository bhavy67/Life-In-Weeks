import { differenceInDays, addWeeks, startOfDay } from 'date-fns';
import { X, Pencil } from 'lucide-react';
import type { Era, Milestone } from '../types';
import { parseBirthday, getWeekDateRange } from '../utils/dateUtils';

interface Props {
  birthday: string;
  currentWeekIndex: number;
  currentEra?: Era;
  currentMilestone?: Milestone;
  pctLived: number;
  weeksLeft: number;
  preciseAge: { years: number; months: number };
  onEditMilestone: () => void;
  onClose: () => void;
}

export default function CurrentWeekModal({
  birthday,
  currentWeekIndex,
  currentEra,
  currentMilestone,
  pctLived,
  weeksLeft,
  preciseAge,
  onEditMilestone,
  onClose,
}: Props) {
  const bd = parseBirthday(birthday);
  const weekStart = addWeeks(bd, currentWeekIndex);
  const weekEnd = addWeeks(bd, currentWeekIndex + 1);
  const today = startOfDay(new Date());
  const daysIntoWeek = Math.max(0, differenceInDays(today, weekStart));
  const daysLeft = Math.max(0, differenceInDays(weekEnd, today));
  const dateRange = getWeekDateRange(currentWeekIndex, birthday);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-elevated)] rounded-2xl p-6 shadow-2xl fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-[var(--text-muted)] text-[10px] tracking-widest uppercase mb-1">
              This week
            </div>
            <h2 className="text-[var(--text-primary)] text-2xl font-semibold">
              Week {currentWeekIndex + 1}
            </h2>
            <p className="text-[var(--text-tertiary)] text-xs mt-0.5">{dateRange}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Age */}
        <div className="bg-[var(--bg-input)] rounded-xl p-4 mb-2.5">
          <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest mb-1">
            Your age
          </div>
          <div className="text-[var(--text-primary)] text-base font-medium">
            {preciseAge.years} years, {preciseAge.months} months
          </div>
          <div className="text-[var(--text-tertiary)] text-xs mt-0.5">
            Day {daysIntoWeek + 1} of this week · {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
          </div>
        </div>

        {/* Progress */}
        <div className="bg-[var(--bg-input)] rounded-xl p-4 mb-2.5">
          <div className="flex justify-between text-[10px] text-[var(--text-muted)] uppercase tracking-widest mb-2">
            <span>Life lived</span>
            <span>{pctLived.toFixed(1)}%</span>
          </div>
          <div className="h-1.5 bg-[var(--progress-track)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--progress-fill)] rounded-full"
              style={{ width: `${pctLived}%` }}
            />
          </div>
          <div className="text-[var(--text-muted)] text-xs mt-2">
            {weeksLeft.toLocaleString()} weeks remaining
          </div>
        </div>

        {/* Current era */}
        {currentEra && (
          <div className="bg-[var(--bg-input)] rounded-xl p-4 mb-2.5 flex items-center gap-3">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: currentEra.color }}
            />
            <div>
              <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest">
                Era
              </div>
              <div className="text-[var(--text-primary)] text-sm">{currentEra.name}</div>
            </div>
          </div>
        )}

        {/* Memory */}
        {currentMilestone ? (
          <div className="bg-[var(--bg-input)] rounded-xl p-4 flex items-start justify-between gap-3">
            <div>
              <div className="text-[var(--text-muted)] text-[10px] uppercase tracking-widest mb-1">
                Memory
              </div>
              <div className="text-[var(--text-primary)] text-sm">
                {currentMilestone.emoji && (
                  <span className="mr-1">{currentMilestone.emoji}</span>
                )}
                {currentMilestone.title}
              </div>
              {currentMilestone.description && (
                <div className="text-[var(--text-tertiary)] text-xs mt-0.5">
                  {currentMilestone.description}
                </div>
              )}
            </div>
            <button
              onClick={onEditMilestone}
              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex-shrink-0"
            >
              <Pencil size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={onEditMilestone}
            className="w-full py-3 rounded-xl border border-dashed border-[var(--border)] text-[var(--text-muted)] text-sm hover:text-[var(--text-secondary)] hover:border-[var(--border-elevated)] transition-colors"
          >
            + Pin a memory to this week
          </button>
        )}
      </div>
    </div>
  );
}
