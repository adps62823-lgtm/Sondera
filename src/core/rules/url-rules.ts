import { Finding } from '../../types/domain';

export interface ParsedUrlDetails {
  rawInput: string;
  isValid: boolean;
  normalizedUrl?: string;
  scheme?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  hasUserInfo: boolean;
  userInfo?: string;
  isIpAddress: boolean;
  isPunycode: boolean;
  isShortener: boolean;
  error?: string;
}

const COMMON_SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'is.gd',
  'buff.ly',
  'ow.ly',
  'rb.gy',
  'cutt.ly',
  'shorturl.at',
  'rebrand.ly',
  'tiny.cc',
  'goo.gl',
]);

const BRAND_KEYWORDS = [
  'paypal',
  'apple',
  'microsoft',
  'google',
  'netflix',
  'amazon',
  'whatsapp',
  'facebook',
  'instagram',
  'sbi',
  'hdfc',
  'icici',
  'chase',
  'wellsfargo',
  'bankofamerica',
];

export function parseUrlSafely(input: string): ParsedUrlDetails {
  const trimmed = input.trim();
  if (!trimmed) {
    return { rawInput: input, isValid: false, hasUserInfo: false, isIpAddress: false, isPunycode: false, isShortener: false, error: 'Empty input' };
  }

  // Pre-check for non-standard or dangerous schemes before native URL parsing
  const schemeMatch = trimmed.match(/^([a-zA-Z0-9+.-]+):/);
  const scheme = schemeMatch ? schemeMatch[1].toLowerCase() : '';

  if (['javascript', 'data', 'vbscript', 'file', 'blob'].includes(scheme)) {
    return {
      rawInput: input,
      isValid: false,
      scheme,
      hasUserInfo: false,
      isIpAddress: false,
      isPunycode: false,
      isShortener: false,
      error: `Potentially dangerous non-web scheme detected (${scheme}:). Execution blocked.`
    };
  }

  let parseTarget = trimmed;
  // If no scheme, tentatively prepend https:// for syntax inspection
  if (!schemeMatch) {
    parseTarget = `https://${trimmed}`;
  }

  try {
    const urlObj = new URL(parseTarget);
    const hostname = urlObj.hostname.toLowerCase();
    const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname.startsWith('[') || hostname.includes(':');
    const isPunycode = hostname.includes('xn--') || /[^\u0000-\u007F]/.test(hostname);
    const isShortener = COMMON_SHORTENERS.has(hostname) || hostname.endsWith('.link');
    const hasUserInfo = Boolean(urlObj.username || urlObj.password);

    return {
      rawInput: input,
      isValid: true,
      normalizedUrl: urlObj.href,
      scheme: urlObj.protocol.replace(':', ''),
      hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? '443' : urlObj.protocol === 'http:' ? '80' : ''),
      pathname: urlObj.pathname,
      search: urlObj.search,
      hash: urlObj.hash,
      hasUserInfo,
      userInfo: hasUserInfo ? `${urlObj.username}${urlObj.password ? ':' + urlObj.password : ''}` : undefined,
      isIpAddress,
      isPunycode,
      isShortener,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      rawInput: input,
      isValid: false,
      hasUserInfo: false,
      isIpAddress: false,
      isPunycode: false,
      isShortener: false,
      error: `Malformed URL syntax: ${msg}`,
    };
  }
}

