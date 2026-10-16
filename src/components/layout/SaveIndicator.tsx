import React from 'react';
import { CheckCircle2, RefreshCw, AlertTriangle, HardDrive } from 'lucide-react';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface SaveIndicatorProps {
  status: SaveStatus;
  lastSavedAt?: string;
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({ status, lastSavedAt }) => {
  return (
    <div className="flex items-center gap-1.5 text-xs select-none">
      {status === 'saving' && (
        <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Saving locally...</span>
        </span>
      )}

      {status === 'saved' && (
        <span className="flex items-center gap-1 text-forest-700 dark:text-forest-300">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Saved on this device</span>
          {lastSavedAt && (
            <span className="text-[10px] text-ink-muted dark:text-neutral-500">
              ({new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })})
            </span>
          )}
        </span>
      )}

      {status === 'error' && (
        <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Could not save locally</span>
        </span>
      )}

      {status === 'idle' && (
        <span className="flex items-center gap-1 text-ink-muted dark:text-neutral-500">
          <HardDrive className="w-3.5 h-3.5" />
          <span>Local database ready</span>
        </span>
      )}
    </div>
  );
};
