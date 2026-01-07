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
  { id: 'p1', name: 'Fernando Mendoza', headshotUrl: getEspnUrl(4837248), college: 'Indiana', position: 'QB', height: '6\'5"', weight: 225, rank: 1, collegeLogoUrl: getCollegeLogoUrl('Indiana'), scoutingReport: 'Prototypical pocket passer with a massive frame and elite ball placement. Shows exceptional poise against pressure and has the arm strength to make every NFL throw.' },
  { id: 'p2', name: 'Dante Moore', headshotUrl: getEspnUrl(4870921), college: 'Oregon', position: 'QB', height: '6\'3"', weight: 210, rank: 2, collegeLogoUrl: getCollegeLogoUrl('Oregon'), scoutingReport: 'Polished signal-caller with a lightning-quick release and natural touch on deep balls. High-level processor who can manipulate secondaries with his eyes.' },
  { id: 'p3', name: 'Arvell Reese', headshotUrl: getEspnUrl(4950400), college: 'Ohio State', position: 'LB', height: '6\'3"', weight: 235, rank: 3, collegeLogoUrl: getCollegeLogoUrl('Ohio State'), scoutingReport: 'Modern sideline-to-sideline linebacker with violent hands and elite closing speed. A disruptive force in both the run game and intermediate passing lanes.' },
  { id: 'p4', name: 'Rueben Bain', headshotUrl: getEspnUrl(4870617), college: 'Miami (FL)', position: 'DE', height: '6\'3"', weight: 275, rank: 4, collegeLogoUrl: getCollegeLogoUrl('Miami (FL)'), scoutingReport: 'Advanced technician with a relentless motor and elite leverage. Possesses a sophisticated array of pass-rush moves usually seen in 5-year veterans.' },
  { id: 'p5', name: 'Carnell Tate', headshotUrl: getEspnUrl(4871023), college: 'Ohio State', position: 'WR', height: '6\'2"', weight: 191, rank: 5, collegeLogoUrl: getCollegeLogoUrl('Ohio State'), scoutingReport: 'Refined route runner with exceptional body control and vacuum-like hands. Master of finding soft spots in zone coverage and a reliable third-down threat.' },
  { id: 'p6', name: 'Jordyn Tyson', headshotUrl: getEspnUrl(4880281), college: 'Arizona State', position: 'WR', height: '6\'1"', weight: 190, rank: 6, collegeLogoUrl: getCollegeLogoUrl('Arizona State'), scoutingReport: 'Dynamic vertical threat with game-breaking speed. Excels at tracking the deep ball and has the agility to turn short hitches into long scores.' },
  { id: 'p7', name: 'Caleb Downs', headshotUrl: getEspnUrl(4870706), college: 'Ohio State', position: 'S', height: '6\'0"', weight: 205, rank: 7, collegeLogoUrl: getCollegeLogoUrl('Ohio State'), scoutingReport: 'Instinctual safety who functions as a coach on the field. Elite at diagnosing plays pre-snap and provides sure-handed tackling in the open field.' },
  { id: 'p8', name: 'Jeremiyah Love', headshotUrl: getEspnUrl(4870808), college: 'Notre Dame', position: 'RB', height: '6\'0"', weight: 210, rank: 8, collegeLogoUrl: getCollegeLogoUrl('Notre Dame'), scoutingReport: 'Explosive home-run hitter with elite acceleration. Rare receiving versatility for a back, capable of lining up in the slot and running a full route tree.' },
  { id: 'p9', name: 'Spencer Fano', headshotUrl: getEspnUrl(4870723), college: 'Utah', position: 'OT', height: '6\'5"', weight: 300, rank: 9, collegeLogoUrl: getCollegeLogoUrl('Utah'), scoutingReport: 'Athletic tackle with light feet and great balance in pass protection. Shows the lateral agility needed for complex zone-blocking schemes and second-level climbs.' },
  { id: 'p10', name: 'Francis Mauigoa', headshotUrl: getEspnUrl(4870914), college: 'Miami (FL)', position: 'OT', height: '6\'6"', weight: 342, rank: 10, collegeLogoUrl: getCollegeLogoUrl('Miami (FL)'), scoutingReport: 'Massive road-grader with overwhelming power. Despite his size, he possesses surprisingly nimble feet and is a brick wall against power-rushers.' },
  { id: 'p11', name: 'David Bailey', headshotUrl: getEspnUrl(4685248), college: 'Texas Tech', position: 'DE', height: '6\'3"', weight: 240, rank: 11, collegeLogoUrl: getCollegeLogoUrl('Texas Tech'), scoutingReport: 'High-energy edge rusher with a quick first step. Uses his low center of gravity to dip under tackles and possesses an elite closing burst to the QB.' },
  { id: 'p12', name: 'Keldric Faulk', headshotUrl: getEspnUrl(4870707), college: 'Auburn', position: 'DE', height: '6\'6"', weight: 288, rank: 12, collegeLogoUrl: getCollegeLogoUrl('Auburn'), scoutingReport: 'Rare physical specimen with elite length. Capable of setting a hard edge in the run game and uses his long levers to keep blockers off his frame.' },
  { id: 'p13', name: 'Peter Woods', headshotUrl: getEspnUrl(4871063), college: 'Clemson', position: 'DT', height: '6\'2"', weight: 315, rank: 13, collegeLogoUrl: getCollegeLogoUrl('Clemson'), scoutingReport: 'Violent interior defender with elite hand usage. Can collapse the pocket from the inside and shows exceptional lateral range for a man of his size.' },
  { id: 'p14', name: 'Mansoor Delane', headshotUrl: getEspnUrl(4880124), college: 'LSU', position: 'CB', height: '6\'1"', weight: 185, rank: 14, collegeLogoUrl: getCollegeLogoUrl('LSU'), scoutingReport: 'Sticky man-to-man corner with elite mirror-and-match capabilities. Plays with a high level of confidence and possesses excellent ball skills downfield.' },
  { id: 'p15', name: 'Jermod McCoy', headshotUrl: getEspnUrl(5157289), college: 'Tennessee', position: 'CB', height: '6\'0"', weight: 193, rank: 15, collegeLogoUrl: getCollegeLogoUrl('Tennessee'), scoutingReport: 'Smooth-moving corner with great recovery speed. Shows an innate ability to find the football in the air and is a willing contributor in run support.' },
  { id: 'p16', name: 'Makai Lemon', headshotUrl: getEspnUrl(4870795), college: 'USC', position: 'WR', height: '5\'11"', weight: 190, rank: 16, collegeLogoUrl: getCollegeLogoUrl('USC'), scoutingReport: 'Twitchy slot specialist with elite short-area quickness. A nightmare for defenders in space and a consistent chain-mover with reliable hands.' },
  { id: 'p17', name: 'Sonny Styles', headshotUrl: getEspnUrl(5081807), college: 'Ohio State', position: 'LB', height: '6\'4"', weight: 235, rank: 17, collegeLogoUrl: getCollegeLogoUrl('Ohio State'), scoutingReport: 'Versatile hybrid defender with safety range in a linebacker body. Capable of covering TEs and RBs with ease while maintaining the physicality to play in the box.' },
  { id: 'p18', name: 'Kenyon Sadiq', headshotUrl: getEspnUrl(5083315), college: 'Oregon', position: 'TE', height: '6\'3"', weight: 245, rank: 18, collegeLogoUrl: getCollegeLogoUrl('Oregon'), scoutingReport: 'Modern "F" tight end who is more of a jumbo receiver. Elite athleticism for the position and a mismatch nightmare against traditional linebackers.' },
  { id: 'p19', name: 'Avieon Terrell', headshotUrl: getEspnUrl(4870988), college: 'Clemson', position: 'CB', height: '5\'11"', weight: 180, rank: 19, collegeLogoUrl: getCollegeLogoUrl('Clemson'), scoutingReport: 'Tenacious corner with elite bloodlines. Plays much bigger than his size and shows the competitive fire needed to lock down an opponent\'s WR1.' },
  { id: 'p20', name: 'Ty Simpson', headshotUrl: getEspnUrl(4685522), college: 'Alabama', position: 'QB', height: '6\'2"', weight: 203, rank: 20, collegeLogoUrl: getCollegeLogoUrl('Alabama'), scoutingReport: 'Talented scrambler with a live arm. Shows high-end playmaking ability when the structure breaks down and can make difficult throws from off-platform.' },
  { id: 'p21', name: 'Olaivavega Ioane', headshotUrl: getEspnUrl(4832793), college: 'Penn State', position: 'OG', height: '6\'4"', weight: 350, rank: 21, collegeLogoUrl: getCollegeLogoUrl('Penn State'), scoutingReport: 'Powerful interior blocker with a massive anchor. Nearly impossible to bull-rush and creates massive lanes in short-yardage situations.' },
  { id: 'p22', name: 'Kadyn Proctor', headshotUrl: getEspnUrl(4870976), college: 'Alabama', position: 'OT', height: '6\'7"', weight: 360, rank: 22, collegeLogoUrl: getCollegeLogoUrl('Alabama'), scoutingReport: 'Huge tackle with natural strength. Dominant in the run game where he can displace defenders at will and possesses the length to swallow up speed rushers.' },
  { id: 'p23', name: 'Kayden McDonald', headshotUrl: getEspnUrl(4870893), college: 'Ohio State', position: 'DT', height: '6\'2"', weight: 326, rank: 23, collegeLogoUrl: getCollegeLogoUrl('Ohio State'), scoutingReport: 'Classic nose tackle with surprising quickness. Excellent at eating up double teams and maintaining his gap integrity against heavy run sets.' },
  { id: 'p24', name: 'Denzel Boston', headshotUrl: getEspnUrl(4832800), college: 'Washington', position: 'WR', height: '6\'4"', weight: 209, rank: 24, collegeLogoUrl: getCollegeLogoUrl('Washington'), scoutingReport: 'Tall boundary receiver with a massive catch radius. Elite at winning 50/50 balls and uses his frame effectively to shield defenders from the football.' },
  { id: 'p25', name: 'Cashius Howell', headshotUrl: getEspnUrl(4710752), college: 'Texas A&M', position: 'DE', height: '6\'4"', weight: 235, rank: 25, collegeLogoUrl: getCollegeLogoUrl('Texas A&M'), scoutingReport: 'Stand-up edge rusher with elite bend. Can get low to the ground and turn the corner with speed, making life miserable for slower offensive tackles.' },
  { id: 'p26', name: 'Caleb Lomu', headshotUrl: getEspnUrl(4921438), college: 'Utah', position: 'OT', height: '6\'5"', weight: 300, rank: 26, collegeLogoUrl: getCollegeLogoUrl('Utah'), scoutingReport: 'High-IQ tackle with great technique. Rarely out of position and shows the functional strength needed to hold up against NFL-level power moves.' },
  { id: 'p27', name: 'T.J. Parker', headshotUrl: getEspnUrl(4870886), college: 'Clemson', position: 'DE', height: '6\'3"', weight: 255, rank: 27, collegeLogoUrl: getCollegeLogoUrl('Clemson'), scoutingReport: 'Stout defensive end with strong hands. Excels at setting the edge and has a reliable inside-counter move to catch tackles leaning.' },
  { id: 'p28', name: 'C.J. Allen', headshotUrl: getEspnUrl(4870598), college: 'Georgia', position: 'LB', height: '6\'1"', weight: 235, rank: 28, collegeLogoUrl: getCollegeLogoUrl('Georgia'), scoutingReport: 'Hard-hitting linebacker with exceptional gap discipline. Reliable in traffic and shows the strength to take on and shed offensive linemen at the point of attack.' },
  { id: 'p29', name: 'Kevin Concepcion', headshotUrl: getEspnUrl(4870653), college: 'Texas A&M', position: 'WR', height: '5\'11"', weight: 190, rank: 29, collegeLogoUrl: getCollegeLogoUrl('Texas A&M'), scoutingReport: 'Versatile weapon with elite YAC capability. Dangerous on jets and screens, consistently turning small gains into explosive plays.' },
  { id: 'p30', name: 'Caleb Banks', headshotUrl: getEspnUrl(4602019), college: 'Florida', position: 'DT', height: '6\'6"', weight: 325, rank: 30, collegeLogoUrl: getCollegeLogoUrl('Florida'), scoutingReport: 'Unusually tall and long defensive tackle. Uses his wingspan to obstruct passing lanes and has the leverage to walk blockers back into the QB\'s lap.' },
  { id: 'p31', name: 'Brandon Cisse', headshotUrl: getEspnUrl(5076652), college: 'South Carolina', position: 'CB', height: '6\'0"', weight: 182, rank: 31, collegeLogoUrl: getCollegeLogoUrl('South Carolina'), scoutingReport: 'Fluid athlete with high-end recovery speed. Excels in zone coverage where he can use his eyes to jump routes and force turnovers.' },
  { id: 'p32', name: 'Colton Hood', headshotUrl: getEspnUrl(4921249), college: 'Tennessee', position: 'CB', height: '6\'1"', weight: 185, rank: 32, collegeLogoUrl: getCollegeLogoUrl('Tennessee'), scoutingReport: 'Long, athletic corner who excels in press-man coverage. Uses his reach to disrupt WRs at the line of scrimmage and maintain tight windows.' },
  { id: 'p33', name: 'Matayo Uiagalelei', headshotUrl: getEspnUrl(4871052), college: 'Oregon', position: 'DE', height: '6\'5"', weight: 270, rank: 33, collegeLogoUrl: getCollegeLogoUrl('Oregon'), scoutingReport: 'Powerful end with heavy hands and a relentless bull-rush. Capable of lining up in multiple spots along the defensive front.' },
  { id: 'p34', name: 'A\'Mauri Washington', headshotUrl: getEspnUrl(4899488), college: 'Oregon', position: 'DT', height: '6\'3"', weight: 300, rank: 34, collegeLogoUrl: getCollegeLogoUrl('Oregon'), scoutingReport: 'Burst-oriented defensive tackle who can penetrate into the backfield. Disrupted run plays before they even develop with his quick first step.' },
  { id: 'p35', name: 'Gennings Dunker', headshotUrl: getEspnUrl(4431258), college: 'Iowa', position: 'OT', height: '6\'5"', weight: 320, rank: 35, collegeLogoUrl: getCollegeLogoUrl('Iowa'), scoutingReport: 'Technically sound tackle with a high football IQ. Shows great patience in pass protection and uses his leverage perfectly in the run game.' },
  { id: 'p36', name: 'Emmanuel Pregnon', headshotUrl: getEspnUrl(4608929), college: 'Oregon', position: 'OG', height: '6\'5"', weight: 320, rank: 36, collegeLogoUrl: getCollegeLogoUrl('Oregon'), scoutingReport: 'Physical interior blocker who seeks out contact. Excels in a phone booth and shows the nasty streak needed to finish blocks through the whistle.' },
  { id: 'p37', name: 'Chris Bell', headshotUrl: getEspnUrl(4869961), college: 'Louisville', position: 'WR', height: '6\'2"', weight: 220, rank: 37, collegeLogoUrl: getCollegeLogoUrl('Louisville'), scoutingReport: 'Physical receiver who excels at winning through contact. A reliable target in the red zone and a strong blocker in the run game.' },
  { id: 'p38', name: 'L.T. Overton', headshotUrl: getEspnUrl(4870960), college: 'Alabama', position: 'DE', height: '6\'5"', weight: 265, rank: 38, collegeLogoUrl: getCollegeLogoUrl('Alabama'), scoutingReport: 'Former top recruit with high-end physical traits. Possesses the frame to add more weight and the raw power to develop into a premier NFL starter.' },
  { id: 'p39', name: 'Anthony Hill Jr.', headshotUrl: getEspnUrl(4870805), college: 'Texas', position: 'LB', height: '6\'3"', weight: 234, rank: 39, collegeLogoUrl: getCollegeLogoUrl('Texas'), scoutingReport: 'Aggressive linebacker with elite blitzing capability. Finds the narrowest gaps to attack the QB and is a sound tackler in space.' },
  { id: 'p40', name: 'Romello Height', headshotUrl: getEspnUrl(4432244), college: 'Texas Tech', position: 'DE', height: '6\'3"', weight: 230, rank: 40, collegeLogoUrl: getCollegeLogoUrl('Texas Tech'), scoutingReport: 'Twitchy speed rusher with high-end acceleration. Excels at chasing down plays from the backside and has the agility to drop into coverage if needed.' },
  { id: 'p41', name: 'Christen Miller', headshotUrl: getEspnUrl(4685479), college: 'Georgia', position: 'DT', height: '6\'4"', weight: 305, rank: 41, collegeLogoUrl: getCollegeLogoUrl('Georgia'), scoutingReport: 'Powerful interior presence with elite leverage. Dominant at the point of attack and nearly impossible to move off his spot in the run game.' },
  { id: 'p42', name: 'R Mason Thomas', headshotUrl: getEspnUrl(5081927), college: 'Oklahoma', position: 'DE', height: '6\'2"', weight: 245, rank: 42, collegeLogoUrl: getCollegeLogoUrl('Oklahoma'), scoutingReport: 'High-motor edge defender with a variety of pass-rush counters. Persistent in his pursuit of the QB and shows great awareness in screen defense.' },
  { id: 'p43', name: 'Chris Adams', headshotUrl: getEspnUrl(4698083), college: 'Memphis', position: 'OG', height: '6\'3"', weight: 290, rank: 43, collegeLogoUrl: getCollegeLogoUrl('Memphis'), scoutingReport: 'Undersized but athletic guard with great pulling ability. Excels in space and shows the quickness to reach second-level defenders.' },
  { id: 'p44', name: 'Dillon Thieneman', headshotUrl: getEspnUrl(4954445), college: 'Oregon', position: 'S', height: '6\'0"', weight: 205, rank: 44, collegeLogoUrl: getCollegeLogoUrl('Oregon'), scoutingReport: 'Center-field safety with elite range. Possesses high-level ball tracking skills and is a consistent turnover threat in the deep secondary.' },
  { id: 'p45', name: 'Garrett Nussmeier', headshotUrl: getEspnUrl(4567747), college: 'LSU', position: 'QB', height: '6\'2"', weight: 205, rank: 45, collegeLogoUrl: getCollegeLogoUrl('LSU'), scoutingReport: 'Gunslinger with a quick release and high-end confidence. Unafraid to attack tight windows and shows the ability to throw with anticipation.' },
  { id: 'p46', name: 'Zion Young', headshotUrl: getEspnUrl(4839501), college: 'Missouri', position: 'DE', height: '6\'6"', weight: 265, rank: 46, collegeLogoUrl: getCollegeLogoUrl('Missouri'), scoutingReport: 'Long, developmental edge rusher with massive upside. High-end frame for the position and shows flashes of dominant physical traits.' },
  { id: 'p47', name: 'Chris Brazzell', headshotUrl: getEspnUrl(5091739), college: 'Tennessee', position: 'WR', height: '6\'5"', weight: 200, rank: 47, collegeLogoUrl: getCollegeLogoUrl('Tennessee'), scoutingReport: 'Lanky receiver with exceptional vertical leaping ability. A consistent winner in contested situations and a threat on deep fade routes.' },
  { id: 'p48', name: 'Emmanuel McNeil-Warren', headshotUrl: getEspnUrl(4837186), college: 'Toledo', position: 'S', height: '6\'2"', weight: 200, rank: 48, collegeLogoUrl: getCollegeLogoUrl('Toledo'), scoutingReport: 'Physical safety who thrives in the box. Excellent at shedding blocks from TEs and provides a physical presence in the run-fit.' },
  { id: 'p49', name: 'Keith Abney II', headshotUrl: getEspnUrl(5093004), college: 'Arizona State', position: 'CB', height: '5\'10"', weight: 185, rank: 49, collegeLogoUrl: getCollegeLogoUrl('Arizona State'), scoutingReport: 'Scrappy corner with elite short-area quickness. Excels at playing the ball and has the discipline to maintain leverage in complex coverages.' },
  { id: 'p50', name: 'Chris Johnson', headshotUrl: getEspnUrl(4869579), college: 'San Diego State', position: 'CB', height: '6\'0"', weight: 180, rank: 50, collegeLogoUrl: getCollegeLogoUrl('San Diego State'), scoutingReport: 'Technically sound corner with great transition mechanics. Smooth backpedal and shows the ability to stay in phase with speed receivers.' },
];
