import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Shield,
  HelpCircle,
  ExternalLink,
  ArrowRight,
  Minimize2,
  Maximize2,
  Compass,
  AlertTriangle,
  Lightbulb,
  Check,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { useAppMode, AppMode } from '../../context/ModeContext';
import { NavTab } from '../layout/Navbar';

interface DesktopPetCompanionProps {
  onNavigate: (tab: NavTab) => void;
  currentTab: NavTab;
}

interface PetMessage {
  id: string;
  sender: 'pet' | 'user';
  text: string;
  actionButton?: {
    label: string;
    tab?: NavTab;
    modeAction?: AppMode;
  };
  timestamp: string;
}

export const DesktopPetCompanion: React.FC<DesktopPetCompanionProps> = ({
  onNavigate,
  currentTab,
}) => {
  const { mode, toggleMode, setMode } = useAppMode();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [mood, setMood] = useState<'vigilant' | 'happy' | 'alert' | 'thinking'>('vigilant');
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [bubbleText, setBubbleText] = useState<string | null>(
    'Need help or have questions? Click me!'
  );
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<PetMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'pet',
      text: `Hello! I'm **CyBuddy**, your friendly digital safety pet. 🐾\n\nI can help you check suspicious links, explain scams in simple words, or take you anywhere in the app! What would you like help with?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  // Hide floating bubble after 7 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      setBubbleText(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, []);

  // Auto-scroll chat
  useEffect(() => {
    if (isOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (queryText?: string) => {
    const q = queryText || inputText.trim();
    if (!q || isTyping) return;

    const userMsg: PetMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!queryText) setInputText('');
    setIsTyping(true);
    setMood('thinking');

    // Check for Gemini API key if present
    const geminiApiKey = localStorage.getItem('sondera_gemini_api_key');

    try {
      if (geminiApiKey) {
        // Live cloud LLM call with app-awareness prompt
        const response = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-goog-api-key': geminiApiKey },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [
                    {
                      text: `You are CyBuddy, a friendly, ultra-helpful, approachable digital safety pet companion inside the "Sondera" web app.
The user is currently on the "${currentTab}" tab in ${mode} mode.
User asks: "${q}"

Respond in a warm, cheerful, easy-to-understand conversational tone (max 2-3 short paragraphs).
If the user is asking where to find something in the app:
- To check a link: mention "Link Checker"
- To verify an SMS or message: mention "Verify Message"
- For emergency: mention "SOS Emergency"
- For quizzes: mention "Safety Quiz"
- For privacy: mention "Privacy Test"
- For threat guide: mention "Scam Directory"`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            setMessages((prev) => [
              ...prev,
              {
                id: `pet-${Date.now()}`,
                sender: 'pet',
                text: reply,
                timestamp: new Date().toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                }),
              },
            ]);
            setMood('happy');
            setIsTyping(false);
            return;
          }
        }
      }

      // Built-in Intelligent App & Safety Assistant
      await new Promise((r) => setTimeout(r, 600));
      const lower = q.toLowerCase();
      let reply = '';
      let actionBtn: PetMessage['actionButton'] = undefined;

      if (lower.includes('link') || lower.includes('url') || lower.includes('website')) {
        reply = `You can check any web link or UPI QR code safely using our **Link Checker**. It examines hidden redirects and scam domains without actually loading the website!`;
        actionBtn = { label: 'Go to Link Checker', tab: 'url_lab' };
        setMood('happy');
      } else if (lower.includes('sms') || lower.includes('message') || lower.includes('verify')) {
        reply = `To inspect an SMS, WhatsApp forward, or email, click **Verify Message**. Sondera will automatically identify the scam type and testable claims!`;
        actionBtn = { label: 'Go to Verify Message', tab: 'investigate' };
        setMood('happy');
      } else if (
        lower.includes('emergency') ||
        lower.includes('clicked') ||
        lower.includes('compromised') ||
        lower.includes('lost money') ||
        lower.includes('otp')
      ) {
        reply = `🚨 **Don't panic! Here are the 3 immediate steps:**\n1. Disconnect internet (turn on Airplane mode).\n2. If you entered card/NetBanking details, call your bank to freeze them immediately.\n3. Dial **1930** (National Cyber Helpline).\n\nOpen our Emergency Guide below for step-by-step containment:`;
        actionBtn = { label: 'Open SOS Emergency Guide', tab: 'emergency' };
        setMood('alert');
      } else if (lower.includes('simple mode') || lower.includes('technical mode') || lower.includes('mode')) {
        if (mode === 'simple') {
          reply = `You are currently in **Simple Mode**, which hides complex port numbers, regex rules, and developer terms. Would you like to switch to **Technical Mode**?`;
          actionBtn = { label: 'Switch to Technical Mode', modeAction: 'technical' };
        } else {
          reply = `You are currently in **Technical Mode**, showing raw syntactic tokens, ports, and WebGPU metrics. Would you like to switch to **Simple Mode**?`;
          actionBtn = { label: 'Switch to Simple Mode', modeAction: 'simple' };
        }
        setMood('vigilant');
      } else if (lower.includes('quiz') || lower.includes('learn') || lower.includes('game') || lower.includes('gym')) {
        reply = `Want to sharpen your instincts? Check out our **Safety Quiz** with realistic interactive scenarios!`;
        actionBtn = { label: 'Open Safety Quiz', tab: 'learn' };
        setMood('happy');
      } else if (lower.includes('scam') || lower.includes('threat') || lower.includes('electricity') || lower.includes('kyc')) {
        reply = `We maintain a comprehensive field guide covering 10 modern scam vectors (Electricity bills, Part-time job scams, India Post customs, etc.) in our **Scam Directory**!`;
        actionBtn = { label: 'Browse Scam Directory', tab: 'threats' };
        setMood('vigilant');
      } else if (lower.includes('privacy') || lower.includes('leak') || lower.includes('habit')) {
        reply = `You can take our 8-question **Privacy Test** to evaluate your online hygiene and receive actionable security recommendations!`;
        actionBtn = { label: 'Start Privacy Test', tab: 'privacy' };
        setMood('happy');
      } else {
        reply = `I'm right here to help! You can ask me how to identify fake messages, what to do if you clicked a suspicious link, or ask me to take you anywhere in Sondera.`;
        setMood('vigilant');
      }

      setMessages((prev) => [
        ...prev,
        {
          id: `pet-${Date.now()}`,
          sender: 'pet',
          text: reply,
          actionButton: actionBtn,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionClick = (btn: NonNullable<PetMessage['actionButton']>) => {
    if (btn.tab) {
      onNavigate(btn.tab);
      setBubbleText(`Navigated to ${btn.label}!`);
      setTimeout(() => setBubbleText(null), 3000);
    } else if (btn.modeAction) {
      const targetMode = btn.modeAction;
      setMode(targetMode);
      setMessages((prev) => [
        ...prev,
        {
          id: `pet-mode-${Date.now()}`,
          sender: 'pet',
          text: `Switched mode to **${targetMode.toUpperCase()} MODE**! Everything has been updated.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 select-none">
      {/* Speech Bubble when Pet is Idle */}
      {!isOpen && bubbleText && (
        <div
          onClick={() => setIsOpen(true)}
          className="absolute bottom-16 right-0 bg-white dark:bg-surface-darkCard text-ink-primary dark:text-neutral-100 text-xs font-semibold px-3 py-2 rounded-2xl shadow-lg border border-surface-border dark:border-surface-darkBorder cursor-pointer whitespace-nowrap animate-bounce flex items-center gap-2 group"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>{bubbleText}</span>
          <span className="w-2 h-2 rounded-full bg-forest-600 animate-ping" />
        </div>
      )}

      {/* The Floating Desktop Pet Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setBubbleText(null);
          }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-forest-800 to-forest-600 text-white shadow-xl hover:shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center relative group border-2 border-forest-400/30"
          title="Open CyBuddy - Your Safety Pet Companion"
          aria-label="Open CyBuddy Assistant"
        >
          {/* Animated Eyes / Mascot Avatar */}
          <div className="relative flex flex-col items-center justify-center">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
            <span className="text-[10px] font-extrabold tracking-tighter uppercase font-mono">
              BUDDY
            </span>
          </div>

          {/* Mood status badge */}
          <span
            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-neutral-900 ${
              mood === 'alert'
                ? 'bg-red-500 animate-ping'
                : mood === 'thinking'
                ? 'bg-amber-400'
                : 'bg-emerald-400'
            }`}
          />
        </button>
      )}

      {/* The Interactive Chat & Companion Window */}
      {isOpen && (
        <div
          className={`bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            isMinimized ? 'w-80 h-14' : 'w-[90vw] sm:w-96 h-[520px]'
          }`}
        >
          {/* Header */}
          <div className="p-3.5 bg-forest-900 text-white flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-forest-800 flex items-center justify-center text-forest-100 font-bold text-sm shadow-xs">
                🐾
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-xs tracking-wide">CyBuddy Companion</h4>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-forest-800 text-forest-200">
                    {mode.toUpperCase()} MODE
                  </span>
                </div>
                <p className="text-[10px] text-forest-200/80">
                  {mood === 'thinking'
                    ? 'Thinking...'
                    : mood === 'alert'
                    ? 'Security Alert active'
                    : 'Ready to help'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="p-1 rounded-lg hover:bg-forest-800 text-forest-200 transition"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-forest-800 text-forest-200 transition"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Quick Prompt Carousel */}
              <div className="px-3 py-2 bg-surface-muted dark:bg-surface-darkMuted border-b border-surface-border/50 dark:border-surface-darkBorder/50 flex items-center gap-1.5 overflow-x-auto text-[11px] shrink-0">
                <span className="text-ink-muted shrink-0 text-[10px]">Ask:</span>
                <button
                  onClick={() => handleSendMessage('Where do I check a suspicious link?')}
                  className="px-2.5 py-0.5 rounded-full bg-white dark:bg-surface-darkCard border border-surface-border hover:bg-surface-light text-ink-primary dark:text-neutral-200 whitespace-nowrap"
                >
                  Check Link
                </button>
                <button
                  onClick={() => handleSendMessage('I clicked a fake link! What do I do?')}
                  className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200 border border-red-200 whitespace-nowrap"
                >
                  I clicked a link!
                </button>
                <button
                  onClick={() => handleSendMessage('Switch between Simple and Technical mode')}
                  className="px-2.5 py-0.5 rounded-full bg-white dark:bg-surface-darkCard border border-surface-border hover:bg-surface-light text-ink-primary dark:text-neutral-200 whitespace-nowrap"
                >
                  Toggle Mode
                </button>
              </div>

              {/* Chat Message History */}
              <div className="flex-1 p-3.5 space-y-3 overflow-y-auto text-xs">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex items-start gap-2 ${
                      m.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {m.sender === 'pet' && (
                      <span className="text-sm shrink-0 mt-0.5">🐾</span>
                    )}
                    <div
                      className={`p-3 rounded-2xl max-w-[85%] leading-relaxed space-y-2 ${
                        m.sender === 'user'
                          ? 'bg-forest-600 text-white rounded-br-xs'
                          : 'bg-surface-muted dark:bg-surface-darkMuted text-ink-primary dark:text-neutral-200 border border-surface-border/50 rounded-bl-xs'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.text}</div>

                      {/* Action Button if attached */}
                      {m.actionButton && (
                        <div className="pt-1">
                          <button
                            onClick={() => handleActionClick(m.actionButton!)}
                            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white font-semibold text-[11px] transition shadow-xs"
                          >
                            <span>{m.actionButton.label}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}

                      <span
                        className={`text-[9px] block text-right ${
                          m.sender === 'user'
                            ? 'text-forest-200'
                            : 'text-ink-muted dark:text-neutral-400'
                        }`}
                      >
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-2 text-[11px] text-ink-muted p-2">
                    <span className="animate-spin text-sm">🐾</span>
                    <span>CyBuddy is thinking...</span>
                  </div>
                )}
                <div ref={chatBottomRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-surface-border dark:border-surface-darkBorder flex items-center gap-2 bg-surface-light dark:bg-surface-dark shrink-0">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask CyBuddy anything..."
                  className="flex-1 px-3 py-2 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard text-xs text-ink-primary dark:text-neutral-100 focus:outline-none focus:border-forest-600"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isTyping}
                  className="p-2 rounded-xl bg-forest-600 hover:bg-forest-700 disabled:opacity-50 text-white transition shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
