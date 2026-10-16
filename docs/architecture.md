# Sondera — Architecture & Engineering Specification

## 1. High-Level System Architecture

```text
[ User Interface (React 18 + Tailwind CSS + Lucide Icons) ]
                         │
                         ▼
           [ Application / Service Layer ]
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
[ Case Service ] [ Report Generator ] [ Redaction Engine ]
        │                │                │
        └────────────────┼────────────────┘
                         ▼
        [ Domain / Pure Rule Engines ]
   ┌─────────────────────┴─────────────────────┐
   ▼                                           ▼
[ Message Rules (Offline) ]     [ Safe URL Parser (Zero-Network) ]
   └─────────────────────┬─────────────────────┘
                         ▼
         [ Persistence Layer (Dexie / IndexedDB) ]
                         │
             Local Browser Sandbox
```

## 2. Directory Structure

- `src/types/domain.ts`: Strict TypeScript interfaces for Cases, Claims, Evidence, Relations, Findings, Checks, Timeline, Notes, Reports, Settings.
- `src/core/rules/message-rules.ts`: Deterministic heuristic suite evaluating urgency cues, OTP demands, financial requests, impersonation, prizes, and threats.
- `src/core/rules/url-rules.ts`: Pure syntactic URL parser detecting user-info `@` host obfuscation, raw IP addresses, punycode IDNs, shorteners, unencrypted HTTP, and non-standard ports.
- `src/core/engine/analysis-engine.ts`: Orchestrator executing applicable rules, recording both executed and omitted checks, and generating plain-language summaries.
- `src/core/trust-debt/trust-debt.ts`: Evaluates the gap between circulated assertions and verified primary evidence.
- `src/core/redaction/redaction-engine.ts`: Scans text for emails, phone numbers, OTPs, and accounts to mask PII in share-safe exports.
- `src/services/db.ts`: Dexie.js database schema and IndexedDB store definitions.
- `src/services/case-service.ts`: Atomic case creation, cascading deletions, evidence and claim linking, and full JSON backups.
- `src/services/report-generator.ts`: Assembles Markdown Decision Receipts ready for clipboard copying, file download, or browser printing.
- `src/features/learn/judgment-gym-data.ts`: Interactive scenario curriculum.
- `src/features/privacy/privacy-navigator-data.ts`: Privacy hygiene assessment questionnaire.
