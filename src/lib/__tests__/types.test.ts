import { describe, it, expect } from "vitest";
import type {
  MasterResume,
  TailoredResume,
  ValidationResult,
  PipelineResult,
  SkillEntry,
  Project,
  LeadershipItem,
  ExperienceEntry,
  EducationEntry,
} from "../types";
import masterResumeFixture from "../../lib/pipeline/__tests__/fixtures/master-resume.json";
import tailoredResumeFixture from "../../lib/pipeline/__tests__/fixtures/tailored-resume.json";

describe("types", () => {
  it("master-resume fixture matches MasterResume shape", () => {
    const resume = masterResumeFixture as MasterResume;
    expect(resume.name).toBe("Jane Doe");
    expect(resume.experience).toHaveLength(3);
    expect(resume.education).toHaveLength(1);
    expect(resume.skills.length).toBeGreaterThan(0);
  });

  it("tailored-resume fixture matches TailoredResume shape", () => {
    const tailored = tailoredResumeFixture as TailoredResume;
    expect(tailored.jobTitle).toBe("Staff Software Engineer");
    expect(tailored.company).toBe("DataFlow Inc");
    expect(tailored.resume.name).toBe("Jane Doe");
  });

  it("ValidationResult can be constructed", () => {
    const result: ValidationResult = {
      valid: true,
      errors: [],
      warnings: ["Minor spacing issue"],
      score: 95,
    };
    expect(result.valid).toBe(true);
    expect(result.score).toBe(95);
  });

  it("PipelineResult can be constructed", () => {
    const result: PipelineResult = {
      success: true,
      steps: [
        { name: "parse", status: "success", duration: 100 },
        { name: "tailor", status: "success", duration: 2000 },
      ],
    };
    expect(result.success).toBe(true);
    expect(result.steps).toHaveLength(2);
  });
});
