import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DraftState, Prospect, Position } from '../types';
import { Button } from './Button';

interface DraftBoardProps {
  state: DraftState;
  onDraftPlayer: (prospect: Prospect) => void;
  onSelectProspect: (prospect: Prospect) => void;
  selectedProspectId: string | null;
}

const POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE', 'OT', 'OG', 'C', 'DE', 'DT', 'LB', 'CB', 'S'];

type BoardTab = 'PROSPECTS' | 'TRACKER';

export const DraftBoard: React.FC<DraftBoardProps> = ({ 
  state, 
  onDraftPlayer, 
  onSelectProspect,
  selectedProspectId
}) => {
  const [filter, setFilter] = useState<Position | 'ALL'>('ALL');
  const [activeTab, setActiveTab] = useState<BoardTab>('PROSPECTS');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const currentPick = state.picks[state.currentPickIndex];
  const isUserTurn = state.userControlledTeams.includes(currentPick?.team.id);
  
  const draftedPlayerIds = useMemo(() => 
    state.picks.map(p => p.selectedPlayerId).filter(Boolean), 
    [state.picks]
  );

  const availableProspects = useMemo(() => 
    state.prospects.filter(p => !draftedPlayerIds.includes(p.id)),
    [state.prospects, draftedPlayerIds]
  );

  const filteredProspects = useMemo(() => 
    filter === 'ALL' ? availableProspects : availableProspects.filter(p => p.position === filter),
    [availableProspects, filter]
  );

  // Helper to calculate position rank based on all prospects
  const getPositionRank = (prospect: Prospect) => {
    const posProspects = state.prospects
      .filter(p => p.position === prospect.position)
      .sort((a, b) => a.rank - b.rank);
    const index = posProspects.findIndex(p => p.id === prospect.id);
    return index + 1;
  };

  // Auto-scroll the Draft Log to the current pick
  useEffect(() => {
    if (scrollRef.current) {
      const currentItem = scrollRef.current.querySelector(`[data-pick-index="${state.currentPickIndex}"]`);
      if (currentItem) {
        currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [state.currentPickIndex]);

  return (
    <div className="flex flex-col gap-2 p-2 lg:p-3 h-full overflow-hidden">
      
      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden bg-slate-900 border border-slate-800 p-1 rounded-xl shrink-0">
        <button
          onClick={() => setActiveTab('PROSPECTS')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'PROSPECTS' 
              ? 'bg-emerald-500 text-white shadow-lg' 
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Big Board
        </button>
        <button
          onClick={() => setActiveTab('TRACKER')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
            activeTab === 'TRACKER' 
              ? 'bg-emerald-500 text-white shadow-lg' 
              : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          Draft Tracker
          {!isUserTurn && !state.picks[state.currentPickIndex]?.selectedPlayerId && (
             <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          )}
        </button>
      </div>

      <div className="flex flex-1 gap-3 lg:gap-4 overflow-hidden relative">
        {/* Big Board Column */}
        <div className={`flex-1 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 lg:flex ${
          activeTab === 'PROSPECTS' ? 'flex' : 'hidden'
        }`}>
          <div className="p-3 border-b border-slate-800 bg-slate-800/50">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold font-oswald uppercase text-slate-100 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-emerald-500 rounded-sm"></span>
                Prospect Big Board
              </h3>
              <span className="text-[10px] text-slate-400 font-mono">
                {availableProspects.length} REMAINING
              </span>
            </div>
            
            <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full transition-colors whitespace-nowrap ${
                  filter === 'ALL' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                ALL
              </button>
              {POSITIONS.map(pos => (
                <button
                  key={pos}
                  onClick={() => setFilter(pos)}
                  className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full transition-colors whitespace-nowrap ${
                    filter === pos ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left table-fixed min-w-[600px] lg:min-w-0">
              <thead className="sticky top-0 bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">
                <tr>
                  <th className="px-4 py-2.5 w-14 lg:w-16">RK</th>
                  <th className="px-4 py-2.5 w-40 lg:w-48">PLAYER</th>
                  <th className="px-4 py-2.5 w-28 lg:w-32">POS (RANK)</th>
                  <th className="px-4 py-2.5 w-48 hidden xl:table-cell">SCOUTING REPORT</th>
                  <th className="px-4 py-2.5 w-28 lg:w-32">SCHOOL</th>
                  <th className="px-4 py-2.5 text-right w-24">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {filteredProspects.map((prospect) => (
                  <tr 
                    key={prospect.id}
                    onClick={() => onSelectProspect(prospect)}
                    className={`cursor-pointer hover:bg-emerald-500/5 transition-colors group ${
                      selectedProspectId === prospect.id ? 'bg-emerald-500/10 border-l-2 border-emerald-500' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-bold text-slate-500">#{prospect.rank}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden group-hover:ring-2 ring-emerald-500/30 transition-all flex-shrink-0">
                          <img src={prospect.headshotUrl} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-semibold text-slate-100 truncate">{prospect.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-emerald-400 inline-block w-fit">
                          {prospect.position}
                        </span>
                        <span className="text-[9px] font-black text-slate-500 uppercase mt-1">
                          #{getPositionRank(prospect)} {prospect.position}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <p className="text-[11px] text-slate-500 italic line-clamp-1 leading-relaxed">
                        {prospect.scoutingReport}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <img src={prospect.collegeLogoUrl} className="w-4 h-4 object-contain opacity-80" alt="" />
                        <span className="text-xs font-medium text-slate-400 truncate">{prospect.college}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {isUserTurn && (
                        <Button 
                          variant="primary" 
                          className="text-[10px] py-1 px-3 h-8 uppercase font-bold"
                          onClick={(e) => {
                            e.stopPropagation();
                            onDraftPlayer(prospect);
                          }}
                        >
                          Draft
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredProspects.length === 0 && (
              <div className="py-20 text-center text-slate-500">
                No prospects found matching that position.
              </div>
            )}
          </div>
        </div>

        {/* Draft Tracker Column */}
        <div className={`w-full lg:w-80 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl transition-all duration-300 lg:flex ${
          activeTab === 'TRACKER' ? 'flex' : 'hidden'
        }`}>
          <div className="p-3 border-b border-slate-800 bg-slate-800/50">
            <h3 className="text-base font-bold font-oswald uppercase text-slate-100 flex items-center gap-2">
              <span className="w-1.5 h-5 bg-slate-500 rounded-sm"></span>
              Draft Tracker
            </h3>
          </div>
          <div className="flex-1 overflow-y-auto scroll-smooth" ref={scrollRef}>
            <div className="p-3 space-y-1.5">
              {state.picks.map((pick, index) => {
                const player = state.prospects.find(p => p.id === pick.selectedPlayerId);
                const isCurrent = index === state.currentPickIndex;
                const isCompleted = !!pick.selectedPlayerId;

                return (
                  <div 
                    key={pick.pickNumber}
                    data-pick-index={index}
                    className={`w-full flex gap-3 items-start p-2 rounded-lg transition-all border ${
                      isCurrent 
                        ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20' 
                        : isCompleted
                          ? 'bg-slate-800/20 border-transparent opacity-80'
                          : 'bg-slate-800/40 border-slate-800/50 opacity-60'
                    } ${player ? 'cursor-pointer hover:bg-white/5' : ''}`}
                    onClick={() => player && onSelectProspect(player)}
                  >
                    <div className={`flex-shrink-0 w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold transition-colors ${
                      isCurrent ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-800 text-slate-500'
                    }`}>
                      {pick.pickNumber}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <img src={pick.team.logoUrl} className="w-3 h-3" alt="" />
                        <span className={`text-[9px] font-bold uppercase truncate ${isCurrent ? 'text-emerald-400' : 'text-slate-500'}`}>
                          {pick.team.name}
                        </span>
                      </div>

                      <div className="flex justify-between items-center gap-2">
                        <div className="flex flex-col min-w-0">
                          {isCompleted ? (
                            <>
                              <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors truncate">
                                {player?.name}
                              </span>
                              <div className="flex items-center gap-1">
                                <img src={player?.collegeLogoUrl} className="w-2.5 h-2.5 object-contain" alt="" />
                                <span className="text-[9px] text-slate-500 truncate">{player?.college}</span>
                              </div>
                            </>
                          ) : (
                            <span className={`text-xs font-bold uppercase tracking-widest ${isCurrent ? 'text-emerald-400 animate-pulse' : 'text-slate-600'}`}>
                              {isCurrent ? 'On The Clock' : 'Upcoming'}
                            </span>
                          )}
                        </div>
                        
                        {isCompleted && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded shrink-0">
                            {player?.position}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
