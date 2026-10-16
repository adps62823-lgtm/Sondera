import React from 'react';
import {
  ShieldAlert,
  AlertOctagon,
  CheckCircle2,
  ExternalLink,
  PhoneOff,
  Search,
  ArrowRight,
  Sparkles,
  Info,
  Clock,
  Network,
  FileText,
} from 'lucide-react';
import { AutomatedAuthenticityResult } from '../../core/engine/auto-authenticity-engine';

interface AutomatedAuthenticityVerdictCardProps {
  analysis: AutomatedAuthenticityResult;
  onNavigateTab: (tab: 'graph' | 'timeline' | 'neural_ai' | 'receipt' | 'evidence') => void;
}

export const AutomatedAuthenticityVerdictCard: React.FC<AutomatedAuthenticityVerdictCardProps> = ({
  analysis,
  onNavigateTab,
}) => {
  const isRed = analysis.verdictColor === 'red';
  const isAmber = analysis.verdictColor === 'amber';
  const isYellow = analysis.verdictColor === 'yellow';

  const badgeBg = isRed
    ? 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20'
    : isAmber
    ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
    : isYellow
    ? 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20'
    : 'bg-forest-500/10 text-forest-700 dark:text-forest-400 border-forest-500/20';

  const barColor = isRed
    ? 'bg-red-600'
    : isAmber
    ? 'bg-amber-500'
    : isYellow
    ? 'bg-yellow-500'
    : 'bg-forest-600';

  return (
    <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-5 sm:p-6 shadow-sm space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border/60 dark:border-surface-darkBorder/60 pb-5">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${badgeBg}`}
            >
              {isRed && <AlertOctagon className="w-3.5 h-3.5 text-red-600" />}
              {isAmber && <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />}
              {isYellow && <Info className="w-3.5 h-3.5 text-yellow-600" />}
              {analysis.verdictLabel}
            </span>
            <span className="text-xs text-ink-muted dark:text-neutral-400">
              Pattern Match Confidence: {Math.round(analysis.confidence * 100)}%
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-bold text-ink-primary dark:text-neutral-100 tracking-tight">
            {analysis.threatTitle}
          </h2>
          <p className="text-xs sm:text-sm text-ink-secondary dark:text-neutral-300">
            {analysis.aiExplanation.summary}
          </p>
        </div>

        {/* Authenticity Score Meter */}
        <div className="bg-surface-muted dark:bg-surface-darkMuted border border-surface-border/50 dark:border-surface-darkBorder/50 rounded-2xl p-4 shrink-0 flex flex-col items-center justify-center min-w-[170px] text-center">
          <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted dark:text-neutral-400">
            Authenticity Score
          </span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className={`text-3xl font-extrabold ${isRed ? 'text-red-600 dark:text-red-400' : isAmber ? 'text-amber-600' : 'text-forest-600'}`}>
              {analysis.authenticityScore}
            </span>
            <span className="text-xs text-ink-muted dark:text-neutral-400">/ 100</span>
          </div>
          <div className="w-full bg-surface-border/60 dark:bg-neutral-800 h-2 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full ${barColor} transition-all duration-500`}
              style={{ width: `${Math.max(analysis.authenticityScore, 4)}%` }}
            />
          </div>
          <span className="text-[10px] text-ink-muted dark:text-neutral-400 mt-1.5">
            {analysis.authenticityScore < 20
              ? 'Severe Deception'
              : analysis.authenticityScore < 50
              ? 'Suspicious / Unverified'
              : 'Verifiable Claims'}
          </span>
        </div>
      </div>

      {/* Specific Precautions & Safety Measures */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink-primary dark:text-neutral-100 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-forest-700 dark:text-forest-400" />
            <span>Specific Safety Precautions for This Incident</span>
          </h3>
          <span className="text-xs text-ink-muted dark:text-neutral-400">
            Tailored Action Plan
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysis.specificPrecautions.map((p, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-xl border transition-colors ${
                p.priority === 'immediate'
                  ? 'bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900/50'
                  : p.priority === 'reporting'
                  ? 'bg-blue-50/60 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50'
                  : 'bg-surface-muted dark:bg-surface-darkMuted border-surface-border/60 dark:border-surface-darkBorder/60'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 ${
                    p.priority === 'immediate'
                      ? 'bg-red-600 text-white'
                      : p.priority === 'reporting'
                      ? 'bg-blue-600 text-white'
                      : 'bg-forest-600 text-white'
                  }`}
                >
                  {idx + 1}
                </span>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-ink-primary dark:text-neutral-100">
                    {p.title}
                  </h4>
                  <p className="text-xs text-ink-secondary dark:text-neutral-300 leading-relaxed">
                    {p.action}
                  </p>
                  {p.officialUrl && (
                    <a
                      href={p.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-forest-700 dark:text-forest-400 hover:underline pt-1"
                    >
                      <span>Official Portal: {p.officialPortal || p.officialUrl}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Official Standard vs What This Sender Did */}
      {analysis.aiExplanation.authenticStandardComparison.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-ink-primary dark:text-neutral-100 flex items-center gap-2">
            <Search className="w-4 h-4 text-forest-700 dark:text-forest-400" />
            <span>Official Regulatory Standard vs. What This Message Did</span>
          </h3>

          <div className="overflow-x-auto rounded-xl border border-surface-border dark:border-surface-darkBorder">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-muted dark:bg-surface-darkMuted border-b border-surface-border dark:border-surface-darkBorder text-ink-muted dark:text-neutral-400 font-semibold uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Verification Aspect</th>
                  <th className="py-2.5 px-3 text-forest-800 dark:text-forest-300">
                    Official Regulatory Standard
                  </th>
                  <th className="py-2.5 px-3 text-red-700 dark:text-red-400">
                    What This Sender Did (Violation)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border/50 dark:divide-surface-darkBorder/50">
                {analysis.aiExplanation.authenticStandardComparison.map((c, i) => (
                  <tr key={i} className="hover:bg-surface-muted/30 dark:hover:bg-neutral-800/20">
                    <td className="py-2.5 px-3 font-semibold text-ink-primary dark:text-neutral-200 whitespace-nowrap">
                      {c.aspect}
                    </td>
                    <td className="py-2.5 px-3 text-ink-secondary dark:text-neutral-300">
                      <div className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-forest-600 shrink-0 mt-0.5" />
                        <span>{c.officialStandard}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-3 text-red-700 dark:text-red-300 font-medium">
                      <div className="flex items-start gap-1.5">
                        <PhoneOff className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{c.whatAttackerDid}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick Navigation Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-surface-border/60 dark:border-surface-darkBorder/60 text-xs">
        <span className="text-ink-muted dark:text-neutral-400">
          Automated Evidence & Timeline Ready
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateTab('graph')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-muted dark:bg-surface-darkMuted hover:bg-forest-50 dark:hover:bg-forest-950/40 text-forest-800 dark:text-forest-300 font-medium transition"
          >
            <Network className="w-3.5 h-3.5" />
            <span>View Evidence Map</span>
          </button>

          <button
            onClick={() => onNavigateTab('timeline')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-muted dark:bg-surface-darkMuted hover:bg-forest-50 dark:hover:bg-forest-950/40 text-forest-800 dark:text-forest-300 font-medium transition"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timeline Analysis</span>
          </button>

          <button
            onClick={() => onNavigateTab('neural_ai')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-semibold border border-indigo-200 dark:border-indigo-900 transition hover:bg-indigo-100"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Investigator</span>
          </button>

          <button
            onClick={() => onNavigateTab('receipt')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-semibold transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Export Official Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
