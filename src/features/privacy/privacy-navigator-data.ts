export interface PrivacyQuestion {
  id: string;
  category: 'authentication' | 'devices' | 'network' | 'sharing';
  title: string;
  description: string;
  whyItMatters: string;
  recommendedAction: string;
}

export const PRIVACY_QUESTIONS: PrivacyQuestion[] = [
  {
    id: 'pq-unique-passwords',
    category: 'authentication',
    title: 'Unique Passwords Across Critical Accounts',
    description: 'Do you use distinct, unshared passwords for your primary email, banking, and government portals?',
    whyItMatters: 'If one online service suffers a credential leak, attackers immediately attempt the same email/password combination across hundreds of popular platforms (credential stuffing).',
    recommendedAction: 'Adopt a password manager (e.g. Bitwarden, 1Password, or your operating system keychain) to generate and store 16+ character unique passwords.'
  },
  {
    id: 'pq-two-factor-auth',
    category: 'authentication',
    title: 'Multi-Factor Authentication (MFA / 2FA)',
    description: 'Is 2-Factor Authentication enabled on your primary email, social accounts, and financial services?',
    whyItMatters: 'Even if an attacker discovers your password, MFA requires a secondary physical or cryptographic proof, preventing unauthorized entry.',
    recommendedAction: 'Enable authenticator app-based 2FA (TOTP) or passkeys where available. Prefer authenticator apps over SMS codes whenever supported.'
  },
  {
    id: 'pq-recovery-methods',
    category: 'authentication',
    title: 'Up-to-Date Account Recovery Contacts',
    description: 'Are your backup phone numbers and secondary recovery emails current and accessible?',
    whyItMatters: 'Outdated recovery phone numbers (e.g. old SIM cards reassigned by telecom operators) are a primary vector for identity takeover.',
    recommendedAction: 'Audit account recovery settings annually. Remove disconnected telephone numbers or unmonitored school/work emails.'
  },
  {
    id: 'pq-otp-hygiene',
    category: 'authentication',
    title: 'Zero OTP Sharing Discipline',
    description: 'Do you consistently decline requests to recite or forward one-time SMS verification codes to anyone claiming to be support staff?',
    whyItMatters: 'Fraudsters routinely impersonate courier reps, bank security, or friends to request an SMS code to authorize payments or take over messaging apps.',
    recommendedAction: 'Memorize the cardinal rule: Genuine staff never need you to recite or type an OTP for them.'
  },
  {
    id: 'pq-app-permissions',
    category: 'devices',
    title: 'Routine App Permission Audits',
    description: 'Do you periodically review and revoke location, microphone, and contacts access for apps on your smartphone?',
    whyItMatters: 'Many apps retain background location and sensor permissions long after the initial need expires, profiling habits and movements.',
    recommendedAction: 'In phone settings, set location to "Only While Using App" and revoke permissions for apps not used in the past 90 days.'
  },
  {
    id: 'pq-automatic-updates',
    category: 'devices',
    title: 'Automatic OS & Browser Security Updates',
    description: 'Are operating system patches and browser auto-updates enabled on your phone and computer?',
    whyItMatters: 'Security patches close critical zero-day vulnerabilities that malicious websites can exploit to run silent background exploits.',
    recommendedAction: 'Enable automatic nighttime updates on your OS and restart your browser when an update badge appears.'
  },
  {
    id: 'pq-public-wifi',
    category: 'network',
    title: 'Public Wi-Fi Precaution',
    description: 'Do you avoid logging into banking apps or making financial transactions while connected to open, unencrypted Wi-Fi hotspots?',
    whyItMatters: 'Rogue access points can spoof DNS records or intercept unencrypted network handshakes.',
    recommendedAction: 'Use your cellular mobile data hotspot or a reputable VPN when transacting in airports, cafes, or public transit.'
  },
  {
    id: 'pq-oversharing-social',
    category: 'sharing',
    title: 'Public Profile Minimization',
    description: 'Are your personal date of birth, mother\'s maiden name, pet names, and home address hidden from public social media profiles?',
    whyItMatters: 'Scammers harvest public biographical details to answer security challenge questions or engineer tailored spear-phishing attacks.',
    recommendedAction: 'Set social media profiles to private or friends-only and remove full birth dates and family relationship listings from public view.'
  }
];
