export type ISODateTime = string;

export type CaseKind = "message" | "url" | "claim" | "privacy" | "mixed";
export type CaseStatus = "open" | "reviewed" | "archived";
export type FindingSeverity = "info" | "caution" | "high";

export type CheckStatus =
  | "completed_with_findings"
  | "completed_no_findings"
  | "not_applicable"
  | "not_run"
  | "unavailable"
  | "error";

export type EvidenceRelation =
  | "supports"
  | "contradicts"
  | "contextualises"
  | "mentions"
  | "duplicate_or_derived"
  | "unassessed";

export type EvidenceStatus =
  | "unassessed"
  | "reviewed"
  | "supports"
  | "contradicts"
  | "inconclusive"
  | "outdated"
  | "unavailable";

export interface InvestigationCase {
  id: string;
  title: string;
  kind: CaseKind;
  status: CaseStatus;
  originalInput: string;
  userContext?: string;
  senderLabel?: string;
  receivedDate?: string;
  tags: string[];
  pinned: boolean;
  archivedAt?: ISODateTime;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
  lastAnalysedAt?: ISODateTime;
  analysisRuleVersion?: string;
  schemaVersion: number;
}

export interface Claim {
  id: string;
  caseId: string;
  text: string;
  origin: "user_supplied" | "extracted" | "edited";
  status: "unassessed" | "supported" | "contradicted" | "mixed" | "insufficient";
  note?: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface EvidenceItem {
  id: string;
  caseId: string;
  type: "url_source" | "quote" | "document_note" | "user_observation" | "official_statement" | "correction" | "other";
  title: string;
  url?: string;
  publisher?: string;
  author?: string;
  publishedAt?: ISODateTime;
  accessedAt?: ISODateTime;
  excerpt?: string;
  notes?: string;
  sourceBasis: "user_entered" | "local_parse" | "external_provider" | "imported";
  status: EvidenceStatus;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface ClaimEvidenceRelation {
  id: string;
  caseId: string;
  claimId: string;
  evidenceId: string;
  relation: EvidenceRelation;
  rationale?: string;
  assessedBy: "user" | "rule" | "provider";
  createdAt: ISODateTime;
}

export interface Finding {
  id: string;
  caseId: string;
  ruleId: string;
  ruleVersion: string;
  title: string;
  severity: FindingSeverity;
  matchedText?: string;
  explanation: string;
  limitation: string;
  recommendedAction?: string;
  status: "active" | "dismissed_by_user" | "resolved";
  dismissalNote?: string;
  createdAt: ISODateTime;
}

export interface CheckRecord {
  id: string;
  caseId: string;
  checkId: string;
  name: string;
  status: CheckStatus;
  startedAt: ISODateTime;
  completedAt?: ISODateTime;
  provider?: string;
  summary: string;
  errorCode?: string;
}

export interface TimelineEvent {
  id: string;
  caseId: string;
  kind: "event" | "publication" | "received" | "checked" | "correction" | "other";
  label: string;
  occurredAt?: ISODateTime;
  dateBasis: "user_entered" | "source_metadata" | "provider" | "unknown";
  notes?: string;
}

export interface CaseNote {
  id: string;
  caseId: string;
  title?: string;
  body: string;
  createdAt: ISODateTime;
  updatedAt: ISODateTime;
}

export interface ReportSnapshot {
  id: string;
  caseId: string;
  title: string;
  markdown: string;
  selectedSections: string[];
  redactionApplied: boolean;
  generatedAt: ISODateTime;
  appVersion: string;
  ruleVersion?: string;
  revision: number;
}

export interface AppSettings {
  theme: "light" | "dark" | "system";
  accentPreset: string;
  density: "comfortable" | "compact";
  textScale: "normal" | "large";
  reducedMotion: boolean;
  explanationLevel: "simple" | "detailed";
  externalLookupsEnabled: boolean;
  schemaVersion: number;
}

export interface AnalysisOutput {
  runId: string;
  startedAt: ISODateTime;
  completedAt: ISODateTime;
  engineVersion: string;
  inputType: CaseKind;
  checks: CheckRecord[];
  findings: Finding[];
  summary: string;
  limitations: string[];
  nextActions: string[];
}

export interface TrustDebtAssessment {
  level: "low" | "moderate" | "elevated" | "high";
  headline: string;
  reasons: string[];
  recommendedSteps: string[];
  metrics: {
    totalClaims: number;
    supportedClaims: number;
    unsupportedClaims: number;
    independentSourcesCount: number;
    repetitionCount: number;
  };
}

export interface RedactionSuggestion {
  id: string;
  type: "email" | "phone" | "otp" | "account" | "url_token" | "name";
  originalText: string;
  replacementText: string;
  startIndex: number;
  endIndex: number;
  accepted: boolean;
}
