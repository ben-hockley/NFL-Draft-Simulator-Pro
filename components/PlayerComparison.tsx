
import React, { useState, useEffect, useMemo } from 'react';
import { Prospect, PlayerStats } from '../types';

interface PlayerComparisonProps {
  basePlayer: Prospect;
  allProspects: Prospect[];
  onClose: () => void;
  onDraft: (prospect: Prospect) => void;
  isUserTurn?: boolean;
}

interface PhysicalInfo {
  height: string;
  weight: string;
}

export const PlayerComparison: React.FC<PlayerComparisonProps> = ({ 
  basePlayer, 
  allProspects,
  onClose, 
  onDraft,
  isUserTurn 
}) => {
  const [player1, setPlayer1] = useState<Prospect>(basePlayer);
  const [player2, setPlayer2] = useState<Prospect | null>(null);
  const [stats1, setStats1] = useState<PlayerStats | null>(null);
  const [stats2, setStats2] = useState<PlayerStats | null>(null);
  const [phys1, setPhys1] = useState<PhysicalInfo | null>(null);
  const [phys2, setPhys2] = useState<PhysicalInfo | null>(null);
  const [loading, setLoading] = useState({ p1: false, p2: false, phys1: false, phys2: false });

  const isOffensiveLineman = useMemo(() => {
    return ['OT', 'IOL', 'OG', 'C'].includes(basePlayer.position);
  }, [basePlayer.position]);

  const candidates = useMemo(() => {
    return allProspects
      .filter(p => p.position === basePlayer.position)
      .sort((a, b) => a.rank - b.rank);
  }, [allProspects, basePlayer.position]);

  useEffect(() => {
    setPhys1(null);
    fetchPhysical(player1.espnId, 'phys1');
    if (!isOffensiveLineman) {
      fetchPlayerData(player1.espnId, 'p1');
    }
  }, [player1, isOffensiveLineman]);

  useEffect(() => {
    if (player2) {
      setPhys2(null);
      fetchPhysical(player2.espnId, 'phys2');
      if (!isOffensiveLineman) {
        fetchPlayerData(player2.espnId, 'p2');
      }
    } else {
      setStats2(null);
      setPhys2(null);
    }
  }, [player2, isOffensiveLineman]);

  const fetchPhysical = async (espnId: number, type: 'phys1' | 'phys2') => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      const response = await fetch(`https://site.web.api.espn.com/apis/common/v3/sports/football/college-football/athletes/${espnId}`);
      if (!response.ok) throw new Error('Athlete data error');
      const data = await response.json();
      const info = {
        height: data.athlete?.displayHeight || '--',
        weight: data.athlete?.displayWeight || '--'
      };
      if (type === 'phys1') setPhys1(info);
      else setPhys2(info);
    } catch (err) {
      const fallback = { height: '--', weight: '--' };
      if (type === 'phys1') setPhys1(fallback);
      else setPhys2(fallback);
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const fetchPlayerData = async (espnId: number, type: 'p1' | 'p2') => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      const response = await fetch(`https://sports.core.api.espn.com/v2/sports/football/leagues/college-football/seasons/2025/types/3/athletes/${espnId}/statistics/0`);
      if (!response.ok) throw new Error('No stats');
      const data = await response.json();
      const categories = data.splits.categories;
      
      const parsed: PlayerStats = { gamesPlayed: 0 };
      categories.forEach((cat: any) => {
        if (cat.name === 'general') {
          parsed.gamesPlayed = cat.stats.find((s: any) => s.name === 'gamesPlayed')?.value || 0;
          parsed.forcedFumbles = cat.stats.find((s: any) => s.name === 'fumblesForced')?.value;
        }
        if (cat.name === 'passing') {
          parsed.passingYards = cat.stats.find((s: any) => s.name === 'passingYards')?.value;
          parsed.passingTDs = cat.stats.find((s: any) => s.name === 'passingTouchdowns')?.value;
          parsed.ints = cat.stats.find((s: any) => s.name === 'interceptions')?.value;
          parsed.completionPct = cat.stats.find((s: any) => s.name === 'completionPct')?.displayValue;
        }
        if (cat.name === 'rushing') {
          parsed.rushingYards = cat.stats.find((s: any) => s.name === 'rushingYards')?.value;
          parsed.rushingTDs = cat.stats.find((s: any) => s.name === 'rushingTouchdowns')?.value;
        }
        if (cat.name === 'receiving') {
          parsed.receptions = cat.stats.find((s: any) => s.name === 'receptions')?.value;
          parsed.receivingYards = cat.stats.find((s: any) => s.name === 'receivingYards')?.value;
          parsed.receivingTDs = cat.stats.find((s: any) => s.name === 'receivingTouchdowns')?.value;
        }
        if (cat.name === 'defensive') {
          parsed.tackles = cat.stats.find((s: any) => s.name === 'totalTackles')?.value;
          parsed.sacks = cat.stats.find((s: any) => s.name === 'sacks')?.value;
        }
        if (cat.name === 'defensiveInterceptions') parsed.defInts = cat.stats.find((s: any) => s.name === 'interceptions')?.value;
        if (cat.name === 'kicking') {
          parsed.fgPct = cat.stats.find((s: any) => s.name === 'fieldGoalPct')?.displayValue;
          parsed.xpPct = cat.stats.find((s: any) => s.name === 'extraPointPct')?.displayValue;
          parsed.longFg = cat.stats.find((s: any) => s.name === 'longFieldGoalMade')?.value;
        }
        if (cat.name === 'punting') {
          parsed.punts = cat.stats.find((s: any) => s.name === 'punts')?.value;
          parsed.longPunt = cat.stats.find((s: any) => s.name === 'longPunt')?.value;
          parsed.inside20 = cat.stats.find((s: any) => s.name === 'puntsInside20')?.value;
        }
      });

      if (type === 'p1') setStats1(parsed);
      else setStats2(parsed);
    } catch (err) {
      if (type === 'p1') setStats1({ gamesPlayed: 0 });
      else setStats2({ gamesPlayed: 0 });
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const parseHeight = (h?: string) => {
    if (!h || h === '--') return 0;
    const match = h.match(/(\d+)'\s*(\d+)/);
    if (!match) return 0;
    return parseInt(match[1]) * 12 + parseInt(match[2]);
  };

  const parseWeight = (w?: string) => {
    if (!w || w === '--') return 0;
    return parseInt(w.replace(/\D/g, '')) || 0;
  };

  const getWinnerClass = (val1: any, val2: any, lowerIsBetter = false, isHeight = false, isWeight = false) => {
    if (val1 === undefined || val2 === undefined) return '';
    
    let n1 = val1;
    let n2 = val2;

    if (isHeight) {
      n1 = parseHeight(val1 as string);
      n2 = parseHeight(val2 as string);
    } else if (isWeight) {
      n1 = parseWeight(val1 as string);
      n2 = parseWeight(val2 as string);
    } else {
      n1 = typeof val1 === 'string' ? parseFloat(val1) : val1;
      n2 = typeof val2 === 'string' ? parseFloat(val2) : val2;
    }

    if (n1 === n2 || n1 === 0 || n2 === 0) return '';
    if (lowerIsBetter) return n1 < n2 ? 'text-emerald-400 font-black' : 'text-slate-500';
    return n1 > n2 ? 'text-emerald-400 font-black' : 'text-slate-500';
  };

  const renderComparisonRow = (label: string, key1: any, key2: any, options?: { lowerIsBetter?: boolean, skipHighlight?: boolean, isHeight?: boolean, isWeight?: boolean, isLoading?: boolean }) => (
    <div className="grid grid-cols-3 border-b border-slate-800/50 py-3 lg:py-4 px-4">
      <div className={`text-center font-oswald text-sm lg:text-lg ${options?.isLoading ? 'animate-pulse' : ''} ${options?.skipHighlight ? 'text-slate-300' : getWinnerClass(key1, key2, options?.lowerIsBetter, options?.isHeight, options?.isWeight)}`}>
        {options?.isLoading ? '...' : key1?.toLocaleString() || '--'}
      </div>
      <div className="text-center text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center">
        {label}
      </div>
      <div className={`text-center font-oswald text-sm lg:text-lg ${options?.isLoading ? 'animate-pulse' : ''} ${options?.skipHighlight ? 'text-slate-300' : getWinnerClass(key2, key1, options?.lowerIsBetter, options?.isHeight, options?.isWeight)}`}>
        {options?.isLoading ? '...' : key2?.toLocaleString() || '--'}
      </div>
    </div>
  );

  const PlayerSelector = ({ 
    selectedPlayer, 
    onSelect, 
    otherPlayerId, 
  }: { 
    selectedPlayer: Prospect | null, 
    onSelect: (p: Prospect | null) => void, 
    otherPlayerId?: string,
  }) => {
    return (
      <div className="p-4 lg:p-6 flex flex-col items-center text-center w-full">
        <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full bg-slate-800 overflow-hidden mb-3 border-2 border-slate-700 relative">
          {selectedPlayer ? (
            <img src={selectedPlayer.headshotUrl} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-900">
               <svg className="w-8 h-8 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </div>
          )}
        </div>

        <div className="w-full max-w-[220px] relative">
          <select 
            value={selectedPlayer?.id || ""}
            onChange={(e) => {
              const p = candidates.find(c => c.id === e.target.value);
              onSelect(p || null);
            }}
            className="w-full bg-slate-800 border border-slate-700 text-slate-100 text-[11px] lg:text-sm font-black p-2 pr-8 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase cursor-pointer appearance-none text-center"
          >
            <option value="" disabled={!!selectedPlayer}>Select {basePlayer.position} Prospect</option>
            {candidates
              .filter(c => c.id !== otherPlayerId)
              .map(c => (
                <option key={c.id} value={c.id}>#{c.rank} {c.name}</option>
              ))}
          </select>
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-slate-400">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
          </div>
        </div>

        <div className="h-20 flex flex-col items-center justify-center">
          {selectedPlayer ? (
            <>
              {isUserTurn && (
                <button 
                  onClick={() => onDraft(selectedPlayer)}
                  className="mt-3 px-5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-bold uppercase tracking-widest rounded-lg transition-all shadow-lg hover:scale-105 active:scale-95"
                >
                  Draft
                </button>
              )}
            </>
          ) : (
             <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2">Awaiting Selection</span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 lg:p-6 bg-slate-950/95 backdrop-blur-xl animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[95vh]">
        
        <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">Compare Prospects</div>
            <h2 className="text-lg lg:text-2xl font-black font-oswald text-white uppercase tracking-tight">{basePlayer.position} Comparison</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-2 bg-slate-950/50 shrink-0 border-b border-slate-800 divide-x divide-slate-800">
          <PlayerSelector 
            selectedPlayer={player1} 
            onSelect={(p) => p && setPlayer1(p)} 
            otherPlayerId={player2?.id}
          />
          <PlayerSelector
            selectedPlayer={player2} 
            onSelect={setPlayer2} 
            otherPlayerId={player1.id}
          />
        </div>

        <div className="flex-1 overflow-y-auto bg-slate-900/50">
          {!player2 ? (
            <div className="py-20 text-center text-slate-500 px-10">
              <div className="max-w-xs mx-auto">
                <svg className="w-12 h-12 text-slate-800 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <p className="text-sm font-medium uppercase tracking-widest leading-relaxed">Select a second {player1.position} from the dropdown above to begin side-by-side analysis</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50 pb-10">
              <div className="bg-slate-800/30 px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex justify-between items-center sticky top-0 z-10 backdrop-blur-md">
                <span>Physical Profile</span>
              </div>
              
              {renderComparisonRow('Overall Rank', player1.rank, player2.rank, { lowerIsBetter: true })}
              {renderComparisonRow('Height', phys1?.height, phys2?.height, { isHeight: true, isLoading: loading.phys1 || loading.phys2 })}
              {renderComparisonRow('Weight', phys1?.weight, phys2?.weight, { skipHighlight: true, isWeight: true, isLoading: loading.phys1 || loading.phys2 })}
              
              {!isOffensiveLineman && (
                <div className="bg-slate-800/30 px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex justify-between items-center sticky top-[33px] lg:top-[41px] z-10 backdrop-blur-md mt-4 border-t border-slate-800">
                  <span>2025 CFB Stats</span>
                  { (loading.p1 || loading.p2) && <span className="text-emerald-500 animate-pulse text-[8px] font-black uppercase">Syncing...</span> }
                </div>
              )}

              <div className="grid grid-cols-3 border-b border-slate-800/50 py-3 lg:py-4 px-4 bg-slate-800/20">
                <div className="flex flex-col items-center justify-center gap-1">
                  <img src={player1.collegeLogoUrl} className="w-5 h-5 lg:w-8 lg:h-8 object-contain" alt="" />
                  <span className="text-[9px] lg:text-xs font-bold text-slate-200 uppercase truncate max-w-full">{player1.college}</span>
                </div>
                <div className="text-center text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center">
                  COLLEGE
                </div>
                <div className="flex flex-col items-center justify-center gap-1">
                  <img src={player2.collegeLogoUrl} className="w-5 h-5 lg:w-8 lg:h-8 object-contain" alt="" />
                  <span className="text-[9px] lg:text-xs font-bold text-slate-200 uppercase truncate max-w-full">{player2.college}</span>
                </div>
              </div>

              {!isOffensiveLineman && (
                <>
                  {loading.p1 || loading.p2 ? (
                    <div className="p-16 text-center">
                      <div className="inline-block w-8 h-8 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-4"></div>
                      <div className="text-emerald-500 font-bold text-[10px] uppercase tracking-widest">Compiling Prospect Data...</div>
                    </div>
                  ) : (
                    <>
                      {renderComparisonRow('Games Played', stats1?.gamesPlayed, stats2?.gamesPlayed)}
                      
                      {player1.position === 'QB' && (
                        <>
                          {renderComparisonRow('Passing Yds', stats1?.passingYards, stats2?.passingYards)}
                          {renderComparisonRow('Pass TDs', stats1?.passingTDs, stats2?.passingTDs)}
                          {renderComparisonRow('INTs', stats1?.ints, stats2?.ints, { lowerIsBetter: true })}
                          {renderComparisonRow('Completion %', stats1?.completionPct, stats2?.completionPct)}
                          {renderComparisonRow('Rush Yds', stats1?.rushingYards, stats2?.rushingYards)}
                        </>
                      )}

                      {player1.position === 'RB' && (
                        <>
                          {renderComparisonRow('Rush Yds', stats1?.rushingYards, stats2?.rushingYards)}
                          {renderComparisonRow('Rush TDs', stats1?.rushingTDs, stats2?.rushingTDs)}
                          {renderComparisonRow('Receptions', stats1?.receptions, stats2?.receptions)}
                          {renderComparisonRow('Rec Yds', stats1?.receivingYards, stats2?.receivingYards)}
                        </>
                      )}

                      {['WR', 'TE'].includes(player1.position) && (
                        <>
                          {renderComparisonRow('Receptions', stats1?.receptions, stats2?.receptions)}
                          {renderComparisonRow('Rec Yds', stats1?.receivingYards, stats2?.receivingYards)}
                          {renderComparisonRow('Rec TDs', stats1?.receivingTDs, stats2?.receivingTDs)}
                        </>
                      )}

                      {['DL', 'EDGE', 'LB', 'CB', 'S'].includes(player1.position) && (
                        <>
                          {renderComparisonRow('Total Tackles', stats1?.tackles, stats2?.tackles)}
                          {renderComparisonRow('Sacks', stats1?.sacks, stats2?.sacks)}
                          {renderComparisonRow('Forced Fumbles', stats1?.forcedFumbles, stats2?.forcedFumbles)}
                          {renderComparisonRow('Interceptions', stats1?.defInts, stats2?.defInts)}
                        </>
                      )}

                      {player1.position === 'K' && (
                        <>
                          {renderComparisonRow('Field Goal %', stats1?.fgPct, stats2?.fgPct)}
                          {renderComparisonRow('Extra Point %', stats1?.xpPct, stats2?.xpPct)}
                          {renderComparisonRow('Longest FG', stats1?.longFg, stats2?.longFg)}
                        </>
                      )}

                      {player1.position === 'P' && (
                        <>
                          {renderComparisonRow('Punts', stats1?.punts, stats2?.punts)}
                          {renderComparisonRow('Longest Punt', stats1?.longPunt, stats2?.longPunt)}
                          {renderComparisonRow('Punts Inside 20', stats1?.inside20, stats2?.inside20)}
                        </>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-4 lg:p-6 bg-slate-800/80 border-t border-slate-700 text-center shrink-0">
        </div>
      </div>
    </div>
  );
};
