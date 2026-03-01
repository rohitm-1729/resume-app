import { NextRequest, NextResponse } from 'next/server';
import { fetchJobDescription } from '../../../lib/pipeline/step2-fetch-jd';

export async function POST(req: NextRequest) {
  let body: { url: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { url } = body;
  if (!url || typeof url !== 'string') {
    return NextResponse.json({ error: 'url is required' }, { status: 400 });
  }

  try {
    const text = await fetchJobDescription(url);
    return NextResponse.json({ text });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
