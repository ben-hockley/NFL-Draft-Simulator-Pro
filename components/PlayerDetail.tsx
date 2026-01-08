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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-4xl rounded-2xl md:rounded-3xl overflow-y-auto md:overflow-hidden max-h-[95vh] md:max-h-none shadow-[0_0_50px_rgba(0,0,0,0.5)] relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 md:top-6 md:right-6 p-1.5 md:p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 transition-colors z-20"
        >
          <svg className="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Visual Side */}
          <div className="w-full md:w-1/2 bg-slate-800 relative h-[250px] md:h-auto md:min-h-[450px] shrink-0">
            <img 
              src={prospect.headshotUrl} 
              alt={prospect.name} 
              className="w-full h-full object-cover object-top opacity-80"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
            <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8">
              <div className="flex flex-col gap-1.5 md:gap-2 mb-2 md:mb-3">
                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-emerald-500 text-white font-black text-[10px] md:text-sm rounded inline-block shadow-lg w-fit uppercase">
                  RANKED #{prospect.rank} OVERALL
                </span>
                <span className="px-2 py-0.5 md:px-3 md:py-1 bg-slate-700/80 backdrop-blur-sm text-slate-200 font-bold text-[9px] md:text-xs rounded inline-block w-fit uppercase tracking-wider">
                  #{positionRank} RANKED {prospect.position}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black font-oswald text-white uppercase leading-none tracking-tight">
                {prospect.name}
              </h2>
              <div className="flex items-center gap-3 md:gap-4 mt-1 md:mt-2 text-emerald-400 font-bold uppercase tracking-widest text-sm md:text-lg">
                <span>{prospect.position}</span>
                <span className="w-1 md:w-1.5 h-1 md:h-1.5 rounded-full bg-slate-600"></span>
                <div className="flex items-center gap-1.5 md:gap-2">
                  <img src={prospect.collegeLogoUrl} className="w-4 h-4 md:w-6 md:h-6 object-contain" alt="" />
                  <span>{prospect.college}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Info Side */}
          <div className="w-full md:w-1/2 p-5 md:p-10 flex flex-col">
            <div className="mb-6 md:mb-8">
              <h3 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 md:mb-4">Prospect Profile</h3>
              <div className="grid grid-cols-2 gap-4 md:gap-6">
                <div className="bg-slate-800/50 p-3 md:p-4 rounded-xl border border-slate-700">
                  <span className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase mb-0.5 md:mb-1">Height</span>
                  <span className="text-xl md:text-2xl font-oswald font-bold text-slate-100">{prospect.height}</span>
                </div>
                <div className="bg-slate-800/50 p-3 md:p-4 rounded-xl border border-slate-700">
                  <span className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase mb-0.5 md:mb-1">Weight</span>
                  <span className="text-xl md:text-2xl font-oswald font-bold text-slate-100">{prospect.weight} lbs</span>
                </div>
              </div>
            </div>

            <div className="flex-1 mb-6 md:mb-8">
              <h3 className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 md:mb-3">Scouting Summary</h3>
              <p className="text-slate-200 text-sm md:text-base leading-relaxed font-medium">
                {prospect.scoutingReport}
              </p>
              <p className="text-slate-500 text-[10px] mt-2 md:mt-4 italic">
                Source: 2026 Gridiron Pro Scouting Network
              </p>
            </div>

            <div className="mt-auto">
              {completedPick ? (
                <div className="flex items-center gap-3 md:gap-4 p-4 md:p-5 bg-slate-800 border border-slate-700 rounded-xl md:rounded-2xl">
                  <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center p-1.5 md:p-2 bg-slate-900 rounded-lg">
                    <img src={completedPick.team.logoUrl} className="max-w-full max-h-full" alt="" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[9px] md:text-[10px] font-bold text-slate-500 uppercase tracking-wider">Drafted At Pick #{completedPick.pickNumber}</span>
                    <span className="text-base md:text-lg font-black font-oswald text-white uppercase truncate block">Selected by {completedPick.team.name}</span>
                  </div>
                </div>
              ) : isUserTurn && currentTeam ? (
                <div className="space-y-3 md:space-y-4">
                  <div className="flex items-center gap-3 p-3 md:p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <img src={currentTeam.logoUrl} className="w-8 h-8 md:w-10 md:h-10" alt="" />
                    <div>
                      <span className="block text-[9px] md:text-[10px] font-bold text-emerald-500 uppercase">You are on the clock</span>
                      <span className="text-xs md:text-sm font-bold text-slate-200">Drafting for {currentTeam.name}</span>
                    </div>
                  </div>
                  <Button 
                    fullWidth 
                    className="h-12 md:h-16 text-lg md:text-xl uppercase font-oswald" 
                    onClick={() => onDraft(prospect)}
                  >
                    Draft {prospect.name.split(' ')[1]}
                  </Button>
                </div>
              ) : currentTeam ? (
                <div className="p-3 md:p-4 bg-slate-800 border border-slate-700 rounded-xl text-center">
                  <span className="text-slate-500 font-bold uppercase text-[10px] md:text-xs">Waiting for {currentTeam.name} to draft</span>
                </div>
              ) : (
                <div className="p-3 md:p-4 bg-slate-800 border border-slate-700 rounded-xl text-center">
                   <span className="text-slate-500 font-bold uppercase text-[10px] md:text-xs italic">Available for Selection</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
