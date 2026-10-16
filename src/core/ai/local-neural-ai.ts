import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js for in-browser client execution
env.allowLocalModels = false;
env.useBrowserCache = true;

export interface NeuralAnalysisResult {
  topLabel: string;
  confidence: number;
  allScores: { label: string; score: number }[];
  manipulationIndicators: {
    fearScore: number;
    urgencyScore: number;
    authorityScore: number;
  };
  detectedClaims: string[];
  executionDevice: 'webgpu' | 'wasm';
  inferenceTimeMs: number;
}

export type ModelLoadProgressCallback = (progress: { status: string; progress?: number; file?: string }) => void;

class LocalNeuralEngine {
  private classifier: any = null;
  private isInitializing = false;

  public async isSupported(): Promise<boolean> {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  public async initialize(onProgress?: ModelLoadProgressCallback): Promise<void> {
    if (this.classifier) return;
    if (this.isInitializing) {
      while (this.isInitializing) {
        await new Promise((r) => setTimeout(r, 200));
      }
      return;
    }

    this.isInitializing = true;
    try {
      // Use Xenova/distilbert-base-uncased-finetuned-sst-2-english or Xenova/mobilebert-uncased (ultralight, ~20MB quantized)
      // For zero-shot classification: Xenova/mobilebert-uncased-mnli
      this.classifier = await pipeline(
        'zero-shot-classification',
        'Xenova/mobilebert-uncased-mnli',
        {
          progress_callback: (p: any) => {
            onProgress?.(p);
          },
        }
      );
    } catch (err) {
      console.warn('WebGPU / MobileBERT initialization fallback:', err);
      // Fallback pipeline if needed
      throw err;
    } finally {
      this.isInitializing = false;
    }
  }

  public async analyzeText(text: string): Promise<NeuralAnalysisResult> {
    if (!this.classifier) {
      throw new Error('Local neural model is not initialized yet. Call initialize() first.');
    }

    const startTime = performance.now();
    const candidateLabels = [
      'urgent financial threat or extortion',
      'credential phishing and password harvesting',
      'government or bank impersonation',
      'unsolicited lottery prize reward',
      'legitimate standard communication',
    ];

    // Run local inference
    const output: any = await this.classifier(text, candidateLabels);

    const scoresList: { label: string; score: number }[] = output.labels.map(
      (lbl: string, idx: number) => ({
        label: lbl,
        score: Math.round(output.scores[idx] * 100) / 100,
      })
    );

    scoresList.sort((a, b) => b.score - a.score);

    // Compute linguistic manipulation heuristics from text structure + model scores
    const lower = text.toLowerCase();
    const hasFear = /arrest|police|jail|blocked|court|penalty|prosecution|illegal/i.test(lower);
    const hasUrgency = /immediate|today|24 hours|minutes|urgent|now|deadline/i.test(lower);
    const hasAuthority = /officer|department|rbi|bank|customs|inspector|headquarters/i.test(lower);

    // Extract atomic assertions / sentences
    const sentences = text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 15 && !s.startsWith('http'));

    const endTime = performance.now();

    return {
      topLabel: scoresList[0].label,
      confidence: scoresList[0].score,
      allScores: scoresList,
      manipulationIndicators: {
        fearScore: hasFear ? Math.min(0.95, scoresList[0].score * 1.1) : 0.15,
        urgencyScore: hasUrgency ? Math.min(0.98, scoresList[0].score * 1.15) : 0.2,
        authorityScore: hasAuthority ? Math.min(0.92, scoresList[0].score) : 0.1,
      },
      detectedClaims: sentences.slice(0, 4),
      executionDevice: typeof navigator !== 'undefined' && 'gpu' in navigator ? 'webgpu' : 'wasm',
      inferenceTimeMs: Math.round(endTime - startTime),
    };
  }
}

export const localNeuralEngine = new LocalNeuralEngine();
