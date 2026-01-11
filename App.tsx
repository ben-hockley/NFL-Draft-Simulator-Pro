
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppView, DraftState, Prospect, Position, PickAsset, DraftSpeed } from './types';
import { INITIAL_DRAFT_ORDER, PROSPECTS, TEAMS } from './constants';
import { Lobby } from './components/Lobby';
import { DraftBoard } from './components/DraftBoard';
import { PlayerDetail } from './components/PlayerDetail';
import { Summary } from './components/Summary';
import { TradeModal } from './components/TradeModal';
import { PlayerComparison } from './components/PlayerComparison';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('LOBBY');
  const [userControlledTeams, setUserControlledTeams] = useState<string[]>([]);
  const [roundsToSimulate, setRoundsToSimulate] = useState<number>(1);
  const [draftSpeed, setDraftSpeed] = useState<DraftSpeed>('MEDIUM');
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isSelectingTradeTeam, setIsSelectingTradeTeam] = useState(false);
  const [activeTradingTeamId, setActiveTradingTeamId] = useState<string | null>(null);
  const [comparisonBasePlayer, setComparisonBasePlayer] = useState<Prospect | null>(null);

  const [state, setState] = useState<DraftState>({
    currentPickIndex: 0,
    picks: INITIAL_DRAFT_ORDER,
    userControlledTeams: [],
    isDraftStarted: false,
    prospects: PROSPECTS,
    roundsToSimulate: 1,
    draftSpeed: 'MEDIUM',
    futurePicks: {}
  });

  const [isSimulationPaused, setIsSimulationPaused] = useState(false);

  const startDraft = () => {
    const allPicks = INITIAL_DRAFT_ORDER;
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
      draftSpeed,
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
    setComparisonBasePlayer(null);
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
      draftSpeed: 'MEDIUM',
      futurePicks: {}
    });
  };

  const handleDraftPlayer = useCallback((prospect: Prospect) => {
    setState(prev => {
      const picksInScope = prev.picks.filter(p => p.round <= prev.roundsToSimulate);
      if (prev.currentPickIndex >= picksInScope.length) return prev;
      
      const newPicks = [...prev.picks];
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
    setComparisonBasePlayer(null);
  }, []);

  const handleTrade = (userAssets: PickAsset[], cpuAssets: PickAsset[], targetTeamId: string, initiatorId: string) => {
    setState(prev => {
      const newPicks = [...prev.picks];
      const newFuturePicks = { ...prev.futurePicks };
      const cpuTeam = TEAMS.find(t => t.id === targetTeamId)!;
      const userTeam = TEAMS.find(t => t.id === initiatorId)!;

      userAssets.filter(a => a.year === 2026).forEach(asset => {
        const idx = newPicks.findIndex(p => p.pickNumber === asset.pickNumber);
        if (idx !== -1) newPicks[idx] = { ...newPicks[idx], team: cpuTeam, isTraded: true };
      });
      cpuAssets.filter(a => a.year === 2026).forEach(asset => {
        const idx = newPicks.findIndex(p => p.pickNumber === asset.pickNumber);
        if (idx !== -1) newPicks[idx] = { ...newPicks[idx], team: userTeam, isTraded: true };
      });

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
      const speedMap = {
        'SLOW': 3000,
        'MEDIUM': 1500,
        'FAST': 400
      };
      
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
          
          if (candidateProspects.length === 0) candidateProspects = available;

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
      }, speedMap[state.draftSpeed]); 
      return () => clearTimeout(timer);
    }
  }, [view, state.currentPickIndex, state.userControlledTeams, state.picks, state.prospects, state.isDraftStarted, handleDraftPlayer, isSimulationPaused, state.roundsToSimulate, state.draftSpeed]);

  const picksInScope = state.picks.filter(p => p.round <= state.roundsToSimulate);
  const currentPick = picksInScope[state.currentPickIndex];
  
  const currentTeamAllPicks = useMemo(() => {
    if (!currentPick) return [];
    return picksInScope
      .filter(p => p.team.id === currentPick.team.id)
      .map(p => p.pickNumber);
  }, [currentPick, picksInScope]);

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

  const sortedUserTeams = useMemo(() => 
    [...userControlledTeams].map(tid => TEAMS.find(t => t.id === tid)!).sort((a, b) => a.name.localeCompare(b.name)),
    [userControlledTeams]
  );

  const selectionInfo = useMemo(() => {
    if (!selectedProspectId) return null;
    const pick = state.picks.find(p => p.selectedPlayerId === selectedProspectId);
    return pick ? { team: pick.team, pickNumber: pick.pickNumber } : null;
  }, [state.picks, selectedProspectId]);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-slate-950">
      {view !== 'LOBBY' && (
        <header className="bg-slate-900 border-b border-slate-800 px-4 py-2 lg:py-3 sticky top-0 z-40 backdrop-blur-md bg-opacity-95 shrink-0">
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
              <div className="h-10 lg:h-12 w-px bg-slate-800 shrink-0"></div>
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
                    
                    {/* Team Needs - Moved below name/picks for mobile responsiveness */}
                    <div className="flex items-center gap-2 mt-1 overflow-x-auto no-scrollbar scrollbar-none">
                      <span className="text-[7px] lg:text-[9px] font-black text-slate-600 uppercase shrink-0">Needs:</span>
                      <div className="flex gap-1">
                        {currentPick.team.needs.map(need => {
                          const isFulfilled = fulfilledNeeds.has(need);
                          return (
                            <span 
                              key={need}
                              className={`text-[7px] lg:text-[9px] font-bold px-1 py-0.5 rounded border whitespace-nowrap ${
                                isFulfilled 
                                  ? 'bg-slate-800/50 border-slate-700 text-slate-600 line-through opacity-60' 
                                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              }`}
                            >
                              {need}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 lg:gap-3 mt-1 overflow-hidden">
                      <div className="flex items-center gap-1.5 shrink-0">
                        <div className={`w-1 h-1 lg:w-2 lg:h-2 rounded-full ${isSimulationPaused ? 'bg-amber-500' : 'bg-emerald-500 animate-pulse'}`}></div>
                        <span className="text-[7px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">
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
                    className="w-8 h-8 lg:w-10 lg:h-10 !p-0 border border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                    title="Propose Trade"
                  >
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </Button>
                  <Button 
                    variant="ghost"
                    onClick={restartApp}
                    className="w-8 h-8 lg:w-10 lg:h-10 !p-0 border border-slate-700 text-slate-400 hover:text-white"
                    title="Exit Draft"
                  >
                    <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </Button>
                  <Button 
                    variant={isSimulationPaused ? 'primary' : 'secondary'}
                    onClick={() => setIsSimulationPaused(!isSimulationPaused)}
                    className="w-8 h-8 lg:w-10 lg:h-10 !p-0"
                    title={isSimulationPaused ? 'Resume Simulation' : 'Pause Simulation'}
                  >
                    {isSimulationPaused ? (
                      <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                      </svg>
                    )}
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
            draftSpeed={draftSpeed}
            setDraftSpeed={setDraftSpeed}
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
            onCompare={() => {
              setComparisonBasePlayer(selectedProspect);
              setSelectedProspectId(null);
            }}
          />
        )}

        {comparisonBasePlayer && (
          <PlayerComparison 
            basePlayer={comparisonBasePlayer}
            onClose={() => setComparisonBasePlayer(null)}
            onDraft={handleDraftPlayer}
            isUserTurn={view === 'DRAFT' && !!currentPick && state.userControlledTeams.includes(currentPick.team.id)}
          />
        )}

        {isSelectingTradeTeam && (
          <div className="fixed inset-0 z-[55] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                <h3 className="text-xl font-bold font-oswald text-white uppercase">Select Team to Trade with</h3>
                <button onClick={() => setIsSelectingTradeTeam(false)} className="text-slate-400 hover:text-white transition-colors">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-slate-95/20">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {sortedUserTeams.map(team => {
                    return (
                      <button
                        key={team.id}
                        onClick={() => {
                          setActiveTradingTeamId(team.id);
                          setIsSelectingTradeTeam(false);
                          setIsTradeModalOpen(true);
                        }}
                        className="flex flex-col items-center gap-2 p-4 bg-slate-800 border border-slate-700 rounded-xl hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all group"
                      >
                        <img src={team.logoUrl} className="w-10 h-10 lg:w-12 lg:h-12 object-contain" alt="" />
                        <span className="text-[10px] lg:text-xs font-bold text-slate-300 group-hover:text-emerald-400 uppercase tracking-widest">{team.nickname}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="p-4 bg-slate-900 border-t border-slate-800 shrink-0">
                <Button variant="ghost" fullWidth onClick={() => setIsSelectingTradeTeam(false)}>Cancel Selection</Button>
              </div>
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
        2026 NFL DRAFT SIMULATOR
      </footer>
    </div>
  );
};

export default App;
