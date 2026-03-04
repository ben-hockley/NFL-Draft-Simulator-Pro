'use client';

import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  closestCenter,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { Prospect, TierRow } from '../types.ts';
import { AddProspectModal } from './AddProspectModal.tsx';
import { SaveBoardModal } from './SaveBoardModal.tsx';
import { savePositionalTierList } from '../lib/tierListService.ts';

// ─── Constants ─────────────────────────────────────────────────────────────────

const POSITIONS = ['QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'DL', 'EDGE', 'LB', 'CB', 'S', 'K', 'P'] as const;
type TierPosition = typeof POSITIONS[number];

const POSITION_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  QB:   { bg: 'bg-rose-500/20',    text: 'text-rose-200',    border: 'border-rose-500/30' },
  RB:   { bg: 'bg-emerald-500/20', text: 'text-emerald-200', border: 'border-emerald-500/30' },
  WR:   { bg: 'bg-blue-500/20',    text: 'text-blue-200',    border: 'border-blue-500/30' },
  TE:   { bg: 'bg-yellow-500/20',  text: 'text-yellow-200',  border: 'border-yellow-500/30' },
  OT:   { bg: 'bg-purple-500/20',  text: 'text-purple-200',  border: 'border-purple-500/30' },
  IOL:  { bg: 'bg-violet-500/20',  text: 'text-violet-200',  border: 'border-violet-500/30' },
  DL:   { bg: 'bg-slate-500/30',   text: 'text-slate-300',   border: 'border-slate-500/30' },
  EDGE: { bg: 'bg-orange-500/20',  text: 'text-orange-200',  border: 'border-orange-500/30' },
  LB:   { bg: 'bg-amber-500/20',   text: 'text-amber-200',   border: 'border-amber-500/30' },
  CB:   { bg: 'bg-pink-500/20',    text: 'text-pink-200',    border: 'border-pink-500/30' },
  S:    { bg: 'bg-sky-500/20',     text: 'text-sky-200',     border: 'border-sky-500/30' },
  K:    { bg: 'bg-teal-500/20',    text: 'text-teal-200',    border: 'border-teal-500/30' },
  P:    { bg: 'bg-cyan-500/20',    text: 'text-cyan-200',    border: 'border-cyan-500/30' },
};

const DEFAULT_COLORS = { bg: 'bg-slate-500/30', text: 'text-slate-300', border: 'border-slate-500/30' };

/** Map a raw prospect.position to one of our POSITIONS columns */
function normalizePosition(pos: string): TierPosition | null {
  const mapping: Record<string, TierPosition> = {
    QB: 'QB', RB: 'RB', WR: 'WR', TE: 'TE',
    OT: 'OT', OG: 'IOL', C: 'IOL', IOL: 'IOL',
    DE: 'EDGE', EDGE: 'EDGE',
    DT: 'DL', DL: 'DL',
    LB: 'LB', CB: 'CB', S: 'S',
    K: 'K', P: 'P', LS: 'P',
  };
  return mapping[pos] ?? null;
}

const INITIAL_TIERS: TierRow[] = [
  { id: 't1', label: 'Tier 1' },
  { id: 't2', label: 'Tier 2' },
  { id: 't3', label: 'Tier 3' },
  { id: 't4', label: 'Tier 4' },
  { id: 't5', label: 'Tier 5' },
];

type TieredMap = Record<string, Record<TierPosition, Prospect[]>>;

function makeTieredMap(tiers: TierRow[]): TieredMap {
  const result: TieredMap = {};
  for (const tier of tiers) {
    result[tier.id] = {} as Record<TierPosition, Prospect[]>;
    for (const pos of POSITIONS) result[tier.id][pos] = [];
  }
  return result;
}

