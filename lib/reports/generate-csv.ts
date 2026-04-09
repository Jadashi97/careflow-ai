// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function generateCSV(rows: any[], columns: { key: string; label: string }[]): string {
  const header = columns.map((c) => `"${c.label}"`).join(",");
  const body = rows.map((row) =>
    columns.map((c) => {
      let val = row[c.key];
      if (val === null || val === undefined) val = "";
      if (val instanceof Date) val = val.toISOString().split("T")[0];
      if (typeof val === "string" && (val.includes(",") || val.includes('"') || val.includes("\n"))) {
        val = `"${val.replace(/"/g, '""')}"`;
      } else {
        val = `"${val}"`;
      }
      return val;
    }).join(",")
  ).join("\n");

  return `${header}\n${body}`;
}

export function downloadCSV(csv: string, filename: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

// Column definitions for each report type
export const REPORT_COLUMNS: Record<string, { key: string; label: string }[]> = {
  revenue_leakage: [
    { key: "resident", label: "Resident" },
    { key: "facility", label: "Facility" },
    { key: "previousLevel", label: "Previous Level" },
    { key: "newLevel", label: "New Level" },
    { key: "expectedRate", label: "Expected Rate" },
    { key: "actualRate", label: "Actual Rate" },
    { key: "monthlyGap", label: "Monthly Gap" },
    { key: "status", label: "Status" },
    { key: "changeDate", label: "Change Date" },
    { key: "documentedBy", label: "Documented By" },
  ],
  ar_aging: [
    { key: "resident", label: "Resident" },
    { key: "facility", label: "Facility" },
    { key: "amountBilled", label: "Amount Billed" },
    { key: "amountPaid", label: "Amount Paid" },
    { key: "balance", label: "Balance" },
    { key: "dueDate", label: "Due Date" },
    { key: "daysOverdue", label: "Days Overdue" },
    { key: "bucket", label: "Aging Bucket" },
    { key: "contactName", label: "Contact Name" },
    { key: "contactEmail", label: "Contact Email" },
    { key: "paymentStatus", label: "Payment Status" },
  ],
  occupancy_revenue: [
    { key: "facility", label: "Facility" },
    { key: "totalBeds", label: "Total Beds" },
    { key: "occupied", label: "Occupied" },
    { key: "occupancyPct", label: "Occupancy %" },
    { key: "totalBilled", label: "Total Billed" },
    { key: "totalCollected", label: "Total Collected" },
    { key: "collectionRate", label: "Collection Rate %" },
    { key: "revenuePerBed", label: "Revenue Per Bed" },
  ],
  monthly_financial: [
    { key: "month", label: "Month" },
    { key: "billed", label: "Billed" },
    { key: "collected", label: "Collected" },
    { key: "outstanding", label: "Outstanding" },
    { key: "collectionRate", label: "Collection Rate %" },
    { key: "invoiceCount", label: "Invoices" },
    { key: "paidCount", label: "Paid" },
    { key: "overdueCount", label: "Overdue" },
    { key: "estimatedExpenses", label: "Est. Expenses" },
    { key: "netIncome", label: "Net Income" },
  ],
  care_level_distribution: [
    { key: "facility", label: "Facility" },
    { key: "LEVEL_1", label: "Level 1" },
    { key: "LEVEL_2", label: "Level 2" },
    { key: "LEVEL_3", label: "Level 3" },
    { key: "LEVEL_4", label: "Level 4" },
    { key: "MEMORY_CARE", label: "Memory Care" },
    { key: "total", label: "Total" },
  ],
};
