
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

export interface CombineStats {
  fortyYardDash?: number | null;
  tenYardSplit?: number | null;
  threeConeDrill?: number | null;
  twentyYardShuttle?: number | null;
  verticalJump?: number | null;
  broadJump?: number | null;
  benchPress?: number | null;
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
  allAmerican?: boolean;
  nflBloodline?: boolean;
  freaksList?: boolean;
  draftYear: number;
  combine?: CombineStats;
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
  madeByParticipantId?: string; // undefined = AI pick
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

export type DraftMode = 'SOLO' | 'ONLINE_HOST' | 'ONLINE_JOIN';

export interface DraftParticipant {
  id: string;           // uuid, client-generated per session
  displayName: string;
  selectedTeamId: string | null;
  colorSlot: 1 | 2 | 3 | 4;
  isHost: boolean;
}

export interface OnlineRoomState {
  roomId: string;
  inviteCode: string;
  participants: DraftParticipant[];
  status: 'LOBBY' | 'DRAFTING' | 'COMPLETE';
}
