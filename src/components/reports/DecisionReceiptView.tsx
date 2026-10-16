import React, { useState, useEffect } from 'react';
import {
  InvestigationCase,
  Claim,
  EvidenceItem,
  ClaimEvidenceRelation,
  Finding,
  CheckRecord,
  TimelineEvent,
  CaseNote,
  ReportSnapshot,
  RedactionSuggestion,
} from '../../types/domain';
import {
  FileText,
  Download,
  Copy,
  Printer,
  ShieldCheck,
  Eye,
  Check,
  History,
  Lock,
  SlidersHorizontal,
} from 'lucide-react';
import { generateDecisionReceiptMarkdown } from '../../services/report-generator';
import { detectRedactionSuggestions, applyRedactions } from '../../core/redaction/redaction-engine';
import { RedactionModal } from './RedactionModal';
import { db } from '../../services/db';

interface DecisionReceiptViewProps {
  caseData: InvestigationCase;
  claims: Claim[];
  evidence: EvidenceItem[];
  relations: ClaimEvidenceRelation[];
  findings: Finding[];
  checks: CheckRecord[];
  timelineEvents: TimelineEvent[];
  notes: CaseNote[];
  reports: ReportSnapshot[];
  onReportSaved?: () => void;
}

const REPORT_SECTIONS = [
  { id: 'summary', label: 'Executive Summary' },
  { id: 'content', label: 'Examined Content' },
  { id: 'checks', label: 'Checks Registry' },
  { id: 'findings', label: 'Observed Findings' },
  { id: 'debt', label: 'Trust Debt & Gaps' },
  { id: 'evidence', label: 'Evidence Register' },
  { id: 'timeline', label: 'Context Chronology' },
  { id: 'notes', label: 'Case Notes' },
  { id: 'actions', label: 'Prudent Actions' },
];

