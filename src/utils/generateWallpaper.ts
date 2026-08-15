import type { Era } from '../types';

export interface WallpaperOptions {
  lifespan: number;
  currentWeekIndex: number;
  milestoneWeekSet: Set<number>;
  eraMap: Map<number, Era>;
  pctLived: number;
  preciseAge: { years: number; months: number };
  weeksLeft: number;
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

export function generateWallpaper({
  lifespan,
  currentWeekIndex,
  milestoneWeekSet,
  eraMap,
  pctLived,
  preciseAge,
  weeksLeft,
}: WallpaperOptions): string {
  const W = 1080;
  const H = 1920;

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  const FONT = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", Helvetica, Arial, sans-serif';
  const COLS = 52;
  const ROWS = lifespan;
  const GAP = 2;

  // ── Background ─────────────────────────────────────────
  ctx.fillStyle = '#080808';
  ctx.fillRect(0, 0, W, H);

  // ── Grid sizing ────────────────────────────────────────
  // Reserve space: header area 420px from top, footer 210px from bottom
  const GRID_RESERVE_TOP = 420;
  const GRID_RESERVE_BOT = 210;

  const maxCellW = Math.floor((W - 160 - (COLS - 1) * GAP) / COLS);
  const maxCellH = Math.floor((H - GRID_RESERVE_TOP - GRID_RESERVE_BOT - (ROWS - 1) * GAP) / ROWS);
  const cellSize = Math.min(maxCellW, maxCellH, 14);

  const gridW = COLS * cellSize + (COLS - 1) * GAP;
  const gridH = ROWS * cellSize + (ROWS - 1) * GAP;
  const gridX = Math.floor((W - gridW) / 2);
  const gridY = GRID_RESERVE_TOP;

  // ── Header: "LIFE IN WEEKS" ────────────────────────────
  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#2a2a2a';
  ctx.font = `300 24px ${FONT}`;
  try { (ctx as unknown as Record<string, string>)['letterSpacing'] = '8px'; } catch {}
  ctx.fillText('LIFE IN WEEKS', W / 2, 210);
  try { (ctx as unknown as Record<string, string>)['letterSpacing'] = '0px'; } catch {}

  // ── Header: stats line ─────────────────────────────────
  ctx.fillStyle = '#484848';
  ctx.font = `300 26px ${FONT}`;
  ctx.fillText(
    `${preciseAge.years} years old  ·  ${pctLived.toFixed(1)}% complete`,
    W / 2, 330,
  );

  // Thin separator
  ctx.strokeStyle = '#161616';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(gridX, 374);
  ctx.lineTo(gridX + gridW, 374);
  ctx.stroke();

  // ── Grid ───────────────────────────────────────────────
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

      fillRoundRect(ctx, x, y, cellSize, cellSize, 1.5);
      ctx.shadowBlur = 0;

      // Milestone dot
      if (milestoneWeekSet.has(weekIdx) && !isCurrent) {
        const dotR = Math.max(1.5, cellSize * 0.2);
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
  ctx.shadowBlur = 0;
  ctx.textAlign = 'center';
  ctx.fillStyle = '#383838';
  ctx.font = `300 22px ${FONT}`;
  ctx.fillText(
    `${weeksLeft.toLocaleString()} weeks remaining`,
    W / 2,
    gridY + gridH + 65,
  );

  // ── Footer: tagline ────────────────────────────────────
  // Anchored 140px from the bottom — stays well within safe zones on all phones
  ctx.fillStyle = '#2e2e2e';
  ctx.font = `300 22px ${FONT}`;
  ctx.fillText('The grid fills either way.', W / 2, H - 140);

  return canvas.toDataURL('image/png');
}
