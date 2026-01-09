
import React, { useState } from 'react';
import { TEAMS } from '../constants';
import { Button } from './Button';
import { Team, DraftSpeed } from '../types';

interface LobbyProps {
  userControlledTeams: string[];
  setUserControlledTeams: (ids: string[]) => void;
  roundsToSimulate: number;
  setRoundsToSimulate: (num: number) => void;
  draftSpeed: DraftSpeed;
  setDraftSpeed: (speed: DraftSpeed) => void;
  onStart: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({ 
  userControlledTeams, 
  setUserControlledTeams, 
  roundsToSimulate,
  setRoundsToSimulate,
  draftSpeed,
  setDraftSpeed,
  onStart 
}) => {
  const toggleTeam = (teamId: string) => {
    if (userControlledTeams.includes(teamId)) {
      setUserControlledTeams(userControlledTeams.filter(id => id !== teamId));
    } else {
      setUserControlledTeams([...userControlledTeams, teamId]);
    }
  };

  const selectAll = () => setUserControlledTeams(TEAMS.map(t => t.id));
  const deselectAll = () => setUserControlledTeams([]);

  return (
    <div className="h-full w-full flex flex-col animate-fadeIn overflow-hidden bg-slate-950">
      {/* Header Section - Compact and Fixed */}
      <header className="text-center py-3 lg:py-6 shrink-0 bg-slate-900/30 border-b border-slate-800/50">
        <h1 className="text-2xl lg:text-4xl font-black font-oswald text-emerald-400 uppercase tracking-tight">
          2026 NFL Draft Simulator
        </h1>
        <p className="text-slate-400 text-[10px] lg:text-sm">
          Select the team(s) you wish to control
        </p>
      </header>

      {/* Main Selection Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Rounds Selection */}
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/60">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Draft Length (Rounds)
              </h3>
              <div className="flex gap-2 flex-wrap">
                {[1, 2, 3, 4, 5, 6, 7].map((r) => (
                  <button
                    key={r}
                    onClick={() => setRoundsToSimulate(r)}
                    className={`flex-1 min-w-[45px] py-2 px-3 rounded-xl border font-oswald text-lg transition-all ${
                      roundsToSimulate === r
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Speed Selection */}
            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800/60">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                Draft Speed
              </h3>
              <div className="flex gap-2">
                {(['SLOW', 'MEDIUM', 'FAST'] as DraftSpeed[]).map((speed) => (
                  <button
                    key={speed}
                    onClick={() => setDraftSpeed(speed)}
                    className={`flex-1 py-2 px-4 rounded-xl border font-black text-[10px] tracking-widest transition-all uppercase ${
                      draftSpeed === speed
                        ? 'bg-emerald-500 border-emerald-400 text-white shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                        : 'bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-600'
                    }`}
                  >
                    {speed}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Control Bar */}
          <div className="flex justify-between items-center mb-4 px-1">
            <h2 className="text-xs lg:text-base font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              Team Selection 
              <span className="text-[10px] font-medium text-slate-500 normal-case px-2 py-0.5 bg-slate-800 rounded-full">
                {userControlledTeams.length} Selected
              </span>
            </h2>
            <div className="flex gap-3">
              <button 
                onClick={selectAll} 
                className="text-[10px] lg:text-xs font-bold text-emerald-500 hover:text-emerald-400 uppercase tracking-wider transition-colors"
              >
                Select All
              </button>
              <span className="text-slate-800">|</span>
              <button 
                onClick={deselectAll} 
                className="text-[10px] lg:text-xs font-bold text-slate-500 hover:text-slate-400 uppercase tracking-wider transition-colors"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Team Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 lg:grid-cols-8 gap-2 pb-8">
            {TEAMS.map((team) => {
              const isSelected = userControlledTeams.includes(team.id);
              return (
                <button
                  key={team.id}
                  onClick={() => toggleTeam(team.id)}
                  className={`relative flex flex-col items-center justify-center p-2 lg:p-3 rounded-xl border transition-all duration-200 aspect-square group ${
                    isSelected 
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)] ring-1 ring-emerald-500/50' 
                      : 'border-slate-800 bg-slate-900/40 hover:border-slate-600 hover:bg-slate-900/60'
                  }`}
                >
                  <div className="flex-1 flex items-center justify-center w-full min-h-0 mb-1">
                    <img 
                      src={team.logoUrl} 
                      alt={team.name} 
                      className={`max-w-[80%] max-h-[80%] object-contain transition-transform group-hover:scale-110 ${isSelected ? 'opacity-100' : 'opacity-60 grayscale group-hover:grayscale-0 group-hover:opacity-100'}`} 
                    />
                  </div>
                  
                  <span className={`text-[8px] lg:text-[10px] font-black uppercase text-center leading-none truncate w-full ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`}>
                    {team.id}
                  </span>

                  {isSelected && (
                    <div className="absolute top-1 right-1 w-3 h-3 lg:w-4 lg:h-4 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg border-2 border-slate-950">
                      <svg className="w-2 h-2 lg:w-2.5 lg:h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Fixed Action Footer - "The Separate Box" */}
      <div className="shrink-0 bg-slate-900 border-t border-slate-800 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-20">
        <div className="max-w-md mx-auto px-6 py-4 lg:py-6 flex flex-col items-center gap-3">
          <Button 
            variant="primary" 
            onClick={onStart} 
            disabled={userControlledTeams.length === 0}
            className="w-full h-12 lg:h-16 text-base lg:text-xl uppercase font-oswald tracking-[0.2em] shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Start Simulation
          </Button>
          
          <div className="h-4 flex items-center justify-center">
            {userControlledTeams.length === 0 ? (
              <p className="text-amber-500 text-[10px] lg:text-xs font-bold uppercase tracking-widest animate-pulse flex items-center gap-2">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                Select at least one team to begin
              </p>
            ) : (
              <p className="text-slate-500 text-[10px] lg:text-xs font-bold uppercase tracking-[0.2em] opacity-80">
                Drafting as {userControlledTeams.length} {userControlledTeams.length === 1 ? 'Team' : 'Teams'} &bull; {draftSpeed} Speed
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