export function runUrlRules(details: ParsedUrlDetails, caseId: string): Finding[] {
  const findings: Finding[] = [];
  const now = new Date().toISOString();

  if (!details.isValid) {
    findings.push({
      id: `url-err-${Date.now()}`,
      caseId,
      ruleId: "url.malformed_syntax",
      ruleVersion: "1.0.0",
      title: "Malformed or Dangerous URL Syntax",
      severity: "high",
      matchedText: details.rawInput,
      explanation: details.error || "The supplied string cannot be parsed as a standard web URL or contains an unsupported scheme.",
      limitation: "Does not inspect remote server status because remote network requests are disabled to protect user privacy and prevent SSRF.",
      recommendedAction: "Do not attempt to open this link in any browser. Malformed or script-based URLs (e.g. javascript:) can execute unwanted code.",
      status: "active",
      createdAt: now,
    });
    return findings;
  }

  // 1. User Info @ delimiter trick
  if (details.hasUserInfo) {
    findings.push({
      id: `url-userinfo-${Date.now()}`,
      caseId,
      ruleId: "url.misleading_userinfo_delimiter",
      ruleVersion: "1.0.0",
      title: "Misleading '@' User-Info Host Obfuscation",
      severity: "high",
      matchedText: details.userInfo ? `${details.userInfo}@` : '@',
      explanation: `The URL contains user-info before an '@' sign. In standard URL parsing, everything before '@' is ignored by the browser as credentials, and the browser connects to '${details.hostname}'. Attackers use this to display a familiar brand before '@' while directing victims to an unrelated domain.`,
      limitation: "User-info credentials are valid in RFC standards but are rarely used in honest consumer web links.",
      recommendedAction: "Notice that you are NOT visiting the site shown before the '@'. The actual host is '" + details.hostname + "'. Do not proceed.",
      status: "active",
      createdAt: now,
    });
  }

  // 2. Raw IP address host
  if (details.isIpAddress) {
    findings.push({
      id: `url-ip-${Date.now()}`,
      caseId,
      ruleId: "url.raw_ip_address_host",
      ruleVersion: "1.0.0",
      title: "Direct IP Address Host (No Domain Name)",
      severity: "caution",
      matchedText: details.hostname,
      explanation: "The link points directly to a raw numerical IP address rather than a registered domain name. Legitimate consumer services almost universally operate under domain names with verified SSL certificates.",
      limitation: "Local networks and developer test servers may use IP addresses.",
      recommendedAction: "Exercise caution. Do not enter credentials or download files from links that use numerical IP addresses.",
      status: "active",
      createdAt: now,
    });
  }

  // 3. Punycode / Internationalized Domain Name
  if (details.isPunycode) {
    findings.push({
      id: `url-punycode-${Date.now()}`,
      caseId,
      ruleId: "url.punycode_homograph_potential",
      ruleVersion: "1.0.0",
      title: "Punycode or Internationalized Hostname (IDN)",
      severity: "caution",
      matchedText: details.hostname,
      explanation: "The hostname uses Punycode ('xn--') or non-ASCII Unicode characters. While legitimate for international languages, attackers use lookalike Cyrillic or Greek glyphs to visually mimic common brand names.",
      limitation: "Many genuine non-English websites legitimately use internationalized domains.",
      recommendedAction: "Carefully inspect the ASCII representation of the hostname to ensure characters have not been swapped with visual lookalikes.",
      status: "active",
      createdAt: now,
    });
  }

  // 4. URL Shortener
  if (details.isShortener) {
    findings.push({
      id: `url-shortener-${Date.now()}`,
      caseId,
      ruleId: "url.link_shortener_detected",
      ruleVersion: "1.0.0",
      title: "URL Shortener Detected (Destination Obscured)",
      severity: "caution",
      matchedText: details.hostname,
      explanation: "This link uses a link shortener service. The true destination address is concealed until clicked or expanded.",
      limitation: "Shorteners are widely used for convenience on SMS and social media. Their presence does not inherently prove fraud.",
      recommendedAction: "Do not blindly click shortened links in unrequested messages. Use a local link expander or check the sender's authentic context first.",
      status: "active",
      createdAt: now,
    });
  }

  // 5. Unencrypted HTTP transport
  if (details.scheme === 'http') {
    findings.push({
      id: `url-http-${Date.now()}`,
      caseId,
      ruleId: "url.unencrypted_http",
      ruleVersion: "1.0.0",
      title: "Unencrypted HTTP Connection (No Transport Encryption)",
      severity: "caution",
      matchedText: "http://",
      explanation: "The link specifies unencrypted HTTP rather than HTTPS. Data sent to this site can be intercepted or altered on public Wi-Fi.",
      limitation: "Having HTTPS does NOT mean a site is honest. Phishing websites also acquire free HTTPS certificates. Conversely, an HTTP site is simply unencrypted.",
      recommendedAction: "Never submit sensitive information, passwords, or payment cards on an unencrypted HTTP page.",
      status: "active",
      createdAt: now,
    });
  }

  // 6. Subdomain brand spoofing
  if (details.hostname) {
    const parts = details.hostname.split('.');
    if (parts.length >= 3) {
      // Check if a brand name is used as a subdomain prefix when the root domain is something else
      const rootDomain = parts.slice(-2).join('.');
      for (const brand of BRAND_KEYWORDS) {
        if (details.hostname.includes(brand) && !rootDomain.includes(brand)) {
          findings.push({
            id: `url-brandspoof-${Date.now()}-${brand}`,
            caseId,
            ruleId: "url.subdomain_brand_spoofing",
            ruleVersion: "1.0.0",
            title: `Potential Brand Domain Deception (${brand})`,
            severity: "high",
            matchedText: details.hostname,
            explanation: `The hostname includes '${brand}' in a subdomain or prefix, but the actual root domain being visited is '${rootDomain}'. Attackers create names like '${brand}.com.verify-login.net' to deceive hurried readers.`,
            limitation: "Subdomain analysis is heuristic and evaluates structural naming patterns.",
            recommendedAction: `The organization owning this site is '${rootDomain}', NOT '${brand}'. Do not enter your ${brand} credentials here.`,
            status: "active",
            createdAt: now,
          });
          break;
        }
      }
    }
  }

  // 7. Non-standard ports
  if (details.port && !['80', '443'].includes(details.port)) {
    findings.push({
      id: `url-port-${Date.now()}`,
      caseId,
      ruleId: "url.non_standard_port",
      ruleVersion: "1.0.0",
      title: `Non-Standard Network Port (:${details.port})`,
      severity: "info",
      matchedText: `:${details.port}`,
      explanation: `The connection is directed to port ${details.port} instead of standard web ports (80 for HTTP or 443 for HTTPS).`,
      limitation: "Developers and private utilities legitimately use alternate ports.",
      recommendedAction: "Confirm whether you expect to interact with an unconventional service port.",
      status: "active",
      createdAt: now,
    });
  }

  return findings;
}
