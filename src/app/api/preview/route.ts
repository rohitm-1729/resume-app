import { NextResponse } from 'next/server';
import tailorFixture from '../../../../e2e/fixtures/tailor-response.json';
import { renderPDF } from '@/lib/pipeline/step5-render-pdf';
import type { TailoredResume } from '@/lib/types';

/**
 * GET /api/preview
 *
 * Dev-only endpoint that renders the e2e fixture resume into a real PDF and
 * returns it as application/pdf.  Used by scripts/check-pdf-layout.ts and
 * e2e/pdf-layout.spec.ts without needing a live AI call.
 */
export async function GET() {
  const tailored = tailorFixture.tailored as TailoredResume;
  const { buffer } = await renderPDF(tailored);

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'inline; filename="preview.pdf"',
      'Cache-Control': 'no-store',
    },
  });
}
