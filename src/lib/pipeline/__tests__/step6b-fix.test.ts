import { describe, it, expect, vi } from "vitest";
import Anthropic from "@anthropic-ai/sdk";
import { fixResume } from "../step6b-fix";
import tailoredResumeFixture from "./fixtures/tailored-resume.json";
import type { TailoredResume, ValidationResult } from "../../types";

const tailored = tailoredResumeFixture as TailoredResume;

const failingValidation: ValidationResult = {
  valid: false,
  errors: ["resume.summary is required"],
  warnings: [],
  score: 50,
};

function makeMockClient(responseText: string): Anthropic {
  return {
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: responseText }],
      }),
    },
  } as unknown as Anthropic;
}

describe("step6b-fix", () => {
  it("returns the fixed TailoredResume from Claude's JSON response", async () => {
    const fixed: TailoredResume = {
      ...tailored,
      resume: { ...tailored.resume, summary: "Fixed summary." },
    };
    const mockClient = makeMockClient(JSON.stringify(fixed));

    const result = await fixResume(tailored, failingValidation, mockClient);
    expect(result.resume.summary).toBe("Fixed summary.");
  });

  it("handles JSON wrapped in markdown code fences", async () => {
    const fixed: TailoredResume = {
      ...tailored,
      resume: { ...tailored.resume, summary: "Fixed summary." },
    };
    const fenced = "```json\n" + JSON.stringify(fixed) + "\n```";
    const mockClient = makeMockClient(fenced);

    const result = await fixResume(tailored, failingValidation, mockClient);
    expect(result.resume.summary).toBe("Fixed summary.");
  });

  it("throws when Claude returns no JSON", async () => {
    const mockClient = makeMockClient("I cannot fix this.");
    await expect(fixResume(tailored, failingValidation, mockClient)).rejects.toThrow();
  });

  it("throws when Claude returns a non-text content block", async () => {
    const mockClient = {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: "image" }],
        }),
      },
    } as unknown as Anthropic;

    await expect(fixResume(tailored, failingValidation, mockClient)).rejects.toThrow(
      "Unexpected response type"
    );
  });

  it("passes errors and warnings in the prompt", async () => {
    const mockClient = makeMockClient(JSON.stringify(tailored));
    const validation: ValidationResult = {
      valid: false,
      errors: ["Missing jobTitle"],
      warnings: ["resume.summary is missing"],
      score: 30,
    };

    await fixResume(tailored, validation, mockClient);

    const createCall = (mockClient.messages.create as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(createCall.messages[0].content).toContain("Missing jobTitle");
    expect(createCall.messages[0].content).toContain("resume.summary is missing");
  });
});
