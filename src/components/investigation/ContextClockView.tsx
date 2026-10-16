import React, { useState } from 'react';
import { TimelineEvent } from '../../types/domain';
import { Clock, Plus, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { db } from '../../services/db';

interface ContextClockViewProps {
  caseId: string;
  events: TimelineEvent[];
  onEventAdded?: () => void;
}

export const ContextClockView: React.FC<ContextClockViewProps> = ({
  caseId,
  events,
  onEventAdded,
}) => {
  const [showAdd, setShowAdd] = useState(false);
  const [label, setLabel] = useState('');
  const [kind, setKind] = useState<TimelineEvent['kind']>('event');
  const [occurredAt, setOccurredAt] = useState('');
  const [dateBasis, setDateBasis] = useState<TimelineEvent['dateBasis']>('user_entered');
  const [notes, setNotes] = useState('');

  const sortedEvents = [...events].sort((a, b) => {
    if (!a.occurredAt) return 1;
    if (!b.occurredAt) return -1;
    return new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime();
  });

  // Temporal Anomaly Detection
  const anomalies: string[] = [];
  const eventMilestone = events.find((e) => e.kind === 'event' && e.occurredAt);
  const receivedMilestone = events.find((e) => e.kind === 'received' && e.occurredAt);
  const pubMilestone = events.find((e) => e.kind === 'publication' && e.occurredAt);

  if (eventMilestone?.occurredAt) {
    const eventTime = new Date(eventMilestone.occurredAt).getTime();
    const nowTime = new Date().getTime();
    const daysDiff = (nowTime - eventTime) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      anomalies.push(
        `Potential Context-Stripping: The underlying event allegedly occurred ${Math.round(
          daysDiff / 365
        )} year(s) ago (${eventMilestone.occurredAt.substring(
          0,
          10
        )}). Check whether this is a recycled historical notice circulating out of context.`
      );
    }
  }

  if (pubMilestone?.occurredAt && receivedMilestone?.occurredAt) {
    if (new Date(receivedMilestone.occurredAt) < new Date(pubMilestone.occurredAt)) {
      anomalies.push(
        `Chronology Conflict: Message received timestamp (${receivedMilestone.occurredAt.substring(
          0,
          10
        )}) precedes the reported publication date (${pubMilestone.occurredAt.substring(0, 10)}).`
      );
    }
  }

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    await db.timelineEvents.add({
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      caseId,
      kind,
      label: label.trim(),
      occurredAt: occurredAt || undefined,
      dateBasis: occurredAt ? dateBasis : 'unknown',
      notes: notes.trim() || undefined,
    });

    setLabel('');
    setOccurredAt('');
    setNotes('');
    setShowAdd(false);
    onEventAdded?.();
  };

  return (
    <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border/50 dark:border-surface-darkBorder/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-forest-50 dark:bg-forest-900/40 text-forest-700 dark:text-forest-300">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink-primary dark:text-neutral-100">
              Context Clock & Chronology
            </h3>
            <p className="text-xs text-ink-secondary dark:text-neutral-400">
              Disentangling event dates from publication dates, receipt dates, and updates.
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-forest-50 hover:bg-forest-100 dark:bg-forest-900/60 dark:hover:bg-forest-900 text-forest-800 dark:text-forest-200 font-medium transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{showAdd ? 'Cancel' : 'Add Date Event'}</span>
        </button>
      </div>

      {/* Temporal Anomalies Alert */}
      {anomalies.length > 0 && (
        <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-1">
          <span className="text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>Temporal Anomaly Detected</span>
          </span>
          {anomalies.map((anom, idx) => (
            <p key={idx} className="text-xs text-amber-950 dark:text-amber-100 leading-relaxed">
              {anom}
            </p>
          ))}
        </div>
      )}

      {showAdd && (
        <form onSubmit={handleAddEvent} className="p-4 rounded-xl bg-surface-muted dark:bg-surface-darkMuted border border-surface-border/60 dark:border-surface-darkBorder/60 space-y-3">
          <h4 className="text-xs font-semibold text-ink-primary dark:text-neutral-200">
            Add Timeline Milestone
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-ink-secondary dark:text-neutral-400 mb-1">
                Event Description *
              </label>
              <input
                type="text"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g. Official bank KYC circular released"
                className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-forest-600"
                required
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-secondary dark:text-neutral-400 mb-1">
                Category
              </label>
              <select
                value={kind}
                onChange={(e) => setKind(e.target.value as TimelineEvent['kind'])}
                className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-forest-600"
              >
                <option value="received">Message Received</option>
                <option value="publication">Source Publication</option>
                <option value="event">Alleged Real-World Event</option>
                <option value="checked">Investigation Check Date</option>
                <option value="correction">Official Correction/Update</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-secondary dark:text-neutral-400 mb-1">
                Date (Leave blank if unknown)
              </label>
              <input
                type="date"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-forest-600"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-secondary dark:text-neutral-400 mb-1">
                Date Basis
              </label>
              <select
                value={dateBasis}
                onChange={(e) => setDateBasis(e.target.value as TimelineEvent['dateBasis'])}
                className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-forest-600"
              >
                <option value="user_entered">User Reported</option>
                <option value="source_metadata">Extracted from Source Document</option>
                <option value="provider">Provider Result</option>
                <option value="unknown">Unknown</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-forest-900 text-white text-xs font-medium hover:bg-forest-800 transition"
          >
            Save Milestone
          </button>
        </form>
      )}

      {sortedEvents.length === 0 ? (
        <p className="text-xs text-ink-muted dark:text-neutral-400 italic text-center py-4">
          No chronology milestones recorded yet. Add dates above to isolate stale rumors from current facts.
        </p>
      ) : (
        <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-forest-200 dark:before:bg-forest-800">
          {sortedEvents.map((evt) => (
            <div key={evt.id} className="relative">
              {/* Dot */}
              <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-forest-600 border-2 border-white dark:border-surface-darkCard" />
              <div className="p-3 rounded-xl bg-surface-muted dark:bg-surface-darkMuted border border-surface-border/40 dark:border-surface-darkBorder/40">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-ink-primary dark:text-neutral-100">
                    {evt.label}
                  </span>
                  <span className="text-[10px] font-mono text-forest-800 dark:text-forest-300 px-2 py-0.5 rounded bg-forest-100 dark:bg-forest-900/60 uppercase">
                    {evt.kind}
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2 text-[11px] text-ink-secondary dark:text-neutral-400">
                  <Calendar className="w-3 h-3 text-ink-muted" />
                  <span>{evt.occurredAt ? evt.occurredAt.substring(0, 10) : 'Date Unknown'}</span>
                  <span>•</span>
                  <span>Basis: {evt.dateBasis.replace('_', ' ')}</span>
                </div>
                {evt.notes && (
                  <p className="mt-1.5 text-xs text-ink-secondary dark:text-neutral-300">
                    {evt.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
