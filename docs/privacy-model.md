# Sondera — Privacy & Data Sovereignty Model

## 1. Local Checks and Optional Online Research
Cases, local warning checks, and stored evidence remain in the browser. Live source research and AI chat are optional. When the user starts one, the relevant message or question and the user-provided Gemini API key are sent to Google Gemini; source research also enables Google Search grounding. Do not submit sensitive personal content to online research.

## 2. Where Data is Stored
All application state resides within the client's local browser environment:
- **Storage Engine:** IndexedDB via `Dexie.js`.
- **Database Name:** `SonderaDB`.
- **Tables:** `cases`, `claims`, `evidence`, `relations`, `findings`, `checks`, `timelineEvents`, `notes`, `reports`, `settings`, `learningProgress`, `privacyChecklist`.
- Local records are stored by the browser. Optional Gemini requests use HTTPS; message contents are transmitted to Google only after the user starts the online feature.

## 3. What Leaves the Device
- **Local:** Deterministic warning patterns, URL parsing, case storage, and report creation run in the browser.
- **Optional Online:** The user clicks “Research this message” to send the message to Gemini with Google Search enabled. Returned source links can be saved as unreviewed evidence. Questions asked in the case chat or companion are also sent to Gemini when a key is configured.
- **API Key:** The user's Gemini key is stored in browser local storage. It is not bundled in the application. Anyone with access to this browser profile may be able to inspect local storage.
- **Model Download:** Optional Hugging Face text classification downloads model files to the browser cache on first use.

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
