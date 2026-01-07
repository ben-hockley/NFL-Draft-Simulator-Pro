
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppView, DraftState, Prospect, Position } from './types';
import { INITIAL_DRAFT_ORDER, PROSPECTS } from './constants';
import { Lobby } from './components/Lobby';
import { DraftBoard } from './components/DraftBoard';
import { PlayerDetail } from './components/PlayerDetail';
import { Summary } from './components/Summary';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('LOBBY');
  const [userControlledTeams, setUserControlledTeams] = useState<string[]>([]);
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [state, setState] = useState<DraftState>({
    currentPickIndex: 0,
    picks: INITIAL_DRAFT_ORDER,
    userControlledTeams: [],
    isDraftStarted: false,
    prospects: PROSPECTS
  });

  const [isSimulationPaused, setIsSimulationPaused] = useState(false);

  const startDraft = () => {
    setState({
      ...state,
      userControlledTeams,
      isDraftStarted: true,
      currentPickIndex: 0,
      picks: INITIAL_DRAFT_ORDER.map(p => ({ ...p, selectedPlayerId: undefined }))
    });
    setIsSimulationPaused(false);
    setView('DRAFT');
  };

  const restartApp = () => {
    setView('LOBBY');
    setUserControlledTeams([]);
    setSelectedProspectId(null);
    setIsSimulationPaused(false);
    setState({
      currentPickIndex: 0,
      picks: INITIAL_DRAFT_ORDER,
      userControlledTeams: [],
      isDraftStarted: false,
      prospects: PROSPECTS
    });
  };

  const handleDraftPlayer = useCallback((prospect: Prospect) => {
    setState(prev => {
      if (prev.currentPickIndex >= prev.picks.length) return prev;
      
      const newPicks = [...prev.picks];
      newPicks[prev.currentPickIndex] = {
        ...newPicks[prev.currentPickIndex],
        selectedPlayerId: prospect.id
      };

      const nextIndex = prev.currentPickIndex + 1;
      
      return {
        ...prev,
        currentPickIndex: nextIndex,
        picks: newPicks
      };
    });
    setSelectedProspectId(null);
  }, []);

  // CPU logic with Team Needs prioritization
  useEffect(() => {
    if (view !== 'DRAFT' || state.currentPickIndex >= state.picks.length || isSimulationPaused) {
      if (state.currentPickIndex >= state.picks.length && state.isDraftStarted && view === 'DRAFT') {
         setView('SUMMARY');
      }
      return;
    }

    const currentPick = state.picks[state.currentPickIndex];
    const isCPU = !state.userControlledTeams.includes(currentPick.team.id);

    if (isCPU) {
      const timer = setTimeout(() => {
        const draftedIds = state.picks.map(p => p.selectedPlayerId).filter(Boolean);
        const available = state.prospects
          .filter(p => !draftedIds.includes(p.id))
          .sort((a, b) => a.rank - b.rank);

        if (available.length > 0) {
          // Team Needs logic:
          const teamNeeds = currentPick.team.needs;
          const bestNeedProspects = available.filter(p => teamNeeds.includes(p.position));
          
          // Select from needs if available, otherwise fallback to BPA (Best Player Available)
          const selection = bestNeedProspects.length > 0 ? bestNeedProspects[0] : available[0];
          handleDraftPlayer(selection);
        }
      }, 1500); 
      return () => clearTimeout(timer);
    }
  }, [view, state.currentPickIndex, state.userControlledTeams, state.picks, state.prospects, state.isDraftStarted, handleDraftPlayer, isSimulationPaused]);

  const currentPick = state.picks[state.currentPickIndex];
  
  // Calculate which needs are fulfilled for the current team
  const fulfilledNeeds = useMemo(() => {
    if (!currentPick) return new Set<Position>();
    const teamId = currentPick.team.id;
    const draftedPositionsByTeam = state.picks
      .filter(p => p.team.id === teamId && p.selectedPlayerId)
      .map(p => {
        const player = state.prospects.find(pro => pro.id === p.selectedPlayerId);
        return player?.position;
      })
      .filter(Boolean) as Position[];
    
    return new Set(draftedPositionsByTeam);
  }, [currentPick, state.picks, state.prospects]);

  const selectedProspect = useMemo(() => 
    PROSPECTS.find(p => p.id === selectedProspectId) || null, 
    [selectedProspectId]
  );

  const selectionInfo = useMemo(() => {
    if (!selectedProspectId) return null;
    const pick = state.picks.find(p => p.selectedPlayerId === selectedProspectId);
    return pick ? { team: pick.team, pickNumber: pick.pickNumber } : null;
  }, [state.picks, selectedProspectId]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Dynamic Header */}
      {view !== 'LOBBY' && (
        <header className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Current Pick</span>
                <span className="text-3xl font-black font-oswald text-slate-100 italic leading-none">#{state.currentPickIndex + 1}</span>
              </div>
              <div className="h-10 w-px bg-slate-800"></div>
              {currentPick && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 flex items-center justify-center p-2 bg-slate-800 rounded-xl border border-slate-700">
                    <img src={currentPick.team.logoUrl} alt={currentPick.team.name} className="max-w-full max-h-full" />
                  </div>
                  <div className="flex flex-col">
                    <h2 className="text-xl font-black font-oswald uppercase text-slate-100 tracking-tight leading-none">
                      {currentPick.team.name}
                    </h2>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${isSimulationPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          {isSimulationPaused ? 'PAUSED' : (state.userControlledTeams.includes(currentPick.team.id) ? 'Your Turn' : 'CPU Thinking...')}
                        </span>
                      </div>
                      <div className="h-4 w-px bg-slate-800"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Team Needs:</span>
                        <div className="flex gap-1">
                          {currentPick.team.needs.map((need) => (
                            <span 
                              key={need}
                              className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                                fulfilledNeeds.has(need) 
                                  ? 'bg-slate-800 border-slate-700 text-slate-600 line-through opacity-50' 
                                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              }`}
                            >
                              {need}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              {view === 'DRAFT' && (
                <>
                  <Button 
                    variant="danger"
                    onClick={restartApp}
                    className="h-10 px-4 text-xs uppercase font-bold"
                    title="Exit and reset draft"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"/></svg>
                    <span className="hidden sm:inline">Setup</span>
                  </Button>
                  <Button 
                    variant={isSimulationPaused ? 'primary' : 'secondary'}
                    onClick={() => setIsSimulationPaused(!isSimulationPaused)}
                    className="h-10 px-4 text-xs uppercase font-bold min-w-[140px]"
                  >
                    {isSimulationPaused ? (
                      <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg> Resume</>
                    ) : (
                      <><svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg> Pause</>
                    )}
                  </Button>
                </>
              )}
              
              <div className="hidden lg:flex flex-col items-end">
                 <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Next On Clock</span>
                 <div className="flex items-center gap-2">
                   <span className="text-sm font-bold text-slate-300">
                     {state.picks[state.currentPickIndex + 1]?.team.name || 'End of Draft'}
                   </span>
                 </div>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1">
        {view === 'LOBBY' && (
          <Lobby 
            userControlledTeams={userControlledTeams} 
            setUserControlledTeams={setUserControlledTeams} 
            onStart={startDraft} 
          />
        )}

        {view === 'DRAFT' && (
          <DraftBoard 
            state={state} 
            onDraftPlayer={handleDraftPlayer}
            onSelectProspect={(p) => setSelectedProspectId(p.id)}
            selectedProspectId={selectedProspectId}
          />
        )}

        {view === 'SUMMARY' && (
          <Summary 
            state={state} 
            onRestart={restartApp} 
            onSelectProspect={(p) => setSelectedProspectId(p.id)}
          />
        )}

        {/* Global Player Detail Modal */}
        {selectedProspect && (
          <PlayerDetail 
            prospect={selectedProspect}
            currentTeam={currentPick?.team}
            isUserTurn={view === 'DRAFT' && !!currentPick && state.userControlledTeams.includes(currentPick.team.id) && !selectionInfo}
            onDraft={handleDraftPlayer}
            onClose={() => setSelectedProspectId(null)}
            completedPick={selectionInfo || undefined}
          />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="p-4 text-center text-[10px] font-bold text-slate-700 uppercase tracking-widest mt-auto">
        &copy; 2026 GRIDIRON DRAFT SIMULATOR PRO &bull; ADVANCED SIMULATION ENGINE
      </footer>
    </div>
  );
};

export default App;
