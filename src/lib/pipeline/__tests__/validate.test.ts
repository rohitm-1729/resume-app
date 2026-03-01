import { describe, it, expect } from "vitest";
import type { MasterResume, TailoredResume } from "../../types";
import { validateMasterResume, validateTailoredResume } from "../validate";
import masterResumeFixture from "./fixtures/master-resume.json";
import tailoredResumeFixture from "./fixtures/tailored-resume.json";

const validMaster = masterResumeFixture as MasterResume;
const validTailored = tailoredResumeFixture as TailoredResume;

describe("validateMasterResume", () => {
  it("passes for the fixture resume", () => {
    const result = validateMasterResume(validMaster);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns a score for a valid resume", () => {
    const result = validateMasterResume(validMaster);
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("fails when name is missing", () => {
    const resume: MasterResume = { ...validMaster, name: "" };
    const result = validateMasterResume(resume);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("name is required");
  });

  it("fails when email is missing", () => {
    const resume: MasterResume = { ...validMaster, email: "" };
    const result = validateMasterResume(resume);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("email is required");
  });

  it("fails when email format is invalid", () => {
    const resume: MasterResume = { ...validMaster, email: "not-an-email" };
    const result = validateMasterResume(resume);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("email format is invalid");
  });

  it("fails when experience is empty", () => {
    const resume: MasterResume = { ...validMaster, experience: [] };
    const result = validateMasterResume(resume);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("experience must have at least one entry");
  });

  it("fails when education is empty", () => {
    const resume: MasterResume = { ...validMaster, education: [] };
    const result = validateMasterResume(resume);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("education must have at least one entry");
  });

  it("warns when an experience entry has no bullets", () => {
    const resume: MasterResume = {
      ...validMaster,
      experience: [
        { ...validMaster.experience[0], bullets: [] },
        ...validMaster.experience.slice(1),
      ],
    };
    const result = validateMasterResume(resume);
    expect(result.warnings).toContain("experience[0] has no bullets");
  });

  it("accumulates multiple errors", () => {
    const resume: MasterResume = { ...validMaster, name: "", email: "", phone: "" };
    const result = validateMasterResume(resume);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  it("score is 0 when there are errors", () => {
    const resume: MasterResume = { ...validMaster, name: "" };
    const result = validateMasterResume(resume);
    expect(result.score).toBe(0);
  });
});

describe("validateTailoredResume", () => {
  it("passes for the fixture tailored resume", () => {
    const result = validateTailoredResume(validTailored);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns a score for a valid tailored resume", () => {
    const result = validateTailoredResume(validTailored);
    expect(result.score).toBeGreaterThan(0);
  });

  it("fails when jobTitle is missing", () => {
    const tailored: TailoredResume = { ...validTailored, jobTitle: "" };
    const result = validateTailoredResume(tailored);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("jobTitle is required");
  });

  it("fails when company is missing", () => {
    const tailored: TailoredResume = { ...validTailored, company: "" };
    const result = validateTailoredResume(tailored);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("company is required");
  });

  it("fails when jobDescription is missing", () => {
    const tailored: TailoredResume = { ...validTailored, jobDescription: "" };
    const result = validateTailoredResume(tailored);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("jobDescription is required");
  });

  it("fails when matchScore is out of range", () => {
    const tailored: TailoredResume = { ...validTailored, matchScore: 150 };
    const result = validateTailoredResume(tailored);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("matchScore must be between 0 and 100");
  });

  it("warns when matchScore is below 50", () => {
    const tailored: TailoredResume = { ...validTailored, matchScore: 40 };
    const result = validateTailoredResume(tailored);
    expect(result.warnings).toContain(
      "matchScore is below 50 — consider better aligning the resume"
    );
  });

  it("propagates nested resume errors with prefix", () => {
    const tailored: TailoredResume = {
      ...validTailored,
      resume: { ...validTailored.resume, name: "" },
    };
    const result = validateTailoredResume(tailored);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("resume.name is required");
  });
});
