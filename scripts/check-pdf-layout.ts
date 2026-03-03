#!/usr/bin/env npx tsx
/**
 * check-pdf-layout.ts
 *
 * Fetches the dev preview PDF from /api/preview, converts page 1 to a PNG via
 * pdftoppm, then sends the image to Claude Vision to evaluate the layout.
 *
 * Exits 1 (FAIL) if the layout is broken; exits 0 (PASS) otherwise.
 *
 * Prerequisites:
 *   - poppler-utils installed  (brew install poppler  /  apt-get install poppler-utils)
 *   - ANTHROPIC_API_KEY set in the environment
 *   - Dev server running on BASE_URL (default: http://localhost:3002)
 *
 * Usage:
 *   npx tsx scripts/check-pdf-layout.ts
 *   BASE_URL=http://localhost:3002 npx tsx scripts/check-pdf-layout.ts
 */

import { execFile } from 'child_process';
import { mkdtemp, writeFile, readFile, readdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';
import Anthropic from '@anthropic-ai/sdk';

const execFileAsync = promisify(execFile);

const BASE_URL = process.env.BASE_URL ?? 'http://localhost:3002';

// ---------------------------------------------------------------------------
// Step 1: fetch the fixture PDF from the dev preview endpoint
// ---------------------------------------------------------------------------

async function fetchPreviewPdf(): Promise<Buffer> {
  const res = await fetch(`${BASE_URL}/api/preview`);
  if (!res.ok) {
    throw new Error(`Failed to fetch preview PDF: ${res.status} ${res.statusText}`);
  }
  return Buffer.from(await res.arrayBuffer());
}

// ---------------------------------------------------------------------------
// Step 2: convert PDF → PNG (page 1 only, 150 dpi)
// ---------------------------------------------------------------------------

async function pdfPageToPng(pdfBuffer: Buffer): Promise<Buffer> {
  const dir = await mkdtemp(join(tmpdir(), 'pdf-layout-'));
  try {
    const pdfPath = join(dir, 'input.pdf');
    await writeFile(pdfPath, pdfBuffer);

    // pdftoppm flags: -r 150 (dpi), -png, -l 1 (last page = 1 → first page only)
    await execFileAsync('pdftoppm', [
      '-r', '150',
      '-png',
      '-l', '1',
      pdfPath,
      join(dir, 'page'),
    ]).catch((err: Error) => {
      if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
        throw new Error(
          'pdftoppm not found. Install poppler-utils:\n' +
          '  macOS:   brew install poppler\n' +
          '  Ubuntu:  sudo apt-get install -y poppler-utils',
        );
      }
      throw err;
    });

    const files = await readdir(dir);
    const pngFile = files.find((f) => f.endsWith('.png'));
    if (!pngFile) throw new Error('pdftoppm produced no PNG output');

    return readFile(join(dir, pngFile));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

// ---------------------------------------------------------------------------
// Step 3: evaluate layout with Claude Vision
// ---------------------------------------------------------------------------

interface EvalResult {
  verdict: 'PASS' | 'FAIL';
  reason: string;
}

async function evaluateLayout(pngBuffer: Buffer): Promise<EvalResult> {
  const client = new Anthropic();
  const message = await client.messages.create({
    model: 'claude-opus-4-6',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/png',
              data: pngBuffer.toString('base64'),
            },
          },
          {
            type: 'text',
            text: `You are a resume layout evaluator. Examine the resume page image and respond with exactly two lines:

VERDICT: PASS
REASON: one sentence

FAIL criteria (any one is sufficient):
- Text is cut off at the edges or overflows the page boundary
- Sections overlap or collide with each other
- Huge empty gaps (more than 2 inches of whitespace in the middle of the page)
- Name / header is missing or unreadable
- Text appears garbled, corrupted, or uses placeholder characters

PASS: The page looks like a clean, readable, standard single-column resume layout.`,
          },
        ],
      },
    ],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';
  const verdictMatch = text.match(/VERDICT:\s*(PASS|FAIL)/i);
  const reasonMatch = text.match(/REASON:\s*(.+)/i);

  return {
    verdict: (verdictMatch?.[1]?.toUpperCase() ?? 'FAIL') as 'PASS' | 'FAIL',
    reason: reasonMatch?.[1]?.trim() ?? 'No reason provided',
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main(): Promise<void> {
  console.log(`[1/3] Fetching preview PDF from ${BASE_URL}/api/preview …`);
  const pdfBuffer = await fetchPreviewPdf();
  console.log(`      ${pdfBuffer.length} bytes received.`);

  console.log('[2/3] Converting PDF page 1 to PNG via pdftoppm …');
  const pngBuffer = await pdfPageToPng(pdfBuffer);
  console.log(`      ${pngBuffer.length} bytes PNG generated.`);

  console.log('[3/3] Sending to Claude Vision for layout evaluation …');
  const { verdict, reason } = await evaluateLayout(pngBuffer);

  console.log(`\nVerdict : ${verdict}`);
  console.log(`Reason  : ${reason}`);

  if (verdict === 'FAIL') {
    console.error('\n✗ Layout check FAILED. Fix the PDF rendering and re-run.');
    process.exit(1);
  }

  console.log('\n✓ Layout check PASSED.');
}

main().catch((err: unknown) => {
  console.error('Fatal error:', err instanceof Error ? err.message : err);
  process.exit(1);
});
