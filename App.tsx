
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppView, DraftState, Prospect, Position, PickAsset } from './types';
import { INITIAL_DRAFT_ORDER, PROSPECTS, TEAMS } from './constants';
import { Lobby } from './components/Lobby';
import { DraftBoard } from './components/DraftBoard';
import { PlayerDetail } from './components/PlayerDetail';
import { Summary } from './components/Summary';
import { TradeModal } from './components/TradeModal';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('LOBBY');
  const [userControlledTeams, setUserControlledTeams] = useState<string[]>([]);
  const [roundsToSimulate, setRoundsToSimulate] = useState<number>(1);
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isSelectingTradeTeam, setIsSelectingTradeTeam] = useState(false);
  const [activeTradingTeamId, setActiveTradingTeamId] = useState<string | null>(null);

  const [state, setState] = useState<DraftState>({
    currentPickIndex: 0,
    picks: INITIAL_DRAFT_ORDER,
    userControlledTeams: [],
    isDraftStarted: false,
    prospects: PROSPECTS,
    roundsToSimulate: 1,
    futurePicks: {}
  });

  const [isSimulationPaused, setIsSimulationPaused] = useState(false);

  const startDraft = () => {
    // Keep ALL 7 rounds for trading purposes, but simulation logic will stop at roundsToSimulate
    const allPicks = INITIAL_DRAFT_ORDER;
    
    // Initialize future picks for everyone
    const futurePicks: Record<string, number[]> = {};
    TEAMS.forEach(t => {
      futurePicks[t.id] = [1, 2, 3, 4, 5, 6, 7];
    });

    setState({
      ...state,
      userControlledTeams,
      isDraftStarted: true,
      currentPickIndex: 0,
      roundsToSimulate,
      picks: allPicks.map(p => ({ ...p, selectedPlayerId: undefined, isTraded: false })),
      futurePicks
    });
    setIsSimulationPaused(false);
    setView('DRAFT');
  };

  const restartApp = () => {
    setView('LOBBY');
    setUserControlledTeams([]);
    setSelectedProspectId(null);
    setIsSimulationPaused(false);
    setIsSelectingTradeTeam(false);
    setActiveTradingTeamId(null);
    setState({
      currentPickIndex: 0,
      picks: INITIAL_DRAFT_ORDER,
      userControlledTeams: [],
      isDraftStarted: false,
      prospects: PROSPECTS,
      roundsToSimulate: 1,
      futurePicks: {}
    });
  };

  const handleDraftPlayer = useCallback((prospect: Prospect) => {
    setState(prev => {
      // Find the next available pick within the rounds we're simulating
      const picksInScope = prev.picks.filter(p => p.round <= prev.roundsToSimulate);
      if (prev.currentPickIndex >= picksInScope.length) return prev;
      
      const newPicks = [...prev.picks];
      // Get the actual pick based on simulation index
      const pickToUpdate = picksInScope[prev.currentPickIndex];
      const actualIdx = newPicks.findIndex(p => p.pickNumber === pickToUpdate.pickNumber);

      if (actualIdx !== -1) {
        newPicks[actualIdx] = {
          ...newPicks[actualIdx],
          selectedPlayerId: prospect.id
        };
      }

      const nextIndex = prev.currentPickIndex + 1;
      
      return {
        ...prev,
        currentPickIndex: nextIndex,
        picks: newPicks
      };
    });
    setSelectedProspectId(null);
  }, []);

  const handleTrade = (userAssets: PickAsset[], cpuAssets: PickAsset[], targetTeamId: string, initiatorId: string) => {
    setState(prev => {
      const newPicks = [...prev.picks];
      const newFuturePicks = { ...prev.futurePicks };
      const cpuTeam = TEAMS.find(t => t.id === targetTeamId)!;
      const userTeam = TEAMS.find(t => t.id === initiatorId)!;

      // Swap 2026 Picks
      userAssets.filter(a => a.year === 2026).forEach(asset => {
        const idx = newPicks.findIndex(p => p.pickNumber === asset.pickNumber);
        if (idx !== -1) newPicks[idx] = { ...newPicks[idx], team: cpuTeam, isTraded: true };
      });
      cpuAssets.filter(a => a.year === 2026).forEach(asset => {
        const idx = newPicks.findIndex(p => p.pickNumber === asset.pickNumber);
        if (idx !== -1) newPicks[idx] = { ...newPicks[idx], team: userTeam, isTraded: true };
      });

      // Swap 2027 Picks
      userAssets.filter(a => a.year === 2027).forEach(asset => {
        newFuturePicks[initiatorId] = newFuturePicks[initiatorId].filter(r => r !== asset.round);
        newFuturePicks[targetTeamId] = [...newFuturePicks[targetTeamId], asset.round];
      });
      cpuAssets.filter(a => a.year === 2027).forEach(asset => {
        newFuturePicks[targetTeamId] = newFuturePicks[targetTeamId].filter(r => r !== asset.round);
        newFuturePicks[initiatorId] = [...newFuturePicks[initiatorId], asset.round];
      });

      return {
        ...prev,
        picks: newPicks,
        futurePicks: newFuturePicks
      };
    });
    setIsTradeModalOpen(false);
    setActiveTradingTeamId(null);
  };

  useEffect(() => {
    const picksInScope = state.picks.filter(p => p.round <= state.roundsToSimulate);

    if (view !== 'DRAFT' || state.currentPickIndex >= picksInScope.length || isSimulationPaused) {
      if (state.currentPickIndex >= picksInScope.length && state.isDraftStarted && view === 'DRAFT') {
         setView('SUMMARY');
      }
      return;
    }

    const currentPick = picksInScope[state.currentPickIndex];
    if (!currentPick) return;

    const isCPU = !state.userControlledTeams.includes(currentPick.team.id);

    if (isCPU) {
      const timer = setTimeout(() => {
        const draftedIds = state.picks.map(p => p.selectedPlayerId).filter(Boolean);
        const available = state.prospects
          .filter(p => !draftedIds.includes(p.id))
          .sort((a, b) => a.rank - b.rank);

        if (available.length > 0) {
          const teamNeeds = currentPick.team.needs;
          const teamId = currentPick.team.id;
          const draftedPositionsByTeam = state.picks
            .filter(p => p.team.id === teamId && p.selectedPlayerId)
            .map(p => {
              const player = state.prospects.find(pro => pro.id === p.selectedPlayerId);
              return player?.position;
            })
            .filter(Boolean);
          
          const remainingNeeds = teamNeeds.filter(need => !draftedPositionsByTeam.includes(need));
          let candidateProspects = available.filter(p => remainingNeeds.includes(p.position));
          
          if (candidateProspects.length === 0) {
            candidateProspects = available;
          }

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
  }, [view, state.currentPickIndex, state.userControlledTeams, state.picks, state.prospects, state.isDraftStarted, handleDraftPlayer, isSimulationPaused, state.roundsToSimulate]);

  const picksInScope = state.picks.filter(p => p.round <= state.roundsToSimulate);
  const currentPick = picksInScope[state.currentPickIndex];
  
  const currentTeamAllPicks = useMemo(() => {
    if (!currentPick) return [];
    return picksInScope
      .filter(p => p.team.id === currentPick.team.id)
      .map(p => p.pickNumber);
  }, [currentPick, picksInScope]);

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
                    onClick={() => {
                      if (userControlledTeams.length > 1) {
                        setIsSelectingTradeTeam(true);
                      } else {
                        setActiveTradingTeamId(userControlledTeams[0]);
                        setIsTradeModalOpen(true);
                      }
                    }}
                    className="h-8 lg:h-10 px-2 lg:px-4 text-[10px] uppercase font-bold border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                    title="Trade"
                  >
                    Trade
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={restartApp}
                    className="h-8 lg:h-10 px-2 lg:px-4 text-[10px] uppercase font-bold border border-slate-700"
                    title="Exit"
                  >
                    Exit
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

        {isSelectingTradeTeam && (
          <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-2xl p-6 shadow-2xl">
              <h3 className="text-xl font-bold font-oswald text-white uppercase mb-4 text-center">Select Initiating Team</h3>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {userControlledTeams.map(tid => {
                  const team = TEAMS.find(t => t.id === tid)!;
                  return (
                    <button
                      key={tid}
                      onClick={() => {
                        setActiveTradingTeamId(tid);
                        setIsSelectingTradeTeam(false);
                        setIsTradeModalOpen(true);
                      }}
                      className="flex flex-col items-center gap-2 p-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all group"
                    >
                      <img src={team.logoUrl} className="w-12 h-12 object-contain" alt="" />
                      <span className="text-xs font-bold text-slate-300 group-hover:text-emerald-400">{team.id}</span>
                    </button>
                  );
                })}
              </div>
              <Button variant="ghost" fullWidth onClick={() => setIsSelectingTradeTeam(false)}>Cancel</Button>
            </div>
          </div>
        )}

        {isTradeModalOpen && activeTradingTeamId && (
          <TradeModal 
            userTeamId={activeTradingTeamId}
            currentPicks={state.picks}
            futurePicks={state.futurePicks}
            onClose={() => {
              setIsTradeModalOpen(false);
              setActiveTradingTeamId(null);
            }}
            onTrade={handleTrade}
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
