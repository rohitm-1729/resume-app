import { NextResponse } from "next/server";
import path from "path";
import { readFile } from "fs/promises";
import { renderPDF } from "@/lib/pipeline/step5-render-pdf";
import type { TailoredResume } from "@/lib/types";

const FIXTURE_PATH = path.join(process.cwd(), "e2e", "fixtures", "tailor-response.json");

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  const raw = await readFile(FIXTURE_PATH, "utf8");
  const { tailored } = JSON.parse(raw) as { tailored: TailoredResume };

  const { buffer } = await renderPDF(tailored);

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="preview.pdf"',
    },
  });
}
