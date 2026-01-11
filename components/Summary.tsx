
import React, { useState, useMemo, useRef } from 'react';
import { DraftState, Prospect, Team } from '../types';
import { Button } from './Button';
import { TEAMS } from '../constants';

interface SummaryProps {
  state: DraftState;
  onRestart: () => void;
  onSelectProspect: (prospect: Prospect) => void;
}

type SummaryTab = 'RESULTS' | 'BEST_AVAILABLE' | 'MY_PICKS';

export const Summary: React.FC<SummaryProps> = ({ state, onRestart, onSelectProspect }) => {
  const [activeTab, setActiveTab] = useState<SummaryTab>('RESULTS');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const sortedUserTeams = useMemo(() => 
    [...state.userControlledTeams]
      .map(tid => TEAMS.find(t => t.id === tid)!)
      .sort((a, b) => a.name.localeCompare(b.name)),
    [state.userControlledTeams]
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
      .sort((a, b) => a.rank - b.rank);
  }, [state.prospects, state.picks]);

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
  const selectedTeamData = TEAMS.find(t => t.id === selectedMyPicksTeamId);

  return (
    <div className="h-full w-full flex flex-col p-2 lg:p-6 bg-slate-950 overflow-hidden animate-fadeIn">
      <div className="flex-1 flex flex-col max-w-6xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        
        {/* Compact Header */}
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
                <span className="hidden sm:inline">Download My Picks</span>
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

        {/* Minimal Tab Nav */}
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
            My Picks ({state.userControlledTeams.length})
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

        {/* Main Content Area */}
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
                        return (
                          <button 
                            key={pick.pickNumber} 
                            onClick={() => player && onSelectProspect(player)}
                            className={`flex flex-col p-2 rounded-lg border transition-all text-left group min-h-[70px] relative ${
                              isUserPick 
                                ? 'bg-emerald-500/10 border-emerald-500/40 hover:bg-emerald-500/20' 
                                : 'bg-slate-800/40 border-slate-800/60 hover:border-slate-600'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-[10px] font-black font-oswald text-slate-500">#{pick.pickNumber}</span>
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
                  return (
                    <div 
                      key={pick.pickNumber}
                      onClick={() => player && onSelectProspect(player)}
                      className="flex items-center gap-3 p-3 bg-slate-800/40 border border-slate-800 rounded-xl hover:bg-slate-800/60 cursor-pointer transition-all group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-700 overflow-hidden shrink-0 border border-slate-600 group-hover:border-emerald-500/50">
                        <img src={player?.headshotUrl} className="w-full h-full object-cover" alt="" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black font-oswald text-emerald-500">PICK #{pick.pickNumber}</span>
                          <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 uppercase border border-slate-800">
                            RD {pick.round}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-100 truncate">{player?.name}</h4>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <img src={player?.collegeLogoUrl} className="w-3 h-3 object-contain opacity-70" alt="" />
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-tight">{player?.position} &bull; {player?.college}</span>
                        </div>
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

        {/* Compact Footer CTA */}
        <div className="p-3 lg:p-4 bg-slate-900 border-t border-slate-800 flex justify-center shrink-0">
          <Button 
            variant="primary"
            className="w-full max-w-sm h-10 lg:h-12 text-xs lg:text-sm uppercase font-oswald tracking-[0.2em]" 
            onClick={onRestart}
          >
            Start New Simulation
          </Button>
        </div>
      </div>

      {/* HIDDEN GRAPHIC TEMPLATE - RESTRICTED TO ROUND 1 */}
      <div 
        ref={graphicRef}
        className="absolute top-0 left-[-9999px] w-[800px] bg-slate-950 p-12 text-white font-inter"
        style={{ minHeight: '1300px' }}
      >
        <div className="border-[8px] border-emerald-500 h-full p-8 relative overflow-hidden">
          <header className="mb-