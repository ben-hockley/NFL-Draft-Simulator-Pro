import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.SUPABASE_URL || 'https://ocstqtwtowhlrrwifgvc.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'sb_publishable_ZWLa-8B8AMRFqJI90jfSzA_oNHc6sPY';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('prospects')
      .select('*')
      .order('rank', { ascending: true });

    if (error) {
      console.error('Supabase Query Error:', error);
      return NextResponse.json(
        { error: 'Database connection failed', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data ?? []);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('Backend Fetch Logic Failed:', message);
    return NextResponse.json(
      { error: 'Database connection failed', details: message },
      { status: 500 }
    );
  }
}
