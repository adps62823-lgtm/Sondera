import React, { useState } from 'react';
import {
  Claim,
  EvidenceItem,
  ClaimEvidenceRelation,
  EvidenceRelation,
} from '../../types/domain';
import {
  Plus,
  Link,
  BookOpen,
  FileCheck2,
  Trash2,
  CheckCircle,
  XCircle,
  ExternalLink,
  Tag,
} from 'lucide-react';
import { addEvidenceItem, addClaimItem, linkClaimAndEvidence } from '../../services/case-service';
import { db } from '../../services/db';

interface EvidenceManagerProps {
  caseId: string;
  claims: Claim[];
  evidence: EvidenceItem[];
  relations: ClaimEvidenceRelation[];
  onDataChanged: () => void;
}

export const EvidenceManager: React.FC<EvidenceManagerProps> = ({
  caseId,
  claims,
  evidence,
  relations,
  onDataChanged,
}) => {
  // Add Claim Form State
  const [showAddClaim, setShowAddClaim] = useState(false);
  const [newClaimText, setNewClaimText] = useState('');

  // Add Evidence Form State
  const [showAddEvidence, setShowAddEvidence] = useState(false);
  const [eviTitle, setEviTitle] = useState('');
  const [eviType, setEviType] = useState<EvidenceItem['type']>('official_statement');
  const [eviUrl, setEviUrl] = useState('');
  const [eviPublisher, setEviPublisher] = useState('');
  const [eviExcerpt, setEviExcerpt] = useState('');
  const [eviStatus, setEviStatus] = useState<EvidenceItem['status']>('supports');

  // Link Dialog State
  const [linkingClaimId, setLinkingClaimId] = useState<string | null>(null);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string>('');
  const [relationType, setRelationType] = useState<EvidenceRelation>('supports');
  const [rationale, setRationale] = useState('');

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClaimText.trim()) return;

    await addClaimItem({
      caseId,
      text: newClaimText.trim(),
      origin: 'user_supplied',
      status: 'unassessed',
    });

    setNewClaimText('');
    setShowAddClaim(false);
    onDataChanged();
  };

  const handleCreateEvidence = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eviTitle.trim()) return;

    await addEvidenceItem({
      caseId,
      title: eviTitle.trim(),
      type: eviType,
      url: eviUrl.trim() || undefined,
      publisher: eviPublisher.trim() || undefined,
      excerpt: eviExcerpt.trim() || undefined,
      sourceBasis: 'user_entered',
      status: eviStatus,
      accessedAt: new Date().toISOString(),
    });

    setEviTitle('');
    setEviUrl('');
    setEviPublisher('');
    setEviExcerpt('');
    setShowAddEvidence(false);
    onDataChanged();
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkingClaimId || !selectedEvidenceId) return;

    await linkClaimAndEvidence(caseId, linkingClaimId, selectedEvidenceId, relationType, rationale);

    setLinkingClaimId(null);
    setSelectedEvidenceId('');
    setRationale('');
    onDataChanged();
  };

  const handleDeleteClaim = async (id: string) => {
    await db.claims.delete(id);
    await db.relations.where('claimId').equals(id).delete();
    onDataChanged();
  };

  const handleDeleteEvidence = async (id: string) => {
    await db.evidence.delete(id);
    await db.relations.where('evidenceId').equals(id).delete();
    onDataChanged();
  };

  return (
    <div className="space-y-6">
      {/* 1. Claims Management Section */}
      <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border/50 dark:border-surface-darkBorder/50 pb-3">
          <div>
            <h3 className="font-bold text-sm text-ink-primary dark:text-neutral-100 flex items-center gap-2">
              <Tag className="w-4 h-4 text-forest-700 dark:text-forest-400" />
              <span>Extracted & Atomic Claims ({claims.length})</span>
            </h3>
            <p className="text-xs text-ink-secondary dark:text-neutral-400">
              Break complex messages into discrete verifiable claims to assess evidence one-by-one.
            </p>
          </div>

          <button
            onClick={() => setShowAddClaim(!showAddClaim)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-forest-50 hover:bg-forest-100 dark:bg-forest-900/60 dark:hover:bg-forest-900 text-forest-800 dark:text-forest-200 font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddClaim ? 'Cancel' : 'Add Claim'}</span>
          </button>
        </div>

        {showAddClaim && (
          <form onSubmit={handleCreateClaim} className="p-3.5 rounded-xl bg-surface-muted dark:bg-surface-darkMuted border border-surface-border/60 dark:border-surface-darkBorder/60 space-y-2">
            <label className="block text-xs font-semibold text-ink-primary dark:text-neutral-200">
              Specific Claim Statement
            </label>
            <input
              type="text"
              value={newClaimText}
              onChange={(e) => setNewClaimText(e.target.value)}
              placeholder="e.g. Bank will block accounts today without KYC update."
              className="w-full px-3 py-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-forest-600"
              required
            />
            <button
              type="submit"
              className="px-3 py-1.5 rounded-lg bg-forest-900 text-white text-xs font-medium hover:bg-forest-800 transition"
            >
              Save Claim
            </button>
          </form>
        )}

        {claims.length === 0 ? (
          <p className="text-xs text-ink-muted dark:text-neutral-400 italic text-center py-3">
            No atomic claims registered yet. Add a specific claim to link supporting or debunking sources.
          </p>
        ) : (
          <div className="space-y-2.5">
            {claims.map((claim) => {
              const claimRelations = relations.filter((r) => r.claimId === claim.id);
              return (
                <div
                  key={claim.id}
                  className="p-3.5 rounded-xl border border-surface-border dark:border-surface-darkBorder hover:border-forest-300 dark:hover:border-forest-800 transition bg-surface-light/40 dark:bg-surface-dark/40"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-ink-primary dark:text-neutral-100">
                      "{claim.text}"
                    </p>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => setLinkingClaimId(claim.id)}
                        className="text-[11px] px-2 py-0.5 rounded bg-forest-100 hover:bg-forest-200 dark:bg-forest-900 text-forest-800 dark:text-forest-200 font-medium transition"
                      >
                        + Link Evidence
                      </button>
                      <button
                        onClick={() => handleDeleteClaim(claim.id)}
                        className="text-ink-muted hover:text-red-600 p-1 rounded"
                        title="Delete Claim"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Connected Evidence List for this Claim */}
                  {claimRelations.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-surface-border/40 dark:border-surface-darkBorder/40 space-y-1">
                      <span className="text-[10px] font-bold text-ink-muted uppercase">Linked Evidence:</span>
                      {claimRelations.map((rel) => {
                        const evi = evidence.find((e) => e.id === rel.evidenceId);
                        const isSupports = rel.relation === 'supports';
                        const isContradicts = rel.relation === 'contradicts';
                        return (
                          <div
                            key={rel.id}
                            className="flex items-center justify-between text-xs p-1.5 rounded bg-white dark:bg-surface-darkCard border border-surface-border/50 dark:border-surface-darkBorder/50"
                          >
                            <div className="flex items-center gap-1.5">
                              {isSupports ? (
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              ) : isContradicts ? (
                                <XCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                              ) : (
                                <Link className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              )}
                              <span className="font-medium text-ink-primary dark:text-neutral-200">
                                {evi ? evi.title : 'Deleted Evidence'}
                              </span>
                              <span className="text-[10px] uppercase font-mono px-1 rounded bg-neutral-100 dark:bg-neutral-800 text-ink-muted">
                                {rel.relation}
                              </span>
                            </div>
                            {rel.rationale && (
                              <span className="text-[11px] text-ink-secondary dark:text-neutral-400 italic">
                                {rel.rationale}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Link Claim to Evidence Modal */}
      {linkingClaimId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-darkCard rounded-2xl max-w-md w-full p-5 border border-surface-border dark:border-surface-darkBorder shadow-lg space-y-4">
            <h4 className="font-bold text-sm text-ink-primary dark:text-neutral-100">
              Link Evidence to Claim
            </h4>
            <form onSubmit={handleCreateLink} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-ink-secondary dark:text-neutral-300 mb-1">
                  Select Evidence Item
                </label>
                <select
                  value={selectedEvidenceId}
                  onChange={(e) => setSelectedEvidenceId(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100"
                  required
                >
                  <option value="">-- Choose from recorded evidence --</option>
                  {evidence.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.title} ({e.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary dark:text-neutral-300 mb-1">
                  Relationship Type
                </label>
                <select
                  value={relationType}
                  onChange={(e) => setRelationType(e.target.value as EvidenceRelation)}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100"
                >
                  <option value="supports">Supports (Confirms claim)</option>
                  <option value="contradicts">Contradicts (Debunks claim)</option>
                  <option value="contextualises">Contextualises (Adds nuance)</option>
                  <option value="mentions">Mentions (Tangential reference)</option>
                  <option value="unassessed">Unassessed</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-ink-secondary dark:text-neutral-300 mb-1">
                  Rationale / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="e.g. Official RBI circular confirms banks cannot freeze accounts without 30 days notice"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setLinkingClaimId(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-ink-secondary hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedEvidenceId}
                  className="px-3 py-1.5 rounded-lg bg-forest-900 text-white text-xs font-medium hover:bg-forest-800 disabled:opacity-50"
                >
                  Confirm Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Evidence Register Section */}
      <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-surface-border/50 dark:border-surface-darkBorder/50 pb-3">
          <div>
            <h3 className="font-bold text-sm text-ink-primary dark:text-neutral-100 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-forest-700 dark:text-forest-400" />
              <span>Evidence Register & Sources ({evidence.length})</span>
            </h3>
            <p className="text-xs text-ink-secondary dark:text-neutral-400">
              Record authoritative press releases, regulatory guidelines, or official statements.
            </p>
          </div>

          <button
            onClick={() => setShowAddEvidence(!showAddEvidence)}
            className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-forest-600 hover:bg-forest-700 text-white font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showAddEvidence ? 'Cancel' : 'Add Source Evidence'}</span>
          </button>
        </div>

        {showAddEvidence && (
          <form onSubmit={handleCreateEvidence} className="p-4 rounded-xl bg-surface-muted dark:bg-surface-darkMuted border border-surface-border/60 dark:border-surface-darkBorder/60 space-y-3">
            <h4 className="text-xs font-semibold text-ink-primary dark:text-neutral-200">
              Record Source Document
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-ink-secondary dark:text-neutral-300 mb-1">
                  Title / Source Name *
                </label>
                <input
                  type="text"
                  value={eviTitle}
                  onChange={(e) => setEviTitle(e.target.value)}
                  placeholder="e.g. Official RBI KYC Clarification Circular 2026"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink-secondary dark:text-neutral-300 mb-1">
                  Evidence Type
                </label>
                <select
                  value={eviType}
                  onChange={(e) => setEviType(e.target.value as EvidenceItem['type'])}
                  className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100"
                >
                  <option value="official_statement">Official Organization Statement</option>
                  <option value="url_source">Public Web Source / News Report</option>
                  <option value="quote">Direct Quote</option>
                  <option value="user_observation">User Observation</option>
                  <option value="correction">Official Correction/Debunk</option>
                  <option value="other">Other Document</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink-secondary dark:text-neutral-300 mb-1">
                  Source URL (Optional)
                </label>
                <input
                  type="url"
                  value={eviUrl}
                  onChange={(e) => setEviUrl(e.target.value)}
                  placeholder="https://rbi.org.in/press/..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-ink-secondary dark:text-neutral-300 mb-1">
                  Publisher / Organization (Optional)
                </label>
                <input
                  type="text"
                  value={eviPublisher}
                  onChange={(e) => setEviPublisher(e.target.value)}
                  placeholder="e.g. Reserve Bank of India"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-medium text-ink-secondary dark:text-neutral-300 mb-1">
                  Relevant Excerpt / Direct Quote
                </label>
                <textarea
                  rows={2}
                  value={eviExcerpt}
                  onChange={(e) => setEviExcerpt(e.target.value)}
                  placeholder="Paste the relevant sentence from the official source..."
                  className="w-full px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[10px] text-ink-muted">
                * Manually recorded item. Sondera does not initiate background web crawling.
              </span>
              <button
                type="submit"
                className="px-3 py-1.5 rounded-lg bg-forest-900 text-white text-xs font-medium hover:bg-forest-800 transition"
              >
                Record Source
              </button>
            </div>
          </form>
        )}

        {evidence.length === 0 ? (
          <p className="text-xs text-ink-muted dark:text-neutral-400 italic text-center py-4">
            No external sources attached to this case yet. Add official press releases or links to reduce Trust Debt.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {evidence.map((item) => (
              <div
                key={item.id}
                className="p-3.5 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-surface-light/30 dark:bg-surface-dark/30 hover:border-forest-300 dark:hover:border-forest-800 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-ink-primary dark:text-neutral-100">
                      {item.title}
                    </span>
                    <button
                      onClick={() => handleDeleteEvidence(item.id)}
                      className="text-ink-muted hover:text-red-600 p-0.5 rounded"
                      title="Delete Evidence"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-2 text-[10px] text-ink-muted">
                    <span className="uppercase px-1.5 py-0.5 rounded bg-surface-muted dark:bg-surface-darkMuted font-mono">
                      {item.type.replace('_', ' ')}
                    </span>
                    {item.publisher && <span>Pub: {item.publisher}</span>}
                    <span>Basis: {item.sourceBasis}</span>
                  </div>

                  {item.excerpt && (
                    <p className="mt-2 text-[11px] text-ink-secondary dark:text-neutral-300 italic border-l-2 border-forest-400 pl-2">
                      "{item.excerpt}"
                    </p>
                  )}
                </div>

                {item.url && (
                  <div className="mt-2.5 pt-2 border-t border-surface-border/40 dark:border-surface-darkBorder/40">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] text-forest-700 dark:text-forest-300 hover:underline"
                    >
                      <span>Open Source URL</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
