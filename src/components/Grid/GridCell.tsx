import React from 'react';
import type { CellStatus, ViewMode } from '../../types';

interface GridCellProps {
  index: number;
  status: CellStatus;
  eraColor?: string;
  hasMilestone: boolean;
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
  ({ index, status, eraColor, hasMilestone, viewMode, label, onClick, onHover }: GridCellProps) => {
    const isFuture = status === 'future';
    const isCurrent = status === 'current';
    const isPast = status === 'past';

    const handleClick = () => {
      if (isFuture) return;
      onClick(index);
    };

    const style: React.CSSProperties = {};
    if (isCurrent) {
      style.backgroundColor = 'var(--cell-current)';
      style.borderColor = 'var(--cell-current)';
    } else if (isPast && eraColor) {
      style.backgroundColor = eraColor + '55';
      style.borderColor = eraColor + '33';
    } else if (isPast) {
      style.backgroundColor = 'var(--cell-past)';
      style.borderColor = 'var(--cell-past-border)';
    } else {
      style.backgroundColor = 'var(--cell-future)';
      style.borderColor = 'var(--cell-future-border)';
    }

    return (
      <div
        className={[
          'relative border transition-[filter] duration-100 w-full aspect-square',
          ROUNDED[viewMode],
          isCurrent ? 'cell-current cursor-pointer' : '',
          isPast ? 'cursor-pointer hover:brightness-150' : '',
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
        {hasMilestone && !isFuture && (
          <div
            className="absolute rounded-full"
            style={
              viewMode === 'years'
                ? { bottom: 4, right: 4, width: 5, height: 5, background: 'var(--milestone-dot)' }
                : { bottom: '5%', right: '5%', width: '30%', height: '30%', background: 'var(--milestone-dot)' }
            }
          />
        )}
      </div>
    );
  },
);

GridCell.displayName = 'GridCell';
export default GridCell;
