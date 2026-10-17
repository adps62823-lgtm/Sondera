import React from 'react';
import { useAppMode } from '../../context/ModeContext';
import {
  Search,
  FolderOpen,
  GraduationCap,
  Lock,
  Settings,
  Sun,
  Moon,
  PlusCircle,
  AlertOctagon,
  BookOpen,
  Link2,
  Scale,
} from 'lucide-react';

export type NavTab =
  | 'workspace'
  | 'investigate'
  | 'cases'
  | 'learn'
  | 'privacy'
  | 'emergency'
  | 'threats'
  | 'url_lab'
  | 'comparator'
  | 'settings'
  | 'case_detail';

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeCaseId: string | null;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  activeCaseId,
  theme,
  toggleTheme,
}) => {
  const { mode, setMode, toggleMode } = useAppMode();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-surface-border dark:border-surface-darkBorder bg-surface-light/95 dark:bg-surface-dark/95 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Product Brand */}
          <div
            onClick={() => setActiveTab('workspace')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <img
              src="/favicon.svg"
              alt=""
              className="w-10 h-10 rounded-xl shadow-sm transition-transform group-hover:scale-105"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-forest-900 dark:text-forest-100">
                  SONDERA
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase rounded-full bg-forest-100 text-forest-800 dark:bg-forest-900 dark:text-forest-200">
                  Local-First
                </span>
              </div>
              <p className="text-xs text-ink-secondary dark:text-neutral-400 hidden xl:block">
                Know what you know. Find what you don’t.
              </p>
            </div>
          </div>

          {/* Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-1 text-xs">
            <button
              onClick={() => setActiveTab('workspace')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'workspace'
                  ? 'bg-forest-100 text-forest-900 dark:bg-forest-900/60 dark:text-forest-200'
                  : 'text-ink-secondary hover:text-ink-primary dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => setActiveTab('investigate')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'investigate'
                  ? 'bg-forest-600 text-white shadow-sm'
                  : 'text-forest-700 hover:bg-forest-50 dark:text-forest-300 dark:hover:bg-forest-950'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Verify Message</span>
            </button>

            {activeCaseId && (
              <button
                onClick={() => setActiveTab('case_detail')}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                  activeTab === 'case_detail'
                    ? 'bg-forest-100 text-forest-900 dark:bg-forest-900/60 dark:text-forest-200'
                    : 'text-ink-secondary hover:text-ink-primary dark:text-neutral-400'
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Active Report</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('cases')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'cases'
                  ? 'bg-forest-100 text-forest-900 dark:bg-forest-900/60 dark:text-forest-200'
                  : 'text-ink-secondary hover:text-ink-primary dark:text-neutral-400'
              }`}
            >
              <FolderOpen className="w-3.5 h-3.5" />
              <span>My Reports</span>
            </button>

            <button
              onClick={() => setActiveTab('threats')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'threats'
                  ? 'bg-forest-100 text-forest-900 dark:bg-forest-900/60 dark:text-forest-200'
                  : 'text-ink-secondary hover:text-ink-primary dark:text-neutral-400'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Scam Directory</span>
            </button>

            <button
              onClick={() => setActiveTab('url_lab')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'url_lab'
                  ? 'bg-forest-100 text-forest-900 dark:bg-forest-900/60 dark:text-forest-200'
                  : 'text-ink-secondary hover:text-ink-primary dark:text-neutral-400'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>Link Checker</span>
            </button>

            <button
              onClick={() => setActiveTab('comparator')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'comparator'
                  ? 'bg-forest-100 text-forest-900 dark:bg-forest-900/60 dark:text-forest-200'
                  : 'text-ink-secondary hover:text-ink-primary dark:text-neutral-400'
              }`}
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Compare Sources</span>
            </button>

            <button
              onClick={() => setActiveTab('learn')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'learn'
                  ? 'bg-forest-100 text-forest-900 dark:bg-forest-900/60 dark:text-forest-200'
                  : 'text-ink-secondary hover:text-ink-primary dark:text-neutral-400'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Safety Quiz</span>
            </button>

            <button
              onClick={() => setActiveTab('privacy')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-medium transition-colors ${
                activeTab === 'privacy'
                  ? 'bg-forest-100 text-forest-900 dark:bg-forest-900/60 dark:text-forest-200'
                  : 'text-ink-secondary hover:text-ink-primary dark:text-neutral-400'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Privacy Test</span>
            </button>

            {/* Emergency Button */}
            <button
              onClick={() => setActiveTab('emergency')}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition-colors ${
                activeTab === 'emergency'
                  ? 'bg-red-600 text-white shadow-xs'
                  : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40'
              }`}
            >
              <AlertOctagon className="w-3.5 h-3.5" />
              <span>SOS Emergency</span>
            </button>
          </nav>

          {/* Action Tools, Simple/Technical Mode & Theme */}
          <div className="flex items-center gap-2">
            {/* Simple vs Technical Mode Switch */}
            <div className="hidden sm:flex items-center bg-surface-muted dark:bg-surface-darkMuted p-1 rounded-xl border border-surface-border/60 dark:border-surface-darkBorder/60">
              <button
                onClick={() => setMode('simple')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  mode === 'simple'
                    ? 'bg-white dark:bg-surface-darkCard text-forest-800 dark:text-forest-200 shadow-xs'
                    : 'text-ink-secondary dark:text-neutral-400 hover:text-ink-primary'
                }`}
                title="Simple Mode: Clear, friendly plain English for non-technical users"
              >
                <span>🌱 Simple</span>
              </button>
              <button
                onClick={() => setMode('technical')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                  mode === 'technical'
                    ? 'bg-white dark:bg-surface-darkCard text-indigo-800 dark:text-indigo-200 shadow-xs'
                    : 'text-ink-secondary dark:text-neutral-400 hover:text-ink-primary'
                }`}
                title="Technical Mode: Detailed URL parsing, ports, WebGPU tensor metrics"
              >
                <span>⚙️ Technical</span>
              </button>
            </div>

            {/* Mobile Mode Toggle Icon */}
            <button
              onClick={toggleMode}
              className="sm:hidden px-2 py-1 rounded-lg text-[10px] font-bold border border-surface-border bg-surface-muted text-ink-primary"
              title="Toggle Simple / Technical Mode"
            >
              {mode === 'simple' ? '🌱 Simple' : '⚙️ Tech'}
            </button>

            <button
              onClick={toggleTheme}
              aria-label="Toggle visual theme"
              className="p-2 rounded-lg text-ink-secondary hover:text-ink-primary hover:bg-forest-50 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              aria-label="Application Settings"
              className={`p-2 rounded-lg transition-colors ${
                activeTab === 'settings'
                  ? 'bg-forest-100 text-forest-900 dark:bg-forest-900 dark:text-forest-100'
                  : 'text-ink-secondary hover:text-ink-primary hover:bg-forest-50 dark:text-neutral-400 dark:hover:text-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="flex lg:hidden overflow-x-auto py-2 border-t border-surface-border/50 dark:border-surface-darkBorder/50 gap-2 text-xs">
          <button
            onClick={() => setActiveTab('workspace')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'workspace' ? 'bg-forest-100 font-semibold text-forest-900' : 'text-ink-secondary'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setActiveTab('investigate')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'investigate' ? 'bg-forest-600 font-semibold text-white' : 'text-forest-700'
            }`}
          >
            + Verify
          </button>
          {activeCaseId && (
            <button
              onClick={() => setActiveTab('case_detail')}
              className={`px-2.5 py-1 rounded whitespace-nowrap ${
                activeTab === 'case_detail' ? 'bg-forest-100 font-semibold text-forest-900' : 'text-ink-secondary'
              }`}
            >
              Active Report
            </button>
          )}
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'cases' ? 'bg-forest-100 font-semibold text-forest-900' : 'text-ink-secondary'
            }`}
          >
            My Reports
          </button>
          <button
            onClick={() => setActiveTab('emergency')}
            className={`px-2.5 py-1 rounded whitespace-nowrap font-bold ${
              activeTab === 'emergency' ? 'bg-red-600 text-white' : 'text-red-600'
            }`}
          >
            SOS Help
          </button>
          <button
            onClick={() => setActiveTab('threats')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'threats' ? 'bg-forest-100 font-semibold text-forest-900' : 'text-ink-secondary'
            }`}
          >
            Scam Directory
          </button>
          <button
            onClick={() => setActiveTab('url_lab')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'url_lab' ? 'bg-forest-100 font-semibold text-forest-900' : 'text-ink-secondary'
            }`}
          >
            Link Checker
          </button>
          <button
            onClick={() => setActiveTab('comparator')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'comparator' ? 'bg-forest-100 font-semibold text-forest-900' : 'text-ink-secondary'
            }`}
          >
            Compare
          </button>
          <button
            onClick={() => setActiveTab('learn')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'learn' ? 'bg-forest-100 font-semibold text-forest-900' : 'text-ink-secondary'
            }`}
          >
            Quiz
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-2.5 py-1 rounded whitespace-nowrap ${
              activeTab === 'privacy' ? 'bg-forest-100 font-semibold text-forest-900' : 'text-ink-secondary'
            }`}
          >
            Privacy
          </button>
        </div>
      </div>
    </header>
  );
};
