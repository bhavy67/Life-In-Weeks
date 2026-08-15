import { useCallback, useEffect, useState } from 'react';
import { Settings, Download, BarChart2, Sun, Moon, Share2 } from 'lucide-react';
import type { Era, Milestone, UserConfig, ViewMode } from './types';
import { KEYS } from './utils/storageKeys';
import { useStorage } from './hooks/useStorage';
import { useLifeGrid } from './hooks/useLifeGrid';
import Onboarding from './components/Onboarding';
import LifeGrid from './components/Grid/LifeGrid';
import Sidebar from './components/Sidebar';
import MilestoneModal from './components/MilestoneModal';
import EraModal from './components/EraModal';
import SettingsModal from './components/SettingsModal';
import WallpaperModal from './components/WallpaperModal';
import QuoteFooter from './components/QuoteFooter';
import CurrentWeekModal from './components/CurrentWeekModal';
import SharedView from './components/SharedView';
import Toast from './components/Toast';
import MemoriesView from './components/MemoriesView';
import { encodeShareUrl, decodeShareParam, getShareParam } from './utils/shareUtils';
import { useToast } from './hooks/useToast';

type AppViewMode = 'weeks' | 'months' | 'years' | 'memories';

const VIEW_MODES: { id: AppViewMode; label: string }[] = [
  { id: 'weeks', label: 'Weeks' },
  { id: 'months', label: 'Months' },
  { id: 'years', label: 'Years' },
  { id: 'memories', label: 'Memories' },
];

const FALLBACK_USER: UserConfig = { name: '', birthday: '2000-01-01', lifespan: 80 };

const sharedState = (() => {
  const param = getShareParam();
  return param ? decodeShareParam(param) : null;
})();

