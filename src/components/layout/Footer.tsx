import React from 'react';
import { ShieldCheck, Lock, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-surface-border dark:border-surface-darkBorder bg-surface-muted dark:bg-surface-darkCard/50 py-8 px-4 sm:px-6 lg:px-8 text-xs text-ink-secondary dark:text-neutral-400">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-md bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium text-ink-primary dark:text-neutral-200">
              Zero-Cloud Privacy Guarantee
            </p>
            <p className="text-[11px]">
              Investigations are stored in your device's browser database (IndexedDB). No pasted text or links leave your computer by default.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          <span className="flex items-center gap-1 text-forest-700 dark:text-forest-300 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> HACKCOM ’26 Build
          </span>
          <span>•</span>
          <span>Theme: Building a Safer Digital World</span>
          <span>•</span>
          <span className="text-amber-700 dark:text-amber-400">
            A clean heuristic scan is not a guarantee of safety.
          </span>
        </div>
      </div>
    </footer>
  );
};
