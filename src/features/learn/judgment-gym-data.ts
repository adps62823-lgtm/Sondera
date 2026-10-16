export interface GymLesson {
  id: string;
  category: 'message' | 'url' | 'evidence' | 'privacy';
  title: string;
  conceptSummary: string;
  scenario: string;
  question: string;
  options: {
    id: string;
    text: string;
    isBest: boolean;
    explanation: string;
  }[];
  practicalTakeaway: string;
}

export const JUDGMENT_GYM_LESSONS: GymLesson[] = [
  {
    id: 'lesson-urgency-cues',
    category: 'message',
    title: 'Deconstructing Artificial Urgency',
    conceptSummary: 'Attackers create manufactured deadlines to trigger fear and bypass critical thinking.',
    scenario: 'You receive an SMS: "URGENT: Your primary bank account will be permanently blocked in 45 minutes due to pending KYC documents. Update now at http://bank-kyc-quick.xyz or lose access."',
    question: 'What is the most prudent immediate action?',
    options: [
      {
        id: 'a',
        text: 'Click the link immediately so your account does not get blocked.',
        isBest: false,
        explanation: 'Clicking unrequested links under pressure is precisely what the attacker hopes you will do.'
      },
      {
        id: 'b',
        text: 'Ignore the link, open your official banking app or visit the bank\'s known bookmarked website to check notifications.',
        isBest: true,
        explanation: 'Correct! Banks never shut down accounts on a 45-minute SMS ultimatum. Genuine KYC notices provide advance written communication and can be verified via official channels.'
      },
      {
        id: 'c',
        text: 'Reply to the SMS asking if this is really the bank.',
        isBest: false,
        explanation: 'Replying to an SMS confirms your number is active and keeps you communicating directly with the potential imposter.'
      }
    ],
    practicalTakeaway: 'When an unexpected message demands action within minutes or hours, pause. Verify through your own independent bookmarks or apps.'
  },
  {
    id: 'lesson-userinfo-trick',
    category: 'url',
    title: 'The Hostname vs. User-Info "@" Trap',
    conceptSummary: 'URLs can deceive human eyes by placing a trusted brand before an "@" symbol.',
    scenario: 'A message contains a link formatted as: https://secure.paypal.com@verify-account-gate.com/login',
    question: 'Which server will your browser actually contact if you tap this link?',
    options: [
      {
        id: 'a',
        text: 'secure.paypal.com (PayPal\'s official server)',
        isBest: false,
        explanation: 'Incorrect. In standard URL parsing (RFC 3986), everything before the "@" is treated as username/password credentials, not the host.'
      },
      {
        id: 'b',
        text: 'verify-account-gate.com (An external, unrelated host)',
        isBest: true,
        explanation: 'Spot on! The browser completely discards "secure.paypal.com" as login credentials and navigates directly to "verify-account-gate.com".'
      },
      {
        id: 'c',
        text: 'Both servers in parallel.',
        isBest: false,
        explanation: 'A browser only connects to the single host identified immediately after the "@" sign and before the path slash.'
      }
    ],
    practicalTakeaway: 'Always look for the FIRST single slash "/" after the protocol. The true host is the domain immediately preceding that slash.'
  },
  {
    id: 'lesson-https-myth',
    category: 'url',
    title: 'The HTTPS Padlock Fallacy',
    conceptSummary: 'HTTPS provides encrypted transit, not character or business integrity.',
    scenario: 'A website has a secure padlock icon and says "https://apple-id-recovery-portal.net". A user assumes it must be authentic because "it has HTTPS and the lock icon."',
    question: 'Why is this assumption dangerous?',
    options: [
      {
        id: 'a',
        text: 'Because HTTPS certificates are free and trivial for scammers to obtain for any domain they own.',
        isBest: true,
        explanation: 'Exact! Let\'s Encrypt and other certificate authorities automate free SSL for everyone. HTTPS means nobody on your local Wi-Fi can snoop your connection to that scammer, but the recipient site can still steal your password.'
      },
      {
        id: 'b',
        text: 'Because HTTPS websites cannot display images.',
        isBest: false,
        explanation: 'HTTPS handles all web media normally.'
      },
      {
        id: 'c',
        text: 'Because browsers charge money for HTTPS.',
        isBest: false,
        explanation: 'HTTPS is a free, standard transport protocol.'
      }
    ],
    practicalTakeaway: 'HTTPS proves the connection is encrypted; it does NOT prove the website owner is honest.'
  },
  {
    id: 'lesson-viral-forwarding',
    category: 'evidence',
    title: 'The Viral Echo Chamber: Repetition vs. Evidence',
    conceptSummary: 'Ten people forwarding the same claim equals one unverified claim, not ten confirmations.',
    scenario: 'A family chat receives a message claiming "Government is giving ₹5000 power subsidy starting tomorrow! Forwarded many times across 15 WhatsApp groups."',
    question: 'How should you evaluate this evidence?',
    options: [
      {
        id: 'a',
        text: 'Since 15 separate groups received it, it must be true due to social consensus.',
        isBest: false,
        explanation: 'Viral copies originate from a single unverified seed. Repetition creates an illusion of truth without adding a single piece of independent proof.'
      },
      {
        id: 'b',
        text: 'Recognize this as high Trust Debt: high circulation, zero primary government gazette or official ministerial portal citation.',
        isBest: true,
        explanation: 'Spot on! Without an official domain (.gov.in / official ministry portal) or direct press statement, repeated forwards have zero evidential weight.'
      },
      {
        id: 'c',
        text: 'Forward it to 5 more people just in case it is real.',
        isBest: false,
        explanation: 'Forwarding unverified claims contributes to digital panic and confusion.'
      }
    ],
    practicalTakeaway: 'Always ask: "Where is the original primary source?" If no primary source exists, the number of forwards is irrelevant.'
  },
  {
    id: 'lesson-otp-golden-rule',
    category: 'privacy',
    title: 'The Absolute Rule of One-Time Codes',
    conceptSummary: 'One-time passwords (OTPs) are dynamic authorization keys, never verification proofs for strangers.',
    scenario: 'A polite caller claiming to be an IT helpdesk specialist says: "We detected suspicious activity on your account. I just sent a 6-digit code to your phone to confirm your identity. Read it back to me to protect your account."',
    question: 'What should you do?',
    options: [
      {
        id: 'a',
        text: 'Read the code quickly so they can secure your account.',
        isBest: false,
        explanation: 'The attacker triggered a password reset on your account and needs that OTP to finalize hijacking your profile.'
      },
      {
        id: 'b',
        text: 'Refuse to share the code, hang up immediately, and report the interaction to the genuine IT helpdesk.',
        isBest: true,
        explanation: 'Correct! Genuine security systems authenticate you on their backend. They never need you to disclose the one-time code they generated.'
      },
      {
        id: 'c',
        text: 'Read only the first 3 digits of the code.',
        isBest: false,
        explanation: 'Never disclose any part of an authorization token.'
      }
    ],
    practicalTakeaway: 'No bank, service provider, or support staff will ever ask for your OTP. An OTP is meant exclusively for you to type directly into a verified login screen.'
  },
  {
    id: 'lesson-digital-arrest-video',
    category: 'message',
    title: 'The "Digital Arrest" Video Call Trap',
    conceptSummary: 'Police and judicial officers NEVER conduct interrogations or place citizens under arrest via Skype or WhatsApp video.',
    scenario: 'A Skype video caller wearing a police uniform with an official emblem background claims: "You are under Digital Arrest for money laundering. Do not disconnect this call or talk to your family, or officers will raid your house in 20 minutes."',
    question: 'How should you respond to this situation?',
    options: [
      {
        id: 'a',
        text: 'Transfer your funds to the "court verification account" to clear your name.',
        isBest: false,
        explanation: 'There is no such legal entity as a "court verification account". This is an extortion tactic designed to drain your savings.'
      },
      {
        id: 'b',
        text: 'Disconnect the call immediately. Indian law has no provision for "digital arrest". Inform family and report the number to 1930 / cybercrime.gov.in.',
        isBest: true,
        explanation: 'Spot on! Real law enforcement officers never issue arrest warrants or conduct judicial proceedings over consumer video calling platforms.'
      },
      {
        id: 'c',
        text: 'Keep the video call running and apologize to the caller.',
        isBest: false,
        explanation: 'Staying on the line allows the psychological coercion to escalate.'
      }
    ],
    practicalTakeaway: '"Digital arrest" is a fictional concept used by scammers. Disconnect immediately and call 1930.'
  },
  {
    id: 'lesson-qr-pin-inversion',
    category: 'privacy',
    title: 'The UPI PIN Inversion Rule',
    conceptSummary: 'Entering your UPI PIN authorizes a deduction from your account, never a credit.',
    scenario: 'An online buyer says: "I have transferred the money to you via QR code. Scan this QR in your Google Pay or PhonePe and enter your UPI PIN to approve receiving the ₹12,000."',
    question: 'What happens if you enter your UPI PIN after scanning the QR?',
    options: [
      {
        id: 'a',
        text: '₹12,000 will be instantly deducted from your bank account and sent to the scammer.',
        isBest: true,
        explanation: 'Exact! Entering your UPI PIN is exclusively an authorization to debit your account. Receiving funds requires zero PIN entry.'
      },
      {
        id: 'b',
        text: 'The ₹12,000 will be securely deposited into your wallet.',
        isBest: false,
        explanation: 'PIN entry is NEVER required to receive money in UPI.'
      },
      {
        id: 'c',
        text: 'Your bank app will display your current balance.',
        isBest: false,
        explanation: 'Scanning a payment QR and typing your PIN executes a live transfer.'
      }
    ],
    practicalTakeaway: 'You NEVER need your UPI PIN to receive money. Entering your PIN always sends funds.'
  },
  {
    id: 'lesson-telegram-task-lure',
    category: 'evidence',
    title: 'The Work-From-Home Task Pyramid',
    conceptSummary: 'Paying money to unlock higher tasks or withdraw commissions is the hallmark of task pyramid fraud.',
    scenario: 'You are added to a Telegram group and paid ₹300 for reviewing 3 hotels. Then the manager says: "To unlock task level 2 and withdraw your ₹4,500 bonus, you must first recharge ₹2,000 into our investment pool."',
    question: 'What is the true nature of this request?',
    options: [
      {
        id: 'a',
        text: 'It is a standard security deposit that will be refunded with interest.',
        isBest: false,
        explanation: 'Any money sent to the pool will be locked forever, followed by demands for larger recharge fees.'
      },
      {
        id: 'b',
        text: 'It is an advance-fee scam: the initial ₹300 was bait to induce you to transfer thousands of rupees that will never be returned.',
        isBest: true,
        explanation: 'Spot on! Scammers willingly sacrifice small sums (₹200–₹500) as psychological bait to lure victims into transferring substantial sums.'
      },
      {
        id: 'c',
        text: 'Recharge the ₹2,000 and immediately withdraw everything.',
        isBest: false,
        explanation: 'Withdrawals are artificially blocked once larger sums are deposited.'
      }
    ],
    practicalTakeaway: 'Never pay money to earn money. Legitimate employment never requires workers to deposit funds to withdraw salary.'
  }
];
