'use client';

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { DraftState, Prospect, Position, Team } from '../types.ts';
import { Button } from './Button.tsx';

interface DraftBoardProps {
  teams: Team[];
  state: DraftState;
  onDraftPlayer: (prospect: Prospect) => void;
  onSelectProspect: (prospect: Prospect) => void;
  selectedProspectId: string | null;
}

const POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'EDGE', 'DL', 'LB', 'CB', 'S', 'K', 'P', 'LS'];

type BoardTab = 'PROSPECTS' | 'TRACKER';

export const DraftBoard: React.FC<DraftBoardProps> = ({ 
  teams,
  state, 
  onDraftPlayer, 
  onSelectProspect,
  selectedProspectId
}) => {
  const [filter, setFilter] = useState<Position | 'ALL'>('ALL');
  const [collegeFilter, setCollegeFilter] = useState<string>('ALL');
  const [teamTrackerFilter, setTeamTrackerFilter] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<BoardTab>('PROSPECTS');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const sortedTeams = useMemo(() => 
    [...teams].sort((a, b) => a.name.localeCompare(b.name)),
    [teams]
  );

  const picksInScope = useMemo(() => state.picks.filter(p => p.round <= state.roundsToSimulate), [state.picks, state.roundsToSimulate]);
  const currentPick = picksInScope[state.currentPickIndex];
  const isUserTurn = state.userControlledTeams.includes(currentPick?.team.id);
  
  const draftedPlayerIds = useMemo(() => 
    state.picks.map(p => p.selectedPlayerId).filter(Boolean), 
    [state.picks]
  );

  // Filter available prospects for Draft Simulator - strictly 2026 class
  const availableProspects = useMemo(() => 
    state.prospects.filter(p => !draftedPlayerIds.includes(p.id) && p.draftYear === 2026),
    [state.prospects, draftedPlayerIds]
  );

  const uniqueColleges = useMemo(() => {
    const colleges = Array.from(new Set(state.prospects.filter(p => p.draftYear === 2026).map(p => p.college)));
    return colleges.sort();
  }, [state.prospects]);

  const filteredProspects = useMemo(() => {
    let list = availableProspects;
    if (filter !== 'ALL') {
      list = list.filter(p => p.position === filter);
    }
    if (collegeFilter !== 'ALL') {
      list = list.filter(p => p.college === collegeFilter);
    }
    return list;
  }, [availableProspects, filter, collegeFilter]);

  const filteredTrackerPicks = useMemo(() => {
    if (teamTrackerFilter === 'ALL') return picksInScope;
    return picksInScope.filter(p => p.team.id === teamTrackerFilter);
  }, [picksInScope, teamTrackerFilter]);

  const getPositionRank = (prospect: Prospect) => {
    const posProspects = state.prospects
      .filter(p => p.position === prospect.position && p.draftYear === 2026)
      .sort((a, b) => a.rank - b.rank);
    const index = posProspects.findIndex(p => p.id === prospect.id);
    return index + 1;
  };

  useEffect(() => {
    if (scrollRef.current && teamTrackerFilter === 'ALL') {
      const currentItem = scrollRef.current.querySelector(`[data-pick-index="${state.currentPickIndex}"]`);
      if (currentItem) {
        currentItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [state.currentPickIndex, teamTrackerFilter]);

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
          {!isUserTurn && currentPick && !currentPick.selectedPlayerId && (
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
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                  {availableProspects.length} REMAINING
                </span>
                <select 
                  value={collegeFilter}
                  onChange={(e) => setCollegeFilter(e.target.value)}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-[10px] font-bold py-1 px-2 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase tracking-tighter"
                >
                  <option value="ALL">All Colleges</option>
                  {uniqueColleges.map(college => (
                    <option key={college} value={college}>{college}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-1.5 overflow-x-auto pb-1 no-scrollbar scrollbar-none">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-2.5 py-0.5 text-[9px] font-bold rounded-full transition-colors whitespace-nowrap ${
                  filter === 'ALL' ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                All Positions
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
            {/* Desktop View - HEADSHOT ADDED BETWEEN RK AND PLAYER */}
            <table className="hidden md:table w-full text-left table-fixed">
              <thead className="sticky top-0 bg-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider z-10">
                <tr>
                  <th className="px-4 py-2.5 w-14 lg:w-16">RK</th>
                  <th className="px-4 py-2.5 w-20"></th>
                  <th className="px-4 py-2.5 w-40 lg:w-48">PLAYER</th>
                  <th className="px-4 py-2.5 w-28 lg:w-32">POS (RANK)</th>
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
                      <div className="w-10 h-10 rounded-lg bg-slate-800 overflow-hidden border border-slate-700 p-0.5 shrink-0">
                        <img src={prospect.headshotUrl} className="w-full h-full object-cover object-top" alt="" />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-100 truncate">{prospect.name}</span>
                        <div className="flex gap-0.5">
                          {prospect.recruitingStars === 5 && <span className="text-[10px]">⭐</span>}
                          {prospect.allAmerican && <span className="text-[10px]">🛡️</span>}
                          {prospect.nflBloodline && <span className="text-[10px]">🧬</span>}
                          {prospect.freaksList && <span className="text-[10px]">👽</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-bold text-emerald-400 inline-block w-fit uppercase">
                          {prospect.position}
                        </span>
                        <span className="text-[9px] font-black text-slate-500 uppercase mt-1">
                          #{getPositionRank(prospect)} {prospect.position}
                        </span>
                      </div>
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

            {/* Mobile View - CUSTOM ROW LAYOUT */}
            <div className="flex flex-col gap-2 p-2 md:hidden">
              {filteredProspects.map(prospect => (
                <div 
                  key={prospect.id}
                  onClick={() => onSelectProspect(prospect)}
                  className={`bg-[#0f172a] border border-slate-800/80 rounded-xl p-3 flex items-center gap-4 active:bg-slate-800 transition-colors ${
                    selectedProspectId === prospect.id ? 'ring-1 ring-emerald-500/50 bg-emerald-500/5' : ''
                  }`}
                >
                  {/* Rank Column */}
                  <div className="flex flex-col items-center justify-center min-w-[32px]">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-tighter">RK</span>
                    <span className="text-lg font-black font-oswald text-slate-100 leading-none">#{prospect.rank}</span>
                  </div>

                  {/* Headshot */}
                  <div className="w-12 h-12 bg-slate-800 rounded-lg overflow-hidden border border-slate-700 p-0.5 shrink-0">
                    <img src={prospect.headshotUrl} className="w-full h-full object-cover object-top" alt="" />
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h3 className="text-sm font-black font-oswald text-white uppercase tracking-tight truncate max-w-[140px]">
                        {prospect.name}
                      </h3>
                      <div className="flex gap-0.5 shrink-0">
                        {prospect.recruitingStars === 5 && <span className="text-[10px]">⭐</span>}
                        {prospect.allAmerican && <span className="text-[10px]">🛡️</span>}
                        {prospect.nflBloodline && <span className="text-[10px]">🧬</span>}
                        {prospect.freaksList && <span className="text-[10px]">👽</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase truncate">
                        {prospect.college}
                      </span>
                      <span className="text-slate-700">|</span>
                      <span className="text-[10px] font-black text-emerald-500 uppercase">
                        {prospect.position}
                      </span>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="shrink-0">
                    {isUserTurn ? (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDraftPlayer(prospect);
                        }}
                        className="bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/50 px-3 py-2 rounded-lg flex items-center gap-2 group active:scale-95 transition-all shadow-lg shadow-emerald-900/20"
                      >
                        <span className="text-[10px] font-black font-oswald text-white uppercase tracking-widest">Draft</span>
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <button className="bg-slate-800/80 border border-slate-700 px-3 py-2 rounded-lg flex items-center gap-2 group">
                        <span className="text-[10px] font-black font-oswald text-slate-300 uppercase tracking-widest">Info</span>
                        <svg className="w-3 h-3 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {filteredProspects.length === 0 && (
              <div className="py-20 text-center text-slate-500">
                No prospects found matching these filters.
              </div>
            )}
          </div>
        </div>

        {/* Draft Tracker Column */}
        <div className={`w-full lg:w-80 flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl transition-all duration-300 lg:flex ${
          activeTab === 'TRACKER' ? 'flex' : 'hidden'
        }`}>
          <div className="p-3 border-b border-slate-800 bg-slate-800/50">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold font-oswald uppercase text-slate-100 flex items-center gap-2">
                <span className="w-1.5 h-5 bg-slate-500 rounded-sm"></span>
                Draft Tracker
              </h3>
              <select 
                value={teamTrackerFilter}
                onChange={(e) => setTeamTrackerFilter(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-[9px] font-bold py-1 px-1.5 rounded focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase tracking-tighter max-w-[100px]"
              >
                <option value="ALL">All Teams</option>
                {sortedTeams.map(team => (
                  <option key={team.id} value={team.id}>{team.nickname}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto scroll-smooth" ref={scrollRef}>
            <div className="p-3 space-y-1.5">
              {filteredTrackerPicks.map((pick, index) => {
                const player = state.prospects.find(p => p.id === pick.selectedPlayerId);
                const scopeIndex = picksInScope.findIndex(p => p.pickNumber === pick.pickNumber);
                const isCurrent = scopeIndex === state.currentPickIndex;
                const isCompleted = !!pick.selectedPlayerId;

                const showRoundSeparator = index === 0 || filteredTrackerPicks[index - 1].round !== pick.round;

                return (
                  <React.Fragment key={pick.pickNumber}>
                    {showRoundSeparator && (
                      <div className="pt-4 pb-2 first:pt-0">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="h-[1px] flex-1 bg-slate-800"></div>
                          <span className="text-[10px] font-black font-oswald uppercase tracking-[0.2em] text-emerald-500/80 bg-slate-900 px-2 py-0.5 border border-slate-800 rounded">
                            Round {pick.round}
                          </span>
                          <div className="h-[1px] flex-1 bg-slate-800"></div>
                        </div>
                      </div>
                    )}
                    <div 
                      data-pick-index={scopeIndex}
                      className={`w-full flex gap-3 items-start p-2 rounded-lg transition-all border ${
                        isCurrent 
                          ? 'bg-emerald-500/10 border-emerald-500/30 ring-1 ring-emerald-500/20' 
                          : isCompleted
                            ? 'bg-slate-800/20 border-transparent opacity-80'
                            : 'bg-slate-800/40 border-slate-800/50 opacity-60'
                      } ${player ? 'cursor-pointer hover:bg-white/5' : ''}`}
                      onClick={() => player && onSelectProspect(player)}
                    >
                      <div className={`flex-shrink-0 w-7 h-7 rounded flex items-center justify-center text-[10px] font-bold transition-colors relative ${
                        isCurrent ? 'bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-slate-800 text-slate-500'
                      }`}>
                        {pick.pickNumber}
                        {pick.isTraded && (
                           <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 border border-slate-900 shadow-sm" title="Pick Traded">
                              <svg className="w-1.5 h-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                           </div>
                        )}
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
                            <span className="text-[9px] font-bold px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded shrink-0 uppercase">
                              {player?.position}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
              {filteredTrackerPicks.length === 0 && (
                <div className="py-10 text-center text-[10px] font-bold uppercase text-slate-600 tracking-widest">
                  No picks for this team
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
