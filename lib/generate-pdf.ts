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
    fontSize: 10,
    color: "#1e293b",
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    color: "#64748b",
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    marginVertical: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    padding: 12,
    backgroundColor: "#f8fafc",
    borderRadius: 6,
    marginHorizontal: 4,
  },
  statLabel: {
    fontSize: 8,
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  statValueRed: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#dc2626",
  },
  sectionTitle: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 12,
  },
  table: {
    marginTop: 4,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 6,
    paddingHorizontal: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: "#f1f5f9",
  },
  colResident: { width: "20%" },
  colRoom: { width: "8%" },
  colFacility: { width: "18%" },
  colCarePlan: { width: "12%" },
  colBilled: { width: "12%" },
  colGap: { width: "12%" },
  colStatus: { width: "10%" },
  colDate: { width: "8%" },
  headerText: {
    fontSize: 7,
    fontFamily: "Helvetica-Bold",
    color: "#475569",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  cellText: {
    fontSize: 8,
    color: "#334155",
  },
  cellBold: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: "#dc2626",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 8,
  },
  footerText: {
    fontSize: 7,
    color: "#94a3b8",
  },
});

interface ExportData {
  generatedAt: string;
  organizationName: string;
  summary: {
    totalMonthlyLeakage: number;
    totalAnnualProjectedLeakage: number;
    affectedResidents: number;
    totalMismatches: number;
  };
  mismatches: Array<{
    resident: string;
    room: string;
    facility: string;
    carePlanLevel: string;
    billedLevel: string;
    expectedRate: string;
    actualRate: string;
    monthlyGap: string;
    status: string;
    detectedAt: string;
  }>;
}

function formatLevel(level: string) {
  if (level === "MEMORY_CARE") return "Memory Care";
  return level.replace("_", " ");
}

function ReportDocument({ data }: { data: ExportData }) {
  const e = createElement;
  const date = new Date(data.generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return e(
    Document,
    null,
    e(
      Page,
      { size: "A4", style: styles.page },
      // Header
      e(
        View,
        { style: styles.header },
        e(Text, { style: styles.title }, "Revenue Leakage Report"),
        e(
          Text,
          { style: styles.subtitle },
          `${data.organizationName} — Generated ${date}`
        )
      ),
      // Stats
      e(
        View,
        { style: styles.statsRow },
        e(
          View,
          { style: styles.statBox },
          e(Text, { style: styles.statLabel }, "Monthly Leakage"),
          e(
            Text,
            { style: styles.statValueRed },
            `$${data.summary.totalMonthlyLeakage.toLocaleString()}`
          )
        ),
        e(
          View,
          { style: styles.statBox },
          e(Text, { style: styles.statLabel }, "Annual Projection"),
          e(
            Text,
            { style: styles.statValue },
            `$${data.summary.totalAnnualProjectedLeakage.toLocaleString()}`
          )
        ),
        e(
          View,
          { style: styles.statBox },
          e(Text, { style: styles.statLabel }, "Affected Residents"),
          e(
            Text,
            { style: styles.statValue },
            String(data.summary.affectedResidents)
          )
        ),
        e(
          View,
          { style: styles.statBox },
          e(Text, { style: styles.statLabel }, "Total Mismatches"),
          e(
            Text,
            { style: styles.statValue },
            String(data.summary.totalMismatches)
          )
        )
      ),
      // Divider
      e(View, { style: styles.divider }),
      // Table Title
      e(Text, { style: styles.sectionTitle }, "Mismatch Details"),
      // Table
      e(
        View,
        { style: styles.table },
        // Header row
        e(
          View,
          { style: styles.tableHeader },
          e(
            View,
            { style: styles.colResident },
            e(Text, { style: styles.headerText }, "Resident")
          ),
          e(
            View,
            { style: styles.colRoom },
            e(Text, { style: styles.headerText }, "Room")
          ),
          e(
            View,
            { style: styles.colFacility },
            e(Text, { style: styles.headerText }, "Facility")
          ),
          e(
            View,
            { style: styles.colCarePlan },
            e(Text, { style: styles.headerText }, "Care Plan")
          ),
          e(
            View,
            { style: styles.colBilled },
            e(Text, { style: styles.headerText }, "Billed")
          ),
          e(
            View,
            { style: styles.colGap },
            e(Text, { style: styles.headerText }, "Gap/Mo")
          ),
          e(
            View,
            { style: styles.colStatus },
            e(Text, { style: styles.headerText }, "Status")
          ),
          e(
            View,
            { style: styles.colDate },
            e(Text, { style: styles.headerText }, "Found")
          )
        ),
        // Data rows
        ...data.mismatches.map((row, i) =>
          e(
            View,
            { key: i, style: styles.tableRow },
            e(
              View,
              { style: styles.colResident },
              e(Text, { style: styles.cellText }, row.resident)
            ),
            e(
              View,
              { style: styles.colRoom },
              e(Text, { style: styles.cellText }, row.room)
            ),
            e(
              View,
              { style: styles.colFacility },
              e(Text, { style: styles.cellText }, row.facility)
            ),
            e(
              View,
              { style: styles.colCarePlan },
              e(Text, { style: styles.cellText }, formatLevel(row.carePlanLevel))
            ),
            e(
              View,
              { style: styles.colBilled },
              e(Text, { style: styles.cellText }, formatLevel(row.billedLevel))
            ),
            e(
              View,
              { style: styles.colGap },
              e(Text, { style: styles.cellBold }, `$${row.monthlyGap}`)
            ),
            e(
              View,
              { style: styles.colStatus },
              e(
                Text,
                { style: styles.cellText },
                row.status.charAt(0) + row.status.slice(1).toLowerCase()
              )
            ),
            e(
              View,
              { style: styles.colDate },
              e(Text, { style: styles.cellText }, row.detectedAt)
            )
          )
        )
      ),
      // Footer
      e(
        View,
        { style: styles.footer },
        e(
          Text,
          { style: styles.footerText },
          "CareFlow AI — Revenue Leakage Report"
        ),
        e(Text, { style: styles.footerText }, `Confidential — ${date}`)
      )
    )
  );
}

export async function generateLeakagePDF(data: ExportData): Promise<Blob> {
  const doc = createElement(ReportDocument, { data }) as any;
  return await pdf(doc).toBlob();
}
