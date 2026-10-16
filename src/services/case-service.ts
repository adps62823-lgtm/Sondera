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

  // Auto-generate title if none provided
  const derivedTitle =
    title && title.trim()
      ? title.trim()
      : input.length > 50
      ? input.substring(0, 47).replace(/[\r\n]+/g, ' ') + '...'
      : input.replace(/[\r\n]+/g, ' ') || 'Untitled Investigation';

  const newCase: InvestigationCase = {
    id: caseId,
    title: derivedTitle,
    kind,
    status: 'open',
    originalInput: input,
    userContext: context,
    senderLabel,
    receivedDate,
    tags: [kind],
    pinned: false,
    createdAt: now,
    updatedAt: now,
    lastAnalysedAt: now,
    analysisRuleVersion: ENGINE_VERSION,
    schemaVersion: 1,
  };

  // Run initial local analysis
  const { output } = analyzeContent(input, kind, caseId, context);

  await db.transaction('rw', [db.cases, db.findings, db.checks, db.timelineEvents], async () => {
    await db.cases.add(newCase);
    if (output.findings.length > 0) {
      await db.findings.bulkAdd(output.findings);
    }
    if (output.checks.length > 0) {
      await db.checks.bulkAdd(output.checks);
    }
    // Add initial intake timeline event
    await db.timelineEvents.add({
      id: `evt-intake-${Date.now()}`,
      caseId,
      kind: 'received',
      label: 'Case content received and logged in local workspace',
      occurredAt: receivedDate || now,
      dateBasis: receivedDate ? 'user_entered' : 'unknown',
      notes: context ? `Context: ${context}` : undefined,
    });
  });

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

  await db.transaction('rw', [db.cases, db.findings, db.checks], async () => {
    await db.findings.where('caseId').equals(caseId).delete();
    await db.checks.where('caseId').equals(caseId).delete();

    if (output.findings.length > 0) {
      await db.findings.bulkAdd(output.findings);
    }
    if (output.checks.length > 0) {
      await db.checks.bulkAdd(output.checks);
    }

    await db.cases.update(caseId, {
      updatedAt: now,
      lastAnalysedAt: now,
      analysisRuleVersion: ENGINE_VERSION,
    });
  });
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
