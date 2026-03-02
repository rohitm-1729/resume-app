import { describe, it, expect } from "vitest";
import { buildLatexDoc } from "../latex-template";
import type { TailoredResume } from "../../types";
import tailoredFixture from "../../pipeline/__tests__/fixtures/tailored-resume.json";

const tailored = tailoredFixture as TailoredResume;

describe("buildLatexDoc", () => {
  it("returns a non-empty string", () => {
    const doc = buildLatexDoc(tailored);
    expect(typeof doc).toBe("string");
    expect(doc.length).toBeGreaterThan(0);
  });

  it("produces a complete LaTeX document", () => {
    const doc = buildLatexDoc(tailored);
    expect(doc).toContain("\\documentclass[letterpaper,11pt]{article}");
    expect(doc).toContain("\\begin{document}");
    expect(doc).toContain("\\end{document}");
  });

  it("includes the candidate name in the heading", () => {
    const doc = buildLatexDoc(tailored);
    expect(doc).toContain("Jane Doe");
  });

  it("includes contact information", () => {
    const doc = buildLatexDoc(tailored);
    expect(doc).toContain("jane.doe@example.com");
    expect(doc).toContain("+1 (555) 123-4567");
    expect(doc).toContain("linkedin.com/in/janedoe");
    expect(doc).toContain("github.com/janedoe");
  });

  it("includes the Education section", () => {
    const doc = buildLatexDoc(tailored);
    expect(doc).toContain("\\section{Education}");
    expect(doc).toContain("Massachusetts Institute of Technology");
    expect(doc).toContain("Bachelor of Science in Computer Science");
  });

  it("includes the Experience section with bullets", () => {
    const doc = buildLatexDoc(tailored);
    expect(doc).toContain("\\section{Experience}");
    expect(doc).toContain("Senior Software Engineer");
    expect(doc).toContain("Acme Corp");
    expect(doc).toContain("\\resumeItem{");
  });

  it("formats date ranges correctly", () => {
    const doc = buildLatexDoc(tailored);
    expect(doc).toContain("Mar. 2021 -- Present");
    expect(doc).toContain("Jun. 2018 -- Feb. 2021");
  });

  it("includes the Projects section when projects exist", () => {
    const doc = buildLatexDoc(tailored);
    expect(doc).toContain("\\section{Projects}");
    expect(doc).toContain("DistCache");
  });

  it("includes the Technical Skills section", () => {
    const doc = buildLatexDoc(tailored);
    expect(doc).toContain("\\section{Technical Skills}");
    expect(doc).toContain("\\textbf{Languages}");
    expect(doc).toContain("Python");
  });

  it("includes the Leadership section when leadership exists", () => {
    const doc = buildLatexDoc(tailored);
    expect(doc).toContain("\\section{Leadership");
    expect(doc).toContain("Engineering Mentor");
    expect(doc).toContain("Code.org");
  });

  it("uses Deedy-CV tight-bullet spacing commands", () => {
    const doc = buildLatexDoc(tailored);
    expect(doc).toContain("itemsep=-1pt");
    expect(doc).toContain("topsep=0pt");
    expect(doc).toContain("parsep=0pt");
  });

  it("escapes special LaTeX chars in text content", () => {
    const withSpecialChars: TailoredResume = {
      ...tailored,
      resume: {
        ...tailored.resume,
        experience: [
          {
            company: "A&B Corp",
            title: "Engineer 100%",
            location: "New York, NY",
            startDate: "2020-01",
            endDate: "Present",
            bullets: ["Increased revenue by 50% via $1M initiative"],
          },
        ],
      },
    };
    const doc = buildLatexDoc(withSpecialChars);
    expect(doc).toContain("A\\&B Corp");
    expect(doc).toContain("Engineer 100\\%");
    expect(doc).toContain("50\\%");
    expect(doc).toContain("\\$1M");
  });

  it("omits Projects section when resume has no projects", () => {
    const noProjects: TailoredResume = {
      ...tailored,
      resume: { ...tailored.resume, projects: [] },
    };
    const doc = buildLatexDoc(noProjects);
    expect(doc).not.toContain("\\section{Projects}");
  });

  it("omits Leadership section when resume has no leadership", () => {
    const noLeadership: TailoredResume = {
      ...tailored,
      resume: { ...tailored.resume, leadership: [] },
    };
    const doc = buildLatexDoc(noLeadership);
    expect(doc).not.toContain("\\section{Leadership");
  });
});
