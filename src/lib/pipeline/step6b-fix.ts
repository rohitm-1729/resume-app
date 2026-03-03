import Anthropic from "@anthropic-ai/sdk";
import type { TailoredResume, ValidationResult } from "../types";

export async function fixResume(
  tailored: TailoredResume,
  validation: ValidationResult,
  client?: Anthropic
): Promise<{ tailored: TailoredResume; fixesApplied: string[] }> {
  const anthropic = client ?? new Anthropic();

  console.log(
    `[tailor] step6b: fix attempt, errors=${validation.errors.length} warnings=${validation.warnings.length}`
  );

  const errorLines = validation.errors.map((e) => `- ${e}`).join("\n");
  const warningLines = validation.warnings.map((w) => `- ${w}`).join("\n");

  const prompt = `The following tailored resume JSON has validation errors. Fix every error listed.

## Current Resume JSON
${JSON.stringify(tailored, null, 2)}

## Errors (must fix)
${errorLines || "(none)"}

## Warnings (fix if possible)
${warningLines || "(none)"}

## Rules
- Do NOT add fabricated information — only populate required fields using data already present in the JSON
- Preserve all existing correct content
- Respond ONLY with the corrected JSON object — no markdown, no explanation`;

  const message = await anthropic.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  const text = content.text;
  const fixesApplied = [...validation.errors, ...validation.warnings];

  let tailoredFixed: TailoredResume;
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    tailoredFixed = JSON.parse(fenceMatch[1].trim()) as TailoredResume;
  } else {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    if (start === -1 || end === -1) {
      throw new Error("No JSON found in fix response");
    }
    tailoredFixed = JSON.parse(text.slice(start, end + 1)) as TailoredResume;
  }

  console.log(`[tailor] step6b: fixes applied (${fixesApplied.length}):`, fixesApplied);
  return { tailored: tailoredFixed, fixesApplied };
}
