# Sondera — Test Plan & Quality Verification

## 1. Automated Test Suite (Vitest)
Unit and regression tests are implemented in `tests/analysis-rules.test.ts`.

### Covered Test Matrix:
1. **Safe URL Parser:**
   - Misleading user-info `@` delimiter trick (e.g. `https://paypal.com@evil.com`).
   - Unencrypted HTTP transport flagging with explicit disclaimer that HTTPS does not prove honesty.
   - Script-based URL execution prevention (`javascript:`).
   - Known shortener domain detection (`bit.ly`, `tinyurl.com`).
2. **Deterministic Message Rules:**
   - Urgent time-pressure cues ("within 2 hours", "account will be blocked").
   - OTP, PIN, and credential requests flagged as high severity.
   - False positive verification on benign greeting text.
3. **Redaction Engine:**
   - PII masking on emails, international phone formats, OTP tokens, and bank account numbers.
4. **Trust Debt:**
   - Evaluation of high debt when unverified claims lack attached evidence.

## 2. Running Tests
To run all tests:
```bash
npm test
```

## 3. Manual Smoke Test Checklist
1. Open application in browser (`npm run dev`).
2. Click "Bank KYC Threat" sample scenario.
3. Click "Run Local Explainable Investigation".
4. Verify findings list displays high-priority warning for urgency and OTP requests with matched snippets.
5. In the Claims tab, add an atomic claim and link an official RBI circular evidence source.
6. Observe Trust Debt update dynamically.
7. Switch to the Decision Receipt tab; toggle "Share-Safe Mode" and verify phone/email masking.
8. Reload the browser page; confirm that all case data, evidence, notes, and milestones persist from IndexedDB.
9. Toggle between Light Mode and Dark Mode; verify accessibility and color contrast.
