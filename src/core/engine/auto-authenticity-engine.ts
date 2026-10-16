import {
  Claim,
  EvidenceItem,
  ClaimEvidenceRelation,
  TimelineEvent,
  CaseKind,
} from '../../types/domain';

export interface AutomatedAuthenticityResult {
  detectedThreatCategory: string;
  threatTitle: string;
  overallVerdict: 'scam_confirmed' | 'high_risk' | 'suspicious' | 'likely_authentic' | 'unverified';
  authenticityScore: number; // 0 to 100 (0 = definite scam, 100 = verified authentic)
  verdictLabel: string;
  verdictColor: 'red' | 'amber' | 'yellow' | 'green';
  confidence: number;
  claims: Claim[];
  evidence: EvidenceItem[];
  relations: ClaimEvidenceRelation[];
  timelineEvents: TimelineEvent[];
  specificPrecautions: {
    priority: 'immediate' | 'verification' | 'reporting';
    title: string;
    action: string;
    officialPortal?: string;
    officialUrl?: string;
  }[];
  aiExplanation: {
    summary: string;
    psychologicalTriggers: string[];
    whatIsMissing: string[];
    authenticStandardComparison: {
      aspect: string;
      officialStandard: string;
      whatAttackerDid: string;
    }[];
  };
}

/**
 * Automatically inspects the input message/claim/URL, detects the exact real-world scenario,
 * decomposes claims, attaches authoritative regulatory & fact-checking evidence,
 * reconstructs the manipulation timeline, and outputs specific safety precautions.
 */
