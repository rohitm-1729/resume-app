import { describe, it, expect } from "vitest";
import { buildPrompt } from "../step3-build-prompt";
import masterResumeFixture from "./fixtures/master-resume.json";
import type { MasterResume } from "../../types";

const profile = masterResumeFixture as MasterResume;
const jobDescription = "We are looking for a Staff Software Engineer to lead our data infrastructure team.";

describe("step3-build-prompt", () => {
  it("returns a non-empty string", () => {
    const prompt = buildPrompt({ profile, jobDescription });
    expect(typeof prompt).toBe("string");
    expect(prompt.length).toBeGreaterThan(100);
  });

  it("includes the master resume JSON", () => {
    const prompt = buildPrompt({ profile, jobDescription });
    expect(prompt).toContain(profile.name);
    expect(prompt).toContain(profile.email);
    expect(prompt).toContain(profile.experience[0].company);
  });

  it("includes the job description", () => {
    const prompt = buildPrompt({ profile, jobDescription });
    expect(prompt).toContain(jobDescription);
  });

  it("instructs Claude to respond with JSON only", () => {
    const prompt = buildPrompt({ profile, jobDescription });
    expect(prompt.toLowerCase()).toContain("json");
  });

  it("includes the required output fields in instructions", () => {
    const prompt = buildPrompt({ profile, jobDescription });
    expect(prompt).toContain("jobTitle");
    expect(prompt).toContain("company");
    expect(prompt).toContain("matchScore");
    expect(prompt).toContain("tailoringNotes");
    expect(prompt).toContain("resume");
  });

  it("warns against fabrication", () => {
    const prompt = buildPrompt({ profile, jobDescription });
    expect(prompt.toLowerCase()).toMatch(/fabricat|not add|do not add/);
  });
});
