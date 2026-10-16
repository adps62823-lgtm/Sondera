import React, { useState, useEffect, useRef } from 'react';
import { CaseNote } from '../../types/domain';
import { db } from '../../services/db';
import { FileEdit, Save, Plus, Trash2 } from 'lucide-react';
import { SaveStatus } from '../layout/SaveIndicator';

interface CaseNotesProps {
  caseId: string;
  notes: CaseNote[];
  onNotesUpdated: () => void;
  onSaveStatusChange: (status: SaveStatus) => void;
}

export const CaseNotes: React.FC<CaseNotesProps> = ({
  caseId,
  notes,
  onNotesUpdated,
  onSaveStatusChange,
}) => {
  const [activeNoteText, setActiveNoteText] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const debounceTimer = useRef<number | null>(null);

  useEffect(() => {
    if (notes.length > 0 && !selectedNoteId) {
      setSelectedNoteId(notes[0].id);
      setActiveNoteText(notes[0].body);
    } else if (selectedNoteId) {
      const current = notes.find((n) => n.id === selectedNoteId);
      if (current) {
        setActiveNoteText(current.body);
      }
    }
  }, [notes, selectedNoteId]);

  const handleCreateNewNote = async () => {
    const id = `note-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const now = new Date().toISOString();
    await db.notes.add({
      id,
      caseId,
      body: 'New investigation note...',
      createdAt: now,
      updatedAt: now,
    });
    setSelectedNoteId(id);
    setActiveNoteText('New investigation note...');
    onNotesUpdated();
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setActiveNoteText(text);
    onSaveStatusChange('saving');

    if (debounceTimer.current) {
      window.clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = window.setTimeout(async () => {
      if (selectedNoteId) {
        try {
          await db.notes.update(selectedNoteId, {
            body: text,
            updatedAt: new Date().toISOString(),
          });
          onSaveStatusChange('saved');
          onNotesUpdated();
        } catch {
          onSaveStatusChange('error');
        }
      }
    }, 600);
  };

  const handleDeleteNote = async (id: string) => {
    await db.notes.delete(id);
    if (selectedNoteId === id) {
      setSelectedNoteId(null);
      setActiveNoteText('');
    }
    onNotesUpdated();
  };

  return (
    <div className="bg-white dark:bg-surface-darkCard rounded-2xl border border-surface-border dark:border-surface-darkBorder p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between border-b border-surface-border/50 dark:border-surface-darkBorder/50 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-forest-50 dark:bg-forest-900/40 text-forest-700 dark:text-forest-300">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-ink-primary dark:text-neutral-100">
              Analyst Working Notes
            </h3>
            <p className="text-xs text-ink-secondary dark:text-neutral-400">
              Autosaved thoughts, contact logs, or verification details saved locally on this machine.
            </p>
          </div>
        </div>

        <button
          onClick={handleCreateNewNote}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-forest-900 hover:bg-forest-800 text-white font-medium transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Note</span>
        </button>
      </div>

      {notes.length === 0 ? (
        <div className="text-center py-6">
          <p className="text-xs text-ink-muted dark:text-neutral-400 mb-3 italic">
            No notes written yet. Keep your investigation thoughts and phone call notes organized here.
          </p>
          <button
            onClick={handleCreateNewNote}
            className="text-xs px-3 py-1.5 rounded-lg border border-forest-600 text-forest-700 dark:text-forest-300 font-medium"
          >
            Create First Note
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Note List Sidebar */}
          <div className="space-y-2 border-r border-surface-border/50 dark:border-surface-darkBorder/50 pr-2 max-h-72 overflow-y-auto">
            {notes.map((n) => (
              <div
                key={n.id}
                onClick={() => setSelectedNoteId(n.id)}
                className={`p-2.5 rounded-xl border text-xs cursor-pointer transition flex items-start justify-between gap-2 ${
                  selectedNoteId === n.id
                    ? 'border-forest-600 bg-forest-50 dark:bg-forest-950/60 dark:border-forest-700 font-semibold text-forest-900 dark:text-forest-100'
                    : 'border-surface-border dark:border-surface-darkBorder hover:bg-neutral-50 dark:hover:bg-neutral-800 text-ink-secondary dark:text-neutral-400'
                }`}
              >
                <div className="truncate">
                  <p className="truncate">{n.body.substring(0, 30) || 'Empty Note'}</p>
                  <span className="text-[10px] text-ink-muted dark:text-neutral-500 font-normal">
                    {new Date(n.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteNote(n.id);
                  }}
                  className="text-ink-muted hover:text-red-600 p-1"
                  title="Delete Note"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          {/* Active Note Editor */}
          <div className="md:col-span-2 space-y-2">
            <textarea
              rows={8}
              value={activeNoteText}
              onChange={handleTextChange}
              placeholder="Record your observations, who you spoke to, or next verification steps..."
              className="w-full p-3 rounded-xl border border-surface-border dark:border-surface-darkBorder bg-surface-light dark:bg-surface-dark text-xs text-ink-primary dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-forest-600 font-sans resize-y"
            />
            <div className="flex justify-between items-center text-[11px] text-ink-muted">
              <span>Debounced autosave active • Changes persist locally</span>
              <span>{activeNoteText.length} characters</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
