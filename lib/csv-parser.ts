// ── CSV Parsing & Validation ───────────────────────────

export interface ParsedRow {
  rowNumber: number;
  data: Record<string, string>;
}

export interface ParseResult {
  headers: string[];
  rows: ParsedRow[];
  errors: string[];
}

export function parseCSV(text: string): ParseResult {
  const errors: string[] = [];
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim() !== "");

  if (lines.length === 0) {
    return { headers: [], rows: [], errors: ["CSV file is empty"] };
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const rows: ParsedRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length !== headers.length) {
      errors.push(
        `Row ${i + 1}: Expected ${headers.length} columns but found ${values.length}`
      );
      continue;
    }
    const data: Record<string, string> = {};
    headers.forEach((h, idx) => {
      data[h] = values[idx].trim();
    });
    rows.push({ rowNumber: i + 1, data });
  }

  return { headers, rows, errors };
}

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (inQuotes) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        current += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ",") {
        result.push(current);
        current = "";
      } else {
        current += char;
      }
    }
  }
  result.push(current);
  return result;
}

// ── Care Plan Validation ───────────────────────────────

const CARE_PLAN_REQUIRED_HEADERS = [
  "resident_id",
  "resident_name",
  "room_number",
  "current_care_level",
  "effective_date",
  "documented_by",
];

const VALID_CARE_LEVELS = ["LEVEL_1", "LEVEL_2", "LEVEL_3", "LEVEL_4", "MEMORY_CARE"];

export interface CarePlanRow {
  residentId: string;
  residentName: string;
  roomNumber: string;
  currentCareLevel: string;
  effectiveDate: string;
  documentedBy: string;
}

export function validateCarePlanCSV(result: ParseResult): {
  valid: CarePlanRow[];
  errors: string[];
} {
  const errors = [...result.errors];
  const valid: CarePlanRow[] = [];

  const missing = CARE_PLAN_REQUIRED_HEADERS.filter(
    (h) => !result.headers.includes(h)
  );
  if (missing.length > 0) {
    errors.push(`Missing required columns: ${missing.join(", ")}`);
    return { valid, errors };
  }

  for (const row of result.rows) {
    const rowErrors: string[] = [];

    if (!row.data.resident_id) rowErrors.push("resident_id is empty");
    if (!row.data.resident_name) rowErrors.push("resident_name is empty");
    if (!row.data.room_number) rowErrors.push("room_number is empty");

    const level = row.data.current_care_level?.toUpperCase();
    if (!VALID_CARE_LEVELS.includes(level)) {
      rowErrors.push(
        `Invalid care level "${row.data.current_care_level}". Must be one of: ${VALID_CARE_LEVELS.join(", ")}`
      );
    }

    const date = new Date(row.data.effective_date);
    if (isNaN(date.getTime())) {
      rowErrors.push(`Invalid date "${row.data.effective_date}"`);
    }

    if (!row.data.documented_by) rowErrors.push("documented_by is empty");

    if (rowErrors.length > 0) {
      errors.push(`Row ${row.rowNumber}: ${rowErrors.join("; ")}`);
    } else {
      valid.push({
        residentId: row.data.resident_id,
        residentName: row.data.resident_name,
        roomNumber: row.data.room_number,
        currentCareLevel: level,
        effectiveDate: row.data.effective_date,
        documentedBy: row.data.documented_by,
      });
    }
  }

  return { valid, errors };
}

// ── Billing Record Validation ──────────────────────────

const BILLING_REQUIRED_HEADERS = [
  "resident_id",
  "resident_name",
  "billing_month",
  "billed_care_level",
  "amount_billed",
  "payment_status",
];

const VALID_PAYMENT_STATUSES = ["PENDING", "PAID", "OVERDUE", "PARTIAL"];

export interface BillingRow {
  residentId: string;
  residentName: string;
  billingMonth: string;
  billedCareLevel: string;
  amountBilled: number;
  paymentStatus: string;
}

export function validateBillingCSV(result: ParseResult): {
  valid: BillingRow[];
  errors: string[];
} {
  const errors = [...result.errors];
  const valid: BillingRow[] = [];

  const missing = BILLING_REQUIRED_HEADERS.filter(
    (h) => !result.headers.includes(h)
  );
  if (missing.length > 0) {
    errors.push(`Missing required columns: ${missing.join(", ")}`);
    return { valid, errors };
  }

  for (const row of result.rows) {
    const rowErrors: string[] = [];

    if (!row.data.resident_id) rowErrors.push("resident_id is empty");
    if (!row.data.resident_name) rowErrors.push("resident_name is empty");

    const billingDate = new Date(row.data.billing_month);
    if (isNaN(billingDate.getTime())) {
      rowErrors.push(`Invalid billing_month "${row.data.billing_month}"`);
    }

    const level = row.data.billed_care_level?.toUpperCase();
    if (!VALID_CARE_LEVELS.includes(level)) {
      rowErrors.push(
        `Invalid care level "${row.data.billed_care_level}". Must be one of: ${VALID_CARE_LEVELS.join(", ")}`
      );
    }

    const amount = parseFloat(row.data.amount_billed);
    if (isNaN(amount) || amount < 0) {
      rowErrors.push(`Invalid amount_billed "${row.data.amount_billed}"`);
    }

    const status = row.data.payment_status?.toUpperCase();
    if (!VALID_PAYMENT_STATUSES.includes(status)) {
      rowErrors.push(
        `Invalid payment_status "${row.data.payment_status}". Must be one of: ${VALID_PAYMENT_STATUSES.join(", ")}`
      );
    }

    if (rowErrors.length > 0) {
      errors.push(`Row ${row.rowNumber}: ${rowErrors.join("; ")}`);
    } else {
      valid.push({
        residentId: row.data.resident_id,
        residentName: row.data.resident_name,
        billingMonth: row.data.billing_month,
        billedCareLevel: level,
        amountBilled: amount,
        paymentStatus: status,
      });
    }
  }

  return { valid, errors };
}
