import { useEffect, useMemo, useState } from 'react';
import { X, Download } from 'lucide-react';
import { generateWallpaper, type WallpaperOptions, type DarkPalette } from '../utils/generateWallpaper';

// ── Preset definitions ─────────────────────────────────────────────────────

type Preset = 'screen' | 'mobile' | 'tablet' | 'desktop';

interface PresetDef {
  label: string;
  tip: string;
  getSize: () => { width: number; height: number };
}

// Cap DPR at 3 — some Android devices report 4.0 which pushes canvas to ~6k px
function getScreenSize(): { width: number; height: number } {
  const dpr = Math.min(window.devicePixelRatio || 1, 3);
  const w = Math.round((window.screen?.width || 1080) * dpr);
  const h = Math.round((window.screen?.height || 1920) * dpr);
  // generateWallpaper will further clamp to MAX_DIM=3840 if needed
  return { width: w, height: h };
}

const PRESETS: Record<Preset, PresetDef> = {
  screen: {
    label: 'This Screen',
    tip: 'Set it as your wallpaper — your weeks follow you everywhere.',
    getSize: getScreenSize,
  },
  mobile: {
    label: 'Mobile',
    tip: 'Set it as your lock screen for a daily reminder — your weeks are finite.',
    getSize: () => ({ width: 1080, height: 1920 }),
  },
  tablet: {
    label: 'Tablet',
    tip: 'Save and set as your tablet wallpaper — your grid, always in view.',
    getSize: () => ({ width: 1668, height: 2224 }),
  },
  desktop: {
    label: 'Desktop',
    tip: 'Save and set as your desktop wallpaper — every glance is a reminder.',
    getSize: () => ({ width: 2560, height: 1440 }),
  },
};

const PRESET_ORDER: Preset[] = ['screen', 'mobile', 'tablet', 'desktop'];

// ── Dark palette definitions ───────────────────────────────────────────────

const DARK_PALETTE_DEFS: { id: DarkPalette; label: string; swatch: string; hint: string }[] = [
  { id: 'obsidian', label: 'Obsidian', swatch: '#111111', hint: 'Deep black, AMOLED-ready' },
  { id: 'slate',    label: 'Slate',    swatch: '#0c0e14', hint: 'Cool blue-gray, calm & refined' },
  { id: 'warm',     label: 'Warm',     swatch: '#100d09', hint: 'Amber tint, personal feel' },
  { id: 'graphite', label: 'Graphite', swatch: '#141414', hint: 'Softer gray, most readable' },
];

// ── Component ─────────────────────────────────────────────────────────────

interface Props extends WallpaperOptions {
  userName: string;
  theme: 'dark' | 'light';
  onClose: () => void;
  onDownload?: () => void;
}

