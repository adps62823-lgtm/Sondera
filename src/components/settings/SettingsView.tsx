import React, { useState, useEffect } from 'react';
import { db } from '../../services/db';
import { exportAllDataJson } from '../../services/case-service';
import { ENGINE_VERSION } from '../../core/engine/analysis-engine';
import {
  Settings,
  HardDrive,
  Trash2,
  Download,
  Shield,
  Moon,
  Sun,
  LayoutGrid,
  Type,
} from 'lucide-react';

interface SettingsViewProps {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ theme, toggleTheme }) => {
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [textScale, setTextScale] = useState<'normal' | 'large'>('normal');

  const [stats, setStats] = useState({
    casesCount: 0,
    evidenceCount: 0,
    findingsCount: 0,
    reportsCount: 0,
  });

  const loadStats = async () => {
    const [c, e, f, r] = await Promise.all([
      db.cases.count(),
      db.evidence.count(),
      db.findings.count(),
      db.reports.count(),
    ]);
    setStats({
      casesCount: c,
      evidenceCount: e,
      findingsCount: f,
      reportsCount: r,
    });
  };

  useEffect(() => {
    loadStats();
    const savedDensity = localStorage.getItem('sondera_density') as 'comfortable' | 'compact' | null;
    if (savedDensity) {
      setDensity(savedDensity);
      if (savedDensity === 'compact') {
        document.documentElement.classList.add('density-compact');
      }
    }
    const savedScale = localStorage.getItem('sondera_scale') as 'normal' | 'large' | null;
    if (savedScale) {
      setTextScale(savedScale);
      if (savedScale === 'large') {
        document.documentElement.classList.add('text-scale-lg');
      }
    }
  }, []);

  const toggleDensity = () => {
    const next = density === 'comfortable' ? 'compact' : 'comfortable';
    setDensity(next);
    localStorage.setItem('sondera_density', next);
    if (next === 'compact') {
      document.documentElement.classList.add('density-compact');
    } else {
      document.documentElement.classList.remove('density-compact');
    }
  };

  const toggleTextScale = () => {
    const next = textScale === 'normal' ? 'large' : 'normal';
    setTextScale(next);
    localStorage.setItem('sondera_scale', next);
    if (next === 'large') {
      document.documentElement.classList.add('text-scale-lg');
    } else {
      document.documentElement.classList.remove('text-scale-lg');
    }
  };

