import React, { useState, useEffect, useRef } from 'react';
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
} from '../../types/domain';
import {
  getCaseDetails,
  reanalyzeCase,
  deleteCaseCascade,
} from '../../services/case-service';
import { calculateTrustDebt } from '../../core/trust-debt/trust-debt';
import { SaveIndicator, SaveStatus } from '../layout/SaveIndicator';
import { FindingsList } from './FindingsList';
import { ChecksOverview } from './ChecksOverview';
import { TrustDebtPanel } from './TrustDebtPanel';
import { MissingProofPanel } from './MissingProofPanel';
import { ContextClockView } from './ContextClockView';
import { TrustGraphView } from './TrustGraphView';
import { WhatIfLab } from './WhatIfLab';
import { EvidenceManager } from '../evidence/EvidenceManager';
import { CaseNotes } from '../notes/CaseNotes';
import { DecisionReceiptView } from '../reports/DecisionReceiptView';
import { db } from '../../services/db';
import {
  ShieldAlert,
  Clock,
  BookOpen,
  Network,
  FileEdit,
  FileText,
  RotateCw,
  Trash2,
  ArrowLeft,
  FlaskConical,
  Copy,
  Archive,
  ArchiveRestore,
  Tag as TagIcon,
  Plus,
} from 'lucide-react';

interface CaseDetailViewProps {
  caseId: string;
  onBackToCases: () => void;
}