export default function App() {
  const [user, setUser] = useStorage<UserConfig | null>(KEYS.user, null);
  const [milestones, setMilestones] = useStorage<Milestone[]>(KEYS.milestones, []);
  const [eras, setEras] = useStorage<Era[]>(KEYS.eras, []);
  const [theme, setTheme] = useStorage<'dark' | 'light'>(KEYS.theme, 'dark');

  const [viewMode, setViewMode] = useState<AppViewMode>(() =>
    window.innerWidth < 640 ? 'years' : 'weeks',
  );
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [showEraModal, setShowEraModal] = useState(false);
  const [editingEra, setEditingEra] = useState<Era | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showWallpaper, setShowWallpaper] = useState(false);
  const [showCurrentWeek, setShowCurrentWeek] = useState(false);
  const { toast, showToast } = useToast();

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light');
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  // Always call hooks unconditionally — use fallback so hooks order is stable
  const grid = useLifeGrid(user ?? FALLBACK_USER, milestones, eras);
  const handleCellClick = useCallback(
    (weekIndex: number) => {
      if (weekIndex === grid.currentWeekIndex) {
        setShowCurrentWeek(true);
      } else {
        setSelectedWeek(weekIndex);
      }
    },
    [grid.currentWeekIndex],
  );

  const handleShare = useCallback(() => {
    if (!user) return;
    const url = encodeShareUrl({ birthday: user.birthday, lifespan: user.lifespan, milestones, eras });
    navigator.clipboard.writeText(url).then(() => showToast('Link copied to clipboard'));
  }, [user, milestones, eras, showToast]);

  if (sharedState) {
    return <SharedView state={sharedState} />;
  }

  if (!user) {
    return <Onboarding onComplete={setUser} />;
  }

  const handleMilestoneAdd = (data: Omit<Milestone, 'id'>) => {
    setMilestones((prev) => [
      ...prev,
      { id: crypto.randomUUID(), ...data },
    ]);
  };

  const handleMilestoneUpdate = (id: string, data: Omit<Milestone, 'id'>) => {
    setMilestones((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data } : m)),
    );
  };

  const handleMilestoneDelete = (id: string) => {
    setMilestones((prev) => prev.filter((m) => m.id !== id));
  };

  const handleEraSave = (data: Omit<Era, 'id'>) => {
    if (editingEra) {
      setEras((prev) =>
        prev.map((e) => (e.id === editingEra.id ? { ...editingEra, ...data } : e)),
      );
    } else {
      setEras((prev) => [...prev, { id: crypto.randomUUID(), ...data }]);
    }
    setEditingEra(null);
  };

  const handleEraDelete = (id: string) => {
    setEras((prev) => prev.filter((e) => e.id !== id));
    setEditingEra(null);
  };

  const handleReset = () => {
    localStorage.clear();
    window.location.reload();
  };

  const selectedMemories = selectedWeek !== null ? milestones.filter(m => m.weekIndex === selectedWeek) : [];

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[var(--bg-app)]">
      {/* Header */}
      <header className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-[var(--border-faint)] flex-shrink-0">
        <div className="text-[var(--text-muted)] text-xs tracking-[0.25em] uppercase select-none hidden sm:block">
          Life in Weeks
        </div>
        <div className="text-[var(--text-muted)] text-xs tracking-widest uppercase select-none sm:hidden">
          LiW
        </div>

        {/* View toggle */}
        <div className="flex gap-0.5 bg-[var(--bg-toggle)] border border-[var(--border-faint)] rounded-lg p-0.5">
          {VIEW_MODES.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              className={[
                'px-2.5 sm:px-3 py-1 rounded-md text-xs transition-all duration-150',
                viewMode === id
                  ? 'bg-[var(--bg-active)] text-[var(--text-primary)]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-tertiary)]',
              ].join(' ')}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowMobileSidebar(true)}
            className="lg:hidden p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            title="Stats"
          >
            <BarChart2 size={16} />
          </button>
          <button
            onClick={handleShare}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            title="Copy share link"
          >
            <Share2 size={16} />
          </button>
          <button
            onClick={() => setShowWallpaper(true)}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            title="Save as wallpaper"
          >
            <Download size={16} />
          </button>
          <button
            onClick={toggleTheme}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* Main */}
      <div className="flex flex-1 overflow-hidden">
        {/* Grid or Memories */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {viewMode === 'memories' ? (
            <MemoriesView
              milestones={milestones}
              birthday={user.birthday}
              onSelectWeek={(w) => setSelectedWeek(w)}
            />
          ) : (
            <>
              <LifeGrid
                viewMode={viewMode as ViewMode}
                lifespan={user.lifespan}
                birthday={user.birthday}
                currentWeekIndex={grid.currentWeekIndex}
                currentMonthIndex={grid.currentMonthIndex}
                currentYearIndex={grid.currentYearIndex}
                eraMap={grid.eraMap}
                milestoneMap={grid.milestoneMap}
                milestoneWeekCount={grid.milestoneWeekCount}
                milestoneMonthCount={grid.milestoneMonthCount}
                milestoneYearCount={grid.milestoneYearCount}
                onCellClick={handleCellClick}
              />
              <p className="mt-6 text-[var(--text-muted)] text-xs select-none">
                Click any past week to pin a memory. Click the current week for a summary.
              </p>
            </>
          )}
        </main>

        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 xl:w-72 border-l border-[var(--border-faint)] overflow-y-auto p-5 flex-shrink-0">
          <Sidebar
            name={user.name}
            pctLived={grid.pctLived}
            weeksLeft={grid.weeksLeft}
            currentWeekIndex={grid.currentWeekIndex}
            preciseAge={grid.preciseAge}
            milestones={milestones}
            eras={eras}
            onAddEra={() => { setEditingEra(null); setShowEraModal(true); }}
            onEditEra={(era) => { setEditingEra(era); setShowEraModal(true); }}
          />
        </aside>
      </div>

      {/* Quote footer */}
      <QuoteFooter />

      {/* Mobile sidebar bottom sheet */}
      {showMobileSidebar && (
        <div
          className="lg:hidden fixed inset-0 z-40 flex items-end bg-black/60 backdrop-blur-sm"
          onClick={() => setShowMobileSidebar(false)}
        >
          <div
            className="w-full max-h-[70vh] bg-[var(--bg-surface)] border-t border-[var(--border)] rounded-t-2xl p-5 overflow-y-auto slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-[var(--border)] rounded-full mx-auto mb-5" />
            <Sidebar
              name={user.name}
              pctLived={grid.pctLived}
              weeksLeft={grid.weeksLeft}
              currentWeekIndex={grid.currentWeekIndex}
              preciseAge={grid.preciseAge}
              milestones={milestones}
              eras={eras}
              onAddEra={() => { setEditingEra(null); setShowEraModal(true); setShowMobileSidebar(false); }}
              onEditEra={(era) => { setEditingEra(era); setShowEraModal(true); setShowMobileSidebar(false); }}
            />
          </div>
        </div>
      )}

      {/* Current week detail */}
      {showCurrentWeek && (
        <CurrentWeekModal
          birthday={user.birthday}
          currentWeekIndex={grid.currentWeekIndex}
          currentEra={grid.eraMap.get(grid.currentWeekIndex)}
          memoryCount={milestones.filter(m => m.weekIndex === grid.currentWeekIndex).length}
          pctLived={grid.pctLived}
          weeksLeft={grid.weeksLeft}
          preciseAge={grid.preciseAge}
          onViewMemories={() => {
            setShowCurrentWeek(false);
            setSelectedWeek(grid.currentWeekIndex);
          }}
          onClose={() => setShowCurrentWeek(false)}
        />
      )}

      {/* Milestone modal */}
      {selectedWeek !== null && (
        <MilestoneModal
          weekIndex={selectedWeek}
          birthday={user.birthday}
          memories={selectedMemories}
          onAdd={handleMilestoneAdd}
          onUpdate={handleMilestoneUpdate}
          onDelete={handleMilestoneDelete}
          onClose={() => setSelectedWeek(null)}
        />
      )}

      {/* Era modal */}
      {showEraModal && (
        <EraModal
          existing={editingEra ?? undefined}
          maxWeeks={grid.totalWeeks}
          onSave={handleEraSave}
          onDelete={editingEra ? () => handleEraDelete(editingEra.id) : undefined}
          onClose={() => { setShowEraModal(false); setEditingEra(null); }}
        />
      )}

      {/* Wallpaper modal */}
      {showWallpaper && (
        <WallpaperModal
          userName={user.name}
          lifespan={user.lifespan}
          currentWeekIndex={grid.currentWeekIndex}
          milestoneWeekSet={grid.milestoneWeekSet}
          eraMap={grid.eraMap}
          pctLived={grid.pctLived}
          preciseAge={grid.preciseAge}
          weeksLeft={grid.weeksLeft}
          onDownload={() => showToast('Wallpaper saved')}
          onClose={() => setShowWallpaper(false)}
        />
      )}

      {/* Toast */}
      {toast && <Toast key={toast.key} message={toast.message} />}

      {/* Settings modal */}
      {showSettings && (
        <SettingsModal
          user={user}
          onSave={setUser}
          onReset={handleReset}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
}
