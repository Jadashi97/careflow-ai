"use client";

interface CSVPreviewTableProps {
  headers: string[];
  rows: Record<string, string>[];
  totalRows: number;
  title: string;
}

export default function CSVPreviewTable({
  headers,
  rows,
  totalRows,
  title,
}: CSVPreviewTableProps) {
  if (headers.length === 0 || rows.length === 0) return null;

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
          Showing {rows.length} of {totalRows} rows
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200">
              {headers.map((h) => (
                <th
                  key={h}
                  className="whitespace-nowrap px-3 py-2 font-medium uppercase tracking-wide text-slate-500"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {rows.map((row, i) => (
              <tr key={i} className="text-slate-700">
                {headers.map((h) => (
                  <td key={h} className="whitespace-nowrap px-3 py-2">
                    {row[h] || "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
