import React, { useState, useEffect } from 'react';
import { InvestigationCase } from '../../types/domain';
import { db } from '../../services/db';
import {
  ShieldAlert,
  MessageSquare,
  Link2,
  FileQuestion,
  Lock,
  ArrowRight,
  Clock,
  CheckCircle,
  FolderOpen,
  AlertOctagon,
  BookOpen,
  Scale,
} from 'lucide-react';

interface WorkspaceHomeProps {
  onStartInvestigation: (presetKind?: InvestigationCase['kind']) => void;
  onOpenCase: (caseId: string) => void;
  onOpenPrivacy: () => void;
  onOpenGym: () => void;
  onOpenEmergency?: () => void;
  onOpenThreats?: () => void;
  onOpenUrlLab?: () => void;
  onOpenComparator?: () => void;
}

export const WorkspaceHome: React.FC<WorkspaceHomeProps> = ({
  onStartInvestigation,
  onOpenCase,
  onOpenPrivacy,
  onOpenGym,
  onOpenEmergency,
  onOpenThreats,
  onOpenUrlLab,
  onOpenComparator,
}) => {
  const [recentCases, setRecentCases] = useState<InvestigationCase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const list = await db.cases.orderBy('updatedAt').reverse().limit(4).toArray();
      setRecentCases(list);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-10">
      {/* Hero Welcome */}
      <div className="relative overflow-hidden rounded-3xl bg-forest-900 text-white p-8 sm:p-12 shadow-md">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-forest-800 text-forest-200 text-xs font-semibold">
            <ShieldAlert className="w-4 h-4 text-forest-300" />
            <span>Digital Trust & Investigation Workspace</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-forest-50 leading-tight">
            Know what you know. <br />
            <span className="text-forest-200">Find what you don’t.</span>
          </h1>

          <p className="text-forest-100/90 text-sm sm:text-base leading-relaxed">
            Turn alarming messages, links, and viral rumors into structured, evidence-backed investigations. Sondera evaluates observable indicators locally, exposes evidence gaps, and helps you make a prudent decision without leaking your private data.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onStartInvestigation('message')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-forest-950 font-semibold text-sm hover:bg-forest-50 transition shadow-sm"
            >
              <span>Examine Suspicious Message</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={() => onStartInvestigation('url')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 hover:bg-forest-700 text-forest-100 font-medium text-sm transition"
            >
              <Link2 className="w-4 h-4" />
              <span>Inspect a Link</span>
            </button>

            {onOpenEmergency && (
              <button
                onClick={onOpenEmergency}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition shadow-sm"
              >
                <AlertOctagon className="w-4 h-4" />
                <span>Emergency Help (I Clicked)</span>
              </button>
            )}
          </div>
        </div>

        {/* Subtle decorative background graphic */}
        <div className="absolute -right-10 -bottom-10 w-96 h-96 rounded-full bg-forest-800/40 blur-3xl pointer-events-none" />
      </div>

      {/* 3 Entry Pathways */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => onStartInvestigation('message')}
          className="p-6 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:border-forest-500 dark:hover:border-forest-600 transition cursor-pointer shadow-xs hover:shadow-md group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-ink-primary dark:text-neutral-100">
              Suspicious Message Check
            </h3>
            <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-2 leading-relaxed">
              Analyze bank KYC threats, courier redelivery texts, unexpected prize claims, and urgency cues with explainable heuristic rules.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-border/50 dark:border-surface-darkBorder/50 flex items-center justify-between text-xs font-semibold text-forest-700 dark:text-forest-400">
            <span>Check a Message</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        <div
          onClick={() => onStartInvestigation('url')}
          className="p-6 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:border-forest-500 dark:hover:border-forest-600 transition cursor-pointer shadow-xs hover:shadow-md group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
              <Link2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-ink-primary dark:text-neutral-100">
              Safe URL Syntax Inspection
            </h3>
            <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-2 leading-relaxed">
              Examine hostname structure, the misleading '@' user-info trick, link shorteners, and abnormal ports without opening a connection.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-border/50 dark:border-surface-darkBorder/50 flex items-center justify-between text-xs font-semibold text-forest-700 dark:text-forest-400">
            <span>Inspect a Link</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>

        <div
          onClick={() => onStartInvestigation('claim')}
          className="p-6 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:border-forest-500 dark:hover:border-forest-600 transition cursor-pointer shadow-xs hover:shadow-md group flex flex-col justify-between"
        >
          <div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
              <FileQuestion className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-base text-ink-primary dark:text-neutral-100">
              Viral Claim & Evidence Review
            </h3>
            <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-2 leading-relaxed">
              Track Trust Debt. Map claims against official sources, identify missing original announcements, and separate forwards from proof.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-surface-border/50 dark:border-surface-darkBorder/50 flex items-center justify-between text-xs font-semibold text-forest-700 dark:text-forest-400">
            <span>Review a Claim</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </div>

      {/* Advanced Tools Quick Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {onOpenThreats && (
          <div
            onClick={onOpenThreats}
            className="p-4 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:border-forest-400 transition cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-forest-50 dark:bg-forest-900 text-forest-800 dark:text-forest-200">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-ink-primary dark:text-neutral-100">
                  Scam Directory
                </h4>
                <p className="text-[11px] text-ink-muted">10 modern scam breakdowns</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-muted" />
          </div>
        )}

        {onOpenUrlLab && (
          <div
            onClick={onOpenUrlLab}
            className="p-4 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:border-forest-400 transition cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                <Link2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-ink-primary dark:text-neutral-100">
                  Link & QR Inspector
                </h4>
                <p className="text-[11px] text-ink-muted">Dissect UPI & disguised links</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-muted" />
          </div>
        )}

        {onOpenComparator && (
          <div
            onClick={onOpenComparator}
            className="p-4 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:border-forest-400 transition cursor-pointer flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200">
                <Scale className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-ink-primary dark:text-neutral-100">
                  Compare Sources
                </h4>
                <p className="text-[11px] text-ink-muted">Side-by-side claim checking</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-ink-muted" />
          </div>
        )}
      </div>

      {/* Recent Investigations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-forest-700 dark:text-forest-400" />
            <h2 className="font-bold text-base text-ink-primary dark:text-neutral-100">
              Recent Investigations
            </h2>
          </div>

          {recentCases.length > 0 && (
            <button
              onClick={() => onStartInvestigation()}
              className="text-xs font-semibold text-forest-700 dark:text-forest-400 hover:underline"
            >
              View All Cases →
            </button>
          )}
        </div>

        {loading ? (
          <div className="text-xs text-ink-muted text-center py-6">Checking local database...</div>
        ) : recentCases.length === 0 ? (
          <div className="p-8 rounded-2xl border border-dashed border-surface-border dark:border-surface-darkBorder text-center bg-white dark:bg-surface-darkCard">
            <FolderOpen className="w-8 h-8 text-ink-muted mx-auto mb-2 opacity-50" />
            <p className="text-xs font-medium text-ink-primary dark:text-neutral-200">
              Your workspace is empty
            </p>
            <p className="text-xs text-ink-muted mt-1 max-w-sm mx-auto">
              Start with a message, link, or claim you want to understand. Your investigation is saved locally on this device.
            </p>
            <button
              onClick={() => onStartInvestigation()}
              className="mt-4 px-4 py-2 rounded-xl bg-forest-900 text-white text-xs font-medium hover:bg-forest-800 transition shadow-sm"
            >
              + Create First Investigation
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentCases.map((c) => (
              <div
                key={c.id}
                onClick={() => onOpenCase(c.id)}
                className="p-4 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:border-forest-400 dark:hover:border-forest-700 transition cursor-pointer shadow-xs flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-forest-200 font-semibold">
                    {c.kind}
                  </span>
                  <h4 className="font-bold text-xs text-ink-primary dark:text-neutral-100 mt-2 line-clamp-2">
                    {c.title}
                  </h4>
                  <p className="text-[11px] text-ink-muted line-clamp-2 mt-1 font-mono">
                    {c.originalInput}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-surface-border/40 text-[10px] text-ink-muted flex items-center justify-between">
                  <span>{new Date(c.updatedAt).toLocaleDateString()}</span>
                  <span className="text-forest-700 dark:text-forest-300 font-medium">Resume →</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Philosophy & Safety Companion Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-surface-muted/50 dark:bg-surface-darkCard space-y-3">
          <div className="flex items-center gap-2 text-forest-800 dark:text-forest-300 font-bold text-sm">
            <CheckCircle className="w-5 h-5 text-forest-600 dark:text-forest-400" />
            <span>The 4 Sondera Safety Axioms</span>
          </div>
          <ul className="text-xs space-y-2 text-ink-secondary dark:text-neutral-300 list-disc list-inside">
            <li><strong>Clean Scan $\neq$ Safe:</strong> Never assume a link is harmless simply because no local rule matched.</li>
            <li><strong>HTTPS $\neq$ Honest:</strong> Phishing sites acquire free SSL certificates within seconds.</li>
            <li><strong>Repetition $\neq$ Evidence:</strong> Ten family forwards are 1 unverified rumor, not 10 confirmations.</li>
            <li><strong>Never Disclose OTPs:</strong> No authentic bank or IT staff will ever ask for your verification code.</li>
          </ul>
        </div>

        <div className="p-6 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-surface-muted/50 dark:bg-surface-darkCard space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-forest-800 dark:text-forest-300 font-bold text-sm">
              <Lock className="w-5 h-5 text-forest-600 dark:text-forest-400" />
              <span>Personal Safety & Training Tools</span>
            </div>
            <p className="text-xs text-ink-secondary dark:text-neutral-300 mt-2 leading-relaxed">
              Deepen your digital judgment without risking live malware or compromising personal accounts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-2">
            <button
              onClick={onOpenGym}
              className="px-3.5 py-1.5 rounded-xl bg-forest-900 text-white text-xs font-medium hover:bg-forest-800 transition"
            >
              Train in Judgment Gym →
            </button>
            <button
              onClick={onOpenPrivacy}
              className="px-3.5 py-1.5 rounded-xl border border-forest-700 text-forest-800 dark:text-forest-200 text-xs font-medium hover:bg-forest-100 dark:hover:bg-forest-950 transition"
            >
              Privacy Navigator →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
