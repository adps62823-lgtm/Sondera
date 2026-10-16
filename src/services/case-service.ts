import { db } from './db';
import {
  InvestigationCase,
  CaseKind,
  Claim,
  EvidenceItem,
  ClaimEvidenceRelation,
  Finding,
  CheckRecord,
  TimelineEvent,
  CaseNote,
  ReportSnapshot,
} from '../types/domain';
import { analyzeContent, ENGINE_VERSION } from '../core/engine/analysis-engine';
import { runAutomatedAuthenticityAnalysis } from '../core/engine/auto-authenticity-engine';

export async function createCase(
  input: string,
  kind: CaseKind,
  title?: string,
  context?: string,
  senderLabel?: string,
  receivedDate?: string
): Promise<string> {
  const caseId = `case-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  // Run deterministic analysis and automated fact-checking intelligence
  const { output } = analyzeContent(input, kind, caseId, context);
  const autoAuth = runAutomatedAuthenticityAnalysis(input, kind, caseId, context);

  // Auto-generate title if none provided
  const derivedTitle =
    title && title.trim()
      ? title.trim()
      : autoAuth.threatTitle
      ? autoAuth.threatTitle
      : input.length > 50
      ? input.substring(0, 47).replace(/[\r\n]+/g, ' ') + '...'
      : input.replace(/[\r\n]+/g, ' ') || 'Untitled Investigation';

  const tags = Array.from(new Set([kind, autoAuth.detectedThreatCategory, autoAuth.overallVerdict]));

  const newCase: InvestigationCase = {
    id: caseId,
    title: derivedTitle,
    kind,
    status: 'open',
    originalInput: input,
    userContext: context,
    senderLabel,
    receivedDate,
    tags,
    pinned: false,
    createdAt: now,
    updatedAt: now,
    lastAnalysedAt: now,
    analysisRuleVersion: ENGINE_VERSION,
    schemaVersion: 1,
  };

  await db.transaction(
    'rw',
    [
      db.cases,
      db.claims,
      db.evidence,
      db.relations,
      db.findings,
      db.checks,
      db.timelineEvents,
      db.notes,
    ],
    async () => {
      await db.cases.add(newCase);
      if (output.findings.length > 0) {
        await db.findings.bulkAdd(output.findings);
      }
      if (output.checks.length > 0) {
        await db.checks.bulkAdd(output.checks);
      }

      // Automatically store extracted claims
      if (autoAuth.claims.length > 0) {
        await db.claims.bulkAdd(autoAuth.claims);
      }

      // Automatically store authoritative regulatory evidence
      if (autoAuth.evidence.length > 0) {
        await db.evidence.bulkAdd(autoAuth.evidence);
      }

      // Automatically store relational mapping (supports / refutes)
      if (autoAuth.relations.length > 0) {
        await db.relations.bulkAdd(autoAuth.relations);
      }

      // Add timeline manipulation events
      if (autoAuth.timelineEvents.length > 0) {
        await db.timelineEvents.bulkAdd(autoAuth.timelineEvents);
      } else {
        await db.timelineEvents.add({
          id: `evt-intake-${Date.now()}`,
          caseId,
          kind: 'received',
          label: 'Case content received and logged in local workspace',
          occurredAt: receivedDate || now,
          dateBasis: receivedDate ? 'user_entered' : 'unknown',
          notes: context ? `Context: ${context}` : undefined,
        });
      }

      // Store automated AI debrief note
      await db.notes.add({
        id: `note-ai-${Date.now()}`,
        caseId,
        title: 'Automated Authenticity Assessment',
        body: `### 🤖 Automated Authenticity Assessment\n\n**Verdict:** ${autoAuth.verdictLabel} (Authenticity Score: ${autoAuth.authenticityScore}/100)\n\n**Executive Summary:**\n${autoAuth.aiExplanation.summary}\n\n**Psychological Triggers Exploited:**\n${autoAuth.aiExplanation.psychologicalTriggers.map((t) => `- ${t}`).join('\n')}\n\n**Critical Omissions Identified:**\n${autoAuth.aiExplanation.whatIsMissing.map((m) => `- ${m}`).join('\n')}\n\n**Official vs Received Comparison:**\n${autoAuth.aiExplanation.authenticStandardComparison.map((c) => `- **${c.aspect}:** Standard: *${c.officialStandard}* | Received: *${c.whatAttackerDid}*`).join('\n')}`,
        createdAt: now,
        updatedAt: now,
      });
    }
  );

  return caseId;
}

