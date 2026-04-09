"use client";

export type UploadStage = "idle" | "parsing" | "validating" | "uploading" | "done" | "error";

interface UploadProgressProps {
  stage: UploadStage;
  message?: string;
  processed?: number;
  total?: number;
  errors?: string[];
}

const stageLabels: Record<UploadStage, string> = {
  idle: "",
  parsing: "Parsing CSV file...",
  validating: "Validating data...",
  uploading: "Storing records in database...",
  done: "Upload complete!",
  error: "Upload failed",
};

export default function UploadProgress({
  stage,
  message,
  processed,
  total,
  errors = [],
}: UploadProgressProps) {
  if (stage === "idle") return null;

  const isActive = ["parsing", "validating", "uploading"].includes(stage);
  const isDone = stage === "done";
  const isError = stage === "error";

  const percent =
    total && total > 0 ? Math.round((processed ?? 0) / total * 100) : 0;

  return (
    <div
      className={`rounded-xl border p-5 ${
        isError
          ? "border-red-200 bg-red-50"
          : isDone
          ? "border-emerald-200 bg-emerald-50"
          : "border-blue-200 bg-blue-50"
      }`}
    >
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        {isActive && (
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        )}
        {isDone && (
          <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )}
        {isError && (
          <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
        )}
        <p
          className={`text-sm font-semibold ${
            isError ? "text-red-700" : isDone ? "text-emerald-700" : "text-blue-700"
          }`}
        >
          {stageLabels[stage]}
        </p>
      </div>

      {/* Progress bar */}
      {isActive && (
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-blue-200">
          <div
            className="h-full rounded-full bg-blue-500 transition-all duration-500"
            style={{ width: stage === "uploading" ? `${percent}%` : "100%" }}
          />
        </div>
      )}

      {/* Message */}
      {message && (
        <p className={`text-sm ${isError ? "text-red-600" : isDone ? "text-emerald-600" : "text-blue-600"}`}>
          {message}
        </p>
      )}

      {/* Stats */}
      {isDone && total !== undefined && (
        <p className="text-sm text-emerald-600">
          {processed} of {total} records processed successfully.
        </p>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-semibold text-red-700">
            {errors.length} issue{errors.length !== 1 ? "s" : ""} found:
          </p>
          <div className="max-h-40 overflow-y-auto rounded-lg bg-white/60 p-3">
            {errors.map((err, i) => (
              <p key={i} className="text-xs text-red-600">
                {err}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
