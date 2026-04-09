import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from "@react-pdf/renderer";
import { createElement } from "react";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: "#1e293b",
  },
  header: {
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    paddingBottom: 12,
  },
  logo: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#3b82f6",
  },
  logoSub: {
    fontSize: 8,
    color: "#94a3b8",
    marginTop: 2,
  },
  title: {
    fontSize: 16,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 9,
    color: "#64748b",
    marginTop: 2,
  },
  // Summary cards
  summaryRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  summaryLabel: {
    fontSize: 7,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  summaryValue: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginTop: 2,
  },
  // Table
  table: {
    marginTop: 8,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderBottomWidth: 1,
    borderBottomColor: "#cbd5e1",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  tableRowAlt: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
    paddingVertical: 5,
    paddingHorizontal: 4,
    backgroundColor: "#f8fafc",
  },
  th: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  td: {
    fontSize: 8,
    color: "#334155",
  },
  tdBold: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginTop: 16,
    marginBottom: 8,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: "#94a3b8",
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ReportDocument({ data }: { data: any }) {
  const e = createElement;

  const header = e(View, { style: styles.header },
    e(Text, { style: styles.logo }, "CareFlow AI"),
    e(Text, { style: styles.logoSub }, "Senior Care Management Platform"),
    e(Text, { style: styles.title }, data.title),
    e(Text, { style: styles.subtitle },
      `Generated: ${new Date(data.generatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" })}`
    ),
  );

  const footer = e(View, { style: styles.footer, fixed: true },
    e(Text, { style: styles.footerText }, "CareFlow AI - Confidential"),
    e(Text, { style: styles.footerText, render: ({ pageNumber, totalPages }: { pageNumber: number; totalPages: number }) => `Page ${pageNumber} of ${totalPages}` }),
  );

  // ── Revenue Leakage ─────────────────────────────────
  if (data.reportType === "revenue_leakage") {
    const s = data.summary;
    return e(Document, {},
      e(Page, { size: "A4", style: styles.page, orientation: "landscape" },
        header,
        e(View, { style: styles.summaryRow },
          e(View, { style: styles.summaryCard },
            e(Text, { style: styles.summaryLabel }, "Total Mismatches"),
            e(Text, { style: styles.summaryValue }, String(s.totalMismatches)),
          ),
          e(View, { style: styles.summaryCard },
            e(Text, { style: styles.summaryLabel }, "Monthly Leakage"),
            e(Text, { style: styles.summaryValue }, `$${s.totalLeakage.toLocaleString()}`),
          ),
          e(View, { style: styles.summaryCard },
            e(Text, { style: styles.summaryLabel }, "Detected"),
            e(Text, { style: styles.summaryValue }, String(s.byStatus.detected)),
          ),
          e(View, { style: styles.summaryCard },
            e(Text, { style: styles.summaryLabel }, "Resolved"),
            e(Text, { style: styles.summaryValue }, String(s.byStatus.resolved)),
          ),
        ),
        e(View, { style: styles.table },
          e(View, { style: styles.tableHeader },
            e(Text, { style: { ...styles.th, width: "15%" } }, "Resident"),
            e(Text, { style: { ...styles.th, width: "14%" } }, "Facility"),
            e(Text, { style: { ...styles.th, width: "10%" } }, "From"),
            e(Text, { style: { ...styles.th, width: "10%" } }, "To"),
            e(Text, { style: { ...styles.th, width: "11%", textAlign: "right" } }, "Expected"),
            e(Text, { style: { ...styles.th, width: "11%", textAlign: "right" } }, "Actual"),
            e(Text, { style: { ...styles.th, width: "11%", textAlign: "right" } }, "Gap/Mo"),
            e(Text, { style: { ...styles.th, width: "9%" } }, "Status"),
            e(Text, { style: { ...styles.th, width: "9%" } }, "Date"),
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...data.rows.map((r: any, i: number) =>
            e(View, { key: i, style: i % 2 ? styles.tableRowAlt : styles.tableRow },
              e(Text, { style: { ...styles.tdBold, width: "15%" } }, r.resident),
              e(Text, { style: { ...styles.td, width: "14%" } }, r.facility),
              e(Text, { style: { ...styles.td, width: "10%" } }, r.previousLevel.replace("_", " ")),
              e(Text, { style: { ...styles.td, width: "10%" } }, r.newLevel.replace("_", " ")),
              e(Text, { style: { ...styles.td, width: "11%", textAlign: "right" } }, `$${r.expectedRate.toLocaleString()}`),
              e(Text, { style: { ...styles.td, width: "11%", textAlign: "right" } }, `$${r.actualRate.toLocaleString()}`),
              e(Text, { style: { ...styles.tdBold, width: "11%", textAlign: "right", color: "#dc2626" } }, `$${r.monthlyGap.toLocaleString()}`),
              e(Text, { style: { ...styles.td, width: "9%" } }, r.status),
              e(Text, { style: { ...styles.td, width: "9%" } }, new Date(r.changeDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })),
            )
          ),
        ),
        footer,
      )
    );
  }

  // ── AR Aging ────────────────────────────────────────
  if (data.reportType === "ar_aging") {
    const s = data.summary;
    return e(Document, {},
      e(Page, { size: "A4", style: styles.page, orientation: "landscape" },
        header,
        e(View, { style: styles.summaryRow },
          e(View, { style: styles.summaryCard },
            e(Text, { style: styles.summaryLabel }, "Total Outstanding"),
            e(Text, { style: styles.summaryValue }, `$${s.totalOutstanding.toLocaleString()}`),
          ),
          e(View, { style: styles.summaryCard },
            e(Text, { style: styles.summaryLabel }, "Current"),
            e(Text, { style: styles.summaryValue }, `$${s.buckets.current.toLocaleString()}`),
          ),
          e(View, { style: styles.summaryCard },
            e(Text, { style: styles.summaryLabel }, "1-30 Days"),
            e(Text, { style: styles.summaryValue }, `$${s.buckets.days30.toLocaleString()}`),
          ),
          e(View, { style: styles.summaryCard },
            e(Text, { style: styles.summaryLabel }, "31-60 Days"),
            e(Text, { style: styles.summaryValue }, `$${s.buckets.days60.toLocaleString()}`),
          ),
          e(View, { style: styles.summaryCard },
            e(Text, { style: styles.summaryLabel }, "90+ Days"),
            e(Text, { style: styles.summaryValue }, `$${s.buckets.days120.toLocaleString()}`),
          ),
        ),
        e(View, { style: styles.table },
          e(View, { style: styles.tableHeader },
            e(Text, { style: { ...styles.th, width: "16%" } }, "Resident"),
            e(Text, { style: { ...styles.th, width: "14%" } }, "Facility"),
            e(Text, { style: { ...styles.th, width: "12%", textAlign: "right" } }, "Billed"),
            e(Text, { style: { ...styles.th, width: "12%", textAlign: "right" } }, "Paid"),
            e(Text, { style: { ...styles.th, width: "12%", textAlign: "right" } }, "Balance"),
            e(Text, { style: { ...styles.th, width: "10%" } }, "Due Date"),
            e(Text, { style: { ...styles.th, width: "8%", textAlign: "right" } }, "Days"),
            e(Text, { style: { ...styles.th, width: "16%" } }, "Contact"),
          ),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...data.rows.slice(0, 50).map((r: any, i: number) =>
            e(View, { key: i, style: i % 2 ? styles.tableRowAlt : styles.tableRow },
              e(Text, { style: { ...styles.tdBold, width: "16%" } }, r.resident),
              e(Text, { style: { ...styles.td, width: "14%" } }, r.facility),
              e(Text, { style: { ...styles.td, width: "12%", textAlign: "right" } }, `$${r.amountBilled.toLocaleString()}`),
              e(Text, { style: { ...styles.td, width: "12%", textAlign: "right" } }, `$${r.amountPaid.toLocaleString()}`),
              e(Text, { style: { ...styles.tdBold, width: "12%", textAlign: "right" } }, `$${r.balance.toLocaleString()}`),
              e(Text, { style: { ...styles.td, width: "10%" } }, new Date(r.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })),
              e(Text, { style: { ...styles.td, width: "8%", textAlign: "right", color: r.daysOverdue > 60 ? "#dc2626" : "#334155" } }, String(r.daysOverdue)),
              e(Text, { style: { ...styles.td, width: "16%" } }, r.contactName || "—"),
            )
          ),
        ),
        footer,
      )
    );
  }

  // ── Generic fallback for other report types ─────────
  return e(Document, {},
    e(Page, { size: "A4", style: styles.page },
      header,
      e(View, { style: styles.summaryRow },
        e(View, { style: styles.summaryCard },
          e(Text, { style: styles.summaryLabel }, "Report Data"),
          e(Text, { style: { ...styles.td, marginTop: 4 } }, "See full data in CSV export for detailed analysis."),
        ),
      ),
      data.rows && e(Text, { style: styles.sectionTitle }, `${data.rows.length} records`),
      data.summary && e(View, { style: styles.summaryRow },
        ...Object.entries(data.summary).filter(([, v]) => typeof v === "number").slice(0, 4).map(([key, val]) =>
          e(View, { key, style: styles.summaryCard },
            e(Text, { style: styles.summaryLabel }, key.replace(/([A-Z])/g, " $1").trim()),
            e(Text, { style: styles.summaryValue }, typeof val === "number" && val > 100 ? `$${(val as number).toLocaleString()}` : String(val)),
          )
        ),
      ),
      footer,
    )
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateReportPDF(data: any): Promise<Blob> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = createElement(ReportDocument, { data }) as any;
  return await pdf(doc).toBlob();
}
