import { NextRequest, NextResponse } from "next/server";

const CARE_PLAN_TEMPLATE = `resident_id,resident_name,room_number,current_care_level,effective_date,documented_by
RES001,Margaret Anderson,101,LEVEL_2,2025-03-15,Dr. Maria Santos
RES002,Robert Baker,205,LEVEL_3,2025-03-18,RN Lisa Chen
RES003,Dorothy Campbell,110,MEMORY_CARE,2025-03-20,Dr. Robert Kim`;

const BILLING_TEMPLATE = `resident_id,resident_name,billing_month,billed_care_level,amount_billed,payment_status
RES001,Margaret Anderson,2025-03-01,LEVEL_1,4200.00,PAID
RES002,Robert Baker,2025-03-01,LEVEL_2,5100.00,PENDING
RES003,Dorothy Campbell,2025-03-01,LEVEL_3,6400.00,OVERDUE`;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");

  let content: string;
  let filename: string;

  if (type === "care-plans") {
    content = CARE_PLAN_TEMPLATE;
    filename = "care_plans_template.csv";
  } else if (type === "billing-records") {
    content = BILLING_TEMPLATE;
    filename = "billing_records_template.csv";
  } else {
    return NextResponse.json({ error: "Invalid template type" }, { status: 400 });
  }

  return new NextResponse(content, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
