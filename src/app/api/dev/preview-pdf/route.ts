import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { renderPDF } from "@/lib/pipeline/step5-render-pdf";
import type { TailoredResume } from "@/lib/types";

const FIXTURE_PATH = path.join(process.cwd(), "e2e", "fixtures", "tailor-response.json");

export async function GET() {
  let tailored: TailoredResume;
  try {
    const raw = fs.readFileSync(FIXTURE_PATH, "utf-8");
    const fixture = JSON.parse(raw);
    tailored = fixture.tailored as TailoredResume;
  } catch {
    return NextResponse.json({ error: "Failed to load fixture" }, { status: 500 });
  }

  let buffer: Buffer;
  try {
    const result = await renderPDF(tailored);
    buffer = result.buffer;
  } catch (err) {
    const message = err instanceof Error ? err.message : "PDF render failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": "inline; filename=\"preview.pdf\"",
    },
  });
}
