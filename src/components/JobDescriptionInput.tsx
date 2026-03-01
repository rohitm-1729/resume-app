"use client";

import { useState } from "react";

interface Props {
  onSubmit: (jd: string, targetPages: 1 | 2) => void;
  loading: boolean;
}

export default function JobDescriptionInput({ onSubmit, loading }: Props) {
  const [mode, setMode] = useState<"text" | "url">("text");
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [targetPages, setTargetPages] = useState<1 | 2>(1);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const jd = mode === "text" ? text.trim() : url.trim();
    if (!jd) return;
    onSubmit(jd, targetPages);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Toggle */}
      <div className="flex rounded-lg border border-zinc-200 bg-white p-1 w-fit">
        <button
          type="button"
          onClick={() => setMode("text")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "text"
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Paste text
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
            mode === "url"
              ? "bg-zinc-900 text-white"
              : "text-zinc-600 hover:text-zinc-900"
          }`}
        >
          Enter URL
        </button>
      </div>

      {/* Input */}
      {mode === "text" ? (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste the job description here..."
          rows={8}
          required
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none resize-none"
        />
      ) : (
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com/job-posting"
          required
          className="w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-400 focus:outline-none"
        />
      )}

      {/* Target pages */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-zinc-700">Target pages:</span>
        {([1, 2] as const).map((n) => (
          <label key={n} className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="targetPages"
              value={n}
              checked={targetPages === n}
              onChange={() => setTargetPages(n)}
              className="accent-zinc-900"
            />
            <span className="text-sm text-zinc-700">{n}</span>
          </label>
        ))}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        {loading ? "Generating…" : "Generate"}
      </button>
    </form>
  );
}
