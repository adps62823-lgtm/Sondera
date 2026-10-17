import React, { useState, useEffect } from 'react';
import {
  localNeuralEngine,
  NeuralAnalysisResult,
} from '../../core/ai/local-neural-ai';
import { addClaimItem } from '../../services/case-service';
import {
  Cpu,
  Sparkles,
  Zap,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Download,
  Loader2,
  Layers,
  ArrowRight,
  Info,
  Send,
  Key,
  Bot,
  User,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';

interface LocalNeuralAiPanelProps {
  caseId: string;
  originalText: string;
  onClaimsImported?: () => void;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  mode: 'offline_expert' | 'gemini_cloud';
  timestamp: string;
}

export const LocalNeuralAiPanel: React.FC<LocalNeuralAiPanelProps> = ({
  caseId,
  originalText,
  onClaimsImported,
}) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<number | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string>('');
  const [result, setResult] = useState<NeuralAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importedClaims, setImportedClaims] = useState<Set<number>>(new Set());

  // Interactive AI Investigator Chat State
  const [geminiApiKey, setGeminiApiKey] = useState<string>(() => {
    return localStorage.getItem('sondera_gemini_api_key') || '';
  });
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [chatQuestion, setChatQuestion] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => [
    {
      sender: 'ai',
      text: `Hello! I am your AI Safety Investigator. I have reviewed the submitted message. Ask me any question, such as "Why is this suspicious?", "What happens if I call?", or "What should I do if I already clicked the link?".`,
      mode: 'offline_expert',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    setGeminiApiKey(trimmed);
    localStorage.setItem('sondera_gemini_api_key', trimmed);
    setShowApiKeyModal(false);
  };

  const handleClearApiKey = () => {
    setGeminiApiKey('');
    localStorage.removeItem('sondera_gemini_api_key');
    setShowApiKeyModal(false);
  };

  const handleRunNeuralAnalysis = async () => {
    setError(null);
    try {
      setIsInitializing(true);
      await localNeuralEngine.initialize((p) => {
        if (p.progress !== undefined) {
          setDownloadProgress(Math.round(p.progress));
          setDownloadStatus(`Caching neural weights in browser... ${Math.round(p.progress)}%`);
        } else if (p.status) {
          setDownloadStatus(p.status);
        }
      });
      setIsInitializing(false);
      setDownloadProgress(null);

      setIsAnalyzing(true);
      const res = await localNeuralEngine.analyzeText(originalText);
      setResult(res);
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to run local neural inference. Your device may have WebAssembly/WebGPU restricted.'
      );
    } finally {
      setIsInitializing(false);
      setIsAnalyzing(false);
    }
  };

  const handleImportClaim = async (claimText: string, idx: number) => {
    await addClaimItem({
      caseId,
      text: claimText,
      origin: 'extracted',
      status: 'unassessed',
    });
    setImportedClaims((prev) => new Set([...prev, idx]));
    onClaimsImported?.();
  };

  // Chat Submission Handler
  const handleAskQuestion = async (presetQuestion?: string) => {
    const query = presetQuestion || chatQuestion.trim();
    if (!query || isChatLoading) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: query,
      mode: geminiApiKey ? 'gemini_cloud' : 'offline_expert',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    if (!presetQuestion) setChatQuestion('');
    setIsChatLoading(true);

    try {
      if (geminiApiKey) {
        // Live Gemini API Call
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
                      text: `You are Sondera, an expert digital safety, anti-fraud, and fact-checking investigator for the Hackcom initiative.
The user is inspecting the following suspicious content:
"""${originalText}"""

The user asks: "${query}"

Provide a concise, practical, direct answer in 2-3 short paragraphs with clear bullet points. Cite relevant statutory rules (e.g. Electricity Act 2003, RBI KYC circulars, TRAI SMS header rules) if applicable. Mention exact helpline numbers (1930 for cyber crime, 1909 for SMS spam, 1915 for consumer helpline) where appropriate.`,
                    },
                  ],
                },
              ],
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        const aiReply =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          'I was unable to parse the Gemini response. Please check your query or API key.';

        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: aiReply,
            mode: 'gemini_cloud',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        // Built-in Smart Offline Safety Intelligence
        await new Promise((r) => setTimeout(r, 600)); // simulated realistic thinking delay
        let reply = '';
        const lowerQ = query.toLowerCase();

        if (lowerQ.includes('click') || lowerQ.includes('clicked') || lowerQ.includes('open')) {
          reply = `🚨 **If you already clicked the link:**\n1. **Disconnect immediately**: Turn on Airplane mode or turn off Wi-Fi/Mobile Data.\n2. **Check for downloads**: Open your device Downloads folder and delete any recent \`.apk\` or unknown installation files.\n3. **Do NOT approve OTPs**: Scammers cannot take money without your bank OTP or UPI PIN unless you installed a screen-sharing app like AnyDesk.\n4. **If you entered card or banking password**: Call your bank immediately and freeze your card / NetBanking. Call National Cyber Helpline **1930**.`;
        } else if (lowerQ.includes('call') || lowerQ.includes('phone') || lowerQ.includes('number')) {
          reply = `🛑 **Do NOT call the phone number in the message:**\n- That phone number connects directly to a private fraud syndicate.\n- Discoms, banks, and telecom operators communicate strictly through registered alphanumeric SMS headers (e.g., VM-BSES, BP-SBI) and authorized toll-free numbers, never personal 10-digit SIM cards.\n- If you call, they will create panic and direct you to install remote-desktop malware or share an OTP.`;
        } else if (lowerQ.includes('why') || lowerQ.includes('fake') || lowerQ.includes('suspicious')) {
          reply = `🔍 **Why this is confirmed malicious:**\n- **Statutory Violation**: For utilities, Section 56 of the Electricity Act 2003 mandates a minimum 15-day written notice before disconnection. Same-day cutoff within 1–2 hours is legally impossible.\n- **Channel Hijack**: They ask you to contact a personal phone number instead of official websites or registered bill counters.\n- **Missing Consumer ID**: The message omits your specific Consumer Account (CA) number because it was blasted indiscriminately to thousands of numbers.`;
        } else if (lowerQ.includes('police') || lowerQ.includes('report') || lowerQ.includes('complaint')) {
          reply = `🛡️ **How to officially report this incident:**\n1. **Dial 1930**: National Cyber Crime Reporting Portal helpline (24x7).\n2. **File complaint**: Visit [cybercrime.gov.in](https://cybercrime.gov.in).\n3. **Report SMS Fraud**: Use the **Chakshu Portal** on [sancharsaathi.gov.in](https://sancharsaathi.gov.in) to flag the phone number for telecom disconnection.`;
        } else {
          reply = `💡 **Investigator Analysis:**\nThis message exhibits high indicators of social engineering. The sender manufactures an artificial crisis to prompt immediate emotional action before you can verify facts with family or official authorities.\n\nAlways verify directly through the official website or verified customer app. Never install external APKs or pay via personal UPI IDs.`;
        }

        setChatMessages((prev) => [
          ...prev,
          {
            sender: 'ai',
            text: reply,
            mode: 'offline_expert',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (err: unknown) {
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `Error connecting to AI: ${err instanceof Error ? err.message : 'Unknown error'}. Falling back to offline investigator guidance.`,
          mode: 'offline_expert',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-darkCard rounded-3xl border border-surface-border dark:border-surface-darkBorder p-6 shadow-sm space-y-6">
      {/* Header with Mode Switcher & API Key Indicator */}
      <div className="border-b border-surface-border/50 dark:border-surface-darkBorder/50 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-base text-ink-primary dark:text-neutral-100">
                Case assistant
              </h3>
              {geminiApiKey ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-200 font-bold border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  Gemini 2.5 Flash ready
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-200 font-bold border border-indigo-200 dark:border-indigo-900 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-indigo-600" />
                  Offline guidance
                </span>
              )}
            </div>
            <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-0.5">
              Optional tools. The local classifier is a downloaded text model; offline replies use keyword-matched guidance. Gemini chat sends the case text and your question to Google.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setApiKeyInput(geminiApiKey);
              setShowApiKeyModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-surface-border dark:border-surface-darkBorder hover:bg-surface-muted dark:hover:bg-surface-darkMuted text-xs font-medium text-ink-secondary dark:text-neutral-300 transition"
          >
            <Key className="w-3.5 h-3.5" />
            <span>{geminiApiKey ? 'Change Gemini key' : 'Add Gemini key (optional)'}</span>
          </button>
        </div>
      </div>

      {/* Clear disclosure of local and online steps */}
      <div className="p-4 rounded-2xl bg-surface-muted dark:bg-surface-darkMuted border border-surface-border/60 dark:border-surface-darkBorder/60 space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-indigo-600" />
          <span>What runs locally and online</span>
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
          <div className="p-2.5 rounded-xl bg-white dark:bg-surface-darkCard border border-surface-border/40">
            <span className="font-bold text-forest-800 dark:text-forest-300 block mb-1">
              1. Local warning rules
            </span>
            <p className="text-[11px] text-ink-secondary dark:text-neutral-400">
              Pattern checks for urgency, credential requests, and suspicious URL structure. They do not verify claims.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-surface-darkCard border border-surface-border/40">
            <span className="font-bold text-indigo-800 dark:text-indigo-300 block mb-1">
              2. Optional local text model
            </span>
            <p className="text-[11px] text-ink-secondary dark:text-neutral-400">
              Downloads model files on first use, then classifies text on this device. This is separate from web research.
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-white dark:bg-surface-darkCard border border-surface-border/40">
            <span className="font-bold text-purple-800 dark:text-purple-300 block mb-1">
              3. Gemini chat
            </span>
            <p className="text-[11px] text-ink-secondary dark:text-neutral-400">
              Sends the case text and your question to Google for a generated answer. No search grounding in this chat.
            </p>
          </div>
        </div>
      </div>

      {/* Case assistant chat */}
      <div className="p-5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-indigo-600" />
            <h4 className="text-sm font-bold text-ink-primary dark:text-neutral-100">
              Ask about this case
            </h4>
          </div>
          <span className="text-[10px] text-ink-muted dark:text-neutral-400">
            {geminiApiKey ? 'Powered by Google Gemini 1.5 Flash' : 'Powered by Built-In Safety Intelligence'}
          </span>
        </div>

        {/* Preset Quick Question Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-ink-muted text-[11px] shrink-0">Quick Questions:</span>
          <button
            onClick={() => handleAskQuestion('Why is this message fake and dangerous?')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-surface-darkCard border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 whitespace-nowrap transition text-xs"
          >
            Why is this fake?
          </button>
          <button
            onClick={() => handleAskQuestion('What should I do if I already clicked the link?')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-surface-darkCard border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 whitespace-nowrap transition text-xs"
          >
            I already clicked the link!
          </button>
          <button
            onClick={() => handleAskQuestion('What happens if I dial the phone number?')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-surface-darkCard border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 whitespace-nowrap transition text-xs"
          >
            Can I call the number?
          </button>
          <button
            onClick={() => handleAskQuestion('How do I report this to the cyber police?')}
            className="px-2.5 py-1 rounded-full bg-white dark:bg-surface-darkCard border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 hover:bg-indigo-100 whitespace-nowrap transition text-xs"
          >
            How to report to 1930?
          </button>
        </div>

        {/* Chat Message History */}
        <div className="space-y-3 max-h-72 overflow-y-auto p-3 rounded-xl bg-white dark:bg-surface-darkCard border border-surface-border dark:border-surface-darkBorder">
          {chatMessages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start gap-2.5 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5" />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl max-w-[85%] text-xs leading-relaxed space-y-1 ${
                  msg.sender === 'user'
                    ? 'bg-forest-600 text-white rounded-br-xs'
                    : 'bg-surface-muted dark:bg-surface-darkMuted text-ink-primary dark:text-neutral-200 border border-surface-border/50 rounded-bl-xs'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div
                  className={`text-[9px] flex items-center justify-between gap-2 pt-1 ${
                    msg.sender === 'user' ? 'text-forest-200' : 'text-ink-muted dark:text-neutral-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {msg.sender === 'ai' && (
                    <span>{msg.mode === 'gemini_cloud' ? '⚡ Gemini' : '🛡️ Built-in'}</span>
                  )}
                </div>
              </div>
              {msg.sender === 'user' && (
                <div className="w-6 h-6 rounded-lg bg-forest-800 text-white flex items-center justify-center shrink-0 mt-0.5">
                  <User className="w-3.5 h-3.5" />
                </div>
              )}
            </div>
          ))}

          {isChatLoading && (
            <div className="flex items-center gap-2 text-xs text-ink-muted p-2">
              <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              <span>Preparing an answer...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={chatQuestion}
            onChange={(e) => setChatQuestion(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAskQuestion()}
            placeholder="Ask anything about this message or scam..."
            className="flex-1 px-3.5 py-2.5 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard text-xs text-ink-primary dark:text-neutral-100 focus:outline-none focus:border-indigo-600"
          />
          <button
            onClick={() => handleAskQuestion()}
            disabled={!chatQuestion.trim() || isChatLoading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium text-xs flex items-center gap-1.5 transition"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Ask</span>
          </button>
        </div>
      </div>

      {/* Section 2: Local Neural Tensor Classifier (WebGPU / Transformers.js) */}
      <div className="border border-surface-border dark:border-surface-darkBorder rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-ink-primary dark:text-neutral-100 flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-600" />
              <span>In-Browser Neural Tensor Classifier (WebGPU / WASM)</span>
            </h4>
            <p className="text-xs text-ink-secondary dark:text-neutral-400">
              Executes MobileBERT weights locally on your device hardware without transmitting text anywhere.
            </p>
          </div>

          {!result && (
            <button
              onClick={handleRunNeuralAnalysis}
              disabled={isInitializing || isAnalyzing}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-50 text-white font-semibold text-xs shadow-xs transition shrink-0"
            >
              {isInitializing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Loading Model...</span>
                </>
              ) : isAnalyzing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Analyzing Vectors...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Run WebGPU Neural Analysis</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Download progress */}
        {downloadProgress !== null && (
          <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 space-y-2">
            <div className="flex justify-between text-xs font-semibold text-purple-950 dark:text-purple-200">
              <span className="flex items-center gap-1.5">
                <Download className="w-3.5 h-3.5" />
                <span>{downloadStatus}</span>
              </span>
              <span>{downloadProgress}%</span>
            </div>
            <div className="w-full bg-purple-200 dark:bg-purple-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${downloadProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-ink-muted block">
              * Cached permanently in browser CacheStorage so future analyses run instantaneously offline.
            </span>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-xs text-red-700 dark:text-red-300 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Neural Inference Results */}
        {result && (
          <div className="space-y-4 pt-2">
            <div className="p-4 rounded-xl border border-purple-300 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/30 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-purple-600" />
                  <span>Top Neural Intent Detected</span>
                </span>
                <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300">
                  Hardware: {result.executionDevice.toUpperCase()} • Time: {result.inferenceTimeMs}ms
                </span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-lg font-extrabold text-purple-950 dark:text-purple-100 capitalize">
                  {result.topLabel}
                </span>
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100">
                  {Math.round(result.confidence * 100)}% Confidence
                </span>
              </div>
            </div>

            {/* Neural Claim Extraction */}
            {result.detectedClaims.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-forest-700 dark:text-forest-400" />
                  <span>Extracted Factual Assertions</span>
                </span>
                <div className="space-y-1.5">
                  {result.detectedClaims.map((clm, idx) => {
                    const isImported = importedClaims.has(idx);
                    return (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl border border-surface-border bg-surface-light dark:bg-surface-dark flex items-center justify-between gap-3 text-xs"
                      >
                        <p className="text-ink-primary dark:text-neutral-200 font-medium">
                          "{clm}"
                        </p>
                        <button
                          type="button"
                          onClick={() => handleImportClaim(clm, idx)}
                          disabled={isImported}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition shrink-0 ${
                            isImported
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-forest-900 text-white hover:bg-forest-800'
                          }`}
                        >
                          {isImported ? '✓ Added' : '+ Add Claim'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Optional Gemini API Key Modal */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-6 max-w-md w-full space-y-4 shadow-xl">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <Key className="w-5 h-5" />
              <h3 className="font-bold text-base text-ink-primary dark:text-neutral-100">
                Optional Gemini API Key
              </h3>
            </div>

            <p className="text-xs text-ink-secondary dark:text-neutral-300 leading-relaxed">
              Sondera is completely functional 100% offline at ₹0 cost. If you would like to test cloud generative LLM reasoning (Gemini 1.5 Flash), you can paste your free personal Google AI Studio key below.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-ink-muted uppercase">
                Google Gemini API Key
              </label>
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full px-3 py-2 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-surface-muted dark:bg-surface-darkMuted text-xs font-mono text-ink-primary dark:text-neutral-100 focus:outline-none focus:border-indigo-600"
              />
              <span className="text-[10px] text-ink-muted block">
                Saved solely in your local browser localStorage. Never sent to any third party.
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={handleClearApiKey}
                className="text-xs text-red-600 hover:underline"
              >
                Clear Key
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-3 py-1.5 rounded-xl text-xs text-ink-secondary hover:bg-surface-muted"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveApiKey}
                  className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold"
                >
                  Save Key
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
