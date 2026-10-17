# Sondera — Privacy and Data Model

## Data stored in the browser

Cases, claims, evidence, relations, findings, timelines, notes, reports, preferences, and learning progress are stored locally in the browser using IndexedDB through Dexie.js. Clearing site storage can remove these records. Export a backup before changing browsers or devices.

## Online source research

Online research is optional and starts only when a user selects **Search current sources** or sends a message to Sonder. The selected text or chat conversation is sent from the browser to Sondera's `/api/research` or `/api/buddy` endpoint. These endpoints use the server-side `GROQ_API_KEY` environment variable to request analysis from Groq's `openai/gpt-oss-120b` model. They also search DuckDuckGo, Wikipedia, and GDELT news; public article metadata is read from a small allowlist of news publishers. The key is never sent to the browser or stored in browser storage. Submitted text is processed by Groq and search providers; do not submit private or sensitive content.

Returned source links and summaries are saved locally only when the user chooses to save them. A returned link is a lead for review, not proof that a claim is true.

## Local processing

Warning-pattern checks, URL parsing, case storage, and report generation run in the browser. Their results are indicators and do not certify authenticity.

## Share-safe redaction

Decision reports can mask common personal identifiers before export or printing. Detection is heuristic; review the final report before sharing it.
