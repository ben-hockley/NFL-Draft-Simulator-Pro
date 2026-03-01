'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Prospect, BigBoardRecord } from '../types.ts';
import { fetchCommunityBoards, resolveProspectOrder } from '../lib/bigBoardService.ts';

interface CommunityBoardsProps {
  prospects: Prospect[];
  onBack: () => void;
}

export const CommunityBoards: React.FC<CommunityBoardsProps> = ({ prospects, onBack }) => {
  const [boards, setBoards] = useState<BigBoardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [draftYearFilter, setDraftYearFilter] = useState<number | null>(null);
  const [expandedBoardId, setExpandedBoardId] = useState<string | null>(null);

  const loadBoards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchCommunityBoards(
        searchTerm || undefined,
        draftYearFilter || undefined
      );
      setBoards(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load community boards');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, draftYearFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadBoards();
    }, 300);
    return () => clearTimeout(timer);
  }, [loadBoards]);

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4 sticky top-0 z-40 shrink-0">
        <div className="max-w-5xl mx-auto flex items-center gap-3 sm:gap-4">
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
        </div>
      </header>

      {/* Filters */}
      <div className="border-b border-slate-800 px-4 sm:px-6 py-3 shrink-0">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by board name or creator..."
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
                  draftYearFilter === opt.value
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-400 hover:text-white'
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
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 text-sm">Loading boards...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <p className="text-red-400 text-sm font-bold mb-3">{error}</p>
              <button
                onClick={loadBoards}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-colors"
              >
                Retry
              </button>
            </div>
          ) : boards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <svg className="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-sm">No community boards found</p>
              <p className="text-xs mt-1">Be the first to create one!</p>
            </div>
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
        </div>
      </main>
    </div>
  );
};

// ─── Board Card ────────────────────────────────────────────────────────
interface BoardCardProps {
  board: BigBoardRecord;
  prospects: Prospect[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  formatDate: (d: string) => string;
}

const BoardCard: React.FC<BoardCardProps> = ({
  board,
  prospects,
  isExpanded,
  onToggleExpand,
  formatDate,
}) => {
  const resolved = useMemo(
    () => resolveProspectOrder(board.prospectOrder, prospects),
    [board.prospectOrder, prospects]
  );

  const preview = resolved.slice(0, 5);
  const hasMore = resolved.length > 5;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-slate-700 transition-colors">
      {/* Card Header */}
      <div className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="text-base sm:text-lg font-black font-oswald text-white uppercase tracking-tight truncate">
              {board.name}
            </h3>
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

        {/* Preview - Top 5 */}
        <div className="space-y-1.5">
          {preview.map((p, i) => (
            <div key={p.id} className="flex items-center gap-2">
              <span className="w-5 text-right text-xs font-black font-oswald text-emerald-500">{i + 1}.</span>
              <img
                src={p.headshotUrl}
                alt={p.name}
                className="w-6 h-6 rounded bg-slate-800 object-cover shrink-0"
                onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=?'; }}
              />
              <span className="text-xs font-medium text-slate-300 truncate">{p.name}</span>
              <span className="px-1 py-0.5 rounded text-[9px] font-black uppercase bg-slate-800 text-slate-400 shrink-0">
                {p.position}
              </span>
            </div>
          ))}
          {hasMore && !isExpanded && (
            <p className="text-[11px] text-slate-600 pl-7">
              +{resolved.length - 5} more prospects
            </p>
          )}
        </div>

        {/* Expanded full board */}
        {isExpanded && resolved.length > 5 && (
          <div className="mt-2 space-y-1.5 border-t border-slate-800 pt-2">
            {resolved.slice(5).map((p, i) => (
              <div key={p.id} className="flex items-center gap-2">
                <span className="w-5 text-right text-xs font-black font-oswald text-emerald-500">{i + 6}.</span>
                <img
                  src={p.headshotUrl}
                  alt={p.name}
                  className="w-6 h-6 rounded bg-slate-800 object-cover shrink-0"
                  onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=?'; }}
                />
                <span className="text-xs font-medium text-slate-300 truncate">{p.name}</span>
                <span className="px-1 py-0.5 rounded text-[9px] font-black uppercase bg-slate-800 text-slate-400 shrink-0">
                  {p.position}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer Button */}
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
