import {
  InvestigationCase,
  Claim,
  EvidenceItem,
  ClaimEvidenceRelation,
  Finding,
  CheckRecord,
  TimelineEvent,
  CaseNote,
} from '../types/domain';
import { calculateTrustDebt } from '../core/trust-debt/trust-debt';

export interface GenerateReportOptions {
  caseData: InvestigationCase;
  claims: Claim[];
  evidence: EvidenceItem[];
  relations: ClaimEvidenceRelation[];
  findings: Finding[];
  checks: CheckRecord[];
  timelineEvents: TimelineEvent[];
  notes: CaseNote[];
  redactedContent?: string;
  isRedacted: boolean;
  analystSummary?: string;
  selectedSections?: string[];
}

export function generateDecisionReceiptMarkdown(options: GenerateReportOptions): string {
  const {
    caseData,
    claims,
    evidence,
    relations,
    findings,
    checks,
    timelineEvents,
    notes,
    redactedContent,
    isRedacted,
    analystSummary,
    selectedSections = [
      'summary',
      'content',
      'checks',
      'findings',
      'debt',
      'evidence',
      'timeline',
      'notes',
      'actions',
    ],
  } = options;

  const trustDebt = calculateTrustDebt(claims, evidence, relations);
  const now = new Date().toUTCString();

  const lines: string[] = [];

  // Header & Metadata
  lines.push(`# SONDERA DECISION RECEIPT`);
  lines.push(`**Official Case Audit & Trust Evaluation Document**`);
  lines.push(``);
  lines.push(`> [!NOTE]`);
  lines.push(`> **Core Safety Principle:** This document records observable textual and syntactic indicators evaluated by local deterministic rules. A clean scan does not guarantee safety. Sondera does not provide legal advice or guaranteed threat elimination.`);
  lines.push(``);
  lines.push(`| Case Identifier | Case Type | Created At | Assessment Date | Rule Engine | Redacted Mode |`);
  lines.push(`|:---|:---|:---|:---|:---|:---|`);
  lines.push(
    `| \`${caseData.id}\` | ${caseData.kind.toUpperCase()} | ${caseData.createdAt.substring(0, 10)} | ${now} | \`${caseData.analysisRuleVersion || '2026.1'}\` | ${isRedacted ? 'YES (PII Masked)' : 'NO'} |`
  );
  lines.push(``);

  // 1. Executive Summary
  if (selectedSections.includes('summary')) {
    lines.push(`## 1. Executive Summary & Assessment`);
    if (analystSummary && analystSummary.trim()) {
      lines.push(analystSummary);
    } else {
      const highCount = findings.filter((f) => f.severity === 'high').length;
      const cautionCount = findings.filter((f) => f.severity === 'caution').length;
      if (findings.length === 0) {
        lines.push(
          `Local analysis completed with **no configured warning patterns detected**. However, absence of automated indicators is not proof of authenticity or legitimacy.`
        );
      } else {
        lines.push(
          `Local inspection flagged **${findings.length} notable indicator(s)** including ${highCount} high-priority warning(s) and ${cautionCount} caution item(s). Exercise heightened skepticism before taking any instructed action.`
        );
      }
    }
    lines.push(``);
  }

  // 2. Submitted Content (or Redacted)
  if (selectedSections.includes('content')) {
    lines.push(`## 2. Submitted Content for Review`);
    lines.push(`\`\`\``);
    lines.push(isRedacted && redactedContent ? redactedContent : caseData.originalInput);
    lines.push(`\`\`\``);
    if (caseData.userContext) {
      lines.push(`*Reported Receipt Context:* ${caseData.userContext}`);
    }
    lines.push(``);
  }

  // 3. Checks Executed vs Not Executed
  if (selectedSections.includes('checks')) {
    lines.push(`## 3. Scope of Checks Executed & Omitted`);
    lines.push(`*Honest disclosure of what ran and what was deliberately skipped or unavailable:*`);
    lines.push(``);
    lines.push(`| Check Name | Status | Provider / Methodology | Summary |`);
    lines.push(`|:---|:---|:---|:---|`);
    for (const chk of checks) {
      const statusLabel =
        chk.status === 'completed_with_findings'
          ? '⚠️ Completed (Findings)'
          : chk.status === 'completed_no_findings'
          ? '✅ Completed (Clean)'
          : chk.status === 'not_run'
          ? '⚪ Not Run'
          : chk.status === 'unavailable'
          ? '❌ Unavailable'
          : chk.status;
      lines.push(
        `| **${chk.name}** | \`${statusLabel}\` | ${chk.provider || 'Internal'} | ${chk.summary} |`
      );
    }
    lines.push(``);
  }

  // 4. Observed Indicators & Explanations
  if (selectedSections.includes('findings')) {
    lines.push(`## 4. Observed Indicators & Findings`);
    if (findings.length === 0) {
      lines.push(`*No heuristic pattern matches triggered.*`);
    } else {
      for (const [idx, f] of findings.entries()) {
        const icon = f.severity === 'high' ? '🚨 HIGH PRIORITY' : f.severity === 'caution' ? '⚠️ CAUTION' : 'ℹ️ INFORMATIONAL';
        lines.push(`### 4.${idx + 1}. [${icon}] ${f.title}`);
        if (f.matchedText) {
          lines.push(`- **Triggering Snippet:** \`${f.matchedText}\``);
        }
        lines.push(`- **Why it matters:** ${f.explanation}`);
        lines.push(`- **Inherent Limitation:** ${f.limitation}`);
        if (f.recommendedAction) {
          lines.push(`- **Recommended Response:** ${f.recommendedAction}`);
        }
        lines.push(``);
      }
    }
  }

  // 5. Trust Debt & Evidence Gaps
  if (selectedSections.includes('debt')) {
    lines.push(`## 5. Evidence coverage and gaps`);
    lines.push(`- **Assessment Level:** **${trustDebt.level.toUpperCase()}**`);
    lines.push(`- **Headline:** ${trustDebt.headline}`);
    if (trustDebt.reasons.length > 0) {
      lines.push(`- **Explanatory Conditions:**`);
      for (const r of trustDebt.reasons) {
        lines.push(`  - ${r}`);
      }
    }
    if (trustDebt.recommendedSteps.length > 0) {
      lines.push(`- **Steps to Close Evidence Gap:**`);
      for (const s of trustDebt.recommendedSteps) {
        lines.push(`  - ${s}`);
      }
    }
    lines.push(``);
  }

  // 6. Evidence Register
  if (selectedSections.includes('evidence')) {
    lines.push(`## 6. Recorded Evidence Register`);
    if (evidence.length === 0) {
      lines.push(`*No external evidence items or primary source documents have been attached to this case.*`);
    } else {
      lines.push(`| Title | Type | Source Basis | Status | URL / Excerpt |`);
      lines.push(`|:---|:---|:---|:---|:---|`);
      for (const e of evidence) {
        lines.push(
          `| **${e.title}** | \`${e.type}\` | \`${e.sourceBasis}\` | \`${e.status}\` | ${e.url ? `[Link](${e.url})` : e.excerpt ? e.excerpt.substring(0, 40) + '...' : '-'} |`
        );
      }
    }
    lines.push(``);
  }

  // 7. Timeline & Chronology (Context Clock)
  if (selectedSections.includes('timeline')) {
    lines.push(`## 7. Timeline`);
    if (timelineEvents.length === 0) {
      lines.push(`*No dated events recorded.*`);
    } else {
      for (const evt of timelineEvents) {
        lines.push(
          `- **${evt.occurredAt ? evt.occurredAt.substring(0, 10) : 'Date Unknown'}** [${evt.kind.toUpperCase()}]: ${evt.label} *(Basis: ${evt.dateBasis})*`
        );
      }
    }
    lines.push(``);
  }

  // 8. Notes
  if (selectedSections.includes('notes') && notes.length > 0) {
    lines.push(`## 8. Case Notes & Analyst Log`);
    for (const n of notes) {
      lines.push(`- ${n.body}`);
    }
    lines.push(``);
  }

  // 9. Mandatory Next Steps & Disclaimer
  if (selectedSections.includes('actions')) {
    lines.push(`## 9. Recommended Prudent Next Steps`);
    lines.push(`1. **Do not use message contacts:** Never call numbers, visit links, or reply directly to the sender.`);
    lines.push(`2. **Verify via independent channels:** Open a browser, search for the official organization portal manually, or call their published public support line.`);
    lines.push(`3. **Never disclose verification codes:** Legitimate institutions will NEVER request an SMS OTP or authenticator PIN over chat or phone.`);
    lines.push(`4. **Report if compromised:** If credentials or money were already provided, contact your financial institution immediately through official card hotline numbers.`);
    lines.push(``);
  }

  lines.push(`---`);
  lines.push(`*Receipt generated by Sondera v${caseData.analysisRuleVersion || '1.0'} | Document Timestamp: ${now}*`);

  return lines.join('\n');
}
