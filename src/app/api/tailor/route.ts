import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import os from 'os';
import { fetchJobDescription } from '../../../lib/pipeline/step2-fetch-jd';
import { loadProfile } from '../../../lib/pipeline/step1-load-profile';
import { tailorResume } from '../../../lib/pipeline/step4-tailor';
import { renderPDF } from '../../../lib/pipeline/step5-render-pdf';
import { validateResume } from '../../../lib/pipeline/step6-validate';
import { fixResume } from '../../../lib/pipeline/step6b-fix';

const PROFILE_PATH = path.join(os.homedir(), '.resume-app', 'profile.json');

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
    const jdText = url ? await fetchJobDescription(url) : text!;
    const profile = await loadProfile(PROFILE_PATH);
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
