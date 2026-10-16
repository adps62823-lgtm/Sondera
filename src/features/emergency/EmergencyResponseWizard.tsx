import React, { useState } from 'react';
import {
  AlertOctagon,
  ShieldAlert,
  PhoneCall,
  Lock,
  Download,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Building2,
  Smartphone,
  CreditCard,
  KeyRound,
  FileText,
} from 'lucide-react';

export type EmergencyType = 'otp_shared' | 'money_sent' | 'password_entered' | 'remote_app_installed';

interface IncidentData {
  type: EmergencyType;
  bankName: string;
  transactionRef: string;
  amount: string;
  contactNumberCalled: string;
  timestamp: string;
  notes: string;
}

export const EmergencyResponseWizard: React.FC = () => {
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyType>('money_sent');
  const [incidentData, setIncidentData] = useState<IncidentData>({
    type: 'money_sent',
    bankName: '',
    transactionRef: '',
    amount: '',
    contactNumberCalled: '',
    timestamp: new Date().toLocaleString(),
    notes: '',
  });
  const [copied, setCopied] = useState(false);

  const protocols = {
    money_sent: {
      title: 'I Transferred Money or Sent a UPI Payment',
      urgency: 'CRITICAL: Act within the first 2 hours (Golden Window)',
      badgeColor: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
      steps: [
        {
          id: 1,
          heading: 'Call Your Bank / Payment App Immediately',
          details:
            'Call the official customer care number on the back of your debit card or in your banking app. Request an immediate "Fraudulent Transaction Dispute" and ask them to freeze the beneficiary account / flag the UTR reference number.',
        },
        {
          id: 2,
          heading: 'Dial National Cybercrime Helpline (India: 1930 / US: IC3.gov)',
          details:
            'In India, immediately dial 1930 (Citizen Financial Cyber Fraud Reporting System) or log on to cybercrime.gov.in. Provide your bank name, transaction ID (UTR), debit account, and fraudulent UPI handle to trigger the inter-bank financial stop-payment system.',
        },
        {
          id: 3,
          heading: 'Document the Transaction Reference (UTR)',
          details:
            'Do not delete the SMS, transaction receipt, or chat logs. Take screenshots showing the recipient account, transaction timestamp, and amount.',
        },
        {
          id: 4,
          heading: 'File a Formal Police / Cyber Cell Complaint',
          details:
            'Submit the acknowledgment slip from 1930 / cybercrime portal along with your bank account statement to your local police cyber division within 24 hours.',
        },
      ],
    },
    otp_shared: {
      title: 'I Disclosed an SMS One-Time Code (OTP) or 2FA Token',
      urgency: 'HIGH URGENCY: Attacker has authorization rights',
      badgeColor: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
      steps: [
        {
          id: 1,
          heading: 'Block Cards & Net Banking Access Instantly',
          details:
            'Log into your official banking app and use "Lock Net Banking" or "Freeze Debit Card" immediately. Alternatively, call the bank IVR number to disable online and international e-commerce transactions.',
        },
        {
          id: 2,
          heading: 'Revoke Active Sessions in Messaging / Social Apps',
          details:
            'If you shared an OTP for WhatsApp, Telegram, or Google: Go to Settings > Linked Devices > Log out of all linked devices. If you are logged out, immediately follow the account re-registration procedure.',
        },
        {
          id: 3,
          heading: 'Change Password from a Clean Device',
          details:
            'Reset your primary email and account passwords immediately. Terminate all other active login sessions.',
        },
      ],
    },
    password_entered: {
      title: 'I Entered My Password on a Suspicious Website',
      urgency: 'ELEVATED: Credential Compromise',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      steps: [
        {
          id: 1,
          heading: 'Change the Compromised Password Immediately',
          details:
            'Open a new, private tab, navigate directly to the legitimate service website (by typing the official URL yourself), and reset your password.',
        },
        {
          id: 2,
          heading: 'Change Reused Passwords Everywhere',
          details:
            'If you reused this password across your email, financial apps, or shopping accounts, change those passwords immediately. Attackers use automated tools to test leaked credentials across thousands of services.',
        },
        {
          id: 3,
          heading: 'Enable Multi-Factor Authentication (MFA / Passkeys)',
          details:
            'Enable an authenticator app (such as Google Authenticator, Microsoft Authenticator, or 1Password) so passwords alone cannot grant access.',
        },
      ],
    },
    remote_app_installed: {
      title: 'I Installed an App as Instructed (AnyDesk, TeamViewer, Unknown APK)',
      urgency: 'CRITICAL: Device Screen and Controls Exposed',
      badgeColor: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
      steps: [
        {
          id: 1,
          heading: 'Disconnect from Internet Immediately (Airplane Mode)',
          details:
            'Turn on Airplane mode or power off Wi-Fi and mobile data right now. This immediately terminates the remote screen-sharing and control stream.',
        },
        {
          id: 2,
          heading: 'Uninstall the Remote Support / Malicious App',
          details:
            'Go to Settings > Apps. Locate the recently installed app (e.g. AnyDesk, QuickSupport, TeamViewer, or unfamiliar APK) and uninstall it completely.',
        },
        {
          id: 3,
          heading: 'Check Accessibility & Admin App Permissions',
          details:
            'Under Settings > Accessibility and Settings > Device Admin Apps, verify that no unknown application has system control or notification-reading privileges.',
        },
        {
          id: 4,
          heading: 'Change Banking Passwords from a Separate Clean Device',
          details:
            'Do not log into banking apps from the affected phone until confirmed clean. Use a family member’s computer or clean phone to change bank credentials.',
        },
      ],
    },
  };

  const currentProtocol = protocols[selectedEmergency];

  const generateIncidentReportMarkdown = () => {
    const lines: string[] = [];
    lines.push(`# OFFICIAL DIGITAL INCIDENT REPORT`);
    lines.push(`Generated: ${new Date().toUTCString()}`);
    lines.push(`Incident Category: ${currentProtocol.title}`);
    lines.push(``);
    lines.push(`## 1. Incident Chronology & Details`);
    lines.push(`- **Incident Timestamp:** ${incidentData.timestamp}`);
    if (incidentData.bankName) lines.push(`- **Institution Involved:** ${incidentData.bankName}`);
    if (incidentData.amount) lines.push(`- **Amount Transferred/At Risk:** ${incidentData.amount}`);
    if (incidentData.transactionRef) lines.push(`- **Transaction Reference (UTR/Ref):** \`${incidentData.transactionRef}\``);
    if (incidentData.contactNumberCalled) lines.push(`- **Fraudulent Number/Contact:** ${incidentData.contactNumberCalled}`);
    if (incidentData.notes) lines.push(`- **Investigator Notes:** ${incidentData.notes}`);
    lines.push(``);
    lines.push(`## 2. Emergency Steps Executed`);
    for (const st of currentProtocol.steps) {
      lines.push(`- [ ] **Step ${st.id}:** ${st.heading}`);
      lines.push(`  ${st.details}`);
    }
    lines.push(``);
    lines.push(`## 3. Official Support Helplines`);
    lines.push(`- **National Cybercrime Reporting Helpline (India):** Dial \`1930\` | Portal: \`cybercrime.gov.in\``);
    lines.push(`- **National Consumer Helpline:** Dial \`1915\``);
    lines.push(`- **US Internet Crime Complaint Center (IC3):** \`ic3.gov\``);
    lines.push(`- **UK Action Fraud:** \`actionfraud.police.uk\` | Dial \`0300 123 2040\``);
    lines.push(``);
    lines.push(`---`);
    lines.push(`*Generated via Sondera Emergency Response Companion*`);
    return lines.join('\n');
  };

  const handleCopyReport = async () => {
    await navigator.clipboard.writeText(generateIncidentReportMarkdown());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadReport = () => {
    const md = generateIncidentReportMarkdown();
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sondera_Incident_Report_${Date.now()}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Banner */}
      <div className="bg-red-50 dark:bg-red-950/40 p-6 rounded-3xl border border-red-200 dark:border-red-900 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-600 text-white">
              Immediate Incident Response
            </span>
            <span className="text-xs text-red-700 dark:text-red-300 font-semibold">
              Calm, decisive action protocol
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-red-950 dark:text-red-100 flex items-center gap-2">
            <AlertOctagon className="w-6 h-6 text-red-600" />
            <span>I Clicked or Shared — What Do I Do Now?</span>
          </h1>
          <p className="text-xs text-red-800 dark:text-red-300 mt-1 max-w-xl">
            Do not panic. Scammers rely on shame and delay to drain funds. Follow the step-by-step containment protocol below to limit damage and contact official channels.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-surface-darkCard border border-red-200 dark:border-red-800 text-center shadow-xs">
          <span className="block text-[11px] font-bold uppercase text-red-700 dark:text-red-400">
            India Cyber Emergency Line
          </span>
          <a
            href="tel:1930"
            className="text-2xl font-extrabold text-red-600 hover:underline tracking-tight block"
          >
            📞 1930
          </a>
          <span className="text-[10px] text-ink-muted">citizen financial fraud hotline</span>
        </div>
      </div>

      {/* Selector: What happened? */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          type="button"
          onClick={() => setSelectedEmergency('money_sent')}
          className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
            selectedEmergency === 'money_sent'
              ? 'border-red-600 bg-red-50 dark:bg-red-950/60 font-semibold shadow-xs'
              : 'border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          <CreditCard className="w-5 h-5 text-red-600 mb-2" />
          <span className="text-xs text-ink-primary dark:text-neutral-100">Transferred Money / UPI</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedEmergency('otp_shared')}
          className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
            selectedEmergency === 'otp_shared'
              ? 'border-red-600 bg-red-50 dark:bg-red-950/60 font-semibold shadow-xs'
              : 'border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          <KeyRound className="w-5 h-5 text-red-600 mb-2" />
          <span className="text-xs text-ink-primary dark:text-neutral-100">Disclosed OTP / Code</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedEmergency('password_entered')}
          className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
            selectedEmergency === 'password_entered'
              ? 'border-amber-600 bg-amber-50 dark:bg-amber-950/60 font-semibold shadow-xs'
              : 'border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          <Lock className="w-5 h-5 text-amber-600 mb-2" />
          <span className="text-xs text-ink-primary dark:text-neutral-100">Entered Password</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedEmergency('remote_app_installed')}
          className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
            selectedEmergency === 'remote_app_installed'
              ? 'border-red-600 bg-red-50 dark:bg-red-950/60 font-semibold shadow-xs'
              : 'border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:bg-neutral-50 dark:hover:bg-neutral-800'
          }`}
        >
          <Smartphone className="w-5 h-5 text-red-600 mb-2" />
          <span className="text-xs text-ink-primary dark:text-neutral-100">Installed Remote App / APK</span>
        </button>
      </div>

      {/* Protocol Steps Container */}
      <div className="bg-white dark:bg-surface-darkCard rounded-3xl border border-surface-border dark:border-surface-darkBorder p-6 shadow-sm space-y-6">
        <div className="border-b border-surface-border/50 dark:border-surface-darkBorder/50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${currentProtocol.badgeColor}`}>
                {currentProtocol.urgency}
              </span>
            </div>
            <h2 className="text-lg font-bold text-ink-primary dark:text-neutral-100">
              {currentProtocol.title}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted dark:bg-surface-darkMuted text-xs font-medium text-ink-primary dark:text-neutral-200 hover:bg-neutral-100"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied Log' : 'Copy Log'}</span>
            </button>
            <button
              onClick={handleDownloadReport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-medium"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Incident Log (.md)</span>
            </button>
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {currentProtocol.steps.map((st) => (
            <div
              key={st.id}
              className="p-4 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-surface-light/40 dark:bg-surface-dark/40 flex items-start gap-3.5"
            >
              <div className="w-7 h-7 rounded-full bg-forest-900 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                {st.id}
              </div>
              <div>
                <h4 className="text-sm font-bold text-ink-primary dark:text-neutral-100">
                  {st.heading}
                </h4>
                <p className="text-xs text-ink-secondary dark:text-neutral-300 mt-1 leading-relaxed">
                  {st.details}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Incident Details Logger for Police / Bank Claim */}
        <div className="pt-4 border-t border-surface-border/50 dark:border-surface-darkBorder/50 space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-forest-700 dark:text-forest-400" />
            <span>Document Incident Details for Formal Bank / Police Report</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-ink-secondary dark:text-neutral-300 mb-1">
                Your Bank Name
              </label>
              <input
                type="text"
                value={incidentData.bankName}
                onChange={(e) => setIncidentData({ ...incidentData, bankName: e.target.value })}
                placeholder="e.g. State Bank of India, HDFC"
                className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-secondary dark:text-neutral-300 mb-1">
                Transaction Reference / UTR
              </label>
              <input
                type="text"
                value={incidentData.transactionRef}
                onChange={(e) => setIncidentData({ ...incidentData, transactionRef: e.target.value })}
                placeholder="e.g. 12-digit UTR from SMS"
                className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-ink-secondary dark:text-neutral-300 mb-1">
                Amount (if transferred)
              </label>
              <input
                type="text"
                value={incidentData.amount}
                onChange={(e) => setIncidentData({ ...incidentData, amount: e.target.value })}
                placeholder="e.g. ₹15,000"
                className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
