
export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'OT' | 'OG' | 'C' | 'DE' | 'DT' | 'LB' | 'CB' | 'S' | 'K' | 'P' | 'LS' | 'IOL' | 'DL' | 'EDGE';

export type DraftSpeed = 'SLOW' | 'MEDIUM' | 'FAST';

export interface PlayerStats {
  gamesPlayed: number;
  passingYards?: number;
  passingTDs?: number;
  ints?: number;
  completionPct?: string;
  rushingYards?: number;
  rushingTDs?: number;
  receptions?: number;
  receivingYards?: number;
  receivingTDs?: number;
  tackles?: number;
  sacks?: number;
  defInts?: number;
  forcedFumbles?: number;
  fgPct?: string;
  xpPct?: string;
  longFg?: number;
  punts?: number;
  longPunt?: number;
  inside20?: number;
}

export interface Prospect {
  id: string;
  espnId: number;
  name: string;
  headshotUrl: string;
  college: string;
  collegeLogoUrl: string;
  position: string;
  height?: string;
  weight?: string;
  rank: number;
  summary?: string;
  bio?: string;
  stats?: PlayerStats;
  strengths?: string[];
  weaknesses?: string[];
  recruitingStars?: number | null;
  link247?: string | null;
  nflComparison?: string | null;
}

export interface Team {
  id: string;
  name: string;
  nickname: string;
  logoUrl: string;
  color: string;
  needs: string[];
}

export interface DraftPick {
  pickNumber: number;
  round: number;
  team: Team;
  selectedPlayerId?: string;
  isTraded?: boolean;
}

export type AppView = 'LOBBY' | 'DRAFT' | 'SUMMARY' | 'BIGBOARD';

export interface PickAsset {
  year: 2026 | 2027;
  round: number;
  pickNumber?: number; // Only for 2026
  value: number;
}

export interface DraftState {
  currentPickIndex: number;
  picks: DraftPick[];
  userControlledTeams: string[];
  isDraftStarted: boolean;
  prospects: Prospect[];
  roundsToSimulate: number;
  draftSpeed: DraftSpeed;
  futurePicks: Record<string, number[]>; // TeamID to array of Round numbers (2027)
}
