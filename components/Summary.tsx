'use client';

import React, { useState, useMemo, useRef } from 'react';
import { DraftState, Prospect, Team, DraftParticipant } from '../types';
import { PARTICIPANT_COLORS } from '../lib/draftRoom';
import { Button } from './Button';

interface SummaryProps {
  teams: Team[];
  state: DraftState;
  onRestart: () => void;
  onSelectProspect: (prospect: Prospect) => void;
  /** Online-mode participants; enables per-user pick highlighting */
  participants?: DraftParticipant[];
}

type SummaryTab = 'RESULTS' | 'BEST_AVAILABLE' | 'MY_PICKS';

const GRADES = ['F-', 'F', 'F+', 'D-', 'D', 'D+', 'C-', 'C', 'C+', 'B-', 'B', 'B+', 'A-', 'A', 'A+'];

const getGradeColor = (grade: string) => {
  if (grade.startsWith('A')) return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/40';
  if (grade.startsWith('B')) return 'text-blue-400 bg-blue-500/20 border-blue-500/40';
  if (grade.startsWith('C')) return 'text-amber-400 bg-amber-500/20 border-amber-500/40';
  if (grade.startsWith('D')) return 'text-orange-400 bg-orange-500/20 border-orange-500/40';
  return 'text-red-400 bg-red-500/20 border-red-500/40';
};

