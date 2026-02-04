
import React, { useState, useMemo, useEffect } from 'react';
import { Prospect, Position } from '../types';
// Import the Button component used in the "No Prospects Found" state.
import { Button } from './Button';

interface BigBoardProps {
  prospects: Prospect[];
  onSelectProspect: (prospect: Prospect) => void;
}

const POSITIONS: Position[] = ['QB', 'RB', 'WR', 'TE', 'OT', 'IOL', 'EDGE', 'DL', 'LB', 'CB', 'S', 'K', 'P', 'LS'];
const PAGE_SIZE = 25;

type ViewMode = 'GRID' | 'TABLE';

export const BigBoard: React.FC<BigBoardProps> = ({ prospects, onSelectProspect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [posFilter, setPosFilter] = useState<Position | 'ALL'>('ALL');
  const [collegeFilter, setCollegeFilter] = useState('ALL');
  const [viewMode, setViewMode] = useState<ViewMode>('GRID');
  const [currentPage, setCurrentPage] = useState(1);

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

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, posFilter, collegeFilter]);

  const totalPages = Math.ceil(filteredProspects.length / PAGE_SIZE);
  
  const paginatedProspects = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredProspects.slice(start, start + PAGE_SIZE);
  }, [filteredProspects, currentPage]);

  const getPositionRank = (prospect: Prospect) => {
    const posProspects = prospects
      .filter(p => p.position === prospect.position)
      .sort((a, b) => a.rank - b.rank);
    return posProspects.findIndex(p => p.id === prospect.id) + 1;
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top of results when page changes
    const scrollContainer = document.querySelector('.big-board-results');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-950 animate-fadeIn overflow-hidden">
      {/* Filters Bar */}
      <div className="bg-slate-900/50 border-b border-slate-800 px-6 py-4 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative w-full">
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

          <div className="flex flex-wrap md:flex-nowrap items-center gap-4 w-full md:w-auto">
            {/* Position Filter */}
            <div className="flex-1 md:w-48">
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
            <div className="flex-1 md:w-64">
              <select 
                value={collegeFilter}
                onChange={(e) => setCollegeFilter(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-xs"
              >
                <option value="ALL">All Colleges</option>
                {uniqueColleges.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* View Toggle */}
            <div className="flex bg-slate-800 border border-slate-700 rounded-xl p-1 shrink-0">
              <button
                onClick={() => setViewMode('GRID')}
                aria-label="Grid View"
                className={`p-2 rounded-lg transition-all ${viewMode === 'GRID' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('TABLE')}
                aria-label="Table View"
                className={`p-2 rounded-lg transition-all ${viewMode === 'TABLE' ? 'bg-emerald-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Section */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 big-board-results">
        <div className="max-w-7xl mx-auto flex flex-col h-full">
          <div className="flex-1">
            {viewMode === 'GRID' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProspects.map(prospect => (
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
                        {prospect.summary || "Summary report currently being analyzed by our team."}
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
            ) : (
              /* Table View */
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/50 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16">RK</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Prospect</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-24">Pos</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-48">College</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Summary</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {paginatedProspects.map(prospect => (
                      <tr 
                        key={prospect.id}
                        onClick={() => onSelectProspect(prospect)}
                        className="hover:bg-emerald-500/5 cursor-pointer group transition-colors"
                      >
                        <td className="px-6 py-4">
                          <span className="text-sm font-black font-oswald text-slate-500">#{prospect.rank}</span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-black font-oswald text-white uppercase group-hover:text-emerald-400 transition-colors">
                              {prospect.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="bg-slate-800 border border-slate-700 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest">
                            {prospect.position}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <img src={prospect.collegeLogoUrl} className="w-5 h-5 object-contain" alt="" />
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{prospect.college}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <p className="text-slate-500 text-xs italic line-clamp-1">
                            {prospect.summary}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:bg-emerald-500 transition-colors">
                            <svg className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {filteredProspects.length > 0 ? (
            <div className="mt-8 mb-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-6">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Showing {Math.min(filteredProspects.length, (currentPage - 1) * PAGE_SIZE + 1)}-{Math.min(filteredProspects.length, currentPage * PAGE_SIZE)} of {filteredProspects.length} Prospects
              </span>
              
              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                
                <div className="flex items-center gap-1">
                  {[...Array(totalPages)].map((_, i) => {
                    const pageNum = i + 1;
                    // Only show first, last, and pages around current
                    if (
                      pageNum === 1 || 
                      pageNum === totalPages || 
                      (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`w-10 h-10 rounded-lg font-black font-oswald text-sm transition-all ${
                            currentPage === pageNum 
                              ? 'bg-emerald-500 text-white shadow-lg' 
                              : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                      return <span key={pageNum} className="text-slate-600 px-1">...</span>;
                    }
                    return null;
                  })}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          ) : (
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