export default function WallpaperModal({ userName, theme, onClose, onDownload, ...opts }: Props) {
  const isDark = theme === 'dark';
  const [preset, setPreset] = useState<Preset>('screen');
  const [darkPalette, setDarkPalette] = useState<DarkPalette>('obsidian');
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const { width, height } = useMemo(() => PRESETS[preset].getSize(), [preset]);
  const isLandscape = width > height;
  const aspectRatio = width / height;

  // Preview container — always 130 px wide; height adapts to aspect ratio
  const PREVIEW_W = 130;
  const previewH = Math.min(220, Math.max(70, Math.round(PREVIEW_W / aspectRatio)));

  // Regenerate whenever dimensions or dark palette change
  useEffect(() => {
    setImageUrl(null);
    const id = setTimeout(() => {
      setImageUrl(generateWallpaper({ ...opts, theme, darkPalette, targetWidth: width, targetHeight: height }));
    }, 80);
    return () => clearTimeout(id);
    // opts/theme are stable for the modal's lifetime; width/height/darkPalette drive regeneration
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, darkPalette]);

  const handleSave = () => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.download = `life-in-weeks-${userName.replace(/\s+/g, '-').toLowerCase()}.png`;
    a.href = imageUrl;
    a.click();
    onDownload?.();
  };

  const resolvedLabel = `${width.toLocaleString()} × ${height.toLocaleString()} · PNG`;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border)] rounded-2xl p-5 fade-in">

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="text-[var(--text-primary)] text-base font-light">Wallpaper</div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors p-1"
          >
            <X size={16} />
          </button>
        </div>

        {/* Preset selector */}
        <div className="mb-1">
          <div className="flex gap-0.5 bg-[var(--bg-toggle)] border border-[var(--border-faint)] rounded-lg p-0.5">
            {PRESET_ORDER.map((p) => (
              <button
                key={p}
                onClick={() => setPreset(p)}
                className={[
                  'flex-1 px-1 py-1 rounded-md text-[11px] leading-tight transition-all duration-150 whitespace-nowrap',
                  preset === p
                    ? 'bg-[var(--bg-active)] text-[var(--text-primary)]'
                    : 'text-[var(--text-muted)] hover:text-[var(--text-tertiary)]',
                ].join(' ')}
              >
                {PRESETS[p].label}
              </button>
            ))}
          </div>
          {/* Resolved dimensions */}
          <p className="text-[var(--text-muted)] text-[10px] text-center mt-1.5 font-mono">
            {resolvedLabel}
          </p>
        </div>

        {/* Dark palette selector */}
        {isDark && (
          <div className="mt-3 mb-1">
            <div className="flex gap-1.5">
              {DARK_PALETTE_DEFS.map(({ id, label, swatch }) => (
                <button
                  key={id}
                  onClick={() => setDarkPalette(id)}
                  className={[
                    'flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-[11px] border transition-all duration-150',
                    darkPalette === id
                      ? 'border-[var(--border-elevated)] text-[var(--text-primary)] bg-[var(--bg-active)]'
                      : 'border-[var(--border-faint)] text-[var(--text-muted)] hover:text-[var(--text-tertiary)]',
                  ].join(' ')}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0 border border-white/10"
                    style={{ background: swatch }}
                  />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Preview + description */}
        <div className="flex gap-4 mt-4 mb-5 items-start">

          {/* Wallpaper preview */}
          <div className="flex-shrink-0">
            <div
              className="relative overflow-hidden"
              style={{
                width: PREVIEW_W,
                height: previewH,
                borderRadius: isLandscape ? 10 : 16,
                background: isDark
                  ? DARK_PALETTE_DEFS.find(p => p.id === darkPalette)!.swatch
                  : '#f2f2f2',
                border: `2px solid ${isDark ? '#2a2a2a' : '#d0d0d0'}`,
                boxShadow: isDark
                  ? '0 0 0 1px #111, 0 8px 32px rgba(0,0,0,0.6)'
                  : '0 0 0 1px #e0e0e0, 0 8px 32px rgba(0,0,0,0.12)',
              }}
            >
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt="Wallpaper preview"
                  className="w-full h-full object-cover"
                  style={{ display: 'block' }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div
                    className="w-6 h-6 rounded-full animate-spin"
                    style={{
                      border: `1.5px solid ${isDark ? '#2a2a2a' : '#d0d0d0'}`,
                      borderTopColor: isDark ? '#555' : '#999',
                    }}
                  />
                </div>
              )}
            </div>
            {/* Home indicator — only for portrait-ish presets */}
            {!isLandscape && (
              <div
                className="mt-2 mx-auto w-9 h-[4px] rounded-full"
                style={{ background: isDark ? '#1e1e1e' : '#d4d4d4' }}
              />
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col py-1 flex-1 min-w-0 gap-3">
            <div>
              <div className="text-[var(--text-primary)] text-sm font-medium mb-1 leading-snug">
                Your life, always with you.
              </div>
              <div className="text-[var(--text-tertiary)] text-xs leading-relaxed">
                Full grid, age, and weeks remaining — pixel-perfect for any screen.
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[var(--text-muted)] flex-shrink-0" />
                <span className="text-[var(--text-muted)] text-[11px] font-mono truncate">{resolvedLabel}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[var(--text-muted)] flex-shrink-0" />
                <span className="text-[var(--text-muted)] text-[11px]">
                  {isDark
                    ? DARK_PALETTE_DEFS.find(p => p.id === darkPalette)!.hint
                    : 'Optimised for light displays'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-[var(--text-muted)] flex-shrink-0" />
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

        {/* Theme note */}
        <p className="text-[var(--text-muted)] text-[11px] text-center mt-2 leading-relaxed">
          Wallpaper uses your current <span className="text-[var(--text-tertiary)]">{isDark ? 'dark' : 'light'}</span> theme.
          Switch theme before downloading to get the other version.
        </p>

        {/* Tip */}
        <p className="text-[var(--text-muted)] text-[11px] text-center mt-2 leading-relaxed">
          {PRESETS[preset].tip}
        </p>
      </div>
    </div>
  );
}
