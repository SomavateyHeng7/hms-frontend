"use client";

import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { Minus, Plus, Printer, Save, Search, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import type { Prescription, PrescriptionMedication } from "@/features/doctor/opd/types";
import { prescriptionSchema, type PrescriptionFormData } from "@/features/doctor/opd/validations";

interface PrescriptionGenerationProps {
  patientId: string;
  consultationId: string;
  prescriptions: Prescription[];
  onCreatePrescription: (data: PrescriptionFormData) => Promise<void>;
  onUpdatePrescription: (id: string, data: PrescriptionFormData) => Promise<void>;
  onDeletePrescription: (id: string) => Promise<void>;
  onPrintPrescription: (id: string) => void;
}

type MedicationFormData = PrescriptionFormData["medications"][number];
type DosageForm = PrescriptionMedication["dosageForm"];
type Route = PrescriptionMedication["route"];

interface MedicationTemplate {
  id: string;
  drugName: string;
  genericName: string;
  category: string;
  strength: string;
  dosageForm: DosageForm;
  defaultDosage: string;
  defaultFrequency: string;
  defaultDuration: string;
  commonInstructions: string[];
}

const DOSAGE_FORMS: DosageForm[] = ["tablet", "capsule", "syrup", "injection", "cream", "drops", "inhaler", "patch"];

const ROUTES: { value: Route; label: string }[] = [
  { value: "oral", label: "Oral" },
  { value: "iv", label: "Intravenous (IV)" },
  { value: "im", label: "Intramuscular (IM)" },
  { value: "sc", label: "Subcutaneous (SC)" },
  { value: "topical", label: "Topical" },
  { value: "inhalation", label: "Inhalation" },
  { value: "rectal", label: "Rectal" },
  { value: "sublingual", label: "Sublingual" },
];

// Sample templates until the pharmacy system provides a drug catalogue.
const medicationTemplates: MedicationTemplate[] = [
  {
    id: "1",
    drugName: "Paracetamol",
    genericName: "Acetaminophen",
    category: "Analgesic",
    strength: "500mg",
    dosageForm: "tablet",
    defaultDosage: "1 tablet",
    defaultFrequency: "Every 6 hours",
    defaultDuration: "3 days",
    commonInstructions: ["Take with food", "Do not exceed 4g daily", "Take as needed for fever/pain"],
  },
  {
    id: "2",
    drugName: "Amoxicillin",
    genericName: "Amoxicillin",
    category: "Antibiotic",
    strength: "500mg",
    dosageForm: "capsule",
    defaultDosage: "1 capsule",
    defaultFrequency: "Three times daily",
    defaultDuration: "7 days",
    commonInstructions: ["Take with food", "Complete full course", "Take at regular intervals"],
  },
  {
    id: "3",
    drugName: "Metformin",
    genericName: "Metformin",
    category: "Antidiabetic",
    strength: "500mg",
    dosageForm: "tablet",
    defaultDosage: "1 tablet",
    defaultFrequency: "Twice daily",
    defaultDuration: "30 days",
    commonInstructions: ["Take with meals", "Monitor blood glucose", "Stay hydrated"],
  },
  {
    id: "4",
    drugName: "Omeprazole",
    genericName: "Omeprazole",
    category: "Proton pump inhibitor",
    strength: "20mg",
    dosageForm: "capsule",
    defaultDosage: "1 capsule",
    defaultFrequency: "Once daily",
    defaultDuration: "14 days",
    commonInstructions: ["Take before breakfast", "Do not chew or crush"],
  },
  {
    id: "5",
    drugName: "Aspirin",
    genericName: "Acetylsalicylic acid",
    category: "Antiplatelet",
    strength: "81mg",
    dosageForm: "tablet",
    defaultDosage: "1 tablet",
    defaultFrequency: "Once daily",
    defaultDuration: "30 days",
    commonInstructions: ["Take with food", "Monitor for bleeding", "Take at same time daily"],
  },
];

const emptyMedication = (): MedicationFormData => ({
  drugName: "",
  genericName: "",
  strength: "",
  dosageForm: "tablet",
  quantity: 1,
  dosage: "",
  frequency: "",
  route: "oral",
  duration: "",
  instructions: "",
  substitutionAllowed: true,
  refills: 0,
  warnings: [],
});

const fromTemplate = (t: MedicationTemplate): MedicationFormData => ({
  ...emptyMedication(),
  drugName: t.drugName,
  genericName: t.genericName,
  strength: t.strength,
  dosageForm: t.dosageForm,
  dosage: t.defaultDosage,
  frequency: t.defaultFrequency,
  duration: t.defaultDuration,
  instructions: t.commonInstructions.join("; "),
});

const emptyPrescription = (): PrescriptionFormData => ({
  medications: [emptyMedication()],
  instructions: "",
  duration: "",
  followUpDate: "",
  pharmacyNotes: "",
});

const toFormData = (p: Prescription): PrescriptionFormData => ({
  medications: p.medications.map((m) => ({
    drugName: m.drugName,
    genericName: m.genericName ?? "",
    strength: m.strength,
    dosageForm: m.dosageForm,
    quantity: m.quantity,
    dosage: m.dosage,
    frequency: m.frequency,
    route: m.route,
    duration: m.duration,
    instructions: m.instructions,
    substitutionAllowed: m.substitutionAllowed,
    refills: m.refills,
    warnings: m.warnings ?? [],
  })),
  instructions: p.instructions,
  duration: p.duration,
  followUpDate: p.followUpDate ? format(p.followUpDate, "yyyy-MM-dd") : "",
  pharmacyNotes: p.pharmacyNotes ?? "",
});

const STATUS_COLORS: Record<Prescription["status"], string> = {
  active: "bg-green-100 text-green-800",
  completed: "bg-blue-100 text-blue-800",
  cancelled: "bg-red-100 text-red-800",
  expired: "bg-gray-100 text-gray-800",
};

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-sm text-red-500">{message}</p> : null;
}

