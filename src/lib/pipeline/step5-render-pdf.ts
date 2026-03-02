import { renderToBuffer } from "@react-pdf/renderer";
import { createElement, type ReactElement } from "react";
import type { DocumentProps } from "@react-pdf/renderer";
import { ResumePDF } from "@/components/ResumePDF";
import type { TailoredResume } from "@/lib/types";

export async function renderPDF(tailoredResume: TailoredResume): Promise<{ buffer: Buffer; pages: number }> {
  // ResumePDF renders a Document at its root, so the cast to DocumentProps is safe.
  const element = createElement(ResumePDF, { tailoredResume }) as ReactElement<DocumentProps>;
  const raw = await renderToBuffer(element);
  const buffer = Buffer.from(raw);
  // Count individual page objects in the PDF binary (excludes /Pages parent nodes)
  const pages = (buffer.toString("binary").match(/\/Type\s*\/Page[^s]/g) ?? []).length || 1;
  return { buffer, pages };
}
