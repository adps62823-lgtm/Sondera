import React from 'react';
import { CheckRecord } from '../../types/domain';
import { CheckCircle2, AlertTriangle, MinusCircle, XCircle, Shield } from 'lucide-react';

interface ChecksOverviewProps {
  checks: CheckRecord[];
}

export const ChecksOverview: React.FC<ChecksOverviewProps> = ({ checks }) => {
  return (
    <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-forest-700 dark:text-forest-400" />
          <h3 className="font-bold text-sm text-ink-primary dark:text-neutral-100">
            Automated Check Registry & Methodology
          </h3>
        </div>
        <span className="text-xs text-ink-muted dark:text-neutral-400">
          {checks.length} checks logged
        </span>
      </div>

      <p className="text-xs text-ink-secondary dark:text-neutral-400">
        In accordance with Sondera's transparency standard, checks that were not configured or skipped are explicitly stated below. An unrun check is never counted as passed.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-surface-border dark:border-surface-darkBorder text-ink-muted dark:text-neutral-400">
              <th className="pb-2 font-medium">Check Name</th>
              <th className="pb-2 font-medium">Status</th>
              <th className="pb-2 font-medium hidden sm:table-cell">Provider</th>
              <th className="pb-2 font-medium">Finding / Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border/50 dark:divide-surface-darkBorder/50">
            {checks.map((chk) => {
              let badgeBg = 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';
              let Icon = MinusCircle;

              if (chk.status === 'completed_with_findings') {
                badgeBg = 'bg-amber-100 text-amber-800 dark:bg-amber-950/70 dark:text-amber-200';
                Icon = AlertTriangle;
              } else if (chk.status === 'completed_no_findings') {
                badgeBg = 'bg-forest-100 text-forest-800 dark:bg-forest-950/70 dark:text-forest-200';
                Icon = CheckCircle2;
              } else if (chk.status === 'unavailable') {
                badgeBg = 'bg-red-50 text-red-700 dark:bg-red-950/70 dark:text-red-300';
                Icon = XCircle;
              }

              return (
                <tr key={chk.id} className="hover:bg-surface-muted/50 dark:hover:bg-surface-darkMuted/50 transition">
                  <td className="py-2.5 font-medium text-ink-primary dark:text-neutral-200 pr-2">
                    {chk.name}
                  </td>
                  <td className="py-2.5 pr-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${badgeBg}`}>
                      <Icon className="w-3 h-3" />
                      {chk.status.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-2.5 text-ink-secondary dark:text-neutral-400 hidden sm:table-cell pr-2">
                    {chk.provider || 'Local'}
                  </td>
                  <td className="py-2.5 text-ink-secondary dark:text-neutral-300">
                    {chk.summary}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
