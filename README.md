# Sondera

Sondera helps people assess suspicious messages, links, and online claims. It combines local warning-sign checks with optional source research, evidence review, case timelines, and shareable decision reports.

## Run locally

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Online source research runs through the deployment API and requires a server-side `GEMINI_API_KEY` environment variable.

## Deploy to Vercel

1. Import this repository into Vercel and use the default Vite build settings (`npm run build`, output directory `dist`).
2. In **Project Settings → Environment Variables**, add `GEMINI_API_KEY` for Production (and Preview if needed). Do not add it to Vite variables, source files, or the browser.
3. Redeploy after setting the variable. Vercel applies environment changes to new deployments.
4. Open a case and use **Search current sources** to check the complete research flow.

The server function at `/api/research` sends submitted text to Google Gemini with Google Search grounding. Keep a clear privacy notice in the product and avoid submitting private or sensitive content.

## Data and limitations

Cases and user-created evidence are stored in the browser with IndexedDB. Online research sends the selected case text to the configured research provider and search provider. Returned claims and sources are unreviewed until a person checks the cited pages. Local warning signs do not establish whether a message or claim is true.

Browser data can be lost if site storage is cleared. Export a case backup before changing devices or browsers.

## Project documents

- [Architecture](docs/architecture.md)
- [Privacy model](docs/privacy-model.md)
- [Threat model](docs/threat-model.md)
- [Limitations](docs/limitations.md)
- [Quality plan](docs/testing.md)
