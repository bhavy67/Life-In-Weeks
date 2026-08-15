import { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { generateWallpaper, type WallpaperOptions } from '../utils/generateWallpaper';

interface Props extends WallpaperOptions {
  userName: string;
  onClose: () => void;
}

export default function WallpaperModal({ userName, onClose, ...opts }: Props) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  useEffect(() => {
    // Defer slightly so the modal fade-in animates before the canvas work begins
    const id = setTimeout(() => {
      setImageUrl(generateWallpaper(opts));
    }, 80);
    return () => clearTimeout(id);
    // opts is stable for the lifetime of this modal — exhaustive deps would re-generate on every render
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.download = `life-in-weeks-${userName.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.href = imageUrl;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 fade-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="text-[var(--text-primary)] text-base font-light">Mobile Wallpaper</div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* Preview + description */}
        <div className="flex gap-5 mb-5">

          {/* Phone mockup */}
          <div className="flex flex-col items-center flex-shrink-0">
            <div
              className="relative overflow-hidden bg-[#080808]"
              style={{
                width: 130,
                height: 231,
                borderRadius: 18,
                border: '2px solid #2a2a2a',
                boxShadow: '0 0 0 1px #111, 0 8px 32px rgba(0,0,0,0.6)',
              }}
            >
              {/* Dynamic island */}
              <div
                className="absolute z-10"
                style={{
                  top: 10,
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: 48,
                  height: 13,
                  background: '#080808',
                  borderRadius: 20,
                  border: '1.5px solid #1a1a1a',
                }}
              />

              {/* Wallpaper preview */}
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Wallpaper preview"
                  className="w-full h-full object-cover"
                  style={{ display: 'block' }}
                />
              ) : (
                <div className="w-full h-full bg-[#111] flex items-center justify-center">
                  <div className="w-8 h-8 border border-[#2a2a2a] rounded-full border-t-[#555] animate-spin" />
                </div>
              )}
            </div>
            {/* Home indicator */}
            <div className="mt-2 w-9 h-[4px] bg-[#1e1e1e] rounded-full" />
          </div>

          {/* Description */}
          <div className="flex flex-col justify-between py-1 flex-1 min-w-0">
            <div>
              <div className="text-[var(--text-primary)] text-sm font-medium mb-1.5 leading-snug">
                Your life, always with you.
              </div>
              <div className="text-[var(--text-tertiary)] text-xs leading-relaxed">
                A pixel-perfect wallpaper with your full life grid, name, age, and weeks remaining. Built for your lock screen.
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)] text-[11px] font-mono">1080 × 1920 · PNG</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)] text-[11px]">Optimised for AMOLED</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[var(--text-muted)]" />
                <span className="text-[var(--text-muted)] text-[11px]">Eras &amp; memories included</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handleSave}
          disabled={!imageUrl}
          className="w-full flex items-center justify-center gap-2 py-2.5 bg-[var(--btn-bg)] text-[var(--btn-text)] rounded-lg text-sm font-medium hover:bg-[var(--btn-hover)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Download size={14} />
          Save Wallpaper
        </button>

        {/* Tip */}
        <p className="text-[var(--text-muted)] text-[11px] text-center mt-3 leading-relaxed">
          Set it as your lock screen for a daily reminder — your weeks are finite.
        </p>
      </div>
    </div>
  );
}
