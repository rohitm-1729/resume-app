"use client";


interface TailorResponse {
  tailored: import("@/lib/types").TailoredResume;
  validation: import("@/lib/types").ValidationResult;
  fixesApplied: string[];
  pages: number;
  pdfBase64: string;
}

interface Props {
  result: TailorResponse;
}

export default function TailoredPreview({ result }: Props) {
  const { tailored, validation, fixesApplied, pages, pdfBase64 } = result;

  function downloadPdf() {
    const bytes = atob(pdfBase64);
    const arr = new Uint8Array(bytes.length);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
    const blob = new Blob([arr], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${tailored.company}-${tailored.jobTitle}.pdf`
      .replace(/\s+/g, "-")
      .toLowerCase();
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-4">
      {/* Tailoring notes */}
      {tailored.tailoringNotes && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm font-medium text-blue-800 mb-1">
            Tailoring notes
          </p>
          <p className="text-sm text-blue-700">{tailored.tailoringNotes}</p>
        </div>
      )}

      {/* Validation */}
      <div className="rounded-lg border border-zinc-200 bg-white px-4 py-3 space-y-2">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-zinc-700">
            Validation score
          </span>
          {validation.score !== undefined && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                validation.score >= 80
                  ? "bg-green-100 text-green-700"
                  : validation.score >= 60
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {validation.score}/100
            </span>
          )}
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
              validation.valid
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {validation.valid ? "Valid" : "Invalid"}
          </span>
        </div>

        {validation.errors.length > 0 && (
          <ul className="text-sm text-red-600 space-y-1">
            {validation.errors.map((e, i) => (
              <li key={i} className="flex gap-2">
                <span>✕</span>
                <span>{e}</span>
              </li>
            ))}
          </ul>
        )}
        {validation.warnings.length > 0 && (
          <ul className="text-sm text-amber-600 space-y-1">
            {validation.warnings.map((w, i) => (
              <li key={i} className="flex gap-2">
                <span>⚠</span>
                <span>{w}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Fix log */}
      {fixesApplied.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
          <p className="text-sm font-medium text-amber-800 mb-1">
            Fixes applied
          </p>
          <ul className="text-sm text-amber-700 space-y-1">
            {fixesApplied.map((fix, i) => (
              <li key={i} className="flex gap-2">
                <span>→</span>
                <span>{fix}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Page count + download */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-zinc-500">
          {pages} page{pages !== 1 ? "s" : ""}
        </span>
        <button
          onClick={downloadPdf}
          className="rounded-lg bg-zinc-900 px-5 py-2 text-sm font-medium text-white hover:bg-zinc-700 transition-colors"
        >
          Download PDF
        </button>
      </div>
    </div>
  );
}
