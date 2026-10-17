# SONDERA

> **Tagline:** *Know what you know. Find what you don’t.*  
> **Event Context:** HACKCOM ’26 — Theme: **“Building a Safer Digital World”**  
> **Operating Constraint:** ₹0 budget; local checks work without a key; optional online research uses a free-tier API key.

---

## 1. What is Sondera?

Sondera helps people check suspicious messages, links, and viral claims. It starts with local warning-sign checks, then can search the live web and compare the claim with cited pages so the user can see what is supported, contradicted, or still unknown.

It explains local warning signs, searches current web sources when asked, displays returned source links, and keeps the research in a reviewable case.

---

## 2. Core Feature Suite

### 🔍 Investigation & Intake
- **Local Warning Checks:** Pinpoints urgency cues, OTP requests, unusual payment methods, impersonation, prizes, and forwarding pressure with matched text snippets. These signals do not verify whether a claim is true.
- **Web Research (Gemini + Google Search):** Optional, user-started research compares the submitted content with live sources and displays the returned links. Source links are saved as unreviewed until a person checks them. Requires a free Google AI Studio API key.
- **Safe Syntactic URL Parser:** Evaluates hostname structure, the misleading user-info `@` trick, IP address hosts, punycode IDNs, shorteners, and abnormal ports **without outbound network requests**.
- **Transparent Checks Registry:** Strictly discloses which checks executed, which were omitted, and which are unavailable.

### Case Tools
- **Evidence Coverage:** Shows whether claims and reviewed sources have been connected.
- **What-If Scenario Lab:** Simulates hypothetical corroborations or debunk advisories in strict in-memory isolation, with optional 1-click confirmation to import into the real case.
- **Timeline:** Records event, publication, receipt, and check dates; flags conflicts between entered dates.
- **Evidence Map:** Connects cases, claims, warning signs, and source links, with an accessible table view.

### 🚨 Emergency & Threat Defense Suite
- **Emergency Help ("I Clicked or Shared"):** Step-by-step incident response playbook for money transfers, OTP disclosures, entered passwords, and remote app installations, featuring a one-click **Formal Incident Report Generator** for banks and the 1930 Cyber Helpline.
- **Threat Anatomy & Scam Encyclopedia:** Searchable offline field guide covering 10 modern digital threat vectors (Digital Arrest scams, Work-from-Home Telegram task pyramids, Electricity cutoff threats, UPI QR reverse scams, SIM swap fraud, AI voice cloning).
- **Deep URL & UPI QR Payload Inspector:** Interactive anatomical breakdown of web addresses, UPI intent strings (`upi://pay`), and a Unicode homoglyph lookalike comparator.
- **Claim & Source Comparator:** Side-by-side triangulation matrix comparing claims against official gazettes, newsrooms, and PIB fact checks.

### 🛡️ Privacy, Education & Case Operations
- **Decision Receipts & Share-Safe Redaction:** Formatted Markdown audits and Print-to-PDF layouts with an interactive PII masking modal (emails, phones, OTPs, accounts).
- **Judgment Gym:** 8 interactive scenario-based lessons with instant feedback and progress tracking.
- **Privacy Navigator:** 8-dimension digital hygiene self-assessment with exportable Markdown audit reports.
- **Local-First Persistence:** IndexedDB via `Dexie.js` with debounced autosave, in-place title editing, tags, archiving, case duplication, and full JSON backup/restore.

---

## 3. What Sondera Does NOT Do
- **Does NOT guarantee safety:** A clean scan means no static rule matched; it does not prove authenticity.
- **Does NOT treat HTTPS as proof of legitimacy:** Anyone can acquire free SSL certificates.
- **Does NOT treat repetition as independent confirmation:** 10 forwards are treated as 1 unverified copy.
- **Local checks stay on-device.** If the user chooses web research or AI chat, the relevant message or question is sent to Google Gemini; web research also uses Google Search. The API key is stored in browser local storage. Do not submit sensitive personal content.
- The optional local text model downloads model files from Hugging Face on first use.
- Local warning checks do not certify authenticity. AI summaries and search results can be wrong; inspect the cited pages.

---

## 4. Tech Stack

- **Framework:** React 18 with TypeScript (strict mode)
- **Build Tool:** Vite 6
- **Styling:** Tailwind CSS with custom editorial brand tokens
- **Local Persistence:** IndexedDB via Dexie.js
- **Testing:** Vitest
- **Icons:** Lucide React

---

## 5. Prerequisites & Getting Started

### Installation & Run
```bash
cd sondera
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

### Running Tests
```bash
npm test
```

### Production Build
```bash
npm run build
npm run preview
```

---

## 6. Implementation Status Matrix

| Feature | Status | Notes |
|:---|:---|:---|
| Local Heuristic Message Engine | **Implemented** | Urgency, OTPs, fees, impersonation, prizes, secrecy |
| Safe Offline URL Parser | **Implemented** | User-info `@` trick, IP host, punycode, shorteners, ports |
| Transparent Check Registry | **Implemented** | Honest disclosure of completed vs omitted checks |
| Case Management & Autosave | **Implemented** | IndexedDB with debounced saves, tags, and duplication |
| Source-backed web research | **Implemented** | Optional Gemini 2.5 Flash with Google Search; returns a summary and source URLs |
| Evidence Coverage | **Implemented** | Shows whether claims and reviewed sources are connected |
| What-If Scenario Lab | **Implemented** | In-memory hypothetical simulations with import option |
| Timeline | **Implemented** | Records dates and flags entered chronology conflicts |
| Trust Graph | **Implemented** | Interactive visual node canvas + accessible table |
| Decision Receipt Generator | **Implemented** | Markdown export, print-to-PDF, section selector |
| Share-Safe Redaction Engine | **Implemented** | Interactive modal for regex masking of PII |
| Emergency Response Wizard | **Implemented** | Incident containment playbook & bank/police report generator |
| Threat Encyclopedia | **Implemented** | 10 modern threat anatomies with red flags & safe actions |
| URL & UPI QR Deep Inspector | **Implemented** | Anatomical breakdown, UPI intent decoder, homoglyph tool |
| Claim & Source Comparator | **Implemented** | Side-by-side triangulation matrix with markdown export |
| Judgment Gym | **Implemented** | 8 interactive scenarios with progress tracking |
| Privacy Navigator | **Implemented** | 8-dimension self-assessment with markdown report export |
| JSON Backup & Restore | **Implemented** | Client-side export and validated import |
| Dark / Light Theme & Density | **Implemented** | Persistent theme switcher, density, and font scaling |

---

## 7. Documentation Index
- [Architecture & Design](docs/architecture.md)
- [Privacy & Data Model](docs/privacy-model.md)
- [Threat Model & Security](docs/threat-model.md)
- [Limitations & Honesty Disclosures](docs/limitations.md)
- [Testing & Quality Plan](docs/testing.md)
