'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/supabase';
import {
  DraftState,
  DraftPick,
  DraftSpeed,
  Prospect,
  Team,
  DraftParticipant,
  OnlineRoomState,
} from '@/types';
import { getEspnUrl, getCollegeLogoUrl } from '@/constants';
import {
  fetchRoomByInviteCode,
  subscribeToRoom,
  updateSelectedTeam,
  updateRoomStatus,
  updateRoomDraftState,
  broadcastPick,
  broadcastStartDraft,
  broadcastHostChanged,
  updateRoomHost,
  unsubscribeFromRoom,
  markDisconnected,
  PARTICIPANT_COLORS,
} from '@/lib/draftRoom';
import { DraftRoomLobby } from '@/components/DraftRoomLobby';
import { DraftBoard } from '@/components/DraftBoard';
import { PlayerDetail } from '@/components/PlayerDetail';
import { Summary } from '@/components/Summary';
import { OnTheClockBanner } from '@/components/OnTheClockBanner';
import { Button } from '@/components/Button';
import type { RealtimeChannel } from '@supabase/supabase-js';

type RoomView = 'LOADING' | 'LOBBY' | 'DRAFT' | 'SUMMARY' | 'ERROR';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const inviteCode = (params?.inviteCode as string) || '';

  const [roomView, setRoomView] = useState<RoomView>('LOADING');
  const [errorMsg, setErrorMsg] = useState('');
  const [roomState, setRoomState] = useState<OnlineRoomState | null>(null);
  const [localParticipantId, setLocalParticipantId] = useState('');

  // Draft configuration
  const [roundsToSimulate, setRoundsToSimulate] = useState(1);
  const [draftSpeed, setDraftSpeed] = useState<DraftSpeed>('MEDIUM');

  // Data
  const [teams, setTeams] = useState<Team[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [draftOrder, setDraftOrder] = useState<{ pick: number; round: number; short_name: string }[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Draft state
  const [draftState, setDraftState] = useState<DraftState | null>(null);
  const [selectedProspectId, setSelectedProspectId] = useState<string | null>(null);
  const [hostDisconnectWarning, setHostDisconnectWarning] = useState(false);

  const channelRef = useRef<RealtimeChannel | null>(null);

  // Load participant ID from sessionStorage
  useEffect(() => {
    const pid = sessionStorage.getItem('draftRoom_participantId');
    if (pid) {
      setLocalParticipantId(pid);
    } else {
      setErrorMsg('No session found. Please create or join a room first.');
      setRoomView('ERROR');
    }
  }, []);

  // Fetch initial data (teams, prospects, draft order)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoadingData(true);
      try {
        const [teamsRes, orderRes, prospectsRes, collegesRes] = await Promise.all([
          supabase.from('NFL_Teams').select('*'),
          supabase.from('draft_order').select('*').order('pick', { ascending: true }),
          supabase.from('prospects').select('*').order('rank', { ascending: true }),
          supabase.from('Colleges').select('*'),
        ]);

        if (teamsRes.error) throw teamsRes.error;
        if (orderRes.error) throw orderRes.error;
        if (prospectsRes.error) throw prospectsRes.error;

        const mappedTeams: Team[] = (teamsRes.data || []).map((t: Record<string, unknown>) => ({
          id: t.short_name as string,
          name: t.name as string,
          nickname: t.nickname as string,
          logoUrl: t.logoUrl as string,
          color: t.color as string,
          needs: t.needs as string[],
        }));
        setTeams(mappedTeams);
        setDraftOrder(orderRes.data || []);

        const collegeMap: Record<string, number> = {};
        if (collegesRes.data) {
          collegesRes.data.forEach((c: Record<string, unknown>) => {
            if (c.college && c.espn_id) {
              collegeMap[c.college as string] = c.espn_id as number;
            }
          });
        }

        const mappedProspects: Prospect[] = (prospectsRes.data || []).map((p: Record<string, unknown>) => {
          const collegeName = (p.College || p.college || 'Unknown College') as string;
          const collegeId = collegeMap[collegeName];
          return {
            id: ((p.id || p.ID || '') as string | number).toString(),
            espnId: (p.espnId || p.espnid || 0) as number,
            name: (p.Name || p.name || 'Unknown Player') as string,
            college: collegeName,
            position: (p.Position || p.position || 'N/A') as string,
            summary: (p.Summary || p.summary || '') as string,
            bio: (p.Bio || p.bio || '') as string,
            rank: (p.rank || p.Rank || 999) as number,
            headshotUrl: getEspnUrl((p.espnId || p.espnid || 0) as number),
            collegeLogoUrl: getCollegeLogoUrl(collegeId, collegeName),
            strengths: p.Strengths
              ? typeof p.Strengths === 'string'
                ? (p.Strengths as string).split(',').map((s: string) => s.trim())
                : (p.Strengths as string[])
              : [],
            weaknesses: p.Weaknesses
              ? typeof p.Weaknesses === 'string'
                ? (p.Weaknesses as string).split(',').map((s: string) => s.trim())
                : (p.Weaknesses as string[])
              : [],
            recruitingStars: (p.RecruitingStars ?? p.recruiting_stars ?? null) as number | null,
            link247: (p['247Link'] ?? p['247link'] ?? p.link247 ?? null) as string | null,
            nflComparison: (p.NFLComparison ?? p.nfl_comparison ?? p.nflComparison ?? null) as string | null,
            allAmerican: !!(p.all_american ?? p.AllAmerican ?? false),
            nflBloodline: !!(p.nfl_bloodline ?? p.NFLBloodline ?? false),
            freaksList: !!(p.freaks_list ?? p.FreaksList ?? false),
            draftYear: (p.draft_year || p.DraftYear || 2026) as number,
            combine: {
              fortyYardDash: (p['40_yard_dash'] || null) as number | null,
              tenYardSplit: (p['10_yard_spli'] || p['10_yard_split'] || null) as number | null,
              threeConeDrill: (p['3_cone_drill'] || null) as number | null,
              twentyYardShuttle: (p['20_yard_shuttle'] || null) as number | null,
              verticalJump: (p['vertical_jump'] || null) as number | null,
              broadJump: (p['broad_jump'] || null) as number | null,
              benchPress: (p['bench-press'] || p['bench_press'] || null) as number | null,
            },
          };
        });
        setProspects(mappedProspects);
      } catch (err) {
        console.error('Failed to load data:', err);
        setErrorMsg('Failed to load NFL data.');
        setRoomView('ERROR');
      } finally {
        setIsLoadingData(false);
      }
    };
    fetchData();
  }, []);

  // Fetch room state and subscribe to realtime
  useEffect(() => {
    if (!localParticipantId || !inviteCode) return;

    let mounted = true;

    const initRoom = async () => {
      const room = await fetchRoomByInviteCode(inviteCode);
      if (!room) {
        if (mounted) {
          setErrorMsg('Room not found.');
          setRoomView('ERROR');
        }
        return;
      }

      if (mounted) {
        setRoomState(room);
        if (room.status === 'LOBBY') {
          setRoomView('LOBBY');
        } else if (room.status === 'DRAFTING') {
          setRoomView('DRAFT');
        } else {
          setRoomView('SUMMARY');
        }
      }

      // Subscribe to realtime changes
      const channel = subscribeToRoom(room.roomId, {
        onParticipantChange: (participants, hostId) => {
          if (!mounted) return;
          setRoomState(prev => {
            if (!prev) return prev;
            return { ...prev, participants: participants.map(p => ({ ...p, isHost: p.id === hostId })) };
          });
        },
        onRoomStatusChange: (status, newDraftState) => {
          if (!mounted) return;
          setRoomState(prev => (prev ? { ...prev, status } : prev));

          if (status === 'DRAFTING' && newDraftState) {
            setDraftState(newDraftState);
            setRoomView('DRAFT');
          } else if (status === 'COMPLETE') {
            setRoomView('SUMMARY');
            // Unsubscribe on complete
            if (channelRef.current) {
              unsubscribeFromRoom(channelRef.current);
              channelRef.current = null;
            }
          }
        },
        onBroadcast: (event, payload) => {
          if (!mounted) return;
          if (event === 'START_DRAFT') {
            const ds = (payload as { draftState: DraftState }).draftState;
            if (ds) {
              setDraftState(ds);
              setRoomView('DRAFT');
            }
          } else if (event === 'PICK_MADE') {
            const { pickNumber, playerId, participantId } = payload as {
              pickNumber: number;
              playerId: string;
              participantId: string;
            };
            setDraftState(prev => {
              if (!prev) return prev;
              const picksInScope = prev.picks.filter(p => p.round <= prev.roundsToSimulate);
              const newPicks = [...prev.picks];
              const scopeIdx = picksInScope.findIndex(p => p.pickNumber === pickNumber);
              if (scopeIdx === -1) return prev;
              const actualIdx = newPicks.findIndex(p => p.pickNumber === pickNumber);
              if (actualIdx !== -1) {
                newPicks[actualIdx] = {
                  ...newPicks[actualIdx],
                  selectedPlayerId: playerId,
                  madeByParticipantId: participantId,
                };
              }
              return {
                ...prev,
                currentPickIndex: scopeIdx + 1,
                picks: newPicks,
              };
            });
          } else if (event === 'HOST_CHANGED') {
            const { newHostId } = payload as { newHostId: string };
            setRoomState(prev => {
              if (!prev) return prev;
              return {
                ...prev,
                participants: prev.participants.map(p => ({
                  ...p,
                  isHost: p.id === newHostId,
                })),
              };
            });
            setHostDisconnectWarning(false);
          }
        },
      });

      channelRef.current = channel;
    };

    initRoom();

    return () => {
      mounted = false;
      if (channelRef.current) {
        unsubscribeFromRoom(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [localParticipantId, inviteCode]);

  // Mark disconnected on page unload (best-effort, may not complete)
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (localParticipantId) {
        // Fire-and-forget: browser may terminate before completion
        void markDisconnected(localParticipantId);
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [localParticipantId]);

  // Handle team selection
  const handleSelectTeam = useCallback(
    async (teamId: string) => {
      await updateSelectedTeam(localParticipantId, teamId);
    },
    [localParticipantId]
  );

  const handleDeselectTeam = useCallback(async () => {
    await updateSelectedTeam(localParticipantId, null);
  }, [localParticipantId]);

  // Start draft (host only)
  const handleStartDraft = useCallback(async () => {
    if (!roomState || !teams.length || !draftOrder.length) return;

    // Build draft picks
    const allPicks: DraftPick[] = draftOrder.map(pick => {
      const team = teams.find(t => t.id === pick.short_name);
      return {
        pickNumber: pick.pick,
        round: pick.round,
        team: team || teams[0],
        selectedPlayerId: undefined,
        isTraded: false,
      };
    });

    const futurePicks: Record<string, number[]> = {};
    teams.forEach(t => {
      futurePicks[t.id] = [1, 2, 3, 4, 5, 6, 7];
    });

    // User controlled teams = all teams claimed by any participant
    const userControlledTeams = roomState.participants
      .filter(p => p.selectedTeamId)
      .map(p => p.selectedTeamId!);

    const newDraftState: DraftState = {
      currentPickIndex: 0,
      picks: allPicks,
      userControlledTeams,
      isDraftStarted: true,
      prospects,
      roundsToSimulate,
      draftSpeed,
      futurePicks,
    };

    setDraftState(newDraftState);

    // Update room in DB
    await updateRoomStatus(roomState.roomId, 'DRAFTING');
    await updateRoomDraftState(roomState.roomId, newDraftState);

    // Broadcast to all clients
    if (channelRef.current) {
      broadcastStartDraft(channelRef.current, { draftState: newDraftState });
    }

    setRoomView('DRAFT');
  }, [roomState, teams, draftOrder, prospects, roundsToSimulate, draftSpeed]);

  // Handle drafting a player
  const handleDraftPlayer = useCallback(
    (prospect: Prospect) => {
      if (!draftState || !roomState) return;

      const picksInScope = draftState.picks.filter(p => p.round <= draftState.roundsToSimulate);
      if (draftState.currentPickIndex >= picksInScope.length) return;

      const currentPick = picksInScope[draftState.currentPickIndex];

      // Check if this is the local user's turn
      const localTeamId = roomState.participants.find(p => p.id === localParticipantId)?.selectedTeamId;
      if (currentPick.team.id !== localTeamId) return;

      // Apply pick locally
      const newPicks = [...draftState.picks];
      const actualIdx = newPicks.findIndex(p => p.pickNumber === currentPick.pickNumber);
      if (actualIdx !== -1) {
        newPicks[actualIdx] = {
          ...newPicks[actualIdx],
          selectedPlayerId: prospect.id,
          madeByParticipantId: localParticipantId,
        };
      }

      const nextIndex = draftState.currentPickIndex + 1;
      setDraftState(prev =>
        prev ? { ...prev, currentPickIndex: nextIndex, picks: newPicks } : prev
      );

      // Broadcast pick to all other clients
      if (channelRef.current) {
        broadcastPick(channelRef.current, {
          pickNumber: currentPick.pickNumber,
          playerId: prospect.id,
          participantId: localParticipantId,
        });
      }

      // Update DB draft state
      if (roomState) {
        updateRoomDraftState(roomState.roomId, {
          ...draftState,
          currentPickIndex: nextIndex,
          picks: newPicks,
        });
      }

      setSelectedProspectId(null);
    },
    [draftState, roomState, localParticipantId]
  );

  // CPU auto-pick logic
  useEffect(() => {
    if (roomView !== 'DRAFT' || !draftState || !roomState) return;

    const picksInScope = draftState.picks.filter(p => p.round <= draftState.roundsToSimulate);
    if (draftState.currentPickIndex >= picksInScope.length) {
      // Draft complete
      setRoomView('SUMMARY');
      if (roomState.participants.find(p => p.id === localParticipantId)?.isHost) {
        updateRoomStatus(roomState.roomId, 'COMPLETE');
      }
      return;
    }

    const currentPick = picksInScope[draftState.currentPickIndex];
    if (!currentPick) return;

    // Check if current team is controlled by any participant
    const controllingParticipant = roomState.participants.find(
      p => p.selectedTeamId === currentPick.team.id
    );

    if (controllingParticipant) return; // Human turn - wait for them

    // Only the host runs CPU picks to avoid duplicates
    const isHost = roomState.participants.find(p => p.id === localParticipantId)?.isHost;
    if (!isHost) return;

    const speedMap = { SLOW: 3000, MEDIUM: 1500, FAST: 400 };
    const timer = setTimeout(() => {
      const draftedIds = draftState.picks.map(p => p.selectedPlayerId).filter(Boolean);
      const available = (draftState.prospects.length > 0 ? draftState.prospects : prospects)
        .filter(p => !draftedIds.includes(p.id) && p.draftYear === 2026)
        .sort((a, b) => a.rank - b.rank);

      if (available.length === 0) return;

      const teamNeeds = currentPick.team.needs;
      const teamId = currentPick.team.id;
      const draftedPositionsByTeam = draftState.picks
        .filter(p => p.team.id === teamId && p.selectedPlayerId)
        .map(p => {
          const player = (draftState.prospects.length > 0 ? draftState.prospects : prospects).find(
            pro => pro.id === p.selectedPlayerId
          );
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

      // Apply CPU pick
      const newPicks = [...draftState.picks];
      const actualIdx = newPicks.findIndex(p => p.pickNumber === currentPick.pickNumber);
      if (actualIdx !== -1) {
        newPicks[actualIdx] = {
          ...newPicks[actualIdx],
          selectedPlayerId: selection.id,
          // No madeByParticipantId = AI pick
        };
      }

      const nextIndex = draftState.currentPickIndex + 1;
      setDraftState(prev =>
        prev ? { ...prev, currentPickIndex: nextIndex, picks: newPicks } : prev
      );

      // Broadcast CPU pick
      if (channelRef.current) {
        broadcastPick(channelRef.current, {
          pickNumber: currentPick.pickNumber,
          playerId: selection.id,
          participantId: '', // empty = AI
        });
      }

      // Update DB
      updateRoomDraftState(roomState.roomId, {
        ...draftState,
        currentPickIndex: nextIndex,
        picks: newPicks,
      });
    }, speedMap[draftState.draftSpeed]);

    return () => clearTimeout(timer);
  }, [roomView, draftState, roomState, localParticipantId, prospects]);

  // Current pick info for draft view
  const currentPickInfo = useMemo(() => {
    if (!draftState) return null;
    const picksInScope = draftState.picks.filter(p => p.round <= draftState.roundsToSimulate);
    return picksInScope[draftState.currentPickIndex] || null;
  }, [draftState]);

  const currentPickParticipant = useMemo(() => {
    if (!currentPickInfo || !roomState) return null;
    return roomState.participants.find(p => p.selectedTeamId === currentPickInfo.team.id) || null;
  }, [currentPickInfo, roomState]);

  const isLocalUserTurn = useMemo(() => {
    if (!currentPickInfo || !roomState) return false;
    const localTeamId = roomState.participants.find(p => p.id === localParticipantId)?.selectedTeamId;
    return currentPickInfo.team.id === localTeamId;
  }, [currentPickInfo, roomState, localParticipantId]);

  const selectedProspect = useMemo(
    () => prospects.find(p => p.id === selectedProspectId) || null,
    [selectedProspectId, prospects]
  );

  const handleLeaveRoom = useCallback(async () => {
    if (localParticipantId) {
      await markDisconnected(localParticipantId);
    }
    if (channelRef.current) {
      unsubscribeFromRoom(channelRef.current);
      channelRef.current = null;
    }
    router.push('/');
  }, [localParticipantId, router]);

  // Loading state
  if (roomView === 'LOADING' || isLoadingData) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white">
        <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6" />
        <h2 className="text-xl font-black font-oswald uppercase tracking-widest text-emerald-400">
          Loading Draft Room...
        </h2>
      </div>
    );
  }

  // Error state
  if (roomView === 'ERROR') {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white p-6">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-black font-oswald uppercase tracking-widest text-red-400">Error</h2>
        <p className="text-slate-500 text-sm mt-2 text-center max-w-md">{errorMsg}</p>
        <button
          onClick={() => router.push('/')}
          className="mt-6 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
        >
          Return Home
        </button>
      </div>
    );
  }

  // Lobby view
  if (roomView === 'LOBBY' && roomState) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-slate-950">
        <DraftRoomLobby
          teams={teams}
          roomState={roomState}
          localParticipantId={localParticipantId}
          roundsToSimulate={roundsToSimulate}
          setRoundsToSimulate={setRoundsToSimulate}
          draftSpeed={draftSpeed}
          setDraftSpeed={setDraftSpeed}
          onSelectTeam={handleSelectTeam}
          onDeselectTeam={handleDeselectTeam}
          onStartDraft={handleStartDraft}
          onBack={handleLeaveRoom}
        />
      </div>
    );
  }

  // Draft view
  if (roomView === 'DRAFT' && draftState && roomState) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-slate-950">
        {/* On the clock banner */}
        <OnTheClockBanner
          participant={currentPickParticipant}
          isLocalUser={isLocalUserTurn}
        />

        {/* Host disconnect warning */}
        {hostDisconnectWarning && (
          <div className="w-full py-2 px-4 bg-amber-500/20 border-b border-amber-500/50 text-center">
            <p className="text-amber-400 text-sm font-bold">
              ⚠️ Host disconnected. A new host will be assigned automatically.
            </p>
          </div>
        )}

        {/* Draft header */}
        <header className="bg-slate-900 border-b border-slate-800 px-4 py-2 lg:py-3 sticky top-0 z-40 shrink-0">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 lg:gap-4">
            <div className="flex items-center gap-3 lg:gap-6 flex-1 min-w-0">
              <div className="flex flex-col shrink-0">
                <span className="text-[8px] lg:text-[10px] font-black uppercase text-emerald-500 tracking-widest">
                  Pick #{draftState.currentPickIndex + 1}
                </span>
                <span className="text-sm lg:text-xl font-black font-oswald text-slate-100 italic leading-none">
                  Round {currentPickInfo?.round || 1}
                </span>
              </div>
              <div className="h-10 lg:h-12 w-px bg-slate-800 shrink-0" />
              {currentPickInfo && (
                <div className="flex items-center gap-2 lg:gap-4 flex-1 min-w-0">
                  <div className="w-8 h-8 lg:w-12 lg:h-12 flex items-center justify-center p-1.5 lg:p-2 bg-slate-800 rounded-lg lg:rounded-xl border border-slate-700 shrink-0">
                    <img src={currentPickInfo.team.logoUrl} alt={currentPickInfo.team.name} className="max-w-full max-h-full" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <h2 className="text-sm lg:text-xl font-black font-oswald uppercase text-slate-100 tracking-tight leading-none truncate">
                      {currentPickInfo.team.name}
                    </h2>
                    <span className="text-[7px] lg:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {isLocalUserTurn ? 'Your Turn' : currentPickParticipant ? `${currentPickParticipant.displayName}'s Turn` : 'CPU'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <Button
              variant="ghost"
              onClick={handleLeaveRoom}
              className="w-8 h-8 lg:w-10 lg:h-10 !p-0 border border-slate-700 text-slate-400 hover:text-white"
              title="Leave Room"
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </Button>
          </div>
        </header>

        <main className="flex-1 overflow-hidden">
          <DraftBoard
            teams={teams}
            state={draftState}
            onDraftPlayer={isLocalUserTurn ? handleDraftPlayer : () => {}}
            onSelectProspect={p => setSelectedProspectId(p.id)}
            selectedProspectId={selectedProspectId}
          />
        </main>

        {selectedProspect && (
          <PlayerDetail
            prospect={selectedProspect}
            allProspects={prospects}
            currentTeam={currentPickInfo?.team}
            isUserTurn={isLocalUserTurn}
            onDraft={handleDraftPlayer}
            onClose={() => setSelectedProspectId(null)}
          />
        )}
      </div>
    );
  }

  // Summary view
  if (roomView === 'SUMMARY' && draftState) {
    return (
      <div className="h-screen flex flex-col overflow-hidden bg-slate-950">
        <Summary
          teams={teams}
          state={draftState}
          onRestart={handleLeaveRoom}
          onSelectProspect={p => setSelectedProspectId(p.id)}
        />

        {selectedProspect && (
          <PlayerDetail
            prospect={selectedProspect}
            allProspects={prospects}
            onDraft={() => {}}
            onClose={() => setSelectedProspectId(null)}
          />
        )}
      </div>
    );
  }

  // Fallback
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950">
      <p className="text-slate-400">Something went wrong. Please try again.</p>
      <button
        onClick={() => router.push('/')}
        className="mt-4 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-colors"
      >
        Return Home
      </button>
    </div>
  );
}
