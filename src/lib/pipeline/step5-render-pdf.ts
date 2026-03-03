import { buildLatexDoc } from "@/lib/pdf/latex-template";
import { renderLatexPDF } from "@/lib/pdf/render-latex-pdf";
import type { TailoredResume } from "@/lib/types";

export async function renderPDF(tailoredResume: TailoredResume): Promise<{ buffer: Buffer; pages: number }> {
  const tex = buildLatexDoc(tailoredResume);
  return renderLatexPDF(tex);
}
