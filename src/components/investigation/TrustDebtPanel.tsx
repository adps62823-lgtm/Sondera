import React from 'react';
import { TrustDebtAssessment } from '../../types/domain';
import { Scale, AlertCircle, CheckCircle, ArrowRight, Lightbulb } from 'lucide-react';

interface TrustDebtPanelProps {
  assessment: TrustDebtAssessment;
  onOpenMissingProof?: () => void;
}

export const TrustDebtPanel: React.FC<TrustDebtPanelProps> = ({
  assessment,
  onOpenMissingProof,
}) => {
  const isHigh = assessment.level === 'high' || assessment.level === 'elevated';
  const isModerate = assessment.level === 'moderate';

  const badgeColor = isHigh
    ? 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/80 dark:text-amber-200 dark:border-amber-800'
    : isModerate
    ? 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/80 dark:text-blue-200 dark:border-blue-800'
    : 'bg-forest-100 text-forest-900 border-forest-300 dark:bg-forest-950/80 dark:text-forest-200 dark:border-forest-800';

  return (
    <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border/50 dark:border-surface-darkBorder/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-forest-50 dark:bg-forest-900/40 text-forest-700 dark:text-forest-300">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink-primary dark:text-neutral-100 flex items-center gap-2">
              Evidence coverage
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${assessment.metrics.totalClaims === 0 ? 'bg-neutral-100 text-neutral-700 border-neutral-300 dark:bg-neutral-800 dark:text-neutral-300 dark:border-neutral-700' : badgeColor}`}>
                {assessment.metrics.totalClaims === 0 ? 'No claims reviewed' : assessment.level.toUpperCase()}
              </span>
            </h3>
            <p className="text-xs text-ink-secondary dark:text-neutral-400">
              Tracks whether specific claims have sources attached and reviewed.
            </p>
          </div>
        </div>

        {onOpenMissingProof && (
          <button
            onClick={onOpenMissingProof}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-600 hover:bg-forest-700 text-white text-xs font-medium transition self-start sm:self-auto"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Add claims and sources</span>
          </button>
        )}
      </div>

      <div className="p-3.5 rounded-xl bg-surface-muted dark:bg-surface-darkMuted border border-surface-border/50 dark:border-surface-darkBorder/50">
        <h4 className="font-semibold text-xs text-ink-primary dark:text-neutral-200 mb-1">
          {assessment.headline}
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2 pt-2 border-t border-surface-border/40 dark:border-surface-darkBorder/40 text-center">
          <div className="p-2 rounded bg-white dark:bg-surface-darkCard">
            <span className="block text-[10px] text-ink-muted dark:text-neutral-400">Total Claims</span>
            <span className="font-bold text-xs text-ink-primary dark:text-neutral-200">{assessment.metrics.totalClaims}</span>
          </div>
          <div className="p-2 rounded bg-white dark:bg-surface-darkCard">
            <span className="block text-[10px] text-ink-muted dark:text-neutral-400">Supported</span>
            <span className="font-bold text-xs text-forest-700 dark:text-forest-400">{assessment.metrics.supportedClaims}</span>
          </div>
          <div className="p-2 rounded bg-white dark:bg-surface-darkCard">
            <span className="block text-[10px] text-ink-muted dark:text-neutral-400">Unsupported</span>
            <span className="font-bold text-xs text-amber-700 dark:text-amber-400">{assessment.metrics.unsupportedClaims}</span>
          </div>
          <div className="p-2 rounded bg-white dark:bg-surface-darkCard">
            <span className="block text-[10px] text-ink-muted dark:text-neutral-400">Sources Attached</span>
            <span className="font-bold text-xs text-ink-primary dark:text-neutral-200">{assessment.metrics.independentSourcesCount}</span>
          </div>
        </div>
      </div>

      {assessment.reasons.length > 0 && (
        <div>
          <h5 className="text-xs font-semibold text-ink-primary dark:text-neutral-200 mb-1.5 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Explanatory Factors</span>
          </h5>
          <ul className="space-y-1.5 text-xs text-ink-secondary dark:text-neutral-300">
            {assessment.reasons.map((r, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {assessment.recommendedSteps.length > 0 && (
        <div className="pt-2 border-t border-surface-border/50 dark:border-surface-darkBorder/50">
          <h5 className="text-xs font-semibold text-forest-800 dark:text-forest-300 mb-1.5 flex items-center gap-1.5">
            <ArrowRight className="w-3.5 h-3.5 text-forest-600 dark:text-forest-400" />
          <span>Next steps</span>
          </h5>
          <ul className="space-y-1 text-xs text-ink-secondary dark:text-neutral-300">
            {assessment.recommendedSteps.map((s, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle className="w-3 h-3 text-forest-600 dark:text-forest-400 shrink-0" />
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-[10px] text-ink-muted dark:text-neutral-500 italic">
        Source links found online are saved as unreviewed until you inspect and connect them to a claim.
      </div>
    </div>
  );
};
