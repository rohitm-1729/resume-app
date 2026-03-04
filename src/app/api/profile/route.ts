import { NextRequest, NextResponse } from 'next/server';
import type { MasterResume } from '../../../lib/types';
import { getFixtureMasterResume } from '../../../lib/pipeline/seed';
import { validateMasterResume } from '../../../lib/pipeline/validate';
import { supabase } from '../../../lib/supabase';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('data')
      .eq('id', 1)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message);
    }

    if (data) {
      return NextResponse.json(data.data as MasterResume);
    }

    // Seed from fixture on first run
    const profile = await getFixtureMasterResume();
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({ id: 1, data: profile });

    if (insertError) {
      throw new Error(insertError.message);
    }

    return NextResponse.json(profile);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const validation = validateMasterResume(body as MasterResume);
  if (!validation.valid) {
    return NextResponse.json(
      { error: 'Invalid MasterResume', details: validation.errors },
      { status: 400 },
    );
  }

  try {
    const { error } = await supabase
      .from('profiles')
      .upsert({ id: 1, data: body, updated_at: new Date().toISOString() });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
