import React, { useState } from 'react';
import { RedactionSuggestion } from '../../types/domain';
import { Lock, Eye, Check, X, Plus, Trash2, AlertCircle } from 'lucide-react';

interface RedactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  rawText: string;
  suggestions: RedactionSuggestion[];
  onApplySuggestions: (updated: RedactionSuggestion[]) => void;
}

export const RedactionModal: React.FC<RedactionModalProps> = ({
  isOpen,
  onClose,
  rawText,
  suggestions,
  onApplySuggestions,
}) => {
  const [items, setItems] = useState<RedactionSuggestion[]>(suggestions);
  const [customKeyword, setCustomKeyword] = useState('');

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((it) => (it.id === id ? { ...it, accepted: !it.accepted } : it))
    );
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customKeyword.trim()) return;

    const query = customKeyword.trim();
    let idx = rawText.indexOf(query);
    const newItems: RedactionSuggestion[] = [];

    while (idx !== -1) {
      newItems.push({
        id: `custom-redact-${Date.now()}-${idx}`,
        type: 'name',
        originalText: query,
        replacementText: `[REDACTED_${query.toUpperCase().replace(/\s+/g, '_')}]`,
        startIndex: idx,
        endIndex: idx + query.length,
        accepted: true,
      });
      idx = rawText.indexOf(query, idx + query.length);
    }

    if (newItems.length > 0) {
      setItems((prev) => [...prev, ...newItems].sort((a, b) => a.startIndex - b.startIndex));
      setCustomKeyword('');
    } else {
      alert(`The string "${query}" was not found in the examined text.`);
    }
  };

  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
  };

  const handleConfirm = () => {
    onApplySuggestions(items);
    onClose();
  };

  // Compute live preview
  let previewText = rawText;
  const activeItems = [...items].filter((i) => i.accepted).sort((a, b) => b.startIndex - a.startIndex);
  for (const it of activeItems) {
    previewText =
      previewText.substring(0, it.startIndex) +
      it.replacementText +
      previewText.substring(it.endIndex);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-surface-darkCard rounded-2xl max-w-2xl w-full p-6 border border-surface-border dark:border-surface-darkBorder shadow-xl space-y-5 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-surface-border/50 dark:border-surface-darkBorder/50 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-ink-primary dark:text-neutral-100">
                Share-Safe Redaction Review
              </h3>
              <p className="text-xs text-ink-secondary dark:text-neutral-400">
                Mask personal identifiable information (PII) before sharing this report.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-muted hover:text-ink-primary p-1.5 rounded-lg text-sm"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto space-y-4 pr-1 flex-1">
          {/* Add custom word */}
          <form onSubmit={handleAddCustom} className="flex gap-2">
            <input
              type="text"
              value={customKeyword}
              onChange={(e) => setCustomKeyword(e.target.value)}
              placeholder="Type a custom name, ID, or company to redact..."
              className="flex-1 px-3 py-1.5 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-forest-600"
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-medium transition"
            >
              + Redact Word
            </button>
          </form>

          {/* List of Detected Items */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted">
              Identified Entities ({items.length})
            </span>
            {items.length === 0 ? (
              <p className="text-xs text-ink-muted italic py-2">
                No phone numbers, emails, or codes detected. Use the custom redactor above if needed.
              </p>
            ) : (
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {items.map((it) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between p-2 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-muted/50 dark:bg-surface-darkMuted/50 text-xs"
                  >
                    <label className="flex items-center gap-2 cursor-pointer flex-1 mr-2">
                      <input
                        type="checkbox"
                        checked={it.accepted}
                        onChange={() => toggleItem(it.id)}
                        className="rounded text-forest-700 focus:ring-forest-600"
                      />
                      <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200">
                        {it.type}
                      </span>
                      <span className="font-mono text-ink-primary dark:text-neutral-200 truncate">
                        "{it.originalText}"
                      </span>
                      <span className="text-ink-muted text-[11px]">→ {it.replacementText}</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(it.id)}
                      className="text-ink-muted hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Real-time Masked Preview */}
          <div className="space-y-1 pt-2 border-t border-surface-border/50">
            <span className="text-[11px] font-bold uppercase tracking-wider text-ink-muted flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-forest-600" />
              <span>Real-Time Masked Preview</span>
            </span>
            <pre className="p-3 rounded-xl bg-surface-muted dark:bg-surface-darkMuted text-xs font-mono text-ink-primary dark:text-neutral-200 whitespace-pre-wrap max-h-36 overflow-y-auto border border-surface-border/50">
              {previewText}
            </pre>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-surface-border/50">
          <span className="text-[10px] text-ink-muted">
            * Automatic redaction can miss atypical formats. Always review before sharing publicly.
          </span>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-ink-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-1.5 rounded-xl bg-forest-900 text-white text-xs font-medium hover:bg-forest-800 transition"
            >
              Apply Redactions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
