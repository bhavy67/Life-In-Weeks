import { useEffect, useState } from 'react';
import type { Milestone } from '../types';
import { getWeekDateRange, ageAtWeek } from '../utils/dateUtils';
import { X, Trash2 } from 'lucide-react';

const EMOJIS = ['⭐', '🎉', '💔', '🏆', '✈️', '❤️', '🎓', '💼', '🏠', '👶', '🎂', '🌱', '💡', '🔥', '🌊'];

interface Props {
  weekIndex: number;
  birthday: string;
  existing?: Milestone;
  onSave: (milestone: Omit<Milestone, 'id'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function MilestoneModal({
  weekIndex,
  birthday,
  existing,
  onSave,
  onDelete,
  onClose,
}: Props) {
  const [title, setTitle] = useState(existing?.title ?? '');
  const [description, setDescription] = useState(existing?.description ?? '');
  const [emoji, setEmoji] = useState(existing?.emoji ?? '');

  const dateRange = getWeekDateRange(weekIndex, birthday);
  const age = ageAtWeek(weekIndex);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({ weekIndex, title: title.trim(), description: description.trim() || undefined, emoji: emoji || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#0f0f0f] border border-[#222] rounded-2xl p-5 fade-in">
        {/* Header */}
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="text-[#555] text-xs uppercase tracking-widest mb-1">
              Age {age} · {dateRange}
            </div>
            <div className="text-white text-base font-light">
              {existing ? 'Edit memory' : 'Pin a memory'}
            </div>
          </div>
          <button onClick={onClose} className="text-[#444] hover:text-[#888] transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        {/* Emoji picker */}
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setEmoji('')}
            className={`w-8 h-8 rounded text-xs border transition-colors ${
              emoji === '' ? 'border-[#555] bg-[#1a1a1a]' : 'border-[#1f1f1f] hover:border-[#333]'
            }`}
          >
            —
          </button>
          {EMOJIS.map((e) => (
            <button
              key={e}
              onClick={() => setEmoji(e)}
              className={`w-8 h-8 rounded text-base border transition-colors ${
                emoji === e ? 'border-[#555] bg-[#1a1a1a]' : 'border-[#1f1f1f] hover:border-[#333]'
              }`}
            >
              {e}
            </button>
          ))}
        </div>

        {/* Title */}
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What happened?"
          autoFocus
          maxLength={80}
          className="w-full bg-[#141414] border border-[#222] rounded-lg px-3 py-2.5 text-white placeholder:text-[#333] text-sm focus:outline-none focus:border-[#3a3a3a] mb-3"
        />

        {/* Description */}
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add more detail... (optional)"
          rows={2}
          maxLength={300}
          className="w-full bg-[#141414] border border-[#222] rounded-lg px-3 py-2.5 text-white placeholder:text-[#333] text-sm focus:outline-none focus:border-[#3a3a3a] resize-none"
        />

        {/* Actions */}
        <div className="flex gap-2 mt-4">
          {existing && onDelete && (
            <button
              onClick={() => { onDelete(); onClose(); }}
              className="flex items-center gap-1.5 px-3 py-2 text-[#444] hover:text-red-500 border border-[#1f1f1f] hover:border-red-900/50 rounded-lg text-sm transition-colors"
            >
              <Trash2 size={13} />
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-[#222] text-[#555] hover:text-[#888] rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="flex-1 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-[#e5e5e5] transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
          >
            {existing ? 'Update' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
