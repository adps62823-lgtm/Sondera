export interface SearchSource {
  title: string;
  url: string;
  provider: 'DuckDuckGo' | 'Wikipedia' | 'GDELT news';
  snippet?: string;
}

function decodeHtml(value: string): string {
  return value.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n)))
    .replace(/&#x([\da-f]+);/gi, (_, n: string) => String.fromCodePoint(parseInt(n, 16)));
}

function plainText(html: string): string {
  return decodeHtml(html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim());
}

function queryFor(content: string): string {
  return content.replace(/https?:\/\/([^/\s?#]+)[^\s]*/gi, '$1').replace(/<[^>]*>/g, ' ')
    .replace(/[^\p{L}\p{N}\s'"-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 240);
}

async function searchDuckDuckGo(query: string): Promise<SearchSource[]> {
  const url = new URL('https://html.duckduckgo.com/html/');
  url.searchParams.set('q', query);
  const response = await fetch(url, { headers: { 'User-Agent': 'Sondera/1.0 (public safety research)', Accept: 'text/html' }, signal: AbortSignal.timeout(7_000) });
  if (!response.ok) return [];
  const html = await response.text();
  const results: SearchSource[] = [];
  const anchors = html.matchAll(/<a\b(?=[^>]*class="[^"]*result__a[^"]*")([^>]*)>([\s\S]*?)<\/a>/gi);
  for (const match of anchors) {
    const href = match[1].match(/href="([^"]+)"/i)?.[1];
    if (!href) continue;
    let destination: URL;
    try {
      const parsed = new URL(decodeHtml(href), 'https://html.duckduckgo.com');
      const redirected = parsed.searchParams.get('uddg');
      destination = new URL(redirected || parsed.toString());
    } catch { continue; }
    if (!['http:', 'https:'].includes(destination.protocol) || destination.hostname.endsWith('duckduckgo.com')) continue;
    const title = plainText(match[2]);
    const around = html.slice((match.index || 0) + match[0].length, (match.index || 0) + match[0].length + 1200);
    const snippetHtml = around.match(/class="[^"]*result__snippet[^"]*"[^>]*>([\s\S]*?)<\/[^>]+>/i)?.[1];
    results.push({ title, url: destination.toString(), provider: 'DuckDuckGo', snippet: snippetHtml ? plainText(snippetHtml).slice(0, 400) : undefined });
    if (results.length === 5) break;
  }
  return results;
}

async function searchWikipedia(query: string): Promise<SearchSource[]> {
  const url = new URL('https://en.wikipedia.org/w/api.php');
  for (const [key, value] of Object.entries({ action: 'query', list: 'search', srsearch: query, srlimit: '4', format: 'json', origin: '*' })) url.searchParams.set(key, value);
  const response = await fetch(url, { headers: { 'User-Agent': 'Sondera/1.0 (source research)' }, signal: AbortSignal.timeout(7_000) });
  if (!response.ok) return [];
  const data = await response.json() as { query?: { search?: Array<{ title?: string; snippet?: string }> } };
  return (data.query?.search || []).flatMap((item) => item.title ? [{
    title: item.title,
    url: `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, '_'))}`,
    provider: 'Wikipedia' as const,
    snippet: item.snippet ? plainText(item.snippet).slice(0, 400) : undefined,
  }] : []);
}

async function searchNews(query: string): Promise<SearchSource[]> {
  const url = new URL('https://api.gdeltproject.org/api/v2/doc/doc');
  for (const [key, value] of Object.entries({ query, mode: 'ArtList', format: 'json', maxrecords: '5', timespan: '1y', sort: 'datedesc' })) url.searchParams.set(key, value);
  const response = await fetch(url, { signal: AbortSignal.timeout(8_000) });
  if (!response.ok) return [];
  const data = await response.json() as { articles?: Array<{ title?: string; url?: string; domain?: string; seendate?: string }> };
  const allowedNewsDomains = [
    'apnews.com', 'reuters.com', 'bbc.com', 'bbc.co.uk', 'theguardian.com', 'npr.org', 'pbs.org',
    'aljazeera.com', 'thehindu.com', 'indianexpress.com', 'hindustantimes.com', 'ndtv.com', 'thewire.in',
  ];
  const articles = (data.articles || []).flatMap((item) => {
    if (!item.title || !item.url || !/^https:\/\//i.test(item.url)) return [];
    try {
      const parsed = new URL(item.url);
      if (!allowedNewsDomains.some((domain) => parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`))) return [];
      return [{ title: item.title, url: parsed.toString(), provider: 'GDELT news' as const, snippet: [item.domain, item.seendate].filter(Boolean).join(' · ') }];
    } catch { return []; }
  }).slice(0, 3);
  return Promise.all(articles.map(async (article) => {
    try {
      const response = await fetch(article.url, { redirect: 'manual', headers: { 'User-Agent': 'Sondera/1.0 (safety research)', Accept: 'text/html' }, signal: AbortSignal.timeout(5_000) });
      if (!response.ok || !response.headers.get('content-type')?.includes('text/html')) return article;
      const html = (await response.text()).slice(0, 500_000);
      const description = html.match(/<meta\s+(?:name|property)=["'](?:description|og:description)["']\s+content=["']([^"']*)["']/i)?.[1]
        || html.match(/<meta\s+content=["']([^"']*)["']\s+(?:name|property)=["'](?:description|og:description)["']/i)?.[1];
      const published = html.match(/<meta\s+(?:name|property)=["'](?:article:published_time|datePublished)["']\s+content=["']([^"']*)["']/i)?.[1];
      return { ...article, snippet: [description ? plainText(description).slice(0, 500) : '', published || article.snippet].filter(Boolean).join(' · ') || undefined };
    } catch { return article; }
  }));
}

export async function searchSources(
  content: string,
  onProviderComplete?: (provider: SearchSource['provider'], resultCount: number) => void,
): Promise<SearchSource[]> {
  const query = queryFor(content);
  if (query.length < 3) return [];
  const collect = async (provider: SearchSource['provider'], search: () => Promise<SearchSource[]>) => {
    try {
      const sources = await search();
      onProviderComplete?.(provider, sources.length);
      return sources;
    } catch {
      onProviderComplete?.(provider, 0);
      return [];
    }
  };
  const batches = await Promise.all([
    collect('DuckDuckGo', () => searchDuckDuckGo(query)),
    collect('Wikipedia', () => searchWikipedia(query)),
    collect('GDELT news', () => searchNews(query)),
  ]);
  const unique = new Map<string, SearchSource>();
  for (const batch of batches) for (const source of batch) if (!unique.has(source.url)) unique.set(source.url, source);
  return Array.from(unique.values()).slice(0, 12);
}

export function sourceContext(sources: SearchSource[]): string {
  if (!sources.length) return 'No independent DuckDuckGo, Wikipedia, or news results were available for this query.';
  return sources.map((source, index) => `[${index + 1}] ${source.provider} | ${source.title} | ${source.url}${source.snippet ? ` | ${source.snippet}` : ''}`).join('\n');
}
