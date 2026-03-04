import { NextRequest, NextResponse } from 'next/server';
import { fetchJobDescription } from '../../../lib/pipeline/step2-fetch-jd';
import { tailorResume } from '../../../lib/pipeline/step4-tailor';
import { renderPDF } from '../../../lib/pipeline/step5-render-pdf';
import { validateResume } from '../../../lib/pipeline/step6-validate';
import { fixResume } from '../../../lib/pipeline/step6b-fix';
import { supabase } from '../../../lib/supabase';
import type { MasterResume } from '../../../lib/types';

interface TailorRequestBody {
  text?: string;
  url?: string;
  targetPages: 1 | 2;
}

export async function POST(req: NextRequest) {
  let body: TailorRequestBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { text, url, targetPages } = body;

  if (targetPages !== 1 && targetPages !== 2) {
    return NextResponse.json({ error: 'targetPages must be 1 or 2' }, { status: 400 });
  }
  if (!text && !url) {
    return NextResponse.json({ error: 'Provide text or url' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('data')
      .eq('id', 1)
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: 'No profile found. Please visit /profile to set up your master resume before generating.' },
        { status: 404 },
      );
    }

    const profile = data.data as MasterResume;
    const jdText = url ? await fetchJobDescription(url) : text!;
    let tailored = await tailorResume(profile, jdText);
    let { buffer, pages } = await renderPDF(tailored);
    let validation = validateResume(tailored);
    let fixesApplied: string[] = [];

    if (!validation.valid) {
      const fixed = await fixResume(tailored, validation);
      tailored = fixed.tailored;
      fixesApplied = fixed.fixesApplied;
      ({ buffer, pages } = await renderPDF(tailored));
      validation = validateResume(tailored);
    }

    return NextResponse.json({
      success: true,
      tailored,
      validation,
      fixesApplied,
      pages,
      pdfBase64: buffer.toString('base64'),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
