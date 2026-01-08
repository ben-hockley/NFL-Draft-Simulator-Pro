
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
  const [roundsToSimulate, setRoundsToSimulate] = useState<number>(1);
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [state, setState] = useState<DraftState>({
    currentPickIndex: 0,
    picks: INITIAL_DRAFT_ORDER,
    userControlledTeams: [],
    isDraftStarted: false,
    prospects: PROSPECTS,
    roundsToSimulate: 1
  });

  const [isSimulationPaused, setIsSimulationPaused] = useState(false);

  const startDraft = () => {
    // Filter INITIAL_DRAFT_ORDER based on selected rounds
    const filteredPicks = INITIAL_DRAFT_ORDER.filter(p => p.round <= roundsToSimulate);
    
    setState({
      ...state,
      userControlledTeams,
      isDraftStarted: true,
      currentPickIndex: 0,
      roundsToSimulate,
      picks: filteredPicks.map(p => ({ ...p, selectedPlayerId: undefined }))
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
      prospects: PROSPECTS,
      roundsToSimulate: 1
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

  // CPU logic with Weighted Random Team Needs prioritization
  useEffect(() => {
    if (view !== 'DRAFT' || state.currentPickIndex >= state.picks.length || isSimulationPaused) {
      if (state.currentPickIndex >= state.picks.length && state.isDraftStarted && view === 'DRAFT') {
         setView('SUMMARY');
      }
      return;
    }

    const currentPick = state.picks[state.currentPickIndex];
    if (!currentPick) return;

    const isCPU = !state.userControlledTeams.includes(currentPick.team.id);

    if (isCPU) {
      const timer = setTimeout(() => {
        const draftedIds = state.picks.map(p => p.selectedPlayerId).filter(Boolean);
        const available = state.prospects
          .filter(p => !draftedIds.includes(p.id))
          .sort((a, b) => a.rank - b.rank);

        if (available.length > 0) {
          // 1. Determine Team Needs
          const teamNeeds = currentPick.team.needs;
          
          // 2. Filter which needs are already fulfilled by this team in previous picks
          const teamId = currentPick.team.id;
          const draftedPositionsByTeam = state.picks
            .filter(p => p.team.id === teamId && p.selectedPlayerId)
            .map(p => {
              const player = state.prospects.find(pro => pro.id === p.selectedPlayerId);
              return player?.position;
            })
            .filter(Boolean);
          
          const remainingNeeds = teamNeeds.filter(need => !draftedPositionsByTeam.includes(need));
          
          // 3. Find prospects that fit remaining needs
          let candidateProspects = available.filter(p => remainingNeeds.includes(p.position));
          
          // 4. Fallback to all available (BPA) if no prospects fit remaining needs
          if (candidateProspects.length === 0) {
            candidateProspects = available;
          }

          // 5. Select from top 4 candidates based on weights: 50, 30, 20, 10
          const topCandidates = candidateProspects.slice(0, 4);
          const weights = [50, 30, 20, 10].slice(0, topCandidates.length);
          const totalWeight = weights.reduce((a, b) => a + b, 0);
          
          const randomValue = Math.random() * totalWeight;
          let cumulativeWeight = 0;
          let selectedIndex = 0;

          for (let i = 0; i < weights.length; i++) {
            cumulativeWeight += weights[i];
            if (randomValue <= cumulativeWeight) {
              selectedIndex = i;
              break;
            }
          }

          const selection = topCandidates[selectedIndex];
          handleDraftPlayer(selection);
        }
      }, 1000); 
      return () => clearTimeout(timer);
    }
  }, [view, state.currentPickIndex, state.userControlledTeams, state.picks, state.prospects, state.isDraftStarted, handleDraftPlayer, isSimulationPaused]);

  const currentPick = state.picks[state.currentPickIndex];
  
  // Calculate all picks for the current team
  const currentTeamAllPicks = useMemo(() => {
    if (!currentPick) return [];
    return state.picks
      .filter(p => p.team.id === currentPick.team.id)
      .map(p => p.pickNumber);
  }, [currentPick, state.picks]);

  // Calculate which needs are fulfilled for the current team
  const fulfilledNeeds = useMemo(() => {
    if (!currentPick) return new Set<string>();
    const teamId = currentPick.team.id;
    const draftedPositionsByTeam = state.picks
      .filter(p => p.team.id === teamId && p.selectedPlayerId)
      .map(p => {
        const player = state.prospects.find(pro => pro.id === p.selectedPlayerId);
        return player?.position;
      })
      .filter(Boolean) as string[];
    
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
    <div className="h-screen flex flex-col overflow-hidden bg-slate-950">
      {/* Dynamic Header */}
      {view !== 'LOBBY' && (
        <header className="bg-slate-900 border-b border-slate-800 px-4 py-2 sticky top-0 z-40 backdrop-blur-md bg-opacity-95 shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 lg:gap-4">
            <div className="flex items-center gap-3 lg:gap-6 flex-1 min-w-0">
              <div className="flex flex-col shrink-0">
                <span className="text-[8px] lg:text-[10px] font-black uppercase text-emerald-500 tracking-widest">
                  Pick #{state.currentPickIndex + 1}
                </span>
                <span className="text-sm lg:text-xl font-black font-oswald text-slate-100 italic leading-none">
                  Round {currentPick?.round || 1}
                </span>
              </div>
              <div className="h-8 lg:h-10 w-px bg-slate-800 shrink-0"></div>
              {currentPick && (
                <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">
                  <div className="w-8 h-8 lg:w-12 lg:h-12 flex items-center justify-center p-1.5 lg:p-2 bg-slate-800 rounded-lg lg:rounded-xl border border-slate-700 shrink-0">
                    <img src={currentPick.team.logoUrl} alt={currentPick.team.name} className="max-w-full max-h-full" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 lg:gap-3 flex-wrap">
                      <h2 className="text-sm lg:text-xl font-black font-oswald uppercase text-slate-100 tracking-tight leading-none truncate max-w-[120px] lg:max-w-none">
                        {currentPick.team.name}
                      </h2>
                      {/* Team Pick Numbers List */}
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar scrollbar-none py-0.5 max-w-[150px] lg:max-w-none">
                        <span className="text-[7px] lg:text-[9px] font-black text-slate-600 uppercase shrink-0">Picks:</span>
                        {currentTeamAllPicks.map(pNum => (
                          <span 
                            key={pNum} 
                            className={`text-[8px] lg:text-[10px] font-bold px-1 rounded flex items-center justify-center shrink-0 min-w-[20px] ${
                              pNum === currentPick.pickNumber 
                                ? 'bg-emerald-500 text-white shadow-sm ring-1 ring-emerald-400' 
                                : pNum < currentPick.pickNumber 
                                  ? 'bg-slate-800 text-slate-500' 
                                  : 'bg-slate-700 text-slate-300'
                            }`}
                          >
                            {pNum}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 lg:gap-3 mt-1 lg:mt-1.5 overflow-hidden">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${isSimulationPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                        <span className="text-[8px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                          {isSimulationPaused ? 'PAUSED' : (state.userControlledTeams.includes(currentPick.team.id) ? 'Your Turn' : 'CPU')}
                        </span>
                      </div>
                      <div className="hidden md:block h-4 w-px bg-slate-800 shrink-0"></div>
                      <div className="hidden md:flex items-center gap-2 min-w-0">
                        <span className="text-[8px] lg:text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">Needs:</span>
                        <div className="flex gap-1 overflow-x-auto scrollbar-none no-scrollbar pb-0.5">
                          {currentPick.team.needs.map((need) => (
                            <span 
                              key={need}
                              className={`text-[8px] lg:text-[9px] font-black px-1.5 py-0.5 rounded border whitespace-nowrap ${
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

            <div className="flex items-center gap-2 shrink-0">
              {view === 'DRAFT' && (
                <>
                  <Button 
                    variant="ghost"
                    onClick={restartApp}
                    className="h-8 lg:h-10 px-2 lg:px-4 text-[10px] uppercase font-bold border border-slate-700"
                    title="Exit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8M3 12a9 9 0 1118 0 9 9 0 01-18 0z"/></svg>
                    <span className="hidden sm:inline">Exit</span>
                  </Button>
                  <Button 
                    variant={isSimulationPaused ? 'primary' : 'secondary'}
                    onClick={() => setIsSimulationPaused(!isSimulationPaused)}
                    className="h-8 lg:h-10 px-2 lg:px-4 text-[10px] uppercase font-bold min-w-[80px] lg:min-w-[120px]"
                  >
                    {isSimulationPaused ? 'Resume' : 'Pause'}
                  </Button>
                </>
              )}
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-hidden">
        {view === 'LOBBY' && (
          <Lobby 
            userControlledTeams={userControlledTeams} 
            setUserControlledTeams={setUserControlledTeams} 
            roundsToSimulate={roundsToSimulate}
            setRoundsToSimulate={setRoundsToSimulate}
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

      <footer className="hidden lg:block py-1.5 px-4 text-center text-[10px] font-bold text-slate-700 uppercase tracking-widest bg-slate-900/50 border-t border-slate-800 shrink-0">
        &copy; 2026 GRIDIRON DRAFT SIMULATOR PRO &bull; ADVANCED SIMULATION ENGINE
      </footer>
    </div>
  );
};

export default App;