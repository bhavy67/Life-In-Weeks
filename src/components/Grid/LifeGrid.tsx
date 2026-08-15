import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import type { Era, Milestone, ViewMode } from '../../types';
import GridCell from './GridCell';
import { ageAtWeek, getWeekDateRange, getMonthLabel, getAbsoluteMonth, getAbsoluteYear } from '../../utils/dateUtils';

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
  milestoneMap: Map<number, Milestone[]>;
  milestoneWeekCount: Map<number, number>;
  milestoneMonthCount: Map<number, number>;
  milestoneYearCount: Map<number, number>;
  onCellClick: (weekIndex: number, rawCellIndex: number) => void;
  animateIn?: boolean;
}

function toWeekIndex(viewMode: ViewMode, cellIndex: number): number {
  if (viewMode === 'weeks') return cellIndex;
  if (viewMode === 'months') return Math.floor((cellIndex * 52) / 12);
  return cellIndex * 52;
}

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
  milestoneMap,
  milestoneWeekCount,
  milestoneMonthCount,
  milestoneYearCount,
  onCellClick,
  animateIn = true,
}: Props) {
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const tooltipTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [sweeping, setSweeping] = useState(animateIn);

  useEffect(() => {
    if (!animateIn) return;
    const t = setTimeout(() => setSweeping(false), 3700);
    return () => clearTimeout(t);
  }, [animateIn]);

  const currentIndex =
    viewMode === 'weeks'
      ? currentWeekIndex
      : viewMode === 'months'
        ? currentMonthIndex
        : currentYearIndex;

  const cols = viewMode === 'weeks' ? 52 : viewMode === 'months' ? 12 : 10;
  const rows = viewMode === 'years' ? Math.ceil(lifespan / 10) : lifespan;

  const rowGap       = viewMode === 'weeks' ? 'mb-[1.5px]' : viewMode === 'months' ? 'mb-[3px]' : 'mb-2';
  const cellGap      = viewMode === 'weeks' ? '1.5px' : viewMode === 'months' ? '3px' : '8px';
  const cellTemplate = viewMode === 'weeks'
    ? 'minmax(8px, 22px)'
    : viewMode === 'months'
      ? 'minmax(20px, 1fr)'
      : 'minmax(50px, 1fr)';

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
          ? milestoneMap.get(cellIndex)?.[0]
          : viewMode === 'months'
            ? [...milestoneMap.values()].flat().find(
                (m) => getAbsoluteMonth(m.weekIndex, birthday, m.date) === cellIndex,
              )
            : [...milestoneMap.values()].flat().find(
                (m) => getAbsoluteYear(m.weekIndex, birthday, m.date) === cellIndex,
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
      if (viewMode === 'years') return;
      const weekIdx = resolveClickWeekIndex(viewMode, cellIndex);
      onCellClick(weekIdx, cellIndex);
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

      const milestoneCount =
        viewMode === 'weeks' ? (milestoneWeekCount.get(cellIndex) ?? 0)
        : viewMode === 'months' ? (milestoneMonthCount.get(cellIndex) ?? 0)
        : (milestoneYearCount.get(cellIndex) ?? 0);

      const label = viewMode === 'years' ? String(cellIndex) : undefined;

      cells.push(
        <GridCell
          key={cellIndex}
          index={cellIndex}
          status={status}
          eraColor={era?.color}
          milestoneCount={milestoneCount}
          viewMode={viewMode}
          label={label}
          onClick={handleClick}
          onHover={handleHover}
        />,
      );
    }
    return cells;
  };

  const rowLabel = (row: number): string => {
    if (viewMode === 'years') return `${row * 10}s`;
    if (row % 5 === 0) return String(row);
    return '';
  };

  const decadeSpacing = viewMode === 'months' ? '6px' : '4px';

  return (
    <div className="relative">
      <div className="overflow-x-auto pb-2">
        <div className={`w-full ${sweeping ? 'grid-sweep' : ''}`}>
          {Array.from({ length: rows }, (_, row) => (
            <Fragment key={row}>
              {/* Decade marker — thin rule before every 10th row */}
              {row > 0 && row % 10 === 0 && viewMode !== 'years' && (
                <div
                  className="flex items-center"
                  style={{ margin: `${decadeSpacing} 0` }}
                >
                  <div className="w-7 flex-shrink-0" />
                  <div
                    className="flex-1 h-px bg-[var(--border-subtle)]"
                    style={{ opacity: 0.6 }}
                  />
                </div>
              )}
              <div className={`flex items-center ${rowGap}`}>
                {/* Row label */}
                <div className="w-7 flex-shrink-0 text-right pr-2 text-[10px] text-[var(--text-muted)] font-mono select-none">
                  {rowLabel(row)}
                </div>
                {/* Cells */}
                <div
                  className="flex-1 grid"
                  style={{
                    gridTemplateColumns: `repeat(${cols}, ${cellTemplate})`,
                    gap: cellGap,
                  }}
                >
                  {renderRow(row)}
                </div>
              </div>
            </Fragment>
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
          <div className="bg-[var(--bg-surface)] border border-[var(--border-elevated)] rounded-lg px-3 py-2 text-xs shadow-xl whitespace-nowrap max-w-[220px]">
            <div className="text-[var(--text-primary)] font-medium">
              {tooltip.milestone?.emoji && (
                <span className="mr-1">{tooltip.milestone.emoji}</span>
              )}
              {tooltip.milestone ? tooltip.milestone.title : tooltip.title}
            </div>
            <div className="text-[var(--text-tertiary)] mt-0.5">{tooltip.sub}</div>
            {tooltip.milestone?.description && (
              <div className="text-[var(--text-secondary)] mt-1 text-[11px] max-w-[200px] truncate">
                {tooltip.milestone.description}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
