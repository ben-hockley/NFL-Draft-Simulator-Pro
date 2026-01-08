
export type Position = 'QB' | 'RB' | 'WR' | 'TE' | 'OT' | 'OG' | 'C' | 'DE' | 'DT' | 'LB' | 'CB' | 'S' | 'K' | 'P' | 'IOL' | 'DL' | 'EDGE';

export interface Prospect {
  id: string;
  name: string;
  headshotUrl: string;
  college: string;
  collegeLogoUrl: string;
  position: string;
  height: string;
  weight: number;
  rank: number;
  scoutingReport?: string;
}

export interface Team {
  id: string;
  name: string;
  logoUrl: string;
  color: string;
  needs: string[];
}

export interface DraftPick {
  pickNumber: number;
  round: number;
  team: Team;
  selectedPlayerId?: string;
}

export type AppView = 'LOBBY' | 'DRAFT' | 'SUMMARY';

export interface DraftState {
  currentPickIndex: number;
  picks: DraftPick[];
  userControlledTeams: string[];
  isDraftStarted: boolean;
  prospects: Prospect[];
  roundsToSimulate: number;
}
