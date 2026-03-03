/**
 * e2e/pdf-layout.spec.ts
 *
 * Playwright visual-regression test for the resume PDF layout.
 *
 * Fetches the fixture PDF from the dev preview endpoint (/api/preview),
 * converts page 1 to a PNG via pdftoppm, and compares it to a stored
 * snapshot.  The test is skipped automatically when pdftoppm is not
 * installed so it does not block runs in environments without poppler.
 *
 * First run:  `npx playwright test e2e/pdf-layout.spec.ts --update-snapshots`
 * Subsequent: `npx playwright test e2e/pdf-layout.spec.ts`
 *
 * Prerequisites (to run – not just skip):
 *   macOS:   brew install poppler
 *   Ubuntu:  sudo apt-get install -y poppler-utils
 */

import { test, expect } from '@playwright/test';
import { execFile } from 'child_process';
import { mkdtemp, writeFile, readFile, readdir, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import { promisify } from 'util';

const execFileAsync = promisify(execFile);

async function isPdftoppmAvailable(): Promise<boolean> {
  try {
    await execFileAsync('pdftoppm', ['-v']);
    return true;
  } catch (err) {
    return (err as NodeJS.ErrnoException).code !== 'ENOENT';
  }
}

async function pdfPageToPng(pdfBuffer: Buffer): Promise<Buffer> {
  const dir = await mkdtemp(join(tmpdir(), 'pw-pdf-layout-'));
  try {
    const pdfPath = join(dir, 'input.pdf');
    await writeFile(pdfPath, pdfBuffer);

    await execFileAsync('pdftoppm', [
      '-r', '150',
      '-png',
      '-l', '1',
      pdfPath,
      join(dir, 'page'),
    ]);

    const files = await readdir(dir);
    const pngFile = files.find((f) => f.endsWith('.png'));
    if (!pngFile) throw new Error('pdftoppm produced no PNG output');

    return readFile(join(dir, pngFile));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test.describe('PDF layout snapshot', () => {
  test.beforeAll(async () => {
    if (!(await isPdftoppmAvailable())) {
      test.skip();
    }
  });

  test('preview PDF page 1 matches snapshot', async ({ request }) => {
    const res = await request.get('/api/preview');
    expect(res.status()).toBe(200);
    expect(res.headers()['content-type']).toMatch(/application\/pdf/);

    const pdfBuffer = Buffer.from(await res.body());
    const pngBuffer = await pdfPageToPng(pdfBuffer);

    expect(pngBuffer).toMatchSnapshot('pdf-page-1.png');
  });
});
