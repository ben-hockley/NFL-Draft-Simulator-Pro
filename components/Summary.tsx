
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
        scale: 2, // High quality
      });
      
      const image = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = 'nfl-draft-2026-recap.png';
      link.href = image;
      link.click();
    } catch (err) {
      console.error('Error generating draft graphic:', err);
      alert('Failed to generate image. Some external logos might be blocking cross-origin access.');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <header className="bg-slate-800 p-8 text-center border-b border-slate-700">
          <div className="inline-block px-4 py-1 bg-emerald-500 text-white text-[10px] font-black uppercase rounded-full mb-4">
            Official Results
          </div>
          <h1 className="text-4xl font-black font-oswald uppercase tracking-tight text-white">Draft Summary</h1>
          <p className="text-slate-400 mt-2">The 2026 NFL First Round is officially complete.</p>
          
          <div className="mt-6 flex justify-center">
            <Button 
              onClick={handleDownloadImage} 
              disabled={isGeneratingImage}
              variant="secondary"
              className="h-10 text-xs font-bold uppercase tracking-wider"
            >
              <svg className={`w-4 h-4 ${isGeneratingImage ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              {isGeneratingImage ? 'Generating Graphic...' : 'Download Draft Graphic'}
            </Button>
          </div>
        </header>

        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex gap-4 mb-8 border-b border-slate-800 p-1">
            <button
              onClick={() => setActiveTab('RESULTS')}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-all rounded-t-lg border-b-2 ${
                activeTab === 'RESULTS' 
                  ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5' 
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              Draft Results
            </button>
            <button
              onClick={() => setActiveTab('BEST_AVAILABLE')}
              className={`flex-1 py-3 text-sm font-bold uppercase tracking-widest transition-all rounded-t-lg border-b-2 ${
                activeTab === 'BEST_AVAILABLE' 
                  ? 'text-emerald-400 border-emerald-500 bg-emerald-500/5' 
                  : 'text-slate-500 border-transparent hover:text-slate-300'
              }`}
            >
              Best Available
            </button>
          </div>

          <div className="grid gap-2">
            {activeTab === 'RESULTS' ? (
              state.picks.map((pick) => {
                const player = state.prospects.find(p => p.id === pick.selectedPlayerId);
                const isUserPick = state.userControlledTeams.includes(pick.team.id);
                
                return (
                  <button 
                    key={pick.pickNumber} 
                    onClick={() => player && onSelectProspect(player)}
                    className={`flex items-center gap-6 p-4 rounded-xl border transition-all text-left group hover:scale-[1.01] ${
                      isUserPick ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50' : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                    }`}
                  >
                    <span className="w-10 text-xl font-oswald font-black text-slate-500 group-hover:text-emerald-500 transition-colors">#{pick.pickNumber}</span>
                    <div className="w-10 h-10 flex-shrink-0">
                      <img src={pick.team.logoUrl} alt="" className="w-full h-full object-contain" />
                    </div>
                    <div className="flex-1">
                      <span className="block text-[10px] font-bold text-slate-500 uppercase">{pick.team.name}</span>
                      <span className="text-lg font-bold text-slate-100 group-hover:text-white">{player?.name}</span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="inline-block px-2 py-0.5 bg-slate-700 text-emerald-400 text-[10px] font-bold rounded uppercase mb-1 w-fit">
                        {player?.position}
                      </span>
                      <div className="flex items-center gap-1 justify-end">
                        <img src={player?.collegeLogoUrl} className="w-3 h-3 object-contain opacity-70" alt="" />
                        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{player?.college}</span>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              bestAvailable.length > 0 ? (
                bestAvailable.map((player) => (
                  <button 
                    key={player.id} 
                    onClick={() => onSelectProspect(player)}
                    className="flex items-center gap-6 p-4 rounded-xl border border-slate-700/50 bg-slate-800/30 transition-all text-left group hover:scale-[1.01] hover:border-slate-600 hover:bg-slate-800/50"
                  >
                    <span className="w-10 text-xl font-oswald font-black text-slate-500 group-hover:text-emerald-500 transition-colors">#{player.rank}</span>
                    <div className="w-10 h-10 flex-shrink-0 rounded-full overflow-hidden bg-slate-700 border border-slate-600">
                      <img src={player.headshotUrl} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <span className="text-lg font-bold text-slate-100 group-hover:text-white">{player.name}</span>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className="inline-block px-2 py-0.5 bg-slate-700 text-emerald-400 text-[10px] font-bold rounded uppercase mb-1 w-fit">
                        {player.position}
                      </span>
                      <div className="flex items-center gap-1 justify-end">
                        <img src={player.collegeLogoUrl} className="w-3 h-3 object-contain opacity-70" alt="" />
                        <span className="text-xs font-medium text-slate-500 whitespace-nowrap">{player.college}</span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-20 text-center text-slate-500 italic">
                  No undrafted prospects remain.
                </div>
              )
            )}
          </div>

          <div className="mt-12 flex justify-center">
            <Button className="w-full max-w-sm h-14 uppercase font-oswald tracking-widest" onClick={onRestart}>
              Start New Simulation
            </Button>
          </div>
        </div>
      </div>

      {/* HIDDEN GRAPHIC TEMPLATE FOR DOWNLOAD */}
      <div 
        ref={graphicRef}
        className="absolute top-0 left-[-9999px] w-[800px] min-h-[1400px] bg-slate-950 p-12 text-white font-inter"
      >
        <div className="border-[8px] border-emerald-500 h-full p-8 relative overflow-hidden">
          {/* Subtle Background Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-900/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <header className="mb-12 border-b-2 border-emerald-500/50 pb-8 flex justify-between items-end">
            <div>
              <h1 className="text-6xl font-black font-oswald italic uppercase tracking-tighter text-emerald-500">2026 DRAFT</h1>
              <h2 className="text-3xl font-bold font-oswald uppercase text-slate-100 tracking-widest mt-1">First Round Recap</h2>
            </div>
            <div className="text-right">
              <span className="text-emerald-500 font-black text-xl font-oswald">GRIDIRON PRO</span>
              <div className="text-slate-500 text-xs font-bold tracking-widest uppercase">Simulation Engine</div>
            </div>
          </header>

          <div className="grid grid-cols-2 gap-x-12 gap-y-4">
            {state.picks.map((pick) => {
              const player = state.prospects.find(p => p.id === pick.selectedPlayerId);
              return (
                <div key={pick.pickNumber} className="flex items-center gap-4 bg-slate-900/50 border border-slate-800 p-3 rounded-xl">
                  <span className="text-xl font-black font-oswald text-emerald-500 w-8">#{pick.pickNumber}</span>
                  <div className="w-8 h-8 flex-shrink-0">
                    <img src={pick.team.logoUrl} className="w-full h-full object-contain" alt="" />
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
             <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">Official Draft Simulation Recap</div>
          </footer>
        </div>
      </div>
    </div>
  );
};
