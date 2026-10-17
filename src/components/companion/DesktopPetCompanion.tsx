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
  citations?: Array<{ title: string; url: string; provider?: string }>;
  activity?: Array<{ provider: string; resultCount: number }>;
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
  const [researchStage, setResearchStage] = useState('');
  const [searchActivity, setSearchActivity] = useState<Array<{ provider: string; resultCount: number }>>([]);
  const [bubbleText, setBubbleText] = useState<string | null>(
    'Need help or have questions? Click me!'
  );
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<PetMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'pet',
      text: `Hi, I'm **Sonder**. I can help you understand suspicious messages, check current sources, and find the right safety steps. What would you like help with?`,
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
    setResearchStage('Connecting to Sonder…');
    setSearchActivity([]);

    try {
      const history = [...messages.slice(-10).map((message) => ({
        role: message.sender === 'user' ? 'user' : 'model',
        text: message.text,
      })), { role: 'user', text: q }];
      const response = await fetch('/api/buddy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: history, mode, currentTab }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Sonder could not answer just now.');
      }
      let data: { answer?: string; citations?: Array<{ title: string; url: string; provider?: string }>; activity?: Array<{ provider: string; resultCount: number }> } = {};
      if (response.headers.get('content-type')?.includes('application/x-ndjson') && response.body) {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        const processLine = (line: string) => {
          if (!line.trim()) return;
          const event = JSON.parse(line) as { type: string; label?: string; provider?: string; resultCount?: number; error?: string; answer?: string; citations?: Array<{ title: string; url: string; provider?: string }>; activity?: Array<{ provider: string; resultCount: number }> };
          if (event.type === 'stage') setResearchStage(event.label || 'Searching sources…');
          if (event.type === 'provider-complete' && event.provider) setSearchActivity((items) => [...items.filter((item) => item.provider !== event.provider), { provider: event.provider!, resultCount: event.resultCount || 0 }]);
          if (event.type === 'error') throw new Error(event.error || 'Sonder could not answer just now.');
          if (event.type === 'complete') data = event;
        };
        while (true) {
          const { value, done } = await reader.read();
          buffer += decoder.decode(value || new Uint8Array(), { stream: !done });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          lines.forEach(processLine);
          if (done) break;
        }
        if (buffer.trim()) processLine(buffer);
      } else data = await response.json();
      const lower = q.toLowerCase();
      let actionBtn: PetMessage['actionButton'];
      if (lower.includes('mode')) actionBtn = { label: `Switch to ${mode === 'simple' ? 'Technical' : 'Simple'} Mode`, modeAction: mode === 'simple' ? 'technical' : 'simple' };
      else if (/\b(link|url|website)\b/.test(lower)) actionBtn = { label: 'Open Link Checker', tab: 'url_lab' };
      else if (/\b(sms|message|verify|claim)\b/.test(lower)) actionBtn = { label: 'Check a message', tab: 'investigate' };
      else if (/\b(emergency|clicked|compromised|lost money|otp)\b/.test(lower)) actionBtn = { label: 'Open Emergency Help', tab: 'emergency' };
      else if (/\b(quiz|learn|game)\b/.test(lower)) actionBtn = { label: 'Open Safety Quiz', tab: 'learn' };
      else if (/\b(scam|threat|electricity|kyc)\b/.test(lower)) actionBtn = { label: 'Browse Scam Guide', tab: 'threats' };
      else if (/\b(privacy|leak|habit)\b/.test(lower)) actionBtn = { label: 'Open Privacy Check', tab: 'privacy' };
      setMessages((prev) => [...prev, {
        id: `pet-${Date.now()}`,
        sender: 'pet',
        text: typeof data.answer === 'string' ? data.answer : 'I could not form an answer. Please try again.',
        citations: Array.isArray(data.citations) ? data.citations : [],
        activity: Array.isArray(data.activity) ? data.activity : [],
        actionButton: actionBtn,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      setMood(/emergency|clicked|compromised|lost money|otp/i.test(q) ? 'alert' : 'happy');
    } catch (error) {
      setMessages((prev) => [...prev, {
        id: `pet-error-${Date.now()}`,
        sender: 'pet',
        text: error instanceof Error ? error.message : 'Sonder could not answer just now. Please try again.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }]);
      setMood('vigilant');
    } finally {
      setIsTyping(false);
      setResearchStage('');
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
          title="Open Sonder assistant"
          aria-label="Open Sonder assistant"
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
                  <h4 className="font-bold text-xs tracking-wide">Sonder</h4>
                  <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-forest-800 text-forest-200">
                    {mode.toUpperCase()} MODE
                  </span>
                </div>
                <p className="text-[10px] text-forest-200/80">
                  {mood === 'thinking'
                    ? 'Searching and preparing an answer…'
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
              <div className="px-3 py-2 bg-surface-muted dark:bg-surface-darkMuted border-b border-surface-border/50 dark:border-surface-darkBorder/50 flex flex-col gap-2 shrink-0">
                <p className="text-[10px] text-ink-muted">Sonder uses online sources to answer. Don’t share passwords, one-time codes, or private information.</p>
                <div className="flex items-center gap-1.5 overflow-x-auto text-[11px]">
                <span className="text-ink-muted shrink-0 text-[10px]">Try:</span>
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
                  {m.citations && m.citations.length > 0 && (
                    <div className="border-t border-surface-border/60 dark:border-surface-darkBorder/60 pt-2 space-y-1">
                      <p className="text-[10px] font-semibold">Sources</p>
                      {m.citations.map((citation) => (
                        <a key={citation.url} href={citation.url} target="_blank" rel="noreferrer" className="block text-[10px] text-blue-700 dark:text-blue-300 underline break-all">
                          {citation.title}{citation.provider ? ` · ${citation.provider}` : ''}
                        </a>
                      ))}
                    </div>
                  )}
                  {m.activity && m.activity.length > 0 && <details className="border-t border-surface-border/60 dark:border-surface-darkBorder/60 pt-2">
                    <summary className="cursor-pointer text-[10px] font-semibold">Search activity</summary>
                    <p className="mt-1 text-[10px]">Gemini prepared this reply using Google Search and the listed independent results. Search results can be incomplete or wrong.</p>
                    <ul className="mt-1 space-y-0.5 text-[10px]">{m.activity.map((item) => <li key={item.provider} className="flex justify-between gap-3"><span>{item.provider}</span><span>{item.resultCount} found</span></li>)}</ul>
                  </details>}

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
                    <div><span>{researchStage || 'Sonder is preparing an answer…'}</span>{searchActivity.length > 0 && <div className="mt-1 flex flex-wrap gap-1">{searchActivity.map((item) => <span key={item.provider} className="rounded-full bg-surface-muted dark:bg-surface-darkMuted px-1.5 py-0.5">{item.provider}: {item.resultCount}</span>)}</div>}</div>
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
                  placeholder="Ask Sonder…"
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
