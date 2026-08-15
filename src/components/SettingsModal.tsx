import { useEffect, useState } from 'react';
import type { UserConfig } from '../types';
import { X } from 'lucide-react';

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
      <div className="w-full max-w-sm bg-[#0f0f0f] border border-[#222] rounded-2xl p-5 fade-in">
        <div className="flex items-center justify-between mb-5">
          <div className="text-white text-base font-light">Settings</div>
          <button onClick={onClose} className="text-[#444] hover:text-[#888] transition-colors p-1">
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="text-[#444] text-xs mb-1.5">Your name</div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[#141414] border border-[#222] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#3a3a3a]"
            />
          </div>

          <div>
            <div className="text-[#444] text-xs mb-1.5">Date of birth</div>
            <input
              type="date"
              value={birthday}
              onChange={(e) => setBirthday(e.target.value)}
              className="w-full bg-[#141414] border border-[#222] rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:border-[#3a3a3a] [color-scheme:dark]"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-[#444]">Expected lifespan</span>
              <span className="text-[#666]">{lifespan} years</span>
            </div>
            <input
              type="range"
              min={50}
              max={120}
              value={lifespan}
              onChange={(e) => setLifespan(Number(e.target.value))}
              className="w-full accent-white"
            />
          </div>
        </div>

        <div className="flex gap-2 mt-5">
          <button
            onClick={onClose}
            className="flex-1 py-2 border border-[#222] text-[#555] hover:text-[#888] rounded-lg text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || !birthday}
            className="flex-1 py-2 bg-white text-black rounded-lg text-sm font-medium hover:bg-[#e5e5e5] transition-colors disabled:opacity-20"
          >
            Save
          </button>
        </div>

        {/* Danger zone */}
        <div className="mt-5 pt-4 border-t border-[#1a1a1a]">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              className="text-[#333] hover:text-red-600 text-xs transition-colors"
            >
              Reset everything
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <span className="text-[#555] text-xs">This clears all your data.</span>
              <button
                onClick={() => { onReset(); onClose(); }}
                className="text-red-500 text-xs hover:text-red-400 font-medium"
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmReset(false)}
                className="text-[#444] text-xs hover:text-[#666]"
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
