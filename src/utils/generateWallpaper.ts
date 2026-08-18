import type { Era } from '../types';

export interface WallpaperOptions {
  lifespan: number;
  currentWeekIndex: number;
  milestoneWeekSet: Set<number>;
  eraMap: Map<number, Era>;
  pctLived: number;
  preciseAge: { years: number; months: number };
  weeksLeft: number;
  targetWidth?: number;
  targetHeight?: number;
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function fillRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  w: number, h: number,
  r: number,
) {
  if (typeof ctx.roundRect === 'function') {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    ctx.fill();
  } else {
    ctx.fillRect(x, y, w, h);
  }
}

// Cap canvas dimensions to avoid memory issues on low-end devices
const MAX_DIM = 3840;

function clampDimensions(w: number, h: number): [number, number] {
  const cap = Math.min(1, MAX_DIM / Math.max(w, h, 1));
  return [Math.round(w * cap), Math.round(h * cap)];
}

export function generateWallpaper({
  lifespan,
  currentWeekIndex,
  milestoneWeekSet,
  eraMap,
  pctLived,
  preciseAge,
  weeksLeft,
  targetWidth,
  targetHeight,
}: WallpaperOptions): string {
  const [W, H] = clampDimensions(
    Math.max(1, targetWidth ?? 1080),
    Math.max(1, targetHeight ?? 1920),
  );

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif';
  const COLS = 52;
  const ROWS = lifespan;

  // Scale factors relative to the reference 1080×1920 design
  const scaleW = W / 1080;
  const scaleH = H / 1920;
  // Uniform scale for fonts and symmetric elements — limited by the tighter axis
  const scale = Math.min(scaleW, scaleH);

  const GAP = Math.max(1, Math.round(2 * scale));

  // ── Background ─────────────────────────────────────────
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, W, H);

  // ── Grid sizing ────────────────────────────────────────
  // Landscape screens have limited height — use compact reserves so the grid
  // can grow larger and leave less empty space around it.
  const isLandscape = W > H;
  const HEADER_BASE   = isLandscape ? 240 : 420;
  const FOOTER_BASE   = isLandscape ? 160 : 280;
  const CELL_CAP_BASE = isLandscape ? 18  : 14;

  const GRID_RESERVE_TOP = Math.round(HEADER_BASE * scaleH);
  const GRID_RESERVE_BOT = Math.round(FOOTER_BASE * scaleH);
  const SIDE_MARGIN = Math.round(160 * scaleW);

  const maxCellW = Math.floor((W - SIDE_MARGIN - (COLS - 1) * GAP) / COLS);
  const maxCellH = Math.floor((H - GRID_RESERVE_TOP - GRID_RESERVE_BOT - (ROWS - 1) * GAP) / ROWS);
  const cellSizeCap = Math.max(4, Math.round(CELL_CAP_BASE * scale));
  const cellSize = Math.max(1, Math.min(maxCellW, maxCellH, cellSizeCap));

  const gridW = COLS * cellSize + (COLS - 1) * GAP;
  const gridH = ROWS * cellSize + (ROWS - 1) * GAP;
  const gridX = Math.floor((W - gridW) / 2);
  const gridY = GRID_RESERVE_TOP;

  // ── Header: "LIFE IN WEEKS" ────────────────────────────
  // Landscape: positions are proportional to the (smaller) header zone.
  // Portrait: positions use the original absolute-scaled values.
  const titleFontSize = Math.max(12, Math.round(28 * scale));
  const titleY = isLandscape
    ? Math.round(GRID_RESERVE_TOP * 0.35)
    : Math.round(210 * scaleH);

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#909090';
  ctx.font = `400 ${titleFontSize}px ${FONT}`;
  try { (ctx as unknown as Record<string, string>)['letterSpacing'] = '8px'; } catch {}
  ctx.fillText('LIFE IN WEEKS', W / 2, titleY);
  try { (ctx as unknown as Record<string, string>)['letterSpacing'] = '0px'; } catch {}

  // ── Header: stats line ─────────────────────────────────
  const statsFontSize = Math.max(14, Math.round(30 * scale));
  const statsY = isLandscape
    ? Math.round(GRID_RESERVE_TOP * 0.72)
    : Math.round(330 * scaleH);

  ctx.fillStyle = '#c0c0c0';
  ctx.font = `400 ${statsFontSize}px ${FONT}`;
  ctx.fillText(
    `Age ${preciseAge.years}  ·  ${pctLived.toFixed(1)}% complete`,
    W / 2, statsY,
  );

  // ── Separator ──────────────────────────────────────────
  const separatorY = isLandscape
    ? Math.round(GRID_RESERVE_TOP * 0.88)
    : Math.round(374 * scaleH);
  ctx.strokeStyle = '#161616';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gridX, separatorY);
  ctx.lineTo(gridX + gridW, separatorY);
  ctx.stroke();

  // ── Grid ───────────────────────────────────────────────
  const cellRadius = Math.max(1, Math.round(1.5 * scale));

  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const weekIdx = row * COLS + col;

      const x = gridX + col * (cellSize + GAP);
      const y = gridY + row * (cellSize + GAP);

      const isPast = weekIdx < currentWeekIndex;
      const isCurrent = weekIdx === currentWeekIndex;
      const era = eraMap.get(weekIdx);

      ctx.shadowBlur = 0;

      if (isCurrent) {
        ctx.shadowColor = 'rgba(255, 255, 255, 0.7)';
        ctx.shadowBlur = cellSize * 2;
        ctx.fillStyle = '#ffffff';
      } else if (isPast && era) {
        const [r, g, b] = hexToRgb(era.color);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.38)`;
      } else if (isPast) {
        ctx.fillStyle = '#343434';
      } else {
        ctx.fillStyle = '#161616';
      }

      fillRoundRect(ctx, x, y, cellSize, cellSize, cellRadius);
      ctx.shadowBlur = 0;

      // Milestone dot
      if (milestoneWeekSet.has(weekIdx) && !isCurrent) {
        const dotR = Math.max(1, cellSize * 0.2);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(
          x + cellSize - dotR - 0.5,
          y + cellSize - dotR - 0.5,
          dotR,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    }
  }

  // ── Footer: weeks remaining ────────────────────────────
  const footerFontSize = Math.max(12, Math.round(26 * scale));
  const weeksRemainingY = gridY + gridH + Math.round(65 * scaleH);

  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#909090';
  ctx.font = `400 ${footerFontSize}px ${FONT}`;
  ctx.fillText(
    `${weeksLeft.toLocaleString()} weeks remaining`,
    W / 2,
    weeksRemainingY,
  );

  // ── Footer: tagline ────────────────────────────────────
  // Landscape has a much shorter footer zone — anchor closer to the bottom.
  const tagline1Y = H - Math.round((isLandscape ? 80 : 170) * scaleH);
  const tagline2Y = H - Math.round((isLandscape ? 45 : 124) * scaleH);

  ctx.fillStyle = '#707070';
  ctx.font = `400 ${footerFontSize}px ${FONT}`;
  ctx.fillText("Live like you're dying.", W / 2, tagline1Y);

  ctx.fillStyle = '#505050';
  ctx.font = `300 ${Math.max(10, Math.round(22 * scale))}px ${FONT}`;
  ctx.fillText('(cause you are)', W / 2, tagline2Y);

  return canvas.toDataURL('image/png');
}
