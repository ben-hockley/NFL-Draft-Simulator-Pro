
import React, { useState, useEffect } from 'react';
import { Prospect, PlayerStats } from '../types';
import { PROSPECTS } from '../constants';

interface PlayerComparisonProps {
  basePlayer: Prospect;
  onClose: () => void;
  onDraft: (prospect: Prospect) => void;
  isUserTurn?: boolean;
}

export const PlayerComparison: React.FC<PlayerComparisonProps> = ({ 
  basePlayer, 
  onClose, 
  onDraft,
  isUserTurn 
}) => {
  const [targetPlayer, setTargetPlayer] = useState<Prospect | null>(null);
  const [baseStats, setBaseStats] = useState<PlayerStats | null>(null);
  const [targetStats, setTargetStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState({ base: false, target: false });

  // Filter available prospects of the same position
  const candidates = PROSPECTS
    .filter(p => p.position === basePlayer.position && p.id !== basePlayer.id)
    .sort((a, b) => a.rank - b.rank);

  useEffect(() => {
    fetchPlayerData(basePlayer.espnId, 'base');
  }, [basePlayer]);

  useEffect(() => {
    if (targetPlayer) {
      fetchPlayerData(targetPlayer.espnId, 'target');
    }
  }, [targetPlayer]);

  const fetchPlayerData = async (espnId: number, type: 'base' | 'target') => {
    setLoading(prev => ({ ...prev, [type]: true }));
    try {
      const response = await fetch(`https://sports.core.api.espn.com/v2/sports/football/leagues/college-football/seasons/2025/types/3/athletes/${espnId}/statistics/0`);
      if (!response.ok) throw new Error('No stats');
      const data = await response.json();
      const categories = data.splits.categories;
      
      const parsed: PlayerStats = { gamesPlayed: 0 };
      categories.forEach((cat: any) => {
        if (cat.name === 'general') parsed.gamesPlayed = cat.stats.find((s: any) => s.name === 'gamesPlayed')?.value || 0;
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
          parsed.tfl = cat.stats.find((s: any) => s.name === 'tacklesForLoss')?.value;
        }
        if (cat.name === 'defensiveInterceptions') parsed.defInts = cat.stats.find((s: any) => s.name === 'interceptions')?.value;
      });

      if (type === 'base') setBaseStats(parsed);
      else setTargetStats(parsed);
    } catch (err) {
      if (type === 'base') setBaseStats({ gamesPlayed: 0 });
      else setTargetStats({ gamesPlayed: 0 });
    } finally {
      setLoading(prev => ({ ...prev, [type]: false }));
    }
  };

  const getWinnerClass = (val1: any, val2: any, lowerIsBetter = false) => {
    if (val1 === undefined || val2 === undefined) return '';
    const n1 = typeof val1 === 'string' ? parseFloat(val1) : val1;
    const n2 = typeof val2 === 'string' ? parseFloat(val2) : val2;
    if (n1 === n2) return '';
    if (lowerIsBetter) return n1 < n2 ? 'text-emerald-400 font-black' : 'text-slate-500';
    return n1 > n2 ? 'text-emerald-400 font-black' : 'text-slate-500';
  };

  const renderComparisonRow = (label: string, key1: any, key2: any, lowerIsBetter = false) => (
    <div className="grid grid-cols-3 border-b border-slate-800/50 py-3 lg:py-4 px-4">
      <div className={`text-center font-oswald text-sm lg:text-lg ${getWinnerClass(key1, key2, lowerIsBetter)}`}>
        {key1?.toLocaleString() || '--'}
      </div>
      <div className="text-center text-[9px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center">
        {label}
      </div>
      <div className={`text-center font-oswald text-sm lg:text-lg ${getWinnerClass(key2, key1, lowerIsBetter)}`}>
        {key2?.toLocaleString() || '--'}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-2 lg:p-6 bg-slate-950/95 backdrop-blur-xl animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col max-h-[95vh]">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase">Comparison Mode</div>
            <h2 className="text-lg lg:text-2xl font-black font-oswald text-white uppercase tracking-tight">Evaluating {basePlayer.position}s</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Players Top Bar */}
        <div className="grid grid-cols-2 bg-slate-950/50 shrink-0 border-b border-slate-800">
          {/* Base Player */}
          <div className="p-4 lg:p-6 flex flex-col items-center text-center border-r border-slate-800">
            <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full bg-slate-800 overflow-hidden mb-3 border-2 border-slate-700">
              <img src={basePlayer.headshotUrl} className="w-full h-full object-cover" alt="" />
            </div>
            <h3 className="text-base lg:text-xl font-black font-oswald text-white uppercase leading-none">{basePlayer.name}</h3>
            <span className="text-[10px] lg:text-xs font-bold text-emerald-500 uppercase mt-1">Ranked #{basePlayer.rank} Overall</span>
            {isUserTurn && (
              <button 
                onClick={() => onDraft(basePlayer)}
                className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors"
              >
                Draft Player
              </button>
            )}
          </div>

          {/* Target Player Selection */}
          <div className="p-4 lg:p-6 flex flex-col items-center text-center">
            {targetPlayer ? (
              <>
                <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full bg-slate-800 overflow-hidden mb-3 border-2 border-slate-700 relative">
                  <img src={targetPlayer.headshotUrl} className="w-full h-full object-cover" alt="" />
                  <button 
                    onClick={() => setTargetPlayer(null)}
                    className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full hover:scale-110 transition-transform"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
                <h3 className="text-base lg:text-xl font-black font-oswald text-white uppercase leading-none">{targetPlayer.name}</h3>
                <span className="text-[10px] lg:text-xs font-bold text-emerald-500 uppercase mt-1">Ranked #{targetPlayer.rank} Overall</span>
                {isUserTurn && (
                  <button 
                    onClick={() => onDraft(targetPlayer)}
                    className="mt-4 px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors"
                  >
                    Draft Player
                  </button>
                )}
              </>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 lg:w-24 lg:h-24 rounded-full bg-slate-800 border-2 border-dashed border-slate-700 flex items-center justify-center mb-3">
                  <svg className="w-8 h-8 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">Compare against...</p>
                <select 
                  onChange={(e) => setTargetPlayer(candidates.find(c => c.id === e.target.value) || null)}
                  className="w-full max-w-[200px] bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold p-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                >
                  <option value="">Select Prospect</option>
                  {candidates.map(c => (
                    <option key={c.id} value={c.id}>#{c.rank} {c.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Stats Table */}
        <div className="flex-1 overflow-y-auto bg-slate-900/50">
          {!targetPlayer ? (
            <div className="py-20 text-center text-slate-500 px-10">
              <div className="max-w-xs mx-auto">
                <svg className="w-12 h-12 text-slate-800 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                <p className="text-sm font-medium uppercase tracking-widest">Select a second {basePlayer.position} to begin side-by-side analysis</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50">
              {/* Physicals */}
              <div className="bg-slate-800/30 px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Physical Profile</div>
              {renderComparisonRow('Overall Rank', basePlayer.rank, targetPlayer.rank, true)}
              {renderComparisonRow('Height', basePlayer.height, targetPlayer.height)}
              {renderComparisonRow('Weight', basePlayer.weight, targetPlayer.weight)}
              
              {/* Stats Heading */}
              <div className="bg-slate-800/30 px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">2025 Postseason Stats</div>
              {loading.base || loading.target ? (
                <div className="p-10 text-center text-emerald-500 animate-pulse font-bold text-xs uppercase tracking-widest">Synchronizing Live Data...</div>
              ) : (
                <>
                  {renderComparisonRow('Games Played', baseStats?.gamesPlayed, targetStats?.gamesPlayed)}
                  
                  {basePlayer.position === 'QB' && (
                    <>
                      {renderComparisonRow('Passing Yds', baseStats?.passingYards, targetStats?.passingYards)}
                      {renderComparisonRow('Pass TDs', baseStats?.passingTDs, targetStats?.passingTDs)}
                      {renderComparisonRow('INTs', baseStats?.ints, targetStats?.ints, true)}
                      {renderComparisonRow('Completion %', baseStats?.completionPct, targetStats?.completionPct)}
                      {renderComparisonRow('Rush Yds', baseStats?.rushingYards, targetStats?.rushingYards)}
                    </>
                  )}

                  {basePlayer.position === 'RB' && (
                    <>
                      {renderComparisonRow('Rush Yds', baseStats?.rushingYards, targetStats?.rushingYards)}
                      {renderComparisonRow('Rush TDs', baseStats?.rushingTDs, targetStats?.rushingTDs)}
                      {renderComparisonRow('Receptions', baseStats?.receptions, targetStats?.receptions)}
                      {renderComparisonRow('Rec Yds', baseStats?.receivingYards, targetStats?.receivingYards)}
                    </>
                  )}

                  {['WR', 'TE'].includes(basePlayer.position) && (
                    <>
                      {renderComparisonRow('Receptions', baseStats?.receptions, targetStats?.receptions)}
                      {renderComparisonRow('Rec Yds', baseStats?.receivingYards, targetStats?.receivingYards)}
                      {renderComparisonRow('Rec TDs', baseStats?.receivingTDs, targetStats?.receivingTDs)}
                    </>
                  )}

                  {['DL', 'EDGE', 'LB', 'CB', 'S'].includes(basePlayer.position) && (
                    <>
                      {renderComparisonRow('Total Tackles', baseStats?.tackles, targetStats?.tackles)}
                      {renderComparisonRow('Sacks', baseStats?.sacks, targetStats?.sacks)}
                      {renderComparisonRow('Tackles for Loss', baseStats?.tfl, targetStats?.tfl)}
                      {renderComparisonRow('Interceptions', baseStats?.defInts, targetStats?.defInts)}
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 lg:p-6 bg-slate-800/80 border-t border-slate-700 text-center shrink-0">
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Source: Gridiron Pro Analytics Engine v2.6 &bull; Data synced with ESPN
          </p>
        </div>
      </div>
    </div>
  );
};
