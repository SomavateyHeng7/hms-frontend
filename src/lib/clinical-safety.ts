/**
 * Prescription safety checks: drug-allergy conflicts and drug-drug interactions.
 *
 * IMPORTANT: this is a small built-in rule set for demo purposes. It is NOT a
 * substitute for a licensed drug database (e.g. a commercial interaction API) and
 * must be replaced before any real clinical use.
 */

export type WarningSeverity = "contraindicated" | "major" | "moderate";

export interface SafetyWarning {
  /** Stable key, useful for React lists and recording overrides */
  id: string;
  kind: "allergy" | "interaction";
  severity: WarningSeverity;
  message: string;
}

export interface MedicationInput {
  name: string;
  genericName?: string;
}

/** Drug classes -> member drugs (lowercase generic or common brand names). */
const DRUG_CLASSES: Record<string, string[]> = {
  penicillins: [
    "penicillin", "amoxicillin", "ampicillin", "piperacillin", "flucloxacillin",
    "dicloxacillin", "nafcillin", "oxacillin", "augmentin", "co-amoxiclav", "amoxicillin-clavulanate",
  ],
  cephalosporins: ["cephalexin", "cefazolin", "cefuroxime", "ceftriaxone", "cefixime", "cefdinir", "cefepime", "cefotaxime"],
  sulfonamides: ["sulfamethoxazole", "sulfadiazine", "sulfasalazine", "bactrim", "co-trimoxazole", "trimethoprim-sulfamethoxazole"],
  nsaids: ["ibuprofen", "naproxen", "diclofenac", "ketorolac", "indomethacin", "celecoxib", "meloxicam", "aspirin"],
  opioids: ["morphine", "codeine", "tramadol", "oxycodone", "hydrocodone", "fentanyl", "hydromorphone"],
  macrolides: ["azithromycin", "clarithromycin", "erythromycin"],
  fluoroquinolones: ["ciprofloxacin", "levofloxacin", "moxifloxacin", "ofloxacin"],
};

/** Allergy words people write that refer to a class (or alias of one). */
const CLASS_ALIASES: Record<string, string> = {
  penicillin: "penicillins",
  penicillins: "penicillins",
  "beta-lactam": "penicillins",
  cephalosporin: "cephalosporins",
  cephalosporins: "cephalosporins",
  sulfa: "sulfonamides",
  sulfonamide: "sulfonamides",
  sulfonamides: "sulfonamides",
  nsaid: "nsaids",
  nsaids: "nsaids",
  opioid: "opioids",
  opioids: "opioids",
  macrolide: "macrolides",
  macrolides: "macrolides",
  fluoroquinolone: "fluoroquinolones",
  fluoroquinolones: "fluoroquinolones",
  quinolone: "fluoroquinolones",
};

/** Class pairs with a known (lower-risk) cross-reactivity: allergic to key -> caution with value. */
const CROSS_REACTIVE: Record<string, string[]> = {
  penicillins: ["cephalosporins"],
  cephalosporins: ["penicillins"],
};

const NO_ALLERGY_PHRASES = ["none", "nkda", "nka", "no known", "no known allergies", "n/a", "nil", ""];

export function parseAllergies(text: string | undefined | null): string[] {
  if (!text) return [];
  return text
    .split(/[,;/\n]| and /i)
    .map((a) => a.trim().toLowerCase())
    .filter((a) => !NO_ALLERGY_PHRASES.includes(a));
}