  const handleExportAll = async () => {
    const json = await exportAllDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sondera_Full_Export_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleClearAllData = async () => {
    if (
      window.confirm(
        'CAUTION: This will permanently wipe all local cases, evidence, notes, and training history from this browser. This cannot be undone. Proceed?'
      )
    ) {
      await db.delete();
      await db.open();
      alert('Local database wiped successfully.');
      loadStats();
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight text-forest-900 dark:text-forest-100 flex items-center gap-2">
          <Settings className="w-6 h-6 text-forest-700 dark:text-forest-400" />
          <span>Application Settings & Data Sovereignty</span>
        </h1>
        <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-1">
          Inspect local storage usage, export offline backups, and manage accessibility.
        </p>
      </div>

      {/* Storage Information */}
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-sm space-y-4">
        <div className="flex items-center gap-2 border-b border-surface-border/50 dark:border-surface-darkBorder/50 pb-3">
          <HardDrive className="w-5 h-5 text-forest-700 dark:text-forest-400" />
          <h2 className="font-bold text-sm text-ink-primary dark:text-neutral-100">
            Local Storage & Database Metrics (IndexedDB)
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 rounded-xl bg-surface-muted dark:bg-surface-darkMuted">
            <span className="block text-[10px] text-ink-muted uppercase">Cases</span>
            <span className="font-bold text-base text-ink-primary dark:text-neutral-100">{stats.casesCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-muted dark:bg-surface-darkMuted">
            <span className="block text-[10px] text-ink-muted uppercase">Sources</span>
            <span className="font-bold text-base text-ink-primary dark:text-neutral-100">{stats.evidenceCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-muted dark:bg-surface-darkMuted">
            <span className="block text-[10px] text-ink-muted uppercase">Findings</span>
            <span className="font-bold text-base text-ink-primary dark:text-neutral-100">{stats.findingsCount}</span>
          </div>
          <div className="p-3 rounded-xl bg-surface-muted dark:bg-surface-darkMuted">
            <span className="block text-[10px] text-ink-muted uppercase">Saved Receipts</span>
            <span className="font-bold text-base text-ink-primary dark:text-neutral-100">{stats.reportsCount}</span>
          </div>
        </div>

        <p className="text-xs text-ink-secondary dark:text-neutral-400 leading-relaxed">
          Sondera stores all investigation cases, claims, notes, and milestones inside your browser's dedicated IndexedDB storage partition. If you clear browser cache/cookies or use incognito mode, local data may be evicted. We recommend periodically downloading a JSON backup.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={handleExportAll}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-medium transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Complete JSON Backup</span>
          </button>

          <button
            onClick={handleClearAllData}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-300 text-red-600 dark:border-red-900 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-medium transition"
          >
            <Trash2 className="w-4 h-4" />
            <span>Wipe All Local Data</span>
          </button>
        </div>
      </div>

      {/* Visual & Accessibility Preferences */}
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-sm space-y-4">
        <h2 className="font-bold text-sm text-ink-primary dark:text-neutral-100 border-b border-surface-border/50 dark:border-surface-darkBorder/50 pb-3">
          Display, Density & Accessibility
        </h2>

        {/* Theme */}
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-semibold text-ink-primary dark:text-neutral-200">
              Interface Color Theme
            </h4>
            <p className="text-xs text-ink-secondary dark:text-neutral-400">
              Toggle between warm ivory light mode and low-glare dark mode.
            </p>
          </div>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-border dark:border-surface-darkBorder text-xs font-medium"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span>Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-ink-secondary" />
                <span>Dark Mode</span>
              </>
            )}
          </button>
        </div>

        {/* Density */}
        <div className="flex items-center justify-between pt-2 border-t border-surface-border/50">
          <div>
            <h4 className="text-xs font-semibold text-ink-primary dark:text-neutral-200 flex items-center gap-1.5">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Workspace Spacing Density</span>
            </h4>
            <p className="text-xs text-ink-secondary dark:text-neutral-400">
              Switch between comfortable whitespace and compact multi-card view.
            </p>
          </div>

          <button
            onClick={toggleDensity}
            className="px-3 py-1.5 rounded-xl border border-surface-border dark:border-surface-darkBorder text-xs font-medium capitalize"
          >
            {density} Density
          </button>
        </div>

        {/* Text Scale */}
        <div className="flex items-center justify-between pt-2 border-t border-surface-border/50">
          <div>
            <h4 className="text-xs font-semibold text-ink-primary dark:text-neutral-200 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5" />
              <span>Text Scaling & Readability</span>
            </h4>
            <p className="text-xs text-ink-secondary dark:text-neutral-400">
              Increase base font scale for enhanced reading comfort.
            </p>
          </div>

          <button
            onClick={toggleTextScale}
            className="px-3 py-1.5 rounded-xl border border-surface-border dark:border-surface-darkBorder text-xs font-medium capitalize"
          >
            {textScale} Font Size
          </button>
        </div>
      </div>

      {/* Engine & About */}
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-sm space-y-3 text-xs">
        <div className="flex items-center gap-2 border-b border-surface-border/50 dark:border-surface-darkBorder/50 pb-3">
          <Shield className="w-5 h-5 text-forest-700 dark:text-forest-400" />
          <h2 className="font-bold text-sm text-ink-primary dark:text-neutral-100">
            About Sondera
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-ink-secondary dark:text-neutral-400">
          <div>Heuristic Engine: <strong>v{ENGINE_VERSION}</strong></div>
          <div>Product Version: <strong>1.0.0 (Release Candidate)</strong></div>
          <div>Operating Budget: <strong>₹0 (Zero Paid API Dependency)</strong></div>
          <div>Event: <strong>HACKCOM ’26 ("Building a Safer Digital World")</strong></div>
        </div>

        <p className="text-ink-muted dark:text-neutral-500 pt-2 border-t border-surface-border/40 dark:border-surface-darkBorder/40">
          Sondera is built on the philosophy of explainable investigation rather than magical verdicts. It exposes observed indicators, discloses unrun checks, and maps evidence gaps to help individuals pause and make informed decisions.
        </p>
      </div>
    </div>
  );
};
