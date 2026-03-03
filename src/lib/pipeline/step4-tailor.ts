import Anthropic from "@anthropic-ai/sdk";
import type { MasterResume, TailoredResume } from "../types";
import { buildPrompt } from "./step3-build-prompt";

export async function tailorResume(
  profile: MasterResume,
  jobDescription: string,
  client?: Anthropic
): Promise<TailoredResume> {
  const anthropic = client ?? new Anthropic();
  const prompt = buildPrompt({ profile, jobDescription });

  const model = "claude-opus-4-6";
  const t0 = Date.now();
  const message = await anthropic.messages.create({
    model,
    max_tokens: 8192,
    messages: [{ role: "user", content: prompt }],
  });
  const elapsed = Date.now() - t0;

  const { input_tokens, output_tokens } = message.usage;
  console.log(
    `[tailor] step4: model=${model} responded in ${elapsed}ms, ${input_tokens} input tokens, ${output_tokens} output tokens`
  );

  const content = message.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  let parsed: TailoredResume;
  try {
    parsed = JSON.parse(extractJson(content.text)) as TailoredResume;
    console.log("[tailor] step4: JSON parse success");
  } catch (err) {
    console.error("[tailor] step4: JSON parse failed", err);
    throw err;
  }
  return parsed;
}

function extractJson(text: string): string {
  // Strip markdown code fences if present
  const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) return fenceMatch[1].trim();

  // Find the outermost JSON object
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1) {
    throw new Error("No JSON object found in Claude response");
  }
  return text.slice(start, end + 1);
}
