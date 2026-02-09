
import { Prospect, Team, DraftPick } from './types';

export const getPickValue = (pickNumber: number): number => {
  return Math.round(3000 / Math.pow(pickNumber, 0.72));
};

export const ROUND_END_PICKS = [32, 64, 100, 138, 181, 216, 257];

export const getFutureRoundValue = (round: number): number => {
  const pickNum = ROUND_END_PICKS[round - 1] || 257;
  return getPickValue(pickNum);
};

export const getEspnUrl = (id: number) => `https://a.espncdn.com/combiner/i?img=/i/headshots/college-football/players/full/${id}.png`;

export const getCollegeLogoUrl = (id: number | undefined | null, collegeName: string) => {
  return id ? `https://a.espncdn.com/i/teamlogos/ncaa/500/${id}.png` : `https://via.placeholder.com/500?text=${encodeURIComponent(collegeName)}`;
};

export const PROSPECTS: Prospect[] = [];
