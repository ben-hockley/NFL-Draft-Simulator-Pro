
import React from 'react';
import { TEAMS } from '../constants';
import { Button } from './Button';
import { Team } from '../types';

interface LobbyProps {
  userControlledTeams: string[];
  setUserControlledTeams: (ids: string[]) => void;
  onStart: () => void;
}

export const Lobby: React.FC<LobbyProps> = ({ 
  userControlledTeams, 
  setUserControlledTeams, 
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
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-8 backdrop-blur-sm">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold font-oswald text-emerald-400 mb-2 uppercase tracking-tight">Draft Simulator Pro</h1>
          <p className="text-slate-400">Select the team(s) you wish to control during the 2026 NFL Draft.</p>
        </header>

        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-slate-200">Team Selection</h2>
          <div className="flex gap-2">
            <Button variant="ghost" onClick={selectAll} className="text-xs py-1 px-3">Select All</Button>
            <Button variant="ghost" onClick={deselectAll} className="text-xs py-1 px-3">Deselect All</Button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
          {TEAMS.map((team) => {
            const isSelected = userControlledTeams.includes(team.id);
            return (
              <button
                key={team.id}
                onClick={() => toggleTeam(team.id)}
                className={`relative group flex flex-col items-center p-4 rounded-xl border-2 transition-all duration-200 ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'border-slate-700 bg-slate-800/80 hover:border-slate-500'
                }`}
              >
                <div className="mb-3 w-12 h-12 flex items-center justify-center">
                  <img src={team.logoUrl} alt={team.name} className="max-w-full max-h-full object-contain" />
                </div>
                <span className="text-[10px] font-bold uppercase text-center text-slate-300 leading-tight">
                  {team.name}
                </span>
                {isSelected && (
                  <div className="absolute top-2 right-2 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center">
                    <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="mt-2 text-[10px] text-slate-500 font-semibold uppercase">
                  {isSelected ? 'User' : 'CPU'}
                </div>
              </button>
            );
          })}
        </div>

        <div className="flex flex-col items-center gap-4">
          <Button 
            variant="primary" 
            onClick={onStart} 
            disabled={userControlledTeams.length === 0}
            className="w-full max-w-sm h-16 text-xl uppercase font-oswald tracking-widest"
          >
            Start Simulation
          </Button>
          {userControlledTeams.length === 0 && (
            <p className="text-amber-400 text-sm font-medium animate-pulse">Please select at least one team to start.</p>
          )}
        </div>
      </div>
    </div>
  );
};
