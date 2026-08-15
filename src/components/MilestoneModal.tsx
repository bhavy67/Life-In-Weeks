import { useEffect, useState } from 'react';
import { format, isAfter, startOfDay } from 'date-fns';
import type { Milestone } from '../types';
import { getWeekDateRange, getWeekDays, ageAtWeek } from '../utils/dateUtils';
import { X, Trash2, ArrowLeft, Plus } from 'lucide-react';

const EMOJIS = ['⭐', '🎉', '💔', '🏆', '✈️', '❤️', '🎓', '💼', '🏠', '👶', '🎂', '🌱', '💡', '🔥', '🌊'];

interface Props {
  weekIndex: number;
  birthday: string;
  memories: Milestone[];
  onAdd: (data: Omit<Milestone, 'id'>) => void;
  onUpdate: (id: string, data: Omit<Milestone, 'id'>) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function MilestoneModal({ weekIndex, birthday, memories, onAdd, onUpdate, onDelete, onClose }: Props) {
  const [mode, setMode] = useState<'list' | 'form'>(() => memories.length === 0 ? 'form' : 'list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [emoji, setEmoji] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  const weekStart = getWeekDateRange(weekIndex, birthday);
  const age = ageAtWeek(weekIndex);

  const today = startOfDay(new Date());
  const weekDays = getWeekDays(weekIndex, birthday).map(day => ({
    isoDate: format(day, 'yyyy-MM-dd'),
    dayLabel: format(day, 'EEEEEE'),
    dayNum: format(day, 'd'),
    disabled: isAfter(startOfDay(day), today),
  }));

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
    const data: Omit<Milestone, 'id'> = {
      weekIndex,
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
                <span className="text-[var(--text-tertiary)] text-[10px] font-mono">{weekStart}</span>
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

            {/* Day picker */}
            <div className="mb-4">
              <div className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1.5">
                Day <span className="normal-case opacity-60">· optional</span>
              </div>
              <div className="flex gap-1">
                {/* Clear / no specific day */}
                <button
                  type="button"
                  onClick={() => setDate('')}
                  className={`px-2 py-1.5 rounded border text-xs transition-colors flex-shrink-0 ${
                    date === ''
                      ? 'border-[var(--border-elevated)] bg-[var(--bg-hover)] text-[var(--text-secondary)]'
                      : 'border-[var(--border-faint)] text-[var(--text-muted)] hover:border-[var(--border)]'
                  }`}
                >—</button>
                {/* Day buttons */}
                {weekDays.map(({ isoDate, dayLabel, dayNum, disabled }) => (
                  <button
                    key={isoDate}
                    type="button"
                    disabled={disabled}
                    onClick={() => setDate(prev => prev === isoDate ? '' : isoDate)}
                    className={[
                      'flex-1 py-1.5 rounded border transition-colors flex flex-col items-center justify-center min-w-0',
                      disabled
                        ? 'border-[var(--border-faint)] text-[var(--text-muted)] opacity-30 cursor-not-allowed'
                        : date === isoDate
                        ? 'border-[var(--border-elevated)] bg-[var(--bg-hover)] text-[var(--text-primary)]'
                        : 'border-[var(--border-faint)] text-[var(--text-muted)] hover:border-[var(--border)] hover:text-[var(--text-secondary)]',
                    ].join(' ')}
                  >
                    <span className="text-[8px] uppercase tracking-wide leading-none">{dayLabel}</span>
                    <span className="text-[11px] font-medium leading-tight mt-0.5">{dayNum}</span>
                  </button>
                ))}
              </div>
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