export const CaseDetailView: React.FC<CaseDetailViewProps> = ({ caseId, onBackToCases }) => {
  const [details, setDetails] = useState<{
    caseData?: InvestigationCase;
    claims: Claim[];
    evidence: EvidenceItem[];
    relations: ClaimEvidenceRelation[];
    findings: Finding[];
    checks: CheckRecord[];
    timelineEvents: TimelineEvent[];
    notes: CaseNote[];
    reports: ReportSnapshot[];
  } | null>(null);

  const [activeTab, setActiveTab] = useState<
    'overview' | 'evidence' | 'timeline' | 'graph' | 'what_if' | 'notes' | 'receipt'
  >('overview');
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [editableTitle, setEditableTitle] = useState('');
  const [newTagInput, setNewTagInput] = useState('');
  const [showAddTag, setShowAddTag] = useState(false);
  const titleDebounceTimer = useRef<number | null>(null);

  const loadCase = async () => {
    const data = await getCaseDetails(caseId);
    setDetails(data);
    if (data.caseData) {
      setEditableTitle(data.caseData.title);
    }
  };

  useEffect(() => {
    loadCase();
  }, [caseId]);

  if (!details || !details.caseData) {
    return (
      <div className="max-w-7xl mx-auto py-12 px-4 text-center">
        <p className="text-sm text-ink-muted">Loading case data from IndexedDB...</p>
      </div>
    );
  }

  const { caseData, claims, evidence, relations, findings, checks, timelineEvents, notes, reports } =
    details;
  const trustDebt = calculateTrustDebt(claims, evidence, relations);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setEditableTitle(newTitle);
    setSaveStatus('saving');

    if (titleDebounceTimer.current) {
      window.clearTimeout(titleDebounceTimer.current);
    }

    titleDebounceTimer.current = window.setTimeout(async () => {
      try {
        await db.cases.update(caseId, {
          title: newTitle.trim() || 'Untitled Investigation',
          updatedAt: new Date().toISOString(),
        });
        setSaveStatus('saved');
      } catch {
        setSaveStatus('error');
      }
    }, 600);
  };

  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagInput.trim()) return;
    const tag = newTagInput.trim().toLowerCase();
    const updatedTags = Array.from(new Set([...caseData.tags, tag]));
    await db.cases.update(caseId, { tags: updatedTags, updatedAt: new Date().toISOString() });
    setNewTagInput('');
    setShowAddTag(false);
    loadCase();
  };

  const handleRemoveTag = async (tagToRemove: string) => {
    const updatedTags = caseData.tags.filter((t) => t !== tagToRemove);
    await db.cases.update(caseId, { tags: updatedTags, updatedAt: new Date().toISOString() });
    loadCase();
  };

  const handleReanalyze = async () => {
    setIsReanalyzing(true);
    await reanalyzeCase(caseId);
    await loadCase();
    setIsReanalyzing(false);
  };

  const handleDuplicateCase = async () => {
    const newCaseId = `case-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();

    await db.transaction('rw', [db.cases, db.claims, db.evidence, db.relations, db.findings, db.checks], async () => {
      await db.cases.add({
        ...caseData,
        id: newCaseId,
        title: `${caseData.title} (Copy)`,
        createdAt: now,
        updatedAt: now,
      });
      // Copy claims
      for (const clm of claims) {
        await db.claims.add({
          ...clm,
          id: `clm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          caseId: newCaseId,
          createdAt: now,
        });
      }
      // Copy findings
      for (const f of findings) {
        await db.findings.add({
          ...f,
          id: `fnd-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          caseId: newCaseId,
          createdAt: now,
        });
      }
    });

    alert('Case duplicated as a new independent investigation!');
    onBackToCases();
  };

  const handleToggleArchive = async () => {
    const isArchived = Boolean(caseData.archivedAt);
    const now = new Date().toISOString();
    await db.cases.update(caseId, {
      archivedAt: isArchived ? undefined : now,
      status: isArchived ? 'open' : 'archived',
      updatedAt: now,
    });
    loadCase();
  };

  const handleDeleteCase = async () => {
    if (window.confirm('Are you sure you want to delete this case and its local evidence records?')) {
      await deleteCaseCascade(caseId);
      onBackToCases();
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Top Header & Editable Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-surface-darkCard p-6 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-sm">
        <div className="flex-1 mr-4">
          <button
            onClick={onBackToCases}
            className="flex items-center gap-1 text-xs text-forest-700 dark:text-forest-400 hover:underline mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Case Library</span>
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200 font-semibold">
              {caseData.kind}
            </span>
            <span className="text-xs text-ink-muted dark:text-neutral-500 font-mono">
              ID: {caseData.id}
            </span>
            {caseData.archivedAt && (
              <span className="text-[10px] px-2 py-0.5 rounded bg-amber-100 text-amber-800 font-semibold uppercase">
                Archived
              </span>
            )}
            <SaveIndicator status={saveStatus} lastSavedAt={caseData.updatedAt} />
          </div>

          {/* In-place Editable Case Title */}
          <input
            type="text"
            value={editableTitle}
            onChange={handleTitleChange}
            placeholder="Investigation Title..."
            className="text-xl sm:text-2xl font-bold text-ink-primary dark:text-neutral-100 tracking-tight bg-transparent border-b border-transparent hover:border-surface-border focus:border-forest-600 focus:outline-none w-full"
          />

          {caseData.senderLabel && (
            <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-1">
              Reported Sender: <strong>{caseData.senderLabel}</strong>
              {caseData.userContext && ` • Context: ${caseData.userContext}`}
            </p>
          )}

          {/* Tags */}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <TagIcon className="w-3 h-3 text-ink-muted" />
            {caseData.tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-surface-muted text-ink-secondary dark:text-neutral-300"
              >
                #{t}
                <button
                  onClick={() => handleRemoveTag(t)}
                  className="hover:text-red-500 text-ink-muted ml-0.5"
                >
                  ×
                </button>
              </span>
            ))}
            {showAddTag ? (
              <form onSubmit={handleAddTag} className="inline-flex items-center gap-1">
                <input
                  type="text"
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  placeholder="tag..."
                  className="text-[10px] px-1.5 py-0.5 rounded border border-surface-border bg-surface-light dark:bg-surface-dark text-ink-primary focus:outline-none"
                  autoFocus
                />
                <button type="submit" className="text-[10px] text-forest-700 font-bold">
                  Add
                </button>
              </form>
            ) : (
              <button
                onClick={() => setShowAddTag(true)}
                className="text-[10px] text-forest-700 dark:text-forest-400 hover:underline font-medium"
              >
                + Tag
              </button>
            )}
          </div>
        </div>

        {/* Top Action Tools */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleReanalyze}
            disabled={isReanalyzing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-border dark:border-surface-darkBorder text-ink-secondary dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium transition"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin' : ''}`} />
            <span>Re-run Heuristics</span>
          </button>

          <button
            onClick={handleDuplicateCase}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-border dark:border-surface-darkBorder text-ink-secondary dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium transition"
            title="Duplicate case into an independent copy"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicate</span>
          </button>

          <button
            onClick={handleToggleArchive}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-border dark:border-surface-darkBorder text-ink-secondary dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-xs font-medium transition"
            title={caseData.archivedAt ? 'Restore from Archive' : 'Archive Case'}
          >
            {caseData.archivedAt ? (
              <>
                <ArchiveRestore className="w-3.5 h-3.5 text-forest-600" />
                <span>Restore</span>
              </>
            ) : (
              <>
                <Archive className="w-3.5 h-3.5" />
                <span>Archive</span>
              </>
            )}
          </button>

          <button
            onClick={() => setActiveTab('receipt')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-medium transition"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Decision Receipt</span>
          </button>

          <button
            onClick={handleDeleteCase}
            className="p-2 rounded-xl text-ink-muted hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
            title="Delete this case"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex overflow-x-auto border-b border-surface-border dark:border-surface-darkBorder gap-1 text-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-forest-600 text-forest-800 dark:text-forest-200'
              : 'border-transparent text-ink-secondary dark:text-neutral-400 hover:text-ink-primary'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Findings & Overview</span>
          {findings.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200">
              {findings.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('evidence')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'evidence'
              ? 'border-forest-600 text-forest-800 dark:text-forest-200'
              : 'border-transparent text-ink-secondary dark:text-neutral-400 hover:text-ink-primary'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Claims & Evidence ({evidence.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('timeline')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'timeline'
              ? 'border-forest-600 text-forest-800 dark:text-forest-200'
              : 'border-transparent text-ink-secondary dark:text-neutral-400 hover:text-ink-primary'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Context Clock ({timelineEvents.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('graph')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'graph'
              ? 'border-forest-600 text-forest-800 dark:text-forest-200'
              : 'border-transparent text-ink-secondary dark:text-neutral-400 hover:text-ink-primary'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Trust Graph</span>
        </button>

        <button
          onClick={() => setActiveTab('what_if')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'what_if'
              ? 'border-purple-600 text-purple-800 dark:text-purple-200 font-bold'
              : 'border-transparent text-ink-secondary dark:text-neutral-400 hover:text-ink-primary'
          }`}
        >
          <FlaskConical className="w-4 h-4 text-purple-600" />
          <span>What-If Lab</span>
        </button>

        <button
          onClick={() => setActiveTab('notes')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'notes'
              ? 'border-forest-600 text-forest-800 dark:text-forest-200'
              : 'border-transparent text-ink-secondary dark:text-neutral-400 hover:text-ink-primary'
          }`}
        >
          <FileEdit className="w-4 h-4" />
          <span>Notes ({notes.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('receipt')}
          className={`flex items-center gap-1.5 px-4 py-2.5 font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'receipt'
              ? 'border-forest-600 text-forest-800 dark:text-forest-200'
              : 'border-transparent text-ink-secondary dark:text-neutral-400 hover:text-ink-primary'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Decision Receipt & Report</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <TrustDebtPanel
            assessment={trustDebt}
            onOpenMissingProof={() => setActiveTab('evidence')}
          />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="font-bold text-sm text-ink-primary dark:text-neutral-100 mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-forest-700 dark:text-forest-400" />
                  <span>Explainable Heuristic Findings ({findings.length})</span>
                </h3>
                <FindingsList findings={findings} />
              </div>

              <MissingProofPanel
                kind={caseData.kind}
                onAddEvidencePrompt={() => setActiveTab('evidence')}
              />
            </div>

            <div className="space-y-6">
              <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-5 shadow-sm space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                  Examined Input
                </span>
                <pre className="p-3 rounded-xl bg-surface-muted dark:bg-surface-darkMuted text-xs font-mono text-ink-primary dark:text-neutral-200 whitespace-pre-wrap overflow-x-auto max-h-48 border border-surface-border/50 dark:border-surface-darkBorder/50">
                  {caseData.originalInput}
                </pre>
              </div>

              <ChecksOverview checks={checks} />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'evidence' && (
        <EvidenceManager
          caseId={caseId}
          claims={claims}
          evidence={evidence}
          relations={relations}
          onDataChanged={loadCase}
        />
      )}

      {activeTab === 'timeline' && (
        <ContextClockView
          caseId={caseId}
          events={timelineEvents}
          onEventAdded={loadCase}
        />
      )}

      {activeTab === 'graph' && (
        <TrustGraphView
          caseData={caseData}
          claims={claims}
          evidence={evidence}
          relations={relations}
          findings={findings}
        />
      )}

      {activeTab === 'what_if' && (
        <WhatIfLab
          caseData={caseData}
          claims={claims}
          evidence={evidence}
          relations={relations}
          findings={findings}
          onEvidenceImported={loadCase}
        />
      )}

      {activeTab === 'notes' && (
        <CaseNotes
          caseId={caseId}
          notes={notes}
          onNotesUpdated={loadCase}
          onSaveStatusChange={setSaveStatus}
        />
      )}

      {activeTab === 'receipt' && (
        <DecisionReceiptView
          caseData={caseData}
          claims={claims}
          evidence={evidence}
          relations={relations}
          findings={findings}
          checks={checks}
          timelineEvents={timelineEvents}
          notes={notes}
          reports={reports}
          onReportSaved={loadCase}
        />
      )}
    </div>
  );
};
