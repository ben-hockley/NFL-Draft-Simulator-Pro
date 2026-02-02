
import React, { useState, useMemo } from 'react';
import { Prospect, Position } from '../types';
// Import the Button component used in the "No Prospects Found" state.
import { Button } from './Button';

interface BigBoardProps {
  prospects: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
}

const POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'EDGE', 'DL', 'LB', 'CB', 'S', 'K', 'P', 'LS'];

export const BigBoard: React.FC<BigBoardProps> = ({ prospects, onSelectProspect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState<Position | 'ALL'>('ALL');
  const [collegeFilter, setCollegeFilter] = useState('ALL');

  const uniqueColleges = useMemo(() => {
    return Array.from(new Set(prospects.map(p => p.college))).sort();
  }, [prospects]);

  const filteredProspects = useMemo(() => {
    return prospects.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPos = posFilter === 'ALL' || p.position === posFilter;
      const matchesCollege = collegeFilter === 'ALL' || p.college === collegeFilter;
      return matchesSearch && matchesPos && matchesCollege;
    });
  }, [prospects, searchTerm, posFilter, collegeFilter]);

  const getPositionRank = (prospect: Prospect) => {
    const posProspects = prospects
      .filter(p => p.position === prospect.position)
      .sort((a, b) => a.rank - b.rank);
    return posProspects.findIndex(p => p.id === prospect.id) + 1;
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 animate-fadeIn overflow-hidden">
      {/* Filters Bar */}
      <div className="bg-slate-900/50 border-b border-slate-800 px-6 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <input 
              type="text"
              placeholder="Search prospects by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-10 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            <svg className="absolute left-3 top-3.5 w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Position Filter */}
          <div className="w-full md:w-48">
            <select 
              value={posFilter}
              onChange={(e) => setPosFilter(e.target.value as Position | 'ALL')}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase font-bold text-xs"
            >
              <option value="ALL">All Positions</option>
              {POSITIONS.map(pos => <option key={pos} value={pos}>{pos}</option>)}
            </select>
          </div>

          {/* College Filter */}
          <div className="w-full md:w-64">
            <select 
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-xs"
            >
              <option value="ALL">All Colleges</option>
              {uniqueColleges.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProspects.map(prospect => (
              <div 
                key={prospect.id}
                onClick={() => onSelectProspect(prospect)}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all cursor-pointer group flex flex-col h-full"
              >
                <div className="relative h-48 bg-slate-800 overflow-hidden shrink-0">
                  <img 
                    src={prospect.headshotUrl} 
                    alt={prospect.name} 
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent"></div>
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
                    <span className="bg-emerald-500 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-lg uppercase">
                      RANK #{prospect.rank}
                    </span>
                    <span className="bg-slate-700/80 backdrop-blur-sm text-slate-300 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                      POS RK #{getPositionRank(prospect)}
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <img src={prospect.collegeLogoUrl} className="w-6 h-6 object-contain" alt="" />
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{prospect.college}</span>
                  </div>
                </div>

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-black font-oswald text-white uppercase tracking-tight group-hover:text-emerald-400 transition-colors">
                      {prospect.name}
                    </h3>
                    <span className="bg-slate-800 border border-slate-700 text-emerald-400 text-[10px] font-black px-2 py-1 rounded uppercase tracking-widest">
                      {prospect.position}
                    </span>
                  </div>
                  
                  <p className="text-slate-400 text-xs leading-relaxed line-clamp-3 mb-4 flex-1 italic">
                    {prospect.scoutingReport || "Scouting report currently being analyzed by our team."}
                  </p>

                  <div className="pt-4 border-t border-slate-800 flex justify-between items-center shrink-0">
                    <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">View Full Report</span>
                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                      <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProspects.length === 0 && (
            <div className="py-40 text-center">
              <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-slate-800">
                <svg className="w-10 h-10 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 9.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-2xl font-black font-oswald text-slate-500 uppercase tracking-widest">No Prospects Found</h2>
              <p className="text-slate-600 mt-2">Try adjusting your filters or search term</p>
              <Button variant="ghost" onClick={() => { setSearchTerm(''); setPosFilter('ALL'); setCollegeFilter('ALL'); }} className="mt-6 mx-auto">
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
