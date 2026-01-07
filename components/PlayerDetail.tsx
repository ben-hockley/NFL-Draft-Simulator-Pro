
import React, { useMemo } from 'react';
import { Prospect, Team } from '../types';
import { Button } from './Button';
import { PROSPECTS } from '../constants';

interface PlayerDetailProps {
  prospect: Prospect | null;
  currentTeam?: Team;
  isUserTurn?: boolean;
  onDraft: (prospect: Prospect) => void;
  onClose: () => void;
  completedPick?: { team: Team; pickNumber: number };
}

export const PlayerDetail: React.FC<PlayerDetailProps> = ({ 
  prospect, 
  currentTeam, 
  isUserTurn, 
  onDraft,
  onClose,
  completedPick
}) => {
  const positionRank = useMemo(() => {
    if (!prospect) return 0;
    const posProspects = PROSPECTS
      .filter(p => p.position === prospect.position)
      .sort((a, b) => a.rank - b.rank);
    return posProspects.findIndex(p => p.id === prospect.id) + 1;
  }, [prospect]);

  if (!prospect) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors z-10"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Visual Side */}
          <div className="w-full md:w-1/2 bg-slate-800 relative min-h-[400px]">
            <img 
              src={prospect.headshotUrl} 
              alt={prospect.name} 
              className="w-full h-full object-cover opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            <div className="absolute bottom-8 left-8">
              <div className="flex flex-col gap-2 mb-3">
                <span className="px-3 py-1 bg-emerald-500 text-white font-black text-sm rounded inline-block shadow-lg w-fit">
                  RANKED #{prospect.rank} OVERALL
                </span>
                <span className="px-3 py-1 bg-slate-700/80 backdrop-blur-sm text-slate-200 font-bold text-xs rounded inline-block w-fit uppercase tracking-wider">
                  #{positionRank} RANKED {prospect.position}
                </span>
              </div>
              <h2 className="text-5xl font-black font-oswald text-white uppercase leading-none tracking-tight">
                {prospect.name}
              </h2>
              <div className="flex items-center gap-4 mt-2 text-emerald-400 font-bold uppercase tracking-widest text-lg">
                <span>{prospect.position}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
                <div className="flex items-center gap-2">
                  <img src={prospect.collegeLogoUrl} className="w-6 h-6 object-contain" alt="" />
                  <span>{prospect.college}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Side */}
          <div className="w-full md:w-1/2 p-10 flex flex-col">
            <div className="mb-8">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Prospect Profile</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Height</span>
                  <span className="text-2xl font-oswald font-bold text-slate-100">{prospect.height}</span>
                </div>
                <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700">
                  <span className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Weight</span>
                  <span className="text-2xl font-oswald font-bold text-slate-100">{prospect.weight} lbs</span>
                </div>
              </div>
            </div>

            <div className="flex-1 mb-8">
              <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Scouting Summary</h3>
              <p className="text-slate-400 text-sm leading-relaxed italic">
                {prospect.name} is widely regarded as one of the premier talents in this draft class. 
                His performance at {prospect.college} showed exceptional elite-level traits at {prospect.position}.
              </p>
            </div>

            <div className="mt-auto">
              {completedPick ? (
                <div className="flex items-center gap-4 p-5 bg-slate-800 border border-slate-700 rounded-2xl">
                  <div className="w-12 h-12 flex items-center justify-center p-2 bg-slate-900 rounded-lg">
                    <img src={completedPick.team.logoUrl} className="max-w-full max-h-full" alt="" />
                  </div>
                  <div>
                    <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Drafted At Pick #{completedPick.pickNumber}</span>
                    <span className="text-lg font-black font-oswald text-white uppercase">Selected by {completedPick.team.name}</span>
                  </div>
                </div>
              ) : isUserTurn && currentTeam ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <img src={currentTeam.logoUrl} className="w-10 h-10" alt="" />
                    <div>
                      <span className="block text-[10px] font-bold text-emerald-500 uppercase">You are on the clock</span>
                      <span className="text-sm font-bold text-slate-200">Drafting for {currentTeam.name}</span>
                    </div>
                  </div>
                  <Button 
                    fullWidth 
                    className="h-16 text-xl uppercase font-oswald" 
                    onClick={() => onDraft(prospect)}
                  >
                    Draft {prospect.name.split(' ')[1]}
                  </Button>
                </div>
              ) : currentTeam ? (
                <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl text-center">
                  <span className="text-slate-500 font-bold uppercase text-xs">Waiting for {currentTeam.name} to draft</span>
                </div>
              ) : (
                <div className="p-4 bg-slate-800 border border-slate-700 rounded-xl text-center">
                   <span className="text-slate-500 font-bold uppercase text-xs italic">Available for Selection</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
