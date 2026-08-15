# Life in Weeks

A minimal life-visualization tool. See your entire life mapped out as a grid of weeks, pin memories to moments that mattered, and color-code the chapters that defined you.

**Live → [gridoflife.vercel.app](https://gridoflife.vercel.app)**

---

## What it does

Enter your birthday and expected lifespan — Life in Weeks renders every week of your life as a small cell. Past weeks are filled, the current week is highlighted, and future weeks remain empty. The result is a single view of your entire existence.

**Weeks / Months / Years** — switch between three granularities from the header.

**Pin a memory** — click any past week to attach a title, description, and emoji. Pinned weeks are visually marked on the grid and listed in the sidebar.

**Eras** — define color-coded spans (e.g., "University", "First job", "Parenthood") that overlay the grid with a colored tint. Add, edit, or delete them from the sidebar.

**Stats sidebar** — shows your precise age, percentage of life lived, weeks remaining, and a countdown to future decade milestones. Opens as a bottom sheet on mobile.

**Wallpaper generator** — download a 1080×1920 PNG of your life grid, sized perfectly as a phone wallpaper. A permanent reminder that the grid fills either way.

**Light / dark mode** — toggles instantly, persists across sessions. Dark by default.

**Quote footer** — a rotating set of short, hard-hitting quotes about time and living. Click to cycle.

**PWA** — installable on iOS and Android, works fully offline.

All data is saved to `localStorage` — nothing leaves your device.

---

## Tech stack

| Layer | Library |
|---|---|
| UI framework | React 19 |
| Language | TypeScript 6 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Date math | date-fns 4 |
| Icons | lucide-react |
| PWA | vite-plugin-pwa + Workbox |
| Linting | oxlint |

---

## Getting started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build locally
npm run preview
```

---

## Project structure

```
src/
├── components/
│   ├── Grid/
│   │   ├── LifeGrid.tsx       # Renders week/month/year cells
│   │   └── GridCell.tsx       # Individual cell with era color + milestone dot
│   ├── Onboarding.tsx         # Setup flow
│   ├── Sidebar.tsx            # Stats, memories count, eras list
│   ├── MilestoneModal.tsx     # Pin / edit a memory on a week
│   ├── EraModal.tsx           # Create / edit a life era
│   ├── SettingsModal.tsx      # Update profile or reset data
│   ├── WallpaperModal.tsx     # Phone wallpaper preview + download
│   └── QuoteFooter.tsx        # Rotating life quotes
├── hooks/
│   ├── useLifeGrid.ts         # Core derived state (current week, eras map, etc.)
│   └── useStorage.ts          # localStorage-backed useState
├── utils/
│   ├── dateUtils.ts           # Week index ↔ date helpers
│   ├── generateWallpaper.ts   # Canvas 2D wallpaper generation
│   └── storageKeys.ts         # localStorage key constants
├── types.ts                   # UserConfig, Milestone, Era, ViewMode
└── App.tsx                    # Root layout, modal orchestration
```

---

## Roadmap

- [x] PWA — installable, works offline
- [x] Light / dark mode
- [x] Phone wallpaper export
- [ ] Import / export data as JSON
- [ ] Shareable read-only links
- [ ] Custom accent colors

---

## License

Personal project — not licensed for redistribution.
