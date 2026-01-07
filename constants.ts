
import { Prospect, Team, Position, DraftPick } from './types';

// Teams collection used for the draft order and selection
export const ALL_TEAMS: Record<string, Team> = {
  LV: { id: 'LV', name: 'Las Vegas Raiders', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/lv.png', color: '#000000', needs: ['QB', 'OT', 'CB', 'DE', 'DT'] },
  NYJ: { id: 'NYJ', name: 'New York Jets', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyj.png', color: '#125740', needs: ['WR', 'OT', 'S', 'LB', 'DT'] },
  ARI: { id: 'ARI', name: 'Arizona Cardinals', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/ari.png', color: '#97233f', needs: ['CB', 'DT', 'OT', 'DE', 'LB'] },
  TEN: { id: 'TEN', name: 'Tennessee Titans', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/ten.png', color: '#4b92db', needs: ['WR', 'OT', 'DE', 'LB', 'CB'] },
  NYG: { id: 'NYG', name: 'New York Giants', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/nyg.png', color: '#0b2265', needs: ['QB', 'WR', 'RB', 'OT', 'CB'] },
  CLE: { id: 'CLE', name: 'Cleveland Browns', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/cle.png', color: '#311d00', needs: ['OT', 'WR', 'LB', 'DT', 'S'] },
  WAS: { id: 'WAS', name: 'Washington Commanders', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/was.png', color: '#5a1414', needs: ['OT', 'DE', 'CB', 'LB', 'S'] },
  NO: { id: 'NO', name: 'New Orleans Saints', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/no.png', color: '#d3bc8d', needs: ['QB', 'OT', 'DE', 'WR', 'DT'] },
  KC: { id: 'KC', name: 'Kansas City Chiefs', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/kc.png', color: '#e31837', needs: ['WR', 'OT', 'CB', 'DE', 'DT'] },
  CIN: { id: 'CIN', name: 'Cincinnati Bengals', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/cin.png', color: '#fb4f14', needs: ['OT', 'DT', 'WR', 'CB', 'TE'] },
  MIA: { id: 'MIA', name: 'Miami Dolphins', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/mia.png', color: '#008e97', needs: ['OG', 'OT', 'WR', 'DT', 'LB'] },
  DAL: { id: 'DAL', name: 'Dallas Cowboys', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/dal.png', color: '#003594', needs: ['RB', 'WR', 'DE', 'DT', 'LB'] },
  LAR: { id: 'LAR', name: 'LA Rams', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/lar.png', color: '#003594', needs: ['OT', 'CB', 'WR', 'LB', 'DT'] },
  BAL: { id: 'BAL', name: 'Baltimore Ravens', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/bal.png', color: '#241773', needs: ['OT', 'WR', 'CB', 'DE', 'OG'] },
  TB: { id: 'TB', name: 'Tampa Bay Buccaneers', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/tb.png', color: '#d50a0a', needs: ['CB', 'DE', 'DT', 'WR', 'OT'] },
  DET: { id: 'DET', name: 'Detroit Lions', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/det.png', color: '#0076b6', needs: ['DE', 'CB', 'DT', 'WR', 'S'] },
  MIN: { id: 'MIN', name: 'Minnesota Vikings', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/min.png', color: '#4f2683', needs: ['DT', 'CB', 'WR', 'OT', 'OG'] },
  CAR: { id: 'CAR', name: 'Carolina Panthers', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/car.png', color: '#0085ca', needs: ['WR', 'DE', 'LB', 'CB', 'S'] },
  PIT: { id: 'PIT', name: 'Pittsburgh Steelers', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/pit.png', color: '#ffb612', needs: ['WR', 'OT', 'CB', 'DE', 'DT'] },
  LAC: { id: 'LAC', name: 'LA Chargers', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/lac.png', color: '#0080c6', needs: ['WR', 'CB', 'DT', 'LB', 'TE'] },
  PHI: { id: 'PHI', name: 'Philadelphia Eagles', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/phi.png', color: '#004c54', needs: ['CB', 'WR', 'DE', 'DT', 'S'] },
  BUF: { id: 'BUF', name: 'Buffalo Bills', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/buf.png', color: '#00338d', needs: ['WR', 'DE', 'DT', 'CB', 'S'] },
  CHI: { id: 'CHI', name: 'Chicago Bears', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/chi.png', color: '#c83803', needs: ['DE', 'OT', 'WR', 'DT', 'CB'] },
  SF: { id: 'SF', name: 'San Francisco 49ers', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/sf.png', color: '#aa0000', needs: ['OT', 'CB', 'DE', 'DT', 'WR'] },
  HOU: { id: 'HOU', name: 'Houston Texans', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/hou.png', color: '#03202f', needs: ['DT', 'DE', 'CB', 'LB', 'S'] },
  NE: { id: 'NE', name: 'New England Patriots', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/ne.png', color: '#002244', needs: ['OT', 'WR', 'CB', 'DE', 'LB'] },
  DEN: { id: 'DEN', name: 'Denver Broncos', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/den.png', color: '#fb4f14', needs: ['QB', 'WR', 'OT', 'DE', 'DT'] },
  SEA: { id: 'SEA', name: 'Seattle Seahawks', logoUrl: 'https://a.espncdn.com/i/teamlogos/nfl/500/sea.png', color: '#002244', needs: ['OT', 'LB', 'DT', 'DE', 'CB'] },
};

export const TEAMS: Team[] = Object.values(ALL_TEAMS);

// Explicit Draft Order as requested
const DRAFT_SEQUENCE_IDS = [
  'LV', 'NYJ', 'ARI', 'TEN', 'NYG', 'CLE', 'WAS', 'NO', 'KC', 'CIN', 
  'MIA', 'DAL', 'LAR', 'BAL', 'TB', 'NYJ', 'DET', 'MIN', 'CAR', 'DAL', 
  'PIT', 'LAC', 'PHI', 'BUF', 'CHI', 'SF', 'HOU', 'CLE', 'LAR', 'NE', 
  'DEN', 'SEA'
];

export const INITIAL_DRAFT_ORDER: DraftPick[] = DRAFT_SEQUENCE_IDS.map((teamId, index) => {
  const teamKey = teamId === 'BAL' ? 'RAV' : teamId; // Handle key mismatch
  const team = ALL_TEAMS[teamId] || ALL_TEAMS[teamKey];
  return {
    pickNumber: index + 1,
    round: 1,
    team: team,
  };
});

// Mapping of college names to ESPN IDs
const COLLEGE_IDS: Record<string, number> = {
  'Indiana': 84,
  'Oregon': 2483,
  'Ohio State': 194,
  'Miami (FL)': 2390,
  'Arizona State': 9,
  'Notre Dame': 87,
  'Utah': 254,
  'Texas Tech': 2641,
  'Auburn': 2,
  'Clemson': 228,
  'LSU': 99,
  'Tennessee': 2633,
  'USC': 30,
  'Alabama': 333,
  'Penn State': 213,
  'Washington': 264,
  'Texas A&M': 245,
  'Georgia': 61,
  'Florida': 57,
  'South Carolina': 2579,
  'Iowa': 2294,
  'Louisville': 97,
  'Texas': 251,
  'Oklahoma': 201,
  'Memphis': 235,
  'Missouri': 142,
  'Toledo': 2649,
  'San Diego State': 21,
};

// Helpers
const getEspnUrl = (id: number) => `https://a.espncdn.com/combiner/i?img=/i/headshots/college-football/players/full/${id}.png`;
const getCollegeLogoUrl = (college: string) => {
  const id = COLLEGE_IDS[college];
  return id ? `https://a.espncdn.com/i/teamlogos/ncaa/500/${id}.png` : `https://via.placeholder.com/500?text=${encodeURIComponent(college)}`;
};

export const PROSPECTS: Prospect[] = [
  { id: 'p1', name: 'Fernando Mendoza', headshotUrl: getEspnUrl(4837248), college: 'Indiana', position: 'QB', height: '6\'5"', weight: 225, rank: 1, collegeLogoUrl: getCollegeLogoUrl('Indiana') },
  { id: 'p2', name: 'Dante Moore', headshotUrl: getEspnUrl(4870921), college: 'Oregon', position: 'QB', height: '6\'3"', weight: 210, rank: 2, collegeLogoUrl: getCollegeLogoUrl('Oregon') },
  { id: 'p3', name: 'Arvell Reese', headshotUrl: getEspnUrl(4950400), college: 'Ohio State', position: 'LB', height: '6\'3"', weight: 235, rank: 3, collegeLogoUrl: getCollegeLogoUrl('Ohio State') },
  { id: 'p4', name: 'Rueben Bain', headshotUrl: getEspnUrl(4870617), college: 'Miami (FL)', position: 'DE', height: '6\'3"', weight: 275, rank: 4, collegeLogoUrl: getCollegeLogoUrl('Miami (FL)') },
  { id: 'p5', name: 'Carnell Tate', headshotUrl: getEspnUrl(4871023), college: 'Ohio State', position: 'WR', height: '6\'2"', weight: 191, rank: 5, collegeLogoUrl: getCollegeLogoUrl('Ohio State') },
  { id: 'p6', name: 'Jordyn Tyson', headshotUrl: getEspnUrl(4880281), college: 'Arizona State', position: 'WR', height: '6\'1"', weight: 190, rank: 6, collegeLogoUrl: getCollegeLogoUrl('Arizona State') },
  { id: 'p7', name: 'Caleb Downs', headshotUrl: getEspnUrl(4870706), college: 'Ohio State', position: 'S', height: '6\'0"', weight: 205, rank: 7, collegeLogoUrl: getCollegeLogoUrl('Ohio State') },
  { id: 'p8', name: 'Jeremiyah Love', headshotUrl: getEspnUrl(4870808), college: 'Notre Dame', position: 'RB', height: '6\'0"', weight: 210, rank: 8, collegeLogoUrl: getCollegeLogoUrl('Notre Dame') },
  { id: 'p9', name: 'Spencer Fano', headshotUrl: getEspnUrl(4870723), college: 'Utah', position: 'OT', height: '6\'5"', weight: 300, rank: 9, collegeLogoUrl: getCollegeLogoUrl('Utah') },
  { id: 'p10', name: 'Francis Mauigoa', headshotUrl: getEspnUrl(4870914), college: 'Miami (FL)', position: 'OT', height: '6\'6"', weight: 342, rank: 10, collegeLogoUrl: getCollegeLogoUrl('Miami (FL)') },
  { id: 'p11', name: 'David Bailey', headshotUrl: getEspnUrl(4685248), college: 'Texas Tech', position: 'DE', height: '6\'3"', weight: 240, rank: 11, collegeLogoUrl: getCollegeLogoUrl('Texas Tech') },
  { id: 'p12', name: 'Keldric Faulk', headshotUrl: getEspnUrl(4870707), college: 'Auburn', position: 'DE', height: '6\'6"', weight: 288, rank: 12, collegeLogoUrl: getCollegeLogoUrl('Auburn') },
  { id: 'p13', name: 'Peter Woods', headshotUrl: getEspnUrl(4871063), college: 'Clemson', position: 'DT', height: '6\'2"', weight: 315, rank: 13, collegeLogoUrl: getCollegeLogoUrl('Clemson') },
  { id: 'p14', name: 'Mansoor Delane', headshotUrl: getEspnUrl(4880124), college: 'LSU', position: 'CB', height: '6\'1"', weight: 185, rank: 14, collegeLogoUrl: getCollegeLogoUrl('LSU') },
  { id: 'p15', name: 'Jermod McCoy', headshotUrl: getEspnUrl(5157289), college: 'Tennessee', position: 'CB', height: '6\'0"', weight: 193, rank: 15, collegeLogoUrl: getCollegeLogoUrl('Tennessee') },
  { id: 'p16', name: 'Makai Lemon', headshotUrl: getEspnUrl(4870795), college: 'USC', position: 'WR', height: '5\'11"', weight: 190, rank: 16, collegeLogoUrl: getCollegeLogoUrl('USC') },
  { id: 'p17', name: 'Sonny Styles', headshotUrl: getEspnUrl(5081807), college: 'Ohio State', position: 'LB', height: '6\'4"', weight: 235, rank: 17, collegeLogoUrl: getCollegeLogoUrl('Ohio State') },
  { id: 'p18', name: 'Kenyon Sadiq', headshotUrl: getEspnUrl(5083315), college: 'Oregon', position: 'TE', height: '6\'3"', weight: 245, rank: 18, collegeLogoUrl: getCollegeLogoUrl('Oregon') },
  { id: 'p19', name: 'Avieon Terrell', headshotUrl: getEspnUrl(4870988), college: 'Clemson', position: 'CB', height: '5\'11"', weight: 180, rank: 19, collegeLogoUrl: getCollegeLogoUrl('Clemson') },
  { id: 'p20', name: 'Ty Simpson', headshotUrl: getEspnUrl(4685522), college: 'Alabama', position: 'QB', height: '6\'2"', weight: 203, rank: 20, collegeLogoUrl: getCollegeLogoUrl('Alabama') },
  { id: 'p21', name: 'Olaivavega Ioane', headshotUrl: getEspnUrl(4832793), college: 'Penn State', position: 'OG', height: '6\'4"', weight: 350, rank: 21, collegeLogoUrl: getCollegeLogoUrl('Penn State') },
  { id: 'p22', name: 'Kadyn Proctor', headshotUrl: getEspnUrl(4870976), college: 'Alabama', position: 'OT', height: '6\'7"', weight: 360, rank: 22, collegeLogoUrl: getCollegeLogoUrl('Alabama') },
  { id: 'p23', name: 'Kayden McDonald', headshotUrl: getEspnUrl(4870893), college: 'Ohio State', position: 'DT', height: '6\'2"', weight: 326, rank: 23, collegeLogoUrl: getCollegeLogoUrl('Ohio State') },
  { id: 'p24', name: 'Denzel Boston', headshotUrl: getEspnUrl(4832800), college: 'Washington', position: 'WR', height: '6\'4"', weight: 209, rank: 24, collegeLogoUrl: getCollegeLogoUrl('Washington') },
  { id: 'p25', name: 'Cashius Howell', headshotUrl: getEspnUrl(4710752), college: 'Texas A&M', position: 'DE', height: '6\'4"', weight: 235, rank: 25, collegeLogoUrl: getCollegeLogoUrl('Texas A&M') },
  { id: 'p26', name: 'Caleb Lomu', headshotUrl: getEspnUrl(4921438), college: 'Utah', position: 'OT', height: '6\'5"', weight: 300, rank: 26, collegeLogoUrl: getCollegeLogoUrl('Utah') },
  { id: 'p27', name: 'T.J. Parker', headshotUrl: getEspnUrl(4870886), college: 'Clemson', position: 'DE', height: '6\'3"', weight: 255, rank: 27, collegeLogoUrl: getCollegeLogoUrl('Clemson') },
  { id: 'p28', name: 'C.J. Allen', headshotUrl: getEspnUrl(4870598), college: 'Georgia', position: 'LB', height: '6\'1"', weight: 235, rank: 28, collegeLogoUrl: getCollegeLogoUrl('Georgia') },
  { id: 'p29', name: 'Kevin Concepcion', headshotUrl: getEspnUrl(4870653), college: 'Texas A&M', position: 'WR', height: '5\'11"', weight: 190, rank: 29, collegeLogoUrl: getCollegeLogoUrl('Texas A&M') },
  { id: 'p30', name: 'Caleb Banks', headshotUrl: getEspnUrl(4602019), college: 'Florida', position: 'DT', height: '6\'6"', weight: 325, rank: 30, collegeLogoUrl: getCollegeLogoUrl('Florida') },
  { id: 'p31', name: 'Brandon Cisse', headshotUrl: getEspnUrl(5076652), college: 'South Carolina', position: 'CB', height: '6\'0"', weight: 182, rank: 31, collegeLogoUrl: getCollegeLogoUrl('South Carolina') },
  { id: 'p32', name: 'Colton Hood', headshotUrl: getEspnUrl(4921249), college: 'Tennessee', position: 'CB', height: '6\'1"', weight: 185, rank: 32, collegeLogoUrl: getCollegeLogoUrl('Tennessee') },
  { id: 'p33', name: 'Matayo Uiagalelei', headshotUrl: getEspnUrl(4871052), college: 'Oregon', position: 'DE', height: '6\'5"', weight: 270, rank: 33, collegeLogoUrl: getCollegeLogoUrl('Oregon') },
  { id: 'p34', name: 'A\'Mauri Washington', headshotUrl: getEspnUrl(4899488), college: 'Oregon', position: 'DT', height: '6\'3"', weight: 300, rank: 34, collegeLogoUrl: getCollegeLogoUrl('Oregon') },
  { id: 'p35', name: 'Gennings Dunker', headshotUrl: getEspnUrl(4431258), college: 'Iowa', position: 'OT', height: '6\'5"', weight: 320, rank: 35, collegeLogoUrl: getCollegeLogoUrl('Iowa') },
  { id: 'p36', name: 'Emmanuel Pregnon', headshotUrl: getEspnUrl(4608929), college: 'Oregon', position: 'OG', height: '6\'5"', weight: 320, rank: 36, collegeLogoUrl: getCollegeLogoUrl('Oregon') },
  { id: 'p37', name: 'Chris Bell', headshotUrl: getEspnUrl(4869961), college: 'Louisville', position: 'WR', height: '6\'2"', weight: 220, rank: 37, collegeLogoUrl: getCollegeLogoUrl('Louisville') },
  { id: 'p38', name: 'L.T. Overton', headshotUrl: getEspnUrl(4870960), college: 'Alabama', position: 'DE', height: '6\'5"', weight: 265, rank: 38, collegeLogoUrl: getCollegeLogoUrl('Alabama') },
  { id: 'p39', name: 'Anthony Hill Jr.', headshotUrl: getEspnUrl(4870805), college: 'Texas', position: 'LB', height: '6\'3"', weight: 234, rank: 39, collegeLogoUrl: getCollegeLogoUrl('Texas') },
  { id: 'p40', name: 'Romello Height', headshotUrl: getEspnUrl(4432244), college: 'Texas Tech', position: 'DE', height: '6\'3"', weight: 230, rank: 40, collegeLogoUrl: getCollegeLogoUrl('Texas Tech') },
  { id: 'p41', name: 'Christen Miller', headshotUrl: getEspnUrl(4685479), college: 'Georgia', position: 'DT', height: '6\'4"', weight: 305, rank: 41, collegeLogoUrl: getCollegeLogoUrl('Georgia') },
  { id: 'p42', name: 'R Mason Thomas', headshotUrl: getEspnUrl(5081927), college: 'Oklahoma', position: 'DE', height: '6\'2"', weight: 245, rank: 42, collegeLogoUrl: getCollegeLogoUrl('Oklahoma') },
  { id: 'p43', name: 'Chris Adams', headshotUrl: getEspnUrl(4698083), college: 'Memphis', position: 'OG', height: '6\'3"', weight: 290, rank: 43, collegeLogoUrl: getCollegeLogoUrl('Memphis') },
  { id: 'p44', name: 'Dillon Thieneman', headshotUrl: getEspnUrl(4954445), college: 'Oregon', position: 'S', height: '6\'0"', weight: 205, rank: 44, collegeLogoUrl: getCollegeLogoUrl('Oregon') },
  { id: 'p45', name: 'Garrett Nussmeier', headshotUrl: getEspnUrl(4567747), college: 'LSU', position: 'QB', height: '6\'2"', weight: 205, rank: 45, collegeLogoUrl: getCollegeLogoUrl('LSU') },
  { id: 'p46', name: 'Zion Young', headshotUrl: getEspnUrl(4839501), college: 'Missouri', position: 'DE', height: '6\'6"', weight: 265, rank: 46, collegeLogoUrl: getCollegeLogoUrl('Missouri') },
  { id: 'p47', name: 'Chris Brazzell', headshotUrl: getEspnUrl(5091739), college: 'Tennessee', position: 'WR', height: '6\'5"', weight: 200, rank: 47, collegeLogoUrl: getCollegeLogoUrl('Tennessee') },
  { id: 'p48', name: 'Emmanuel McNeil-Warren', headshotUrl: getEspnUrl(4837186), college: 'Toledo', position: 'S', height: '6\'2"', weight: 200, rank: 48, collegeLogoUrl: getCollegeLogoUrl('Toledo') },
  { id: 'p49', name: 'Keith Abney II', headshotUrl: getEspnUrl(5093004), college: 'Arizona State', position: 'CB', height: '5\'10"', weight: 185, rank: 49, collegeLogoUrl: getCollegeLogoUrl('Arizona State') },
  { id: 'p50', name: 'Chris Johnson', headshotUrl: getEspnUrl(4869579), college: 'San Diego State', position: 'CB', height: '6\'0"', weight: 180, rank: 50, collegeLogoUrl: getCollegeLogoUrl('San Diego State') },
];
