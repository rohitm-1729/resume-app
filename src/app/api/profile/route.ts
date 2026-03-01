import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import type { MasterResume } from '../../../lib/types';
import { loadProfile } from '../../../lib/pipeline/step1-load-profile';
import { getFixtureMasterResume } from '../../../lib/pipeline/seed';
import { validateMasterResume } from '../../../lib/pipeline/validate';

const PROFILE_DIR = path.join(os.homedir(), '.resume-app');
const PROFILE_PATH = path.join(PROFILE_DIR, 'profile.json');

export async function GET() {
  try {
    let profile: MasterResume;
    try {
      profile = await loadProfile(PROFILE_PATH);
    } catch {
      // Seed from fixture on first run
      profile = await getFixtureMasterResume();
      await fs.mkdir(PROFILE_DIR, { recursive: true });
      await fs.writeFile(PROFILE_PATH, JSON.stringify(profile, null, 2), 'utf-8');
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
    await fs.mkdir(PROFILE_DIR, { recursive: true });
    await fs.writeFile(PROFILE_PATH, JSON.stringify(body, null, 2), 'utf-8');
    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
