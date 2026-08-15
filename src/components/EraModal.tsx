import { useEffect, useState } from 'react';
import type { Era } from '../types';
import { X, Trash2 } from 'lucide-react';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e',
  '#14b8a6', '#3b82f6', '#6366f1', '#a855f7',
  '#ec4899', '#64748b', '#f43f5e', '#84cc16',
];

interface Props {
  existing?: Era;
  maxWeeks: number;
  onSave: (era: Omit<Era, 'id'>) => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function EraModal({ existing, maxWeeks, onSave, onDelete, onClose }: Props) {
  const maxAge = Math.floor(maxWeeks / 52);

  const [name, setName] = useState(existing?.name ?? '');
  const [color, setColor] = useState(existing?.color ?? PRESET_COLORS[5]);
  const [startAge, setStartAge] = useState(
    existing ? Math.floor(existing.startWeek / 52) : 0,
  );
  const [endAge, setEndAge] = useState(
    existing ? Math.floor(existing.endWeek / 52) : 18,
  );

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      color,
      startWeek: startAge * 52,
      endWeek: Math.min(endAge * 52 + 51, maxWeeks - 1),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[#0f0f0f] border border-[#222] rounded-2xl p-5 fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="text-white text-base font-light">
            {existing ? 'Edit era' : 'Add an era'}
          </div>
          <button onClick={onClose} className="text-[#444] hover:text-[#888] transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        {/* Name */}
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Era name (e.g. Childhood)"
          autoFocus
          maxLength={40}
          className="w-full bg-[#141414] border border-[#222] rounded-lg px-3 py-2.5 text-white placeholder:text-[#333] text-sm focus:outline-none focus:border-[#3a3a3a] mb-4"
        />

        {/* Color picker */}
        <div className="mb-5">
          <div className="text-[#444] text-xs mb-2">Color</div>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-7 h-7 rounded-full border-2 transition-all"
                style={{
                  background: c,
                  borderColor: color === c ? '#fff' : 'transparent',
                  transform: color === c ? 'scale(1.15)' : 'scale(1)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Age range */}
        <div className="mb-5">
          <div className="text-[#444] text-xs mb-3">Age range</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <div className="text-[#333] text-xs mb-1">From age</div>
              <input
                type="number"
                min={0}
                max={endAge - 1}
                value={startAge}
                onChange={(e) => setStartAge(Math.min(Number(e.target.value), endAge - 1))}
                className="w-full bg-[#141414] border border-[#222] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#3a3a3a] [appearance:textfield]"
              />
            </div>
            <div>
              <div className="text-[#333] text-xs mb-1">To age</div>
              <input
                type="number"
                min={startAge + 1}
                max={maxAge}
                value={endAge}
                onChange={(e) => setEndAge(Math.max(Number(e.target.value), startAge + 1))}
                className="w-full bg-[#141414] border border-[#222] rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#3a3a3a] [appearance:textfield]"
              />
            </div>
          </div>

          {/* Preview bar */}
          <div className="mt-3 h-2 bg-[#1a1a1a] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{
                marginLeft: `${(startAge / maxAge) * 100}%`,
                width: `${((endAge - startAge) / maxAge) * 100}%`,
                background: color + 'aa',
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
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
            disabled={!name.trim() || endAge <= startAge}
            className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-20 disabled:cursor-not-allowed"
            style={{ background: color, color: '#000' }}
          >
            {existing ? 'Update' : 'Add era'}
          </button>
        </div>
      </div>
    </div>
  );
}