export async function getCaseDetails(caseId: string) {
  const [
    caseData,
    claims,
    evidence,
    relations,
    findings,
    checks,
    timelineEvents,
    notes,
    reports,
  ] = await Promise.all([
    db.cases.get(caseId),
    db.claims.where('caseId').equals(caseId).toArray(),
    db.evidence.where('caseId').equals(caseId).toArray(),
    db.relations.where('caseId').equals(caseId).toArray(),
    db.findings.where('caseId').equals(caseId).toArray(),
    db.checks.where('caseId').equals(caseId).toArray(),
    db.timelineEvents.where('caseId').equals(caseId).toArray(),
    db.notes.where('caseId').equals(caseId).toArray(),
    db.reports.where('caseId').equals(caseId).toArray(),
  ]);

  return {
    caseData,
    claims,
    evidence,
    relations,
    findings,
    checks,
    timelineEvents,
    notes,
    reports,
  };
}

export async function deleteCaseCascade(caseId: string) {
  await db.transaction(
    'rw',
    [
      db.cases,
      db.claims,
      db.evidence,
      db.relations,
      db.findings,
      db.checks,
      db.timelineEvents,
      db.notes,
      db.reports,
    ],
    async () => {
      await db.cases.delete(caseId);
      await db.claims.where('caseId').equals(caseId).delete();
      await db.evidence.where('caseId').equals(caseId).delete();
      await db.relations.where('caseId').equals(caseId).delete();
      await db.findings.where('caseId').equals(caseId).delete();
      await db.checks.where('caseId').equals(caseId).delete();
      await db.timelineEvents.where('caseId').equals(caseId).delete();
      await db.notes.where('caseId').equals(caseId).delete();
      await db.reports.where('caseId').equals(caseId).delete();
    }
  );
}

export async function reanalyzeCase(caseId: string) {
  const c = await db.cases.get(caseId);
  if (!c) return;

  const now = new Date().toISOString();
  const { output } = analyzeContent(c.originalInput, c.kind, caseId, c.userContext);
  const autoAuth = runAutomatedAuthenticityAnalysis(c.originalInput, c.kind, caseId, c.userContext);

  const existingClaims = await db.claims.where('caseId').equals(caseId).count();

  await db.transaction(
    'rw',
    [db.cases, db.findings, db.checks, db.claims, db.evidence, db.relations, db.timelineEvents, db.notes],
    async () => {
      await db.findings.where('caseId').equals(caseId).delete();
      await db.checks.where('caseId').equals(caseId).delete();

      if (output.findings.length > 0) {
        await db.findings.bulkAdd(output.findings);
      }
      if (output.checks.length > 0) {
        await db.checks.bulkAdd(output.checks);
      }

      // If no claims existed yet, populate them
      if (existingClaims === 0) {
        if (autoAuth.claims.length > 0) await db.claims.bulkAdd(autoAuth.claims);
        if (autoAuth.evidence.length > 0) await db.evidence.bulkAdd(autoAuth.evidence);
        if (autoAuth.relations.length > 0) await db.relations.bulkAdd(autoAuth.relations);
        if (autoAuth.timelineEvents.length > 0) await db.timelineEvents.bulkAdd(autoAuth.timelineEvents);
      }

      await db.cases.update(caseId, {
        updatedAt: now,
        lastAnalysedAt: now,
        analysisRuleVersion: ENGINE_VERSION,
      });
    }
  );
}

export async function addEvidenceItem(item: Omit<EvidenceItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `evi-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const fullItem: EvidenceItem = {
    ...item,
    id,
    createdAt: now,
    updatedAt: now,
  };

  await db.evidence.add(fullItem);
  await db.cases.update(item.caseId, { updatedAt: now });
  return id;
}

export async function addClaimItem(item: Omit<Claim, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
  const id = `clm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  const fullItem: Claim = {
    ...item,
    id,
    createdAt: now,
    updatedAt: now,
  };

  await db.claims.add(fullItem);
  await db.cases.update(item.caseId, { updatedAt: now });
  return id;
}

export async function linkClaimAndEvidence(
  caseId: string,
  claimId: string,
  evidenceId: string,
  relation: ClaimEvidenceRelation['relation'],
  rationale?: string
) {
  const id = `rel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();
  await db.relations.add({
    id,
    caseId,
    claimId,
    evidenceId,
    relation,
    rationale,
    assessedBy: 'user',
    createdAt: now,
  });
  await db.cases.update(caseId, { updatedAt: now });
}

export async function exportAllDataJson(): Promise<string> {
  const [cases, claims, evidence, relations, findings, checks, timelineEvents, notes, reports] =
    await Promise.all([
      db.cases.toArray(),
      db.claims.toArray(),
      db.evidence.toArray(),
      db.relations.toArray(),
      db.findings.toArray(),
      db.checks.toArray(),
      db.timelineEvents.toArray(),
      db.notes.toArray(),
      db.reports.toArray(),
    ]);

  const payload = {
    exportVersion: '1.0.0',
    exportedAt: new Date().toISOString(),
    generator: 'Sondera Digital Trust Platform',
    data: {
      cases,
      claims,
      evidence,
      relations,
      findings,
      checks,
      timelineEvents,
      notes,
      reports,
    },
  };

  return JSON.stringify(payload, null, 2);
}
