import { NextRequest, NextResponse } from "next/server";
import type { MasterResume, TailoredResume, ValidationResult } from "@/lib/types";

interface TailorRequest {
  jobDescription: string;
  targetPages: 1 | 2;
  masterResume: MasterResume;
}

// Stub: real pipeline will be wired in a later issue.
export async function POST(req: NextRequest) {
  let body: TailorRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { jobDescription, targetPages, masterResume } = body;

  if (!jobDescription?.trim()) {
    return NextResponse.json({ error: "jobDescription is required." }, { status: 400 });
  }
  if (!masterResume) {
    return NextResponse.json({ error: "masterResume is required." }, { status: 400 });
  }

  // Stub: echo the master resume back as the tailored result.
  // The real pipeline (tailor → validate → render PDF) will replace this.
  const tailored: TailoredResume = {
    jobTitle: "Role (stub)",
    company: "Company (stub)",
    jobDescription,
    resume: masterResume,
    tailoringNotes: `Stub response — pipeline not yet implemented. Target pages: ${targetPages}.`,
    matchScore: 75,
  };

  const validation: ValidationResult = {
    valid: true,
    errors: [],
    warnings: ["This is a stub response. Real validation runs in the pipeline."],
    score: 75,
  };

  // Return an empty PDF placeholder (1-byte stub).
  const pdfBase64 = Buffer.from("%PDF-1.4 stub").toString("base64");

  return NextResponse.json({
    tailored,
    validation,
    fixesApplied: [],
    pages: targetPages,
    pdfBase64,
  });
}
