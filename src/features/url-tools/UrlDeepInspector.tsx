import React, { useState } from 'react';
import { parseUrlSafely } from '../../core/rules/url-rules';
import {
  Link2,
  QrCode,
  ShieldAlert,
  Search,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Info,
  Code,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const UrlDeepInspector: React.FC = () => {
  const [inputUrl, setInputUrl] = useState(
    'https://secure.paypal.com:account-check@portal-login-verify.xyz:8443/auth/step2?token=secret9821#section-pin'
  );
  const [homoglyphA, setHomoglyphA] = useState('apple.com');
  const [homoglyphB, setHomoglyphB] = useState('аpple.com'); // Note: 'а' is Cyrillic U+0430

  const parsed = parseUrlSafely(inputUrl);

  // Check if UPI URI
  const isUpi = inputUrl.startsWith('upi://pay');
  let upiParams: Record<string, string> = {};
  if (isUpi) {
    try {
      const q = inputUrl.substring(inputUrl.indexOf('?') + 1);
      const searchParams = new URLSearchParams(q);
      searchParams.forEach((val, key) => {
        upiParams[key] = val;
      });
    } catch {
      // ignore
    }
  }

  // Punycode comparison
  const compareHomoglyphs = () => {
    const codePointsA = Array.from(homoglyphA).map(
      (c) => `${c} (U+${c.charCodeAt(0).toString(16).padStart(4, '0').toUpperCase()})`
    );
    const codePointsB = Array.from(homoglyphB).map(
      (c) => `${c} (U+${c.charCodeAt(0).toString(16).padStart(4, '0').toUpperCase()})`
    );
    const isExactMatch = homoglyphA === homoglyphB;
    return { codePointsA, codePointsB, isExactMatch };
  };

  const homoglyphResult = compareHomoglyphs();

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded-3xl border border-surface-border dark:border-surface-darkBorder shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200">
            Syntactic Deconstruction
          </span>
          <span className="text-xs text-ink-muted">Zero remote fetching • 100% offline analysis</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-forest-900 dark:text-forest-100 flex items-center gap-2">
          <Link2 className="w-6 h-6 text-forest-700 dark:text-forest-400" />
          <span>Deep URL & Payload Deconstruction Lab</span>
        </h1>
        <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-1">
          Dissect web addresses, discover misleading user-info tricks, decode disguised UPI QR strings, and inspect Unicode homoglyph lookalikes.
        </p>
      </div>

      {/* Input Box */}
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded-3xl border border-surface-border dark:border-surface-darkBorder shadow-sm space-y-4">
        <label className="block text-xs font-semibold text-ink-primary dark:text-neutral-200">
          Paste Raw URL, Link String, or QR URI Payload to Inspect
        </label>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="e.g. https://bank.com@malicious-site.net/login or upi://pay?pa=..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100 font-mono focus:outline-none focus:ring-2 focus:ring-forest-600"
          />
          <button
            type="button"
            onClick={() =>
              setInputUrl('upi://pay?pa=fake-merchant@okaxis&pn=Electricity+Refund&am=1&cu=INR')
            }
            className="px-3 py-2 rounded-xl bg-surface-muted text-xs font-medium text-ink-primary hover:bg-neutral-200 whitespace-nowrap"
          >
            Sample UPI URI
          </button>
        </div>
      </div>

      {/* Breakdown Section */}
      {isUpi ? (
        /* UPI Payment Breakdown */
        <div className="bg-white dark:bg-surface-darkCard p-6 rounded-3xl border border-surface-border dark:border-surface-darkBorder shadow-sm space-y-4">
          <div className="flex items-center gap-2 border-b border-surface-border/50 pb-3">
            <QrCode className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-sm text-ink-primary dark:text-neutral-100">
              UPI Intent / QR Payload Decoded
            </h3>
          </div>

          <div className="p-3.5 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-950 dark:text-emerald-100">
            <strong>Payload Purpose: </strong> Initiates a direct UPI payment request. Inspect the actual payee VPA below:
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-surface-muted dark:bg-surface-darkMuted">
              <span className="block text-[10px] text-ink-muted uppercase">Payee VPA Handle (pa)</span>
              <span className="font-bold font-mono text-ink-primary dark:text-neutral-100">
                {upiParams['pa'] || 'Missing / Corrupt'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-muted dark:bg-surface-darkMuted">
              <span className="block text-[10px] text-ink-muted uppercase">Payee Display Name (pn)</span>
              <span className="font-bold font-mono text-ink-primary dark:text-neutral-100">
                {upiParams['pn'] || 'Unspecified'}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-surface-muted dark:bg-surface-darkMuted">
              <span className="block text-[10px] text-ink-muted uppercase">Requested Amount (am)</span>
              <span className="font-bold font-mono text-ink-primary dark:text-neutral-100">
                {upiParams['am'] ? `₹${upiParams['am']}` : 'User-entered in App'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Standard URL Syntactic Breakdown */
        <div className="bg-white dark:bg-surface-darkCard p-6 rounded-3xl border border-surface-border dark:border-surface-darkBorder shadow-sm space-y-5">
          <h3 className="font-bold text-sm text-ink-primary dark:text-neutral-100 border-b border-surface-border/50 pb-3 flex items-center gap-2">
            <Code className="w-4 h-4 text-forest-700 dark:text-forest-400" />
            <span>Interactive URL Anatomical Segments</span>
          </h3>

          {/* Color-Coded Segments Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
              <span className="block text-[10px] uppercase font-bold text-blue-800 dark:text-blue-300">
                1. Protocol / Scheme
              </span>
              <span className="font-bold font-mono text-ink-primary dark:text-neutral-100">
                {parsed.scheme || 'None'}:
              </span>
              <p className="text-[10px] text-blue-900 dark:text-blue-300 mt-1">
                {parsed.scheme === 'https' ? 'Encrypted transit (HTTPS)' : 'Unencrypted / non-standard'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800">
              <span className="block text-[10px] uppercase font-bold text-red-800 dark:text-red-300">
                2. User-Info Credentials
              </span>
              <span className="font-bold font-mono text-ink-primary dark:text-neutral-100 truncate block">
                {parsed.userInfo ? `${parsed.userInfo}@` : 'None (Safe)'}
              </span>
              <p className="text-[10px] text-red-900 dark:text-red-300 mt-1">
                {parsed.hasUserInfo ? '⚠️ TRICK: Ignored by browser!' : 'Standard clean connection'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="block text-[10px] uppercase font-bold text-emerald-800 dark:text-emerald-300">
                3. True Target Hostname
              </span>
              <span className="font-bold font-mono text-ink-primary dark:text-neutral-100 truncate block">
                {parsed.hostname || 'Invalid'}
              </span>
              <p className="text-[10px] text-emerald-900 dark:text-emerald-300 mt-1">
                This is the actual server contacted!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800">
              <span className="block text-[10px] uppercase font-bold text-purple-800 dark:text-purple-300">
                4. Port Number
              </span>
              <span className="font-bold font-mono text-ink-primary dark:text-neutral-100">
                :{parsed.port || 'Default'}
              </span>
              <p className="text-[10px] text-purple-900 dark:text-purple-300 mt-1">
                {parsed.port === '443' || parsed.port === '80' ? 'Standard web port' : 'Unconventional port'}
              </p>
            </div>
          </div>

          {/* Path and Query Breakdown */}
          <div className="p-3.5 bg-surface-muted dark:bg-surface-darkMuted rounded-xl text-xs space-y-1 font-mono">
            <div>
              <span className="text-ink-muted font-sans font-semibold">Pathname: </span>
              <span className="text-ink-primary dark:text-neutral-200">{parsed.pathname || '/'}</span>
            </div>
            {parsed.search && (
              <div>
                <span className="text-ink-muted font-sans font-semibold">Query String: </span>
                <span className="text-amber-800 dark:text-amber-300">{parsed.search}</span>
              </div>
            )}
            {parsed.hash && (
              <div>
                <span className="text-ink-muted font-sans font-semibold">Hash Anchor: </span>
                <span className="text-purple-800 dark:text-purple-300">{parsed.hash}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Homoglyph / Punycode Visualizer */}
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded-3xl border border-surface-border dark:border-surface-darkBorder shadow-sm space-y-4">
        <div className="border-b border-surface-border/50 pb-3">
          <h3 className="font-bold text-sm text-ink-primary dark:text-neutral-100 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-forest-700 dark:text-forest-400" />
            <span>Unicode Homoglyph & Impersonation Inspector</span>
          </h3>
          <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-0.5">
            Compare two visually identical strings to inspect their underlying Unicode code points. Attackers swap Latin letters for Cyrillic or Greek lookalikes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[11px] font-semibold text-ink-secondary dark:text-neutral-300 mb-1">
              Legitimate Domain (e.g. apple.com)
            </label>
            <input
              type="text"
              value={homoglyphA}
              onChange={(e) => setHomoglyphA(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs font-mono"
            />
            <div className="mt-2 text-[10px] font-mono text-ink-muted space-y-0.5 max-h-24 overflow-y-auto">
              {homoglyphResult.codePointsA.map((cp, idx) => (
                <div key={idx}>{cp}</div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-ink-secondary dark:text-neutral-300 mb-1">
              Lookalike Domain (e.g. аpple.com with Cyrillic 'а')
            </label>
            <input
              type="text"
              value={homoglyphB}
              onChange={(e) => setHomoglyphB(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs font-mono"
            />
            <div className="mt-2 text-[10px] font-mono text-ink-muted space-y-0.5 max-h-24 overflow-y-auto">
              {homoglyphResult.codePointsB.map((cp, idx) => (
                <div key={idx}>{cp}</div>
              ))}
            </div>
          </div>
        </div>

        <div
          className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
            homoglyphResult.isExactMatch
              ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
              : 'bg-red-50 text-red-900 border border-red-200'
          }`}
        >
          {homoglyphResult.isExactMatch ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Both strings are character-for-character identical in Unicode!</span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                HOMOGLYPH DECEPTION DETECTED: The two strings look identical to human eyes, but use different underlying Unicode code points! A browser will visit a completely different server.
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
