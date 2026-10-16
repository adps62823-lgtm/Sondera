# SONDERA

> **Tagline:** *Know what you know. Find what you don’t.*  
> **Event Context:** HACKCOM ’26 — Theme: **“Building a Safer Digital World”**  
> **Operating Constraint:** ₹0 budget; zero paid API dependency; 100% local-first privacy.

---

## 1. What is Sondera?

Sondera is a privacy-conscious digital investigation workspace. Rather than stamping messages with a binary, overconfident "Safe" or "Scam" verdict, Sondera structures suspicious messages, URLs, and viral claims into an explainable investigation case.

It breaks down observable indicators, transparently discloses which checks ran and which did not, computes the **Trust Debt** between circulated claims and independent proof, allows investigators to organize evidence, and outputs a durable, share-safe **Decision Receipt**.

---

## 2. Core Feature Suite

### 🔍 Investigation & Intake
- **Deterministic Heuristic Engine:** Pinpoints urgency cues, OTP requests, unusual payment methods, impersonation, prizes, and forwarding pressure with matched text snippets.
- **Safe Syntactic URL Parser:** Evaluates hostname structure, the misleading user-info `@` trick, IP address hosts, punycode IDNs, shorteners, and abnormal ports **without outbound network requests**.
- **Transparent Checks Registry:** Strictly discloses which checks executed, which were omitted, and which are unavailable.

### ⚖️ The Signature Conceptual Layer
- **Trust Debt Engine:** Dynamically calculates the explanatory gap between viral confidence and primary independent evidence.
- **What-If Scenario Lab:** Simulates hypothetical corroborations or debunk advisories in strict in-memory isolation, with optional 1-click confirmation to import into the real case.
- **Context Clock & Temporal Anomaly Detector:** Chronological milestones separating event, publication, receipt, and check dates, with automatic warnings for recycled, context-stripped historical circulars.
- **Interactive Trust Graph:** Visual node canvas connecting Cases $\rightarrow$ Findings $\rightarrow$ Claims $\rightarrow$ Evidence Items (`supports`, `contradicts`, `contextualises`, `mentions`), with an interactive node inspector drawer and accessible table fallback.
- **Missing-Proof Finder:** Verification checklist prompting users to confirm domain ownership, primary press releases, and OTP policies.

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
- **Does NOT upload user input to external AI models or cloud backends:** All analysis runs in the browser.
- **Does NOT invent fraud probabilities or confidence percentages:** Replaced with categorical, explainable indicators.

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
| Trust Debt Evaluation | **Implemented** | Explanatory gap analysis based on claims and sources |
| What-If Scenario Lab | **Implemented** | In-memory hypothetical simulations with import option |
| Context Clock & Anomaly Check | **Implemented** | Chronology milestones with temporal context-stripping alerts |
| Trust Graph | **Implemented** | Interactive visual node canvas + accessible table |
| Missing-Proof Finder | **Implemented** | Interactive verification checklist |
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
