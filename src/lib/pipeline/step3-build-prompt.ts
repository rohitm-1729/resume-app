import type { MasterResume } from "../types";

export interface PromptInput {
  profile: MasterResume;
  jobDescription: string;
}

export function buildPrompt({ profile, jobDescription }: PromptInput): string {
  return `You are an expert resume writer and career coach. Your task is to tailor a master resume to match a specific job description.

## Master Resume (JSON)
${JSON.stringify(profile, null, 2)}

## Job Description
${jobDescription}

## Instructions
Tailor the resume to the job description by:
1. Reordering and emphasizing experience bullets most relevant to the role
2. Updating the summary to align with the position and company
3. Reorganizing skills to surface the most relevant categories first
4. Reordering projects to put the most relevant first
5. Making minor wording improvements to bullets for clarity and impact
6. Removing or de-emphasizing irrelevant content

Rules:
- Do NOT fabricate any information not present in the master resume
- Do NOT add new jobs, degrees, or skills the candidate does not have
- Only reorganize, reword, and selectively prune existing content

## Output Format
Respond ONLY with a single valid JSON object — no markdown code fences, no explanation, no extra text.

The JSON must match this structure exactly:
{
  "jobTitle": "<exact job title from the job description>",
  "company": "<company name from the job description>",
  "jobDescription": "<first 300 characters of the job description>",
  "matchScore": <integer 0–100 estimating candidate fit>,
  "tailoringNotes": "<1–3 sentences summarizing key changes made>",
  "resume": {
    "name": "...",
    "email": "...",
    "phone": "...",
    "location": "...",
    "linkedin": "...",
    "github": "...",
    "website": "...",
    "summary": "...",
    "experience": [...],
    "education": [...],
    "skills": [...],
    "projects": [...],
    "leadership": [...]
  }
}`;
}
