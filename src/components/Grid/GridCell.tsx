import React from 'react';
import type { CellStatus, ViewMode } from '../../types';

interface GridCellProps {
  index: number;
  status: CellStatus;
  eraColor?: string;
  milestoneCount: number;
  viewMode: ViewMode;
  label?: string;
  onClick: (index: number) => void;
  onHover: (index: number, el: HTMLElement | null) => void;
}

const ROUNDED: Record<ViewMode, string> = {
  weeks: 'rounded-[1.5px]',
  months: 'rounded-[3px]',
  years: 'rounded-md',
};

const GridCell = React.memo(
  ({ index, status, eraColor, milestoneCount, viewMode, label, onClick, onHover }: GridCellProps) => {
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
        {viewMode === 'weeks' && milestoneCount > 0 && !isFuture && (
          <div
            className="absolute rounded-full"
            style={{ bottom: '5%', right: '5%', width: '30%', height: '30%', background: 'var(--milestone-dot)' }}
          />
        )}
      </div>
    );
  },
);

GridCell.displayName = 'GridCell';
export default GridCell;
