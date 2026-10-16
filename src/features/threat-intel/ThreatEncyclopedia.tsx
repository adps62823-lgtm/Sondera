import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  PhoneCall,
  Smartphone,
  Video,
  CreditCard,
  Zap,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

export interface ThreatEntry {
  id: string;
  name: string;
  category: 'impersonation' | 'financial' | 'malware' | 'social_engineering';
  severity: 'critical' | 'high' | 'medium';
  targetAudience: string;
  commonHook: string;
  howItWorks: string;
  redFlags: string[];
  safeAction: string;
}

export const THREAT_ENTRIES: ThreatEntry[] = [
  {
    id: 'th-digital-arrest',
    name: '"Digital Arrest" & Fake Police Video Call Scam',
    category: 'impersonation',
    severity: 'critical',
    targetAudience: 'Professionals, retirees, students living away from family',
    commonHook: '"A parcel sent in your name to Taiwan/Cambodia contains illegal narcotics and 5 fake passports."',
    howItWorks:
      'Imposters pose as police or customs officials via Skype/WhatsApp video calls wearing forged uniforms against official-looking backdrops. They claim a national arrest warrant exists and force the victim into "digital arrest" (forbidding them from ending the call or telling family) while coercing them to transfer savings into "RBI verification accounts" to prove their innocence.',
    redFlags: [
      'Demand to stay on video call continuously for hours or days ("digital arrest").',
      'Threat of immediate arrest unless money is transferred to a "safe government account".',
      'Insistence on absolute secrecy from family and bank branch staff.',
      'Indian law enforcement NEVER conducts judicial trials or arrests via Skype/WhatsApp video calls.',
    ],
    safeAction:
      'Disconnect the video call immediately. Real police never serve warrants or demand money via video chat. Report the caller to the National Cyber Crime portal (1930 / cybercrime.gov.in).',
  },
  {
    id: 'th-telegram-task-scam',
    name: 'Part-Time "Like & Review" Task Scam',
    category: 'financial',
    severity: 'high',
    targetAudience: 'College students, job seekers, homemakers',
    commonHook: '"Earn ₹3,000–₹8,000 daily by simply liking YouTube videos or writing Google Maps hotel reviews from home."',
    howItWorks:
      'Victims are invited to a Telegram group and paid small real sums (₹200–₹500) for completing simple rating tasks to build trust. Once hooked, they are asked to "recharge" or invest larger amounts (₹10,000 to ₹5,00,000) into fake crypto or task portals to unlock "VIP commissions" which can never be withdrawn.',
    redFlags: [
      'Unsolicited WhatsApp job offers from foreign international numbers (+62, +84, +234).',
      'Requirement to pay money upfront to "unlock tasks" or "withdraw profits".',
      'Communication pushed exclusively to Telegram channels with anonymous admins.',
    ],
    safeAction:
      'Legitimate companies never ask employees to pay money to receive salary or tasks. Exit the Telegram group and block the recruiter immediately.',
  },
  {
    id: 'th-electricity-bill-cut',
    name: 'Urgent Electricity Bill Disconnection Alert',
    category: 'social_engineering',
    severity: 'high',
    targetAudience: 'Everyday consumers, shopkeepers, senior citizens',
    commonHook: '"Dear Consumer, your electricity power will be disconnected tonight at 9:30 PM due to unpaid previous month bill. Call electricity officer immediately at 9845xxxxxx."',
    howItWorks:
      'Sent via personal mobile numbers (not official power utility shortcodes). When the victim panics and calls the number, the imposter instructs them to install a remote support app (AnyDesk/TeamViewer) or make a nominal ₹10 recharge via a spoofed payment gateway that harvests banking credentials.',
    redFlags: [
      'Sent from an ordinary 10-digit phone number, not the official utility shortcode.',
      'Ultimatum claiming power will be shut off within hours.',
      'Directive to call an individual mobile number rather than visiting the official electricity board website.',
    ],
    safeAction:
      'Check your genuine electricity bill status inside your official state electricity board app or consumer portal. Power disconnections require formal statutory notice.',
  },
  {
    id: 'th-qr-reverse-scam',
    name: 'QR Code "Scan to Receive Money" Trick',
    category: 'financial',
    severity: 'high',
    targetAudience: 'Online sellers on OLX/Marketplace, small merchants',
    commonHook: '"I am buying your furniture. I have sent an advance payment QR code. Scan it and enter your UPI PIN to receive the money."',
    howItWorks:
      'The scammer claims they are sending money and generates a payment collect request disguised as a payment receipt QR code. In UPI architecture, you NEVER enter your PIN to receive money—entering your PIN always authorizes a DEBIT from your account.',
    redFlags: [
      'Buyer insists on paying exclusively via scanning a QR code sent in chat.',
      'Buyer claims "you have to enter your PIN to verify your bank balance before receiving funds".',
      'Buyer creates urgency and refuses in-person cash or direct UPI ID transfer.',
    ],
    safeAction:
      'Remember the golden rule of UPI: Entering your UPI PIN always DEDUCTS money from your bank account. You never type your PIN to receive funds.',
  },
  {
    id: 'th-sim-swap-fraud',
    name: 'SIM Swap & Unauthorized eSIM Migration',
    category: 'malware',
    severity: 'critical',
    targetAudience: 'High-net-worth individuals, crypto holders, active traders',
    commonHook: '"Your 4G SIM needs mandatory 5G upgrade. Send SMS \'SWAP 32-digit-eSIM-ID\' to 121 to prevent disconnection."',
    howItWorks:
      'Scammers trick the telecom provider into reassigning your mobile number to a blank SIM/eSIM in their possession. Once your physical SIM loses cellular signal, the attackers intercept all your SMS OTPs to hijack your email and drain your bank accounts.',
    redFlags: [
      'Your phone suddenly displays "No Service" or "Emergency Calls Only" in an area with normally reliable coverage.',
      'Unsolicited SMS from telecom operator confirming an eSIM conversion or SIM replacement request you did not initiate.',
    ],
    safeAction:
      'If your phone loses carrier connectivity unexpectedly, contact your telecom operator immediately from another phone. Inform them you suspect an unauthorized SIM swap.',
  },
  {
    id: 'th-ai-voice-cloning',
    name: 'AI Voice Cloning Distress Call',
    category: 'social_engineering',
    severity: 'critical',
    targetAudience: 'Parents, grandparents, close relatives',
    commonHook: '"Dad, I got into a car accident and the police have detained me! Please transfer ₹50,000 bail money right now to this officer."',
    howItWorks:
      'Attackers sample 5–10 seconds of a family member’s voice from public Instagram Reels or YouTube videos and use AI voice synthesis models to mimic their voice pitch and emotional distress over a crackly phone call to coerce immediate wire transfers.',
    redFlags: [
      'Caller demands immediate money while claiming an extreme emergency.',
      'Caller claims their original phone is broken/confiscated and insists on keeping you on the line.',
      'Background noises or strange digital cadence.',
    ],
    safeAction:
      'Hang up and call your loved one back on their known real telephone number. Establish a family "safe word" that only real family members know in genuine emergencies.',
  },
];

