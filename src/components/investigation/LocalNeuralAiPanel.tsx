import React, { useState } from 'react';
import {
  localNeuralEngine,
  NeuralAnalysisResult,
  ModelLoadProgressCallback,
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
} from 'lucide-react';

interface LocalNeuralAiPanelProps {
  caseId: string;
  originalText: string;
  onClaimsImported?: () => void;
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

  return (
    <div className="bg-white dark:bg-surface-darkCard rounded-3xl border border-surface-border dark:border-surface-darkBorder p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="border-b border-surface-border/50 dark:border-surface-darkBorder/50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 flex items-center justify-center">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-ink-primary dark:text-neutral-100">
                In-Browser Neural AI Studio
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-200 font-bold">
                100% Client-Side WebGPU / WASM
              </span>
            </div>
            <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-0.5">
              Runs MobileBERT zero-shot classification entirely inside your browser's hardware. Zero API keys. Zero cloud telemetry.
            </p>
          </div>
        </div>

        <button
          onClick={handleRunNeuralAnalysis}
          disabled={isInitializing || isAnalyzing}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white text-xs font-semibold transition disabled:opacity-50 shadow-xs self-start sm:self-auto"
        >
          {isInitializing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Loading Local Model...</span>
            </>
          ) : isAnalyzing ? (
            <>
              <Zap className="w-4 h-4 animate-pulse text-amber-300" />
              <span>Computing Inference...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run Local Neural Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Zero-Cloud Privacy Guarantee Banner */}
      <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/60 flex items-start gap-2.5 text-xs text-purple-950 dark:text-purple-200">
        <ShieldCheck className="w-4 h-4 text-purple-700 dark:text-purple-400 shrink-0 mt-0.5" />
        <div>
          <strong className="block font-semibold mb-0.5">Peak Hackathon Innovation: Zero-Cloud AI</strong>
          Unlike traditional AI apps that send your sensitive texts to external servers, Sondera downloads a lightweight, quantized ONNX neural network once and executes inference directly on your laptop/phone GPU or WebAssembly.
        </div>
      </div>

      {/* Model Loading Progress Bar */}
      {isInitializing && downloadProgress !== null && (
        <div className="p-4 rounded-2xl bg-surface-muted dark:bg-surface-darkMuted border border-surface-border space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-primary dark:text-neutral-200 font-medium">
            <span className="flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 animate-bounce text-purple-600" />
              <span>{downloadStatus || 'Downloading neural model weights into browser cache...'}</span>
            </span>
            <span className="font-mono">{downloadProgress}%</span>
          </div>
          <div className="w-full bg-neutral-200 dark:bg-neutral-700 h-2 rounded-full overflow-hidden">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${downloadProgress}%` }}
            />
          </div>
          <span className="text-[10px] text-ink-muted block">
            * Cached permanently in browser CacheStorage so future analyses run instantaneously.
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
        <div className="space-y-6 pt-2">
          {/* Top Classification Card */}
          <div className="p-5 rounded-2xl border border-purple-300 dark:border-purple-800 bg-purple-50/40 dark:bg-purple-950/30 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-900 dark:text-purple-200 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-purple-600" />
                <span>Neural Semantic Intent Classification</span>
              </span>
              <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300">
                Device: {result.executionDevice.toUpperCase()} • Inference: {result.inferenceTimeMs}ms
              </span>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-xl font-extrabold text-purple-950 dark:text-purple-100 capitalize">
                {result.topLabel}
              </span>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-100">
                {Math.round(result.confidence * 100)}% Confidence
              </span>
            </div>

            {/* Candidate Probabilities Breakdown */}
            <div className="space-y-2 pt-2 border-t border-purple-200/60 dark:border-purple-900/60">
              <span className="text-[11px] font-semibold text-ink-muted uppercase">
                All Candidate Semantic Probabilities:
              </span>
              <div className="space-y-1.5">
                {result.allScores.map((s, idx) => (
                  <div key={idx} className="space-y-0.5">
                    <div className="flex justify-between text-xs text-ink-primary dark:text-neutral-200">
                      <span className="capitalize">{s.label}</span>
                      <span className="font-mono text-xs">{Math.round(s.score * 100)}%</span>
                    </div>
                    <div className="w-full bg-neutral-200 dark:bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full"
                        style={{ width: `${Math.round(s.score * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Linguistic Pressure Radar */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-4 rounded-2xl bg-surface-muted dark:bg-surface-darkMuted border border-surface-border text-center">
              <span className="block text-[10px] font-bold uppercase text-red-700 dark:text-red-400">
                Fear & Coercion Pressure
              </span>
              <div className="text-2xl font-black text-ink-primary dark:text-neutral-100 mt-1">
                {Math.round(result.manipulationIndicators.fearScore * 100)}%
              </div>
              <span className="text-[10px] text-ink-muted">Arrest / Penalties language</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-muted dark:bg-surface-darkMuted border border-surface-border text-center">
              <span className="block text-[10px] font-bold uppercase text-amber-700 dark:text-amber-400">
                Time-Pressure Urgency
              </span>
              <div className="text-2xl font-black text-ink-primary dark:text-neutral-100 mt-1">
                {Math.round(result.manipulationIndicators.urgencyScore * 100)}%
              </div>
              <span className="text-[10px] text-ink-muted">Manufactured countdowns</span>
            </div>

            <div className="p-4 rounded-2xl bg-surface-muted dark:bg-surface-darkMuted border border-surface-border text-center">
              <span className="block text-[10px] font-bold uppercase text-blue-700 dark:text-blue-400">
                Institutional Authority Posture
              </span>
              <div className="text-2xl font-black text-ink-primary dark:text-neutral-100 mt-1">
                {Math.round(result.manipulationIndicators.authorityScore * 100)}%
              </div>
              <span className="text-[10px] text-ink-muted">Bank/Government asserting</span>
            </div>
          </div>

          {/* Neural Claim Extraction */}
          {result.detectedClaims.length > 0 && (
            <div className="p-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-forest-700 dark:text-forest-400" />
                  <span>Neural Extracted Factual Assertions</span>
                </span>
                <span className="text-[10px] text-ink-muted">Click to add to Case Claims</span>
              </div>

              <div className="space-y-2">
                {result.detectedClaims.map((clm, idx) => {
                  const isImported = importedClaims.has(idx);
                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-surface-border/60 dark:border-surface-darkBorder/60 bg-surface-light/50 dark:bg-surface-dark/50 flex items-center justify-between gap-3 text-xs"
                    >
                      <p className="text-ink-primary dark:text-neutral-200 font-medium font-sans">
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
  );
};
