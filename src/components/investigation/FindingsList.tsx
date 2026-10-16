import React from 'react';
import { Finding } from '../../types/domain';
import { AlertCircle, AlertTriangle, Info, CheckCircle2, EyeOff } from 'lucide-react';

interface FindingsListProps {
  findings: Finding[];
  onDismissFinding?: (findingId: string, note: string) => void;
}

export const FindingsList: React.FC<FindingsListProps> = ({ findings, onDismissFinding }) => {
  if (findings.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-forest-50/50 dark:bg-forest-950/20 text-center">
        <CheckCircle2 className="w-8 h-8 text-forest-700 dark:text-forest-400 mx-auto mb-2" />
        <h4 className="font-semibold text-sm text-forest-900 dark:text-forest-200">
          No Configured Local Warning Patterns Detected
        </h4>
        <p className="mt-1 text-xs text-ink-secondary dark:text-neutral-400 max-w-lg mx-auto">
          Local deterministic heuristics did not match common high-pressure urgency cues, credential demands, or malformed URL patterns in the supplied text.
        </p>
        <div className="mt-3 inline-block px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-[11px] text-amber-800 dark:text-amber-300">
          ⚠️ Crucial note: Absence of automated detection is never proof that a message or website is genuine.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {findings.map((f) => {
        const isHigh = f.severity === 'high';
        const isCaution = f.severity === 'caution';

        const borderColor = isHigh
          ? 'border-red-300 dark:border-red-900/60'
          : isCaution
          ? 'border-amber-300 dark:border-amber-900/60'
          : 'border-blue-200 dark:border-blue-900/60';

        const badgeBg = isHigh
          ? 'bg-red-100 text-red-800 dark:bg-red-950/80 dark:text-red-200'
          : isCaution
          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-200'
          : 'bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-200';

        const Icon = isHigh ? AlertCircle : isCaution ? AlertTriangle : Info;

        return (
          <div
            key={f.id}
            className={`rounded-2xl border ${borderColor} bg-white dark:bg-surface-darkCard p-5 shadow-sm transition hover:shadow-md`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${badgeBg}`}>
                  <Icon className="w-3.5 h-3.5" />
                  {f.severity.toUpperCase()}
                </span>
                <h4 className="font-bold text-sm text-ink-primary dark:text-neutral-100">
                  {f.title}
                </h4>
              </div>

              <span className="text-[10px] font-mono text-ink-muted dark:text-neutral-500">
                Rule: {f.ruleId}
              </span>
            </div>

            {/* Matched excerpt */}
            {f.matchedText && (
              <div className="mt-3 p-2.5 rounded-lg bg-surface-muted dark:bg-surface-darkMuted border border-surface-border/50 dark:border-surface-darkBorder/50 font-mono text-xs text-ink-primary dark:text-neutral-200 flex items-center gap-2">
                <span className="text-ink-muted dark:text-neutral-400 font-sans text-[11px] uppercase tracking-wide">
                  Matched text:
                </span>
                <span className="bg-amber-100/70 dark:bg-amber-950/60 px-1.5 py-0.5 rounded text-amber-900 dark:text-amber-200 font-semibold">
                  "{f.matchedText}"
                </span>
              </div>
            )}

            {/* Explanation */}
            <div className="mt-3 text-xs text-ink-secondary dark:text-neutral-300 leading-relaxed">
              <p>
                <strong className="text-ink-primary dark:text-neutral-200">Why it matters: </strong>
                {f.explanation}
              </p>
            </div>

            {/* Limitation & Context */}
            <div className="mt-2 text-xs text-ink-muted dark:text-neutral-400 italic">
              <p>
                <strong>System Limitation: </strong>
                {f.limitation}
              </p>
            </div>

            {/* Recommended action */}
            {f.recommendedAction && (
              <div className="mt-3 p-3 rounded-xl bg-forest-50/70 dark:bg-forest-950/30 border border-forest-200/60 dark:border-forest-800/60 text-xs text-forest-900 dark:text-forest-200 flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-forest-600 mt-1.5 shrink-0" />
                <div>
                  <span className="font-semibold">Recommended Prudent Action: </span>
                  {f.recommendedAction}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
