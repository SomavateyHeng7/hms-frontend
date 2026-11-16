import { describe, expect, it } from "vitest";
import {
  checkAllergies,
  checkInteractions,
  checkPrescriptionSafety,
  normalizeDrugName,
  parseAllergies,
  requiresAcknowledgement,
} from "./clinical-safety";

describe("parseAllergies", () => {
  it("splits on commas, semicolons, slashes and 'and'", () => {
    expect(parseAllergies("Penicillin, Shellfish; Latex and Sulfa")).toEqual(["penicillin", "shellfish", "latex", "sulfa"]);
  });
  it("treats 'none'/NKDA/empty as no allergies", () => {
    expect(parseAllergies("None")).toEqual([]);
    expect(parseAllergies("NKDA")).toEqual([]);
    expect(parseAllergies("")).toEqual([]);
    expect(parseAllergies(undefined)).toEqual([]);
  });
});

describe("normalizeDrugName", () => {
  it("strips strengths and frequency", () => {
    expect(normalizeDrugName("Metformin 500mg twice daily")).toBe("metformin");
    expect(normalizeDrugName("  Amoxicillin  ")).toBe("amoxicillin");
  });
});

describe("checkAllergies", () => {
  it("flags a drug in the allergy class as contraindicated", () => {
    const w = checkAllergies("Penicillin", [{ name: "Amoxicillin" }]);
    expect(w).toHaveLength(1);
    expect(w[0].severity).toBe("contraindicated");
  });
  it("flags a direct name match", () => {
    expect(checkAllergies("Ibuprofen", [{ name: "Ibuprofen" }])[0].severity).toBe("contraindicated");
  });
  it("checks the generic name too (brand name entered)", () => {
    expect(checkAllergies("penicillin", [{ name: "Moxatag", genericName: "Amoxicillin" }])).toHaveLength(1);
  });
  it("warns moderately on penicillin -> cephalosporin cross-reactivity", () => {
    const w = checkAllergies("Penicillin", [{ name: "Cephalexin" }]);
    expect(w).toHaveLength(1);
    expect(w[0].severity).toBe("moderate");
  });
  it("does not flag unrelated drugs or non-drug allergies", () => {
    expect(checkAllergies("Shellfish", [{ name: "Paracetamol" }, { name: "Amoxicillin" }])).toEqual([]);
    expect(checkAllergies("Penicillin", [{ name: "Paracetamol" }])).toEqual([]);
  });
  it("returns nothing when there are no allergies on file", () => {
    expect(checkAllergies("None", [{ name: "Amoxicillin" }])).toEqual([]);
  });
});

describe("checkInteractions", () => {
  it("flags interacting drugs within the same prescription", () => {
    const w = checkInteractions([{ name: "Warfarin" }, { name: "Ibuprofen" }]);
    expect(w).toHaveLength(1);
    expect(w[0].severity).toBe("major");
  });
  it("flags a new drug against the patient's current medications", () => {
    const w = checkInteractions([{ name: "Ibuprofen" }], "Warfarin 5mg daily");
    expect(w).toHaveLength(1);
    expect(w[0].message).toContain("current medication");
  });
  it("marks nitrate + PDE5 inhibitor as contraindicated", () => {
    expect(checkInteractions([{ name: "Sildenafil" }, { name: "Isosorbide" }])[0].severity).toBe("contraindicated");
  });
  it("does not flag two existing medications against each other", () => {
    expect(checkInteractions([], "Warfarin, Ibuprofen")).toEqual([]);
  });
  it("does not flag safe combinations", () => {
    expect(checkInteractions([{ name: "Paracetamol" }, { name: "Amoxicillin" }], "Metformin 500mg")).toEqual([]);
  });
});

describe("checkPrescriptionSafety", () => {
  it("combines allergy and interaction warnings, most severe first", () => {
    const w = checkPrescriptionSafety(
      [{ name: "Ibuprofen" }, { name: "Cephalexin" }],
      { allergies: "Penicillin", currentMedications: "Warfarin" }
    );
    expect(w.map((x) => x.severity)).toEqual(["major", "moderate"]);
  });
  it("ignores blank medication rows", () => {
    expect(checkPrescriptionSafety([{ name: "" }], { allergies: "Penicillin" })).toEqual([]);
  });
});

describe("requiresAcknowledgement", () => {
  it("is true for major/contraindicated, false for moderate only", () => {
    expect(requiresAcknowledgement(checkAllergies("Penicillin", [{ name: "Amoxicillin" }]))).toBe(true);
    expect(requiresAcknowledgement(checkAllergies("Penicillin", [{ name: "Cephalexin" }]))).toBe(false);
    expect(requiresAcknowledgement([])).toBe(false);
  });
});