/** Lowercase a drug name and drop strengths/forms, e.g. "Metformin 500mg twice daily" -> "metformin". */
export function normalizeDrugName(raw: string | undefined | null): string {
  if (!raw) return "";
  return raw
    .toLowerCase()
    .replace(/\b\d+(\.\d+)?\s*(mg|mcg|µg|g|ml|iu|units?|%)\b.*$/i, "")
    .replace(/\b(tablets?|capsules?|syrup|injection|cream|drops|inhaler|patch|once|twice|daily|bid|tid|qid|prn)\b.*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function classOf(drug: string): string | undefined {
  if (!drug) return undefined;
  for (const [cls, members] of Object.entries(DRUG_CLASSES)) {
    if (members.some((m) => drug === m || drug.includes(m))) return cls;
  }
  return undefined;
}

function drugNames(med: MedicationInput): string[] {
  return [normalizeDrugName(med.name), normalizeDrugName(med.genericName)].filter(Boolean);
}

const label = (cls: string) => cls.replace(/s$/, "");

export function checkAllergies(allergyText: string | undefined | null, medications: MedicationInput[]): SafetyWarning[] {
  const allergens = parseAllergies(allergyText);
  const warnings: SafetyWarning[] = [];
  if (allergens.length === 0) return warnings;

  for (const med of medications) {
    const names = drugNames(med);
    if (names.length === 0) continue;
    const display = med.name.trim() || med.genericName?.trim() || "this medication";
    const medClasses = new Set(names.map(classOf).filter((c): c is string => !!c));

    for (const allergen of allergens) {
      const allergenClass = CLASS_ALIASES[allergen] ?? classOf(allergen);

      // Direct match: allergen is the drug itself (or part of its name)
      const direct = names.some((n) => n === allergen || n.includes(allergen) || allergen.includes(n));
      if (direct) {
        warnings.push({
          id: `allergy:${display}:${allergen}`,
          kind: "allergy",
          severity: "contraindicated",
          message: `${display} — patient is allergic to ${allergen}.`,
        });
        continue;
      }

      // Same class
      if (allergenClass && medClasses.has(allergenClass)) {
        warnings.push({
          id: `allergy:${display}:${allergen}`,
          kind: "allergy",
          severity: "contraindicated",
          message: `${display} is a ${label(allergenClass)}-class drug — patient is allergic to ${allergen}.`,
        });
        continue;
      }

      // Known cross-reactivity between classes
      if (allergenClass) {
        const crossed = (CROSS_REACTIVE[allergenClass] ?? []).find((c) => medClasses.has(c));
        if (crossed) {
          warnings.push({
            id: `allergy-cross:${display}:${allergen}`,
            kind: "allergy",
            severity: "moderate",
            message: `${display} is a ${label(crossed)}; possible cross-reactivity with the patient's ${allergen} allergy. Use with caution.`,
          });
        }
      }
    }
  }
  return warnings;
}

interface InteractionRule {
  a: string[];
  b: string[];
  severity: WarningSeverity;
  message: string;
}

const NITRATES = ["nitroglycerin", "isosorbide", "glyceryl trinitrate"];
const NSAIDS = DRUG_CLASSES.nsaids;
const ACE_ARB = ["lisinopril", "enalapril", "ramipril", "captopril", "losartan", "valsartan", "candesartan"];
const SSRIS = ["sertraline", "fluoxetine", "paroxetine", "citalopram", "escitalopram"];

const INTERACTIONS: InteractionRule[] = [
  { a: ["sildenafil", "tadalafil", "vardenafil"], b: NITRATES, severity: "contraindicated", message: "Risk of severe hypotension. Do not combine." },
  { a: ["warfarin"], b: NSAIDS, severity: "major", message: "Increased bleeding risk." },
  { a: ["warfarin"], b: ["ciprofloxacin", "metronidazole", "clarithromycin", "erythromycin", "sulfamethoxazole", "bactrim"], severity: "major", message: "Antibiotic can raise INR and bleeding risk." },
  { a: ACE_ARB, b: ["spironolactone", "potassium chloride", "amiloride"], severity: "major", message: "Risk of hyperkalemia." },
  { a: ACE_ARB, b: NSAIDS.filter((n) => n !== "aspirin"), severity: "moderate", message: "NSAIDs can reduce antihypertensive effect and harm kidneys." },
  { a: ["simvastatin", "lovastatin"], b: ["clarithromycin", "erythromycin"], severity: "major", message: "Risk of myopathy / rhabdomyolysis." },
  { a: SSRIS, b: ["tramadol"], severity: "major", message: "Risk of serotonin syndrome and seizures." },
  { a: ["methotrexate"], b: ["trimethoprim", "sulfamethoxazole", "bactrim", "co-trimoxazole"], severity: "major", message: "Risk of severe bone-marrow suppression." },
  { a: ["digoxin"], b: ["amiodarone", "verapamil", "clarithromycin"], severity: "major", message: "Digoxin levels may become toxic." },
  { a: ["ibuprofen", "naproxen", "diclofenac"], b: ["aspirin"], severity: "moderate", message: "Increased GI bleeding risk; NSAIDs can blunt aspirin's cardioprotection." },
  { a: ["metformin"], b: ["cimetidine"], severity: "moderate", message: "Cimetidine can increase metformin levels." },
  { a: ["fluoxetine", "paroxetine"], b: ["tamoxifen"], severity: "major", message: "May reduce tamoxifen effectiveness." },
];

const matchesAny = (drug: string, list: string[]) => list.some((m) => drug === m || drug.includes(m));

/**
 * Check interactions among the medications in a new prescription and against
 * the patient's current medications (free text, e.g. "Metformin 500mg twice daily").
 */
export function checkInteractions(medications: MedicationInput[], currentMedicationsText?: string | null): SafetyWarning[] {
  const proposed = medications.flatMap((m) => {
    const names = drugNames(m);
    return names.length ? [{ display: m.name.trim() || names[0], names, existing: false }] : [];
  });
  const existing = (currentMedicationsText ?? "")
    .split(/[,;\n]/)
    .map((s) => ({ display: s.trim(), names: [normalizeDrugName(s)].filter(Boolean), existing: true }))
    .filter((e) => e.names.length > 0 && !NO_ALLERGY_PHRASES.includes(e.names[0]));

  const all = [...proposed, ...existing];
  const warnings: SafetyWarning[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < all.length; i++) {
    for (let j = i + 1; j < all.length; j++) {
      if (all[i].existing && all[j].existing) continue; // only flag pairs involving a new drug
      for (const rule of INTERACTIONS) {
        const x = all[i];
        const y = all[j];
        const forward = x.names.some((n) => matchesAny(n, rule.a)) && y.names.some((n) => matchesAny(n, rule.b));
        const backward = x.names.some((n) => matchesAny(n, rule.b)) && y.names.some((n) => matchesAny(n, rule.a));
        if (!forward && !backward) continue;
        const key = [x.display.toLowerCase(), y.display.toLowerCase()].sort().join("|") + rule.message;
        if (seen.has(key)) continue;
        seen.add(key);
        const suffix = x.existing || y.existing ? " (patient's current medication)" : "";
        warnings.push({
          id: `interaction:${key}`,
          kind: "interaction",
          severity: rule.severity,
          message: `${x.display} + ${y.display}${suffix} — ${rule.message}`,
        });
      }
    }
  }
  return warnings;
}

const SEVERITY_ORDER: Record<WarningSeverity, number> = { contraindicated: 0, major: 1, moderate: 2 };

export function checkPrescriptionSafety(
  medications: MedicationInput[],
  patient: { allergies?: string | null; currentMedications?: string | null }
): SafetyWarning[] {
  const named = medications.filter((m) => m.name?.trim() || m.genericName?.trim());
  return [
    ...checkAllergies(patient.allergies, named),
    ...checkInteractions(named, patient.currentMedications),
  ].sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}

/** Warnings that should require explicit acknowledgement before a prescription is saved. */
export const requiresAcknowledgement = (warnings: SafetyWarning[]) =>
  warnings.some((w) => w.severity === "contraindicated" || w.severity === "major");
