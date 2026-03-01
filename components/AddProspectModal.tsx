'use client';

import React, { useState, useMemo } from 'react';
import { Prospect, Position } from '../types.ts';

const POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'C', 'IOL', 'EDGE', 'DE', 'DT', 'DL', 'LB', 'CB', 'S', 'K', 'P'];

interface AddProspectModalProps {
  /** All prospects for the draft year that are NOT already in the board */
  availableProspects: Prospect[];
  /** IDs that were just added during this session (to show "Added" badge) */
  recentlyAddedIds: Set<string>;
  onAdd: (prospect: Prospect) => void;
  onClose: () => void;
}

export const AddProspectModal: React.FC<AddProspectModalProps> = ({
  availableProspects,
  recentlyAddedIds,
  onAdd,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState<string>('ALL');

  const filtered = useMemo(() => {
    let list = availableProspects;
    if (posFilter !== 'ALL') {
      list = list.filter(p => p.position === posFilter);
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.college.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => a.rank - b.rank);
  }, [availableProspects, searchTerm, posFilter]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[80vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-black font-oswald uppercase tracking-tight text-white">
            Add <span className="text-emerald-500">Prospect</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="p-4 space-y-3 border-b border-slate-800 shrink-0">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by name or college..."
            className="w-full px-4 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            autoFocus
          />
          <div className="flex gap-1.5 flex-wrap">
            <button
              onClick={() => setPosFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-colors ${
                posFilter === 'ALL'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              All
            </button>
            {POSITIONS.map(pos => (
              <button
                key={pos}
                onClick={() => setPosFilter(pos)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold uppercase transition-colors ${
                  posFilter === pos
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <svg className="w-10 h-10 mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-sm">No prospects found</p>
            </div>
          ) : (
            filtered.map(p => {
              const justAdded = recentlyAddedIds.has(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => { if (!justAdded) onAdd(p); }}
                  disabled={justAdded}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                    justAdded
                      ? 'opacity-50 cursor-default'
                      : 'hover:bg-slate-800/80 cursor-pointer'
                  }`}
                >
                  <img
                    src={p.headshotUrl}
                    alt={p.name}
                    className="w-10 h-10 rounded-lg bg-slate-800 object-cover shrink-0"
                    onError={e => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=?'; }}
                  />
                  <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">{p.name}</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-slate-700 text-emerald-400">
                        {p.position}
                      </span>
                    </div>
                    <span className="text-xs text-slate-500">{p.college} &middot; Rank #{p.rank}</span>
                  </div>
                  {justAdded ? (
                    <span className="text-xs font-bold text-emerald-500 uppercase shrink-0">Added</span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 group-hover:text-emerald-400 shrink-0">
                      <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