export const Summary: React.FC<SummaryProps> = ({ teams, state, onRestart, onSelectProspect, participants }) => {
  const [activeTab, setActiveTab] = useState<SummaryTab>('RESULTS');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const sortedUserTeams = useMemo(() => 
    [...state.userControlledTeams]
      .map(tid => teams.find(t => t.id === tid)!)
      .sort((a, b) => a.name.localeCompare(b.name)),
    [state.userControlledTeams, teams]
  );

  const [selectedMyPicksTeamId, setSelectedMyPicksTeamId] = useState<string>(
    sortedUserTeams[0]?.id || ''
  );
  
  const graphicRef = useRef<HTMLDivElement>(null);
  const myPicksGraphicRef = useRef<HTMLDivElement>(null);

  const scopePicks = useMemo(() => state.picks.filter(p => p.round <= state.roundsToSimulate), [state.picks, state.roundsToSimulate]);

  const bestAvailable = useMemo(() => {
    const draftedIds = state.picks.map(p => p.selectedPlayerId).filter(Boolean);
    return state.prospects
      .filter(p => !draftedIds.includes(p.id))
      .filter(p => p.draftYear === 2026)
      .sort((a, b) => a.rank - b.rank);
  }, [state.prospects, state.picks]);

  const calculateGrade = (pickNumber: number, prospect: Prospect, teamNeeds: string[]) => {
    const diff = pickNumber - prospect.rank;
    let baseIndex = 10; // Default B

    if (diff >= 40) baseIndex = 14;      // A+
    else if (diff >= 25) baseIndex = 13; // A
    else if (diff >= 15) baseIndex = 12; // A-
    else if (diff >= 5) baseIndex = 11;  // B+
    else if (diff >= -5) baseIndex = 10; // B
    else if (diff >= -15) baseIndex = 9; // B-
    else if (diff >= -25) baseIndex = 8; // C+
    else if (diff >= -35) baseIndex = 7; // C
    else if (diff >= -45) baseIndex = 6; // C-
    else if (diff >= -55) baseIndex = 5; // D+
    else if (diff >= -65) baseIndex = 4; // D
    else if (diff >= -75) baseIndex = 3; // D-
    else if (diff >= -85) baseIndex = 2; // F+
    else if (diff >= -100) baseIndex = 1;// F
    else baseIndex = 0;                  // F-

    // Boost by one whole grade (3 sub-grades) if fulfilled a need
    if (teamNeeds.includes(prospect.position)) {
      baseIndex = Math.min(GRADES.length - 1, baseIndex + 3);
    }

    return GRADES[baseIndex];
  };

  const myPicksForSelectedTeam = useMemo(() => {
    return scopePicks.filter(p => p.team.id === selectedMyPicksTeamId);
  }, [scopePicks, selectedMyPicksTeamId]);

  const handleDownloadImage = async (ref: React.RefObject<HTMLDivElement | null>, filename: string) => {
    if (!ref.current) return;
    setIsGeneratingImage(true);
    
    try {
      // @ts-ignore
      const canvas = await window.html2canvas(ref.current, {
        useCORS: true,
        backgroundColor: '#0f172a',
        scale: 2,
      });
      
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = filename;
      link.href = image;
      link.click();
    } catch (err) {
      console.error('Error generating draft graphic:', err);
      alert('Failed to generate image.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const firstRoundPicks = state.picks.filter(p => p.round === 1).slice(0, 32);
  const selectedTeamData = teams.find(t => t.id === selectedMyPicksTeamId);

  return (
    <div className="h-full w-full flex flex-col p-2 lg:p-6 bg-slate-950 overflow-hidden animate-fadeIn">
      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        
        <header className="bg-slate-800/50 px-4 py-2 lg:py-4 flex items-center justify-between border-b border-slate-700 shrink-0">
          <div className="flex flex-col">
            <h1 className="text-sm lg:text-2xl font-black font-oswald uppercase tracking-tight text-white leading-none">Draft Summary</h1>
            <span className="text-[8px] lg:text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-0.5">
              {state.roundsToSimulate} Round Simulation Complete
            </span>
          </div>
          
          <div className="flex gap-2">
            {activeTab === 'MY_PICKS' && (
              <Button 
                onClick={() => handleDownloadImage(myPicksGraphicRef, `${selectedMyPicksTeamId}-2026-draft-class.png`)} 
                disabled={isGeneratingImage || !selectedMyPicksTeamId}
                variant="primary"
                className="h-7 lg:h-9 px-3 text-[8px] lg:text-[10px] font-black uppercase tracking-wider"
              >
                <svg className={`w-3 h-3 lg:w-4 lg:h-4 ${isGeneratingImage ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span className="hidden sm:inline">Download User Picks</span>
              </Button>
            )}
            <Button 
              onClick={() => handleDownloadImage(graphicRef, 'nfl-draft-2026-first-round-recap.png')} 
              disabled={isGeneratingImage}
              variant="secondary"
              className="h-7 lg:h-9 px-3 text-[8px] lg:text-[10px] font-black uppercase tracking-wider"
            >
              <svg className={`w-3 h-3 lg:w-4 lg:h-4 ${isGeneratingImage ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span className="hidden sm:inline">{isGeneratingImage ? 'Wait...' : 'R1 Recap'}</span>
            </Button>
          </div>
        </header>

        <div className="flex bg-slate-900/50 border-b border-slate-800 p-0.5 shrink-0">
          <button
            onClick={() => setActiveTab('RESULTS')}
            className={`flex-1 py-1.5 lg:py-2 text-[9px] lg:text-xs font-bold uppercase tracking-widest transition-all rounded-md ${
              activeTab === 'RESULTS' 
                ? 'text-emerald-400 bg-emerald-500/10' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Draft Results
          </button>
          <button
            onClick={() => setActiveTab('MY_PICKS')}
            className={`flex-1 py-1.5 lg:py-2 text-[9px] lg:text-xs font-bold uppercase tracking-widest transition-all rounded-md ${
              activeTab === 'MY_PICKS' 
                ? 'text-emerald-400 bg-emerald-500/10' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            User Picks ({state.userControlledTeams.length})
          </button>
          <button
            onClick={() => setActiveTab('BEST_AVAILABLE')}
            className={`flex-1 py-1.5 lg:py-2 text-[9px] lg:text-xs font-bold uppercase tracking-widest transition-all rounded-md ${
              activeTab === 'BEST_AVAILABLE' 
                ? 'text-emerald-400 bg-emerald-500/10' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            Best Available
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto bg-slate-950/20 p-2 lg:p-4">
          {activeTab === 'RESULTS' ? (
            <div className="space-y-6">
              {[...Array(state.roundsToSimulate)].map((_, i) => {
                const round = i + 1;
                const roundPicks = scopePicks.filter(p => p.round === round);
                if (roundPicks.length === 0) return null;
                return (
                  <div key={round} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black font-oswald uppercase tracking-[0.2em] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        Round {round}
                      </span>
                      <div className="h-px flex-1 bg-slate-800"></div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1.5 lg:gap-2">
                      {roundPicks.map((pick) => {
                        const player = state.prospects.find(p => p.id === pick.selectedPlayerId);
                        const isUserPick = state.userControlledTeams.includes(pick.team.id);
                        // Online mode: find participant who actually made this pick
                        const pickParticipant = participants?.find(p => p.id === pick.madeByParticipantId);
                        const pickColor = pickParticipant ? PARTICIPANT_COLORS[pickParticipant.colorSlot] : null;
                        return (
                          <button 
                            key={pick.pickNumber} 
                            onClick={() => player && onSelectProspect(player)}
                            className={`flex flex-col p-2 rounded-lg border transition-all text-left group min-h-[70px] relative ${
                              pickColor
                                ? 'hover:brightness-110'
                                : isUserPick 
                                  ? 'bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/20' 
                                  : 'bg-slate-800/40 border-slate-800/60 hover:border-slate-600'
                            }`}
                            style={pickColor ? {
                              backgroundColor: `${pickColor}12`,
                              borderColor: `${pickColor}50`,
                            } : undefined}
                          >
                            <div className="flex justify-between items-center mb-1 gap-1">
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-[10px] font-black font-oswald text-slate-500">#{pick.pickNumber}</span>
                                {pickParticipant && (
                                  <span
                                    className="text-[7px] font-black px-1 py-px rounded border shrink-0 whitespace-nowrap"
                                    style={{
                                      color: pickColor!,
                                      borderColor: `${pickColor}50`,
                                      backgroundColor: `${pickColor}18`,
                                    }}
                                  >
                                    {pickParticipant.displayName}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-1">
                                 {pick.isTraded && (
                                    <svg className="w-2.5 h-2.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <title>Traded Pick</title>
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                                    </svg>
                                 )}
                                 <img src={pick.team.logoUrl} alt="" className="w-4 h-4 object-contain" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] font-bold text-slate-100 truncate block leading-tight">
                                {player?.name || 'TBD'}
                              </span>
                              <span className="text-[8px] font-black text-emerald-500/80 uppercase">
                                {player?.position}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : activeTab === 'MY_PICKS' ? (
            <div className="flex flex-col h-full">
              {state.userControlledTeams.length > 1 && (
                <div className="mb-4 flex items-center gap-3 bg-slate-800/30 p-2 rounded-xl border border-slate-800 w-fit">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">Select Team:</span>
                  <select 
                    value={selectedMyPicksTeamId}
                    onChange={(e) => setSelectedMyPicksTeamId(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-bold py-1 px-3 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 uppercase"
                  >
                    {sortedUserTeams.map(team => {
                      return <option key={team.id} value={team.id}>{team.name}</option>;
                    })}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 content-start">
                {myPicksForSelectedTeam.map((pick) => {
                  const player = state.prospects.find(p => p.id === pick.selectedPlayerId);
                  if (!player) return null;
                  const grade = calculateGrade(pick.pickNumber, player, pick.team.needs);
                  const gradeClass = getGradeColor(grade);

                  return (
                    <div 
                      key={pick.pickNumber}
                      onClick={() => onSelectProspect(player)}
                      className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-800 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-all group relative"
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-700 overflow-hidden shrink-0 border border-slate-600 group-hover:border-emerald-500/50">
                        <img src={player.headshotUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black font-oswald text-emerald-500">PICK #{pick.pickNumber}</span>
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 uppercase border border-slate-800">
                            RD {pick.round}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-100 truncate">{player.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <img src={player.collegeLogoUrl} className="w-3 h-3 object-contain opacity-70" alt="" />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">{player.position} &bull; {player.college}</span>
                        </div>
                      </div>
                      <div className={`w-8 h-8 rounded-lg border flex items-center justify-center font-black font-oswald text-sm shrink-0 ${gradeClass}`}>
                        {grade}
                      </div>
                    </div>
                  );
                })}
              </div>
              {myPicksForSelectedTeam.length === 0 && (
                <div className="flex-1 flex items-center justify-center py-20 text-slate-600 uppercase font-black tracking-widest text-xs">
                  No picks recorded for this team
                </div>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 content-start overflow-y-auto pr-1 scrollbar-thin">
              {bestAvailable.slice(0, 100).map((player) => (
                <button 
                  key={player.id} 
                  onClick={() => onSelectProspect(player)}
                  className="flex items-center gap-2 p-2 rounded-lg border border-slate-800/50 bg-slate-800/30 transition-all text-left group hover:border-slate-600 hover:bg-slate-800/50"
                >
                  <span className="text-[10px] font-black font-oswald text-slate-500 w-4">#{player.rank}</span>
                  <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-700 shrink-0">
                    <img src={player.headshotUrl} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] font-bold text-slate-100 truncate block">{player.name}</span>
                    <span className="text-[8px] font-black text-emerald-500 uppercase">{player.position}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 lg:p-4 bg-slate-900 border-t border-slate-800 flex justify-center shrink-0">
          <Button 
            variant="primary"
            className="w-full max-w-sm h-10 lg:h-12 text-xs lg:text-sm uppercase font-oswald tracking-[0.2em]" 
            onClick={onRestart}
          >
            Back to home
          </Button>
        </div>
      </div>

      <div 
        ref={graphicRef}
        className="absolute top-0 left-[-9999px] w-[1000px] bg-slate-950 p-12 text-white font-inter"
      >
        <div className="border-[12px] border-emerald-500 h-full p-10 relative overflow-hidden bg-slate-950">
          <header className="mb-10 text-center border-b-2 border-slate-800 pb-8">
            <h2 className="text-5xl font-black font-oswald text-emerald-500 uppercase tracking-tighter mb-2">2026 NFL DRAFT</h2>
            <p className="text-2xl font-bold text-slate-400 uppercase tracking-[0.3em]">Round 1 Official Results</p>
          </header>
          
          <div className="grid grid-cols-4 gap-4">
            {firstRoundPicks.map((pick) => {
              const player = state.prospects.find(p => p.id === pick.selectedPlayerId);
              return (
                <div key={pick.pickNumber} className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-black text-slate-500">PICK #{pick.pickNumber}</span>
                    <img src={pick.team.logoUrl} className="w-6 h-6 object-contain" alt="" />
                  </div>
                  <h3 className="text-sm font-black text-white truncate leading-tight uppercase">{player?.name || '---'}</h3>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[10px] font-bold text-emerald-400">{player?.position || '---'}</span>
                    <span className="text-[10px] font-medium text-slate-500 truncate max-w-[80px]">{player?.college || '---'}</span>
                  </div>
                </div>
              );
            })}
          </div>
          
          <footer className="mt-12 text-center text-slate-600 font-bold uppercase tracking-widest text-sm">
            SUNDAYSCOUTS.COM | SIMULATION COMPLETE
          </footer>
        </div>
      </div>

      <div 
        ref={myPicksGraphicRef}
        className="absolute top-0 left-[-9999px] w-[1000px] bg-slate-950 p-12 text-white font-inter"
      >
        <div className="border-[12px] border-emerald-500 h-full p-10 relative overflow-hidden bg-slate-950">
          <header className="mb-10 flex items-center justify-between border-b-2 border-slate-800 pb-8">
            <div className="flex items-center gap-6">
              <img src={selectedTeamData?.logoUrl} className="w-24 h-24 object-contain" alt="" />
              <div>
                <h2 className="text-5xl font-black font-oswald text-white uppercase tracking-tighter">{selectedTeamData?.name}</h2>
                <p className="text-2xl font-bold text-emerald-500 uppercase tracking-[0.3em]">2026 Official Draft Class</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-4xl font-black font-oswald text-slate-800">2026</span>
            </div>
          </header>
          
          <div className="grid grid-cols-2 gap-6">
            {myPicksForSelectedTeam.map((pick) => {
              const player = state.prospects.find(p => p.id === pick.selectedPlayerId);
              if (!player) return null;
              const grade = calculateGrade(pick.pickNumber, player, pick.team.needs);
              const gradeClass = getGradeColor(grade);

              return (
                <div key={pick.pickNumber} className="bg-slate-900 p-6 rounded-2xl border border-slate-800 flex items-center gap-6 relative">
                   <div className="w-20 h-20 rounded-full bg-slate-800 overflow-hidden border-2 border-emerald-500/30">
                      <img src={player.headshotUrl} className="w-full h-full object-cover" alt="" />
                   </div>
                   <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-black text-emerald-500">RD {pick.round} &bull; PICK {pick.pickNumber}</span>
                      </div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">{player.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-sm font-bold text-slate-400 uppercase">{player.position}</span>
                        <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                        <span className="text-sm font-medium text-slate-500 uppercase">{player.college}</span>
                      </div>
                   </div>
                   <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center font-black font-oswald text-2xl shrink-0 ${gradeClass}`}>
                      {grade}
                   </div>
                </div>
              );
            })}
          </div>
          
          {myPicksForSelectedTeam.length === 0 && (
            <div className="py-20 text-center text-slate-500 text-2xl font-black uppercase tracking-widest">
              No Selections Made
            </div>
          )}

          <footer className="mt-12 text-center text-slate-600 font-bold uppercase tracking-widest text-sm border-t border-slate-800 pt-8">
            NFL DRAFT 2026 | SUNDAYSCOUTS.COM SIMULATOR
          </footer>
        </div>
      </div>
    </div>
  );
};
