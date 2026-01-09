
import React, { useState, useMemo, useRef } from 'react';
import { DraftState, Prospect } from '../types';
import { Button } from './Button';

interface SummaryProps {
  state: DraftState;
  onRestart: () => void;
  onSelectProspect: (prospect: Prospect) => void;
}

type SummaryTab = 'RESULTS' | 'BEST_AVAILABLE';

export const Summary: React.FC<SummaryProps> = ({ state, onRestart, onSelectProspect }) => {
  const [activeTab, setActiveTab] = useState<SummaryTab>('RESULTS');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const graphicRef = useRef<HTMLDivElement>(null);

  const scopePicks = useMemo(() => state.picks.filter(p => p.round <= state.roundsToSimulate), [state.picks, state.roundsToSimulate]);

  const bestAvailable = useMemo(() => {
    const draftedIds = state.picks.map(p => p.selectedPlayerId).filter(Boolean);
    return state.prospects
      .filter(p => !draftedIds.includes(p.id))
      .sort((a, b) => a.rank - b.rank);
  }, [state.prospects, state.picks]);

  const handleDownloadImage = async () => {
    if (!graphicRef.current) return;
    setIsGeneratingImage(true);
    
    try {
      // @ts-ignore
      const canvas = await window.html2canvas(graphicRef.current, {
        useCORS: true,
        backgroundColor: '#0f172a',
        scale: 2,
      });
      
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = 'nfl-draft-2026-first-round-recap.png';
      link.href = image;
      link.click();
    } catch (err) {
      console.error('Error generating draft graphic:', err);
      alert('Failed to generate image.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  // Only the first 32 picks for the graphic
  const firstRoundPicks = state.picks.filter(p => p.round === 1).slice(0, 32);

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
          
          <Button 
            onClick={handleDownloadImage} 
            disabled={isGeneratingImage}
            variant="secondary"
            className="h-7 lg:h-9 px-3 text-[8px] lg:text-[10px] font-black uppercase tracking-wider"
          >
            <svg className={`w-3 h-3 lg:w-4 lg:h-4 ${isGeneratingImage ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span className="hidden sm:inline">{isGeneratingImage ? 'Wait...' : 'Download R1 Recap'}</span>
          </Button>
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
            Draft Results ({scopePicks.length})
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

        {/* Main Content Grid - Viewport Locked */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-slate-950/20 p-2 lg:p-4">
          {activeTab === 'RESULTS' ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-1.5 lg:gap-2 content-start">
              {scopePicks.map((pick) => {
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
                            /* Fix: Remove title prop from svg and use title tag for accessibility */
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
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <header className="mb-12 border-b-2 border-emerald-500/50 pb-8 flex justify-between items-end">
            <div>
              <h1 className="text-6xl font-black font-oswald italic uppercase tracking-tighter text-emerald-500">2026 DRAFT</h1>
              <h2 className="text-3xl font-bold font-oswald uppercase text-slate-100 tracking-widest mt-1">First Round Results</h2>
            </div>
            <div className="text-right">
              <span className="text-emerald-500 font-black text-xl font-oswald">GRIDIRON PRO</span>
              <div className="text-slate-500 text-xs font-bold tracking-widest uppercase">Simulation Engine</div>
            </div>
          </header>
          <div className="grid grid-cols-2 gap-x-12 gap-y-3">
            {firstRoundPicks.map((pick) => {
              const player = state.prospects.find(p => p.id === pick.selectedPlayerId);
              return (
                <div key={pick.pickNumber} className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-3 rounded-xl">
                  <span className="text-xl font-black font-oswald text-emerald-500 w-8">#{pick.pickNumber}</span>
                  <div className="w-8 h-8 flex-shrink-0 relative">
                    <img src={pick.team.logoUrl} className="w-full h-full object-contain" alt="" />
                    {pick.isTraded && (
                       <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-0.5 border border-slate-900">
                          <svg className="w-1.5 h-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/></svg>
                       </div>
                    )}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="text-xs font-bold text-slate-100 truncate uppercase tracking-tight">{player?.name || 'TBD'}</div>
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-black text-emerald-400 uppercase">{player?.position}</span>
                      <span className="text-[9px] text-slate-500 font-bold uppercase truncate">{player?.college}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <footer className="mt-12 pt-8 border-t border-slate-800 flex justify-center items-center gap-4 opacity-50">
             <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Official Simulation Recap &bull; Round 1 Results Only</div>
          </footer>
        </div>
      </div>
    </div>
  );
};
