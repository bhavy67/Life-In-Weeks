# Life in Weeks

A minimal, dark-mode life-visualization tool. See your entire life mapped out as a grid of weeks, pin memories to moments that mattered, and color-code the chapters that defined you.

---

## What it does

Enter your name, birthday, and expected lifespan — Life in Weeks renders every week of your life as a small cell. Past weeks are filled, the current week is highlighted, and future weeks remain empty. The result is a single, scrollable view of your entire existence.

**Weeks / Months / Years** — switch between three granularities from the header. On mobile it defaults to Years so the whole grid fits without scrolling.

**Pin a memory** — click any past week to attach a title, description, and emoji. Pinned weeks are visually marked on the grid and listed in the sidebar.

**Eras** — define color-coded spans (e.g., "University", "First job", "Parenthood") that overlay the grid with a colored tint. Add, edit, or delete them from the sidebar.

**Stats sidebar** — shows your precise age, percentage of life lived, weeks remaining, and a countdown to future decade milestones (40, 50, 60, 70). Opens as a bottom sheet on mobile.

**Export PNG** — download a high-resolution snapshot of your grid with one click.

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
| PNG export | html2canvas |
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
│   ├── Onboarding.tsx         # 3-step setup flow
│   ├── Sidebar.tsx            # Stats, memories count, eras list
│   ├── MilestoneModal.tsx     # Pin / edit a memory on a week
│   ├── EraModal.tsx           # Create / edit a life era
│   └── SettingsModal.tsx      # Update profile or reset data
├── hooks/
│   ├── useLifeGrid.ts         # Core derived state (current week, eras map, etc.)
│   └── useStorage.ts          # localStorage-backed useState
├── utils/
│   ├── dateUtils.ts           # Week index ↔ date helpers
│   └── storageKeys.ts         # localStorage key constants
├── types.ts                   # UserConfig, Milestone, Era, ViewMode
└── App.tsx                    # Root layout, modal orchestration
```

---

## Roadmap

- [ ] Live demo link
- [ ] Import / export data as JSON
- [ ] Shareable read-only links
- [ ] Custom themes / accent colors
- [ ] PWA / installable offline app

---

## License

Personal project — not licensed for redistribution.
