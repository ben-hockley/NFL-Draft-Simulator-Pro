'use client';

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
  showDraftYear?: boolean;
}

type ProfileTab = 'SCOUTING' | 'STATS' | 'BIO' | 'COMBINE';

const POSITION_FULL_NAMES: Record<string, string> = {
  'QB': 'Quarterback',
  'RB': 'Running Back',
  'WR': 'Wide Receiver',
  'TE': 'Tight End',
  'OT': 'Offensive Tackle',
  'OG': 'Offensive Guard',
  'C': 'Center',
  'DE': 'Defensive End',
  'DT': 'Defensive Tackle',
  'LB': 'Linebacker',
  'CB': 'Cornerback',
  'S': 'Safety',
  'K': 'Kicker',
  'P': 'Punter',
  'LS': 'Long Snapper',
  'IOL': 'Interior Offensive Line',
  'DL': 'Defensive Line',
  'EDGE': 'Edge Rusher'
};

export const PlayerDetail: React.FC<PlayerDetailProps> = ({ 
  prospect, 
  allProspects,
  currentTeam, 
  isUserTurn, 
  onDraft,
  onClose,
  onCompare,
  completedPick,
  showDraftYear
}) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('SCOUTING');
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [physicalInfo, setPhysicalInfo] = useState<{ height: string; weight: string } | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [loadingPhysical, setLoadingPhysical] = useState(false);

  const isOffensiveLineman = useMemo(() => {
    return prospect ? ['OT', 'IOL', 'OG', 'C'].includes(prospect.position) : false;
  }, [prospect]);

  const fullPositionName = useMemo(() => {
    if (!prospect) return '';
    return POSITION_FULL_NAMES[prospect.position] || prospect.position;
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
      const parsedStats: PlayerStats = { gamesPlayed: 0 };

      categories.forEach((cat: any) => {
        if (cat.name === 'general') {
          const gp = cat.stats.find((s: any) => s.name === 'gamesPlayed');
          if (gp) parsedStats.gamesPlayed = gp.value;
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

  const formatBroadJump = (val: number | null | undefined): string => {
    if (!val) return 'N/A';
    const s = String(val);
    // Format 6010 = 6'1", 10020 = 10'2"
    // Assuming FIIE format where last digit is eights? Or just checking pattern from prompt
    // "6010 = 6ft1". Let's assume FIIE (Feet, Inches, Eighths) or FII (Feet, Inches) + trailing zero
    // Safe bet: Slice from end
    // Last digit seems to be eighths or ignored for now based on '6ft1'
    if (s.length >= 4) {
      const inches = s.slice(-3, -1);
      const feet = s.slice(0, -3);
      return `${feet}'${parseInt(inches)}"`;
    }
    return 'N/A';
  };

  if (!prospect) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="bg-[#0f172a] border-y sm:border border-slate-800 w-full max-w-5xl rounded-none sm:rounded-3xl overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.6)] flex flex-col h-full sm:max-h-[95vh] relative">
        
        {/* Cinematic Hero Header */}
        <div className="relative h-56 sm:h-72 lg:h-80 shrink-0 bg-[#1e293b] overflow-hidden">
          {/* Hero Background Pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_#10b981_0%,_transparent_70%)] opacity-30"></div>
             <div className="w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg, #0f172a 25%, transparent 25%, transparent 75%, #0f172a 75%, #0f172a), linear-gradient(45deg, #0f172a 25%, transparent 25%, transparent 75%, #0f172a 75%, #0f172a)', backgroundSize: '40px 40px', backgroundPosition: '0 0, 20px 20px' }}></div>
          </div>

          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/40 to-transparent"></div>
          
          <div className="absolute inset-0 flex flex-row items-end px-4 sm:px-6 pb-4 sm:pb-6 gap-3 sm:gap-6">
            {/* Player Headshot */}
            <div className="w-24 h-24 sm:w-40 lg:w-56 sm:h-40 lg:h-56 bg-slate-800/80 rounded-xl sm:rounded-2xl overflow-hidden border-2 sm:border-4 border-slate-700 shadow-2xl shrink-0 group">
              <img src={prospect.headshotUrl} className="w-full h-full object-cover object-top drop-shadow-2xl transition-transform duration-700 group-hover:scale-105" alt={prospect.name} />
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0 pb-1">
              <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2 flex-wrap">
                <span className="bg-emerald-500 text-white text-[8px] sm:text-[10px] lg:text-xs font-black px-2 sm:px-3 py-0.5 sm:py-1 rounded-full shadow-lg uppercase tracking-widest">
                  Rank #{prospect.rank}
                </span>
                <span className="bg-slate-700/80 text-slate-200 text-[8px] sm:text-[10px] lg:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-widest">
                  #{positionRank} {fullPositionName}
                </span>
                {showDraftYear && (
                   <span className="bg-slate-700/80 text-slate-200 text-[8px] sm:text-[10px] lg:text-xs font-bold px-2 sm:px-3 py-0.5 sm:py-1 rounded-full uppercase tracking-widest border border-slate-600">
                    {prospect.draftYear} Draft
                  </span>
                )}
              </div>
              <h1 className="text-xl sm:text-3xl lg:text-6xl font-black font-oswald text-white uppercase tracking-tighter leading-none mb-1 sm:mb-2 truncate">
                {prospect.name}
              </h1>
              <div className="flex items-center gap-2 sm:gap-4 text-emerald-400 font-bold uppercase tracking-[0.1em] sm:tracking-[0.2em] text-[10px] sm:text-xs lg:text-sm mb-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <img src={prospect.collegeLogoUrl} className="w-4 h-4 sm:w-6 sm:h-6 object-contain" alt="" />
                  <span className="truncate max-w-[100px] sm:max-w-none">{prospect.college}</span>
                </div>
                <span className="w-1 h-1 rounded-full bg-slate-600"></span>
                <span>{fullPositionName}</span>
              </div>

              {/* Player Badges - Tags with Emojis and Text */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-2">
                 {prospect.recruitingStars === 5 && (
                   <div className="flex items-center gap-1.5 px-2 py-0.5 sm:py-1 bg-amber-500/10 border border-amber-500/30 rounded-md shadow-sm">
                      <span className="text-[10px] sm:text-xs">⭐</span>
                      <span className="text-[7px] sm:text-[9px] font-black text-amber-500 uppercase tracking-widest">5-Star Recruit</span>
                   </div>
                 )}
                 {prospect.allAmerican && (
                   <div className="flex items-center gap-1.5 px-2 py-0.5 sm:py-1 bg-blue-500/10 border border-blue-500/30 rounded-md shadow-sm">
                      <span className="text-[10px] sm:text-xs">🛡️</span>
                      <span className="text-[7px] sm:text-[9px] font-black text-blue-400 uppercase tracking-widest">All-American</span>
                   </div>
                 )}
                 {prospect.nflBloodline && (
                   <div className="flex items-center gap-1.5 px-2 py-0.5 sm:py-1 bg-slate-400/10 border border-slate-400/30 rounded-md shadow-sm">
                      <span className="text-[10px] sm:text-xs">🧬</span>
                      <span className="text-[7px] sm:text-[9px] font-black text-slate-200 uppercase tracking-widest">NFL Bloodline</span>
                   </div>
                 )}
                 {prospect.freaksList && (
                   <div className="flex items-center gap-1.5 px-2 py-0.5 sm:py-1 bg-emerald-500/10 border border-emerald-500/30 rounded-md shadow-sm">
                      <span className="text-[10px] sm:text-xs">👽</span>
                      <span className="text-[7px] sm:text-[9px] font-black text-emerald-400 uppercase tracking-widest">Freaks List</span>
                   </div>
                 )}
              </div>
            </div>
          </div>

          <button onClick={onClose} className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 rounded-full bg-black/40 hover:bg-black/60 text-white transition-all z-20 backdrop-blur-md">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Vitals Bar */}
        <div className="bg-[#1e293b]/50 border-b border-slate-800 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex gap-4 sm:gap-12 flex-1 sm:flex-none">
            <div className="text-center flex-1 sm:flex-none">
              <span className="block text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 sm:mb-1">Height</span>
              <span className="text-sm sm:text-xl font-black font-oswald text-white uppercase">{physicalInfo?.height || '--'}</span>
            </div>
            <div className="text-center flex-1 sm:flex-none">
              <span className="block text-[8px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5 sm:mb-1">Weight</span>
              <span className="text-sm sm:text-xl font-black font-oswald text-white uppercase">{physicalInfo?.weight || '--'}</span>
            </div>
            {prospect.nflComparison && (
              <div className="text-center hidden sm:block">
                <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">NFL Comp</span>
                <span className="text-sm sm:text-xl font-black font-oswald text-emerald-400 uppercase">{prospect.nflComparison}</span>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            {onCompare && !completedPick && (
              <Button onClick={onCompare} variant="ghost" className="h-8 sm:h-9 px-3 sm:px-4 text-[8px] sm:text-[10px] uppercase font-black tracking-widest border border-slate-700">
                <svg className="w-3.5 h-3.5 sm:w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2-2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <span className="hidden sm:inline">Compare</span>
              </Button>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex px-2 sm:px-6 bg-[#0f172a] border-b border-slate-800 shrink-0 overflow-x-auto no-scrollbar scrollbar-none">
          <button 
            onClick={() => setActiveTab('SCOUTING')}
            className={`px-3 sm:px-4 py-2 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all border-b-2 whitespace-nowrap ${activeTab === 'SCOUTING' ? 'text-emerald-400 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
          >
            Scouting Report
          </button>
          {!isOffensiveLineman && (
            <button 
              onClick={() => setActiveTab('STATS')}
              className={`px-3 sm:px-4 py-2 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all border-b-2 whitespace-nowrap ${activeTab === 'STATS' ? 'text-emerald-400 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
            >
              Performance
            </button>
          )}
          <button 
            onClick={() => setActiveTab('COMBINE')}
            className={`px-3 sm:px-4 py-2 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all border-b-2 whitespace-nowrap ${activeTab === 'COMBINE' ? 'text-emerald-400 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
          >
            Combine Stats
          </button>
          <button 
            onClick={() => setActiveTab('BIO')}
            className={`px-3 sm:px-4 py-2 sm:py-3 text-[9px] sm:text-[10px] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] transition-all border-b-2 whitespace-nowrap ${activeTab === 'BIO' ? 'text-emerald-400 border-emerald-500' : 'text-slate-500 border-transparent hover:text-slate-300'}`}
          >
            Background
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-thin scrollbar-thumb-slate-700 bg-slate-900/10">
          {activeTab === 'SCOUTING' && (
            <div className="space-y-6 sm:space-y-8 animate-fadeIn">
              <div className="max-w-3xl">
                <h3 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 sm:mb-4">Play Style Summary</h3>
                <p className="text-lg sm:text-2xl font-bold text-slate-100 leading-relaxed font-oswald italic uppercase">
                  "{prospect.summary || "Summary report currently under analysis."}"
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8">
                <div className="bg-slate-900/50 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h3 className="text-[8px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    Core Strengths
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {prospect.strengths?.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-slate-300">
                        <svg className="w-3.5 h-3.5 sm:w-4 h-4 text-emerald-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                        {s}
                      </li>
                    )) || <li className="text-slate-600 italic">Data pending.</li>}
                  </ul>
                </div>

                <div className="bg-slate-900/50 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-6">
                  <h3 className="text-[8px] sm:text-[10px] font-black text-red-500 uppercase tracking-widest mb-3 sm:mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                    Areas for Improvement
                  </h3>
                  <ul className="space-y-2 sm:space-y-3">
                    {prospect.weaknesses?.map((w, i) => (
                      <li key={i} className="flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-slate-300">
                        <svg className="w-3.5 h-3.5 sm:w-4 h-4 text-red-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                        {w}
                      </li>
                    )) || <li className="text-slate-600 italic">Data pending.</li>}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'STATS' && !isOffensiveLineman && (
            <div className="animate-fadeIn">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest">2025/26 Season Statistics</h3>
                {loadingStats && <div className="text-emerald-500 text-[8px] sm:text-[10px] font-bold uppercase animate-pulse">Live Syncing...</div>}
              </div>
              
              {!stats || stats.gamesPlayed === 0 ? (
                <div className="py-12 sm:py-20 text-center bg-slate-900/50 rounded-2xl sm:rounded-3xl border border-slate-800">
                   <p className="text-slate-500 text-xs sm:text-sm uppercase tracking-widest font-bold px-4">No verified performance data found.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                  <StatCard label="GP" value={stats.gamesPlayed} />
                  {prospect.position === 'QB' && (
                    <>
                      <StatCard label="Passing Yards" value={stats.passingYards?.toLocaleString()} />
                      <StatCard label="TD / INT" value={`${stats.passingTDs || 0}/${stats.ints || 0}`} />
                      <StatCard label="CMP %" value={stats.completionPct} />
                      <StatCard label="Rushing Yards" value={stats.rushingYards?.toLocaleString()} />
                    </>
                  )}
                  {prospect.position === 'RB' && (
                    <>
                      <StatCard label="Rush Yds" value={stats.rushingYards?.toLocaleString()} />
                      <StatCard label="Rush TD" value={stats.rushingTDs} />
                      <StatCard label="Rec Yds" value={stats.receivingYards?.toLocaleString()} />
                      <StatCard label="Rec TD" value={stats.receivingTDs} />
                    </>
                  )}
                  {['WR', 'TE'].includes(prospect.position) && (
                    <>
                      <StatCard label="Receptions" value={stats.receptions} />
                      <StatCard label="Rec Yards" value={stats.receivingYards?.toLocaleString()} />
                      <StatCard label="Rec TD" value={stats.receivingTDs} />
                    </>
                  )}
                  {['DL', 'EDGE', 'LB', 'CB', 'S'].includes(prospect.position) && (
                    <>
                      <StatCard label="Total Tackles" value={stats.tackles} />
                      <StatCard label="Sacks" value={stats.sacks} />
                      <StatCard label="INT" value={stats.defInts} />
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'COMBINE' && (
            <div className="animate-fadeIn">
              <h3 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4 sm:mb-6">Official Combine Results</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <CombineCard 
                  label="40 Yard Dash" 
                  value={prospect.combine?.fortyYardDash ? `${prospect.combine.fortyYardDash}s` : 'N/A'}
                  icon={<svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                />
                <CombineCard 
                  label="10 Yard Split" 
                  value={prospect.combine?.tenYardSplit ? `${prospect.combine.tenYardSplit}s` : 'N/A'}
                  icon={<svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                />
                <CombineCard 
                  label="Vertical Jump" 
                  value={prospect.combine?.verticalJump ? `${prospect.combine.verticalJump}"` : 'N/A'}
                  icon={<svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>}
                />
                <CombineCard 
                  label="Broad Jump" 
                  value={formatBroadJump(prospect.combine?.broadJump)}
                  icon={<svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>}
                />
                <CombineCard 
                  label="3 Cone Drill" 
                  value={prospect.combine?.threeConeDrill ? `${prospect.combine.threeConeDrill}s` : 'N/A'}
                  icon={<svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}
                />
                <CombineCard 
                  label="20 Yard Shuttle" 
                  value={prospect.combine?.twentyYardShuttle ? `${prospect.combine.twentyYardShuttle}s` : 'N/A'}
                  icon={<svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>}
                />
                <CombineCard 
                  label="Bench Press" 
                  value={prospect.combine?.benchPress ? `${prospect.combine.benchPress} Reps` : 'N/A'}
                  icon={<svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>}
                />
              </div>
            </div>
          )}

          {activeTab === 'BIO' && (
            <div className="space-y-6 sm:space-y-8 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                   <h3 className="text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3 sm:mb-4">College Career & Biography</h3>
                   <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                     {prospect.bio || "Career history and biography details are pending update from our scouting department."}
                   </p>
                </div>
                <div className="space-y-4 sm:space-y-6">
                   <div className="bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-4 sm:p-5">
                      <h4 className="text-[8px] sm:text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-3">Recruiting Data</h4>
                      <div className="flex flex-col gap-3 sm:gap-4">
                        {prospect.recruitingStars !== null && (
                          <div>
                            <span className="block text-[8px] sm:text-[9px] font-bold text-slate-600 uppercase mb-1">Star Rating</span>
                            <div className="flex gap-0.5 sm:gap-1 text-amber-500">
                              {[...Array(5)].map((_, i) => (
                                <svg key={i} className={`w-3.5 h-3.5 sm:w-4 h-4 ${i < (prospect.recruitingStars || 0) ? 'fill-current' : 'text-slate-800'}`} viewBox="0 0 20 20">
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                          </div>
                        )}
                        {prospect.link247 && (
                          <a href={prospect.link247} target="_blank" rel="noreferrer" className="text-[8px] sm:text-[10px] font-black text-emerald-400 bg-emerald-500/10 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg border border-emerald-500/20 hover:bg-emerald-500/20 text-center transition-all">
                            247Sports Profile
                          </a>
                        )}
                      </div>
                   </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="bg-[#0f172a] border-t border-slate-800 p-3 sm:p-4 shrink-0">
          {completedPick ? (
            <div className="flex items-center gap-3 sm:gap-4 bg-slate-900 border border-slate-800 rounded-xl sm:rounded-2xl p-3 sm:p-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-800 rounded-lg sm:rounded-xl flex items-center justify-center p-2">
                <img src={completedPick.team.logoUrl} className="max-w-full max-h-full" alt="" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-[8px] sm:text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">DRAFTED AT PICK #{completedPick.pickNumber}</span>
                <span className="text-base sm:text-xl font-black font-oswald text-white uppercase tracking-tight truncate block">SELECTED BY {completedPick.team.name}</span>
              </div>
            </div>
          ) : isUserTurn && currentTeam ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
               <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl sm:rounded-2xl px-4 sm:px-5 py-2 sm:py-3 flex-1">
                  <img src={currentTeam.logoUrl} className="w-6 h-6 sm:w-8 sm:h-8" alt="" />
                  <div className="min-w-0">
                    <span className="block text-[8px] sm:text-[9px] font-black text-emerald-500 uppercase tracking-widest leading-none">On the Clock</span>
                    <span className="text-xs sm:text-sm font-bold text-slate-100 truncate block">{currentTeam.nickname}</span>
                  </div>
               </div>
               <Button onClick={() => onDraft(prospect)} className="h-12 sm:h-14 px-8 sm:px-10 text-lg sm:text-xl uppercase font-oswald tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98]">
                 Draft Prospect
               </Button>
            </div>
          ) : (
            <div className="py-2 sm:py-4 text-center">
               <span className="text-slate-500 font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] italic">Available for Selection</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: any }> = ({ label, value }) => (
  <div className="bg-slate-900 border border-slate-800 p-2 sm:p-4 rounded-xl sm:rounded-2xl text-center group hover:border-emerald-500/30 transition-all">
    <span className="block text-[7px] sm:text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5 sm:mb-1 group-hover:text-emerald-500/70 truncate px-1">{label}</span>
    <span className="text-sm sm:text-2xl font-black font-oswald text-white uppercase tracking-tight">{value ?? '--'}</span>
  </div>
);

const CombineCard: React.FC<{ label: string; value: any; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex flex-col items-center text-center gap-2 group hover:border-emerald-500/40 hover:bg-slate-800 transition-all">
    <div className="p-2 rounded-full bg-slate-800 border border-slate-700 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</span>
      <span className="text-xl font-black font-oswald text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">
        {value}
      </span>
    </div>
  </div>
);
