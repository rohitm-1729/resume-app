import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import path from 'path';

export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? '';
  if (!contentType.includes('multipart/form-data')) {
    return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Failed to parse form data' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!(file instanceof Blob)) {
    return NextResponse.json({ error: 'Missing "file" field' }, { status: 400 });
  }

  if (!file.type.includes('pdf')) {
    return NextResponse.json({ error: 'File must be a PDF' }, { status: 400 });
  }

  // Extract text from PDF
  let extractedText: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    // pdfjs-dist requires DOMMatrix which doesn't exist in Node.js
    if (typeof globalThis.DOMMatrix === 'undefined') {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (globalThis as any).DOMMatrix = class DOMMatrix {
        a=1;b=0;c=0;d=1;e=0;f=0;
        m11=1;m12=0;m13=0;m14=0;m21=0;m22=1;m23=0;m24=0;
        m31=0;m32=0;m33=1;m34=0;m41=0;m42=0;m43=0;m44=1;
        constructor(_init?: string | number[]) {}
        multiply() { return new (globalThis as any).DOMMatrix(); }
        translate() { return new (globalThis as any).DOMMatrix(); }
        scale() { return new (globalThis as any).DOMMatrix(); }
        rotate() { return new (globalThis as any).DOMMatrix(); }
        inverse() { return new (globalThis as any).DOMMatrix(); }
        transformPoint(p: unknown) { return p; }
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { PDFParse } = await import('pdf-parse') as any;
    const workerPath = path.join(process.cwd(), 'node_modules/pdf-parse/dist/worker/pdf.worker.mjs');
    PDFParse.setWorker(`file://${workerPath}`);
    const result = await new PDFParse({ data: buffer }).getText();
    extractedText = result.text;
    if (!extractedText.trim()) {
      return NextResponse.json({ error: 'PDF appears to be empty or has no extractable text' }, { status: 422 });
    }
  } catch (err) {
    console.error('PDF extraction error:', err);
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: `Failed to extract text from PDF: ${msg}` }, { status: 422 });
  }

  // Use Claude to convert extracted text into MasterResume schema
  const anthropic = new Anthropic();

  const prompt = `You are a resume parser. Extract the following resume text into a structured JSON object matching this TypeScript schema exactly:

\`\`\`typescript
interface MasterResume {
  name: string;
  email: string;
  phone: string;
  location: string;
  linkedin?: string;
  github?: string;
  website?: string;
  summary?: string;
  experience: {
    company: string;
    title: string;
    location: string;
    startDate: string;   // format: "YYYY-MM"
    endDate: string;     // format: "YYYY-MM" or "Present"
    bullets: string[];
  }[];
  education: {
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;  // format: "YYYY-MM"
    gpa?: string;
    honors?: string[];
    relevantCoursework?: string[];
  }[];
  skills: {
    category: string;
    items: string[];
  }[];
  projects?: {
    name: string;
    description: string;
    technologies: string[];
    url?: string;
    highlights?: string[];
  }[];
  leadership?: {
    role: string;
    organization: string;
    period: string;
    description?: string;
  }[];
}
\`\`\`

Rules:
- Return ONLY valid JSON with no markdown fences, no explanation, no extra text.
- All dates must be "YYYY-MM" format (e.g. "2022-06") or "Present".
- If a field is not found in the resume text, omit optional fields. For required fields, use an empty string.
- Group skills into logical categories (e.g. "Languages", "Frameworks", "Tools", "Cloud").
- Preserve all bullet points from the experience section as-is.

Resume text:
${extractedText}`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-6',
      max_tokens: 8192,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== 'text') {
      return NextResponse.json({ error: 'Unexpected response from AI' }, { status: 500 });
    }

    // Strip any markdown fences if present
    let jsonText = content.text.trim();
    const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (fenceMatch) jsonText = fenceMatch[1].trim();

    const masterResume = JSON.parse(jsonText);
    return NextResponse.json({ resume: masterResume });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: `AI extraction failed: ${message}` }, { status: 500 });
  }
}
