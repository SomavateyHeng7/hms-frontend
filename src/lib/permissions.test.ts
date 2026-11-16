import { describe, expect, it } from "vitest";
import {
  DEMO_USERS,
  ROLES,
  ROLE_PERMISSIONS,
  can,
  canAccessPath,
  findDemoUser,
  moduleForPath,
} from "./permissions";

describe("can", () => {
  it("grants clinical actions only to the right roles", () => {
    expect(can("doctor", "prescription.create")).toBe(true);
    expect(can("nurse", "prescription.create")).toBe(false);
    expect(can("lab_technician", "labResult.enter")).toBe(true);
    expect(can("doctor", "labResult.enter")).toBe(false);
    expect(can("billing", "bill.payment")).toBe(true);
    expect(can("doctor", "bill.payment")).toBe(false);
  });
  it("denies everything without a role", () => {
    expect(can(null, "module.patients")).toBe(false);
    expect(can(undefined, "audit.view")).toBe(false);
  });
  it("keeps the audit log admin-only", () => {
    const withAudit = ROLES.filter((r) => can(r, "audit.view"));
    expect(withAudit).toEqual(["admin"]);
  });
  it("does not let admins perform clinical actions", () => {
    for (const p of ["prescription.create", "labOrder.create", "labResult.enter", "imagingOrder.create", "criticalValue.acknowledge"] as const) {
      expect(can("admin", p)).toBe(false);
    }
  });
  it("keeps clinical data away from front-desk and billing roles", () => {
    expect(can("receptionist", "patient.viewClinical")).toBe(false);
    expect(can("billing", "patient.viewClinical")).toBe(false);
    expect(can("doctor", "patient.viewClinical")).toBe(true);
  });
});

describe("module access", () => {
  it("maps paths to modules", () => {
    expect(moduleForPath("/laboratory")).toBe("laboratory");
    expect(moduleForPath("/patients/1")).toBe("patients");
    expect(moduleForPath("/inventory")).toBeUndefined();
    expect(moduleForPath("/")).toBeUndefined();
  });
  it("blocks roles from modules they lack", () => {
    expect(canAccessPath("receptionist", "/laboratory")).toBe(false);
    expect(canAccessPath("lab_technician", "/laboratory")).toBe(true);
    expect(canAccessPath("doctor", "/audit")).toBe(false);
    expect(canAccessPath("admin", "/audit")).toBe(true);
  });
  it("leaves ungoverned routes open to signed-in users", () => {
    expect(canAccessPath("receptionist", "/inventory")).toBe(true);
  });
});

describe("demo users", () => {
  it("have unique ids and valid roles", () => {
    expect(new Set(DEMO_USERS.map((u) => u.id)).size).toBe(DEMO_USERS.length);
    for (const u of DEMO_USERS) expect(ROLE_PERMISSIONS[u.role]).toBeDefined();
  });
  it("include two lab technicians for separation-of-duties checks", () => {
    expect(DEMO_USERS.filter((u) => u.role === "lab_technician").length).toBeGreaterThanOrEqual(2);
  });
  it("looks users up by id", () => {
    expect(findDemoUser("U-DOC-1")?.name).toBe("Dr. Sarah Johnson");
    expect(findDemoUser("nope")).toBeUndefined();
  });
});
