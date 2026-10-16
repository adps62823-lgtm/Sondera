import React, { useState, useEffect } from 'react';
import { JUDGMENT_GYM_LESSONS, GymLesson } from '../../features/learn/judgment-gym-data';
import { db } from '../../services/db';
import {
  GraduationCap,
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RotateCcw,
  BookOpen,
} from 'lucide-react';

export const JudgmentGymView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeLessonId, setActiveLessonId] = useState<string>(JUDGMENT_GYM_LESSONS[0].id);
  const [userSelections, setUserSelections] = useState<Record<string, string>>({});
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());

  useEffect(() => {
    const loadProgress = async () => {
      const records = await db.learningProgress.toArray();
      const set = new Set(records.map((r) => r.lessonId));
      setCompletedLessons(set);
    };
    loadProgress();
  }, []);

  const activeLesson =
    JUDGMENT_GYM_LESSONS.find((l) => l.id === activeLessonId) || JUDGMENT_GYM_LESSONS[0];

  const filteredLessons = JUDGMENT_GYM_LESSONS.filter((l) =>
    selectedCategory === 'all' ? true : l.category === selectedCategory
  );

  const handleSelectOption = async (optionId: string) => {
    setUserSelections((prev) => ({ ...prev, [activeLesson.id]: optionId }));

    const option = activeLesson.options.find((o) => o.id === optionId);
    if (option?.isBest) {
      await db.learningProgress.put({
        id: `prog-${activeLesson.id}`,
        lessonId: activeLesson.id,
        completedAt: new Date().toISOString(),
      });
      setCompletedLessons((prev) => new Set([...prev, activeLesson.id]));
    }
  };

  const handleReset = async () => {
    if (window.confirm('Reset all Judgment Gym training progress?')) {
      await db.learningProgress.clear();
      setCompletedLessons(new Set());
      setUserSelections({});
    }
  };

  const selectedOptId = userSelections[activeLesson.id];
  const chosenOption = activeLesson.options.find((o) => o.id === selectedOptId);

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200">
              Interactive Training
            </span>
            <span className="text-xs text-ink-muted">
              {completedLessons.size} of {JUDGMENT_GYM_LESSONS.length} mastered
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-forest-900 dark:text-forest-100 flex items-center gap-2">
            <GraduationCap className="w-6 h-6 text-forest-700 dark:text-forest-400" />
            <span>Judgment Gym</span>
          </h1>
          <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-1">
            Short, educational exercises that hone your ability to spot pressure cues, misleading URLs, and fake authority.
          </p>
        </div>

        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-border dark:border-surface-darkBorder text-ink-secondary dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Progress</span>
        </button>
      </div>

      {/* Main Grid: Sidebar list + Interactive Lesson Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Lessons List */}
        <div className="space-y-3">
          {/* Category Filter */}
          <div className="flex flex-wrap gap-1 bg-surface-muted dark:bg-surface-darkMuted p-1.5 rounded-xl text-xs">
            {['all', 'message', 'url', 'evidence', 'privacy'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg capitalize transition ${
                  selectedCategory === cat
                    ? 'bg-white dark:bg-surface-darkCard font-semibold text-forest-800 dark:text-forest-200 shadow-xs'
                    : 'text-ink-secondary dark:text-neutral-400'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredLessons.map((l) => {
              const isMastered = completedLessons.has(l.id);
              const isActive = activeLessonId === l.id;
              return (
                <div
                  key={l.id}
                  onClick={() => setActiveLessonId(l.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition ${
                    isActive
                      ? 'border-forest-600 bg-forest-50/70 dark:bg-forest-950/60 dark:border-forest-700'
                      : 'border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-neutral-50 dark:hover:bg-neutral-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono uppercase text-ink-muted">
                      {l.category}
                    </span>
                    {isMastered && (
                      <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Mastered
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-ink-primary dark:text-neutral-100 mt-1">
                    {l.title}
                  </h4>
                  <p className="text-[11px] text-ink-secondary dark:text-neutral-400 line-clamp-1 mt-0.5">
                    {l.conceptSummary}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Interactive Lesson Card */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-6 shadow-sm space-y-5">
            {/* Lesson Title & Concept */}
            <div className="border-b border-surface-border/50 dark:border-surface-darkBorder/50 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                  Educational Scenario
                </span>
                <span className="text-xs text-ink-muted">• Not a live scanning result</span>
              </div>
              <h2 className="text-lg font-bold text-ink-primary dark:text-neutral-100">
                {activeLesson.title}
              </h2>
              <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-1">
                {activeLesson.conceptSummary}
              </p>
            </div>

            {/* Scenario Box */}
            <div className="p-4 rounded-xl bg-surface-muted dark:bg-surface-darkMuted border border-surface-border/60 dark:border-surface-darkBorder/60 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                Observed Scenario
              </span>
              <p className="text-xs font-mono text-ink-primary dark:text-neutral-200">
                "{activeLesson.scenario}"
              </p>
            </div>

            {/* The Question */}
            <div>
              <h3 className="font-semibold text-xs text-ink-primary dark:text-neutral-100 mb-3 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-forest-700 dark:text-forest-400" />
                <span>{activeLesson.question}</span>
              </h3>

              <div className="space-y-2.5">
                {activeLesson.options.map((opt) => {
                  const isSelected = selectedOptId === opt.id;
                  let optStyle =
                    'border-surface-border dark:border-surface-darkBorder hover:bg-neutral-50 dark:hover:bg-neutral-800';

                  if (isSelected) {
                    optStyle = opt.isBest
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100 font-semibold'
                      : 'border-red-400 bg-red-50/60 dark:bg-red-950/40 text-red-950 dark:text-red-100 font-semibold';
                  }

                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs transition flex items-start gap-3 ${optStyle}`}
                    >
                      <span className="w-5 h-5 rounded-full flex items-center justify-center border font-bold text-[10px] shrink-0 mt-0.5">
                        {opt.id.toUpperCase()}
                      </span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Explanation Feedback Box */}
            {chosenOption && (
              <div
                className={`p-4 rounded-xl border text-xs space-y-2 ${
                  chosenOption.isBest
                    ? 'border-emerald-300 bg-emerald-50/80 dark:border-emerald-800 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-100'
                    : 'border-amber-300 bg-amber-50/80 dark:border-amber-800 dark:bg-amber-950/60 text-amber-950 dark:text-amber-100'
                }`}
              >
                <div className="flex items-center gap-1.5 font-bold">
                  {chosenOption.isBest ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Sound Digital Judgment!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <span>Not the Most Prudent Action:</span>
                    </>
                  )}
                </div>
                <p>{chosenOption.explanation}</p>
                <div className="pt-2 border-t border-current/20 font-medium">
                  <strong>Key Safety Takeaway: </strong> {activeLesson.practicalTakeaway}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
