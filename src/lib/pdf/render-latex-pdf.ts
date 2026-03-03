import { execFile } from "child_process";
import { mkdtemp, writeFile, readFile, rm } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";

const execFileAsync = promisify(execFile);

export async function renderLatexPDF(tex: string): Promise<{ buffer: Buffer; pages: number }> {
  const dir = await mkdtemp(join(tmpdir(), "resume-latex-"));
  try {
    const texFile = join(dir, "resume.tex");
    await writeFile(texFile, tex, "utf8");

    console.log(`[tailor] step5: invoking pdflatex in ${dir}`);
    try {
      await execFileAsync("pdflatex", [
        "-interaction=nonstopmode",
        "-output-directory",
        dir,
        texFile,
      ]);
      console.log("[tailor] step5: pdflatex exited 0");
    } catch (err) {
      const execErr = err as { code?: number; stderr?: string };
      console.error(`[tailor] step5: pdflatex exited ${execErr.code ?? "unknown"}`);
      if (execErr.stderr) console.error("[tailor] step5: pdflatex stderr:", execErr.stderr);
      throw err;
    }

    const pdfFile = join(dir, "resume.pdf");
    const buffer = await readFile(pdfFile);

    const pages = (buffer.toString("binary").match(/\/Type\s*\/Page[^s]/g) ?? []).length || 1;
    console.log(`[tailor] step5: PDF ${Math.round(buffer.length / 1024)}kb, ${pages} page${pages === 1 ? "" : "s"}`);

    return { buffer, pages };
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
