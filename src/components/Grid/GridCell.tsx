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

const SIZE: Record<ViewMode, string> = {
  weeks: 'w-[7px] h-[7px] sm:w-[8px] sm:h-[8px]',
  months: 'w-[18px] h-[18px] sm:w-[22px] sm:h-[22px]',
  years: 'w-11 h-11 sm:w-14 sm:h-14',
};

const GridCell = React.memo(
  ({ index, status, eraColor, hasMilestone, viewMode, label, onClick, onHover }: GridCellProps) => {
    const isFuture = status === 'future';
    const isCurrent = status === 'current';
    const isPast = status === 'past';

    const handleClick = () => {
      if (isFuture) {
        // shake handled by parent via CSS class
        return;
      }
      onClick(index);
    };

    const style: React.CSSProperties = {};
    if (isCurrent) {
      style.backgroundColor = '#ffffff';
    } else if (isPast && eraColor) {
      style.backgroundColor = eraColor + '55';
      style.borderColor = eraColor + '33';
    } else if (isPast) {
      style.backgroundColor = '#2a2a2a';
      style.borderColor = '#383838';
    } else {
      style.backgroundColor = '#141414';
      style.borderColor = '#222222';
    }

    return (
      <div
        className={[
          'relative flex-shrink-0 border rounded-[1.5px] transition-[filter] duration-100',
          SIZE[viewMode],
          isCurrent ? 'cell-current border-white cursor-pointer' : '',
          isPast ? 'cursor-pointer hover:brightness-150' : '',
          isFuture ? 'cursor-default' : '',
          viewMode === 'years' ? 'flex items-center justify-center rounded-md' : '',
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
            style={{ color: isFuture ? '#2a2a2a' : isCurrent ? '#000' : '#666' }}
          >
            {label}
          </span>
        )}
        {hasMilestone && !isFuture && (
          <div
            className="absolute rounded-full"
            style={
              viewMode === 'weeks'
                ? { bottom: 0, right: 0, width: 3, height: 3, background: '#facc15' }
                : viewMode === 'months'
                  ? { bottom: 2, right: 2, width: 4, height: 4, background: '#facc15' }
                  : { bottom: 4, right: 4, width: 5, height: 5, background: '#facc15' }
            }
          />
        )}
      </div>
    );
  },
);

GridCell.displayName = 'GridCell';
export default GridCell;
