'use client';

import React, { useMemo, useState } from 'react';
import { Button } from './Button';
import { Team, DraftSpeed, DraftParticipant, OnlineRoomState } from '../types';
import { PARTICIPANT_COLORS } from '../lib/draftRoom';

interface DraftRoomLobbyProps {
  teams: Team[];
  roomState: OnlineRoomState;
  localParticipantId: string;
  roundsToSimulate: number;
  setRoundsToSimulate: (num: number) => void;
  draftSpeed: DraftSpeed;
  setDraftSpeed: (speed: DraftSpeed) => void;
  onSelectTeam: (teamId: string) => void;
  onDeselectTeam: () => void;
  onStartDraft: () => void;
  onBack: () => void;
}

export const DraftRoomLobby: React.FC<DraftRoomLobbyProps> = ({
  teams,
  roomState,
  localParticipantId,
  roundsToSimulate,
  setRoundsToSimulate,
  draftSpeed,
  setDraftSpeed,
  onSelectTeam,
  onDeselectTeam,
  onStartDraft,
  onBack,
}) => {
  const [copied, setCopied] = useState(false);

  const sortedTeams = useMemo(
    () => [...teams].sort((a, b) => a.name.localeCompare(b.name)),
    [teams]
  );

  const isHost = useMemo(
    () => roomState.participants.find(p => p.id === localParticipantId)?.isHost ?? false,
    [roomState.participants, localParticipantId]
  );

  const localParticipant = useMemo(
    () => roomState.participants.find(p => p.id === localParticipantId),
    [roomState.participants, localParticipantId]
  );

  const anyTeamSelected = roomState.participants.some(p => p.selectedTeamId !== null);

  // Map of teamId → participant who claimed it
  const teamClaimMap = useMemo(() => {
    const map: Record<string, DraftParticipant> = {};
    for (const p of roomState.participants) {
      if (p.selectedTeamId) {
        map[p.selectedTeamId] = p;
      }
    }
    return map;
  }, [roomState.participants]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomState.inviteCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for environments without clipboard API
      const el = document.createElement('textarea');
      el.value = roomState.inviteCode;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTeamClick = (teamId: string) => {
    // If team is claimed by someone else, do nothing
    if (teamClaimMap[teamId] && teamClaimMap[teamId].id !== localParticipantId) {
      return;
    }

    // If clicking on our own selected team, deselect
    if (localParticipant?.selectedTeamId === teamId) {
      onDeselectTeam();
    } else {
      onSelectTeam(teamId);
    }
  };

  return (
    <div className="h-full w-full flex flex-col animate-fadeIn overflow-hidden bg-slate-950">
      {/* Header */}
      <header className="relative text-center py-4 lg:py-6 shrink-0 bg-slate-900/30 border-b border-slate-800/50">
        <button
          onClick={onBack}
          className="absolute left-4 lg:left-8 top-1/2 -translate-y-1/2 p-2 lg:p-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all group flex items-center gap-2"
          title="Leave Room"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline text-xs font-black uppercase tracking-widest">Leave</span>
        </button>

        <h1 className="text-xl lg:text-3xl font-black font-oswald text-emerald-400 uppercase tracking-tight">
          Draft Room <span className="text-white">Lobby</span>
        </h1>
        <p className="text-slate-500 text-[10px] lg:text-sm font-bold uppercase tracking-[0.2em] mt-1">
          Multiplayer Draft
        </p>
      </header>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="max-w-5xl mx-auto">
          {/* Invite Code + Participants Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Invite Code Card */}
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/60">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                Invite Code
              </h3>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-800 rounded-xl px-4 py-3 text-center">
                  <span className="text-2xl lg:text-3xl font-black font-oswald text-emerald-400 tracking-[0.3em]">
                    {roomState.inviteCode}
                  </span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-all"
                  title="Copy invite code"
                >
                  {copied ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-[10px] text-slate-600 mt-2 text-center">
                Share this code with friends to join
              </p>
            </div>

            {/* Participants Panel */}
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/60">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Participants
                <span className="text-[10px] font-medium text-slate-600 px-2 py-0.5 bg-slate-800 rounded-full ml-auto">
                  {roomState.participants.length} / 4
                </span>
              </h3>
              <div className="space-y-2">
                {roomState.participants.map(p => {
                  const color = PARTICIPANT_COLORS[p.colorSlot] || '#3B82F6';
                  const team = p.selectedTeamId ? teams.find(t => t.id === p.selectedTeamId) : null;
                  return (
                    <div
                      key={p.id}
                      className="flex items-center gap-3 px-3 py-2 bg-slate-800/50 rounded-xl border"
                      style={{ borderColor: `${color}40` }}
                    >
                      <div
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span
                        className="text-sm font-bold flex-1 truncate"
                        style={{ color }}
                      >
                        {p.displayName}
                        {p.isHost && (
                          <span className="text-[9px] ml-2 text-slate-500 uppercase tracking-wider font-normal">
                            Host
                          </span>
                        )}
                        {p.id === localParticipantId && (
                          <span className="text-[9px] ml-1 text-slate-500 uppercase tracking-wider font-normal">
                            (You)
                          </span>
                        )}
                      </span>
                      {team && (
                        <div className="flex items-center gap-1.5">
                          <img src={team.logoUrl} alt={team.name} className="w-5 h-5 object-contain" />
                          <span className="text-[10px] font-bold text-slate-400">{team.nickname}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
                {/* Empty slots */}
                {Array.from({ length: 4 - roomState.participants.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="flex items-center gap-3 px-3 py-2 bg-slate-800/20 rounded-xl border border-slate-800/30 border-dashed"
                  >
                    <div className="w-3 h-3 rounded-full bg-slate-700 shrink-0" />
                    <span className="text-sm text-slate-700 italic">Waiting for player...</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Draft Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/60">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Draft Length (Rounds)
              </h3>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7].map((r) => (
                  <button
                    key={r}
                    onClick={() => isHost && setRoundsToSimulate(r)}
                    disabled={!isHost}
                    className={`flex-1 min-w-[45px] py-2 px-3 rounded-xl border font-oswald text-lg transition-all ${
                      roundsToSimulate === r
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
                    } ${!isHost ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/60">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Draft Speed
              </h3>
              <div className="flex gap-2">
                {(['SLOW', 'MEDIUM', 'FAST'] as DraftSpeed[]).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => isHost && setDraftSpeed(speed)}
                    disabled={!isHost}
                    className={`flex-1 py-2 px-4 rounded-xl border font-black text-[10px] tracking-widest transition-all uppercase ${
                      draftSpeed === speed
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
                    } ${!isHost ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Team Selection Label */}
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-xs lg:text-base font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              Select Your Team
              {localParticipant?.selectedTeamId && (
                <span className="text-[10px] font-medium text-emerald-500 px-2 py-0.5 bg-emerald-500/10 rounded-full">
                  ✓ Selected
                </span>
              )}
            </h2>
            <p className="text-[10px] text-slate-500">
              Each player drafts for one team
            </p>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2 pb-8">
            {sortedTeams.map((team) => {
              const claimer = teamClaimMap[team.id];
              const isClaimedByLocal = claimer?.id === localParticipantId;
              const isClaimedByOther = claimer && claimer.id !== localParticipantId;
              const claimerColor = claimer ? PARTICIPANT_COLORS[claimer.colorSlot] || '#3B82F6' : undefined;

              return (
                <button
                  key={team.id}
                  onClick={() => handleTeamClick(team.id)}
                  disabled={!!isClaimedByOther}
                  className={`relative flex flex-col items-center justify-center p-2 lg:p-3 rounded-xl border transition-all duration-200 aspect-square group ${
                    isClaimedByLocal
                      ? 'bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50'
                      : isClaimedByOther
                      ? 'opacity-50 cursor-not-allowed bg-slate-900/20'
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60'
                  }`}
                  style={{
                    borderColor: claimer ? claimerColor : undefined,
                  }}
                >
                  <div className="flex-1 flex items-center justify-center w-full min-h-0 mb-1">
                    <img
                      src={team.logoUrl}
                      alt={team.name}
                      className={`max-w-[80%] max-h-[80%] object-contain transition-transform group-hover:scale-110 ${
                        isClaimedByLocal
                          ? 'opacity-100'
                          : isClaimedByOther
                          ? 'opacity-40 grayscale'
                          : 'opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100'
                      }`}
                    />
                  </div>

                  <span
                    className={`text-[8px] lg:text-[10px] font-black uppercase text-center leading-none truncate w-full ${
                      isClaimedByLocal
                        ? 'text-emerald-400'
                        : isClaimedByOther
                        ? 'text-slate-600'
                        : 'text-slate-500'
                    }`}
                  >
                    {team.nickname}
                  </span>

                  {/* Claimer indicator */}
                  {claimer && (
                    <div className="absolute top-1 right-1 flex items-center gap-0.5">
                      <div
                        className="w-3 h-3 lg:w-4 lg:h-4 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-950"
                        style={{ backgroundColor: claimerColor }}
                      >
                        {isClaimedByLocal && (
                          <svg className="w-2 h-2 lg:w-2.5 lg:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Claimed by other - show name */}
                  {isClaimedByOther && (
                    <div
                      className="absolute bottom-0 left-0 right-0 text-center py-0.5 rounded-b-xl text-[7px] font-bold text-white truncate px-1"
                      style={{ backgroundColor: `${claimerColor}CC` }}
                    >
                      {claimer.displayName}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed Action Footer */}
      {isHost && (
        <div className="shrink-0 bg-slate-900 border-t border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20">
          <div className="max-w-md mx-auto px-6 py-4 lg:py-6 flex flex-col items-center gap-3">
            <Button
              variant="primary"
              onClick={onStartDraft}
              disabled={!anyTeamSelected}
              className="w-full h-12 lg:h-16 text-base lg:text-xl uppercase font-oswald tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              Start Draft
            </Button>

            <div className="h-4 flex items-center justify-center">
              {!anyTeamSelected ? (
                <p className="text-amber-500 text-[10px] lg:text-xs font-bold uppercase tracking-widest animate-pulse flex items-center gap-2">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  At least one player must select a team
                </p>
              ) : (
                <p className="text-slate-500 text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] opacity-80">
                  {roomState.participants.filter(p => p.selectedTeamId).length} player(s) ready • {draftSpeed} Speed
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {!isHost && (
        <div className="shrink-0 bg-slate-900 border-t border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20">
          <div className="max-w-md mx-auto px-6 py-4 flex flex-col items-center gap-2">
            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">
              Waiting for host to start the draft...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
