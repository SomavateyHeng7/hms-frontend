import { describe, expect, it } from "vitest";
import { auditToCsv, capAudit, csvCell, filterAudit, type AuditEntry } from "./audit";

const entry = (over: Partial<AuditEntry>): AuditEntry => ({
  id: "1",
  timestamp: new Date(2026, 10, 16, 12, 0).toISOString(),
  userId: "U-DOC-1",
  userName: "Dr. Sarah Johnson",
  role: "doctor",
  action: "prescription.create",
  summary: "Created prescription RX00001",
  ...over,
});

describe("csvCell", () => {
  it("quotes commas, quotes and newlines", () => {
    expect(csvCell('a,b')).toBe('"a,b"');
    expect(csvCell('say "hi"')).toBe('"say ""hi"""');
    expect(csvCell("line1\nline2")).toBe('"line1\nline2"');
  });
  it("neutralises spreadsheet formulas", () => {
    expect(csvCell("=HYPERLINK(\"http://evil\")")).toBe(`"'=HYPERLINK(""http://evil"")"`);
    expect(csvCell("+1+1")).toBe("'+1+1");
    expect(csvCell("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(csvCell("-2+3")).toBe("'-2+3");
  });
  it("leaves plain text and empty values alone", () => {
    expect(csvCell("plain")).toBe("plain");
    expect(csvCell(null)).toBe("");
  });
});

describe("auditToCsv", () => {
  it("emits a header and one row per entry", () => {
    const csv = auditToCsv([entry({ details: ["warning one", "warning two"] })]);
    const [header, row] = csv.split("\r\n");
    expect(header).toBe("Timestamp,User,Role,Action,Patient,Entity,Summary,Details");
    expect(row).toContain("prescription.create");
    expect(row).toContain("warning one | warning two");
  });
});

describe("filterAudit", () => {
  const entries = [
    entry({ id: "1", action: "prescription.create", patientName: "John Smith" }),
    entry({ id: "2", action: "lab_result.enter", userId: "U-LAB-1", userName: "Mike Rodriguez", timestamp: new Date(2026, 10, 17, 12, 0).toISOString() }),
    entry({ id: "3", action: "access.denied", summary: "Tried to open /audit", timestamp: new Date(2026, 10, 18, 12, 0).toISOString() }),
  ];
  it("filters by user, action and text", () => {
    expect(filterAudit(entries, { userId: "U-LAB-1" }).map((e) => e.id)).toEqual(["2"]);
    expect(filterAudit(entries, { action: "access.denied" }).map((e) => e.id)).toEqual(["3"]);
    expect(filterAudit(entries, { query: "john smith" }).map((e) => e.id)).toEqual(["1"]);
    expect(filterAudit(entries, { action: "all", userId: "all" })).toHaveLength(3);
  });
  it("filters by inclusive local date range", () => {
    const ids = filterAudit(entries, { from: "2026-11-17", to: "2026-11-17" }).map((e) => e.id);
    expect(ids).toEqual(["2"]);
  });
});

describe("capAudit", () => {
  it("keeps the newest entries", () => {
    const many = Array.from({ length: 5 }, (_, i) => entry({ id: String(i) }));
    expect(capAudit(many, 3).map((e) => e.id)).toEqual(["0", "1", "2"]);
    expect(capAudit(many, 10)).toHaveLength(5);
  });
});
