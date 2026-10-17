# Sondera — Privacy and Data Model

## Data stored in the browser

Cases, claims, evidence, relations, findings, timelines, notes, reports, preferences, and learning progress are stored locally in the browser using IndexedDB through Dexie.js. Clearing site storage can remove these records. Export a backup before changing browsers or devices.

## Online source research

Online research is optional and starts only when a user selects **Search current sources**. The selected message or link is sent from the browser to Sondera's `/api/research` endpoint. The endpoint uses the server-side `GEMINI_API_KEY` environment variable to request a response from Google Gemini with Google Search grounding. The key is never sent to the browser or stored in browser storage. Google processes the submitted text; do not submit private or sensitive content.

Returned source links and summaries are saved locally only when the user chooses to save them. A returned link is a lead for review, not proof that a claim is true.

## Local processing

Warning-pattern checks, URL parsing, case storage, and report generation run in the browser. Their results are indicators and do not certify authenticity.

## Share-safe redaction

Decision reports can mask common personal identifiers before export or printing. Detection is heuristic; review the final report before sharing it.
