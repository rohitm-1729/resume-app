import { describe, it, expect } from "vitest";
import { validateResume } from "../step6-validate";
import tailoredResumeFixture from "./fixtures/tailored-resume.json";
import type { TailoredResume } from "../../types";

const validTailored = tailoredResumeFixture as TailoredResume;

describe("step6-validate — valid resume", () => {
  it("passes the tailored-resume fixture", () => {
    const result = validateResume(validTailored);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.score).toBeGreaterThan(0);
  });

  it("returns a score between 0 and 100", () => {
    const result = validateResume(validTailored);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });
});

describe("step6-validate — missing top-level fields", () => {
  it("errors when jobTitle is missing", () => {
    const bad = { ...validTailored, jobTitle: "" };
    const result = validateResume(bad);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Missing jobTitle");
  });

  it("errors when company is missing", () => {
    const bad = { ...validTailored, company: "" };
    const result = validateResume(bad);
    expect(result.errors).toContain("Missing company");
  });

  it("errors when resume object is absent", () => {
    const bad = { ...validTailored, resume: undefined as unknown as TailoredResume["resume"] };
    const result = validateResume(bad);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("Missing resume object");
    expect(result.score).toBe(0);
  });
});

describe("step6-validate — missing resume contact fields", () => {
  it("errors when name is empty", () => {
    const bad: TailoredResume = { ...validTailored, resume: { ...validTailored.resume, name: "" } };
    const result = validateResume(bad);
    expect(result.errors).toContain("resume.name is required");
  });

  it("errors when email is missing", () => {
    const bad: TailoredResume = { ...validTailored, resume: { ...validTailored.resume, email: "" } };
    const result = validateResume(bad);
    expect(result.errors).toContain("resume.email is required");
  });
});

describe("step6-validate — experience validation", () => {
  it("errors when experience array is empty", () => {
    const bad: TailoredResume = { ...validTailored, resume: { ...validTailored.resume, experience: [] } };
    const result = validateResume(bad);
    expect(result.errors).toContain("resume.experience must have at least one entry");
  });

  it("errors when an experience entry has no bullets", () => {
    const exp = { ...validTailored.resume.experience[0], bullets: [] };
    const bad: TailoredResume = {
      ...validTailored,
      resume: { ...validTailored.resume, experience: [exp] },
    };
    const result = validateResume(bad);
    expect(result.errors).toContain("experience[0].bullets must not be empty");
  });
});

describe("step6-validate — warnings", () => {
  it("warns when summary is missing", () => {
    const bad: TailoredResume = {
      ...validTailored,
      resume: { ...validTailored.resume, summary: "" },
    };
    const result = validateResume(bad);
    expect(result.warnings).toContain("resume.summary is missing");
  });

  it("warns when matchScore is out of range", () => {
    const bad: TailoredResume = { ...validTailored, matchScore: 150 };
    const result = validateResume(bad);
    expect(result.warnings).toContain("matchScore should be between 0 and 100");
  });

  it("does not warn when matchScore is undefined", () => {
    const { matchScore: _, ...rest } = validTailored;
    const result = validateResume(rest as TailoredResume);
    expect(result.warnings).not.toContain("matchScore should be between 0 and 100");
  });
});
