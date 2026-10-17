import React, { useState } from 'react';
import {
  MessageSquare,
  Link2,
  FileQuestion,
  Sparkles,
  AlertCircle,
  ShieldCheck,
  ArrowRight,
  Info,
} from 'lucide-react';
import { CaseKind } from '../../types/domain';

interface IntakeFormProps {
  onSubmit: (data: {
    input: string;
    kind: CaseKind;
    title?: string;
    context?: string;
    senderLabel?: string;
    receivedDate?: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

const SAMPLE_SCENARIOS = [
  {
    label: 'Bank KYC Threat (SMS)',
    kind: 'message' as CaseKind,
    title: 'Urgent KYC Block Warning',
    context: 'SMS from unknown shortcode',
    senderLabel: 'VK-SBIBNK',
    text: 'URGENT: Your SBI bank account will be blocked today within 2 hours due to pending PAN card verification. Immediately share your OTP or update documents at http://sbi.kyc-update-portal.top to prevent total deactivation.',
  },
  {
    label: 'URL Obfuscation with "@"',
    kind: 'url' as CaseKind,
    title: 'PayPal User-Info Trap Link',
    context: 'Received via email billing receipt',
    senderLabel: 'billing-alert@support.net',
    text: 'https://paypal.com:security-check@portal-account-verify.xyz/auth',
  },
  {
    label: 'Viral Electricity Subsidy',
    kind: 'claim' as CaseKind,
    title: 'Viral ₹5000 Power Scheme',
    context: 'Forwarded in community WhatsApp group',
    senderLabel: 'Neighborhood Group',
    text: 'Government has announced instant ₹5000 energy relief allowance for all families starting tonight! Forward this to 10 family groups to unlock official application portal before midnight.',
  },
];

export const IntakeForm: React.FC<IntakeFormProps> = ({ onSubmit, isSubmitting }) => {
  const [kind, setKind] = useState<CaseKind>('message');
  const [input, setInput] = useState('');
  const [title, setTitle] = useState('');
  const [context, setContext] = useState('');
  const [senderLabel, setSenderLabel] = useState('');
  const [receivedDate, setReceivedDate] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setError('Please paste or type the message, URL, or claim you wish to investigate.');
      return;
    }
    setError(null);
    try {
      await onSubmit({
        input: input.trim(),
        kind,
        title: title.trim() || undefined,
        context: context.trim() || undefined,
        senderLabel: senderLabel.trim() || undefined,
        receivedDate: receivedDate || undefined,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create case');
    }
  };

  const loadSample = (s: typeof SAMPLE_SCENARIOS[0]) => {
    setKind(s.kind);
    setInput(s.text);
    setTitle(s.title);
    setContext(s.context);
    setSenderLabel(s.senderLabel);
    setReceivedDate(new Date().toISOString().substring(0, 10));
    setError(null);
  };

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      {/* Intro Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-forest-900 dark:text-forest-100">
          Start a New Investigation
        </h1>
        <p className="mt-2 text-sm text-ink-secondary dark:text-neutral-400 max-w-xl mx-auto">
          Paste an alarming message, link, or forwarded claim. Sondera evaluates observable indicators locally, exposes evidence gaps, and constructs an audit trail.
        </p>
      </div>

      {/* Pre-fill educational scenarios */}
      <div className="mb-6 p-3.5 bg-forest-50/70 dark:bg-forest-950/40 border border-forest-200 dark:border-forest-800 rounded-xl">
        <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-forest-800 dark:text-forest-300">
          <Sparkles className="w-4 h-4 text-forest-600 dark:text-forest-400" />
          <span>Quick Educational Test Examples (Click to test instantly):</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_SCENARIOS.map((s, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => loadSample(s)}
              className="text-xs px-3 py-1.5 rounded-lg bg-white dark:bg-forest-900 border border-forest-200 dark:border-forest-700 hover:border-forest-400 text-ink-primary dark:text-forest-100 transition shadow-sm"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-6 shadow-sm space-y-6">
        {/* Case Type Selector */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-ink-secondary dark:text-neutral-400 mb-2">
            Investigation Type
          </label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setKind('message')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition ${
                kind === 'message'
                  ? 'border-forest-600 bg-forest-50 text-forest-900 dark:bg-forest-900/40 dark:text-forest-100 font-semibold shadow-sm'
                  : 'border-surface-border dark:border-surface-darkBorder text-ink-secondary dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <MessageSquare className="w-5 h-5 text-forest-700 dark:text-forest-300" />
              <span className="text-xs">Suspicious Message</span>
            </button>

            <button
              type="button"
              onClick={() => setKind('url')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition ${
                kind === 'url'
                  ? 'border-forest-600 bg-forest-50 text-forest-900 dark:bg-forest-900/40 dark:text-forest-100 font-semibold shadow-sm'
                  : 'border-surface-border dark:border-surface-darkBorder text-ink-secondary dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <Link2 className="w-5 h-5 text-forest-700 dark:text-forest-300" />
              <span className="text-xs">Inspect URL / Link</span>
            </button>

            <button
              type="button"
              onClick={() => setKind('claim')}
              className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition ${
                kind === 'claim'
                  ? 'border-forest-600 bg-forest-50 text-forest-900 dark:bg-forest-900/40 dark:text-forest-100 font-semibold shadow-sm'
                  : 'border-surface-border dark:border-surface-darkBorder text-ink-secondary dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800'
              }`}
            >
              <FileQuestion className="w-5 h-5 text-forest-700 dark:text-forest-300" />
              <span className="text-xs">Viral Claim / Story</span>
            </button>
          </div>
        </div>

        {/* Primary Content Textarea */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-semibold text-ink-primary dark:text-neutral-200">
              {kind === 'url' ? 'Target URL String' : 'Pasted Content to Examine'} <span className="text-red-500">*</span>
            </label>
            <span className="text-[11px] text-ink-muted dark:text-neutral-400">
              {input.length} characters
            </span>
          </div>
          <textarea
            rows={kind === 'url' ? 2 : 5}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              kind === 'url'
                ? 'https://example-service.com/login?token=xyz'
                : 'Paste the SMS, WhatsApp message, email excerpt, or rumor text here...'
            }
            className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-sm text-ink-primary dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-forest-600 font-mono resize-y"
          />
        </div>

        {/* Optional Context Details (Expandable) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-surface-border/50 dark:border-surface-darkBorder/50">
          <div>
            <label className="block text-xs font-medium text-ink-secondary dark:text-neutral-300 mb-1">
              Case Title (Optional)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Courier Redelivery Alert"
              className="w-full px-3 py-2 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-secondary dark:text-neutral-300 mb-1">
              Where was this received? (Optional)
            </label>
            <input
              type="text"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="e.g. WhatsApp family group, SMS, Telegram"
              className="w-full px-3 py-2 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-secondary dark:text-neutral-300 mb-1">
              Reported Sender Name (Optional)
            </label>
            <input
              type="text"
              value={senderLabel}
              onChange={(e) => setSenderLabel(e.target.value)}
              placeholder="e.g. 'Bank Alerts', '+1 800...'"
              className="w-full px-3 py-2 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-secondary dark:text-neutral-300 mb-1">
              Date Received (Optional)
            </label>
            <input
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Privacy & Safe Evaluation Notice */}
        <div className="p-3 bg-surface-muted dark:bg-surface-darkMuted rounded-xl flex items-start gap-2.5 text-xs text-ink-secondary dark:text-neutral-400">
          <Info className="w-4 h-4 text-forest-700 dark:text-forest-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-ink-primary dark:text-neutral-200">
              Your message stays on this device unless you choose to search
            </p>
            <p>
              Basic warning checks run in your browser. Online source research sends the submitted text to our research and search providers.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-medium text-sm transition shadow-sm disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Analyzing Locally...</span>
          ) : (
            <>
              <ShieldCheck className="w-4 h-4" />
              <span>Analyze warning signs</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
