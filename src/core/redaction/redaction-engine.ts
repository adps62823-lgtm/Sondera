import { RedactionSuggestion } from '../../types/domain';

export function detectRedactionSuggestions(text: string): RedactionSuggestion[] {
  const suggestions: RedactionSuggestion[] = [];
  let idCounter = 1;

  // 1. Email Addresses
  const emailRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
  let match: RegExpExecArray | null;
  while ((match = emailRegex.exec(text)) !== null) {
    suggestions.push({
      id: `redact-email-${idCounter++}`,
      type: 'email',
      originalText: match[1],
      replacementText: '[REDACTED_EMAIL]',
      startIndex: match.index,
      endIndex: match.index + match[1].length,
      accepted: true,
    });
  }

  // 2. Phone numbers (international, Indian, US formats)
  const phoneRegex = /(\+?[0-9]{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3,4}[-.\s]?\d{4}\b/g;
  while ((match = phoneRegex.exec(text)) !== null) {
    const raw = match[0].trim();
    if (raw.replace(/\D/g, '').length >= 8) {
      suggestions.push({
        id: `redact-phone-${idCounter++}`,
        type: 'phone',
        originalText: raw,
        replacementText: '[REDACTED_PHONE]',
        startIndex: match.index,
        endIndex: match.index + raw.length,
        accepted: true,
      });
    }
  }

  // 3. One-Time Passwords / Security Codes (4 to 8 digit numbers in isolation)
  const otpRegex = /\b(?:code|otp|pin|password)?\s*(?:is\s*)?([0-9]{4,8})\b/gi;
  while ((match = otpRegex.exec(text)) !== null) {
    if (match[1]) {
      const codeIndex = match.index + match[0].indexOf(match[1]);
      suggestions.push({
        id: `redact-otp-${idCounter++}`,
        type: 'otp',
        originalText: match[1],
        replacementText: '[REDACTED_CODE]',
        startIndex: codeIndex,
        endIndex: codeIndex + match[1].length,
        accepted: true,
      });
    }
  }

  // 4. Financial Account Numbers / Card sequences (9 to 16 digits)
  const accountRegex = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{0,4}\b/g;
  while ((match = accountRegex.exec(text)) !== null) {
    const raw = match[0].trim();
    const digitsOnly = raw.replace(/\D/g, '');
    if (digitsOnly.length >= 10 && digitsOnly.length <= 19) {
      suggestions.push({
        id: `redact-acc-${idCounter++}`,
        type: 'account',
        originalText: raw,
        replacementText: '[REDACTED_ACCOUNT]',
        startIndex: match.index,
        endIndex: match.index + raw.length,
        accepted: true,
      });
    }
  }

  // Remove duplicate overlaps and sort by startIndex
  return suggestions.sort((a, b) => a.startIndex - b.startIndex);
}

export function applyRedactions(text: string, suggestions: RedactionSuggestion[]): string {
  const active = suggestions.filter((s) => s.accepted).sort((a, b) => b.startIndex - a.startIndex);
  let result = text;
  for (const s of active) {
    result = result.substring(0, s.startIndex) + s.replacementText + result.substring(s.endIndex);
  }
  return result;
}
