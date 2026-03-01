'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Prospect } from '../types.ts';
import { saveBigBoard } from '../lib/bigBoardService.ts';
import { AddProspectModal } from './AddProspectModal.tsx';
import { SaveBoardModal } from './SaveBoardModal.tsx';
import { PlayerDetail } from './PlayerDetail.tsx';

// ─── Sortable Row ──────────────────────────────────────────────────────
interface SortableRowProps {
  prospect: Prospect;
  rank: number;
  onRemove: (id: string) => void;
  onSelect: (prospect: Prospect) => void;
}

const SortableRow: React.FC<SortableRowProps> = ({ prospect, rank, onRemove, onSelect }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: prospect.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
    zIndex: isDragging ? 50 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border transition-colors ${
        isDragging ? 'border-emerald-500 bg-slate-800' : 'border-slate-800 bg-slate-900/60 hover:bg-slate-800/60'
      }`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1 sm:p-1.5 rounded-lg hover:bg-slate-700 text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing touch-none shrink-0"
        title="Drag to reorder"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
        </svg>
      </button>

      {/* Rank */}
      <span className="w-6 sm:w-8 text-center text-sm sm:text-base font-black font-oswald text-emerald-500 shrink-0">
        {rank}
      </span>

      {/* Headshot */}
      <img
        src={prospect.headshotUrl}
        alt={prospect.name}
        className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-slate-800 object-cover shrink-0"
        onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=?'; }}
      />

      {/* Name + Details — clickable to open PlayerDetail */}
      <button
        onClick={() => onSelect(prospect)}
        className="flex-1 min-w-0 text-left hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-1.5 sm:gap-2">
          <span className="text-xs sm:text-sm font-bold text-white truncate">{prospect.name}</span>
          <span className="px-1 sm:px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] font-black uppercase bg-slate-700 text-emerald-400 shrink-0">
            {prospect.position}
          </span>
        </div>
        <span className="text-[10px] sm:text-xs text-slate-500 truncate block">{prospect.college}</span>
      </button>

      {/* Remove Button */}
      <button
        onClick={() => onRemove(prospect.id)}
        className="p-1 sm:p-1.5 rounded-lg hover:bg-red-500/20 text-slate-600 hover:text-red-400 transition-colors shrink-0"
        title="Remove from board"
      >
        <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// ─── Drag Overlay Row ──────────────────────────────────────────────────
const DragOverlayRow: React.FC<{ prospect: Prospect; rank: number }> = ({ prospect, rank }) => (
  <div className="flex items-center gap-3 p-3 rounded-xl border border-emerald-500 bg-slate-800 shadow-2xl shadow-emerald-500/10">
    <div className="p-1.5 text-emerald-400">
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
        <path d="M7 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 8a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM7 14a2 2 0 1 0 0 4 2 2 0 0 0 0-4zm6 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
      </svg>
    </div>
    <span className="w-8 text-center text-base font-black font-oswald text-emerald-500">{rank}</span>
    <img
      src={prospect.headshotUrl}
      alt={prospect.name}
      className="w-10 h-10 rounded-lg bg-slate-800 object-cover"
    />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className="text-sm font-bold text-white truncate">{prospect.name}</span>
        <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-slate-700 text-emerald-400">
          {prospect.position}
        </span>
      </div>
      <span className="text-xs text-slate-500">{prospect.college}</span>
    </div>
  </div>
);

// ─── Confirm Modal ────────────────────────────────────────────────────
interface ConfirmModalProps {
  title: string;
  message: string;
  confirmLabel: string;
  confirmClassName: string;
  onConfirm: () => void;
  onClose: () => void;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  title, message, confirmLabel, confirmClassName, onConfirm, onClose,
}) => (
  <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
    <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
    <div className="relative w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl animate-fadeIn">
      <div className="p-5 border-b border-slate-800">
        <h2 className="text-lg font-black font-oswald uppercase tracking-tight text-white">{title}</h2>
      </div>
      <div className="p-5">
        <p className="text-sm text-slate-400 mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className={`flex-1 px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors ${confirmClassName}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ─── BigBoardMaker ─────────────────────────────────────────────────────
interface BigBoardMakerProps {
  prospects: Prospect[];
  onBack: () => void;
}

export const BigBoardMaker: React.FC<BigBoardMakerProps> = ({ prospects, onBack }) => {
  const [draftYear, setDraftYear] = useState<number>(2026);
  const [board, setBoard] = useState<Prospect[]>(() =>
    prospects
      .filter(p => p.draftYear === 2026)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 50)
  );
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<Set<string>>(new Set());
  const [confirmAction, setConfirmAction] = useState<'clear' | 'reset' | null>(null);
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState('ALL');
  const [collegeFilter, setCollegeFilter] = useState('ALL');

  const getTop50 = useCallback((year: number) =>
    prospects
      .filter(p => p.draftYear === year)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 50),
  [prospects]);

  // Unique positions and colleges present in the current board
  const boardPositions = useMemo(() => {
    const set = new Set(board.map(p => p.position));
    return Array.from(set).sort();
  }, [board]);

  const boardColleges = useMemo(() => {
    const set = new Set(board.map(p => p.college));
    return Array.from(set).sort();
  }, [board]);

  const isFiltering = searchTerm.trim() !== '' || posFilter !== 'ALL' || collegeFilter !== 'ALL';

  // Filtered view — preserves real board indices for rank display
  const filteredBoardWithIndex = useMemo(() => {
    return board
      .map((p, i) => ({ prospect: p, rank: i + 1 }))
      .filter(({ prospect: p }) => {
        if (posFilter !== 'ALL' && p.position !== posFilter) return false;
        if (collegeFilter !== 'ALL' && p.college !== collegeFilter) return false;
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          if (!p.name.toLowerCase().includes(q) && !p.college.toLowerCase().includes(q)) return false;
        }
        return true;
      });
  }, [board, searchTerm, posFilter, collegeFilter]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Prospects available to add (same draft year, not already in board)
  const availableProspects = useMemo(() => {
    const boardIds = new Set(board.map(p => p.id));
    return prospects.filter(p => p.draftYear === draftYear && !boardIds.has(p.id));
  }, [prospects, board, draftYear]);

  const handleDraftYearChange = useCallback((year: number) => {
    if (year === draftYear) return;
    setDraftYear(year);
    setBoard(getTop50(year));
    setRecentlyAddedIds(new Set());
    setSaveSuccess(false);
    setSaveError(null);
    setSearchTerm('');
    setPosFilter('ALL');
    setCollegeFilter('ALL');
  }, [draftYear, getTop50]);

  const handleRemove = useCallback((id: string) => {
    setBoard(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleAdd = useCallback((prospect: Prospect) => {
    setBoard(prev => [...prev, prospect]);
    setRecentlyAddedIds(prev => new Set(prev).add(prospect.id));
  }, []);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveDragId(event.active.id as string);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragId(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBoard(prev => {
        const oldIndex = prev.findIndex(p => p.id === active.id);
        const newIndex = prev.findIndex(p => p.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }, []);

  const handleSave = useCallback(async (name: string, creatorName: string) => {
    setIsSaving(true);
    setSaveError(null);
    try {
      await saveBigBoard(name, creatorName, draftYear, board.map(p => p.id));
      setSaveSuccess(true);
      setShowSaveModal(false);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save board');
    } finally {
      setIsSaving(false);
    }
  }, [board, draftYear]);

  const activeDragProspect = activeDragId ? board.find(p => p.id === activeDragId) : null;
  const activeDragRank = activeDragProspect ? board.indexOf(activeDragProspect) + 1 : 0;
  const selectedProspect = selectedProspectId ? board.find(p => p.id === selectedProspectId) ?? prospects.find(p => p.id === selectedProspectId) ?? null : null;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40 shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={onBack}
              className="p-1.5 sm:p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <h1 className="text-base sm:text-xl lg:text-2xl font-black font-oswald text-white uppercase tracking-tighter">
              Big Board <span className="text-emerald-500">Maker</span>
            </h1>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Draft Year Toggle */}
            <div className="flex bg-slate-800 rounded-lg p-0.5">
              {[2026, 2027].map(y => (
                <button
                  key={y}
                  onClick={() => handleDraftYearChange(y)}
                  className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-md text-xs sm:text-sm font-bold transition-colors ${
                    draftYear === y
                      ? 'bg-emerald-500 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {y}
                </button>
              ))}
            </div>

            {/* Clear Button */}
            <button
              onClick={() => setConfirmAction('clear')}
              title="Clear board"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-red-400 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span className="hidden sm:inline">Clear</span>
            </button>

            {/* Reset Button */}
            <button
              onClick={() => setConfirmAction('reset')}
              title="Reset to top 50"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Reset</span>
            </button>

            {/* Save Button */}
            <button
              onClick={() => { setShowSaveModal(true); setSaveSuccess(false); setSaveError(null); }}
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-lg shadow-emerald-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>
        </div>
      </header>

      {/* Success / Error banners */}
      {saveSuccess && (
        <div className="bg-emerald-500/10 border-b border-emerald-500/30 px-4 py-2.5 text-center">
          <span className="text-sm font-bold text-emerald-400">Board saved successfully!</span>
        </div>
      )}
      {saveError && (
        <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2.5 text-center">
          <span className="text-sm font-bold text-red-400">{saveError}</span>
        </div>
      )}

      {/* Search / Filter bar */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-2.5 shrink-0">
        <div className="max-w-4xl mx-auto flex flex-wrap gap-2 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search my board..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          {/* Position Filter */}
          <select
            value={posFilter}
            onChange={e => setPosFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
          >
            <option value="ALL">All Positions</option>
            {boardPositions.map(pos => (
              <option key={pos} value={pos}>{pos}</option>
            ))}
          </select>
          {/* College Filter */}
          <select
            value={collegeFilter}
            onChange={e => setCollegeFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors max-w-[180px] truncate"
          >
            <option value="ALL">All Colleges</option>
            {boardColleges.map(college => (
              <option key={college} value={college}>{college}</option>
            ))}
          </select>
          {/* Clear filters */}
          {isFiltering && (
            <button
              onClick={() => { setSearchTerm(''); setPosFilter('ALL'); setCollegeFilter('ALL'); }}
              className="px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors uppercase tracking-wider"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Board List */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-3 sm:p-4 space-y-1.5 sm:space-y-2">
          {board.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm">Your board is empty. Add some prospects!</p>
            </div>
          ) : isFiltering ? (
            // Filtered view — no DnD, show real ranks
            <>
              {filteredBoardWithIndex.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-slate-500">
                  <svg className="w-10 h-10 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <p className="text-sm">No prospects match your filters.</p>
                </div>
              ) : (
                filteredBoardWithIndex.map(({ prospect: p, rank }) => (
                  <SortableRow key={p.id} prospect={p} rank={rank} onRemove={handleRemove} onSelect={(pr) => setSelectedProspectId(pr.id)} />
                ))
              )}
              <p className="text-center text-xs text-slate-600 pt-2 pb-1">
                Showing {filteredBoardWithIndex.length} of {board.length} &middot; Clear filters to reorder
              </p>
            </>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={board.map(p => p.id)} strategy={verticalListSortingStrategy}>
                {board.map((p, i) => (
                  <SortableRow key={p.id} prospect={p} rank={i + 1} onRemove={handleRemove} onSelect={(pr) => setSelectedProspectId(pr.id)} />
                ))}
              </SortableContext>

              <DragOverlay>
                {activeDragProspect ? (
                  <DragOverlayRow prospect={activeDragProspect} rank={activeDragRank} />
                ) : null}
              </DragOverlay>
            </DndContext>
          )}
        </div>
      </main>

      {/* Sticky footer: Add Prospect */}
      <footer className="bg-slate-900 border-t border-slate-800 px-4 py-3 shrink-0">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => { setShowAddModal(true); setRecentlyAddedIds(new Set()); }}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-emerald-500/10 hover:border-emerald-500 border-2 border-slate-700 text-slate-400 hover:text-emerald-400 rounded-xl text-sm font-bold uppercase tracking-wider transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add Prospect
          </button>
        </div>
      </footer>

      {/* Modals */}
      {/* Player Detail overlay */}
      {selectedProspect && (
        <PlayerDetail
          prospect={selectedProspect}
          allProspects={prospects}
          onClose={() => setSelectedProspectId(null)}
          onDraft={() => setSelectedProspectId(null)}
          showDraftYear={true}
        />
      )}

      {showAddModal && (
        <AddProspectModal
          availableProspects={availableProspects}
          recentlyAddedIds={recentlyAddedIds}
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showSaveModal && (
        <SaveBoardModal
          onSave={handleSave}
          onClose={() => setShowSaveModal(false)}
          isSaving={isSaving}
        />
      )}

      {confirmAction === 'clear' && (
        <ConfirmModal
          title="Clear Board"
          message="This will remove all prospects from your board. You can add them back manually. Are you sure?"
          confirmLabel="Clear"
          confirmClassName="bg-red-500 hover:bg-red-400 text-white"
          onConfirm={() => setBoard([])}
          onClose={() => setConfirmAction(null)}
        />
      )}

      {confirmAction === 'reset' && (
        <ConfirmModal
          title="Reset Board"
          message={`This will reset your board to the default top 50 ${draftYear} prospects, discarding all changes. Are you sure?`}
          confirmLabel="Reset"
          confirmClassName="bg-amber-500 hover:bg-amber-400 text-white"
          onConfirm={() => { setBoard(getTop50(draftYear)); setRecentlyAddedIds(new Set()); }}
          onClose={() => setConfirmAction(null)}
        />
      )}
    </div>
  );
};
