'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Prospect, BigBoardRecord, PositionalTierBoard } from '../types.ts';
import { fetchCommunityBoards, resolveProspectOrder } from '../lib/bigBoardService.ts';
import { fetchCommunityTierLists, resolveTierProspects } from '../lib/tierListService.ts';

type TabType = 'ranking' | 'tierlist';

const POSITION_COLORS: Record<string, string> = {
  QB: 'text-rose-300',   RB: 'text-emerald-300', WR: 'text-blue-300',
  TE: 'text-yellow-300', OT: 'text-purple-300',  IOL: 'text-violet-300',
  DL: 'text-slate-300',  EDGE: 'text-orange-300', LB: 'text-amber-300',
  CB: 'text-pink-300',   S: 'text-sky-300',       K: 'text-teal-300',
  P: 'text-cyan-300',
};

interface CommunityBoardsProps {
  prospects: Prospect[];
  onBack: () => void;
}

export const CommunityBoards: React.FC<CommunityBoardsProps> = ({ prospects, onBack }) => {
  const [activeTab, setActiveTab] = useState<TabType>('ranking');

  // ── Ranking boards state ──────────────────────────────────────────────────
  const [boards, setBoards] = useState<BigBoardRecord[]>([]);
  const [boardsLoading, setBoardsLoading] = useState(true);
  const [boardsError, setBoardsError] = useState<string | null>(null);

  // ── Tier lists state ──────────────────────────────────────────────────────
  const [tierLists, setTierLists] = useState<PositionalTierBoard[]>([]);
  const [tierListsLoading, setTierListsLoading] = useState(false);
  const [tierListsError, setTierListsError] = useState<string | null>(null);

  // ── Shared filter state ───────────────────────────────────────────────────
  const [searchTerm, setSearchTerm] = useState('');
  const [draftYearFilter, setDraftYearFilter] = useState<number | null>(null);

  const [expandedBoardId, setExpandedBoardId] = useState<string | null>(null);
  const [expandedTierListId, setExpandedTierListId] = useState<string | null>(null);

  // ── Load ranking boards ────────────────────────────────────────────────────
  const loadBoards = useCallback(async () => {
    setBoardsLoading(true);
    setBoardsError(null);
    try {
      const data = await fetchCommunityBoards(searchTerm || undefined, draftYearFilter || undefined);
      setBoards(data);
    } catch (err: any) {
      setBoardsError(err.message || 'Failed to load community boards');
    } finally {
      setBoardsLoading(false);
    }
  }, [searchTerm, draftYearFilter]);

  // ── Load tier lists ────────────────────────────────────────────────────────
  const loadTierLists = useCallback(async () => {
    setTierListsLoading(true);
    setTierListsError(null);
    try {
      const data = await fetchCommunityTierLists(searchTerm || undefined, draftYearFilter || undefined);
      setTierLists(data);
    } catch (err: any) {
      setTierListsError(err.message || 'Failed to load tier lists');
    } finally {
      setTierListsLoading(false);
    }
  }, [searchTerm, draftYearFilter]);

  // Debounced load for ranking boards
  useEffect(() => {
    const timer = setTimeout(() => { loadBoards(); }, 300);
    return () => clearTimeout(timer);
  }, [loadBoards]);

  // Load tier lists lazily (only when that tab is active)
  useEffect(() => {
    if (activeTab !== 'tierlist') return;
    const timer = setTimeout(() => { loadTierLists(); }, 300);
    return () => clearTimeout(timer);
  }, [loadTierLists, activeTab]);

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setExpandedBoardId(null);
    setExpandedTierListId(null);
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center gap-3 sm:gap-4 flex-wrap">
          <button
            onClick={onBack}
            className="p-1.5 sm:p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <h1 className="text-base sm:text-xl lg:text-2xl font-black font-oswald text-white uppercase tracking-tighter">
            Community <span className="text-emerald-500">Boards</span>
          </h1>
          {/* Tab switcher */}
          <div className="flex bg-slate-800 rounded-lg p-0.5 ml-2">
            <button
              onClick={() => handleTabChange('ranking')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-colors ${
                activeTab === 'ranking' ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Rankings
            </button>
            <button
              onClick={() => handleTabChange('tierlist')}
              className={`px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide transition-colors ${
                activeTab === 'tierlist' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              Tier Lists
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-slate-800 px-4 sm:px-6 py-3 shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={`Search ${activeTab === 'ranking' ? 'boards' : 'tier lists'} by name or creator...`}
            className="flex-1 px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
          />
          <div className="flex bg-slate-800 rounded-lg p-0.5 self-start">
            {[
              { label: 'All', value: null },
              { label: '2026', value: 2026 },
              { label: '2027', value: 2027 },
            ].map(opt => (
              <button
                key={opt.label}
                onClick={() => setDraftYearFilter(opt.value)}
                className={`px-3 py-1.5 rounded-md text-xs sm:text-sm font-bold transition-colors ${
                  draftYearFilter === opt.value ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-4 sm:p-6">
          {/* Ranking tab */}
          {activeTab === 'ranking' && (
            <>
              {boardsLoading ? (
                <LoadingState label="boards" />
              ) : boardsError ? (
                <ErrorState message={boardsError} onRetry={loadBoards} />
              ) : boards.length === 0 ? (
                <EmptyState label="ranking boards" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {boards.map(board => (
                    <BoardCard
                      key={board.id}
                      board={board}
                      prospects={prospects}
                      isExpanded={expandedBoardId === board.id}
                      onToggleExpand={() =>
                        setExpandedBoardId(prev => (prev === board.id ? null : board.id))
                      }
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Tier lists tab */}
          {activeTab === 'tierlist' && (
            <>
              {tierListsLoading ? (
                <LoadingState label="tier lists" />
              ) : tierListsError ? (
                <ErrorState message={tierListsError} onRetry={loadTierLists} />
              ) : tierLists.length === 0 ? (
                <EmptyState label="tier lists" />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tierLists.map(tl => (
                    <TierListCard
                      key={tl.id}
                      tierList={tl}
                      prospects={prospects}
                      isExpanded={expandedTierListId === tl.id}
                      onToggleExpand={() =>
                        setExpandedTierListId(prev => (prev === tl.id ? null : tl.id))
                      }
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
};

// ─── Shared helper components ────────────────────────────────────────────────────

const LoadingState: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4" />
    <p className="text-slate-500 text-sm">Loading {label}...</p>
  </div>
);

const ErrorState: React.FC<{ message: string; onRetry: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-20">
    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
      <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    </div>
    <p className="text-red-400 text-sm font-bold mb-3">{message}</p>
    <button onClick={onRetry} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors">
      Retry
    </button>
  </div>
);

const EmptyState: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center py-20 text-slate-500">
    <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
    <p className="text-sm">No {label} found</p>
    <p className="text-xs mt-1">Be the first to create one!</p>
  </div>
);

// ─── Ranking Board Card ────────────────────────────────────────────────────────

interface BoardCardProps {
  board: BigBoardRecord;
  prospects: Prospect[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  formatDate: (d: string) => string;
}

const BoardCard: React.FC<BoardCardProps> = ({ board, prospects, isExpanded, onToggleExpand, formatDate }) => {
  const resolved = useMemo(
    () => resolveProspectOrder(board.prospectOrder, prospects),
    [board.prospectOrder, prospects],
  );
  const preview = resolved.slice(0, 5);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-black font-oswald text-white uppercase tracking-tight truncate">{board.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500">by {board.creatorName}</span>
              <span className="text-slate-700">&middot;</span>
              <span className="text-xs text-slate-500">{formatDate(board.createdAt)}</span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            {board.draftYear}
          </span>
        </div>
        <div className="space-y-1.5">
          {preview.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2">
              <span className="w-5 text-right text-xs font-black font-oswald text-emerald-500">{i + 1}.</span>
              <img src={p.headshotUrl} alt={p.name} className="w-6 h-6 rounded bg-slate-800 object-cover shrink-0"
                onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=?'; }} />
              <span className="text-xs font-medium text-slate-300 truncate">{p.name}</span>
              <span className="px-1 py-0.5 rounded text-[9px] font-black uppercase bg-slate-800 text-slate-400 shrink-0">{p.position}</span>
            </div>
          ))}
          {resolved.length > 5 && !isExpanded && (
            <p className="text-[11px] text-slate-600 pl-7">+{resolved.length - 5} more prospects</p>
          )}
        </div>
        {isExpanded && resolved.length > 5 && (
          <div className="mt-2 space-y-1.5 border-t border-slate-800 pt-2">
            {resolved.slice(5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="w-5 text-right text-xs font-black font-oswald text-emerald-500">{i + 6}.</span>
                <img src={p.headshotUrl} alt={p.name} className="w-6 h-6 rounded bg-slate-800 object-cover shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=?'; }} />
                <span className="text-xs font-medium text-slate-300 truncate">{p.name}</span>
                <span className="px-1 py-0.5 rounded text-[9px] font-black uppercase bg-slate-800 text-slate-400 shrink-0">{p.position}</span>
              </div>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={onToggleExpand}
        className="w-full px-4 py-2.5 border-t border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-emerald-400 hover:bg-slate-800/50 transition-colors flex items-center justify-center gap-1.5"
      >
        {isExpanded ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            Collapse
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            View Full Board ({resolved.length} prospects)
          </>
        )}
      </button>
    </div>
  );
};

// ─── Tier List Card ────────────────────────────────────────────────────────────

interface TierListCardProps {
  tierList: PositionalTierBoard;
  prospects: Prospect[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  formatDate: (d: string) => string;
}

const TierListCard: React.FC<TierListCardProps> = ({ tierList, prospects, isExpanded, onToggleExpand, formatDate }) => {
  const resolved = useMemo(
    () => resolveTierProspects(tierList.tieredProspects, prospects),
    [tierList.tieredProspects, prospects],
  );

  const tierCounts = useMemo(() =>
    tierList.tiers.map(tier => {
      const posMap = resolved[tier.id] ?? {};
      const total = Object.values(posMap).reduce((sum, ps) => sum + ps.length, 0);
      return { tier, total, posMap };
    }),
    [tierList.tiers, resolved],
  );

  const totalProspects = tierCounts.reduce((s, t) => s + t.total, 0);

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-black font-oswald text-white uppercase tracking-tight truncate">{tierList.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-slate-500">by {tierList.creatorName}</span>
              <span className="text-slate-700">&middot;</span>
              <span className="text-xs text-slate-500">{formatDate(tierList.createdAt)}</span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20">
              {tierList.draftYear}
            </span>
            <span className="px-2 py-0.5 rounded-lg text-[10px] font-black uppercase bg-purple-500/10 text-purple-400 border border-purple-500/20">
              Tier List
            </span>
          </div>
        </div>

        <div className="space-y-2">
          {tierCounts.slice(0, isExpanded ? undefined : 3).map(({ tier, total, posMap }) => (
            <div key={tier.id} className="bg-slate-800/50 rounded-xl p-2.5">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-black font-oswald text-white uppercase tracking-tight">{tier.label}</span>
                <span className="text-[10px] text-slate-500 font-bold">{total} prospect{total !== 1 ? 's' : ''}</span>
              </div>
              {total > 0 && (
                <div className="flex flex-wrap gap-1">
                  {isExpanded
                    ? Object.entries(posMap).flatMap(([pos, ps]) =>
                        ps.map(p => (
                          <div key={p.id} className="flex items-center gap-1 px-1.5 py-0.5 bg-slate-700/60 rounded-lg">
                            <span className={`text-[9px] font-black uppercase ${POSITION_COLORS[pos] ?? 'text-slate-400'}`}>{pos}</span>
                            <span className="text-[10px] text-slate-300 truncate max-w-[80px]">{p.name}</span>
                          </div>
                        )),
                      )
                    : Object.entries(posMap).filter(([, ps]) => ps.length > 0).map(([pos, ps]) => (
                        <span key={pos} className={`text-[9px] font-black uppercase px-1.5 py-0.5 bg-slate-700/40 rounded ${POSITION_COLORS[pos] ?? 'text-slate-400'}`}>
                          {pos} ×{ps.length}
                        </span>
                      ))
                  }
                </div>
              )}
            </div>
          ))}
          {!isExpanded && tierCounts.length > 3 && (
            <p className="text-[11px] text-slate-600 pl-1">+{tierCounts.length - 3} more tiers</p>
          )}
        </div>
      </div>

      <button
        onClick={onToggleExpand}
        className="w-full px-4 py-2.5 border-t border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-500 hover:text-blue-400 hover:bg-slate-800/50 transition-colors flex items-center justify-center gap-1.5"
      >
        {isExpanded ? (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
            Collapse
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            View Full Tier List ({totalProspects} prospects, {tierList.tiers.length} tiers)
          </>
        )}
      </button>
    </div>
  );
};
