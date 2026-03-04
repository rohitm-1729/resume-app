import { renderToBuffer } from "@react-pdf/renderer";
import { ResumePDF } from "@/components/ResumePDF";
import type { TailoredResume } from "@/lib/types";
import React from "react";

export async function renderPDF(
  tailoredResume: TailoredResume
): Promise<{ buffer: Buffer; pages: number }> {
  const buffer = await renderToBuffer(
    <ResumePDF tailoredResume={tailoredResume} />
  );
  const pages =
    (buffer.toString("binary").match(/\/Type\s*\/Page[^s]/g) ?? []).length || 1;
  return { buffer, pages };
}
