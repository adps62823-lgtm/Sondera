import React, { useState, useEffect } from 'react';
import { PRIVACY_QUESTIONS } from '../../features/privacy/privacy-navigator-data';
import { db, PrivacyCheckItem } from '../../services/db';
import {
  Lock,
  RotateCcw,
  Download,
  CheckCircle2,
} from 'lucide-react';

export const PrivacyNavigatorView: React.FC = () => {
  const [answers, setAnswers] = useState<Record<string, PrivacyCheckItem['status']>>({});

  useEffect(() => {
    const loadAnswers = async () => {
      const items = await db.privacyChecklist.toArray();
      const map: Record<string, PrivacyCheckItem['status']> = {};
      for (const it of items) {
        map[it.questionId] = it.status;
      }
      setAnswers(map);
    };
    loadAnswers();
  }, []);

  const handleSetAnswer = async (questionId: string, status: PrivacyCheckItem['status']) => {
    setAnswers((prev) => ({ ...prev, [questionId]: status }));
    await db.privacyChecklist.put({
      id: `pq-${questionId}`,
      questionId,
      status,
      updatedAt: new Date().toISOString(),
    });
  };

  const handleReset = async () => {
    if (window.confirm('Reset all Privacy Navigator checklist responses?')) {
      await db.privacyChecklist.clear();
      setAnswers({});
    }
  };

  const handleExportPrivacyReport = () => {
    const lines: string[] = [];
    lines.push(`# Sondera — Personal Digital Privacy Assessment Report`);
    lines.push(`Generated: ${new Date().toUTCString()}`);
    lines.push(`Framework: HACKCOM '26 Digital Privacy Navigator`);
    lines.push(``);
    lines.push(`> [!NOTE]`);
    lines.push(`> This is a client-side self-reflection audit. Sondera does not inspect device settings or browser history without explicit permissions.`);
    lines.push(``);
    lines.push(`| Area / Question | Status | Recommended Action |`);
    lines.push(`|:---|:---|:---|`);

    for (const q of PRIVACY_QUESTIONS) {
      const ans = answers[q.id] || 'Not Evaluated';
      lines.push(`| **${q.title}** | \`${ans.toUpperCase()}\` | ${q.recommendedAction} |`);
    }

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sondera_Privacy_Audit_${new Date().toISOString().substring(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const totalQuestions = PRIVACY_QUESTIONS.length;
  const answeredCount = Object.values(answers).filter((s) => s && s !== 'not_answered').length;
  const yesCount = Object.values(answers).filter((s) => s === 'yes').length;
  const needsAttentionCount = Object.values(answers).filter((s) => s === 'no' || s === 'not_sure').length;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200">
              Interactive Self-Assessment
            </span>
            <span className="text-xs text-ink-muted">
              {answeredCount} of {totalQuestions} answered
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-forest-900 dark:text-forest-100 flex items-center gap-2">
            <Lock className="w-6 h-6 text-forest-700 dark:text-forest-400" />
            <span>Privacy Navigator</span>
          </h1>
          <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-1">
            Practical privacy hygiene checklist. No device scanning or credential collection—honest self-reflection only.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportPrivacyReport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-medium transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Privacy Audit (.md)</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-border dark:border-surface-darkBorder text-ink-secondary dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Progress Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder shadow-xs">
          <span className="text-[10px] font-bold uppercase text-ink-muted">Completion Rate</span>
          <div className="text-xl font-bold text-ink-primary dark:text-neutral-100 mt-1">
            {Math.round((answeredCount / totalQuestions) * 100)}%
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">
            {answeredCount} of {totalQuestions} evaluated
          </p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder shadow-xs">
          <span className="text-[10px] font-bold uppercase text-forest-700 dark:text-forest-400">Protective Habits</span>
          <div className="text-xl font-bold text-forest-800 dark:text-forest-300 mt-1">
            {yesCount}
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">Good practices confirmed</p>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder shadow-xs">
          <span className="text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">Action Opportunities</span>
          <div className="text-xl font-bold text-amber-800 dark:text-amber-300 mt-1">
            {needsAttentionCount}
          </div>
          <p className="text-[11px] text-ink-muted mt-0.5">Habits to review or improve</p>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {PRIVACY_QUESTIONS.map((q) => {
          const currentStatus = answers[q.id];

          return (
            <div
              key={q.id}
              className="p-5 rounded-2xl bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder shadow-xs space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-surface-border/40 dark:border-surface-darkBorder/40 pb-3">
                <div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-surface-muted text-ink-muted">
                    {q.category}
                  </span>
                  <h3 className="font-bold text-sm text-ink-primary dark:text-neutral-100 mt-1">
                    {q.title}
                  </h3>
                </div>

                {/* Choice Buttons */}
                <div className="flex items-center gap-1.5 self-start sm:self-auto">
                  <button
                    onClick={() => handleSetAnswer(q.id, 'yes')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      currentStatus === 'yes'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-surface-muted dark:bg-surface-darkMuted text-ink-secondary hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => handleSetAnswer(q.id, 'no')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      currentStatus === 'no'
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-surface-muted dark:bg-surface-darkMuted text-ink-secondary hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    No
                  </button>
                  <button
                    onClick={() => handleSetAnswer(q.id, 'not_sure')}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                      currentStatus === 'not_sure'
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-surface-muted dark:bg-surface-darkMuted text-ink-secondary hover:bg-neutral-200 dark:hover:bg-neutral-700'
                    }`}
                  >
                    Not Sure
                  </button>
                </div>
              </div>

              <p className="text-xs text-ink-primary dark:text-neutral-200">
                {q.description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                <div className="p-3 rounded-xl bg-surface-muted dark:bg-surface-darkMuted">
                  <strong className="block text-[11px] font-semibold text-ink-muted uppercase mb-1">
                    Why This Matters
                  </strong>
                  <p className="text-ink-secondary dark:text-neutral-300 leading-relaxed">
                    {q.whyItMatters}
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-forest-50/70 dark:bg-forest-950/40 border border-forest-200/50 dark:border-forest-800/50">
                  <strong className="block text-[11px] font-semibold text-forest-800 dark:text-forest-300 uppercase mb-1">
                    Recommended Action
                  </strong>
                  <p className="text-forest-900 dark:text-forest-200 leading-relaxed">
                    {q.recommendedAction}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
