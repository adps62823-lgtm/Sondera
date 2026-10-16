import React, { useState } from 'react';
import { HelpCircle, CheckSquare, Square, ExternalLink, HelpCircle as QuestionIcon } from 'lucide-react';
import { CaseKind } from '../../types/domain';

interface MissingProofItem {
  id: string;
  question: string;
  guidance: string;
  applicableKinds: CaseKind[];
}

const VERIFICATION_QUESTIONS: MissingProofItem[] = [
  {
    id: 'mp-primary-source',
    question: 'Is there a direct link to an official announcement or primary publisher?',
    guidance: 'Third-party social posts often distort policies. Look for the official .gov, .org, or primary company newsroom publication.',
    applicableKinds: ['message', 'claim', 'mixed'],
  },
  {
    id: 'mp-hostname-match',
    question: 'Does the actual domain hostname match the organization claiming to send it?',
    guidance: 'In a URL, look at the root domain before the first slash. For instance, "sbi.co.in.scam-verify.net" belongs to "scam-verify.net", not SBI.',
    applicableKinds: ['url', 'message', 'mixed'],
  },
  {
    id: 'mp-credentials-requested',
    question: 'Does the communication request a password, PIN, or one-time code (OTP)?',
    guidance: 'If yes, this is a near-universal indicator of credential theft. Legitimate staff will never ask for your SMS verification code.',
    applicableKinds: ['message', 'url', 'mixed'],
  },
  {
    id: 'mp-payment-unusual',
    question: 'Are payments requested via gift cards, cryptocurrency, or personal UPI IDs?',
    guidance: 'Legitimate corporate or government invoices use registered merchant payment gateways, not personal transfer handles or gift vouchers.',
    applicableKinds: ['message', 'mixed'],
  },
  {
    id: 'mp-date-and-location',
    question: 'Is there a specific effective date and geographical jurisdiction specified?',
    guidance: 'Viral rumors frequently omit dates and locations so the message can circulate indefinitely across multiple countries and years.',
    applicableKinds: ['claim', 'message'],
  },
  {
    id: 'mp-independent-confirmation',
    question: 'Have at least two distinct, non-affiliated news outlets or authorities reported this?',
    guidance: 'Five people forwarding the exact same text is 1 unverified copy, not 5 independent confirmations.',
    applicableKinds: ['claim', 'message'],
  },
];

interface MissingProofPanelProps {
  kind: CaseKind;
  onAddEvidencePrompt?: () => void;
}

export const MissingProofPanel: React.FC<MissingProofPanelProps> = ({
  kind,
  onAddEvidencePrompt,
}) => {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});

  const filtered = VERIFICATION_QUESTIONS.filter((q) =>
    q.applicableKinds.includes(kind) || q.applicableKinds.includes('mixed')
  );

  const toggleCheck = (id: string) => {
    setCompleted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const doneCount = Object.values(completed).filter(Boolean).length;

  return (
    <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border/50 dark:border-surface-darkBorder/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-forest-50 dark:bg-forest-900/40 text-forest-700 dark:text-forest-300">
            <QuestionIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink-primary dark:text-neutral-100">
              Missing-Proof Finder
            </h3>
            <p className="text-xs text-ink-secondary dark:text-neutral-400">
              Targeted verification questions to uncover missing evidence and validate claims.
            </p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-forest-100 dark:bg-forest-900/70 text-forest-800 dark:text-forest-200">
          {doneCount} of {filtered.length} checked
        </span>
      </div>

      <div className="space-y-3">
        {filtered.map((item) => {
          const isDone = Boolean(completed[item.id]);
          return (
            <div
              key={item.id}
              onClick={() => toggleCheck(item.id)}
              className={`p-3.5 rounded-xl border transition cursor-pointer select-none ${
                isDone
                  ? 'border-forest-300 bg-forest-50/50 dark:border-forest-800 dark:bg-forest-950/20'
                  : 'border-surface-border dark:border-surface-darkBorder hover:bg-neutral-50 dark:hover:bg-neutral-800/40'
              }`}
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  aria-label="Toggle question status"
                  className="mt-0.5 text-forest-700 dark:text-forest-400 focus:outline-none"
                >
                  {isDone ? (
                    <CheckSquare className="w-4 h-4 text-forest-600 dark:text-forest-400" />
                  ) : (
                    <Square className="w-4 h-4 text-ink-muted dark:text-neutral-500" />
                  )}
                </button>
                <div className="space-y-1">
                  <h4
                    className={`text-xs font-semibold ${
                      isDone
                        ? 'line-through text-ink-muted dark:text-neutral-400'
                        : 'text-ink-primary dark:text-neutral-100'
                    }`}
                  >
                    {item.question}
                  </h4>
                  <p className="text-[11px] text-ink-secondary dark:text-neutral-400 leading-relaxed">
                    {item.guidance}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {onAddEvidencePrompt && (
        <div className="pt-2 flex justify-end">
          <button
            onClick={onAddEvidencePrompt}
            className="text-xs px-3 py-1.5 rounded-lg border border-forest-600 text-forest-700 dark:text-forest-300 hover:bg-forest-50 dark:hover:bg-forest-950 transition font-medium"
          >
            + Attach Found Evidence to Case
          </button>
        </div>
      )}
    </div>
  );
};
