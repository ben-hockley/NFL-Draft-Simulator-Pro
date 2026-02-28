import { CombineStats, Prospect } from '../types';

export interface CombineStatMeta {
  key: keyof CombineStats;
  label: string;
  shortLabel: string;
  unit: string;
  lowerIsBetter: boolean;
}

export const COMBINE_STAT_META: CombineStatMeta[] = [
  { key: 'fortyYardDash',     label: '40 Yard Dash',     shortLabel: '40YD',    unit: 's',    lowerIsBetter: true },
  { key: 'tenYardSplit',      label: '10 Yard Split',    shortLabel: '10YD',    unit: 's',    lowerIsBetter: true },
  { key: 'verticalJump',      label: 'Vertical Jump',    shortLabel: 'VERT',    unit: '"',    lowerIsBetter: false },
  { key: 'broadJump',         label: 'Broad Jump',       shortLabel: 'BROAD',   unit: '',     lowerIsBetter: false },
  { key: 'threeConeDrill',    label: '3 Cone Drill',     shortLabel: '3-CONE',  unit: 's',    lowerIsBetter: true },
  { key: 'twentyYardShuttle', label: '20 Yard Shuttle',  shortLabel: 'SHUTTLE', unit: 's',    lowerIsBetter: true },
  { key: 'benchPress',        label: 'Bench Press',      shortLabel: 'BENCH',   unit: ' Reps', lowerIsBetter: false },
];

export function formatBroadJump(val: number | null | undefined): string {
  if (!val) return 'N/A';
  const s = String(val);
  if (s.length >= 4) {
    const inches = s.slice(-3, -1);
    const feet = s.slice(0, -3);
    return `${feet}'${parseInt(inches)}"`;
  }
  return 'N/A';
}

export function formatCombineValue(key: keyof CombineStats, value: number | null | undefined): string {
  if (value == null) return 'N/A';
  if (key === 'broadJump') return formatBroadJump(value);
  const meta = COMBINE_STAT_META.find(m => m.key === key);
  if (!meta) return String(value);
  return `${value}${meta.unit}`;
}

export function getDefaultSortDir(key: keyof CombineStats): 'asc' | 'desc' {
  const meta = COMBINE_STAT_META.find(m => m.key === key);
  return meta?.lowerIsBetter ? 'asc' : 'desc';
}

export interface CombineRankResult {
  overallRank: number;
  overallTotal: number;
  posRank: number;
  posTotal: number;
}

export function computeCombineRank(
  prospect: Prospect,
  allProspects: Prospect[],
  statKey: keyof CombineStats
): CombineRankResult | null {
  const val = prospect.combine?.[statKey];
  if (val == null) return null;

  const meta = COMBINE_STAT_META.find(m => m.key === statKey);
  if (!meta) return null;

  // Filter to same draft year and non-null on this stat
  const sameYear = allProspects.filter(
    p => p.draftYear === prospect.draftYear && p.combine?.[statKey] != null
  );

  // Sort: for lowerIsBetter, ascending (rank 1 = smallest). For higherIsBetter, descending (rank 1 = largest).
  const sorted = [...sameYear].sort((a, b) => {
    const aVal = a.combine![statKey]!;
    const bVal = b.combine![statKey]!;
    return meta.lowerIsBetter ? aVal - bVal : bVal - aVal;
  });

  const overallRank = sorted.findIndex(p => p.id === prospect.id) + 1;
  const overallTotal = sorted.length;

  // Position-specific
  const samePos = sorted.filter(p => p.position === prospect.position);
  const posRank = samePos.findIndex(p => p.id === prospect.id) + 1;
  const posTotal = samePos.length;

  return { overallRank, overallTotal, posRank, posTotal };
}

export function sortByCombineStat(
  prospects: Prospect[],
  key: keyof CombineStats,
  dir: 'asc' | 'desc'
): Prospect[] {
  return [...prospects].sort((a, b) => {
    const aVal = a.combine?.[key];
    const bVal = b.combine?.[key];

    // Nulls always go to bottom
    if (aVal == null && bVal == null) return 0;
    if (aVal == null) return 1;
    if (bVal == null) return -1;

    return dir === 'asc' ? aVal - bVal : bVal - aVal;
  });
}
