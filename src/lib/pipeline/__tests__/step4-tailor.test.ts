import { describe, it, expect, vi } from "vitest";
import Anthropic from "@anthropic-ai/sdk";
import { tailorResume } from "../step4-tailor";
import masterResumeFixture from "./fixtures/master-resume.json";
import tailoredResumeFixture from "./fixtures/tailored-resume.json";
import type { MasterResume } from "../../types";

const profile = masterResumeFixture as MasterResume;
const jd = "We are looking for a Staff Software Engineer to lead our data infrastructure team.";

function makeMockClient(responseText: string): Anthropic {
  return {
    messages: {
      create: vi.fn().mockResolvedValue({
        content: [{ type: "text", text: responseText }],
      }),
    },
  } as unknown as Anthropic;
}

describe("step4-tailor", () => {
  it("returns a TailoredResume when Claude responds with clean JSON", async () => {
    const mockClient = makeMockClient(JSON.stringify(tailoredResumeFixture));
    const result = await tailorResume(profile, jd, mockClient);

    expect(result.jobTitle).toBe("Staff Software Engineer");
    expect(result.company).toBe("DataFlow Inc");
    expect(result.resume.name).toBe("Jane Doe");
    expect(result.matchScore).toBe(87);
  });

  it("handles JSON wrapped in markdown code fences", async () => {
    const fenced = "```json\n" + JSON.stringify(tailoredResumeFixture) + "\n```";
    const mockClient = makeMockClient(fenced);
    const result = await tailorResume(profile, jd, mockClient);

    expect(result.company).toBe("DataFlow Inc");
  });

  it("handles JSON with leading/trailing prose", async () => {
    const prose =
      "Here is the tailored resume:\n" +
      JSON.stringify(tailoredResumeFixture) +
      "\nHope this helps!";
    const mockClient = makeMockClient(prose);
    const result = await tailorResume(profile, jd, mockClient);

    expect(result.resume.name).toBe("Jane Doe");
  });

  it("throws when Claude returns no JSON", async () => {
    const mockClient = makeMockClient("Sorry, I cannot help with that.");
    await expect(tailorResume(profile, jd, mockClient)).rejects.toThrow();
  });

  it("throws when Claude returns a non-text content block", async () => {
    const mockClient = {
      messages: {
        create: vi.fn().mockResolvedValue({
          content: [{ type: "image" }],
        }),
      },
    } as unknown as Anthropic;

    await expect(tailorResume(profile, jd, mockClient)).rejects.toThrow(
      "Unexpected response type"
    );
  });
});