export const DecisionReceiptView: React.FC<DecisionReceiptViewProps> = ({
  caseData,
  claims,
  evidence,
  relations,
  findings,
  checks,
  timelineEvents,
  notes,
  reports,
  onReportSaved,
}) => {
  const [isRedactedMode, setIsRedactedMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [analystSummary, setAnalystSummary] = useState('');
  const [redactedText, setRedactedText] = useState(caseData.originalInput);
  const [suggestions, setSuggestions] = useState<RedactionSuggestion[]>([]);
  const [showRedactModal, setShowRedactModal] = useState(false);
  const [selectedSections, setSelectedSections] = useState<string[]>(
    REPORT_SECTIONS.map((s) => s.id)
  );

  useEffect(() => {
    const found = detectRedactionSuggestions(caseData.originalInput);
    setSuggestions(found);
    const masked = applyRedactions(caseData.originalInput, found);
    setRedactedText(masked);
  }, [caseData.originalInput]);

  const handleApplyCustomRedactions = (updated: RedactionSuggestion[]) => {
    setSuggestions(updated);
    const masked = applyRedactions(caseData.originalInput, updated);
    setRedactedText(masked);
  };

  const toggleSection = (id: string) => {
    setSelectedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const markdownContent = generateDecisionReceiptMarkdown({
    caseData,
    claims,
    evidence,
    relations,
    findings,
    checks,
    timelineEvents,
    notes,
    redactedContent: redactedText,
    isRedacted: isRedactedMode,
    analystSummary,
    selectedSections,
  });

  const handleCopy = async () => {
    await navigator.clipboard.writeText(markdownContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadMarkdown = () => {
    const blob = new Blob([markdownContent], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sondera_Receipt_${caseData.id}_${new Date().toISOString().substring(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveSnapshot = async () => {
    const snapshotId = `rep-${Date.now()}`;
    const now = new Date().toISOString();
    await db.reports.add({
      id: snapshotId,
      caseId: caseData.id,
      title: `Receipt Rev #${reports.length + 1}`,
      markdown: markdownContent,
      selectedSections,
      redactionApplied: isRedactedMode,
      generatedAt: now,
      appVersion: '2026.1.0',
      revision: reports.length + 1,
    });
    onReportSaved?.();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-base text-ink-primary dark:text-neutral-100 flex items-center gap-2">
            <FileText className="w-5 h-5 text-forest-700 dark:text-forest-400" />
            <span>Decision Receipt & Investigation Report</span>
          </h3>
          <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-0.5">
            Structured, transparent audit document explaining indicators, limitations, and actions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Redaction toggle & modal trigger */}
          <button
            onClick={() => setIsRedactedMode(!isRedactedMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              isRedactedMode
                ? 'bg-forest-50 border-forest-300 text-forest-800 dark:bg-forest-950 dark:border-forest-700 dark:text-forest-200'
                : 'border-surface-border text-ink-secondary hover:bg-neutral-50 dark:hover:bg-neutral-800'
            }`}
          >
            {isRedactedMode ? <Lock className="w-3.5 h-3.5 text-forest-600" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isRedactedMode ? 'Share-Safe Mode (PII Masked)' : 'Unredacted Original'}</span>
          </button>

          {isRedactedMode && (
            <button
              onClick={() => setShowRedactModal(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-forest-600 text-forest-700 dark:text-forest-300 hover:bg-forest-50 text-xs font-medium transition"
            >
              <span>Manage Redactions ({suggestions.filter((s) => s.accepted).length})</span>
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-muted dark:bg-surface-darkMuted border border-surface-border dark:border-surface-darkBorder text-ink-primary dark:text-neutral-200 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleDownloadMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-muted dark:bg-surface-darkMuted border border-surface-border dark:border-surface-darkBorder text-ink-primary dark:text-neutral-200 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export .md</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-900 hover:bg-forest-800 text-white text-xs font-medium transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print to PDF</span>
          </button>

          <button
            onClick={handleSaveSnapshot}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-forest-600 text-forest-700 dark:text-forest-300 hover:bg-forest-50 dark:hover:bg-forest-950 text-xs font-medium transition"
          >
            <History className="w-3.5 h-3.5" />
            <span>Save Snapshot</span>
          </button>
        </div>
      </div>

      {/* Report Section Customizer Drawer */}
      <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-4 shadow-sm space-y-2">
        <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-forest-700 dark:text-forest-400" />
          <span>Customize Included Report Sections:</span>
        </span>
        <div className="flex flex-wrap gap-2 pt-1">
          {REPORT_SECTIONS.map((sec) => {
            const isIncluded = selectedSections.includes(sec.id);
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => toggleSection(sec.id)}
                className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                  isIncluded
                    ? 'border-forest-600 bg-forest-50 dark:bg-forest-900/40 text-forest-900 dark:text-forest-200 font-medium'
                    : 'border-surface-border dark:border-surface-darkBorder text-ink-muted hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                {isIncluded ? '✓ ' : '+ '}
                {sec.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional Analyst Executive Note Input */}
      <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-4 shadow-sm">
        <label className="block text-xs font-semibold text-ink-primary dark:text-neutral-200 mb-1">
          Custom Executive Note / Investigator Assessment (Optional)
        </label>
        <input
          type="text"
          value={analystSummary}
          onChange={(e) => setAnalystSummary(e.target.value)}
          placeholder="e.g. Received by elderly relative; identified as impersonation attack before any credentials were sent."
          className="w-full px-3 py-2 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-forest-600"
        />
      </div>

      {/* Rendered Document Preview */}
      <div className="receipt-card bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-8 shadow-sm space-y-6 max-w-4xl mx-auto">
        {/* Receipt Header Badge */}
        <div className="border-b-2 border-forest-900 dark:border-forest-700 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-forest-900 dark:text-forest-100">
                SONDERA
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200 font-semibold uppercase">
                Decision Receipt
              </span>
            </div>
            <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-1">
              Case Ref: <code className="font-mono">{caseData.id}</code> • Type: {caseData.kind.toUpperCase()}
            </p>
          </div>

          <div className="text-right text-xs text-ink-muted dark:text-neutral-400">
            <div>Engine Version: <strong>v{caseData.analysisRuleVersion || '2026.1'}</strong></div>
            <div>Date: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Core Disclaimer Alert */}
        <div className="p-3.5 rounded-xl bg-forest-50 dark:bg-forest-950/40 border border-forest-200 dark:border-forest-800 text-xs text-forest-900 dark:text-forest-200 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-forest-700 dark:text-forest-300 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold mb-0.5">Decision-Support Record Only</strong>
            This receipt documents observable heuristic indicators and evidence gaps. Absence of rule matches is NOT a guarantee of safety or truth.
          </div>
        </div>

        {/* Section 1: Submitted Text */}
        {selectedSections.includes('content') && (
          <div className="space-y-1.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-ink-muted">
              1. Examined Content {isRedactedMode && <span className="text-forest-600 dark:text-forest-400">(Share-Safe Masked)</span>}
            </h4>
            <pre className="p-3.5 rounded-xl bg-surface-muted dark:bg-surface-darkMuted text-xs font-mono text-ink-primary dark:text-neutral-200 overflow-x-auto whitespace-pre-wrap border border-surface-border/50 dark:border-surface-darkBorder/50">
              {isRedactedMode ? redactedText : caseData.originalInput}
            </pre>
            {caseData.userContext && (
              <p className="text-xs text-ink-secondary dark:text-neutral-400">
                <em>Reported Context:</em> {caseData.userContext}
              </p>
            )}
          </div>
        )}

        {/* Section 2: Checks Summary Table */}
        {selectedSections.includes('checks') && (
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-ink-muted">
              2. Transparent Checks Log
            </h4>
            <div className="border border-surface-border/60 dark:border-surface-darkBorder/60 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-muted dark:bg-surface-darkMuted text-ink-muted border-b border-surface-border dark:border-surface-darkBorder">
                  <tr>
                    <th className="p-2.5 font-medium">Check Name</th>
                    <th className="p-2.5 font-medium">Execution Status</th>
                    <th className="p-2.5 font-medium">Notes / Finding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/40 dark:divide-surface-darkBorder/40">
                  {checks.map((chk) => (
                    <tr key={chk.id}>
                      <td className="p-2.5 font-medium text-ink-primary dark:text-neutral-200">{chk.name}</td>
                      <td className="p-2.5 font-mono text-[11px]">{chk.status}</td>
                      <td className="p-2.5 text-ink-secondary dark:text-neutral-300">{chk.summary}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 3: Observed Findings */}
        {selectedSections.includes('findings') && (
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-ink-muted">
              3. Observed Heuristic Findings ({findings.length})
            </h4>
            {findings.length === 0 ? (
              <p className="text-xs text-ink-muted italic">No rule triggers fired in local scan.</p>
            ) : (
              <div className="space-y-2">
                {findings.map((f, i) => (
                  <div key={f.id} className="p-3 rounded-xl border border-surface-border dark:border-surface-darkBorder text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink-primary dark:text-neutral-100">
                        3.{i + 1}. {f.title}
                      </span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-surface-muted text-ink-muted">
                        {f.severity}
                      </span>
                    </div>
                    {f.matchedText && (
                      <div className="font-mono text-[11px] text-amber-800 dark:text-amber-300">
                        Snippet: "{f.matchedText}"
                      </div>
                    )}
                    <p className="text-ink-secondary dark:text-neutral-300">{f.explanation}</p>
                    <p className="text-ink-muted italic text-[11px]">Limitation: {f.limitation}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Section 4: Recommended Actions */}
        {selectedSections.includes('actions') && (
          <div className="p-4 rounded-xl bg-forest-900 text-white space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-forest-200">
              4. Prudent Response Guidance
            </h4>
            <ul className="text-xs space-y-1 text-forest-100 list-disc list-inside">
              <li>Never disclose one-time passwords, 2FA prompts, or credentials to anyone.</li>
              <li>Do not click links or call phone numbers contained within the suspicious message.</li>
              <li>Look up the official service portal independently in a separate browser window.</li>
              <li>Share this redacted Decision Receipt with family or peers before acting.</li>
            </ul>
          </div>
        )}
      </div>

      {/* Redaction Customization Modal */}
      <RedactionModal
        isOpen={showRedactModal}
        onClose={() => setShowRedactModal(false)}
        rawText={caseData.originalInput}
        suggestions={suggestions}
        onApplySuggestions={handleApplyCustomRedactions}
      />
    </div>
  );
};
