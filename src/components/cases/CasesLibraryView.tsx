import React, { useState, useEffect } from 'react';
import { InvestigationCase } from '../../types/domain';
import { db } from '../../services/db';
import { deleteCaseCascade, exportAllDataJson } from '../../services/case-service';
import {
  FolderOpen,
  Search,
  Filter,
  Pin,
  Trash2,
  Download,
  Upload,
  Calendar,
  Plus,
  Archive,
  ArchiveRestore,
} from 'lucide-react';

interface CasesLibraryViewProps {
  onSelectCase: (caseId: string) => void;
  onNewInvestigation: () => void;
}

export const CasesLibraryView: React.FC<CasesLibraryViewProps> = ({
  onSelectCase,
  onNewInvestigation,
}) => {
  const [cases, setCases] = useState<InvestigationCase[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'active' | 'archived'>('active');
  const [loading, setLoading] = useState(true);

  const loadCases = async () => {
    setLoading(true);
    const list = await db.cases.toArray();
    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });
    setCases(list);
    setLoading(false);
  };

  useEffect(() => {
    loadCases();
  }, []);

  const handleTogglePin = async (c: InvestigationCase, e: React.MouseEvent) => {
    e.stopPropagation();
    await db.cases.update(c.id, { pinned: !c.pinned });
    loadCases();
  };

  const handleToggleArchive = async (c: InvestigationCase, e: React.MouseEvent) => {
    e.stopPropagation();
    const isArchived = Boolean(c.archivedAt);
    const now = new Date().toISOString();
    await db.cases.update(c.id, {
      archivedAt: isArchived ? undefined : now,
      status: isArchived ? 'open' : 'archived',
      updatedAt: now,
    });
    loadCases();
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Delete this case and all associated evidence/notes permanently?')) {
      await deleteCaseCascade(id);
      loadCases();
    }
  };

  const handleExportBackup = async () => {
    const json = await exportAllDataJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Sondera_Full_Backup_${new Date().toISOString().substring(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.data || !Array.isArray(parsed.data.cases)) {
        alert('Invalid Sondera backup file format.');
        return;
      }

      await db.transaction(
        'rw',
        [
          db.cases,
          db.claims,
          db.evidence,
          db.relations,
          db.findings,
          db.checks,
          db.timelineEvents,
          db.notes,
          db.reports,
        ],
        async () => {
          if (parsed.data.cases?.length) await db.cases.bulkPut(parsed.data.cases);
          if (parsed.data.claims?.length) await db.claims.bulkPut(parsed.data.claims);
          if (parsed.data.evidence?.length) await db.evidence.bulkPut(parsed.data.evidence);
          if (parsed.data.relations?.length) await db.relations.bulkPut(parsed.data.relations);
          if (parsed.data.findings?.length) await db.findings.bulkPut(parsed.data.findings);
          if (parsed.data.checks?.length) await db.checks.bulkPut(parsed.data.checks);
          if (parsed.data.timelineEvents?.length)
            await db.timelineEvents.bulkPut(parsed.data.timelineEvents);
          if (parsed.data.notes?.length) await db.notes.bulkPut(parsed.data.notes);
          if (parsed.data.reports?.length) await db.reports.bulkPut(parsed.data.reports);
        }
      );

      alert('Backup imported successfully!');
      loadCases();
    } catch (err: unknown) {
      alert(`Import failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  };

  const filteredCases = cases.filter((c) => {
    const matchesArchived =
      statusFilter === 'active' ? !c.archivedAt : Boolean(c.archivedAt);
    const matchesType = typeFilter === 'all' ? true : c.kind === typeFilter;
    const matchesSearch =
      searchQuery.trim() === ''
        ? true
        : c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.originalInput.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (c.senderLabel && c.senderLabel.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesArchived && matchesType && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-surface-darkCard p-6 rounded-2xl border border-surface-border dark:border-surface-darkBorder shadow-sm">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-forest-900 dark:text-forest-100 flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-forest-700 dark:text-forest-400" />
            <span>Investigation Library</span>
          </h1>
          <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-1">
            All cases persist locally in your browser's IndexedDB. No remote tracking.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onNewInvestigation}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-forest-900 hover:bg-forest-800 text-white text-xs font-medium transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Investigation</span>
          </button>

          <button
            onClick={handleExportBackup}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted dark:bg-surface-darkMuted border border-surface-border dark:border-surface-darkBorder text-ink-primary dark:text-neutral-200 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Backup JSON</span>
          </button>

          <label className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted dark:bg-surface-darkMuted border border-surface-border dark:border-surface-darkBorder text-ink-primary dark:text-neutral-200 text-xs font-medium hover:bg-neutral-100 dark:hover:bg-neutral-800 transition cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Restore JSON</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Tab Toggle */}
        <div className="flex items-center bg-surface-muted dark:bg-surface-darkMuted p-1 rounded-xl self-start sm:self-auto text-xs">
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              statusFilter === 'active'
                ? 'bg-white dark:bg-surface-darkCard text-forest-900 dark:text-forest-100 shadow-xs'
                : 'text-ink-muted'
            }`}
          >
            Active Cases ({cases.filter((c) => !c.archivedAt).length})
          </button>
          <button
            onClick={() => setStatusFilter('archived')}
            className={`px-3 py-1 rounded-lg transition font-medium ${
              statusFilter === 'archived'
                ? 'bg-white dark:bg-surface-darkCard text-forest-900 dark:text-forest-100 shadow-xs'
                : 'text-ink-muted'
            }`}
          >
            Archived ({cases.filter((c) => c.archivedAt).length})
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto flex-1 max-w-lg">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-ink-muted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cases by title, sender, or snippet..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard text-xs text-ink-primary dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
            />
          </div>

          <div className="flex items-center gap-1.5 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-ink-muted shrink-0" />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard text-xs text-ink-primary dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-forest-600"
            >
              <option value="all">All Kinds</option>
              <option value="message">Messages</option>
              <option value="url">URLs</option>
              <option value="claim">Claims</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Grid */}
      {loading ? (
        <div className="text-center py-12 text-xs text-ink-muted">Loading cases...</div>
      ) : filteredCases.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder">
          <FolderOpen className="w-10 h-10 text-ink-muted mx-auto mb-3 opacity-60" />
          <h3 className="font-bold text-sm text-ink-primary dark:text-neutral-200">
            {cases.length === 0
              ? 'Your Workspace is Empty'
              : statusFilter === 'archived'
              ? 'No Archived Cases'
              : 'No Matching Cases Found'}
          </h3>
          <p className="text-xs text-ink-secondary dark:text-neutral-400 mt-1 max-w-sm mx-auto">
            {cases.length === 0
              ? 'Start with a suspicious message, link, or viral claim you want to examine. Your investigations remain local on this device.'
              : 'Try clearing your search query or switching filters to see other cases.'}
          </p>
          {cases.length === 0 && (
            <button
              onClick={onNewInvestigation}
              className="mt-4 px-4 py-2 rounded-xl bg-forest-900 text-white text-xs font-medium hover:bg-forest-800 transition"
            >
              Start First Investigation
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCases.map((c) => (
            <div
              key={c.id}
              onClick={() => onSelectCase(c.id)}
              className="p-5 rounded-2xl border border-surface-border dark:border-surface-darkBorder bg-white dark:bg-surface-darkCard hover:border-forest-400 dark:hover:border-forest-700 transition shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-forest-100 dark:bg-forest-900/60 text-forest-800 dark:text-forest-200 font-semibold">
                    {c.kind}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={(e) => handleTogglePin(c, e)}
                      className={`p-1 rounded hover:bg-neutral-100 dark:hover:bg-neutral-800 ${
                        c.pinned ? 'text-forest-700 dark:text-forest-300' : 'text-ink-muted'
                      }`}
                      title={c.pinned ? 'Unpin' : 'Pin to top'}
                    >
                      <Pin className={`w-3.5 h-3.5 ${c.pinned ? 'fill-current' : ''}`} />
                    </button>
                    <button
                      onClick={(e) => handleToggleArchive(c, e)}
                      className="p-1 rounded text-ink-muted hover:text-forest-700 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title={c.archivedAt ? 'Restore from Archive' : 'Archive Case'}
                    >
                      {c.archivedAt ? (
                        <ArchiveRestore className="w-3.5 h-3.5 text-forest-600" />
                      ) : (
                        <Archive className="w-3.5 h-3.5" />
                      )}
                    </button>
                    <button
                      onClick={(e) => handleDelete(c.id, e)}
                      className="p-1 rounded text-ink-muted hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      title="Delete case"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-sm text-ink-primary dark:text-neutral-100 line-clamp-2">
                  {c.title}
                </h3>

                <p className="mt-2 text-xs text-ink-secondary dark:text-neutral-400 font-mono line-clamp-3 bg-surface-muted dark:bg-surface-darkMuted p-2 rounded-lg">
                  {c.originalInput}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-border/50 dark:border-surface-darkBorder/50 flex items-center justify-between text-[11px] text-ink-muted">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(c.updatedAt).toLocaleDateString()}
                </span>
                <span className="text-forest-700 dark:text-forest-300 font-medium">
                  Inspect Case →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