export function PrescriptionGeneration({
  prescriptions,
  onCreatePrescription,
  onUpdatePrescription,
  onDeletePrescription,
  onPrintPrescription,
}: PrescriptionGenerationProps) {
  const [prescriptionDialogOpen, setPrescriptionDialogOpen] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
  const [medicationSearch, setMedicationSearch] = useState("");
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);

  const form = useForm<PrescriptionFormData>({
    resolver: zodResolver(prescriptionSchema),
    defaultValues: emptyPrescription(),
  });
  const errors = form.formState.errors;

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "medications",
  });

  const handleSubmit = async (data: PrescriptionFormData) => {
    if (editingPrescription) {
      await onUpdatePrescription(editingPrescription.id, data);
    } else {
      await onCreatePrescription(data);
    }
    setPrescriptionDialogOpen(false);
    setEditingPrescription(null);
    form.reset(emptyPrescription());
  };

  const openPrescriptionDialog = (prescription?: Prescription) => {
    setEditingPrescription(prescription ?? null);
    form.reset(prescription ? toFormData(prescription) : emptyPrescription());
    setPrescriptionDialogOpen(true);
  };

  const applyTemplate = (template: MedicationTemplate, index: number) => {
    const med = fromTemplate(template);
    (Object.keys(med) as (keyof MedicationFormData)[]).forEach((key) => {
      form.setValue(`medications.${index}.${key}`, med[key] as never, { shouldValidate: false });
    });
  };

  const applyMultipleTemplates = () => {
    const meds = selectedTemplates
      .map((id) => medicationTemplates.find((t) => t.id === id))
      .filter((t): t is MedicationTemplate => !!t)
      .map(fromTemplate);
    if (meds.length > 0) {
      form.reset({ ...emptyPrescription(), medications: meds });
      replace(meds);
      setEditingPrescription(null);
      setPrescriptionDialogOpen(true);
    }
    setSelectedTemplates([]);
    setTemplateDialogOpen(false);
  };

  const query = medicationSearch.toLowerCase();
  const filteredMedicationTemplates = medicationTemplates.filter(
    (t) =>
      t.drugName.toLowerCase().includes(query) ||
      t.genericName.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query)
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Prescription Generation</h1>
        <p className="text-muted-foreground">Create and manage patient prescriptions</p>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
        <h2 className="text-xl font-semibold">Prescriptions ({prescriptions.length})</h2>
        <div className="flex gap-2">
          <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Search className="mr-2 h-4 w-4" />
                Browse Templates
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                <DialogTitle>Medication Templates</DialogTitle>
                <DialogDescription>Select common medications to start a prescription</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search medications..."
                    value={medicationSearch}
                    onChange={(e) => setMedicationSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="max-h-96 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12">Select</TableHead>
                        <TableHead>Medication</TableHead>
                        <TableHead>Generic Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Strength</TableHead>
                        <TableHead>Frequency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMedicationTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedTemplates.includes(template.id)}
                              onCheckedChange={(checked) =>
                                setSelectedTemplates((prev) =>
                                  checked ? [...prev, template.id] : prev.filter((id) => id !== template.id)
                                )
                              }
                            />
                          </TableCell>
                          <TableCell className="font-medium">{template.drugName}</TableCell>
                          <TableCell>{template.genericName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{template.category}</Badge>
                          </TableCell>
                          <TableCell>{template.strength}</TableCell>
                          <TableCell>{template.defaultFrequency}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={applyMultipleTemplates} disabled={selectedTemplates.length === 0}>
                  Start Prescription ({selectedTemplates.length})
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={prescriptionDialogOpen} onOpenChange={setPrescriptionDialogOpen}>
            <Button onClick={() => openPrescriptionDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              New Prescription
            </Button>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingPrescription ? "Edit Prescription" : "Create New Prescription"}</DialogTitle>
                <DialogDescription>Add medications and instructions for the patient</DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg">Medications</Label>
                    <Button type="button" onClick={() => append(emptyMedication())} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Medication
                    </Button>
                  </div>
                  <FieldError message={errors.medications?.root?.message ?? errors.medications?.message} />

                  {fields.map((field, index) => {
                    const medErrors = errors.medications?.[index];
                    return (
                      <Card key={field.id} className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-sm font-medium">Medication {index + 1}</h4>
                          <div className="flex gap-2">
                            <Select
                              onValueChange={(templateId) => {
                                const template = medicationTemplates.find((t) => t.id === templateId);
                                if (template) applyTemplate(template, index);
                              }}
                            >
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Apply template" />
                              </SelectTrigger>
                              <SelectContent>
                                {medicationTemplates.map((template) => (
                                  <SelectItem key={template.id} value={template.id}>
                                    {template.drugName} {template.strength}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            {fields.length > 1 && (
                              <Button type="button" variant="outline" size="sm" onClick={() => remove(index)} aria-label="Remove medication">
                                <Minus className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                          <div className="space-y-2 md:col-span-2">
                            <Label htmlFor={`med-${index}-drugName`}>Drug Name *</Label>
                            <Input id={`med-${index}-drugName`} {...form.register(`medications.${index}.drugName`)} placeholder="e.g., Paracetamol" />
                            <FieldError message={medErrors?.drugName?.message} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`med-${index}-genericName`}>Generic Name</Label>
                            <Input id={`med-${index}-genericName`} {...form.register(`medications.${index}.genericName`)} placeholder="e.g., Acetaminophen" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`med-${index}-strength`}>Strength *</Label>
                            <Input id={`med-${index}-strength`} {...form.register(`medications.${index}.strength`)} placeholder="e.g., 500mg" />
                            <FieldError message={medErrors?.strength?.message} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label>Form</Label>
                            <Controller
                              control={form.control}
                              name={`medications.${index}.dosageForm`}
                              render={({ field: f }) => (
                                <Select value={f.value} onValueChange={f.onChange}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {DOSAGE_FORMS.map((d) => (
                                      <SelectItem key={d} value={d} className="capitalize">
                                        {d}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`med-${index}-dosage`}>Dosage *</Label>
                            <Input id={`med-${index}-dosage`} {...form.register(`medications.${index}.dosage`)} placeholder="e.g., 1 tablet" />
                            <FieldError message={medErrors?.dosage?.message} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`med-${index}-frequency`}>Frequency *</Label>
                            <Input id={`med-${index}-frequency`} {...form.register(`medications.${index}.frequency`)} placeholder="e.g., Twice daily" />
                            <FieldError message={medErrors?.frequency?.message} />
                          </div>
                          <div className="space-y-2">
                            <Label>Route</Label>
                            <Controller
                              control={form.control}
                              name={`medications.${index}.route`}
                              render={({ field: f }) => (
                                <Select value={f.value} onValueChange={f.onChange}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ROUTES.map((r) => (
                                      <SelectItem key={r.value} value={r.value}>
                                        {r.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div className="space-y-2">
                            <Label htmlFor={`med-${index}-duration`}>Duration *</Label>
                            <Input id={`med-${index}-duration`} {...form.register(`medications.${index}.duration`)} placeholder="e.g., 7 days" />
                            <FieldError message={medErrors?.duration?.message} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`med-${index}-quantity`}>Quantity *</Label>
                            <Input id={`med-${index}-quantity`} type="number" min={1} {...form.register(`medications.${index}.quantity`, { valueAsNumber: true })} />
                            <FieldError message={medErrors?.quantity?.message} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor={`med-${index}-refills`}>Refills</Label>
                            <Input id={`med-${index}-refills`} type="number" min={0} max={12} {...form.register(`medications.${index}.refills`, { valueAsNumber: true })} />
                            <FieldError message={medErrors?.refills?.message} />
                          </div>
                          <Controller
                            control={form.control}
                            name={`medications.${index}.substitutionAllowed`}
                            render={({ field: f }) => (
                              <div className="flex items-end gap-2 pb-2">
                                <Checkbox id={`med-${index}-sub`} checked={f.value} onCheckedChange={(v) => f.onChange(v === true)} />
                                <Label htmlFor={`med-${index}-sub`} className="font-normal">
                                  Generic substitution allowed
                                </Label>
                              </div>
                            )}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`med-${index}-instructions`}>Instructions for the patient *</Label>
                          <Textarea id={`med-${index}-instructions`} {...form.register(`medications.${index}.instructions`)} placeholder="e.g., Take with food, avoid alcohol" rows={2} />
                          <FieldError message={medErrors?.instructions?.message} />
                        </div>
                      </Card>
                    );
                  })}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="rx-duration">Treatment Duration *</Label>
                    <Input id="rx-duration" {...form.register("duration")} placeholder="e.g., 7 days" />
                    <FieldError message={errors.duration?.message} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rx-followUp">Follow-up Date</Label>
                    <Input id="rx-followUp" type="date" {...form.register("followUpDate")} />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rx-instructions">General Instructions *</Label>
                  <Textarea id="rx-instructions" {...form.register("instructions")} placeholder="e.g., Drink plenty of water; return if fever persists" rows={2} />
                  <FieldError message={errors.instructions?.message} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rx-pharmacyNotes">Notes for the Pharmacy</Label>
                  <Textarea id="rx-pharmacyNotes" {...form.register("pharmacyNotes")} placeholder="Optional" rows={2} />
                </div>

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setPrescriptionDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={form.formState.isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {editingPrescription ? "Update" : "Create"} Prescription
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6">
        {prescriptions.map((prescription) => (
          <Card key={prescription.id}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Prescription #{prescription.prescriptionNumber}
                    <Badge className={STATUS_COLORS[prescription.status]}>{prescription.status}</Badge>
                  </CardTitle>
                  <CardDescription>
                    Issued {format(prescription.issuedDate, "PP")} • By {prescription.doctorName} • Duration {prescription.duration}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => openPrescriptionDialog(prescription)}>
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onPrintPrescription(prescription.id)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => onDeletePrescription(prescription.id)} aria-label="Delete prescription">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Medications ({prescription.medications.length})</h4>
                  <div className="grid gap-3">
                    {prescription.medications.map((medication) => (
                      <div key={medication.id} className="border rounded-lg p-3 bg-muted/40">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">
                            {medication.drugName} {medication.strength}
                            <span className="ml-2 text-sm font-normal text-muted-foreground capitalize">{medication.dosageForm}</span>
                          </h5>
                          {medication.genericName && <Badge variant="outline">{medication.genericName}</Badge>}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm text-muted-foreground">
                          <div>
                            <span className="font-medium">Dosage:</span> {medication.dosage}
                          </div>
                          <div>
                            <span className="font-medium">Frequency:</span> {medication.frequency}
                          </div>
                          <div>
                            <span className="font-medium">Duration:</span> {medication.duration}
                          </div>
                          <div>
                            <span className="font-medium">Route:</span> {medication.route}
                          </div>
                          <div>
                            <span className="font-medium">Qty:</span> {medication.quantity}
                          </div>
                        </div>
                        {medication.instructions && (
                          <div className="text-sm text-muted-foreground mt-2 p-2 bg-blue-50 rounded">
                            <span className="font-medium">Instructions:</span> {medication.instructions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Instructions</h4>
                  <p className="text-sm text-muted-foreground">{prescription.instructions}</p>
                </div>
                {prescription.pharmacyNotes && (
                  <div>
                    <h4 className="font-medium mb-1">Pharmacy Notes</h4>
                    <p className="text-sm text-muted-foreground">{prescription.pharmacyNotes}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {prescriptions.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">No prescriptions found</p>
                <p className="text-sm text-muted-foreground mt-2">Create a new prescription to get started</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
