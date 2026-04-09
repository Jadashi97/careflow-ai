"use client";

import { useState } from "react";
import CSVDropZone from "@/components/CSVDropZone";
import CSVPreviewTable from "@/components/CSVPreviewTable";
import UploadProgress, { UploadStage } from "@/components/UploadProgress";

interface PreviewData {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  file: File;
}

interface UploadState {
  stage: UploadStage;
  message?: string;
  processed?: number;
  total?: number;
  errors?: string[];
}

function parseCSVLocally(text: string): {
  headers: string[];
  rows: Record<string, string>[];
} {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((l) => l.trim() !== "");
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: Record<string, string> = {};
    headers.forEach((h, i) => {
      row[h] = (values[i] || "").trim();
    });
    return row;
  });
  return { headers, rows };
}

export default function UploadPage() {
  const [carePlanPreview, setCarePlanPreview] = useState<PreviewData | null>(null);
  const [billingPreview, setBillingPreview] = useState<PreviewData | null>(null);
  const [carePlanUpload, setCarePlanUpload] = useState<UploadState>({ stage: "idle" });
  const [billingUpload, setBillingUpload] = useState<UploadState>({ stage: "idle" });

  const handleCarePlanFile = async (file: File) => {
    const text = await file.text();
    const { headers, rows } = parseCSVLocally(text);
    setCarePlanPreview({
      headers,
      rows: rows.slice(0, 10),
      totalRows: rows.length,
      file,
    });
    setCarePlanUpload({ stage: "idle" });
  };

  const handleBillingFile = async (file: File) => {
    const text = await file.text();
    const { headers, rows } = parseCSVLocally(text);
    setBillingPreview({
      headers,
      rows: rows.slice(0, 10),
      totalRows: rows.length,
      file,
    });
    setBillingUpload({ stage: "idle" });
  };

  const processCarePlans = async () => {
    if (!carePlanPreview) return;
    setCarePlanUpload({ stage: "parsing", message: "Reading CSV file..." });

    await delay(400);
    setCarePlanUpload({ stage: "validating", message: "Checking data format..." });

    await delay(400);
    setCarePlanUpload({ stage: "uploading", message: "Saving to database...", processed: 0, total: carePlanPreview.totalRows });

    const formData = new FormData();
    formData.append("file", carePlanPreview.file);

    try {
      const res = await fetch("/api/upload/care-plans", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setCarePlanUpload({
          stage: "error",
          message: data.error || "Upload failed",
          errors: data.errors || [],
        });
        return;
      }

      setCarePlanUpload({
        stage: "done",
        processed: data.processed,
        total: data.total,
        errors: data.errors?.length > 0 ? data.errors : undefined,
        message:
          data.skipped > 0
            ? `${data.skipped} record(s) skipped due to issues.`
            : undefined,
      });
    } catch {
      setCarePlanUpload({
        stage: "error",
        message: "Network error. Please try again.",
      });
    }
  };

  const processBilling = async () => {
    if (!billingPreview) return;
    setBillingUpload({ stage: "parsing", message: "Reading CSV file..." });

    await delay(400);
    setBillingUpload({ stage: "validating", message: "Checking data format..." });

    await delay(400);
    setBillingUpload({ stage: "uploading", message: "Saving to database...", processed: 0, total: billingPreview.totalRows });

    const formData = new FormData();
    formData.append("file", billingPreview.file);

    try {
      const res = await fetch("/api/upload/billing-records", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setBillingUpload({
          stage: "error",
          message: data.error || "Upload failed",
          errors: data.errors || [],
        });
        return;
      }

      setBillingUpload({
        stage: "done",
        processed: data.processed,
        total: data.total,
        errors: data.errors?.length > 0 ? data.errors : undefined,
        message:
          data.skipped > 0
            ? `${data.skipped} record(s) skipped due to issues.`
            : undefined,
      });
    } catch {
      setBillingUpload({
        stage: "error",
        message: "Network error. Please try again.",
      });
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Upload Data</h1>
        <p className="text-sm text-slate-500">
          Import care plan changes and billing records from CSV files
        </p>
      </div>

      {/* Download Templates */}
      <div className="mb-8 rounded-xl bg-white p-5 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Download Sample Templates
        </h2>
        <p className="mb-4 text-xs text-slate-500">
          Use these templates to format your CSV files correctly before uploading.
        </p>
        <div className="flex gap-3">
          <a
            href="/api/upload/templates?type=care-plans"
            download
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Care Plans Template
          </a>
          <a
            href="/api/upload/templates?type=billing-records"
            download
            className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-200"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Billing Records Template
          </a>
        </div>
      </div>

      {/* Upload Sections */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Care Plans Upload */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Care Plans</h2>
          <CSVDropZone
            label="Care Plan CSV"
            description="resident_id, resident_name, room_number, current_care_level, effective_date, documented_by"
            onFileSelected={handleCarePlanFile}
            disabled={carePlanUpload.stage === "uploading"}
          />
          {carePlanPreview && (
            <>
              <CSVPreviewTable
                headers={carePlanPreview.headers}
                rows={carePlanPreview.rows}
                totalRows={carePlanPreview.totalRows}
                title="Care Plans Preview"
              />
              {carePlanUpload.stage === "idle" && (
                <button
                  onClick={processCarePlans}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Process {carePlanPreview.totalRows} Care Plan Records
                </button>
              )}
            </>
          )}
          <UploadProgress
            stage={carePlanUpload.stage}
            message={carePlanUpload.message}
            processed={carePlanUpload.processed}
            total={carePlanUpload.total}
            errors={carePlanUpload.errors}
          />
        </div>

        {/* Billing Records Upload */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Billing Records
          </h2>
          <CSVDropZone
            label="Billing Records CSV"
            description="resident_id, resident_name, billing_month, billed_care_level, amount_billed, payment_status"
            onFileSelected={handleBillingFile}
            disabled={billingUpload.stage === "uploading"}
          />
          {billingPreview && (
            <>
              <CSVPreviewTable
                headers={billingPreview.headers}
                rows={billingPreview.rows}
                totalRows={billingPreview.totalRows}
                title="Billing Records Preview"
              />
              {billingUpload.stage === "idle" && (
                <button
                  onClick={processBilling}
                  className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-700"
                >
                  Process {billingPreview.totalRows} Billing Records
                </button>
              )}
            </>
          )}
          <UploadProgress
            stage={billingUpload.stage}
            message={billingUpload.message}
            processed={billingUpload.processed}
            total={billingUpload.total}
            errors={billingUpload.errors}
          />
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-10 rounded-xl bg-slate-800 p-6 text-white">
        <h3 className="mb-3 text-sm font-semibold">CSV Format Guide</h3>
        <div className="grid grid-cols-1 gap-6 text-xs lg:grid-cols-2">
          <div>
            <p className="mb-2 font-medium text-blue-300">Care Plans CSV</p>
            <ul className="space-y-1 text-slate-300">
              <li>
                <span className="text-slate-400">resident_id:</span> Unique identifier or resident database ID
              </li>
              <li>
                <span className="text-slate-400">resident_name:</span> Full name (First Last)
              </li>
              <li>
                <span className="text-slate-400">room_number:</span> Current room assignment
              </li>
              <li>
                <span className="text-slate-400">current_care_level:</span> LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, or MEMORY_CARE
              </li>
              <li>
                <span className="text-slate-400">effective_date:</span> YYYY-MM-DD format
              </li>
              <li>
                <span className="text-slate-400">documented_by:</span> Name of documenting staff
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-2 font-medium text-blue-300">Billing Records CSV</p>
            <ul className="space-y-1 text-slate-300">
              <li>
                <span className="text-slate-400">resident_id:</span> Unique identifier or resident database ID
              </li>
              <li>
                <span className="text-slate-400">resident_name:</span> Full name (First Last)
              </li>
              <li>
                <span className="text-slate-400">billing_month:</span> YYYY-MM-DD (first of month)
              </li>
              <li>
                <span className="text-slate-400">billed_care_level:</span> LEVEL_1, LEVEL_2, LEVEL_3, LEVEL_4, or MEMORY_CARE
              </li>
              <li>
                <span className="text-slate-400">amount_billed:</span> Dollar amount (e.g. 5100.00)
              </li>
              <li>
                <span className="text-slate-400">payment_status:</span> PENDING, PAID, OVERDUE, or PARTIAL
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
