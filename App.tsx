'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { AppView, DraftState, Prospect, Position, PickAsset, DraftSpeed, Team } from './types.ts';
import { getEspnUrl, getCollegeLogoUrl } from './constants.ts';
import { Lobby } from './components/Lobby.tsx';
import { DraftBoard } from './components/DraftBoard.tsx';
import { PlayerDetail } from './components/PlayerDetail.tsx';
import { Summary } from './components/Summary.tsx';
import { TradeModal } from './components/TradeModal.tsx';
import { PlayerComparison } from './components/PlayerComparison.tsx';
import { Button } from './components/Button.tsx';
import { BigBoard } from './components/BigBoard.tsx';
import { supabase } from './supabase.ts';

/**
 * Simple Homepage component
 */
const HomePage: React.FC<{ onStartDraft: () => void; onGoToBigBoard: () => void }> = ({ onStartDraft, onGoToBigBoard }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-4xl animate-fadeIn">
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 lg:w-32 lg:h-32 bg-emerald-500 rounded-3xl rotate-12 flex items-center justify-center shadow-[0_0_50px_rgba(16,185,129,0.3)]">
            <svg className="w-12 h-12 lg:w-20 lg:h-20 text-white -rotate-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-4xl lg:text-7xl font-black font-oswald text-white uppercase tracking-tighter mb-4 lg:mb-6">
          SundayScouts <span className="text-emerald-500">Draft Sim</span>
        </h1>
        
        <p className="text-slate-400 text-lg lg:text-2xl font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
          The most advanced 2026 NFL Mock Draft simulator. Explore the 2026 prospect big board or dive into a mock draft.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <button 
            onClick={onStartDraft}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-emerald-500 hover:bg-emerald-400 text-white px-8 py-5 rounded-2xl text-xl lg:text-2xl font-black font-oswald uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-emerald-500/20"
          >
            Draft Simulator
            <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          <button 
            onClick={onGoToBigBoard}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-4 bg-slate-800 hover:bg-slate-700 text-white px-8 py-5 rounded-2xl text-xl lg:text-2xl font-black font-oswald uppercase tracking-widest transition-all hover:scale-105 active:scale-95 shadow-xl"
          >
            Big Board
            <svg className="w-6 h-6 lg:w-8 lg:h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </button>
        </div>

        <div className="mt-16 grid grid-cols-2 lg:grid-cols-4 gap-4 opacity-50">
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <span className="block text-emerald-500 font-black text-xl font-oswald">32</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">NFL Teams</span>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <span className="block text-emerald-500 font-black text-xl font-oswald">2026</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Draft Class</span>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <span className="block text-emerald-500 font-black text-xl font-oswald">FREE</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Trading Tool</span>
          </div>
          <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
            <span className="block text-emerald-500 font-black text-xl font-oswald">REAL</span>
            <span className="text-[10px] font-bold text-slate-500 uppercase">Scouting Intel</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  // Helper to parse current path from hash or fallback to root
  const getRouteFromHash = () => {
    if (typeof window === 'undefined') return '/home';
    const hash = window.location.hash.replace('#', '');
    return hash || '/home';
  };

  const [currentRoute, setCurrentRoute] = useState<string>(getRouteFromHash());
  const [view, setView] = useState<AppView>('LOBBY');
  const [userControlledTeams, setUserControlledTeams] = useState<string[]>([]);
  const [roundsToSimulate, setRoundsToSimulate] = useState<number>(1);
  const [draftSpeed, setDraftSpeed] = useState<DraftSpeed>('MEDIUM');
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const [isSelectingTradeTeam, setIsSelectingTradeTeam] = useState(false);
  const [activeTradingTeamId, setActiveTradingTeamId] = useState<string | null>(null);
  const [comparisonBasePlayer, setComparisonBasePlayer] = useState<Prospect | null>(null);
  const [isLoadingProspects, setIsLoadingProspects] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Teams Data Management
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoadingTeams, setIsLoadingTeams] = useState(true);

  // Draft Order Data Management
  const [draftOrder, setDraftOrder] = useState<any[]>([]);

  const [state, setState] = useState<DraftState>({
    currentPickIndex: 0,
    picks: [], // Initialized empty, populated after teams load and draft starts
    userControlledTeams: [],
    isDraftStarted: false,
    prospects: [],
    roundsToSimulate: 1,
    draftSpeed: 'MEDIUM',
    futurePicks: {}
  });

  const [isSimulationPaused, setIsSimulationPaused] = useState(false);

  // Helper for internal routing using Hashes for maximum refresh compatibility
  const handleNavigate = useCallback((path: string) => {
    window.location.hash = path;
    setCurrentRoute(path);
  }, []);

  // Handle hash changes (back/forward or external link)
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(getRouteFromHash());
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Fetch Teams and Draft Order immediately on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      setIsLoadingTeams(true);
      try {
        const [teamsResult, orderResult] = await Promise.all([
           supabase.from('NFL_Teams').select('*'),
           supabase.from('draft_order').select('*').order('pick', { ascending: true })
        ]);
        
        if (teamsResult.error) throw teamsResult.error;
        if (orderResult.error) throw orderResult.error;
        
        if (teamsResult.data) {
          const mappedTeams: Team[] = teamsResult.data.map((t: any) => ({
            id: t.short_name, // Map short_name from DB to id for frontend compatibility
            name: t.name,
            nickname: t.nickname,
            logoUrl: t.logoUrl,
            color: t.color,
            needs: t.needs // Assuming needs is stored as JSON array in Supabase
          }));
          setTeams(mappedTeams);
        }

        if (orderResult.data) {
           setDraftOrder(orderResult.data);
        }

      } catch (err: any) {
        console.error('Error fetching initial data:', err.message);
        setFetchError('Failed to load NFL teams or draft order data.');
      } finally {
        setIsLoadingTeams(false);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch prospects directly from Supabase only when navigating to /draftsim or /bigboard
  useEffect(() => {
    const needsProspects = currentRoute === '/draftsim' || currentRoute === '/bigboard';
    if (!needsProspects || state.prospects.length > 0) return;

    const fetchProspects = async () => {
      setIsLoadingProspects(true);
      setFetchError(null);
      try {
        const [prospectsResult, collegesResult] = await Promise.all([
           supabase.from('prospects').select('*').order('rank', { ascending: true }),
           supabase.from('Colleges').select('*')
        ]);
        
        if (prospectsResult.error) {
          throw new Error(`Database error: ${prospectsResult.error.message}`);
        }

        const collegeMap: Record<string, number> = {};
        if (collegesResult.data) {
           collegesResult.data.forEach((c: any) => {
               if (c.college && c.espn_id) {
                   collegeMap[c.college] = c.espn_id;
               }
           });
        }

        const data = prospectsResult.data;
        if (Array.isArray(data)) {
          const mappedProspects: Prospect[] = data.map((p: any) => {
            const collegeName = p.College || p.college || 'Unknown College';
            const collegeId = collegeMap[collegeName];

            return {
              id: (p.id || p.ID || '').toString(),
              espnId: p.espnId || p.espnid || 0,
              name: p.Name || p.name || 'Unknown Player',
              college: collegeName,
              position: p.Position || p.position || 'N/A',
              summary: p.Summary || p.summary || '',
              bio: p.Bio || p.bio || '',
              rank: p.rank || p.Rank || 999,
              headshotUrl: getEspnUrl(p.espnId || p.espnid),
              collegeLogoUrl: getCollegeLogoUrl(collegeId, collegeName),
              strengths: p.Strengths ? (typeof p.Strengths === 'string' ? p.Strengths.split(',').map((s: string) => s.trim()) : p.Strengths) : [],
              weaknesses: p.Weaknesses ? (typeof p.Weaknesses === 'string' ? p.Weaknesses.split(',').map((s: string) => s.trim()) : p.Weaknesses) : [],
              recruitingStars: p.RecruitingStars ?? p.recruiting_stars ?? null,
              link247: p['247Link'] ?? p['247link'] ?? p.link247 ?? null,
              nflComparison: p.NFLComparison ?? p.nfl_comparison ?? p.nflComparison ?? null,
              allAmerican: !!(p.all_american ?? p.AllAmerican ?? false),
              nflBloodline: !!(p.nfl_bloodline ?? p.NFLBloodline ?? false),
              freaksList: !!(p.freaks_list ?? p.FreaksList ?? false),
              draftYear: p.draft_year || p.DraftYear || 2026,
              combine: {
                fortyYardDash: p['40_yard_dash'] || null,
                tenYardSplit: p['10_yard_spli'] || p['10_yard_split'] || null,
                threeConeDrill: p['3_cone_drill'] || null,
                twentyYardShuttle: p['20_yard_shuttle'] || null,
                verticalJump: p['vertical_jump'] || null,
                broadJump: p['broad_jump'] || null,
                benchPress: p['bench-press'] || p['bench_press'] || null
              }
            };
          });
          setState(prev => ({ ...prev, prospects: mappedProspects }));
        } else {
          throw new Error("Received invalid data format from database");
        }
      } catch (err: any) {
        console.error('Frontend Fetch Error:', err.message);
        setFetchError(err.message);
      } finally {
        setIsLoadingProspects(false);
      }
    };

    fetchProspects();
  }, [currentRoute, state.prospects.length]);

  const startDraft = () => {
    // Generate Draft Order from Fetched Draft Order + Teams Data
    const allPicks = draftOrder.map((pick) => {
        const team = teams.find(t => t.id === pick.short_name);
        if (!team) {
            console.error(`Team not found for ID: ${pick.short_name}`);
            // Fallback to prevent crash, using first team as placeholder
            return {
                pickNumber: pick.pick,
                round: pick.round,
                team: teams[0], 
                selectedPlayerId: undefined,
                isTraded: false
            };
        }
        return {
            pickNumber: pick.pick,
            round: pick.round,
            team: team,
            selectedPlayerId: undefined,
            isTraded: false
        };
    });

    const futurePicks: Record<string, number[]> = {};
    teams.forEach(t => {
      futurePicks[t.id] = [1, 2, 3, 4, 5, 6, 7];
    });

    setState({
      ...state,
      userControlledTeams,
      isDraftStarted: true,
      currentPickIndex: 0,
      roundsToSimulate,
      draftSpeed,
      picks: allPicks,
      futurePicks
    });
    setIsSimulationPaused(false);
    setView('DRAFT');
  };

  const restartApp = () => {
    handleNavigate('/home');
    setView('LOBBY');
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
      const cpuTeam = teams.find(t => t.id === targetTeamId)!;
      const userTeam = teams.find(t => t.id === initiatorId)!;

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
    if (currentRoute !== '/draftsim') return;

    const picksInScope = state.picks.filter(p => p.round <= state.roundsToSimulate);
    if (view !== 'DRAFT' || state.currentPickIndex >= picksInScope.length || isSimulationPaused || isLoadingProspects) {
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
        // CRITICAL: Simulator ONLY sees 2026 prospects
        const available = state.prospects
          .filter(p => !draftedIds.includes(p.id) && p.draftYear === 2026)
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
  }, [view, state.currentPickIndex, state.userControlledTeams, state.picks, state.prospects, state.isDraftStarted, handleDraftPlayer, isSimulationPaused, state.roundsToSimulate, state.draftSpeed, isLoadingProspects, currentRoute]);

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
    state.prospects.find(p => p.id === selectedProspectId) || null, 
    [selectedProspectId, state.prospects]
  );

  const sortedUserTeams = useMemo(() => 
    [...userControlledTeams].map(tid => teams.find(t => t.id === tid)!).sort((a, b) => a.name.localeCompare(b.name)),
    [userControlledTeams, teams]
  );

  const selectionInfo = useMemo(() => {
    if (!selectedProspectId) return null;
    const pick = state.picks.find(p => p.selectedPlayerId === selectedProspectId);
    return pick ? { team: pick.team, pickNumber: pick.pickNumber } : null;
  }, [state.picks, selectedProspectId]);

  // View Resolution based on currentRoute
  const isHomeView = currentRoute === '/home' || currentRoute === '/';
  const isDraftView = currentRoute === '/draftsim';
  const isBigBoardView = currentRoute === '/bigboard';

  if (isHomeView) {
    return (
      <HomePage 
        onStartDraft={() => handleNavigate('/draftsim')} 
        onGoToBigBoard={() => handleNavigate('/bigboard')} 
      />
    );
  }

  // Combine loading states for critical initial data
  if ((isLoadingProspects && state.prospects.length === 0) || (isLoadingTeams && teams.length === 0) || draftOrder.length === 0) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6"></div>
        <h2 className="text-xl font-black font-oswald uppercase tracking-widest text-emerald-400">Loading Data...</h2>
        <p className="text-slate-500 text-sm mt-2 animate-pulse">
           {isLoadingTeams || draftOrder.length === 0 ? 'Fetching NFL Teams & Order...' : 'Syncing Prospects...'}
        </p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white p-6">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
        </div>
        <h2 className="text-xl font-black font-oswald uppercase tracking-widest text-red-400">Connection Failed</h2>
        <p className="text-slate-500 text-sm mt-2 text-center max-w-md">{fetchError}</p>
        <div className="flex gap-4 mt-8">
          <Button variant="secondary" onClick={() => window.location.reload()}>Retry Connection</Button>
          <Button variant="ghost" onClick={restartApp}>Exit to Home</Button>
        </div>
      </div>
    );
  }

  if (isBigBoardView) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-slate-950">
        <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 sticky top-0 z-40 shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button 
                onClick={restartApp}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-xl lg:text-3xl font-black font-oswald text-white uppercase tracking-tighter">
                Prospect <span className="text-emerald-500">Big Board</span>
              </h1>
            </div>
            {/* Start Simulator button removed as per request to be replaced by dropdown in BigBoard */}
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <BigBoard 
            prospects={state.prospects} 
            onSelectProspect={(p) => setSelectedProspectId(p.id)} 
          />
        </main>

        {selectedProspect && (
          <PlayerDetail 
            prospect={selectedProspect}
            allProspects={state.prospects}
            onClose={() => setSelectedProspectId(null)}
            showDraftYear={true}
            onDraft={(p) => {
               handleNavigate('/draftsim');
               setSelectedProspectId(null);
            }}
          />
        )}
      </div>
    );
  }

  if (isDraftView) {
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
              teams={teams}
              userControlledTeams={userControlledTeams} 
              setUserControlledTeams={setUserControlledTeams} 
              roundsToSimulate={roundsToSimulate}
              setRoundsToSimulate={setRoundsToSimulate}
              draftSpeed={draftSpeed}
              setDraftSpeed={setDraftSpeed}
              onStart={startDraft}
              onBack={restartApp}
            />
          )}

          {view === 'DRAFT' && (
            <DraftBoard 
              teams={teams}
              state={state} 
              onDraftPlayer={handleDraftPlayer}
              onSelectProspect={(p) => setSelectedProspectId(p.id)}
              selectedProspectId={selectedProspectId}
            />
          )}

          {view === 'SUMMARY' && (
            <Summary 
              teams={teams}
              state={state} 
              onRestart={restartApp} 
              onSelectProspect={(p) => setSelectedProspectId(p.id)}
            />
          )}

          {selectedProspect && (
            <PlayerDetail 
              prospect={selectedProspect}
              allProspects={state.prospects}
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
              allProspects={state.prospects}
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
              teams={teams}
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
          2026 NFL DRAFT SIMULATOR | SUNDAYSCOUTS.COM
        </footer>
      </div>
    );
  }

  // Fallback
  return (
    <HomePage 
      onStartDraft={() => handleNavigate('/draftsim')} 
      onGoToBigBoard={() => handleNavigate('/bigboard')} 
    />
  );
};

export default App;
