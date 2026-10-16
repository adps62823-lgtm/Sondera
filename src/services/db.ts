import Dexie, { type EntityTable } from 'dexie';
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
  AppSettings,
} from '../types/domain';

export interface LearningProgressItem {
  id: string;
  lessonId: string;
  completedAt: string;
  score?: number;
}

export interface PrivacyCheckItem {
  id: string;
  questionId: string;
  status: 'yes' | 'no' | 'not_sure' | 'not_answered';
  userNotes?: string;
  updatedAt: string;
}

export class SonderaDatabase extends Dexie {
  cases!: EntityTable<InvestigationCase, 'id'>;
  claims!: EntityTable<Claim, 'id'>;
  evidence!: EntityTable<EvidenceItem, 'id'>;
  relations!: EntityTable<ClaimEvidenceRelation, 'id'>;
  findings!: EntityTable<Finding, 'id'>;
  checks!: EntityTable<CheckRecord, 'id'>;
  timelineEvents!: EntityTable<TimelineEvent, 'id'>;
  notes!: EntityTable<CaseNote, 'id'>;
  reports!: EntityTable<ReportSnapshot, 'id'>;
  settings!: EntityTable<AppSettings & { id: string }, 'id'>;
  learningProgress!: EntityTable<LearningProgressItem, 'id'>;
  privacyChecklist!: EntityTable<PrivacyCheckItem, 'id'>;

  constructor() {
    super('SonderaDB');
    this.version(1).stores({
      cases: 'id, kind, status, pinned, createdAt, updatedAt',
      claims: 'id, caseId, origin, status, createdAt',
      evidence: 'id, caseId, type, status, createdAt',
      relations: 'id, caseId, claimId, evidenceId, relation',
      findings: 'id, caseId, ruleId, severity, status, createdAt',
      checks: 'id, caseId, checkId, status',
      timelineEvents: 'id, caseId, kind, occurredAt',
      notes: 'id, caseId, createdAt, updatedAt',
      reports: 'id, caseId, generatedAt, revision',
      settings: 'id',
      learningProgress: 'id, lessonId, completedAt',
      privacyChecklist: 'id, questionId, status',
    });
  }
}

export const db = new SonderaDatabase();

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'light',
  accentPreset: 'forest',
  density: 'comfortable',
  textScale: 'normal',
  reducedMotion: false,
  explanationLevel: 'detailed',
  externalLookupsEnabled: false,
  schemaVersion: 1,
};
