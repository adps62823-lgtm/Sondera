import React, { useState } from 'react';
import {
  InvestigationCase,
  Claim,
  EvidenceItem,
  ClaimEvidenceRelation,
  Finding,
} from '../../types/domain';
import { Network, List, Shield, FileText, CheckCircle2, XCircle, Info, Sparkles } from 'lucide-react';

interface TrustGraphViewProps {
  caseData: InvestigationCase;
  claims: Claim[];
  evidence: EvidenceItem[];
  relations: ClaimEvidenceRelation[];
  findings: Finding[];
}

export const TrustGraphView: React.FC<TrustGraphViewProps> = ({
  caseData,
  claims,
  evidence,
  relations,
  findings,
}) => {
  const [viewMode, setViewMode] = useState<'visual' | 'table'>('visual');
  const [selectedRelation, setSelectedRelation] = useState<string>('all');
  const [inspectingNode, setInspectingNode] = useState<{
    id: string;
    title: string;
    type: 'case' | 'finding' | 'claim' | 'evidence';
    subtitle?: string;
    details?: string;
  } | null>(null);

  const filteredRelations = relations.filter((r) =>
    selectedRelation === 'all' ? true : r.relation === selectedRelation
  );

  return (
    <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-5 shadow-sm space-y-4">
      {/* Header with Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border/50 dark:border-surface-darkBorder/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-forest-50 dark:bg-forest-900/40 text-forest-700 dark:text-forest-300">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink-primary dark:text-neutral-100">
              Trust Graph & Relational Mapping
            </h3>
            <p className="text-xs text-ink-secondary dark:text-neutral-400">
              Visualizing evidence links between claims, observations, and source documents.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Relation filter */}
          <select
            value={selectedRelation}
            onChange={(e) => setSelectedRelation(e.target.value)}
            className="text-xs px-2.5 py-1.5 rounded-lg border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-ink-primary dark:text-neutral-200"
          >
            <option value="all">All Relations ({relations.length})</option>
            <option value="supports">Supports</option>
            <option value="contradicts">Contradicts</option>
            <option value="mentions">Mentions</option>
            <option value="unassessed">Unassessed</option>
          </select>

          {/* Toggle Visual / Table */}
          <div className="flex items-center bg-surface-muted dark:bg-surface-darkMuted p-1 rounded-lg">
            <button
              onClick={() => setViewMode('visual')}
              className={`p-1.5 rounded text-xs transition ${
                viewMode === 'visual'
                  ? 'bg-white dark:bg-surface-darkCard shadow-xs text-forest-800 dark:text-forest-200 font-semibold'
                  : 'text-ink-secondary dark:text-neutral-400'
              }`}
              title="Visual Diagram"
            >
              <Network className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded text-xs transition ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-surface-darkCard shadow-xs text-forest-800 dark:text-forest-200 font-semibold'
                  : 'text-ink-secondary dark:text-neutral-400'
              }`}
              title="Structured Table Fallback"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="relative border border-surface-border/60 dark:border-surface-darkBorder/60 rounded-xl bg-surface-light/40 dark:bg-surface-dark/40 p-4 min-h-[380px] flex flex-col justify-between overflow-x-auto">
          {/* Legend */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] text-ink-secondary dark:text-neutral-400 pb-3 border-b border-surface-border/40 dark:border-surface-darkBorder/40">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-forest-800" /> Case Root
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Finding / Indicator
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Atomic Claim
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Evidence Source
              </span>
            </div>
            <span className="text-[10px] text-ink-muted">Click any node to inspect details</span>
          </div>

          {/* Interactive Visual Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 py-4">
            {/* Column 1: Case Root */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">1. Case Origin</span>
              <div
                onClick={() =>
                  setInspectingNode({
                    id: caseData.id,
                    title: caseData.title,
                    type: 'case',
                    subtitle: `Kind: ${caseData.kind.toUpperCase()} • Created: ${caseData.createdAt.substring(0, 10)}`,
                    details: caseData.originalInput,
                  })
                }
                className="p-3.5 rounded-xl bg-forest-900 text-white text-xs font-semibold shadow-sm cursor-pointer hover:ring-2 hover:ring-forest-400 transition"
              >
                <div className="flex items-center gap-1.5 mb-1 text-forest-200 text-[10px]">
                  <Shield className="w-3.5 h-3.5" />
                  <span>CASE ROOT</span>
                </div>
                <p className="truncate font-bold">{caseData.title}</p>
                <span className="text-[10px] opacity-75 font-mono">{caseData.kind}</span>
              </div>
            </div>

            {/* Column 2: Findings */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                2. Observed Indicators ({findings.length})
              </span>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {findings.length === 0 ? (
                  <p className="text-[11px] text-ink-muted italic py-2">No findings triggered</p>
                ) : (
                  findings.map((f) => (
                    <div
                      key={f.id}
                      onClick={() =>
                        setInspectingNode({
                          id: f.id,
                          title: f.title,
                          type: 'finding',
                          subtitle: `Severity: ${f.severity.toUpperCase()} • Rule: ${f.ruleId}`,
                          details: f.explanation,
                        })
                      }
                      className="p-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/40 text-xs cursor-pointer hover:shadow-xs transition"
                    >
                      <div className="font-semibold text-amber-900 dark:text-amber-200 truncate">{f.title}</div>
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase font-mono font-bold">
                        {f.severity}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 3: Claims */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                3. Atomic Claims ({claims.length})
              </span>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {claims.length === 0 ? (
                  <p className="text-[11px] text-ink-muted italic py-2">No claims registered</p>
                ) : (
                  claims.map((c) => (
                    <div
                      key={c.id}
                      onClick={() =>
                        setInspectingNode({
                          id: c.id,
                          title: c.text,
                          type: 'claim',
                          subtitle: `Origin: ${c.origin} • Status: ${c.status}`,
                          details: c.note || 'Extracted claim statement',
                        })
                      }
                      className="p-2.5 rounded-xl border border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 text-xs cursor-pointer hover:shadow-xs transition"
                    >
                      <p className="text-blue-900 dark:text-blue-200 line-clamp-2 font-medium">"{c.text}"</p>
                      <span className="text-[10px] text-blue-700 dark:text-blue-400 capitalize">{c.origin}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Column 4: Evidence Items */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-ink-muted">
                4. Evidence Items ({evidence.length})
              </span>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {evidence.length === 0 ? (
                  <p className="text-[11px] text-ink-muted italic py-2">No sources attached</p>
                ) : (
                  evidence.map((e) => (
                    <div
                      key={e.id}
                      onClick={() =>
                        setInspectingNode({
                          id: e.id,
                          title: e.title,
                          type: 'evidence',
                          subtitle: `Type: ${e.type} • Status: ${e.status}`,
                          details: e.excerpt || e.url || 'Authoritative source reference',
                        })
                      }
                      className="p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/40 text-xs cursor-pointer hover:shadow-xs transition"
                    >
                      <p className="font-semibold text-emerald-900 dark:text-emerald-200 truncate">{e.title}</p>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 capitalize font-medium">
                        {e.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Node Inspector Drawer */}
          {inspectingNode && (
            <div className="mt-4 p-4 rounded-xl bg-white dark:bg-surface-darkCard border border-forest-300 dark:border-forest-800 shadow-sm space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-bold uppercase text-[10px] px-2 py-0.5 rounded bg-forest-100 dark:bg-forest-900 text-forest-800 dark:text-forest-200">
                    {inspectingNode.type}
                  </span>
                  <span className="font-bold text-ink-primary dark:text-neutral-100">
                    {inspectingNode.title}
                  </span>
                </div>
                <button
                  onClick={() => setInspectingNode(null)}
                  className="text-ink-muted hover:text-ink-primary text-xs"
                >
                  ✕ Close
                </button>
              </div>

              {inspectingNode.subtitle && (
                <p className="text-[11px] text-ink-muted">{inspectingNode.subtitle}</p>
              )}

              {inspectingNode.details && (
                <p className="text-ink-secondary dark:text-neutral-300 bg-surface-muted dark:bg-surface-darkMuted p-2.5 rounded-lg border border-surface-border/50">
                  {inspectingNode.details}
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        /* Structured Accessible Table Mode */
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-surface-border dark:border-surface-darkBorder text-ink-muted dark:text-neutral-400">
                <th className="pb-2 font-medium">Claim Statement</th>
                <th className="pb-2 font-medium">Relation</th>
                <th className="pb-2 font-medium">Evidence / Source</th>
                <th className="pb-2 font-medium">Rationale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border/50 dark:divide-surface-darkBorder/50">
              {filteredRelations.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-center text-ink-muted italic">
                    No claim-to-evidence relations recorded yet. Attach a source and link it to a claim in the Evidence tab.
                  </td>
                </tr>
              ) : (
                filteredRelations.map((rel) => {
                  const claim = claims.find((c) => c.id === rel.claimId);
                  const evi = evidence.find((e) => e.id === rel.evidenceId);

                  const relationBadge =
                    rel.relation === 'supports'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : rel.relation === 'contradicts'
                      ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300';

                  return (
                    <tr key={rel.id} className="hover:bg-surface-muted/50 dark:hover:bg-surface-darkMuted/50">
                      <td className="py-2.5 font-medium text-ink-primary dark:text-neutral-200 pr-2">
                        {claim ? claim.text : 'Unknown Claim'}
                      </td>
                      <td className="py-2.5 pr-2">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${relationBadge}`}>
                          {rel.relation}
                        </span>
                      </td>
                      <td className="py-2.5 text-ink-primary dark:text-neutral-200 pr-2">
                        {evi ? evi.title : 'Unknown Source'}
                      </td>
                      <td className="py-2.5 text-ink-secondary dark:text-neutral-400">
                        {rel.rationale || 'User linked'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
