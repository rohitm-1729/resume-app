"use client";

import { useEffect, useRef, useState } from "react";
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

type InputMode = "pdf" | "json";

export default function ProfilePage() {
  const [inputMode, setInputMode] = useState<InputMode>("pdf");
  const [json, setJson] = useState("");
  const [saved, setSaved] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<"idle" | "parsing" | "done" | "error">("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setJson(stored);
      setInputMode("json");
    }
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
    setUploadState("idle");
    setUploadError(null);
  }

  async function handleFileUpload(file: File) {
    if (!file.type.includes("pdf")) {
      setUploadError("Please upload a PDF file.");
      return;
    }

    setUploadState("parsing");
    setUploadError(null);
    setValidationError(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/resume/parse-pdf", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Request failed (${res.status})`);
      }

      setJson(JSON.stringify(data.resume, null, 2));
      setUploadState("done");
      setInputMode("json");
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to parse PDF.");
      setUploadState("error");
    }
  }

  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  }

  const hasContent = json.trim().length > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Master resume</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Upload your PDF resume or paste JSON directly. This is used as the source for all
          tailored versions.
        </p>
      </div>

      {/* Toggle */}
      <div className="flex gap-1 rounded-lg bg-zinc-100 p-1 w-fit">
        <button
          onClick={() => setInputMode("pdf")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            inputMode === "pdf"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Upload PDF
        </button>
        <button
          onClick={() => setInputMode("json")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            inputMode === "json"
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-700"
          }`}
        >
          Paste JSON
        </button>
      </div>

      {/* PDF Upload Panel */}
      {inputMode === "pdf" && (
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`flex flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-12 cursor-pointer transition-colors ${
              dragOver
                ? "border-zinc-400 bg-zinc-50"
                : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileInputChange}
              className="hidden"
            />
            {uploadState === "parsing" ? (
              <div className="flex flex-col items-center gap-2">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-700" />
                <p className="text-sm text-zinc-500">Extracting and parsing resume...</p>
              </div>
            ) : (
              <>
                <svg className="h-10 w-10 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <div className="text-center">
                  <p className="text-sm font-medium text-zinc-700">Drop your PDF here or click to browse</p>
                  <p className="mt-1 text-xs text-zinc-400">PDF files only</p>
                </div>
              </>
            )}
          </div>

          {uploadError && (
            <p className="mt-3 text-sm text-red-600">{uploadError}</p>
          )}

          {uploadState === "done" && (
            <p className="mt-3 text-sm text-green-600 font-medium">
              Resume parsed successfully. Review the JSON below and save.
            </p>
          )}
        </div>
      )}

      {/* JSON Editor Panel */}
      {inputMode === "json" && (
        <div className="rounded-lg border border-zinc-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-zinc-700">
              Resume JSON
              {uploadState === "done" && (
                <span className="ml-2 text-xs font-normal text-zinc-400">(parsed from PDF — review before saving)</span>
              )}
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
      )}

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
