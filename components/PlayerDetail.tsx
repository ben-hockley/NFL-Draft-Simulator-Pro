
import React, { useMemo, useEffect, useState } from 'react';
import { Prospect, Team, PlayerStats } from '../types';
import { Button } from './Button';

interface PlayerDetailProps {
  prospect: Prospect | null;
  allProspects: Prospect[];
  currentTeam?: Team;
  isUserTurn?: boolean;
  onDraft: (prospect: Prospect) => void;
  onClose: () => void;
  onCompare?: () => void;
  completedPick?: { team: Team; pickNumber: number };
}

export const PlayerDetail: React.FC<PlayerDetailProps> = ({ 
  prospect, 
  allProspects,
  currentTeam, 
  isUserTurn, 
  onDraft,
  onClose,
  onCompare,
  completedPick
}) => {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [physicalInfo, setPhysicalInfo] = useState<{ height: string; weight: string } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingPhysical, setLoadingPhysical] = useState(false);

  const isOffensiveLineman = useMemo(() => {
    return prospect ? ['OT', 'IOL', 'OG', 'C'].includes(prospect.position) : false;
  }, [prospect]);

  useEffect(() => {
    if (prospect) {
      setStats(null);
      setPhysicalInfo(null);
      fetchPhysicalInfo(prospect.espnId);
      if (!isOffensiveLineman) {
        fetchStats(prospect.espnId);
      }
    }
  }, [prospect, isOffensiveLineman]);

  const fetchPhysicalInfo = async (espnId: number) => {
    setLoadingPhysical(true);
    try {
      const response = await fetch(`https://site.web.api.espn.com/apis/common/v3/sports/football/college-football/athletes/${espnId}`);
      if (!response.ok) throw new Error('Athlete data not found');
      const data = await response.json();
      const athlete = data.athlete;
      if (athlete) {
        setPhysicalInfo({
          height: athlete.displayHeight || '--',
          weight: athlete.displayWeight || '--'
        });
      }
    } catch (err) {
      console.error('Failed to fetch physical info:', err);
      setPhysicalInfo({ height: '--', weight: '--' });
    } finally {
      setLoadingPhysical(false);
    }
  };

  const fetchStats = async (espnId: number) => {
    setLoadingStats(true);
    try {
      const response = await fetch(`https://sports.core.api.espn.com/v2/sports/football/leagues/college-football/seasons/2025/types/3/athletes/${espnId}/statistics/0`);
      if (!response.ok) throw new Error('Stats not found');
      
      const data = await response.json();
      const categories = data.splits.categories;
      
      const parsedStats: PlayerStats = {
        gamesPlayed: 0
      };

      categories.forEach((cat: any) => {
        if (cat.name === 'general') {
          const gp = cat.stats.find((s: any) => s.name === 'gamesPlayed');
          if (gp) parsedStats.gamesPlayed = gp.value;
          const ff = cat.stats.find((s: any) => s.name === 'fumblesForced');
          if (ff) parsedStats.forcedFumbles = ff.value;
        }
        if (cat.name === 'passing') {
          parsedStats.passingYards = cat.stats.find((s: any) => s.name === 'passingYards')?.value;
          parsedStats.passingTDs = cat.stats.find((s: any) => s.name === 'passingTouchdowns')?.value;
          parsedStats.ints = cat.stats.find((s: any) => s.name === 'interceptions')?.value;
          parsedStats.completionPct = cat.stats.find((s: any) => s.name === 'completionPct')?.displayValue;
        }
        if (cat.name === 'rushing') {
          parsedStats.rushingYards = cat.stats.find((s: any) => s.name === 'rushingYards')?.value;
          parsedStats.rushingTDs = cat.stats.find((s: any) => s.name === 'rushingTouchdowns')?.value;
        }
        if (cat.name === 'receiving') {
          parsedStats.receptions = cat.stats.find((s: any) => s.name === 'receptions')?.value;
          parsedStats.receivingYards = cat.stats.find((s: any) => s.name === 'receivingYards')?.value;
          parsedStats.receivingTDs = cat.stats.find((s: any) => s.name === 'receivingTouchdowns')?.value;
        }
        if (cat.name === 'defensive') {
          parsedStats.tackles = cat.stats.find((s: any) => s.name === 'totalTackles')?.value;
          parsedStats.sacks = cat.stats.find((s: any) => s.name === 'sacks')?.value;
        }
        if (cat.name === 'defensiveInterceptions') {
          parsedStats.defInts = cat.stats.find((s: any) => s.name === 'interceptions')?.value;
        }
      });

      setStats(parsedStats);
    } catch (err) {
      setStats({ gamesPlayed: 0 });
    } finally {
      setLoadingStats(false);
    }
  };

  const positionRank = useMemo(() => {
    if (!prospect || !allProspects.length) return 0;
    const posProspects = allProspects
      .filter(p => p.position === prospect.position)
      .sort((a, b) => a.rank - b.rank);
    return posProspects.findIndex(p => p.id === prospect.id) + 1;
  }, [prospect, allProspects]);

  if (!prospect) return null;

  const renderStats = () => {
    if (loadingStats) {
      return (
        <div className="flex items-center gap-2 text-slate-500 animate-pulse py-4">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span className="text-[10px] font-bold uppercase tracking-widest">Loading Live Stats...</span>
        </div>
      );
    }

    if (!stats || stats.gamesPlayed === 0) {
      return (
        <div className="bg-slate-800/30 border border-slate-700/50 p-4 rounded-xl text-center">
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">No Stats Available</p>
        </div>
      );
    }

    const statBoxes = [];
    statBoxes.push({ label: 'GP', value: stats.gamesPlayed });

    if (prospect.position === 'QB') {
      statBoxes.push({ label: 'Pass Yds', value: stats.passingYards?.toLocaleString() || 0 });
      statBoxes.push({ label: 'TD/INT', value: `${stats.passingTDs || 0}/${stats.ints || 0}` });
      statBoxes.push({ label: 'CMP%', value: stats.completionPct || '0%' });
      statBoxes.push({ label: 'Rush Yds', value: stats.rushingYards?.toLocaleString() || 0 });
    } else if (prospect.position === 'RB') {
      statBoxes.push({ label: 'Rush Yds', value: stats.rushingYards?.toLocaleString() || 0 });
      statBoxes.push({ label: 'Rush TD', value: stats.rushingTDs || 0 });
      statBoxes.push({ label: 'Rec', value: stats.receptions || 0 });
      statBoxes.push({ label: 'Rec Yds', value: stats.receivingYards?.toLocaleString() || 0 });
    } else if (['WR', 'TE'].includes(prospect.position)) {
      statBoxes.push({ label: 'Rec', value: stats.receptions || 0 });
      statBoxes.push({ label: 'Rec Yds', value: stats.receivingYards?.toLocaleString() || 0 });
      statBoxes.push({ label: 'TD', value: stats.receivingTDs || 0 });
    } else if (['DL', 'EDGE', 'LB', 'CB', 'S'].includes(prospect.position)) {
      statBoxes.push({ label: 'Tkl', value: stats.tackles || 0 });
      statBoxes.push({ label: 'Sacks', value: stats.sacks || 0 });
      statBoxes.push({ label: 'FF', value: stats.forcedFumbles || 0 });
      statBoxes.push({ label: 'INT', value: stats.defInts || 0 });
    }

    return (
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        {statBoxes.map((box, i) => (
          <div key={i} className="bg-slate-800/50 border border-slate-700 p-2 rounded-lg text-center">
            <span className="block text-[8px] font-bold text-slate-500 uppercase leading-none mb-1">{box.label}</span>
            <span className="text-sm font-black font-oswald text-emerald-400">{box.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl md:rounded-3xl overflow-y-auto md:overflow-hidden max-h-[95vh] md:max-h-none shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 p-1.5 md:p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 transition-colors z-20"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/2 bg-slate-800 relative h-[250px] md:h-auto md:min-h-[450px] shrink-0">
            <img 
              src={prospect.headshotUrl} 
              alt={prospect.name} 
              className="w-full h-full object-cover object-top opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
              <div className="flex flex-col gap-1.5 md:gap-2 mb-2 md:mb-3">
                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-emerald-500 text-white font-black text-[10px] md:text-sm rounded inline-block shadow-lg w-fit uppercase">
                  RANKED #{prospect.rank} OVERALL
                </span>
                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-slate-700/80 backdrop-blur-sm text-slate-200 font-bold text-[9px] md:text-xs rounded inline-block w-fit uppercase tracking-wider">
                  #{positionRank} RANKED {prospect.position}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black font-oswald text-white uppercase leading-none tracking-tight">
                {prospect.name}
              </h2>
              <div className="flex items-center gap-3 md:gap-4 mt-1 md:mt-2 text-emerald-400 font-bold uppercase tracking-widest text-sm md:text-lg">
                <span>{prospect.position}</span>
                <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-slate-600"></span>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <img src={prospect.collegeLogoUrl} className="w-4 h-4 md:w-6 md:h-6 object-contain" alt="" />
                  <span>{prospect.college}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full md:w-1/2 p-5 md:p-10 flex flex-col">
            {!isOffensiveLineman && (
              <>
                <div className="mb-6 md:mb-8 flex justify-between items-start">
                  <div>
                    <h3 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 md:mb-4">CFB Stats: 2025/26 Season</h3>
                  </div>
                  {onCompare && !completedPick && (
                    <button 
                      onClick={onCompare}
                      className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                      Compare
                    </button>
                  )}
                </div>
                {renderStats()}
              </>
            )}

            {isOffensiveLineman && onCompare && !completedPick && (
               <div className="mb-6 md:mb-8 flex justify-end">
                <button 
                  onClick={onCompare}
                  className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Compare
                </button>
              </div>
            )}

            <div className="my-6 md:my-8">
              <h3 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 md:mb-4">Physical Measurements</h3>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="bg-slate-800/50 p-3 md:p-4 rounded-xl border border-slate-700">
                  <span className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase mb-0.5 md:mb-1">Height</span>
                  {loadingPhysical ? (
                    <div className="h-8 w-16 bg-slate-700 animate-pulse rounded"></div>
                  ) : (
                    <span className="text-xl md:text-2xl font-oswald font-bold text-slate-100">{physicalInfo?.height || '--'}</span>
                  )}
                </div>
                <div className="bg-slate-800/50 p-3 md:p-4 rounded-xl border border-slate-700">
                  <span className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase mb-0.5 md:mb-1">Weight</span>
                  {loadingPhysical ? (
                    <div className="h-8 w-16 bg-slate-700 animate-pulse rounded"></div>
                  ) : (
                    <span className="text-xl md:text-2xl font-oswald font-bold text-slate-100">{physicalInfo?.weight || '--'}</span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex-1 mb-6 md:mb-8">
              <h3 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 md:mb-3">Scouting Summary</h3>
              <p className="text-slate-200 text-sm md:text-base leading-relaxed font-medium">
                {prospect.scoutingReport}
              </p>
            </div>

            <div className="mt-auto">
              {completedPick ? (
                <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-slate-800 border border-slate-700 rounded-xl md:rounded-2xl">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center p-1.5 md:p-2 bg-slate-900 rounded-lg">
                    <img src={completedPick.team.logoUrl} className="max-w-full max-h-full" alt="" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Drafted At Pick #{completedPick.pickNumber}</span>
                    <span className="text-base md:text-lg font-black font-oswald text-white uppercase truncate block">Selected by {completedPick.team.name}</span>
                  </div>
                </div>
              ) : isUserTurn && currentTeam ? (
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-3 p-3 md:p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <img src={currentTeam.logoUrl} className="w-8 h-8 md:w-10 md:h-10" alt="" />
                    <div>
                      <span className="block text-[9px] md:text-[10px] font-bold text-emerald-500 uppercase">You are on the clock</span>
                      <span className="text-xs md:text-sm font-bold text-slate-200">Drafting for {currentTeam.name}</span>
                    </div>
                  </div>
                  <Button 
                    fullWidth 
                    className="h-12 md:h-16 text-lg md:text-xl uppercase font-oswald" 
                    onClick={() => onDraft(prospect)}
                  >
                    Draft {prospect.name.split(' ')[1]}
                  </Button>
                </div>
              ) : currentTeam ? (
                <div className="p-3 md:p-4 bg-slate-800 border border-slate-700 rounded-xl text-center">
                  <span className="text-slate-500 font-bold uppercase text-[10px] md:text-xs">Waiting for {currentTeam.name} to draft</span>
                </div>
              ) : (
                <div className="p-3 md:p-4 bg-slate-800 border border-slate-700 rounded-xl text-center">
                   <span className="text-slate-500 font-bold uppercase text-[10px] md:text-xs italic">Available for Selection</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
