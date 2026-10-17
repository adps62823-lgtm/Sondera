import React, { useState } from 'react';
import { ExternalLink, Globe2, LoaderCircle, Save, SearchCheck } from 'lucide-react';
import { db } from '../../services/db';
import { useAppMode } from '../../context/ModeContext';
import { readApiError, readApiJson } from '../../services/api-response';

type WebCitation = { title: string; url: string; provider?: string; snippet?: string };

interface SourceResearchPanelProps {
  caseId: string;
  content: string;
  kind: string;
  onSourcesSaved?: () => void;
}

function extractKeyClaims(text: string): string[] {
  const section = text.match(/(?:^|\n)#{0,4}\s*[*_]*Key claims[*_]*[^\n]*\n([\s\S]*?)(?=\n#{0,4}\s*[*_]*(?:What sources show|Specific safety steps|Limits)|$)/i)?.[1];
  if (!section) return [];
  return Array.from(new Set(section.split('\n')
    .map((line) => line.match(/^\s*(?:[-*•]|\d+[.)])\s+(.+)$/)?.[1]?.replace(/\*\*/g, '').trim())
    .filter((line): line is string => Boolean(line && line.length > 10)))).slice(0, 8);
}

export const SourceResearchPanel: React.FC<SourceResearchPanelProps> = ({ caseId, content, kind, onSourcesSaved }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [answer, setAnswer] = useState('');
  const [citations, setCitations] = useState<WebCitation[]>([]);
  const [saved, setSaved] = useState(false);
  const [researchAt, setResearchAt] = useState('');
  const [researchStage, setResearchStage] = useState('');
  const [activity, setActivity] = useState<Array<{ provider: string; resultCount: number }>>([]);
  const { mode } = useAppMode();

  const research = async () => {
    setLoading(true);
    setError('');
    setAnswer('');
    setCitations([]);
    setSaved(false);
    setActivity([]);
    setResearchStage('Connecting to source search…');
    try {
      const response = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, kind, mode }),
      });
      if (!response.ok) {
        throw await readApiError(response, 'Online research', mode === 'technical');
      }
      let data: { answer?: string; citations?: WebCitation[]; activity?: Array<{ provider: string; resultCount: number }> } = {};
      if (response.headers.get('content-type')?.includes('application/x-ndjson') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const processLine = (line: string) => {
          if (!line.trim()) return;
          const event = JSON.parse(line) as { type: string; provider?: string; resultCount?: number; label?: string; error?: string; answer?: string; citations?: WebCitation[]; activity?: Array<{ provider: string; resultCount: number }> };
          if (event.type === 'stage') setResearchStage(event.label || 'Research in progress…');
          if (event.type === 'provider-complete' && event.provider) {
            setActivity((current) => [...current.filter((item) => item.provider !== event.provider), { provider: event.provider!, resultCount: event.resultCount || 0 }]);
          }
          if (event.type === 'error') throw new Error(event.error || 'Research could not be completed.');
          if (event.type === 'complete') data = event;
        };
        while (true) {
          const { value, done } = await reader.read();
          buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          lines.forEach(processLine);
          if (done) break;
        }
        if (buffer.trim()) processLine(buffer);
      } else {
        data = await readApiJson<typeof data>(response, 'Online research', mode === 'technical');
      }
      const text = typeof data.answer === 'string' ? data.answer.trim() : '';
      if (!text) throw new Error('No findings were returned. Please try again.');
      setAnswer(text);
      setResearchAt(new Date().toISOString());
      setCitations(Array.isArray(data.citations) ? data.citations : []);
      if (Array.isArray(data.activity)) setActivity(data.activity);
      setResearchStage('Source comparison complete');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not complete source research.');
    } finally {
      setLoading(false);
    }
  };

  const saveSources = async () => {
    const now = new Date().toISOString();
    const claims = extractKeyClaims(answer);
    const evidenceRows = citations.map((citation) => ({
      id: `web-${caseId}-${btoa(citation.url).replace(/[^a-z0-9]/gi, '').slice(0, 18)}`,
      caseId,
      type: 'url_source' as const,
      title: citation.title,
      url: citation.url,
      publisher: (() => { try { return new URL(citation.url).hostname; } catch { return 'Web source'; } })(),
      sourceBasis: 'external_provider' as const,
      status: 'unassessed' as const,
      notes: 'Found during online research. Review its relevance and relationship to each claim.',
      accessedAt: now,
      createdAt: now,
      updatedAt: now,
    }));
    const sourceList = citations.map((citation) => `- [${citation.title}](${citation.url})`).join('\n');
    await db.transaction('rw', [db.evidence, db.claims, db.notes], async () => {
      await db.evidence.bulkPut(evidenceRows);
      await db.claims.bulkPut(claims.map((text, index) => ({
        id: `web-claim-${caseId}-${Date.parse(researchAt) || Date.now()}-${index}`,
        caseId,
        text,
        origin: 'extracted' as const,
        status: 'unassessed' as const,
        note: 'Extracted during online research; compare with the saved sources.',
        createdAt: now,
        updatedAt: now,
      })));
      await db.notes.add({
        id: `web-note-${caseId}-${Date.parse(researchAt) || Date.now()}`,
        caseId,
        title: `Online research (${new Date(researchAt || now).toLocaleDateString()})`,
        body: `${answer}\n\n### Sources\n${sourceList || '- No source links were returned.'}\n\n*Research findings and sources are unreviewed. Check the cited pages before relying on them.*`,
        createdAt: now,
        updatedAt: now,
      });
    });
    setSaved(true);
    onSourcesSaved?.();
  };

  return (
    <section className="rounded-2xl border-2 border-forest-300 dark:border-forest-700 bg-white dark:bg-surface-darkCard p-5 sm:p-6 shadow-sm space-y-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl bg-forest-100 dark:bg-forest-900/60 p-2 text-forest-800 dark:text-forest-200"><Globe2 className="w-5 h-5" /></div>
        <div className="flex-1">
          <h2 className="text-lg font-bold text-ink-primary dark:text-neutral-100">Check claims against current sources</h2>
          <p className="text-sm text-ink-secondary dark:text-neutral-300 mt-1">Review what current sources say, then decide whether they support the claims.</p>
        </div>
      </div>
      <p className="rounded-lg bg-blue-50 dark:bg-blue-950/30 px-3 py-2 text-xs text-blue-950 dark:text-blue-100">When you search, this {kind === 'url' ? 'link' : 'message'} is sent to our research service and a search provider. Avoid submitting private or sensitive information.</p>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={research} disabled={loading} className="inline-flex items-center gap-2 rounded-xl bg-forest-900 hover:bg-forest-800 text-white px-4 py-2.5 text-sm font-semibold disabled:opacity-60">
          {loading ? <LoaderCircle className="w-4 h-4 animate-spin" /> : <SearchCheck className="w-4 h-4" />}
          {loading ? 'Searching current sources…' : 'Search current sources'}
        </button>
      </div>
      {loading && <div className="rounded-xl border border-forest-200 dark:border-forest-800 bg-forest-50/70 dark:bg-forest-950/20 p-3 space-y-2" aria-live="polite">
        <div className="flex items-center gap-2 text-sm font-semibold text-forest-900 dark:text-forest-100"><LoaderCircle className="w-4 h-4 animate-spin" />{researchStage || 'Research in progress…'}</div>
        <p className="text-xs text-ink-secondary dark:text-neutral-300">Searching Google, DuckDuckGo, Wikipedia, and current news, then comparing returned sources with the submitted content.</p>
        {activity.length > 0 && <div className="flex flex-wrap gap-1.5">{activity.map((item) => <span key={item.provider} className="rounded-full bg-white dark:bg-surface-darkCard px-2 py-1 text-[10px]">{item.provider}: {item.resultCount} found</span>)}</div>}
      </div>}
      {error && <p role="alert" className="rounded-lg bg-red-50 dark:bg-red-950/40 p-3 text-sm text-red-800 dark:text-red-200">{error}</p>}
      {answer && <div className="space-y-3 border-t border-surface-border dark:border-surface-darkBorder pt-4">
        <div className="whitespace-pre-wrap text-sm leading-relaxed text-ink-primary dark:text-neutral-100">{answer}</div>
        <details className="rounded-xl border border-surface-border dark:border-surface-darkBorder bg-surface-muted/60 dark:bg-surface-darkMuted p-3">
          <summary className="cursor-pointer text-xs font-semibold">How this check ran</summary>
          <p className="mt-2 text-xs text-ink-secondary dark:text-neutral-300">{mode === 'simple' ? 'Sondera searched several sources. Gemini compared those results with the message; these links are leads for you to review.' : `Output mode: ${mode}. Google Gemini 2.5 Flash synthesized the response with Google Search grounding after the independent searches. Result counts come from each provider and may include duplicates.`}</p>
          <ul className="mt-2 space-y-1 text-xs">{activity.map((item) => <li key={item.provider} className="flex justify-between gap-3"><span>{item.provider}</span><span>{item.resultCount} result{item.resultCount === 1 ? '' : 's'}</span></li>)}</ul>
        </details>
        {citations.length > 0 ? <div className="rounded-xl bg-surface-muted dark:bg-surface-darkMuted p-3 space-y-2">
          <h3 className="text-xs font-bold text-ink-primary dark:text-neutral-100">Sources to review</h3>
          <ul className="space-y-2">{citations.map((citation) => <li key={citation.url}>
            <a href={citation.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1 text-xs text-blue-700 dark:text-blue-300 underline break-all"><ExternalLink className="w-3 h-3 shrink-0 mt-0.5" />{citation.title}</a>
            <div className="ml-4 text-[10px] text-ink-muted">{citation.provider || new URL(citation.url).hostname}{citation.snippet ? ` · ${citation.snippet}` : ''}</div>
          </li>)}</ul>
          <div className="flex items-center gap-2 pt-1">
            <button type="button" onClick={saveSources} disabled={saved} className="inline-flex items-center gap-1 rounded-lg border border-forest-600 px-3 py-1.5 text-xs font-semibold text-forest-800 dark:text-forest-200 disabled:opacity-50"><Save className="w-3 h-3" /> Save to case</button>
            {saved && <span className="text-xs text-forest-800 dark:text-forest-200">Saved for review.</span>}
          </div>
        </div> : <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 p-3 text-xs text-amber-900 dark:text-amber-100 space-y-2"><p>No source links were returned. Treat these findings as unverified.</p><button type="button" onClick={saveSources} disabled={saved} className="inline-flex items-center gap-1 rounded-lg border border-forest-600 px-3 py-1.5 text-xs font-semibold text-forest-800 dark:text-forest-200 disabled:opacity-50"><Save className="w-3 h-3" /> Save to case</button>{saved && <span className="ml-2">Saved for review.</span>}</div>}
      </div>}
    </section>
  );
};
