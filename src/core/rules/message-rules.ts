import { Finding } from '../../types/domain';

export interface MessageRule {
  id: string;
  version: string;
  title: string;
  severity: "info" | "caution" | "high";
  check: (text: string, context?: string) => {
    matched: boolean;
    matchedText?: string;
    explanation: string;
    limitation: string;
    recommendedAction: string;
  };
}

export const MESSAGE_RULES: MessageRule[] = [
  {
    id: "msg.urgent_time_pressure",
    version: "1.0.0",
    title: "Urgent Time-Pressure Cue",
    severity: "caution",
    check: (text: string) => {
      const regex = /\b(immediate(?:ly)?|urgent(?:ly)?|within (?:[0-9]+|\w+) (?:hours?|minutes?|days?)|today only|deadline|expires? (?:soon|in \d+)|act now|last chance|final notice|account will be (?:blocked|suspended|closed|terminated|deactivated))\b/i;
      const match = text.match(regex);
      return {
        matched: Boolean(match),
        matchedText: match ? match[0] : undefined,
        explanation: "The message emphasizes extreme urgency or tight deadlines. High-pressure cues are often used to provoke emotional, rushed decisions before the recipient can independently verify.",
        limitation: "Legitimate organizations sometimes communicate deadlines. Urgency alone is an indicator, not definitive proof of deception.",
        recommendedAction: "Take a breath. Do not click links or respond under pressure. Independently open the service's official app or known website to verify any genuine account status."
      };
    }
  },
  {
    id: "msg.requests_credentials_otp",
    version: "1.0.0",
    title: "Request for One-Time Code, PIN, or Password",
    severity: "high",
    check: (text: string) => {
      const regex = /\b(one[- ]time (?:password|code|pin)|otp|verification code|security code|2fa code|enter your (?:password|pin)|share (?:your|this) (?:otp|code)|send (?:me|back) the code)\b/i;
      const match = text.match(regex);
      return {
        matched: Boolean(match),
        matchedText: match ? match[0] : undefined,
        explanation: "The message solicits a one-time password (OTP), security code, or credential. Legitimate banks, services, and tech providers explicitly advise that staff will never request one-time verification codes.",
        limitation: "The heuristic analyzes text patterns. It cannot verify whether the request originated from an automated verification flow initiated by you or an imposter.",
        recommendedAction: "NEVER disclose one-time passwords, 2FA codes, or credentials. Treat any third party requesting your verification code as high-risk."
      };
    }
  },
  {
    id: "msg.payment_or_fee_demand",
    version: "1.0.0",
    title: "Payment, Fee, or Unusual Transfer Request",
    severity: "high",
    check: (text: string) => {
      const regex = /\b(gift card|crypto(?:currency)?|bitcoin|usdt|wire transfer|processing fee|clearance charge|courier fee|pay immediately to release|send money via upi|transfer funds to|customs fee)\b/i;
      const match = text.match(regex);
      return {
        matched: Boolean(match),
        matchedText: match ? match[0] : undefined,
        explanation: "The text requests immediate payment, clearance fees, or unusual payment mechanisms (such as gift cards, wire transfers, or cryptocurrency).",
        limitation: "Businesses legitimately send payment reminders. Context matters—unsolicited fee demands or unconventional payment rails are key warning signs.",
        recommendedAction: "Do not send funds through untraceable rails. Verify pending invoices or delivery charges directly on the official courier or merchant portal."
      };
    }
  },
  {
    id: "msg.authority_impersonation",
    version: "1.0.0",
    title: "Organization or Authority Assertion",
    severity: "caution",
    check: (text: string) => {
      const regex = /\b(bank (?:security|fraud|manager)|income tax (?:department|officer)|police department|cyber (?:crime|cell)|court summons|customs authority|fedex|dhl|postal service|amazon support|microsoft support|apple support|hr department)\b/i;
      const match = text.match(regex);
      return {
        matched: Boolean(match),
        matchedText: match ? match[0] : undefined,
        explanation: "The sender evokes the authority of a recognized brand, bank, or government institution. Impersonation relies on established institutional trust to bypass skepticism.",
        limitation: "Text mentions cannot prove identity. A message from a real bank can also contain these words.",
        recommendedAction: "Verify sender contact details independently. Never use contact numbers or email links embedded inside the message."
      };
    }
  },
  {
    id: "msg.threat_or_penalty",
    version: "1.0.0",
    title: "Threat, Legal Action, or Penalty Framing",
    severity: "high",
    check: (text: string) => {
      const regex = /\b(legal action|arrest warrant|lawsuit|face prosecution|penalty of|fine will be imposed|police complaint filed|court order|blacklisted)\b/i;
      const match = text.match(regex);
      return {
        matched: Boolean(match),
        matchedText: match ? match[0] : undefined,
        explanation: "The message uses severe threats of arrest, prosecution, or financial penalties to induce panic and force compliance.",
        limitation: "Official legal notices follow strict formal procedures and are rarely served via informal chat messages or generic emails demanding immediate payment.",
        recommendedAction: "Do not panic. Formal legal proceedings are delivered via registered mail or verified service, never through instant messaging demanding instant payment."
      };
    }
  },
  {
    id: "msg.unexpected_lottery_or_reward",
    version: "1.0.0",
    title: "Unsolicited Prize, Grant, or Reward",
    severity: "caution",
    check: (text: string) => {
      const regex = /\b(you (?:have )?won|congratulations!|selected as (?:the )?winner|lottery prize|cash reward|claim your grant|unclaimed funds|gift voucher worth)\b/i;
      const match = text.match(regex);
      return {
        matched: Boolean(match),
        matchedText: match ? match[0] : undefined,
        explanation: "The text promises unexpected windfalls, lottery prizes, or grants without prior participation.",
        limitation: "Marketing promotions occasionally offer rewards, but asking for personal information or prepayment to unlock winnings is an established red flag.",
        recommendedAction: "If you did not enter a competition, you have not won. Never pay a 'tax' or 'handling fee' to claim an alleged prize."
      };
    }
  },
  {
    id: "msg.secrecy_or_channel_shift",
    version: "1.0.0",
    title: "Demand for Secrecy or Communication Isolation",
    severity: "high",
    check: (text: string) => {
      const regex = /\b(do not tell (?:anyone|your bank|family)|keep this (?:strictly )?confidential|switch to (?:telegram|whatsapp)|message me on signal|don't discuss with)\b/i;
      const match = text.match(regex);
      return {
        matched: Boolean(match),
        matchedText: match ? match[0] : undefined,
        explanation: "The sender insists on secrecy or instructs the recipient to avoid consulting family or official staff. Isolation prevents the victim from receiving outside advice.",
        limitation: "Confidentiality exists in genuine business matters, but unsolicited requests demanding secrecy regarding financial actions are suspect.",
        recommendedAction: "Consult a trusted family member, colleague, or official representative before taking any requested step."
      };
    }
  },
  {
    id: "msg.viral_forwarding_pressure",
    version: "1.0.0",
    title: "Viral Amplification & Forwarding Pressure",
    severity: "caution",
    check: (text: string) => {
      const regex = /\b(forward this (?:to|with) (?:everyone|\d+)|share (?:widely|with all your contacts|before midnight)|pass this on|do not delete without sharing)\b/i;
      const match = text.match(regex);
      return {
        matched: Boolean(match),
        matchedText: match ? match[0] : undefined,
        explanation: "The message demands rapid forwarding to multiple groups. Viral chain mechanisms spread unverified claims rapidly without adding corroborating evidence.",
        limitation: "Public service announcements also encourage sharing. The distinguishing factor is whether an authoritative primary source URL is provided.",
        recommendedAction: "Pause before forwarding. Look for an official press release or established news reporting confirming the claim."
      };
    }
  },
  {
    id: "msg.contains_embedded_url",
    version: "1.0.0",
    title: "Contains Embedded Web Link",
    severity: "info",
    check: (text: string) => {
      const regex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}\/[^\s]*)/i;
      const match = text.match(regex);
      return {
        matched: Boolean(match),
        matchedText: match ? match[0] : undefined,
        explanation: "A web address was detected inside the message. Links can direct users to cloned credential-harvesting pages or malicious destinations.",
        limitation: "The presence of a URL does not indicate malice. Legitimate communications routinely contain web links.",
        recommendedAction: "Inspect the destination link syntax cautiously. Prefer navigating directly via the company's verified bookmark or app rather than tapping the link."
      };
    }
  }
];

export function runMessageRules(text: string, caseId: string, context?: string): Finding[] {
  const findings: Finding[] = [];
  const now = new Date().toISOString();

  for (const rule of MESSAGE_RULES) {
    const res = rule.check(text, context);
    if (res.matched) {
      findings.push({
        id: `finding-${rule.id}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        caseId,
        ruleId: rule.id,
        ruleVersion: rule.version,
        title: rule.title,
        severity: rule.severity,
        matchedText: res.matchedText,
        explanation: res.explanation,
        limitation: res.limitation,
        recommendedAction: res.recommendedAction,
        status: "active",
        createdAt: now,
      });
    }
  }

  return findings;
}
