import { AnalysisOutput, CheckRecord, Finding, CaseKind } from '../../types/domain';
import { runMessageRules, MESSAGE_RULES } from '../rules/message-rules';
import { parseUrlSafely, runUrlRules, ParsedUrlDetails } from '../rules/url-rules';

export const ENGINE_VERSION = "2026.1.0-local";

export function analyzeContent(
  input: string,
  kind: CaseKind,
  caseId: string,
  userContext?: string
): { output: AnalysisOutput; parsedUrl?: ParsedUrlDetails } {
  const startedAt = new Date().toISOString();
  const runId = `run-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const checks: CheckRecord[] = [];
  const findings: Finding[] = [];
  let parsedUrl: ParsedUrlDetails | undefined = undefined;

  const isUrlCheckNeeded = kind === "url" || (kind === "mixed" && /https?:\/\//i.test(input));
  const isMessageCheckNeeded = kind === "message" || kind === "claim" || kind === "mixed";

  // 1. Run Message Rules
  if (isMessageCheckNeeded) {
    const msgFindings = runMessageRules(input, caseId, userContext);
    findings.push(...msgFindings);

    checks.push({
      id: `chk-msg-heuristics-${runId}`,
      caseId,
      checkId: "msg_heuristics_engine",
      name: "Deterministic Message Heuristic Suite",
      status: msgFindings.length > 0 ? "completed_with_findings" : "completed_no_findings",
      startedAt,
      completedAt: new Date().toISOString(),
      provider: "Local Heuristic Engine (Offline)",
      summary: msgFindings.length > 0
        ? `Evaluated ${MESSAGE_RULES.length} message patterns: detected ${msgFindings.length} indicator(s).`
        : `Evaluated ${MESSAGE_RULES.length} message patterns: no configured warning patterns detected.`,
    });
  } else {
    checks.push({
      id: `chk-msg-heuristics-${runId}`,
      caseId,
      checkId: "msg_heuristics_engine",
      name: "Deterministic Message Heuristic Suite",
      status: "not_applicable",
      startedAt,
      completedAt: new Date().toISOString(),
      summary: "Skipped: input designated as pure URL inspection.",
    });
  }

  // 2. Run URL Rules
  if (isUrlCheckNeeded) {
    parsedUrl = parseUrlSafely(input);
    const urlFindings = runUrlRules(parsedUrl, caseId);
    findings.push(...urlFindings);

    checks.push({
      id: `chk-url-syntax-${runId}`,
      caseId,
      checkId: "url_safe_syntax_parser",
      name: "Safe Syntactic URL Inspection (No Fetch)",
      status: urlFindings.length > 0 ? "completed_with_findings" : "completed_no_findings",
      startedAt,
      completedAt: new Date().toISOString(),
      provider: "Local Syntactic Parser (Zero-Network)",
      summary: parsedUrl.isValid
        ? `Parsed hostname '${parsedUrl.hostname}' and structure safely without opening connection.`
        : `Syntax check flagged invalid structure: ${parsedUrl.error}`,
    });
  } else {
    checks.push({
      id: `chk-url-syntax-${runId}`,
      caseId,
      checkId: "url_safe_syntax_parser",
      name: "Safe Syntactic URL Inspection (No Fetch)",
      status: "not_applicable",
      startedAt,
      completedAt: new Date().toISOString(),
      summary: "Skipped: no URL input specified for standalone URL parsing.",
    });
  }

  // 3. Document Checks NOT run or external dependencies (Honesty Guarantee)
  checks.push({
    id: `chk-ext-reputation-${runId}`,
    caseId,
    checkId: "external_domain_reputation",
    name: "External Threat-Intelligence & Domain Reputation Lookup",
    status: "not_run",
    startedAt,
    summary: "Not performed: external network lookups are disabled by default to prevent leaking submitted URLs or queries to third parties.",
  });

  checks.push({
    id: `chk-sender-identity-${runId}`,
    caseId,
    checkId: "sender_identity_cryptographic_verification",
    name: "Sender Cryptographic & Telecom Identity Verification",
    status: "unavailable",
    startedAt,
    summary: "Unavailable: raw text inspection cannot cryptographically authenticate SMS sender IDs, telecom headers, or forged display names.",
  });

  // Calculate Plain-language summary
  let summary = "";
  if (findings.length === 0) {
    summary = "No configured local warning patterns were detected in the supplied text. IMPORTANT: This does not establish that the message or destination is safe. Scams and subtle deceptions often use polite or novel wording that escapes static rule sets.";
  } else {
    const highCount = findings.filter(f => f.severity === "high").length;
    const cautionCount = findings.filter(f => f.severity === "caution").length;
    summary = `Identified ${findings.length} notable indicator(s) (${highCount} high-priority warning(s), ${cautionCount} caution item(s)). These observations warrant independent verification prior to taking any action or sharing credentials/payment.`;
  }

  const limitations = [
    "Analyzes observable textual and syntactic patterns only without contacting the sender or the remote server.",
    "A clean scan does not guarantee safety; absence of detection is not proof of authenticity.",
    "HTTPS encryption protects data in transit but does not attest to the moral legitimacy of a domain owner.",
    "External third-party domain reputation lookups were not executed for this case."
  ];

  const nextActions = [
    "Do not click unsolicited links or disclose passwords, PINs, or one-time verification codes.",
    "If an organization is mentioned, independently look up their official website or phone number—never use numbers provided in the message.",
    "Add corroborating evidence or known source URLs to this case before taking action.",
    "Consult family, a peer, or authorized IT support if money or account access is being solicited."
  ];

  const completedAt = new Date().toISOString();

  return {
    output: {
      runId,
      startedAt,
      completedAt,
      engineVersion: ENGINE_VERSION,
      inputType: kind,
      checks,
      findings,
      summary,
      limitations,
      nextActions,
    },
    parsedUrl,
  };
}
