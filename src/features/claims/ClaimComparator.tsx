import React, { useState } from 'react';
import {
  Scale,
  ArrowRight,
  Download,
  Copy,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Calendar,
  Building,
} from 'lucide-react';

export const ClaimComparator: React.FC = () => {
  const [sourceA, setSourceA] = useState({
    title: 'Viral WhatsApp Message',
    publisher: 'Anonymous Forward',
    date: 'Undated / Yesterday',
    statement: 'Government announced free ₹5,000 monthly allowance for all citizens starting tonight. Apply before 12 AM.',
  });

  const [sourceB, setSourceB] = useState({
    title: 'Official Press Information Bureau (PIB) Fact Check',
    publisher: 'Government of India (pib.gov.in)',
    date: 'Current Month Circular',
    statement: 'Fake News Alert: No such monthly allowance scheme has been approved by the Ministry of Finance. Do not click unverified links.',
  });

  const [verdictNotes, setVerdictNotes] = useState(
    'Direct contradiction established. Source B is an authoritative government domain (.gov.in) with official press office provenance, whereas Source A lacks publication date, official circular number, and ministerial attribution.'
  );

  const [copied, setCopied] = useState(false);

  const generateDebunkMarkdown = () => {
    const lines: string[] = [];
    lines.push(`# SONDERA CLAIM COMPARISON & DEBUNK MATRIX`);
    lines.push(`Generated: ${new Date().toUTCString()}`);
    lines.push(``);
    lines.push(`| Dimension | Source A (Claim Under Review) | Source B (Authoritative Comparator) |`);
    lines.push(`|:---|:---|:---|`);
    lines.push(`| **Title** | ${sourceA.title} | ${sourceB.title} |`);
    lines.push(`| **Publisher / Provenance** | ${sourceA.publisher} | ${sourceB.publisher} |`);
    lines.push(`| **Date / Timing** | ${sourceA.date} | ${sourceB.date} |`);
    lines.push(`| **Assertion / Quote** | "${sourceA.statement}" | "${sourceB.statement}" |`);
    lines.push(``);
    lines.push(`## Comparative Evaluation`);
    lines.push(verdictNotes);
    lines.push(``);
    lines.push(`---`);
    lines.push(`*Generated via Sondera Digital Trust Workspace*`);
    return lines.join('\n');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(generateDebunkMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const md = generateDebunkMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sondera_Claim_Comparison_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded-3xl border border-surface-border dark:border-surface-darkBorder shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200">
              Evidence Triangulation
            </span>
            <span className="text-xs text-ink-muted">Dual-source comparative matrix</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-forest-900 dark:text-forest-100 flex items-center gap-2">
            <Scale className="w-6 h-6 text-forest-700 dark:text-forest-400" />
            <span>Side-by-Side Claim & Source Comparator</span>
          </h1>
          <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-1">
            Juxtapose forwarded claims against primary sources to identify discrepancies in dates, figures, and authoritativeness.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted dark:bg-surface-darkMuted text-xs font-medium text-ink-primary dark:text-neutral-200 hover:bg-neutral-100"
          >
            <span>{copied ? 'Copied' : 'Copy Matrix'}</span>
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Comparison (.md)</span>
          </button>
        </div>
      </div>

      {/* Side-by-Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Source A */}
        <div className="bg-white dark:bg-surface-darkCard rounded-3xl border border-surface-border dark:border-surface-darkBorder p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border/50 pb-3">
            <span className="text-xs font-bold uppercase text-amber-700 dark:text-amber-400 flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              <span>Source A (Claim Under Review)</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-ink-muted mb-1">Document / Message Title</label>
              <input
                type="text"
                value={sourceA.title}
                onChange={(e) => setSourceA({ ...sourceA, title: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-light dark:bg-surface-dark text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink-muted mb-1">Reported Publisher / Sender</label>
              <input
                type="text"
                value={sourceA.publisher}
                onChange={(e) => setSourceA({ ...sourceA, publisher: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-light dark:bg-surface-dark text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink-muted mb-1">Date Specified</label>
              <input
                type="text"
                value={sourceA.date}
                onChange={(e) => setSourceA({ ...sourceA, date: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-light dark:bg-surface-dark text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink-muted mb-1">Core Claim Statement</label>
              <textarea
                rows={3}
                value={sourceA.statement}
                onChange={(e) => setSourceA({ ...sourceA, statement: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-surface-border bg-surface-light dark:bg-surface-dark text-xs font-mono"
              />
            </div>
          </div>
        </div>

        {/* Source B */}
        <div className="bg-white dark:bg-surface-darkCard rounded-3xl border border-surface-border dark:border-surface-darkBorder p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-surface-border/50 pb-3">
            <span className="text-xs font-bold uppercase text-forest-700 dark:text-forest-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>Source B (Authoritative Comparator)</span>
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="block text-[11px] font-semibold text-ink-muted mb-1">Official Document Title</label>
              <input
                type="text"
                value={sourceB.title}
                onChange={(e) => setSourceB({ ...sourceB, title: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-light dark:bg-surface-dark text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink-muted mb-1">Official Publisher / Gazette</label>
              <input
                type="text"
                value={sourceB.publisher}
                onChange={(e) => setSourceB({ ...sourceB, publisher: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-light dark:bg-surface-dark text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink-muted mb-1">Official Publication Date</label>
              <input
                type="text"
                value={sourceB.date}
                onChange={(e) => setSourceB({ ...sourceB, date: e.target.value })}
                className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border bg-surface-light dark:bg-surface-dark text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-ink-muted mb-1">Official Circular Statement</label>
              <textarea
                rows={3}
                value={sourceB.statement}
                onChange={(e) => setSourceB({ ...sourceB, statement: e.target.value })}
                className="w-full p-2.5 rounded-lg border border-surface-border bg-surface-light dark:bg-surface-dark text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Synthesis & Discrepancy Analysis Box */}
      <div className="bg-white dark:bg-surface-darkCard rounded-3xl border border-surface-border dark:border-surface-darkBorder p-6 shadow-sm space-y-3">
        <h3 className="font-bold text-sm text-ink-primary dark:text-neutral-100 flex items-center gap-2">
          <FileText className="w-4 h-4 text-forest-700 dark:text-forest-400" />
          <span>Investigator Triangulation & Discrepancy Synthesis</span>
        </h3>
        <textarea
          rows={3}
          value={verdictNotes}
          onChange={(e) => setVerdictNotes(e.target.value)}
          placeholder="Document the exact reasons why Source B outweighs Source A..."
          className="w-full p-3 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100"
        />
      </div>
    </div>
  );
};
