"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

const CARE_LABELS: Record<string, string> = {
  LEVEL_1: "Level 1",
  LEVEL_2: "Level 2",
  LEVEL_3: "Level 3",
  LEVEL_4: "Level 4",
  MEMORY_CARE: "Memory Care",
};

const STATUS_STYLES: Record<string, string> = {
  DETECTED: "bg-red-100 text-red-700",
  REVIEWED: "bg-amber-100 text-amber-700",
  RESOLVED: "bg-emerald-100 text-emerald-700",
  DISMISSED: "bg-slate-100 text-slate-500",
};

function SummaryCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  );
}

function RevenueLeakagePreview({ data }: { data: any }) {
  const s = data.summary;
  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Total Mismatches" value={String(s.totalMismatches)} />
        <SummaryCard label="Monthly Leakage" value={`$${s.totalLeakage.toLocaleString()}`} />
        <SummaryCard label="Detected" value={String(s.byStatus.detected)} />
        <SummaryCard label="Resolved" value={String(s.byStatus.resolved)} />
      </div>
      {s.byFacility.length > 0 && (
        <div className="mb-6">
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">By Facility</h4>
          <div className="flex gap-3">
            {s.byFacility.map((f: any) => (
              <div key={f.facility} className="rounded-lg border border-slate-100 px-4 py-2">
                <p className="text-xs font-medium text-slate-700">{f.facility}</p>
                <p className="text-sm font-bold text-red-600">${f.amount.toLocaleString()}/mo</p>
                <p className="text-xs text-slate-400">{f.count} mismatches</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400">Resident</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400">Facility</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400">From</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400">To</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Expected</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Actual</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Gap/Mo</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.rows.map((r: any, i: number) => (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className="px-4 py-2.5 font-medium text-slate-900">{r.resident}</td>
                <td className="px-4 py-2.5 text-slate-600">{r.facility}</td>
                <td className="px-4 py-2.5 text-slate-600">{CARE_LABELS[r.previousLevel] || r.previousLevel}</td>
                <td className="px-4 py-2.5 text-slate-600">{CARE_LABELS[r.newLevel] || r.newLevel}</td>
                <td className="px-4 py-2.5 text-right text-slate-600">${r.expectedRate.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right text-slate-600">${r.actualRate.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right font-semibold text-red-600">${r.monthlyGap.toLocaleString()}</td>
                <td className="px-4 py-2.5">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[r.status] || ""}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ARAgingPreview({ data }: { data: any }) {
  const s = data.summary;
  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
        <SummaryCard label="Total Outstanding" value={`$${s.totalOutstanding.toLocaleString()}`} sub={`${s.totalInvoices} invoices`} />
        <SummaryCard label="Current" value={`$${s.buckets.current.toLocaleString()}`} sub={`${s.bucketCounts.current} invoices`} />
        <SummaryCard label="1-30 Days" value={`$${s.buckets.days30.toLocaleString()}`} sub={`${s.bucketCounts.days30} invoices`} />
        <SummaryCard label="31-60 Days" value={`$${s.buckets.days60.toLocaleString()}`} sub={`${s.bucketCounts.days60} invoices`} />
        <SummaryCard label="90+ Days" value={`$${s.buckets.days120.toLocaleString()}`} sub={`${s.bucketCounts.days120} invoices`} />
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400">Resident</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400">Facility</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Billed</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Paid</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Balance</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400">Due Date</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Days</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400">Contact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.rows.map((r: any, i: number) => (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className="px-4 py-2.5 font-medium text-slate-900">{r.resident}</td>
                <td className="px-4 py-2.5 text-slate-600">{r.facility}</td>
                <td className="px-4 py-2.5 text-right text-slate-600">${r.amountBilled.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right text-slate-600">${r.amountPaid.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right font-semibold text-slate-900">${r.balance.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-slate-600">{new Date(r.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</td>
                <td className={`px-4 py-2.5 text-right font-medium ${r.daysOverdue > 60 ? "text-red-600" : r.daysOverdue > 30 ? "text-amber-600" : "text-slate-600"}`}>{r.daysOverdue}</td>
                <td className="px-4 py-2.5 text-xs text-slate-500">{r.contactName || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function OccupancyRevenuePreview({ data }: { data: any }) {
  const s = data.summary;
  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Total Beds" value={String(s.totalBeds)} sub={`${s.totalOccupied} occupied`} />
        <SummaryCard label="Occupancy Rate" value={`${s.occupancyRate}%`} />
        <SummaryCard label="Total Billed" value={`$${s.totalBilled.toLocaleString()}`} />
        <SummaryCard label="Collection Rate" value={`${s.collectionRate}%`} sub={`$${s.totalCollected.toLocaleString()} collected`} />
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400">Facility</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Beds</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Occupied</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400">Occupancy</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Billed</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Collected</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Collection %</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Rev/Bed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.rows.map((r: any, i: number) => (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className="px-4 py-2.5 font-medium text-slate-900">{r.facility}</td>
                <td className="px-4 py-2.5 text-right text-slate-600">{r.totalBeds}</td>
                <td className="px-4 py-2.5 text-right text-slate-600">{r.occupied}</td>
                <td className="px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-16 overflow-hidden rounded-full bg-slate-100">
                      <div className={`h-full rounded-full ${r.occupancyPct >= 90 ? "bg-red-500" : r.occupancyPct >= 70 ? "bg-amber-500" : "bg-blue-500"}`} style={{ width: `${r.occupancyPct}%` }} />
                    </div>
                    <span className="text-xs font-semibold">{r.occupancyPct}%</span>
                  </div>
                </td>
                <td className="px-4 py-2.5 text-right font-medium text-slate-900">${r.totalBilled.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right text-slate-600">${r.totalCollected.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right text-slate-600">{r.collectionRate}%</td>
                <td className="px-4 py-2.5 text-right text-slate-600">${r.revenuePerBed.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MonthlyFinancialPreview({ data }: { data: any }) {
  const s = data.summary;
  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <SummaryCard label="Total Billed" value={`$${s.totalBilled.toLocaleString()}`} />
        <SummaryCard label="Total Collected" value={`$${s.totalCollected.toLocaleString()}`} />
        <SummaryCard label="Avg Monthly Revenue" value={`$${s.avgMonthlyRevenue.toLocaleString()}`} />
        <SummaryCard label="Collection Rate" value={`${s.overallCollectionRate}%`} />
      </div>
      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400">Month</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Billed</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Collected</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Outstanding</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Collection %</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Invoices</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Paid</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Overdue</th>
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Net Income</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.rows.map((r: any, i: number) => (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className="px-4 py-2.5 font-medium text-slate-900">{r.month}</td>
                <td className="px-4 py-2.5 text-right text-slate-600">${r.billed.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right text-slate-600">${r.collected.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right font-medium text-amber-600">${r.outstanding.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-right text-slate-600">{r.collectionRate}%</td>
                <td className="px-4 py-2.5 text-right text-slate-600">{r.invoiceCount}</td>
                <td className="px-4 py-2.5 text-right text-emerald-600">{r.paidCount}</td>
                <td className="px-4 py-2.5 text-right text-red-600">{r.overdueCount}</td>
                <td className="px-4 py-2.5 text-right font-semibold text-emerald-700">${r.netIncome.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CareLevelPreview({ data }: { data: any }) {
  const s = data.summary;
  return (
    <div>
      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <SummaryCard label="Total Active Residents" value={String(s.totalResidents)} />
        <SummaryCard label="Total Monthly Revenue" value={`$${s.totalMonthlyRevenue.toLocaleString()}`} />
        <SummaryCard label="Care Levels" value="5" sub="Level 1-4 + Memory Care" />
      </div>
      {/* Distribution bars */}
      <div className="mb-6">
        <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Distribution</h4>
        <div className="space-y-2">
          {s.distribution.map((d: any) => (
            <div key={d.level} className="flex items-center gap-3">
              <span className="w-24 text-xs font-medium text-slate-600">{CARE_LABELS[d.level]}</span>
              <div className="h-5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="flex h-full items-center rounded-full bg-blue-500 px-2 text-xs font-medium text-white transition-all"
                  style={{ width: `${s.totalResidents > 0 ? (d.count / s.totalResidents) * 100 : 0}%`, minWidth: d.count > 0 ? "2rem" : "0" }}
                >
                  {d.count}
                </div>
              </div>
              <span className="w-20 text-right text-xs text-slate-500">${d.avgRate.toLocaleString()}/mo avg</span>
            </div>
          ))}
        </div>
      </div>
      {/* By facility table */}
      <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">By Facility</h4>
      <div className="overflow-x-auto rounded-lg border border-slate-100">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400">Facility</th>
              {["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4", "MEMORY_CARE"].map((l) => (
                <th key={l} className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">{CARE_LABELS[l]}</th>
              ))}
              <th className="px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-slate-400 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {data.rows.map((r: any, i: number) => (
              <tr key={i} className="hover:bg-slate-50/50">
                <td className="px-4 py-2.5 font-medium text-slate-900">{r.facility}</td>
                {["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4", "MEMORY_CARE"].map((l) => (
                  <td key={l} className="px-4 py-2.5 text-right text-slate-600">{r[l] || 0}</td>
                ))}
                <td className="px-4 py-2.5 text-right font-semibold text-slate-900">{r.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Recent transitions */}
      {data.transitions?.length > 0 && (
        <>
          <h4 className="mb-2 mt-6 text-xs font-semibold uppercase tracking-wider text-slate-400">Recent Care Level Transitions</h4>
          <div className="space-y-1.5">
            {data.transitions.slice(0, 10).map((t: any, i: number) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-2">
                <div>
                  <span className="text-xs font-medium text-slate-700">{t.resident}</span>
                  <span className="ml-2 text-xs text-slate-400">{t.facility}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded bg-slate-200 px-1.5 py-0.5 text-xs font-medium text-slate-600">{CARE_LABELS[t.from]}</span>
                  <span className="text-xs text-slate-400">-&gt;</span>
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-xs font-semibold text-blue-700">{CARE_LABELS[t.to]}</span>
                  <span className="text-xs text-slate-400">{new Date(t.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CustomReportPreview({ data }: { data: any }) {
  return (
    <div className="space-y-6">
      {data.sections?.map((section: any, i: number) => (
        <div key={i} className="rounded-lg border border-slate-100 p-4">
          <h4 className="mb-3 text-sm font-semibold text-slate-900">{section.title}</h4>
          {Array.isArray(section.data) ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    {Object.keys(section.data[0] || {}).map((k) => (
                      <th key={k} className="px-3 py-2 text-xs font-medium uppercase text-slate-400">{k.replace(/([A-Z])/g, " $1")}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {section.data.map((row: any, j: number) => (
                    <tr key={j}>
                      {Object.values(row).map((v: any, k: number) => (
                        <td key={k} className="px-3 py-2 text-slate-600">{typeof v === "number" && v > 100 ? `$${v.toLocaleString()}` : String(v)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {Object.entries(section.data).map(([key, val]) => (
                <SummaryCard key={key} label={key.replace(/([A-Z])/g, " $1")} value={typeof val === "number" && (val as number) > 100 ? `$${(val as number).toLocaleString()}` : String(val)} />
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default function ReportPreview({ data }: { data: any }) {
  if (!data) return null;

  switch (data.reportType) {
    case "revenue_leakage":
      return <RevenueLeakagePreview data={data} />;
    case "ar_aging":
      return <ARAgingPreview data={data} />;
    case "occupancy_revenue":
      return <OccupancyRevenuePreview data={data} />;
    case "monthly_financial":
      return <MonthlyFinancialPreview data={data} />;
    case "care_level_distribution":
      return <CareLevelPreview data={data} />;
    case "custom":
      return <CustomReportPreview data={data} />;
    default:
      return <p className="text-sm text-slate-400">Unknown report type.</p>;
  }
}