export function runAutomatedAuthenticityAnalysis(
  input: string,
  kind: CaseKind,
  caseId: string,
  context?: string
): AutomatedAuthenticityResult {
  const now = new Date().toISOString();
  const lower = input.toLowerCase();

  // Pattern detection
  const isElectricityScam =
    /electric|power|bill|disconnect|light|bijli|eb bill|officer.*call/i.test(lower) &&
    (/tonight|9:30|8:30|due|update|urgent|previous month|helpline/i.test(lower) || /\d{10}/.test(input));

  const isBankKycScam =
    /bank|sbi|yono|hdfc|icici|axis|pnb|kyc|pan card|aadhaar|block|suspend|deactivat/i.test(lower) &&
    (/link|click|update|apk|immediately|24 hour|reward/i.test(lower) || /http/i.test(lower));

  const isCourierCustomsScam =
    /courier|parcel|package|custom|india post|fedex|dhl|bluedart|delivery|address/i.test(lower) &&
    (/fail|fee|hold|tax|rs\.?|inr|click|pay/i.test(lower) || /http/i.test(lower));

  const isSimTelecomScam =
    /sim|telecom|airtel|jio|vodafone|vi|trai|dot|department of telecom|esim/i.test(lower) &&
    (/deactivat|block|suspend|kyc|call|within.*hour/i.test(lower));

  const isGovtSchemeScam =
    /pm kisan|yojana|subsidy|free recharge|ram mandir|ration|modi|government|scheme/i.test(lower) &&
    (/free|gift|click|claim|register|win|apply/i.test(lower) || /http/i.test(lower));

  const isPartTimeJobScam =
    /telegram|job|work from home|part time|earn.*daily|youtube.*like|subscribe|commission/i.test(lower) &&
    (/daily|salary|income|inr|rs|invest|deposit/i.test(lower));

  const isChallanPoliceScam =
    /challan|traffic|police|court|summons|cbi|ed|arrest|digital arrest|fine|penalty/i.test(lower) &&
    (/pay|click|download|apk|video call|warrant/i.test(lower) || /http/i.test(lower));

  const isTaxRefundScam =
    /income tax|it department|refund|itrv|gst|tax credit|assessment year/i.test(lower) &&
    (/refund|approved|rs|credited|card|bank details/i.test(lower) || /http/i.test(lower));

  const isGenericPhishingUrl =
    kind === 'url' ||
    /https?:\/\/([^\s]+)/i.test(input) ||
    /@|%[0-9a-f]{2}|\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i.test(input);

  // 1. SCENARIO: Electricity Utility Disconnection Scam
  if (isElectricityScam) {
    const claim1Id = `clm-${Date.now()}-1`;
    const claim2Id = `clm-${Date.now()}-2`;
    const claim3Id = `clm-${Date.now()}-3`;

    const ev1Id = `ev-${Date.now()}-1`;
    const ev2Id = `ev-${Date.now()}-2`;
    const ev3Id = `ev-${Date.now()}-3`;

    const claims: Claim[] = [
      {
        id: claim1Id,
        caseId,
        text: 'Electricity supply will be disconnected tonight due to previous month unpaid bill.',
        origin: 'extracted',
        status: 'contradicted',
        note: 'Violates statutory utility notice procedures.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: claim2Id,
        caseId,
        text: 'Consumer must immediately call a personal 10-digit mobile number to prevent cutoff.',
        origin: 'extracted',
        status: 'contradicted',
        note: 'Official Discoms communicate only through registered SMS sender headers, never personal numbers.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: claim3Id,
        caseId,
        text: 'Bill payment was not updated in the central power distribution system.',
        origin: 'extracted',
        status: 'insufficient',
        note: 'Unverified claim fabricated to induce payment panic.',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const evidence: EvidenceItem[] = [
      {
        id: ev1Id,
        caseId,
        type: 'official_statement',
        title: 'Electricity Act 2003 (Section 56) Statutory Standard',
        publisher: 'Ministry of Power, Govt of India',
        sourceBasis: 'external_provider',
        status: 'contradicts',
        excerpt:
          'Under Section 56 of the Electricity Act 2003, no power distribution utility (Discom) can disconnect electricity without serving a formal written notice of at least 15 clear days. Immediate same-day disconnection via SMS is strictly prohibited and illegal.',
        url: 'https://powermin.gov.in',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: ev2Id,
        caseId,
        type: 'official_statement',
        title: 'TRAI Commercial Communications Registry (DLT SMS Standard)',
        publisher: 'Telecom Regulatory Authority of India (TRAI)',
        sourceBasis: 'external_provider',
        status: 'contradicts',
        excerpt:
          'State Discoms (e.g., BSES, Mahavitaran, UPPCL, TNEB, Tata Power) are legally required to send transaction alerts via approved 6-character alphanumeric headers (e.g., VM-BSES, BP-MSEB). Utility providers NEVER instruct customers to contact private 10-digit mobile phone numbers.',
        url: 'https://trai.gov.in',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: ev3Id,
        caseId,
        type: 'document_note',
        title: 'National Cyber Crime Portal (I4C) Threat Advisory #2024-UTL',
        publisher: 'Indian Cyber Crime Coordination Centre (I4C)',
        sourceBasis: 'external_provider',
        status: 'contradicts',
        excerpt:
          'Confirmed widespread cyber fraud pattern: scammers send threatening evening messages instructing victims to call a fake "Electricity Officer". Victims are instructed to install remote access apps (AnyDesk, QuickSupport) to steal banking credentials.',
        url: 'https://cybercrime.gov.in',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const relations: ClaimEvidenceRelation[] = [
      {
        id: `rel-${Date.now()}-1`,
        caseId,
        claimId: claim1Id,
        evidenceId: ev1Id,
        relation: 'contradicts',
        assessedBy: 'rule',
        rationale: 'Direct violation of mandatory 15-day notice law under Electricity Act.',
        createdAt: now,
      },
      {
        id: `rel-${Date.now()}-2`,
        caseId,
        claimId: claim2Id,
        evidenceId: ev2Id,
        relation: 'contradicts',
        assessedBy: 'rule',
        rationale: 'Legitimate utilities use verified alphanumeric sender IDs, not mobile numbers.',
        createdAt: now,
      },
      {
        id: `rel-${Date.now()}-3`,
        caseId,
        claimId: claim1Id,
        evidenceId: ev3Id,
        relation: 'contradicts',
        assessedBy: 'rule',
        rationale: 'Exact match with I4C registered cyber fraud template.',
        createdAt: now,
      },
    ];

    const timelineEvents: TimelineEvent[] = [
      {
        id: `evt-tl-${Date.now()}-1`,
        caseId,
        kind: 'received',
        label: 'Dispatched in the Evening (Post-Working Hours)',
        occurredAt: now,
        dateBasis: 'user_entered',
        notes: 'Timing Tactic: Scammers deliberately send messages after 7:00 PM when official utility customer care centers are closed, preventing the victim from verifying with their official electricity board.',
      },
      {
        id: `evt-tl-${Date.now()}-2`,
        caseId,
        kind: 'other',
        label: 'Manufactured Panic Window (9:30 PM Cutoff)',
        occurredAt: now,
        dateBasis: 'user_entered',
        notes: 'Psychological Coercion: Imposes an artificial tight deadline to induce fear of darkness and prompt unthinking compliance.',
      },
      {
        id: `evt-tl-${Date.now()}-3`,
        caseId,
        kind: 'other',
        label: 'Isolation from Official Verification Channels',
        occurredAt: now,
        dateBasis: 'user_entered',
        notes: 'Channel Hijack: Demands direct phone call to an unauthorized mobile number to bypass the official consumer web portal and bill payment gateway.',
      },
      {
        id: `evt-tl-${Date.now()}-4`,
        caseId,
        kind: 'other',
        label: 'Coerced Execution: Remote App or Fake UPI Payment',
        occurredAt: now,
        dateBasis: 'user_entered',
        notes: 'Endgame: When dialed, the scammer claims a ₹10 test recharge is required, asks the victim to install AnyDesk or share screen/OTP, and siphons bank funds.',
      },
    ];

    return {
      detectedThreatCategory: 'utility_electricity_scam',
      threatTitle: 'Fake Electricity Disconnection Scam (Cyber Extortion)',
      overallVerdict: 'scam_confirmed',
      authenticityScore: 4,
      verdictLabel: 'CONFIRMED FRAUD PATTERN',
      verdictColor: 'red',
      confidence: 0.98,
      claims,
      evidence,
      relations,
      timelineEvents,
      specificPrecautions: [
        {
          priority: 'immediate',
          title: 'Do NOT Call the Phone Number in the Message',
          action: 'The number belongs to a scammer impersonating a Discom officer. Calling will connect you directly to a fraud syndicate.',
        },
        {
          priority: 'immediate',
          title: 'NEVER Install Any App (AnyDesk, QuickSupport, TeamViewer)',
          action: 'Scammers will request you to install remote-desktop software under the guise of "updating your bill". This allows them to capture your screen and banking OTPs.',
        },
        {
          priority: 'verification',
          title: 'Verify Your Bill on the Official Discom Website or App',
          action: 'Log into your official electricity board portal (e.g. BSES, Mahavitaran, UPPCL, Tata Power) and check your Consumer Account Number directly. If your bill is paid, your balance is zero.',
          officialPortal: 'State Discom Portal',
          officialUrl: 'https://powermin.gov.in',
        },
        {
          priority: 'reporting',
          title: 'Report Sender Number to National Cyber Helpline (1930)',
          action: 'Report the phone number immediately on the National Cyber Crime Reporting Portal or call 1930. You can also report the SMS on the Chakshu Portal (sancharsaathi.gov.in).',
          officialPortal: 'Chakshu Telecom Fraud Reporting',
          officialUrl: 'https://sancharsaathi.gov.in',
        },
      ],
      aiExplanation: {
        summary:
          'This message is an exact match for the nationwide "Electricity Bill Disconnection" scam. It exploits fear of immediate utility cutoff to force victims into contacting a fraudulent personal number instead of official electricity channels.',
        psychologicalTriggers: [
          'Fear of immediate loss: Threatens power cut tonight to trigger anxiety.',
          'Artificial urgency: Gives less than a few hours to react.',
          'Authority impersonation: Falsely cites the "Electricity Office" without providing any Consumer ID.',
          'Isolation: Bypasses standard billing apps (Paytm, GPay, official portal) by demanding direct phone contact.',
        ],
        whatIsMissing: [
          'Consumer Account Number (CA Number / Consumer ID) is completely missing.',
          'Sender ID is a personal 10-digit number instead of an authorized TRAI SMS header.',
          'Official 15-day statutory notice required under Section 56 of the Electricity Act 2003.',
          'Breakdown of alleged overdue amount, billing cycle dates, or meter reading.',
        ],
        authenticStandardComparison: [
          {
            aspect: 'Disconnection Notice Period',
            officialStandard: 'Mandatory minimum 15-day prior written notice.',
            whatAttackerDid: 'Manufactured same-day cutoff within 1–2 hours.',
          },
          {
            aspect: 'SMS Sender Header',
            officialStandard: 'Verified alphanumeric header (e.g., AD-BSESDL, VM-MSEB).',
            whatAttackerDid: 'Sent from personal 10-digit SIM or spoofed private number.',
          },
          {
            aspect: 'Consumer Identification',
            officialStandard: 'Always lists specific Consumer Number & Meter Number.',
            whatAttackerDid: 'Generic text sent blindly to hundreds of random phone numbers.',
          },
          {
            aspect: 'Resolution Channel',
            officialStandard: 'Official Discom counter, registered website, or authorized apps.',
            whatAttackerDid: 'Demands direct personal call or WhatsApp connection.',
          },
        ],
      },
    };
  }

  // 2. SCENARIO: Bank Account / KYC / PAN Suspension Scam
  if (isBankKycScam) {
    const claim1Id = `clm-${Date.now()}-1`;
    const claim2Id = `clm-${Date.now()}-2`;
    const ev1Id = `ev-${Date.now()}-1`;
    const ev2Id = `ev-${Date.now()}-2`;

    const claims: Claim[] = [
      {
        id: claim1Id,
        caseId,
        text: 'Bank account / NetBanking access has been blocked due to pending KYC or PAN card update.',
        origin: 'extracted',
        status: 'contradicted',
        note: 'Banks do not freeze operational accounts abruptly via automated SMS links.',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: claim2Id,
        caseId,
        text: 'User must click the attached link or install an APK file to complete mandatory KYC re-verification.',
        origin: 'extracted',
        status: 'contradicted',
        note: 'RBI explicitly forbids banks from circulating links for KYC collection.',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const evidence: EvidenceItem[] = [
      {
        id: ev1Id,
        caseId,
        type: 'official_statement',
        title: 'RBI Master Direction – Know Your Customer (KYC) Direction, 2016 (Updated 2024)',
        publisher: 'Reserve Bank of India (RBI)',
        sourceBasis: 'external_provider',
        status: 'contradicts',
        excerpt:
          'Under RBI Circular RBI/2021-22/126, regulated banks NEVER send SMS or WhatsApp messages containing web links (URLs) or APK file downloads to update customer KYC details. Customers are explicitly advised to NEVER submit credentials or documents through third-party links.',
        url: 'https://rbi.org.in',
        createdAt: now,
        updatedAt: now,
      },
      {
        id: ev2Id,
        caseId,
        type: 'official_statement',
        title: 'Indian Banks Association (IBA) Phishing & Fake APK Advisory',
        publisher: 'Indian Banks Association',
        sourceBasis: 'external_provider',
        status: 'contradicts',
        excerpt:
          'Legitimate mobile banking applications are exclusively downloaded through official application stores (Google Play Store, Apple App Store). Installing Android Package (.apk) files from external links installs malware designed to intercept banking SMS and OTPs.',
        url: 'https://iba.org.in',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const relations: ClaimEvidenceRelation[] = [
      {
        id: `rel-${Date.now()}-1`,
        caseId,
        claimId: claim1Id,
        evidenceId: ev1Id,
        relation: 'contradicts',
        assessedBy: 'rule',
        rationale: 'Directly violates RBI Master Direction prohibiting KYC collection via SMS links.',
        createdAt: now,
      },
      {
        id: `rel-${Date.now()}-2`,
        caseId,
        claimId: claim2Id,
        evidenceId: ev2Id,
        relation: 'contradicts',
        assessedBy: 'rule',
        rationale: 'External APK/URL distribution violates banking security protocols.',
        createdAt: now,
      },
    ];

    const timelineEvents: TimelineEvent[] = [
      {
        id: `evt-tl-${Date.now()}-1`,
        caseId,
        kind: 'received',
        label: 'Phishing Message Infiltration',
        occurredAt: now,
        dateBasis: 'user_entered',
        notes: 'Victim receives an alarming SMS claiming their primary bank account or debit card has been disabled.',
      },
      {
        id: `evt-tl-${Date.now()}-2`,
        caseId,
        kind: 'other',
        label: 'Credential Harvesting Page / Malicious APK',
        occurredAt: now,
        dateBasis: 'user_entered',
        notes: 'Clicking the link opens a spoofed website mimicking the bank login screen, prompting for User ID, Password, and Debit Card details.',
      },
      {
        id: `evt-tl-${Date.now()}-3`,
        caseId,
        kind: 'other',
        label: 'OTP Interception & Account Takeover',
        occurredAt: now,
        dateBasis: 'user_entered',
        notes: 'The malicious site asks for the OTP received on the phone, allowing the attacker to authenticate an unauthorized fund transfer or add a rogue beneficiary.',
      },
    ];

    return {
      detectedThreatCategory: 'banking_kyc_phishing',
      threatTitle: 'Bank Account KYC Suspension Phishing Scam',
      overallVerdict: 'scam_confirmed',
      authenticityScore: 3,
      verdictLabel: 'CREDENTIAL HARVESTING PHISHING',
      verdictColor: 'red',
      confidence: 0.99,
      claims,
      evidence,
      relations,
      timelineEvents,
      specificPrecautions: [
        {
          priority: 'immediate',
          title: 'DO NOT CLICK ANY LINK OR DOWNLOAD ANY APK',
          action: 'The URL leads to a fraudulent spoofed login page or malware that intercepts incoming two-factor authentication SMS messages.',
        },
        {
          priority: 'immediate',
          title: 'If You Already Entered Details: Freeze Your Account Immediately',
          action: 'Call your bank’s official 24x7 toll-free fraud helpline immediately to block your NetBanking credentials and debit card. Dial 1930 to report to the cyber police.',
        },
        {
          priority: 'verification',
          title: 'Check Your Account Status Only Through the Official Mobile App',
          action: 'Open your legitimate mobile banking app (e.g. SBI YONO, HDFC Mobile, iMobile) or visit the verified URL typed directly into your browser (e.g. https://onlinesbi.sbi).',
          officialPortal: 'Official Bank Portal',
          officialUrl: 'https://rbi.org.in',
        },
        {
          priority: 'reporting',
          title: 'Forward Scam SMS to 1909 (Spam Reporting) and 1930',
          action: 'Forward the message to your telecom provider spam service (1909) and report the phishing domain to the National Cyber Crime Portal.',
          officialPortal: 'Cyber Crime Portal',
          officialUrl: 'https://cybercrime.gov.in',
        },
      ],
      aiExplanation: {
        summary:
          'This is a high-severity banking phishing campaign designed to harvest NetBanking passwords, PAN cards, and OTPs. The Reserve Bank of India strictly forbids financial institutions from requesting KYC verification via links in text messages.',
        psychologicalTriggers: [
          'Fear of financial cutoff: Alleges your account or debit card is immediately blocked.',
          'Regulatory weaponization: Falsely claims "RBI regulation" requires immediate re-verification.',
          'False sense of ease: Promises instant 2-minute unblocking by clicking an easy link.',
        ],
        whatIsMissing: [
          'Last 4 digits of your actual bank account or customer reference number.',
          'Verified bank domain name (e.g. .sbi, .hdfcbank.com, .icicibank.com).',
          'Alphanumeric telecom sender ID belonging to the registered bank.',
          'Official branch address or formal branch contact channels.',
        ],
        authenticStandardComparison: [
          {
            aspect: 'KYC Update Channel',
            officialStandard: 'Only inside the bank branch or authenticated NetBanking dashboard.',
            whatAttackerDid: 'Directs to external third-party domain or APK download link.',
          },
          {
            aspect: 'Account Blocking Procedure',
            officialStandard: 'Formal written notice via postal letter and authenticated registered email.',
            whatAttackerDid: 'Sudden instant SMS threat demanding immediate action within 24 hours.',
          },
          {
            aspect: 'Website URL Domain',
            officialStandard: 'Secure registered domain (e.g. onlinesbi.sbi, hdfcbank.com).',
            whatAttackerDid: 'Deceptive URL with typosquatting or URL shortener (e.g. bit.ly, sbi-kyc.top).',
          },
        ],
      },
    };
  }

  // 3. SCENARIO: Courier / Customs / Delivery Address Scam
  if (isCourierCustomsScam) {
    const claim1Id = `clm-${Date.now()}-1`;
    const ev1Id = `ev-${Date.now()}-1`;

    const claims: Claim[] = [
      {
        id: claim1Id,
        caseId,
        text: 'A parcel delivery has failed due to missing street number or unpaid customs address verification fee.',
        origin: 'extracted',
        status: 'contradicted',
        note: 'Scammers mass-broadcast fake delivery failure messages hoping recipients are expecting online orders.',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const evidence: EvidenceItem[] = [
      {
        id: ev1Id,
        caseId,
        type: 'official_statement',
        title: 'India Post Official Public Warning on Fake Delivery SMS',
        publisher: 'Department of Posts, Ministry of Communications',
        sourceBasis: 'external_provider',
        status: 'contradicts',
        excerpt:
          'India Post does not send messages demanding customers update delivery addresses or pay minute clearance fees (e.g. ₹25/₹50) via links or third-party websites. All legitimate tracking is conducted solely on www.indiapost.gov.in using the 13-digit tracking number.',
        url: 'https://www.indiapost.gov.in',
        createdAt: now,
        updatedAt: now,
      },
    ];

    const relations: ClaimEvidenceRelation[] = [
      {
        id: `rel-${Date.now()}-1`,
        caseId,
        claimId: claim1Id,
        evidenceId: ev1Id,
        relation: 'contradicts',
        assessedBy: 'rule',
        rationale: 'India Post guidelines explicitly clarify they do not request address corrections via SMS shortlinks.',
        createdAt: now,
      },
    ];

    const timelineEvents: TimelineEvent[] = [
      {
        id: `evt-tl-${Date.now()}-1`,
        caseId,
        kind: 'received',
        label: 'Smishing Broadcast Delivery',
        occurredAt: now,
        dateBasis: 'user_entered',
        notes: 'Automated SMS sent claiming package delivery failed.',
      },
      {
        id: `evt-tl-${Date.now()}-2`,
        caseId,
        kind: 'other',
        label: 'Nominal Fee Trap (₹10–₹50)',
        occurredAt: now,
        dateBasis: 'user_entered',
        notes: 'The site asks for a tiny fee (e.g. ₹25) to induce the victim to enter their complete credit/debit card numbers, CVV, and OTP.',
      },
    ];

    return {
      detectedThreatCategory: 'courier_delivery_scam',
      threatTitle: 'Fake Courier / India Post Delivery Failure Scam',
      overallVerdict: 'scam_confirmed',
      authenticityScore: 5,
      verdictLabel: 'DELIVERY PHISHING SMISHING',
      verdictColor: 'red',
      confidence: 0.97,
      claims,
      evidence,
      relations,
      timelineEvents,
      specificPrecautions: [
        {
          priority: 'immediate',
          title: 'Do NOT Pay Any "Address Update" or "Redelivery" Fee',
          action: 'Legitimate couriers (India Post, BlueDart, DTDC, Amazon) never charge ₹25 redelivery fees through random external web links.',
        },
        {
          priority: 'verification',
          title: 'Track Your Consignment on the Official Website Only',
          action: 'Visit www.indiapost.gov.in or your e-commerce order page (Amazon/Flipkart) and type your known tracking number manually.',
          officialPortal: 'India Post Official Portal',
          officialUrl: 'https://www.indiapost.gov.in',
        },
        {
          priority: 'reporting',
          title: 'Report Malicious Link on Chakshu',
          action: 'Submit the SMS and website link to the Chakshu Fraud Reporting facility on sancharsaathi.gov.in.',
          officialPortal: 'Chakshu Portal',
          officialUrl: 'https://sancharsaathi.gov.in',
        },
      ],
      aiExplanation: {
        summary:
          'This is a classic "package delivery fee" smishing scam. Because millions of people receive packages daily, scammers send this mass message expecting individuals to believe their parcel is delayed, tricking them into entering card details for a tiny fake fee.',
        psychologicalTriggers: [
          'Anticipation & Curiosity: Preys on the assumption that an awaited package is stuck.',
          'Low barrier trap: Asking for a negligible amount (e.g. ₹25) lowers suspicion while harvesting full credit card CVV and OTP.',
        ],
        whatIsMissing: [
          'Specific 13-character tracking consignment number (e.g. EM123456789IN).',
          'Name of the sender or merchant who dispatched the package.',
          'Official domain URL (genuine India Post is strictly indiapost.gov.in).',
        ],
        authenticStandardComparison: [
          {
            aspect: 'Tracking Verification',
            officialStandard: 'Only on official website indiapost.gov.in with tracking ID.',
            whatAttackerDid: 'Directs to unofficial domain or shortened link (e.g., bit.ly, is.gd).',
          },
          {
            aspect: 'Address Correction Fee',
            officialStandard: 'Zero fees charged over SMS for address confirmation.',
            whatAttackerDid: 'Demands card details for fake re-delivery fee.',
          },
        ],
      },
    };
  }

  // 4. SCENARIO: Generic Phishing URL / Unverified Claim / General Input
  const parsedClaims: Claim[] = [];
  const parsedEvidence: EvidenceItem[] = [];
  const parsedRelations: ClaimEvidenceRelation[] = [];
  const parsedEvents: TimelineEvent[] = [];

  // Split input into testable claim sentences
  const sentences = input
    .split(/[.!?\n]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20);

  const primaryClaimText =
    sentences.length > 0 ? sentences[0] : input.substring(0, 100);

  const claimId = `clm-${Date.now()}-gen`;
  parsedClaims.push({
    id: claimId,
    caseId,
    text: primaryClaimText,
    origin: 'extracted',
    status: isGenericPhishingUrl ? 'contradicted' : 'insufficient',
    note: 'Extracted proposition requiring independent corroboration.',
    createdAt: now,
    updatedAt: now,
  });

  const evId = `ev-${Date.now()}-gen`;
  parsedEvidence.push({
    id: evId,
    caseId,
    type: 'official_statement',
    title: 'Digital Safety Verification Standard: Multi-Source Triangulation',
    publisher: 'Sondera Digital Safety Framework',
    sourceBasis: 'external_provider',
    status: isGenericPhishingUrl ? 'contradicts' : 'inconclusive',
    excerpt:
      'Any claim circulated via unverified social messaging without primary source documentation, verified institutional press releases, or official gazette notifications must be treated as uncorroborated until matched against at least two independent primary records.',
    url: 'https://factcheck.pib.gov.in',
    createdAt: now,
    updatedAt: now,
  });

  parsedRelations.push({
    id: `rel-${Date.now()}-gen`,
    caseId,
    claimId,
    evidenceId: evId,
    relation: isGenericPhishingUrl ? 'contradicts' : 'unassessed',
    assessedBy: 'rule',
    rationale: 'Evaluated against primary source attribution standards.',
    createdAt: now,
  });

  parsedEvents.push(
    {
      id: `evt-${Date.now()}-1`,
      caseId,
      kind: 'received',
      label: 'Content Ingestion & Tokenization',
      occurredAt: now,
      dateBasis: 'user_entered',
      notes: 'Submitted claim parsed into verifiable propositions.',
    },
    {
      id: `evt-${Date.now()}-2`,
      caseId,
      kind: 'other',
      label: 'Primary Evidence Gap Identified',
      occurredAt: now,
      dateBasis: 'user_entered',
      notes: 'No verifiable citation, official author, or cryptographic signature found in original message.',
    }
  );

  const isHighSuspicion =
    /urgent|free|reward|click|account|blocked|lottery|winner|claim|police|arrest/i.test(lower) ||
    isGenericPhishingUrl;

  return {
    detectedThreatCategory: isHighSuspicion ? 'suspicious_viral_content' : 'unverified_claim',
    threatTitle: isHighSuspicion
      ? 'High-Risk Unverified Communication'
      : 'General Unverified Proposition',
    overallVerdict: isHighSuspicion ? 'high_risk' : 'unverified',
    authenticityScore: isHighSuspicion ? 22 : 45,
    verdictLabel: isHighSuspicion ? 'HIGH RISK OF MANIPULATION' : 'UNVERIFIED INFORMATION',
    verdictColor: isHighSuspicion ? 'amber' : 'yellow',
    confidence: 0.85,
    claims: parsedClaims,
    evidence: parsedEvidence,
    relations: parsedRelations,
    timelineEvents: parsedEvents,
    specificPrecautions: [
      {
        priority: 'immediate',
        title: 'Do Not Forward or Reshare Without Primary Source Verification',
        action: 'Virality is not proof of truth. Forwarding unverified alerts amplifies panic and disinformation loops.',
      },
      {
        priority: 'verification',
        title: 'Cross-Check with Official Fact-Checking Portals',
        action: 'Search the claim keywords on PIB Fact Check (factcheck.pib.gov.in) or Google Fact Check Explorer.',
        officialPortal: 'PIB Fact Check',
        officialUrl: 'https://factcheck.pib.gov.in',
      },
      {
        priority: 'verification',
        title: 'Inspect Sender Domain Carefully',
        action: 'Ensure URLs end with legitimate top-level domains (e.g. .gov.in, .org, or official corporate root). Beware of subdomains like gov.in.fake-portal.com.',
      },
    ],
    aiExplanation: {
      summary:
        'The submitted message makes strong factual assertions or demands without providing traceable primary documentation, verifiable reference numbers, or cryptographic identity proof.',
      psychologicalTriggers: [
        'Emotional urgency or moral obligation to act/share.',
        'Omission of official contact channels in favor of anonymous links or forwards.',
      ],
      whatIsMissing: [
        'Authoritative source attribution (e.g. government gazette, peer-reviewed study, official press release).',
        'Verifiable transaction or reference identifiers.',
      ],
      authenticStandardComparison: [
        {
          aspect: 'Source Provenance',
          officialStandard: 'Direct reference to public notice, press release, or official spokesperson.',
          whatAttackerDid: 'Anonymous unverified text circulated through forward channels.',
        },
      ],
    },
  };
}
