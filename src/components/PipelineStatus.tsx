"use client";

interface Props {
  currentStep: number;
  steps: string[];
  fixApplied: boolean;
}

export default function PipelineStatus({
  currentStep,
  steps,
  fixApplied,
}: Props) {
  return (
    <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-6 py-4">
      <div className="space-y-3">
        {steps.map((step, i) => {
          const status =
            i < currentStep
              ? "done"
              : i === currentStep
              ? "running"
              : "pending";

          return (
            <div key={step} className="flex items-center gap-3">
              {/* Icon */}
              <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center">
                {status === "done" && (
                  <svg
                    className="h-5 w-5 text-green-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {status === "running" && (
                  <svg
                    className="animate-spin h-5 w-5 text-blue-500"
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
                {status === "pending" && (
                  <span className="h-2 w-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />
                )}
              </span>

              {/* Label */}
              <span
                className={`text-sm ${
                  status === "done"
                    ? "text-zinc-500 dark:text-zinc-400 line-through"
                    : status === "running"
                    ? "font-medium text-zinc-900 dark:text-zinc-100"
                    : "text-zinc-400 dark:text-zinc-500"
                }`}
              >
                {step}
              </span>

              {/* Auto-fix badge on last step */}
              {fixApplied && i === steps.length - 1 && status === "done" && (
                <span className="ml-2 rounded-full bg-amber-100 dark:bg-amber-900 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-300">
                  Auto-fix applied
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
