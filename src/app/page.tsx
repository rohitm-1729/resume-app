"use client";

import { useState } from "react";
import JobDescriptionInput from "@/components/JobDescriptionInput";
import PipelineStatus from "@/components/PipelineStatus";
import TailoredPreview from "@/components/TailoredPreview";
import type { TailoredResume, ValidationResult } from "@/lib/types";

interface TailorResponse {
  tailored: TailoredResume;
  validation: ValidationResult;
  fixesApplied: string[];
  pages: number;
  pdfBase64: string;
}

const PIPELINE_STEPS = [
  "Parse job description",
  "Tailor resume",
  "Validate",
  "Render PDF",
];

export default function GeneratePage() {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [result, setResult] = useState<TailorResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fixApplied, setFixApplied] = useState(false);

  async function handleSubmit(jd: string, targetPages: 1 | 2) {
    setLoading(true);
    setResult(null);
    setError(null);
    setCurrentStep(0);
    setFixApplied(false);

    // Load master resume from localStorage
    const stored = localStorage.getItem("masterResume");
    if (!stored) {
      setError("No master resume found. Please add your profile first.");
      setLoading(false);
      return;
    }

    let masterResume: unknown;
    try {
      masterResume = JSON.parse(stored);
    } catch {
      setError("Master resume in profile is invalid JSON.");
      setLoading(false);
      return;
    }

    try {
      // Simulate step progression while the request runs
      const stepTimer = setInterval(() => {
        setCurrentStep((s) => Math.min(s + 1, PIPELINE_STEPS.length - 1));
      }, 1200);

      const res = await fetch("/api/tailor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: jd, targetPages }),
      });

      clearInterval(stepTimer);
      setCurrentStep(PIPELINE_STEPS.length);

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      const data: TailorResponse = await res.json();
      setFixApplied(data.fixesApplied.length > 0);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-white">Generate resume</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Paste a job description and get a tailored PDF in seconds.
        </p>
      </div>

      <JobDescriptionInput onSubmit={handleSubmit} loading={loading} />

      {loading && (
        <PipelineStatus
          currentStep={currentStep}
          steps={PIPELINE_STEPS}
          fixApplied={fixApplied}
        />
      )}

      {error && (
        <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-4 py-3 text-sm text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {result && !loading && (
        <TailoredPreview result={result} />
      )}
    </div>
  );
}
