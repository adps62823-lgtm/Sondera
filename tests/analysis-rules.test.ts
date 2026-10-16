import { describe, it, expect } from 'vitest';
import { parseUrlSafely, runUrlRules } from '../src/core/rules/url-rules';
import { runMessageRules } from '../src/core/rules/message-rules';
import { detectRedactionSuggestions, applyRedactions } from '../src/core/redaction/redaction-engine';
import { calculateTrustDebt } from '../src/core/trust-debt/trust-debt';
import { THREAT_ENTRIES } from '../src/features/threat-intel/ThreatEncyclopedia';
import { JUDGMENT_GYM_LESSONS } from '../src/features/learn/judgment-gym-data';
import { Claim, EvidenceItem, ClaimEvidenceRelation } from '../src/types/domain';

describe('Safe URL Parser & Heuristics', () => {
  it('detects misleading user-info @ trick and identifies actual host', () => {
    const parsed = parseUrlSafely('https://secure.paypal.com@verify-account-gate.com/login');
    expect(parsed.isValid).toBe(true);
    expect(parsed.hostname).toBe('verify-account-gate.com');
    expect(parsed.hasUserInfo).toBe(true);

    const findings = runUrlRules(parsed, 'test-case-1');
    const userinfoFinding = findings.find((f) => f.ruleId === 'url.misleading_userinfo_delimiter');
    expect(userinfoFinding).toBeDefined();
    expect(userinfoFinding?.severity).toBe('high');
  });

  it('detects unencrypted HTTP scheme without claiming HTTPS means honest', () => {
    const parsed = parseUrlSafely('http://example.com/login');
    expect(parsed.scheme).toBe('http');

    const findings = runUrlRules(parsed, 'test-case-2');
    const httpFinding = findings.find((f) => f.ruleId === 'url.unencrypted_http');
    expect(httpFinding).toBeDefined();
    expect(httpFinding?.limitation).toContain('HTTPS does NOT mean a site is honest');
  });

  it('blocks dangerous non-web schemes (javascript:)', () => {
    const parsed = parseUrlSafely('javascript:alert(1)');
    expect(parsed.isValid).toBe(false);
    expect(parsed.error).toContain('Potentially dangerous non-web scheme');
  });

  it('detects known URL shorteners', () => {
    const parsed = parseUrlSafely('https://bit.ly/3xSample');
    expect(parsed.isShortener).toBe(true);
    const findings = runUrlRules(parsed, 'test-case-3');
    expect(findings.some((f) => f.ruleId === 'url.link_shortener_detected')).toBe(true);
  });
});

describe('Deterministic Message Rules', () => {
  it('flags urgent time-pressure cues', () => {
    const text = 'Your account will be blocked today within 2 hours unless you update documents.';
    const findings = runMessageRules(text, 'test-case-4');
    expect(findings.some((f) => f.ruleId === 'msg.urgent_time_pressure')).toBe(true);
  });

  it('flags one-time code and OTP requests as high severity', () => {
    const text = 'Please share your one-time password or OTP with the officer immediately.';
    const findings = runMessageRules(text, 'test-case-5');
    const otpFinding = findings.find((f) => f.ruleId === 'msg.requests_credentials_otp');
    expect(otpFinding).toBeDefined();
    expect(otpFinding?.severity).toBe('high');
  });

  it('does not produce false positives on benign greeting text', () => {
    const text = 'Hello Mom, hope you are having a wonderful afternoon. See you at dinner tonight.';
    const findings = runMessageRules(text, 'test-case-6');
    expect(findings.length).toBe(0);
  });
});

describe('Redaction Engine', () => {
  it('masks sensitive phone numbers and emails in share-safe mode', () => {
    const input = 'Call me at +1 555-019-2834 or email john.doe@bankalert.com with code 984210.';
    const suggestions = detectRedactionSuggestions(input);
    expect(suggestions.length).toBeGreaterThanOrEqual(3);

    const redacted = applyRedactions(input, suggestions);
    expect(redacted).not.toContain('john.doe@bankalert.com');
    expect(redacted).not.toContain('555-019-2834');
    expect(redacted).not.toContain('984210');
    expect(redacted).toContain('[REDACTED_EMAIL]');
    expect(redacted).toContain('[REDACTED_PHONE]');
    expect(redacted).toContain('[REDACTED_CODE]');
  });
});

describe('Trust Debt Evaluation', () => {
  it('evaluates high trust debt when claims exist without independent evidence', () => {
    const claims: Claim[] = [
      {
        id: 'c1',
        caseId: 'test',
        text: 'Government subsidy of 5000 is given today',
        origin: 'user_supplied',
        status: 'unassessed',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    const evidence: EvidenceItem[] = [];
    const relations: ClaimEvidenceRelation[] = [];

    const debt = calculateTrustDebt(claims, evidence, relations);
    expect(debt.level).toBe('high');
    expect(debt.reasons.length).toBeGreaterThan(0);
  });
});

describe('Threat Encyclopedia & Judgment Gym Integrity', () => {
  it('contains comprehensive threat entries with defense checklists', () => {
    expect(THREAT_ENTRIES.length).toBeGreaterThanOrEqual(6);
    for (const t of THREAT_ENTRIES) {
      expect(t.redFlags.length).toBeGreaterThan(0);
      expect(t.safeAction).toBeDefined();
    }
  });

  it('contains 8 comprehensive interactive learning scenarios in Judgment Gym', () => {
    expect(JUDGMENT_GYM_LESSONS.length).toBe(8);
    for (const lesson of JUDGMENT_GYM_LESSONS) {
      expect(lesson.options.some((o) => o.isBest)).toBe(true);
      expect(lesson.practicalTakeaway).toBeDefined();
    }
  });
});
