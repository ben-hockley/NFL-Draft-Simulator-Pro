import { supabase } from '../supabase.ts';
import { BigBoardRecord, Prospect } from '../types.ts';

/**
 * Save a new big board to the database.
 */
export async function saveBigBoard(
  name: string,
  creatorName: string,
  draftYear: number,
  prospectOrder: string[]
): Promise<BigBoardRecord> {
  const { data, error } = await supabase
    .from('big_boards')
    .insert({
      name,
      creator_name: creatorName,
      draft_year: draftYear,
      prospect_order: prospectOrder,
    })
    .select()
    .single();

  if (error) throw new Error(`Failed to save big board: ${error.message}`);

  return mapRow(data);
}

/**
 * Fetch community boards with optional search and draft year filter.
 */
export async function fetchCommunityBoards(
  searchTerm?: string,
  draftYear?: number
): Promise<BigBoardRecord[]> {
  let query = supabase
    .from('big_boards')
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

  if (error) throw new Error(`Failed to fetch community boards: ${error.message}`);

  return (data || []).map(mapRow);
}

/**
 * Fetch a single big board by ID.
 */
export async function fetchBigBoardById(id: string): Promise<BigBoardRecord | null> {
  const { data, error } = await supabase
    .from('big_boards')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return mapRow(data);
}

/**
 * Resolve an ordered array of prospect IDs into an ordered Prospect array.
 * Pure utility — no DB call.
 */
export function resolveProspectOrder(
  prospectOrder: string[],
  allProspects: Prospect[]
): Prospect[] {
  const prospectMap = new Map(allProspects.map(p => [p.id, p]));
  return prospectOrder
    .map(id => prospectMap.get(id))
    .filter((p): p is Prospect => p !== undefined);
}

/**
 * Map a raw Supabase row to a BigBoardRecord.
 */
function mapRow(row: any): BigBoardRecord {
  return {
    id: row.id,
    name: row.name,
    creatorName: row.creator_name,
    draftYear: row.draft_year,
    prospectOrder: row.prospect_order || [],
    createdAt: row.created_at,
  };
}