export const ThreatEncyclopedia: React.FC = () => {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedThreat, setSelectedThreat] = useState<ThreatEntry>(THREAT_ENTRIES[0]);

  const filtered = THREAT_ENTRIES.filter((t) => {
    const matchesCat = activeCategory === 'all' ? true : t.category === activeCategory;
    const matchesSearch =
      search.trim() === ''
        ? true
        : t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.commonHook.toLowerCase().includes(search.toLowerCase()) ||
          t.howItWorks.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="bg-white dark:bg-surface-darkCard p-6 rounded-3xl border border-surface-border dark:border-surface-darkBorder shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200">
              Offline Digital Threat Encyclopedia
            </span>
            <span className="text-xs text-ink-muted">
              {THREAT_ENTRIES.length} modern vectors cataloged
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-forest-900 dark:text-forest-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-forest-700 dark:text-forest-400" />
            <span>Modern Threat Anatomy & Defense Playbook</span>
          </h1>
          <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-1">
            Searchable field guide deconstructing real-world scam vectors, psychological hooks, and actionable containment steps.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search scam anatomy (e.g. 'digital arrest', 'electricity', 'task scam', 'QR code')..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard text-xs text-ink-primary dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
          />
        </div>

        <div className="flex flex-wrap gap-1 bg-surface-muted dark:bg-surface-darkMuted p-1 rounded-xl text-xs w-full sm:w-auto">
          {['all', 'impersonation', 'financial', 'social_engineering', 'malware'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2.5 py-1 rounded-lg capitalize transition ${
                activeCategory === cat
                  ? 'bg-white dark:bg-surface-darkCard font-semibold text-forest-900 dark:text-forest-100 shadow-xs'
                  : 'text-ink-secondary dark:text-neutral-400'
              }`}
            >
              {cat.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left List */}
        <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
          {filtered.map((t) => {
            const isSelected = selectedThreat.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => setSelectedThreat(t)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition flex flex-col justify-between ${
                  isSelected
                    ? 'border-forest-600 bg-forest-50/70 dark:bg-forest-950/50 dark:border-forest-600 shadow-xs'
                    : 'border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-neutral-50 dark:hover:bg-neutral-800'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-mono uppercase text-ink-muted">
                      {t.category.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        t.severity === 'critical'
                          ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {t.severity}
                    </span>
                  </div>
                  <h4 className="font-bold text-xs text-ink-primary dark:text-neutral-100">
                    {t.name}
                  </h4>
                  <p className="text-[11px] text-ink-secondary dark:text-neutral-400 italic line-clamp-1 mt-1 font-mono">
                    "{t.commonHook}"
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Detail Pane */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-surface-darkCard rounded-3xl border border-surface-border dark:border-surface-darkBorder p-6 shadow-sm space-y-5">
            <div className="border-b border-surface-border/50 dark:border-surface-darkBorder/50 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs uppercase font-mono px-2 py-0.5 rounded bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200 font-semibold">
                  {selectedThreat.category.replace('_', ' ')}
                </span>
                <span className="text-xs text-ink-muted">Target: {selectedThreat.targetAudience}</span>
              </div>
              <h2 className="text-xl font-bold text-ink-primary dark:text-neutral-100">
                {selectedThreat.name}
              </h2>
            </div>

            {/* Common Hook Box */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>The Psychological Hook / Bait</span>
              </span>
              <p className="text-xs font-mono text-amber-950 dark:text-amber-100">
                "{selectedThreat.commonHook}"
              </p>
            </div>

            {/* How it works */}
            <div className="space-y-1.5 text-xs text-ink-primary dark:text-neutral-200">
              <h3 className="font-bold text-xs uppercase tracking-wider text-ink-muted">
                Mechanics of the Exploit
              </h3>
              <p className="leading-relaxed bg-surface-muted dark:bg-surface-darkMuted p-3.5 rounded-xl border border-surface-border/50">
                {selectedThreat.howItWorks}
              </p>
            </div>

            {/* Red Flags */}
            <div className="space-y-2">
              <h3 className="font-bold text-xs uppercase tracking-wider text-ink-muted">
                Tell-Tale Warning Signs (Red Flags)
              </h3>
              <ul className="space-y-1.5 text-xs text-ink-secondary dark:text-neutral-300">
                {selectedThreat.redFlags.map((flag, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Prudent Action */}
            <div className="p-4 rounded-2xl bg-forest-900 text-white space-y-1 text-xs">
              <span className="font-bold uppercase tracking-wider text-forest-200 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-forest-300" />
                <span>Recommended Defensive Action</span>
              </span>
              <p className="text-forest-100 leading-relaxed">
                {selectedThreat.safeAction}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
