import React, { useState } from 'react';
import {
  Finding,
  Claim,
  EvidenceItem,
  ClaimEvidenceRelation,
  InvestigationCase,
} from '../../types/domain';
import { calculateTrustDebt } from '../../core/trust-debt/trust-debt';
import {
  FlaskConical,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { addEvidenceItem } from '../../services/case-service';

interface WhatIfLabProps {
  caseData: InvestigationCase;
  claims: Claim[];
  evidence: EvidenceItem[];
  relations: ClaimEvidenceRelation[];
  findings: Finding[];
  onEvidenceImported?: () => void;
}

interface ScenarioOption {
  id: string;
  title: string;
  description: string;
  type: 'confirm_official' | 'verify_sender' | 'prove_imposter' | 'stale_date';
}

const PRESET_SCENARIOS: ScenarioOption[] = [
  {
    id: 'sc-official-confirm',
    title: 'Suppose the named institution officially confirms this announcement',
    description: 'Simulates attaching a verified primary source from the official newsroom supporting all claims.',
    type: 'confirm_official',
  },
  {
    id: 'sc-sender-verified',
    title: 'Suppose you independently called the official customer support line and verified the sender',
    description: 'Simulates independent phone confirmation eliminating the sender impersonation unknown.',
    type: 'verify_sender',
  },
  {
    id: 'sc-prove-imposter',
    title: 'Suppose a public fraud advisory explicitly debunks this exact message template',
    description: 'Simulates attaching an official cyber-police alert that contradicts all assertions.',
    type: 'prove_imposter',
  },
  {
    id: 'sc-stale-date',
    title: 'Suppose this circular is discovered to be from 4 years ago, stripped of its original date',
    description: 'Simulates context-stripping where an authentic past rule is circulated as starting tomorrow.',
    type: 'stale_date',
  },
];

export const WhatIfLab: React.FC<WhatIfLabProps> = ({
  caseData,
  claims,
  evidence,
  relations,
  findings,
  onEvidenceImported,
}) => {
  const [selectedScenario, setSelectedScenario] = useState<ScenarioOption | null>(null);
  const [imported, setImported] = useState(false);

  // Compute hypothetical simulation
  let simulatedDebt = calculateTrustDebt(claims, evidence, relations);
  let simulatedFindings = [...findings];
  let impactExplanation = '';

  if (selectedScenario?.type === 'confirm_official') {
    const mockEvidence: EvidenceItem[] = [
      ...evidence,
      {
        id: 'hypo-evi-1',
        caseId: caseData.id,
        type: 'official_statement',
        title: 'Hypothetical: Official Press Announcement',
        sourceBasis: 'user_entered',
        status: 'supports',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    const mockRelations: ClaimEvidenceRelation[] = claims.map((c) => ({
      id: `hypo-rel-${c.id}`,
      caseId: caseData.id,
      claimId: c.id,
      evidenceId: 'hypo-evi-1',
      relation: 'supports',
      assessedBy: 'user',
      createdAt: new Date().toISOString(),
    }));

    simulatedDebt = calculateTrustDebt(claims, mockEvidence, mockRelations);
    impactExplanation =
      'Adding direct primary backing resolves the explanatory gap. Trust Debt drops to LOW. However, if the text still requests an OTP or immediate payment, high-priority safety warnings remain active because legitimate organizations never demand OTPs.';
  } else if (selectedScenario?.type === 'prove_imposter') {
    const mockEvidence: EvidenceItem[] = [
      ...evidence,
      {
        id: 'hypo-evi-debunk',
        caseId: caseData.id,
        type: 'correction',
        title: 'Hypothetical: Official Cyber Cell Fraud Advisory',
        sourceBasis: 'user_entered',
        status: 'contradicts',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    const mockRelations: ClaimEvidenceRelation[] = claims.map((c) => ({
      id: `hypo-rel-debunk-${c.id}`,
      caseId: caseData.id,
      claimId: c.id,
      evidenceId: 'hypo-evi-debunk',
      relation: 'contradicts',
      assessedBy: 'user',
      createdAt: new Date().toISOString(),
    }));

    simulatedDebt = calculateTrustDebt(claims, mockEvidence, mockRelations);
    impactExplanation =
      'Explicit contradiction by an authoritative body converts this case into a confirmed debunk. Recommended action shifts to warning contacts and issuing an alert.';
  } else if (selectedScenario?.type === 'verify_sender') {
    impactExplanation =
      'Independent identity confirmation eliminates the spoofing unknown. Note: Even with a genuine sender, never recite two-factor codes over the phone.';
  } else if (selectedScenario?.type === 'stale_date') {
    impactExplanation =
      'Context-stripping exposed: The text may be authentic in phrasing but completely misleading in temporal application. Chronology milestones in the Context Clock resolve this ambiguity.';
  }

  const handleApplyToRealCase = async () => {
    if (!selectedScenario) return;
    if (
      window.confirm(
        'Are you sure you want to officially record this as verified evidence in your real investigation case?'
      )
    ) {
      await addEvidenceItem({
        caseId: caseData.id,
        title: `Verified: ${selectedScenario.title}`,
        type: selectedScenario.type === 'prove_imposter' ? 'correction' : 'official_statement',
        publisher: 'User Independent Verification',
        notes: `Confirmed via What-If scenario: ${selectedScenario.description}`,
        sourceBasis: 'user_entered',
        status: selectedScenario.type === 'prove_imposter' ? 'contradicts' : 'supports',
        accessedAt: new Date().toISOString(),
      });
      setImported(true);
      onEvidenceImported?.();
    }
  };

  return (
    <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-5 shadow-sm space-y-5">
      {/* Header with Strict Separation Notice */}
      <div className="border-b border-surface-border/50 dark:border-surface-darkBorder/50 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300">
            <FlaskConical className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-ink-primary dark:text-neutral-100">
                What-If Scenario Lab
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-semibold">
                Hypothetical Only
              </span>
            </div>
            <p className="text-xs text-ink-secondary dark:text-neutral-400">
              Explore how hypothetical evidence would change findings without modifying real case data.
            </p>
          </div>
        </div>

        {selectedScenario && (
          <button
            onClick={() => setSelectedScenario(null)}
            className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink-primary"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Simulation</span>
          </button>
        )}
      </div>

      {/* Safety Notice */}
      <div className="p-3 bg-purple-50/60 dark:bg-purple-950/30 rounded-xl border border-purple-200 dark:border-purple-900/60 flex items-start gap-2.5 text-xs text-purple-900 dark:text-purple-200">
        <Info className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-semibold mb-0.5">Strict Scenario Isolation</strong>
          Simulated evidence is kept strictly isolated in-memory. It will never appear in your official Decision Receipt unless you explicitly confirm importing it.
        </div>
      </div>

      {/* Scenarios Chooser */}
      <div className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-ink-muted">
          Select a Hypothetical Premise to Test:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {PRESET_SCENARIOS.map((sc) => {
            const isSelected = selectedScenario?.id === sc.id;
            return (
              <div
                key={sc.id}
                onClick={() => {
                  setSelectedScenario(sc);
                  setImported(false);
                }}
                className={`p-3.5 rounded-xl border cursor-pointer transition select-none ${
                  isSelected
                    ? 'border-purple-600 bg-purple-50 dark:bg-purple-950/50 dark:border-purple-600 font-semibold'
                    : 'border-surface-border dark:border-surface-darkBorder hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <h4 className="text-xs text-ink-primary dark:text-neutral-100">{sc.title}</h4>
                <p className="text-[11px] text-ink-secondary dark:text-neutral-400 mt-1">
                  {sc.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Simulation Result Comparison */}
      {selectedScenario && (
        <div className="p-4 rounded-xl border border-purple-300 dark:border-purple-800 bg-surface-light dark:bg-surface-dark space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-600" />
              <span>Simulated Impact: {selectedScenario.title}</span>
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-semibold">
              Simulated Level: {simulatedDebt.level.toUpperCase()}
            </span>
          </div>

          <div className="text-xs text-ink-primary dark:text-neutral-200 leading-relaxed bg-white dark:bg-surface-darkCard p-3 rounded-lg border border-surface-border/60">
            <strong>Analysis Engine Reasoning: </strong>
            {impactExplanation}
          </div>

          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-purple-200/60 dark:border-purple-900/60">
            <span className="text-[11px] text-ink-muted">
              Did you actually verify this in reality?
            </span>
            <button
              onClick={handleApplyToRealCase}
              disabled={imported}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-forest-900 hover:bg-forest-800 text-white text-xs font-medium transition disabled:opacity-50"
            >
              {imported ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Imported to Case</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>I Confirmed This — Record in Real Case</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
