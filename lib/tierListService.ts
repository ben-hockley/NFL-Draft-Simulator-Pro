import { supabase } from '../supabase.ts';
import { PositionalTierBoard, TierRow, Prospect } from '../types.ts';

/**
 * Save a new positional tier list to the database.
 */
export async function savePositionalTierList(
  name: string,
  creatorName: string,
  draftYear: number,
  tiers: TierRow[],
  tieredProspects: Record<string, Record<string, string[]>>
): Promise<PositionalTierBoard> {
  const { data, error } = await supabase
    .from('positional_tier_lists')
    .insert({
      name,
      creator_name: creatorName,
      draft_year: draftYear,
      tiers,
      tiered_prospects: tieredProspects,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save tier list: ${error.message}`);

  return mapRow(data);
}

/**
 * Fetch community tier lists with optional search and draft year filter.
 */
export async function fetchCommunityTierLists(
  searchTerm?: string,
  draftYear?: number
): Promise<PositionalTierBoard[]> {
  let query = supabase
    .from('positional_tier_lists')
    .select('*')
    .order('created_at', { ascending: false });

  if (draftYear) {
    query = query.eq('draft_year', draftYear);
  }

  if (searchTerm && searchTerm.trim()) {
    const term = `%${searchTerm.trim()}%`;
    query = query.or(`name.ilike.${term},creator_name.ilike.${term}`);
  }

  const { data, error } = await query;

  if (error) throw new Error(`Failed to fetch tier lists: ${error.message}`);

  return (data || []).map(mapRow);
}

/**
 * Fetch a single tier list by ID.
 */
export async function fetchTierListById(id: string): Promise<PositionalTierBoard | null> {
  const { data, error } = await supabase
    .from('positional_tier_lists')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return mapRow(data);
}

/**
 * Resolve tieredProspects (ID-based) to Prospect objects for display.
 * Returns: { [tierId]: { [position]: Prospect[] } }
 */
export function resolveTierProspects(
  tieredProspects: Record<string, Record<string, string[]>>,
  allProspects: Prospect[]
): Record<string, Record<string, Prospect[]>> {
  const prospectMap = new Map(allProspects.map(p => [p.id, p]));
  const result: Record<string, Record<string, Prospect[]>> = {};

  for (const [tierId, posMap] of Object.entries(tieredProspects)) {
    result[tierId] = {};
    for (const [position, ids] of Object.entries(posMap)) {
      result[tierId][position] = ids
        .map(id => prospectMap.get(id))
        .filter((p): p is Prospect => p !== undefined);
    }
  }

  return result;
}

function mapRow(row: any): PositionalTierBoard {
  return {
    id: row.id,
    name: row.name,
    creatorName: row.creator_name,
    draftYear: row.draft_year,
    tiers: row.tiers || [],
    tieredProspects: row.tiered_prospects || {},
    createdAt: row.created_at,
  };
}
