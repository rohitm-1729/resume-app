// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("child_process", () => ({
  execFile: vi.fn(),
}));

vi.mock("fs/promises", () => ({
  mkdtemp: vi.fn(),
  writeFile: vi.fn(),
  readFile: vi.fn(),
  rm: vi.fn(),
}));

vi.mock("os", () => ({
  tmpdir: vi.fn(() => "/tmp"),
}));

import { execFile } from "child_process";
import { mkdtemp, writeFile, readFile, rm } from "fs/promises";
import { renderLatexPDF } from "../render-latex-pdf";

// Minimal fake PDF binary with one page marker
const FAKE_PDF = Buffer.from("%PDF-1.4\n/Type /Page\n%%EOF");

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(mkdtemp).mockResolvedValue("/tmp/resume-latex-abc123");
  vi.mocked(writeFile).mockResolvedValue(undefined);
  vi.mocked(rm).mockResolvedValue(undefined);
  vi.mocked(readFile).mockResolvedValue(FAKE_PDF as unknown as string);

  // execFile is callback-based; promisify wraps it so the last arg is a callback
  vi.mocked(execFile).mockImplementation((...args: unknown[]) => {
    const callback = args[args.length - 1] as (err: null, stdout: string, stderr: string) => void;
    callback(null, "", "");
    return {} as ReturnType<typeof execFile>;
  });
});

describe("renderLatexPDF", () => {
  it("returns a Buffer and page count", async () => {
    const result = await renderLatexPDF("\\documentclass{article}\\begin{document}Hello\\end{document}");
    expect(result.buffer).toBeInstanceOf(Buffer);
    expect(result.pages).toBeGreaterThanOrEqual(1);
  });

  it("writes the tex source to a temp file", async () => {
    const tex = "\\documentclass{article}\\begin{document}Test\\end{document}";
    await renderLatexPDF(tex);
    expect(writeFile).toHaveBeenCalledWith(
      expect.stringContaining("resume.tex"),
      tex,
      "utf8"
    );
  });

  it("invokes pdflatex with nonstopmode and output-directory flags", async () => {
    await renderLatexPDF("hello");
    expect(execFile).toHaveBeenCalledWith(
      "pdflatex",
      expect.arrayContaining(["-interaction=nonstopmode", "-output-directory", expect.any(String)]),
      expect.any(Function)
    );
  });

  it("cleans up the temp directory even when pdflatex fails", async () => {
    vi.mocked(execFile).mockImplementation((...args: unknown[]) => {
      const callback = args[args.length - 1] as (err: Error) => void;
      callback(new Error("pdflatex not found"));
      return {} as ReturnType<typeof execFile>;
    });

    await expect(renderLatexPDF("bad tex")).rejects.toThrow("pdflatex not found");
    expect(rm).toHaveBeenCalledWith(expect.any(String), { recursive: true, force: true });
  });

  it("cleans up the temp directory even when readFile fails", async () => {
    vi.mocked(readFile).mockRejectedValue(new Error("file not found"));

    await expect(renderLatexPDF("hello")).rejects.toThrow("file not found");
    expect(rm).toHaveBeenCalledWith(expect.any(String), { recursive: true, force: true });
  });

  it("counts pages correctly from PDF content", async () => {
    const threePage = Buffer.from("/Type /Page\n/Type /Page\n/Type /Page\n");
    vi.mocked(readFile).mockResolvedValue(threePage as unknown as string);

    const result = await renderLatexPDF("hello");
    expect(result.pages).toBe(3);
  });

  it("defaults to 1 page when no page markers found", async () => {
    vi.mocked(readFile).mockResolvedValue(Buffer.from("%PDF empty") as unknown as string);

    const result = await renderLatexPDF("hello");
    expect(result.pages).toBe(1);
  });
});