function serializeTieredMap(tieredProspects: TieredMap): Record<string, Record<string, string[]>> {
  const result: Record<string, Record<string, string[]>> = {};
  for (const [tierId, posMap] of Object.entries(tieredProspects)) {
    result[tierId] = {};
    for (const [pos, ps] of Object.entries(posMap)) {
      result[tierId][pos] = ps.map(p => p.id);
    }
  }
  return result;
}

// ─── Draggable Prospect Chip ────────────────────────────────────────────────────

interface ProspectChipProps {
  prospect: Prospect;
  tierId: string;
  position: TierPosition;
  onRemove: () => void;
  isBeingDragged: boolean;
}

const ProspectChip: React.FC<ProspectChipProps> = ({
  prospect, tierId, position, onRemove, isBeingDragged,
}) => {
  const draggableId = `${tierId}||${position}||${prospect.id}`;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: draggableId });
  const colors = POSITION_COLORS[position] ?? DEFAULT_COLORS;

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`, zIndex: 999 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`group relative flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-semibold cursor-grab active:cursor-grabbing select-none mb-1 transition-opacity ${colors.bg} ${colors.text} ${colors.border} ${isBeingDragged ? 'opacity-20' : 'hover:brightness-125'}`}
    >
      <img
        src={prospect.headshotUrl}
        alt={prospect.name}
        className="w-5 h-5 rounded-full bg-slate-700 object-cover shrink-0"
        onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=?'; }}
      />
      <span className="leading-tight truncate max-w-[90px]">{prospect.name}</span>
      <button
        onPointerDown={e => e.stopPropagation()}
        onClick={onRemove}
        className="ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
        title="Remove from board"
      >
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// ─── Droppable Cell ─────────────────────────────────────────────────────────────

interface DroppableCellProps {
  tierId: string;
  position: TierPosition;
  prospects: Prospect[];
  activePosition: TierPosition | null;
  activeDragId: string | null;
  onRemove: (prospectId: string) => void;
}

const DroppableCell: React.FC<DroppableCellProps> = ({
  tierId, position, prospects, activePosition, activeDragId, onRemove,
}) => {
  const cellId = `${tierId}||${position}`;
  const { setNodeRef, isOver } = useDroppable({ id: cellId });
  const canReceive = activePosition === position;

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[52px] p-1 rounded-lg transition-all ${
        isOver && canReceive
          ? 'bg-emerald-500/10 outline outline-2 outline-emerald-500/40'
          : canReceive && activeDragId
          ? 'bg-slate-800/30 outline outline-1 outline-slate-700/50'
          : ''
      }`}
    >
      {prospects.map(p => (
        <ProspectChip
          key={p.id}
          prospect={p}
          tierId={tierId}
          position={position}
          onRemove={() => onRemove(p.id)}
          isBeingDragged={activeDragId === `${tierId}||${position}||${p.id}`}
        />
      ))}
      {canReceive && activeDragId && prospects.length === 0 && (
        <div className="h-8 rounded border border-dashed border-slate-700/50 flex items-center justify-center">
          <span className="text-[10px] text-slate-600">Drop here</span>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ─────────────────────────────────────────────────────────────

interface PositionalTierMakerProps {
  prospects: Prospect[];
  onBack: () => void;
}

export const PositionalTierMaker: React.FC<PositionalTierMakerProps> = ({ prospects, onBack }) => {
  const [draftYear, setDraftYear] = useState<2026 | 2027>(2026);

  const [tiers, setTiers] = useState<TierRow[]>(INITIAL_TIERS);

  const [tieredProspects, setTieredProspects] = useState<TieredMap>(() => {
    const initial = makeTieredMap(INITIAL_TIERS);
    const top10 = prospects
      .filter(p => p.draftYear === 2026)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 10);
    for (const p of top10) {
      const col = normalizePosition(p.position);
      if (col) initial['t1'][col].push(p);
    }
    return initial;
  });

  const [editingTierId, setEditingTierId] = useState<string | null>(null);
  const [editingLabel, setEditingLabel] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<Set<string>>(new Set());

  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [activePosition, setActivePosition] = useState<TierPosition | null>(null);
  const [activeDragProspect, setActiveDragProspect] = useState<Prospect | null>(null);

  const tierCounterRef = useRef(6);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor),
  );

  // All prospect IDs currently on the board
  const boardProspectIds = useMemo(() => {
    const set = new Set<string>();
    for (const posMap of Object.values(tieredProspects)) {
      for (const ps of Object.values(posMap)) {
        for (const p of ps) set.add(p.id);
      }
    }
    return set;
  }, [tieredProspects]);

  const availableProspects = useMemo(
    () => prospects.filter(p => p.draftYear === draftYear && !boardProspectIds.has(p.id)),
    [prospects, draftYear, boardProspectIds],
  );

  // ── Drag handlers ──────────────────────────────────────────────────────────

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const dragId = event.active.id as string;
    const [tierId, position, prospectId] = dragId.split('||');
    setActiveDragId(dragId);
    setActivePosition(position as TierPosition);
    const prosp = tieredProspects[tierId]?.[position as TierPosition]?.find(p => p.id === prospectId) ?? null;
    setActiveDragProspect(prosp);
  }, [tieredProspects]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveDragId(null);
    setActivePosition(null);
    setActiveDragProspect(null);

    const { active, over } = event;
    if (!over) return;

    const [fromTierId, fromPos, prospectId] = (active.id as string).split('||');
    const [toTierId, toPos] = (over.id as string).split('||');

    // Enforce same-column rule
    if (fromPos !== toPos) return;
    if (fromTierId === toTierId) return;

    setTieredProspects(prev => {
      const fromArr = [...(prev[fromTierId]?.[fromPos as TierPosition] ?? [])];
      const toArr = [...(prev[toTierId]?.[toPos as TierPosition] ?? [])];
      const idx = fromArr.findIndex(p => p.id === prospectId);
      if (idx === -1) return prev;
      const [moved] = fromArr.splice(idx, 1);
      toArr.push(moved);
      return {
        ...prev,
        [fromTierId]: { ...prev[fromTierId], [fromPos]: fromArr },
        [toTierId]: { ...prev[toTierId], [toPos]: toArr },
      };
    });
  }, []);

  // ── Prospect management ────────────────────────────────────────────────────

  const handleAddProspect = useCallback((prospect: Prospect) => {
    const col = normalizePosition(prospect.position);
    if (!col) return;
    const firstTierId = tiers[0]?.id;
    if (!firstTierId) return;
    setTieredProspects(prev => ({
      ...prev,
      [firstTierId]: {
        ...prev[firstTierId],
        [col]: [...(prev[firstTierId][col] ?? []), prospect],
      },
    }));
    setRecentlyAddedIds(prev => new Set(prev).add(prospect.id));
  }, [tiers]);

  const handleRemoveProspect = useCallback((tierId: string, position: TierPosition, prospectId: string) => {
    setTieredProspects(prev => ({
      ...prev,
      [tierId]: {
        ...prev[tierId],
        [position]: prev[tierId][position].filter(p => p.id !== prospectId),
      },
    }));
    setRecentlyAddedIds(prev => { const s = new Set(prev); s.delete(prospectId); return s; });
  }, []);

  // ── Tier management ────────────────────────────────────────────────────────

  const handleAddTier = useCallback(() => {
    const newId = `t${tierCounterRef.current++}`;
    const newTier: TierRow = { id: newId, label: `Tier ${tiers.length + 1}` };
    const newCells: Record<TierPosition, Prospect[]> = {} as Record<TierPosition, Prospect[]>;
    for (const pos of POSITIONS) newCells[pos] = [];
    setTiers(prev => [...prev, newTier]);
    setTieredProspects(prev => ({ ...prev, [newId]: newCells }));
  }, [tiers.length]);

  const handleDeleteTier = useCallback((tierId: string) => {
    const posMap = tieredProspects[tierId];
    const hasProspects = posMap && Object.values(posMap).some(arr => arr.length > 0);
    if (hasProspects) {
      const confirmed = window.confirm('This tier has prospects. Deleting it will remove them from the board. Continue?');
      if (!confirmed) return;
    }
    setTiers(prev => prev.filter(t => t.id !== tierId));
    setTieredProspects(prev => {
      const next = { ...prev };
      delete next[tierId];
      return next;
    });
  }, [tieredProspects]);

  const startEditTier = useCallback((tier: TierRow) => {
    setEditingTierId(tier.id);
    setEditingLabel(tier.label);
  }, []);

  const commitEditTier = useCallback(() => {
    if (!editingTierId) return;
    setTiers(prev => prev.map(t =>
      t.id === editingTierId ? { ...t, label: editingLabel.trim() || t.label } : t,
    ));
    setEditingTierId(null);
  }, [editingTierId, editingLabel]);

  // ── Draft year toggle ──────────────────────────────────────────────────────

  const handleYearChange = (year: 2026 | 2027) => {
    if (year === draftYear) return;
    if (!window.confirm('Switching the draft year will reset the board. Continue?')) return;
    setDraftYear(year);
    const freshTiers = INITIAL_TIERS;
    setTiers(freshTiers);
    const initial = makeTieredMap(freshTiers);
    const top10 = prospects
      .filter(p => p.draftYear === year)
      .sort((a, b) => a.rank - b.rank)
      .slice(0, 10);
    for (const p of top10) {
      const col = normalizePosition(p.position);
      if (col) initial['t1'][col].push(p);
    }
    setTieredProspects(initial);
    setRecentlyAddedIds(new Set());
  };

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = async (name: string, creatorName: string) => {
    setIsSaving(true);
    try {
      await savePositionalTierList(name, creatorName, draftYear, tiers, serializeTieredMap(tieredProspects));
      setShowSaveModal(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(`Failed to save: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const overlayColors = activePosition ? (POSITION_COLORS[activePosition] ?? DEFAULT_COLORS) : DEFAULT_COLORS;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-950">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-3 shrink-0 z-50 sticky top-0">
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors shrink-0"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>

          <h1 className="text-lg font-black font-oswald text-white uppercase tracking-tighter">
            Positional <span className="text-blue-400">Tier List</span>
          </h1>

          {/* Draft year toggle */}
          <div className="flex bg-slate-800 rounded-lg p-0.5">
            {([2026, 2027] as const).map(yr => (
              <button
                key={yr}
                onClick={() => handleYearChange(yr)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  draftYear === yr ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>

          <div className="ml-auto flex items-center gap-2 flex-wrap">
            {saveSuccess && (
              <span className="text-xs text-emerald-400 font-bold">✓ Saved to Community!</span>
            )}
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-blue-500/10 border border-blue-500/30 hover:bg-blue-500/20 text-blue-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Prospect
            </button>
            <button
              onClick={() => setShowSaveModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-lg shadow-emerald-500/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Save &amp; Share
            </button>
          </div>
        </div>
      </header>

      {/* ── Grid ──────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          {/* min-w-max forces horizontal scroll on the parent when the grid is wider than the viewport */}
          <div className="min-w-max">
            {/* Column header row */}
            <div className="flex sticky top-0 z-30 bg-blue-950 border-b border-blue-900 shadow-lg">
              {/* Tier label column header */}
              <div
                className="shrink-0 sticky left-0 z-40 bg-blue-950 border-r border-blue-900 flex items-center px-3 py-2.5"
                style={{ width: 148 }}
              >
                <span className="text-[11px] font-black uppercase tracking-widest text-blue-300">Tier</span>
              </div>
              {POSITIONS.map(pos => {
                const colors = POSITION_COLORS[pos] ?? DEFAULT_COLORS;
                return (
                  <div
                    key={pos}
                    className={`shrink-0 border-r border-blue-900 flex items-center justify-center px-2 py-2.5 ${colors.bg}`}
                    style={{ width: 148 }}
                  >
                    <span className={`text-[11px] font-black uppercase tracking-widest ${colors.text}`}>{pos}</span>
                  </div>
                );
              })}
            </div>

            {/* Tier rows */}
            {tiers.map(tier => (
              <div key={tier.id} className="flex border-b border-slate-800 group/row">
                {/* Tier label cell */}
                <div
                  className="shrink-0 sticky left-0 z-20 bg-slate-900 border-r border-slate-800 flex flex-col justify-start pt-2.5 px-2 pb-2 min-h-[60px]"
                  style={{ width: 148 }}
                >
                  {editingTierId === tier.id ? (
                    <input
                      autoFocus
                      value={editingLabel}
                      onChange={e => setEditingLabel(e.target.value)}
                      onBlur={commitEditTier}
                      onKeyDown={e => { if (e.key === 'Enter') commitEditTier(); if (e.key === 'Escape') setEditingTierId(null); }}
                      className="w-full px-2 py-1 bg-slate-800 border border-blue-500 rounded-lg text-white text-xs font-bold focus:outline-none"
                      maxLength={30}
                    />
                  ) : (
                    <span className="text-sm font-black font-oswald text-white uppercase tracking-tight leading-tight">
                      {tier.label}
                    </span>
                  )}
                  <div className="flex gap-1 mt-1.5 opacity-0 group-hover/row:opacity-100 transition-opacity">
                    <button
                      onClick={() => startEditTier(tier)}
                      className="p-0.5 rounded text-slate-600 hover:text-blue-400 transition-colors"
                      title="Rename tier"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDeleteTier(tier.id)}
                      className="p-0.5 rounded text-slate-600 hover:text-red-400 transition-colors"
                      title="Delete tier"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Position cells */}
                {POSITIONS.map(pos => (
                  <div
                    key={pos}
                    className="shrink-0 border-r border-slate-800 p-1 bg-slate-950/30"
                    style={{ width: 148 }}
                  >
                    <DroppableCell
                      tierId={tier.id}
                      position={pos}
                      prospects={tieredProspects[tier.id]?.[pos] ?? []}
                      activePosition={activePosition}
                      activeDragId={activeDragId}
                      onRemove={(prospectId) => handleRemoveProspect(tier.id, pos, prospectId)}
                    />
                  </div>
                ))}
              </div>
            ))}

            {/* Add tier button row */}
            <div className="flex">
              <div className="sticky left-0 px-2 py-2 bg-slate-950" style={{ width: 148 }}>
                <button
                  onClick={handleAddTier}
                  className="flex items-center gap-1.5 px-3 py-2 w-full bg-slate-800/40 hover:bg-slate-800 border border-dashed border-slate-700 hover:border-blue-500 text-slate-500 hover:text-blue-400 rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Tier
                </button>
              </div>
            </div>
          </div>

          {/* Drag overlay */}
          <DragOverlay dropAnimation={null}>
            {activeDragProspect && (
              <div className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs font-semibold shadow-2xl cursor-grabbing ${overlayColors.bg} ${overlayColors.text} ${overlayColors.border}`}>
                <img
                  src={activeDragProspect.headshotUrl}
                  alt={activeDragProspect.name}
                  className="w-5 h-5 rounded-full bg-slate-700 object-cover shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=?'; }}
                />
                <span className="truncate max-w-[90px]">{activeDragProspect.name}</span>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </div>

      {/* ── Modals ────────────────────────────────────────────────────────── */}
      {showAddModal && (
        <AddProspectModal
          availableProspects={availableProspects}
          recentlyAddedIds={recentlyAddedIds}
          onAdd={prospect => {
            handleAddProspect(prospect);
          }}
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
    </div>
  );
};
