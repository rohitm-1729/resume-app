"use client";

import { useEffect, useState } from "react";
import type { MasterResume } from "@/lib/types";

const STORAGE_KEY = "masterResume";

const PLACEHOLDER = JSON.stringify(
  {
    name: "Jane Smith",
    email: "jane@example.com",
    phone: "555-123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/janesmith",
    github: "github.com/janesmith",
    summary: "Software engineer with 5 years of experience...",
    experience: [
      {
        company: "Acme Corp",
        title: "Senior Software Engineer",
        location: "San Francisco, CA",
        startDate: "2021-06",
        endDate: "Present",
        bullets: [
          "Led migration of monolith to microservices, reducing deploy time by 60%.",
          "Mentored 3 junior engineers.",
        ],
      },
    ],
    education: [
      {
        institution: "State University",
        degree: "Bachelor of Science",
        field: "Computer Science",
        graduationDate: "2019-05",
        gpa: "3.8",
      },
    ],
    skills: [
      { category: "Languages", items: ["TypeScript", "Python", "Go"] },
      { category: "Frameworks", items: ["React", "Next.js", "Node.js"] },
    ],
  } satisfies Partial<MasterResume>,
  null,
  2
);

function validateResume(obj: unknown): string | null {
  if (typeof obj !== "object" || obj === null) return "Must be a JSON object.";
  const r = obj as Record<string, unknown>;
  const required = ["name", "email", "phone", "location", "experience", "education", "skills"];
  for (const key of required) {
    if (!(key in r)) return `Missing required field: "${key}"`;
  }
  if (!Array.isArray(r.experience)) return '"experience" must be an array.';
  if (!Array.isArray(r.education)) return '"education" must be an array.';
  if (!Array.isArray(r.skills)) return '"skills" must be an array.';
  return null;
}

export default function ProfilePage() {
  const [json, setJson] = useState("");
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) setJson(stored);
  }, []);

  function handleSave() {
    setSaved(false);
    setValidationError(null);

    let parsed: unknown;
    try {
      parsed = JSON.parse(json);
    } catch {
      setValidationError("Invalid JSON — check for syntax errors.");
      return;
    }

    const err = validateResume(parsed);
    if (err) {
      setValidationError(err);
      return;
    }

    localStorage.setItem(STORAGE_KEY, json);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleClear() {
    localStorage.removeItem(STORAGE_KEY);
    setJson("");
    setValidationError(null);
    setSaved(false);
  }

  const hasContent = json.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Master resume</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Paste your complete resume as JSON. This is used as the source for all
          tailored versions.
        </p>
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-zinc-700">
            Resume JSON
          </label>
          {hasContent && (
            <button
              onClick={handleClear}
              className="text-xs text-zinc-400 hover:text-red-500 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <textarea
          value={json}
          onChange={(e) => {
            setJson(e.target.value);
            setSaved(false);
            setValidationError(null);
          }}
          placeholder={PLACEHOLDER}
          rows={20}
          spellCheck={false}
          className="w-full rounded-lg border border-zinc-200 bg-zinc-50 px-4 py-3 font-mono text-xs text-zinc-900 placeholder-zinc-300 focus:border-zinc-400 focus:outline-none resize-y"
        />

        {validationError && (
          <p className="text-sm text-red-600">{validationError}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={!hasContent}
            className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Save profile
          </button>
          {saved && (
            <span className="text-sm text-green-600 font-medium">Saved!</span>
          )}
        </div>
      </div>

      <details className="text-sm text-zinc-500">
        <summary className="cursor-pointer hover:text-zinc-700">
          View required schema
        </summary>
        <pre className="mt-2 rounded-lg bg-zinc-100 px-4 py-3 text-xs overflow-x-auto">
{`{
  name:       string
  email:      string
  phone:      string
  location:   string
  linkedin?:  string
  github?:    string
  website?:   string
  summary?:   string
  experience: ExperienceEntry[]
  education:  EducationEntry[]
  skills:     SkillEntry[]        // { category, items: string[] }
  projects?:  Project[]
  leadership?: LeadershipItem[]
}`}
        </pre>
      </details>
    </div>
  );
}
