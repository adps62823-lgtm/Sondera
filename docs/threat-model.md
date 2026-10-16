# Sondera — Threat Model & Security Posture

## 1. Untrusted Input Handling
All inputs provided to Sondera (whether pasted text, URLs, notes, or imported JSON backups) are treated as **adversarially untrusted**:
- **Cross-Site Scripting (XSS):** React's native string escaping is strictly enforced. User input is never injected through `dangerouslySetInnerHTML` or `eval()`.
- **URL Execution Immunity:** URLs pasted into the intake or evidence forms are syntactically parsed via the `URL` Web API. Non-web schemes (such as `javascript:`, `data:`, `file:`, `blob:`, `vbscript:`) are neutralized and flagged as dangerous rather than executed.

## 2. Server-Side Request Forgery (SSRF) Neutralization
Many web-based scanning tools fetch remote URLs from a centralized backend server, exposing the infrastructure to SSRF, IP pivoting, and internal metadata service theft.
- Sondera executes **zero server-side fetching**.
- URLs are analyzed purely by lexical and syntactic structure (hostname, scheme, port, user-info delimiters, subdomains, punycode).
- Remote servers are never pinged or contacted during local analysis, preserving investigator safety and preventing tracking beacons.

## 3. Imported Backup Validation
When a user restores data via `Restore JSON`:
- The schema is validated before insertion into IndexedDB.
- Primary keys and relation references are verified to prevent prototype pollution or database corruption.
- All imported content is rendered as plain text strings.

## 4. Secret Leakage Prevention
- Zero third-party API keys or secret tokens are bundled in the frontend distribution.
- If future external adapters are integrated, they require server-side proxying with SSRF defenses (IP allowlisting, DNS rebinding mitigation, timeout restrictions).
