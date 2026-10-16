# Sondera — Privacy & Data Sovereignty Model

## 1. Zero-Cloud Default
Sondera is designed from the ground up on a **local-first** paradigm. The core investigative workflow does not send user-submitted messages, raw URLs, or investigator notes to any external cloud, AI provider, or backend telemetry server.

## 2. Where Data is Stored
All application state resides within the client's local browser environment:
- **Storage Engine:** IndexedDB via `Dexie.js`.
- **Database Name:** `SonderaDB`.
- **Tables:** `cases`, `claims`, `evidence`, `relations`, `findings`, `checks`, `timelineEvents`, `notes`, `reports`, `settings`, `learningProgress`, `privacyChecklist`.
- **Encryption in Transit:** N/A (data does not leave the browser).

## 3. What Leaves the Device
- **By Default:** **Nothing.** All deterministic heuristics, URL parsers, Trust Debt calculations, and Decision Receipts run locally in the browser runtime.
- **External Lookups (Optional/Future):** If an external reputation API or web search adapter is enabled in Settings, Sondera explicitly prompts for consent, discloses the provider, specifies what data is transmitted, and logs the request in the transparent Check Registry.

## 4. Local Storage Lifecycles & Limitations
Because data is saved locally in IndexedDB:
- Clearing browser cache, history, or cookies will erase local cases.
- Incognito / Private windows wipe data upon closing the window.
- Users can export a complete JSON backup at any time via the **Cases Library** or **Settings** view to preserve investigations across sessions and devices.

## 5. Share-Safe Redaction
When generating a Decision Receipt to share with colleagues or family, Sondera provides a **Share-Safe Mode**:
- Automated regex detection scans for phone numbers, email addresses, OTP codes, and financial account identifiers.
- Redacted strings are masked (e.g., `[REDACTED_PHONE]`, `[REDACTED_OTP]`) before markdown export or printing.
- *Limitation:* Automated redaction is heuristic and should be visually reviewed prior to sharing.
