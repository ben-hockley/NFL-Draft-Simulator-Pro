
import React, { useState, useMemo } from 'react';
import { Team, PickAsset, DraftPick } from '../types';
import { Button } from './Button';
import { getPickValue, getFutureRoundValue, TEAMS } from '../constants';

interface TradeModalProps {
  userTeamId: string;
  currentPicks: DraftPick[];
  futurePicks: Record<string, number[]>;
  onClose: () => void;
  onTrade: (userAssets: PickAsset[], cpuAssets: PickAsset[], targetTeamId: string, initiatorId: string) => void;
}

export const TradeModal: React.FC<TradeModalProps> = ({
  userTeamId,
  currentPicks,
  futurePicks,
  onClose,
  onTrade
}) => {
  const [selectedCpuTeamId, setSelectedCpuTeamId] = useState<string>(
    TEAMS.find(t => t.id !== userTeamId)?.id || ''
  );
  const [userSelectedAssets, setUserSelectedAssets] = useState<PickAsset[]>([]);
  const [cpuSelectedAssets, setCpuSelectedAssets] = useState<PickAsset[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const cpuTeam = TEAMS.find(t => t.id === selectedCpuTeamId)!;
  const initiatorTeam = TEAMS.find(t => t.id === userTeamId)!;

  const getUserAssets = useMemo(() => {
    const assets: PickAsset[] = [];
    // 2026 picks - Show ALL rounds 1-7
    currentPicks.forEach(p => {
      if (p.team.id === userTeamId && !p.selectedPlayerId) {
        assets.push({ year: 2026, round: p.round, pickNumber: p.pickNumber, value: getPickValue(p.pickNumber) });
      }
    });
    // 2027 picks
    (futurePicks[userTeamId] || []).forEach(r => {
      assets.push({ year: 2027, round: r, value: getFutureRoundValue(r) });
    });
    return assets;
  }, [currentPicks, futurePicks, userTeamId]);

  const getCpuAssets = useMemo(() => {
    const assets: PickAsset[] = [];
    // 2026 picks - Show ALL rounds 1-7
    currentPicks.forEach(p => {
      if (p.team.id === selectedCpuTeamId && !p.selectedPlayerId) {
        assets.push({ year: 2026, round: p.round, pickNumber: p.pickNumber, value: getPickValue(p.pickNumber) });
      }
    });
    // 2027 picks
    (futurePicks[selectedCpuTeamId] || []).forEach(r => {
      assets.push({ year: 2027, round: r, value: getFutureRoundValue(r) });
    });
    return assets;
  }, [currentPicks, futurePicks, selectedCpuTeamId]);

  const userTotalValue = userSelectedAssets.reduce((sum, a) => sum + a.value, 0);
  const cpuTotalValue = cpuSelectedAssets.reduce((sum, a) => sum + a.value, 0);
  
  // Ratio of user offer vs cpu request
  const valueRatio = cpuTotalValue > 0 ? userTotalValue / cpuTotalValue : 1;

  const handlePropose = () => {
    if (userSelectedAssets.length === 0 && cpuSelectedAssets.length === 0) return;
    
    // CPU Logic: Must be close to equal value (within 5% margin)
    if (userTotalValue >= cpuTotalValue * 0.95) {
      setMessage("Trade Accepted!");
      setTimeout(() => {
        onTrade(userSelectedAssets, cpuSelectedAssets, selectedCpuTeamId, userTeamId);
      }, 1500);
    } else {
      setMessage("CPU: This isn't enough value. We need more.");
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const toggleUserAsset = (asset: PickAsset) => {
    const exists = userSelectedAssets.some(a => a.year === asset.year && a.pickNumber === asset.pickNumber && a.round === asset.round);
    if (exists) setUserSelectedAssets(userSelectedAssets.filter(a => !(a.year === asset.year && a.pickNumber === asset.pickNumber && a.round === asset.round)));
    else setUserSelectedAssets([...userSelectedAssets, asset]);
  };

  const toggleCpuAsset = (asset: PickAsset) => {
    const exists = cpuSelectedAssets.some(a => a.year === asset.year && a.pickNumber === asset.pickNumber && a.round === asset.round);
    if (exists) setCpuSelectedAssets(cpuSelectedAssets.filter(a => !(a.year === asset.year && a.pickNumber === asset.pickNumber && a.round === asset.round)));
    else setCpuSelectedAssets([...cpuSelectedAssets, asset]);
  };

  // Status computation
  const getStatus = () => {
    if (userTotalValue === 0 && cpuTotalValue === 0) return { label: 'No Offer', color: 'text-slate-500' };
    if (valueRatio < 0.9) return { label: 'Underpaying', color: 'text-red-500' };
    if (valueRatio > 1.2) return { label: 'Overpaying', color: 'text-red-500' };
    return { label: 'Fair Offer', color: 'text-emerald-400' };
  };

  const status = getStatus();

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-5xl rounded-3xl overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.8)] flex flex-col max-h-[95vh] lg:max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="px-4 py-3 lg:px-6 lg:py-4 bg-slate-800/50 border-b border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 lg:gap-4 overflow-hidden">
            <div className="flex items-center gap-1 lg:gap-2 shrink-0">
              <img src={initiatorTeam.logoUrl} className="w-6 h-6 lg:w-8 lg:h-8" alt="" />
              <h2 className="text-sm lg:text-2xl font-black font-oswald text-white uppercase tracking-tight">{initiatorTeam.id} Trade</h2>
            </div>
            <div className="h-6 w-px bg-slate-700 mx-1 lg:mx-2 shrink-0"></div>
            <div className="flex items-center gap-2 lg:gap-3 min-w-0">
              <span className="hidden sm:inline text-[10px] font-bold text-slate-500 uppercase tracking-widest">With</span>
              <select 
                value={selectedCpuTeamId}
                onChange={(e) => {
                  setSelectedCpuTeamId(e.target.value);
                  setCpuSelectedAssets([]);
                }}
                className="bg-slate-900 border border-slate-700 text-slate-100 text-[10px] lg:text-sm font-bold py-1 px-2 lg:py-1.5 lg:px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
              >
                {TEAMS.filter(t => t.id !== userTeamId).map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white transition-colors shrink-0">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Value Bar */}
        <div className="bg-slate-950 px-4 py-2 lg:px-6 lg:py-3 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex-1 flex items-center gap-2 lg:gap-6">
            <div className="text-center">
              <span className="block text-[8px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Offer</span>
              <span className="text-xs lg:text-xl font-black font-oswald text-slate-300">{userTotalValue}</span>
            </div>
            <div className="hidden sm:block flex-1 max-w-[200px] h-1.5 lg:h-2 bg-slate-800 rounded-full overflow-hidden relative">
              <div 
                className={`h-full transition-all duration-500 ${status.color.includes('emerald') ? 'bg-emerald-500' : 'bg-red-500'}`}
                style={{ width: `${Math.min(100, (userTotalValue / (Math.max(1, cpuTotalValue) * 1.5)) * 100)}%` }}
              ></div>
            </div>
            <div className="text-center">
              <span className="block text-[8px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ask</span>
              <span className="text-xs lg:text-xl font-black font-oswald text-slate-300">{cpuTotalValue}</span>
            </div>
          </div>
          <div className="text-right ml-4 lg:ml-6">
            <span className="block text-[8px] lg:text-[10px] font-bold text-slate-500 uppercase tracking-widest">Analysis</span>
            <span className={`text-[10px] lg:text-sm font-black uppercase tracking-widest ${status.color}`}>
              {status.label}
            </span>
          </div>
        </div>

        {/* Grid Content */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          {/* User Side */}
          <div className="flex-1 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 lg:p-6 overflow-y-auto">
            <h3 className="text-[10px] lg:text-xs font-black text-emerald-500 uppercase tracking-[0.2em] mb-3 lg:mb-4">My Assets</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-[8px] lg:text-[10px] font-bold text-slate-600 uppercase mb-2">2026 Picks</h4>
                <div className="grid grid-cols-2 gap-2">
                  {getUserAssets.filter(a => a.year === 2026).map((asset, i) => (
                    <AssetButton 
                      key={`u26-${i}`} 
                      asset={asset} 
                      isSelected={userSelectedAssets.some(a => a.pickNumber === asset.pickNumber)}
                      onClick={() => toggleUserAsset(asset)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[8px] lg:text-[10px] font-bold text-slate-600 uppercase mb-2">2027 Picks</h4>
                <div className="grid grid-cols-2 gap-2">
                  {getUserAssets.filter(a => a.year === 2027).map((asset, i) => (
                    <AssetButton 
                      key={`u27-${i}`} 
                      asset={asset} 
                      isSelected={userSelectedAssets.some(a => a.year === 2027 && a.round === asset.round)}
                      onClick={() => toggleUserAsset(asset)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CPU Side */}
          <div className="flex-1 p-4 lg:p-6 overflow-y-auto bg-slate-950/20">
            <div className="flex items-center gap-2 lg:gap-3 mb-3 lg:mb-4">
              <img src={cpuTeam.logoUrl} className="w-5 h-5 lg:w-6 lg:h-6" alt="" />
              <h3 className="text-[10px] lg:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{cpuTeam.id} Assets</h3>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-[8px] lg:text-[10px] font-bold text-slate-600 uppercase mb-2">2026 Picks</h4>
                <div className="grid grid-cols-2 gap-2">
                  {getCpuAssets.filter(a => a.year === 2026).map((asset, i) => (
                    <AssetButton 
                      key={`c26-${i}`} 
                      asset={asset} 
                      isSelected={cpuSelectedAssets.some(a => a.pickNumber === asset.pickNumber)}
                      onClick={() => toggleCpuAsset(asset)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-[8px] lg:text-[10px] font-bold text-slate-600 uppercase mb-2">2027 Picks</h4>
                <div className="grid grid-cols-2 gap-2">
                  {getCpuAssets.filter(a => a.year === 2027).map((asset, i) => (
                    <AssetButton 
                      key={`c27-${i}`} 
                      asset={asset} 
                      isSelected={cpuSelectedAssets.some(a => a.year === 2027 && a.round === asset.round)}
                      onClick={() => toggleCpuAsset(asset)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="px-4 py-4 lg:px-6 lg:py-6 bg-slate-900 border-t border-slate-800 shrink-0 flex flex-col items-center gap-2 lg:gap-4">
          {message && (
            <div className={`text-xs lg:text-sm font-bold uppercase tracking-widest animate-bounce ${
              message.includes('Accepted') ? 'text-emerald-400' : 'text-amber-500'
            }`}>
              {message}
            </div>
          )}
          <div className="flex flex-col lg:flex-row gap-2 w-full max-w-2xl">
            <Button 
              variant="primary" 
              className="flex-1 h-12 lg:h-14 text-sm lg:text-xl uppercase font-oswald tracking-[0.2em]"
              onClick={handlePropose}
              disabled={!!message || (userSelectedAssets.length === 0 && cpuSelectedAssets.length === 0)}
            >
              Propose Trade
            </Button>
            <Button 
              variant="ghost" 
              className="h-12 lg:h-14 px-6 text-xs lg:text-sm uppercase font-bold border border-slate-700 lg:border-none"
              onClick={onClose}
            >
              Cancel Trade
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssetButton: React.FC<{ asset: PickAsset, isSelected: boolean, onClick: () => void }> = ({ asset, isSelected, onClick }) => (
  <button 
    onClick={onClick}
    className={`p-2 lg:p-3 rounded-xl border text-left transition-all ${
      isSelected 
        ? 'bg-emerald-500/20 border-emerald-500 ring-1 ring-emerald-500' 
        : 'bg-slate-800/50 border-slate-700 hover:border-slate-500'
    }`}
  >
    <div className="flex justify-between items-start mb-1">
      <span className="text-[8px] lg:text-[10px] font-black text-slate-500">{asset.year}</span>
      <span className="text-[7px] lg:text-[9px] font-bold text-slate-600 uppercase">Value: {asset.value}</span>
    </div>
    <div className="text-[10px] lg:text-sm font-bold text-slate-200 truncate">
      RD {asset.round} {asset.pickNumber ? `(#${asset.pickNumber})`: ``}
    </div>
  </button>
);
