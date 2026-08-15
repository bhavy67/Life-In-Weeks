import { useEffect, useState } from 'react';
import { format, isAfter, startOfDay, addYears, addMonths, getDaysInMonth, differenceInWeeks } from 'date-fns';
import type { Milestone } from '../types';
import type { ViewMode } from '../types';
import { getWeekDateRange, getWeekDays, getMonthLabel, parseBirthday, ageAtWeek } from '../utils/dateUtils';
import { X, Trash2, ArrowLeft, Plus } from 'lucide-react';

const EMOJIS = ['⭐', '🎉', '💔', '🏆', '✈️', '❤️', '🎓', '💼', '🏠', '👶', '🎂', '🌱', '💡', '🔥', '🌊'];

interface PickerContext {
  viewMode: ViewMode;
  rawCellIndex: number;
}

interface Props {
  weekIndex: number;
  birthday: string;
  memories: Milestone[];
  pickerContext: PickerContext;
  onAdd: (data: Omit<Milestone, 'id'>) => void;
  onUpdate: (id: string, data: Omit<Milestone, 'id'>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function MilestoneModal({ weekIndex, birthday, memories, pickerContext, onAdd, onUpdate, onDelete, onClose }: Props) {
  const [mode, setMode] = useState<'list' | 'form'>(() => memories.length === 0 ? 'form' : 'list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [emoji, setEmoji] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  const { viewMode: pickerMode, rawCellIndex } = pickerContext;
  const bd = parseBirthday(birthday);
  const today = startOfDay(new Date());

  // Header: age + subtitle adapted to the view that was clicked
  const age = pickerMode === 'weeks'
    ? ageAtWeek(weekIndex)
    : pickerMode === 'months'
    ? Math.floor(rawCellIndex / 12)
    : rawCellIndex;

  const headerSub = pickerMode === 'weeks'
    ? getWeekDateRange(weekIndex, birthday)
    : pickerMode === 'months'
    ? getMonthLabel(rawCellIndex, birthday)
    : format(addYears(bd, rawCellIndex), 'yyyy');

  // Week picker: 7 actual calendar days of the clicked week
  const weekDays = pickerMode === 'weeks'
    ? getWeekDays(weekIndex, birthday).map(day => ({
        isoDate: format(day, 'yyyy-MM-dd'),
        dayLabel: format(day, 'EEEEEE'),
        dayNum: format(day, 'd'),
        disabled: isAfter(startOfDay(day), today),
      }))
    : [];

  // Month picker: every day of the clicked calendar month
  const monthDays = (() => {
    if (pickerMode !== 'months') return [];
    const m = addMonths(bd, rawCellIndex);
    const first = new Date(m.getFullYear(), m.getMonth(), 1);
    return Array.from({ length: getDaysInMonth(first) }, (_, i) => {
      const d = new Date(first.getFullYear(), first.getMonth(), i + 1);
      return {
        isoDate: format(d, 'yyyy-MM-dd'),
        dayNum: i + 1,
        disabled: isAfter(startOfDay(d), today),
      };
    });
  })();

  // Year picker: the 12 months of the clicked life-year (starts on birthday)
  const yearMonths = (() => {
    if (pickerMode !== 'years') return [];
    return Array.from({ length: 12 }, (_, i) => {
      const d = addMonths(addYears(bd, rawCellIndex), i);
      const first = new Date(d.getFullYear(), d.getMonth(), 1);
      return {
        isoDate: format(first, 'yyyy-MM-dd'),
        monthLabel: format(first, 'MMM'),
        yearLabel: format(first, 'yy'),
        disabled: isAfter(startOfDay(first), today),
      };
    });
  })();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const enterForm = (memory?: Milestone) => {
    setEditingId(memory?.id ?? null);
    setEmoji(memory?.emoji ?? '');
    setTitle(memory?.title ?? '');
    setDescription(memory?.description ?? '');
    setDate(memory?.date ?? '');
    setMode('form');
  };

  const handleSave = () => {
    if (!title.trim()) return;
    // If a specific date was picked, recompute weekIndex from it so the memory
    // lands on the correct week regardless of which grid view opened this modal.
    const effectiveWeekIndex = date
      ? Math.max(0, differenceInWeeks(new Date(date + 'T00:00:00'), bd))
      : weekIndex;
    const data: Omit<Milestone, 'id'> = {
      weekIndex: effectiveWeekIndex,
      title: title.trim(),
      emoji: emoji || undefined,
      description: description.trim() || undefined,
      date: date || undefined,
    };
    if (editingId) {
      onUpdate(editingId, data);
    } else {
      onAdd(data);
    }
    setMode('list');
  };

  const goBack = () => {
    setMode('list');
    setEditingId(null);
  };

  const cellCls = (selected: boolean, disabled: boolean) =>
    [
      'rounded border transition-colors',
      disabled
        ? 'border-[var(--border-faint)] text-[var(--text-muted)] opacity-30 cursor-not-allowed'
        : selected
        ? 'border-[var(--border-elevated)] bg-[var(--bg-hover)] text-[var(--text-primary)]'
        : 'border-[var(--border-faint)] text-[var(--text-muted)] hover:border-[var(--border)] hover:text-[var(--text-secondary)]',
    ].join(' ');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 fade-in">

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2 min-w-0">
            {mode === 'form' && memories.length > 0 && (
              <button onClick={goBack} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors p-1 -ml-1 flex-shrink-0">
                <ArrowLeft size={15} />
              </button>
            )}
            <div className="min-w-0">
              <div className="text-[var(--text-primary)] text-base font-light">
                {mode === 'list'
                  ? `${memories.length} memor${memories.length === 1 ? 'y' : 'ies'}`
                  : (editingId ? 'Edit memory' : 'Add memory')}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[11px] font-semibold tracking-wide text-[var(--text-secondary)]">Age {age}</span>
                <span className="text-[var(--border-elevated)] text-[10px]">·</span>
                <span className="text-[var(--text-tertiary)] text-[10px] font-mono">{headerSub}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors p-1 flex-shrink-0 ml-2">
            <X size={16} />
          </button>
        </div>

        {/* List mode */}
        {mode === 'list' && (
          <div className="mt-4">
            <div className="space-y-2">
              {memories.map(m => (
                <div key={m.id} className="flex items-center gap-3 bg-[var(--bg-input)] rounded-xl px-3 py-2.5">
                  <span className="text-lg flex-shrink-0 w-7 text-center">{m.emoji || '·'}</span>
                  <div className="flex-1 min-w-0">
                    <span className="text-[var(--text-primary)] text-sm truncate block">{m.title}</span>
                    {m.date && (
                      <span className="text-[var(--text-muted)] text-[10px] font-mono">
                        {format(new Date(m.date + 'T00:00:00'), 'EEE, MMM d')}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => enterForm(m)}
                    className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors p-1 flex-shrink-0 text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(m.id)}
                    className="text-[var(--text-muted)] hover:text-red-500 transition-colors p-1 flex-shrink-0"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => enterForm()}
              className="w-full mt-3 py-2.5 flex items-center justify-center gap-2 border border-dashed border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:border-[var(--border-elevated)] rounded-xl text-sm transition-colors"
            >
              <Plus size={14} /> Add memory
            </button>
          </div>
        )}

        {/* Form mode */}
        {mode === 'form' && (
          <div className="mt-4">
            {/* Emoji picker */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setEmoji('')}
                className={`w-8 h-8 rounded text-xs border transition-colors ${emoji === '' ? 'border-[var(--border-elevated)] bg-[var(--bg-hover)]' : 'border-[var(--border-faint)] hover:border-[var(--border)]'}`}
              >—</button>
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={`w-8 h-8 rounded text-base border transition-colors ${emoji === e ? 'border-[var(--border-elevated)] bg-[var(--bg-hover)]' : 'border-[var(--border-faint)] hover:border-[var(--border)]'}`}
                >{e}</button>
              ))}
            </div>

            {/* Date picker — adapts to which grid view was clicked */}
            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
                {pickerMode === 'years' ? 'Month' : 'Day'}
                <span className="normal-case opacity-60"> · optional</span>
              </div>

              {/* Week view: 7-day strip */}
              {pickerMode === 'weeks' && (
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => setDate('')}
                    className={`px-2 py-1.5 text-xs flex-shrink-0 ${cellCls(date === '', false)}`}
                  >—</button>
                  {weekDays.map(({ isoDate, dayLabel, dayNum, disabled }) => (
                    <button
                      key={isoDate}
                      type="button"
                      disabled={disabled}
                      onClick={() => setDate(prev => prev === isoDate ? '' : isoDate)}
                      className={`flex-1 py-1.5 flex flex-col items-center justify-center min-w-0 ${cellCls(date === isoDate, disabled)}`}
                    >
                      <span className="text-[8px] uppercase tracking-wide leading-none">{dayLabel}</span>
                      <span className="text-[11px] font-medium leading-tight mt-0.5">{dayNum}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Month view: day-of-month buttons */}
              {pickerMode === 'months' && (
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    onClick={() => setDate('')}
                    className={`w-8 h-8 text-xs ${cellCls(date === '', false)}`}
                  >—</button>
                  {monthDays.map(({ isoDate, dayNum, disabled }) => (
                    <button
                      key={isoDate}
                      type="button"
                      disabled={disabled}
                      onClick={() => setDate(prev => prev === isoDate ? '' : isoDate)}
                      className={`w-8 h-8 text-xs ${cellCls(date === isoDate, disabled)}`}
                    >
                      {dayNum}
                    </button>
                  ))}
                </div>
              )}

              {/* Year view: month-of-year buttons */}
              {pickerMode === 'years' && (
                <div className="flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => setDate('')}
                    className={`px-2.5 py-1.5 text-xs flex-shrink-0 ${cellCls(date === '', false)}`}
                  >—</button>
                  {yearMonths.map(({ isoDate, monthLabel, yearLabel, disabled }) => (
                    <button
                      key={isoDate}
                      type="button"
                      disabled={disabled}
                      onClick={() => setDate(prev => prev === isoDate ? '' : isoDate)}
                      className={`flex flex-col items-center px-2.5 py-1.5 ${cellCls(date === isoDate, disabled)}`}
                    >
                      <span className="text-xs font-medium leading-none">{monthLabel}</span>
                      <span className="text-[9px] leading-tight mt-0.5 opacity-60">'{yearLabel}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Title */}
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="What happened?"
              autoFocus
              maxLength={80}
              className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--border-elevated)] mb-3"
            />

            {/* Description */}
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add more detail... (optional)"
              rows={2}
              maxLength={300}
              className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none focus:border-[var(--border-elevated)] resize-none"
            />

            <div className="flex gap-2 mt-4">
              {memories.length > 0 && (
                <button onClick={goBack} className="flex-1 py-2 border border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] rounded-lg text-sm transition-colors">
                  Cancel
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!title.trim()}
                className="flex-1 py-2 bg-[var(--btn-bg)] text-[var(--btn-text)] rounded-lg text-sm font-medium hover:bg-[var(--btn-hover)] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
              >
                {editingId ? 'Update' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
