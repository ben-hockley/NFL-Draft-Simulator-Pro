
import { Prospect, Team, DraftPick } from './types';

export const ALL_TEAMS: Record<string, Team> = {
  LV: { id: 'LV', name: 'Las Vegas Raiders', nickname: 'Raiders', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png', color: '#000000', needs: ['QB', 'LB', 'CB', 'EDGE', 'OT'] },
  NYJ: { id: 'NYJ', name: 'New York Jets', nickname: 'Jets', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png', color: '#125740', needs: ['QB', 'DL', 'CB', 'WR', 'IOL'] },
  ARI: { id: 'ARI', name: 'Arizona Cardinals', nickname: 'Cardinals', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png', color: '#97233f', needs: ['QB', 'OT', 'IOL', 'EDGE', 'CB'] },
  TEN: { id: 'TEN', name: 'Tennessee Titans', nickname: 'Titans', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png', color: '#4b92db', needs: ['EDGE', 'WR', 'IOL', 'DL', 'OT'] },
  NYG: { id: 'NYG', name: 'New York Giants', nickname: 'Giants', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png', color: '#0b2265', needs: ['OT', 'CB', 'WR', 'IOL', 'LB'] },
  CLE: { id: 'CLE', name: 'Cleveland Browns', nickname: 'Browns', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png', color: '#311d00', needs: ['QB', 'WR', 'OT', 'IOL', 'CB'] },
  WAS: { id: 'WAS', name: 'Washington Commanders', nickname: 'Commanders', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/was.png', color: '#5a1414', needs: ['EDGE', 'WR', 'S', 'CB', 'RB'] },
  NO: { id: 'NO', name: 'New Orleans Saints', nickname: 'Saints', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png', color: '#d3bc8d', needs: ['WR', 'IOL', 'EDGE', 'CB', 'DL'] },
  KC: { id: 'KC', name: 'Kansas City Chiefs', nickname: 'Chiefs', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png', color: '#e31837', needs: ['CB', 'RB', 'DL', 'TE', 'LB'] },
  CIN: { id: 'CIN', name: 'Cincinnati Bengals', nickname: 'Bengals', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png', color: '#fb4f14', needs: ['CB', 'EDGE', 'IOL', 'S', 'TE'] },
  MIA: { id: 'MIA', name: 'Miami Dolphins', nickname: 'Dolphins', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png', color: '#008e97', needs: ['CB', 'OT', 'WR', 'TE', 'S'] },
  DAL: { id: 'DAL', name: 'Dallas Cowboys', nickname: 'Cowboys', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png', color: '#003594', needs: ['EDGE', 'LB', 'WR', 'CB', 'S'] },
  LAR: { id: 'LAR', name: 'LA Rams', nickname: 'Rams', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png', color: '#003594', needs: ['QB', 'OT', 'S', 'CB', 'WR'] },
  BAL: { id: 'BAL', name: 'Baltimore Ravens', nickname: 'Ravens', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png', color: '#241773', needs: ['EDGE', 'IOL', 'DL', 'RB', 'CB'] },
  TB: { id: 'TB', name: 'Tampa Bay Buccaneers', nickname: 'Buccaneers', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png', color: '#d50a0a', needs: ['LB', 'EDGE', 'DL', 'TE', 'IOL'] },
  DET: { id: 'DET', name: 'Detroit Lions', nickname: 'Lions', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png', color: '#0076b6', needs: ['CB', 'EDGE', 'IOL', 'DL', 'LB'] },
  MIN: { id: 'MIN', name: 'Minnesota Vikings', nickname: 'Vikings', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png', color: '#4f2683', needs: ['CB', 'S', 'QB', 'DL', 'LB'] },
  CAR: { id: 'CAR', name: 'Carolina Panthers', nickname: 'Panthers', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png', color: '#0085ca', needs: ['IOL', 'QB', 'LB', 'TE', 'S'] },
  PIT: { id: 'PIT', name: 'Pittsburgh Steelers', nickname: 'Steelers', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png', color: '#ffb612', needs: ['QB', 'WR', 'CB', 'DL', 'OT'] },
  LAC: { id: 'LAC', name: 'LA Chargers', nickname: 'Chargers', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png', color: '#0080c6', needs: ['CB', 'IOL', 'DL', 'EDGE', 'S'] },
  PHI: { id: 'PHI', name: 'Philadelphia Eagles', nickname: 'Eagles', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png', color: '#004c54', needs: ['TE', 'CB', 'EDGE', 'OT', 'S'] },
  BUF: { id: 'BUF', name: 'Buffalo Bills', nickname: 'Bills', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png', color: '#00338d', needs: ['WR', 'EDGE', 'LB', 'IOL', 'CB'] },
  CHI: { id: 'CHI', name: 'Chicago Bears', nickname: 'Bears', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png', color: '#c83803', needs: ['S', 'OT', 'EDGE', 'CB', 'DL'] },
  SF: { id: 'SF', name: 'San Francisco 49ers', nickname: '49ers', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png', color: '#aa0000', needs: ['WR', 'IOL', 'S', 'OT', 'EDGE'] },
  HOU: { id: 'HOU', name: 'Houston Texans', nickname: 'Texans', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png', color: '#03202f', needs: ['IOL', 'DL', 'OT', 'RB', 'LB'] },
  NE: { id: 'NE', name: 'New England Patriots', nickname: 'Patriots', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png', color: '#002244', needs: ['EDGE', 'WR', 'OT', 'TE', 'LB'] },
  DEN: { id: 'DEN', name: 'Denver Broncos', nickname: 'Broncos', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png', color: '#fb4f14', needs: ['TE', 'OT', 'LB', 'S', 'DL'] },
  SEA: { id: 'SEA', name: 'Seattle Seahawks', nickname: 'Seahawks', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png', color: '#002244', needs: ['IOL', 'CB', 'EDGE', 'DL', 'WR'] },
  IND: { id: 'IND', name: 'Indianapolis Colts', nickname: 'Colts', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/ind.png', color: '#002c5f', needs: ['LB', 'OT', 'DL', 'EDGE', 'S'] },
  ATL: { id: 'ATL', name: 'Atlanta Falcons', nickname: 'Falcons', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/atl.png', color: '#a71930', needs: ['CB', 'DL', 'WR', 'TE', 'OT'] },
  GB: { id: 'GB', name: 'Green Bay Packers', nickname: 'Packers', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/gb.png', color: '#203731', needs: ['CB', 'IOL', 'DT', 'RB', 'OT'] },
  JAX: { id: 'JAX', name: 'Jacksonville Jaguars', nickname: 'Jaguars', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/jax.png', color: '#006778', needs: ['CB', 'IOL', 'DL', 'S', 'LB'] },
};

export const TEAMS: Team[] = Object.values(ALL_TEAMS);

export const getPickValue = (pickNumber: number): number => {
  return Math.round(3000 / Math.pow(pickNumber, 0.72));
};

export const ROUND_END_PICKS = [32, 64, 100, 138, 181, 216, 257];

export const getFutureRoundValue = (round: number): number => {
  const pickNum = ROUND_END_PICKS[round - 1] || 257;
  return getPickValue(pickNum);
};

const DRAFT_SEQUENCE = [
  { id: 'LV', r: 1 }, { id: 'NYJ', r: 1 }, { id: 'ARI', r: 1 }, { id: 'TEN', r: 1 }, { id: 'NYG', r: 1 }, { id: 'CLE', r: 1 }, { id: 'WAS', r: 1 }, { id: 'NO', r: 1 }, { id: 'KC', r: 1 }, { id: 'CIN', r: 1 },
  { id: 'MIA', r: 1 }, { id: 'DAL', r: 1 }, { id: 'LAR', r: 1 }, { id: 'BAL', r: 1 }, { id: 'TB', r: 1 }, { id: 'NYJ', r: 1 }, { id: 'DET', r: 1 }, { id: 'MIN', r: 1 }, { id: 'CAR', r: 1 }, { id: 'DAL', r: 1 },
  { id: 'PIT', r: 1 }, { id: 'LAC', r: 1 }, { id: 'PHI', r: 1 }, { id: 'BUF', r: 1 }, { id: 'CHI', r: 1 }, { id: 'SF', r: 1 }, { id: 'HOU', r: 1 }, { id: 'CLE', r: 1 }, { id: 'LAR', r: 1 }, { id: 'NE', r: 1 },
  { id: 'DEN', r: 1 }, { id: 'SEA', r: 1 },
  { id: 'NYJ', r: 2 }, { id: 'ARI', r: 2 }, { id: 'TEN', r: 2 }, { id: 'LV', r: 2 }, { id: 'NYG', r: 2 }, { id: 'HOU', r: 2 }, { id: 'CLE', r: 2 }, { id: 'KC', r: 2 }, { id: 'CIN', r: 2 }, { id: 'NO', r: 2 },
  { id: 'MIA', r: 2 }, { id: 'NYJ', r: 2 }, { id: 'BAL', r: 2 }, { id: 'TB', r: 2 }, { id: 'IND', r: 2 }, { id: 'ATL', r: 2 }, { id: 'MIN', r: 2 }, { id: 'DET', r: 2 }, { id: 'CAR', r: 2 }, { id: 'GB', r: 2 },
  { id: 'PIT', r: 2 }, { id: 'PHI', r: 2 }, { id: 'LAC', r: 2 }, { id: 'BUF', r: 2 }, { id: 'CHI', r: 2 }, { id: 'HOU', r: 2 }, { id: 'SF', r: 2 }, { id: 'JAX', r: 2 }, { id: 'LAR', r: 2 }, { id: 'NE', r: 2 },
  { id: 'DEN', r: 2 }, { id: 'SEA', r: 2 },
  { id: 'ARI', r: 3 }, { id: 'TEN', r: 3 }, { id: 'LV', r: 3 }, { id: 'PHI', r: 3 }, { id: 'HOU', r: 3 }, { id: 'CLE', r: 3 }, { id: 'WAS', r: 3 }, { id: 'CIN', r: 3 }, { id: 'NO', r: 3 }, { id: 'KC', r: 3 },
  { id: 'MIA', r: 3 }, { id: 'PIT', r: 3 }, { id: 'TB', r: 3 }, { id: 'IND', r: 3 }, { id: 'ATL', r: 3 }, { id: 'BAL', r: 3 }, { id: 'JAX', r: 3 }, { id: 'MIN', r: 3 }, { id: 'CAR', r: 3 }, { id: 'GB', r: 3 },
  { id: 'PIT', r: 3 }, { id: 'LAC', r: 3 }, { id: 'MIA', r: 3 }, { id: 'BUF', r: 3 }, { id: 'CHI', r: 3 }, { id: 'SF', r: 3 }, { id: 'MIA', r: 3 }, { id: 'JAX', r: 3 }, { id: 'LAR', r: 3 }, { id: 'NE', r: 3 },
  { id: 'DEN', r: 3 }, { id: 'SEA', r: 3 }, { id: 'MIN', r: 3 }, { id: 'PHI', r: 3 }, { id: 'PIT', r: 3 }, { id: 'JAX', r: 3 },
  { id: 'TEN', r: 4 }, { id: 'LV', r: 4 }, { id: 'NYJ', r: 4 }, { id: 'ARI', r: 4 }, { id: 'NYG', r: 4 }, { id: 'HOU', r: 4 }, { id: 'CLE', r: 4 }, { id: 'DEN', r: 4 }, { id: 'KC', r: 4 }, { id: 'CIN', r: 4 },
  { id: 'MIA', r: 4 }, { id: 'DAL', r: 4 }, { id: 'IND', r: 4 }, { id: 'ATL', r: 4 }, { id: 'BAL', r: 4 }, { id: 'TB', r: 4 }, { id: 'LV', r: 4 }, { id: 'DET', r: 4 }, { id: 'CAR', r: 4 }, { id: 'GB', r: 4 },
  { id: 'PIT', r: 4 }, { id: 'PHI', r: 4 }, { id: 'LAC', r: 4 }, { id: 'BUF', r: 4 }, { id: 'NE', r: 4 }, { id: 'HOU', r: 4 }, { id: 'SF', r: 4 }, { id: 'JAX', r: 4 }, { id: 'CHI', r: 4 }, { id: 'NE', r: 4 },
  { id: 'DEN', r: 4 }, { id: 'NO', r: 4 }, { id: 'SF', r: 4 }, { id: 'LV', r: 4 }, { id: 'PIT', r: 4 }, { id: 'PHI', r: 4 }, { id: 'NO', r: 4 }, { id: 'SF', r: 4 },
  { id: 'CLE', r: 5 }, { id: 'TEN', r: 5 }, { id: 'ARI', r: 5 }, { id: 'TEN', r: 5 }, { id: 'NYG', r: 5 }, { id: 'CLE', r: 5 }, { id: 'WAS', r: 5 }, { id: 'KC', r: 5 }, { id: 'CLE', r: 5 }, { id: 'NO', r: 5 },
  { id: 'MIA', r: 5 }, { id: 'DAL', r: 5 }, { id: 'PHI', r: 5 }, { id: 'BAL', r: 5 }, { id: 'TB', r: 5 }, { id: 'IND', r: 5 }, { id: 'DET', r: 5 }, { id: 'CAR', r: 5 }, { id: 'CAR', r: 5 }, { id: 'GB', r: 5 },
  { id: 'PIT', r: 5 }, { id: 'BAL', r: 5 }, { id: 'MIN', r: 5 }, { id: 'BUF', r: 5 }, { id: 'CHI', r: 5 }, { id: 'JAX', r: 5 }, { id: 'HOU', r: 5 }, { id: 'JAX', r: 5 }, { id: 'LAR', r: 5 }, { id: 'NE', r: 5 },
  { id: 'DEN', r: 5 }, { id: 'NO', r: 5 }, { id: 'SF', r: 5 }, { id: 'BAL', r: 5 }, { id: 'BAL', r: 5 }, { id: 'LV', r: 5 }, { id: 'NYJ', r: 5 }, { id: 'KC', r: 5 }, { id: 'DAL', r: 5 }, { id: 'NYJ', r: 5 },
  { id: 'PHI', r: 5 }, { id: 'DET', r: 5 }, { id: 'DAL', r: 5 },
  { id: 'LV', r: 6 }, { id: 'ARI', r: 6 }, { id: 'TEN', r: 6 }, { id: 'LV', r: 6 }, { id: 'NYG', r: 6 }, { id: 'WAS', r: 6 }, { id: 'DET', r: 6 }, { id: 'CIN', r: 6 }, { id: 'NO', r: 6 }, { id: 'NE', r: 6 },
  { id: 'NYG', r: 6 }, { id: 'NYG', r: 6 }, { id: 'NYJ', r: 6 }, { id: 'TB', r: 6 }, { id: 'MIN', r: 6 }, { id: 'ATL', r: 6 }, { id: 'WAS', r: 6 }, { id: 'CIN', r: 6 }, { id: 'CAR', r: 6 }, { id: 'GB', r: 6 },
  { id: 'NE', r: 6 }, { id: 'PHI', r: 6 }, { id: 'LAC', r: 6 }, { id: 'NYJ', r: 6 }, { id: 'CLE', r: 6 }, { id: 'LAR', r: 6 }, { id: 'NE', r: 6 }, { id: 'DET', r: 6 }, { id: 'LAR', r: 6 }, { id: 'NE', r: 6 },
  { id: 'NYJ', r: 6 }, { id: 'SEA', r: 6 }, { id: 'PIT', r: 6 }, { id: 'PIT', r: 6 }, { id: 'IND', r: 6 },
  { id: 'ARI', r: 7 }, { id: 'NYJ', r: 7 }, { id: 'LV', r: 7 }, { id: 'BUF', r: 7 }, { id: 'DAL', r: 7 }, { id: 'DET', r: 7 }, { id: 'WAS', r: 7 }, { id: 'PIT', r: 7 }, { id: 'DAL', r: 7 }, { id: 'CIN', r: 7 },
  { id: 'MIA', r: 7 }, { id: 'BUF', r: 7 }, { id: 'TB', r: 7 }, { id: 'IND', r: 7 }, { id: 'ATL', r: 7 }, { id: 'LAR', r: 7 }, { id: 'JAX', r: 7 }, { id: 'MIN', r: 7 }, { id: 'CAR', r: 7 }, { id: 'GB', r: 7 },
  { id: 'PIT', r: 7 }, { id: 'TEN', r: 7 }, { id: 'CHI', r: 7 }, { id: 'NYJ', r: 7 }, { id: 'CHI', r: 7 }, { id: 'HOU', r: 7 }, { id: 'HOU', r: 7 }, { id: 'MIN', r: 7 }, { id: 'JAX', r: 7 }, { id: 'NE', r: 7 },
  { id: 'DEN', r: 7 }, { id: 'CLE', r: 7 }, { id: 'BAL', r: 7 }, { id: 'LAR', r: 7 }, { id: 'DEN', r: 7 }, { id: 'BAL', r: 7 }, { id: 'IND', r: 7 }, { id: 'GB', r: 7 }, { id: 'LAR', r: 7 }, { id: 'DEN', r: 7 },
  { id: 'GB', r: 7 }
];

export const INITIAL_DRAFT_ORDER: DraftPick[] = DRAFT_SEQUENCE.map((pick, index) => ({
  pickNumber: index + 1,
  round: pick.r,
  team: ALL_TEAMS[pick.id],
}));

const COLLEGE_IDS: Record<string, number> = {
  'Indiana': 84, 'Oregon': 2483, 'Ohio State': 194, 'Miami (FL)': 2390, 'Arizona State': 9, 'Notre Dame': 87, 'Utah': 254, 'Texas Tech': 2641, 'Auburn': 2, 'Clemson': 228, 'LSU': 99, 'Tennessee': 2633, 'USC': 30, 'Alabama': 333, 'Penn State': 213, 'Washington': 264, 'Texas A&M': 245, 'Georgia': 61, 'Florida': 57, 'South Carolina': 2579, 'Iowa': 2294, 'Louisville': 97, 'Texas': 251, 'Oklahoma': 201, 'Memphis': 235, 'Missouri': 142, 'Toledo': 2649, 'San Diego State': 21, 'Northwestern': 77, 'Arkansas': 8, 'Cincinnati': 2132, 'Boston College': 103, 'Duke': 150, 'Nebraska': 158, 'Illinois': 356, 'SMU': 2567, 'UConn': 41, 'Arizona': 12, 'Iowa State': 66, 'Baylor': 239, 'Vanderbilt': 238, 'Michigan': 130, 'Florida State': 52, 'Boise State': 68, 'Georgia Tech': 59, 'UCF': 2116, 'Michigan State': 127, 'Wake Forest': 154, 'Mississippi': 145, 'California': 25, 'Mississippi State': 55, 'North Dakota State': 2449, 'Stephen F. Austin': 2617, 'UCLA': 26, 'BYU': 252, 'Georgia State': 2247, 'NC State': 152, 'TCU': 2628, 'Virginia Tech': 259, 'Stanford': 24, 'Virginia': 258, 'Houston': 248, 'Navy': 2426, 'Texas State': 326, 'Kentucky': 96, 'Minnesota': 135, 'Wisconsin': 275, 'Kansas': 2305, 'Wyoming': 2751, 'Kansas State': 2306, 'Buffalo': 2084, 'North Carolina': 153, 'Colorado': 38, 'Western Michigan': 2711, 'Pittsburgh': 221, 'Temple': 218
};

export const getEspnUrl = (id: number) => `https://a.espncdn.com/combiner/i?img=/i/headshots/college-football/players/full/${id}.png`;
export const getCollegeLogoUrl = (college: string) => {
  const id = COLLEGE_IDS[college];
  return id ? `https://a.espncdn.com/i/teamlogos/ncaa/500/${id}.png` : `https://via.placeholder.com/500?text=${encodeURIComponent(college)}`;
};

export const PROSPECTS: Prospect[] = []; // Now dynamically fetched from Supabase
