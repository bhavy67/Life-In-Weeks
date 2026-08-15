import { useEffect, useState } from 'react';
import type { UserConfig } from '../types';
import { X, ShieldCheck } from 'lucide-react';

interface Props {
  user: UserConfig;
  onSave: (user: UserConfig) => void;
  onReset: () => void;
  onClose: () => void;
}

export default function SettingsModal({ user, onSave, onReset, onClose }: Props) {
  const [name, setName] = useState(user.name);
  const [birthday, setBirthday] = useState(user.birthday);
  const [lifespan, setLifespan] = useState(user.lifespan);
  const [confirmReset, setConfirmReset] = useState(false);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleSave = () => {
    if (!name.trim() || !birthday) return;
    onSave({ name: name.trim(), birthday, lifespan });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 fade-in">
        <div className="flex items-center justify-between mb-5">
          <div className="text-[var(--text-primary)] text-base font-light">Settings</div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-[var(--text-muted)] text-xs mb-1.5">Your name</div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--border-elevated)]"
            />
          </div>

          <div>
            <div className="text-[var(--text-muted)] text-xs mb-1.5">Date of birth</div>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-3 py-2.5 text-[var(--text-primary)] text-sm focus:outline-none focus:border-[var(--border-elevated)]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[var(--text-muted)]">Expected lifespan</span>
              <span className="text-[var(--text-tertiary)]">{lifespan} years</span>
            </div>
            <input
              type="range"
              min={50}
              max={120}
              value={lifespan}
              onChange={(e) => setLifespan(Number(e.target.value))}
              className="w-full"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-[var(--border)] text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !birthday}
            className="flex-1 py-2 bg-[var(--btn-bg)] text-[var(--btn-text)] rounded-lg text-sm font-medium hover:bg-[var(--btn-hover)] transition-colors disabled:opacity-20"
          >
            Save
          </button>
        </div>

        {/* Privacy note */}
        <div className="mt-5 pt-4 border-t border-[var(--border-faint)] flex gap-2">
          <ShieldCheck size={13} className="text-[var(--text-muted)] flex-shrink-0 mt-0.5" />
          <p className="text-[var(--text-muted)] text-[11px] leading-relaxed">
            Everything stays on your device. No accounts, no servers, no tracking — your data never leaves your browser.
          </p>
        </div>

        {/* Danger zone */}
        <div className="mt-5 pt-4 border-t border-[var(--border-faint)]">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-[var(--text-muted)] hover:text-red-600 text-xs transition-colors"
            >
              Reset everything
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[var(--text-tertiary)] text-xs">This clears all your data.</span>
              <button
                onClick={() => { onReset(); onClose(); }}
                className="text-red-500 text-xs hover:text-red-400 font-medium"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="text-[var(--text-muted)] text-xs hover:text-[var(--text-tertiary)]"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
