import { useCallback, useRef, useState } from 'react';
import type { Era, Milestone, ViewMode } from '../../types';
import GridCell from './GridCell';
import { ageAtWeek, getWeekDateRange, getMonthLabel } from '../../utils/dateUtils';

interface TooltipData {
  x: number;
  y: number;
  title: string;
  sub: string;
  milestone?: Milestone;
}

interface Props {
  viewMode: ViewMode;
  lifespan: number;
  birthday: string;
  currentWeekIndex: number;
  currentMonthIndex: number;
  currentYearIndex: number;
  eraMap: Map<number, Era>;
  milestoneWeekSet: Set<number>;
  milestoneMonthSet: Set<number>;
  milestoneYearSet: Set<number>;
  milestoneMap: Map<number, Milestone>;
  onCellClick: (weekIndex: number) => void;
  gridRef: React.RefObject<HTMLDivElement | null>;
}

// Convert cell index (in current viewMode) to approximate week index (for era lookup)
function toWeekIndex(viewMode: ViewMode, cellIndex: number): number {
  if (viewMode === 'weeks') return cellIndex;
  if (viewMode === 'months') return Math.floor((cellIndex * 52) / 12);
  return cellIndex * 52;
}

// Resolve which week index to emit when a cell is clicked
function resolveClickWeekIndex(viewMode: ViewMode, cellIndex: number): number {
  if (viewMode === 'weeks') return cellIndex;
  if (viewMode === 'months') return Math.floor((cellIndex * 52) / 12);
  return cellIndex * 52;
}

export default function LifeGrid({
  viewMode,
  lifespan,
  birthday,
  currentWeekIndex,
  currentMonthIndex,
  currentYearIndex,
  eraMap,
  milestoneWeekSet,
  milestoneMonthSet,
  milestoneYearSet,
  milestoneMap,
  onCellClick,
  gridRef,
}: Props) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentIndex =
    viewMode === 'weeks'
      ? currentWeekIndex
      : viewMode === 'months'
        ? currentMonthIndex
        : currentYearIndex;

  const cols = viewMode === 'weeks' ? 52 : viewMode === 'months' ? 12 : 10;
  const rows =
    viewMode === 'years' ? Math.ceil(lifespan / 10) : lifespan;

  const gap = viewMode === 'weeks' ? 'gap-[1.5px]' : viewMode === 'months' ? 'gap-[3px]' : 'gap-2';
  const rowGap = viewMode === 'weeks' ? 'mb-[1.5px]' : viewMode === 'months' ? 'mb-[3px]' : 'mb-2';

  const handleHover = useCallback(
    (cellIndex: number, el: HTMLElement | null) => {
      if (tooltipTimeout.current) clearTimeout(tooltipTimeout.current);

      if (cellIndex === -1 || el === null) {
        tooltipTimeout.current = setTimeout(() => setTooltip(null), 80);
        return;
      }

      const rect = el.getBoundingClientRect();

      let title = '';
      let sub = '';

      if (viewMode === 'weeks') {
        const age = ageAtWeek(cellIndex);
        title = `Age ${age}`;
        sub = getWeekDateRange(cellIndex, birthday);
      } else if (viewMode === 'months') {
        const age = Math.floor(cellIndex / 12);
        title = `Age ${age}`;
        sub = getMonthLabel(cellIndex, birthday);
      } else {
        const age = cellIndex;
        title = `Age ${age}–${age + 1}`;
        sub = `Year ${age + 1} of life`;
      }

      const milestone =
        viewMode === 'weeks'
          ? milestoneMap.get(cellIndex)
          : viewMode === 'months'
            ? [...milestoneMap.values()].find(
                (m) => Math.floor((m.weekIndex * 12) / 52) === cellIndex,
              )
            : [...milestoneMap.values()].find(
                (m) => Math.floor(m.weekIndex / 52) === cellIndex,
              );

      setTooltip({
        x: rect.left + rect.width / 2,
        y: rect.top,
        title,
        sub,
        milestone,
      });
    },
    [viewMode, birthday, milestoneMap],
  );

  const handleClick = useCallback(
    (cellIndex: number) => {
      const weekIdx = resolveClickWeekIndex(viewMode, cellIndex);
      onCellClick(weekIdx);
    },
    [viewMode, onCellClick],
  );

  const renderRow = (row: number) => {
    const cells = [];
    for (let col = 0; col < cols; col++) {
      const cellIndex = row * cols + col;
      const totalCells =
        viewMode === 'weeks'
          ? lifespan * 52
          : viewMode === 'months'
            ? lifespan * 12
            : lifespan;

      if (cellIndex >= totalCells) break;

      const weekIdx = toWeekIndex(viewMode, cellIndex);
      const era = eraMap.get(weekIdx);

      const status =
        cellIndex < currentIndex
          ? 'past'
          : cellIndex === currentIndex
            ? 'current'
            : 'future';

      const hasMilestone =
        viewMode === 'weeks'
          ? milestoneWeekSet.has(cellIndex)
          : viewMode === 'months'
            ? milestoneMonthSet.has(cellIndex)
            : milestoneYearSet.has(cellIndex);

      const label =
        viewMode === 'years' ? String(cellIndex) : undefined;

      cells.push(
        <GridCell
          key={cellIndex}
          index={cellIndex}
          status={status}
          eraColor={era?.color}
          hasMilestone={hasMilestone}
          viewMode={viewMode}
          label={label}
          onClick={handleClick}
          onHover={handleHover}
        />,
      );
    }
    return cells;
  };

  // Row label (age)
  const rowLabel = (row: number): string => {
    if (viewMode === 'years') return `${row * 10}s`;
    if (row % 5 === 0) return String(row);
    return '';
  };

  return (
    <div className="relative" ref={gridRef}>
      <div className={viewMode === 'weeks' ? 'overflow-x-auto pb-2' : ''}>
        <div className="inline-block min-w-0">
          {Array.from({ length: rows }, (_, row) => (
            <div key={row} className={`flex items-center ${rowGap}`}>
              {/* Row label */}
              <div className="w-7 flex-shrink-0 text-right pr-2 text-[10px] text-[#333] font-mono select-none">
                {rowLabel(row)}
              </div>
              {/* Cells */}
              <div className={`flex ${gap}`}>{renderRow(row)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 8,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-[#1a1a1a] border border-[#2e2e2e] rounded-lg px-3 py-2 text-xs shadow-xl whitespace-nowrap max-w-[220px]">
            <div className="text-white font-medium">
              {tooltip.milestone?.emoji && (
                <span className="mr-1">{tooltip.milestone.emoji}</span>
              )}
              {tooltip.milestone ? tooltip.milestone.title : tooltip.title}
            </div>
            <div className="text-[#555] mt-0.5">{tooltip.sub}</div>
            {tooltip.milestone?.description && (
              <div className="text-[#888] mt-1 text-[11px] max-w-[200px] truncate">
                {tooltip.milestone.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
