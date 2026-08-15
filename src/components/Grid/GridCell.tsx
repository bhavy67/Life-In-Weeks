import React from 'react';
import type { CellStatus, ViewMode } from '../../types';

interface GridCellProps {
  index: number;
  status: CellStatus;
  eraColor?: string;
  milestoneCount: number;
  milestoneId?: string;
  viewMode: ViewMode;
  label?: string;
  onClick: (index: number) => void;
  onHover: (index: number, el: HTMLElement | null) => void;
}

const MEMORY_COLORS = [
  '#f59e0b', '#818cf8', '#34d399', '#f87171',
  '#60a5fa', '#a78bfa', '#fb923c', '#e879f9',
  '#2dd4bf', '#a3e635',
];

function memoryColor(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return MEMORY_COLORS[h % MEMORY_COLORS.length];
}

const ROUNDED: Record<ViewMode, string> = {
  weeks: 'rounded-[1.5px]',
  months: 'rounded-[3px]',
  years: 'rounded-md',
};

const GridCell = React.memo(
  ({ index, status, eraColor, milestoneCount, milestoneId, viewMode, label, onClick, onHover }: GridCellProps) => {
    const isFuture = status === 'future';
    const isCurrent = status === 'current';

    const handleClick = () => {
      if (isFuture) return;
      onClick(index);
    };

    const style: React.CSSProperties = {};
    if (isCurrent) {
      style.backgroundColor = 'var(--cell-current)';
      style.borderColor = 'var(--cell-current)';
    } else if (isFuture) {
      style.backgroundColor = 'var(--cell-future)';
      style.borderColor = 'var(--cell-future-border)';
    } else {
      if (viewMode !== 'weeks' && milestoneCount > 0) {
        if (eraColor) {
          const boosted = Math.min(0.85, 0.33 + milestoneCount * 0.13);
          const bg = Math.round(boosted * 255).toString(16).padStart(2, '0');
          const br = Math.round(boosted * 0.65 * 255).toString(16).padStart(2, '0');
          style.backgroundColor = eraColor + bg;
          style.borderColor = eraColor + br;
        } else {
          const alpha = Math.min(0.75, 0.22 + (milestoneCount - 1) * 0.15);
          style.backgroundColor = `rgba(245, 158, 11, ${alpha})`;
          style.borderColor = `rgba(245, 158, 11, ${alpha * 0.7})`;
        }
      } else if (eraColor) {
        style.backgroundColor = eraColor + '55';
        style.borderColor = eraColor + '33';
      } else {
        style.backgroundColor = 'var(--cell-past)';
        style.borderColor = 'var(--cell-past-border)';
      }
    }

    return (
      <div
        className={[
          'relative border transition-[filter] duration-100 w-full aspect-square',
          ROUNDED[viewMode],
          isCurrent ? 'cell-current cursor-pointer' : '',
          status === 'past' && viewMode !== 'years' ? 'cursor-pointer hover:brightness-150' : '',
          isFuture ? 'cursor-default' : '',
          viewMode === 'years' ? 'flex items-center justify-center' : '',
        ]
          .filter(Boolean)
          .join(' ')}
        style={style}
        onClick={handleClick}
        onMouseEnter={(e) => onHover(index, e.currentTarget)}
        onMouseLeave={() => onHover(-1, null)}
      >
        {label && (
          <span
            className="text-[10px] sm:text-xs font-mono select-none"
            style={{
              color: isFuture
                ? 'var(--cell-label-future)'
                : isCurrent
                  ? 'var(--cell-label-current)'
                  : 'var(--cell-label-past)',
            }}
          >
            {label}
          </span>
        )}
        {milestoneCount > 0 && !isFuture && (() => {
          // dot size and positions as % of cell width (works for all view sizes)
          const sz   = viewMode === 'weeks' ? 26 : viewMode === 'months' ? 11 : 8;
          const base = 5;
          const gap  = viewMode === 'weeks' ? 4  : viewMode === 'months' ? 3  : 2;
          const leftRight = `${base + sz + gap}%`;
          // 1 memory: unique colour per memory; 2+: use palette defaults
          const dot1Color = milestoneCount === 1 && milestoneId
            ? memoryColor(milestoneId)
            : 'var(--milestone-dot)';
          // 2 memories → different colours; 3+ → same colour (signals "many")
          const dot2Color = milestoneCount === 2 ? 'var(--milestone-dot-2)' : 'var(--milestone-dot)';
          const shared: React.CSSProperties = {
            position: 'absolute', bottom: `${base}%`,
            width: `${sz}%`, height: `${sz}%`, borderRadius: '50%',
          };
          if (milestoneCount === 1) {
            return <div style={{ ...shared, right: `${base}%`, background: dot1Color }} />;
          }
          return (
            <>
              <div style={{ ...shared, right: leftRight,    background: dot1Color }} />
              <div style={{ ...shared, right: `${base}%`,  background: dot2Color }} />
            </>
          );
        })()}
      </div>
    );
  },
);

GridCell.displayName = 'GridCell';
export default GridCell;
