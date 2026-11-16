"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Plus, Minus, Save, Printer, Search, Filter, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Prescription } from "@/types/opd";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { prescriptionSchema, PrescriptionFormData } from "@/lib/validations/opd";
import { SafetyWarnings } from "@/components/clinical/safety-warnings";
import { checkPrescriptionSafety, requiresAcknowledgement } from "@/lib/clinical-safety";

/** Recorded when a prescriber proceeds despite safety warnings */
export interface PrescriptionSafetyMeta {
  overriddenWarnings: string[];
}

interface PrescriptionGenerationProps {
  patientId: string;
  consultationId: string;
  prescriptions: Prescription[];
  /** Allergies and current medications are free text from the patient record, used for safety checks */
  patientAllergies?: string;
  patientCurrentMedications?: string;
  /** Role-based access; creating and editing prescriptions is disabled when false */
  canCreate?: boolean;
  onCreatePrescription: (data: PrescriptionFormData, meta?: PrescriptionSafetyMeta) => Promise<void>;
  onUpdatePrescription: (id: string, data: PrescriptionFormData) => Promise<void>;
  onDeletePrescription: (id: string) => Promise<void>;
  onPrintPrescription: (id: string) => void;
}

interface MedicationTemplate {
  id: string;
  name: string;
  genericName: string;
  category: string;
  defaultDosage: string;
  defaultFrequency: string;
  defaultDuration: string;
  commonInstructions: string[];
}

// Mock medication templates - in real app, this would come from a database
const medicationTemplates: MedicationTemplate[] = [
  {
    id: "1",
    name: "Paracetamol",
    genericName: "Acetaminophen",
    category: "Analgesic",
    defaultDosage: "500mg",
    defaultFrequency: "Every 6 hours",
    defaultDuration: "3 days",
    commonInstructions: ["Take with food", "Do not exceed 4g daily", "Take as needed for fever/pain"]
  },
  {
    id: "2",
    name: "Amoxicillin",
    genericName: "Amoxicillin",
    category: "Antibiotic",
    defaultDosage: "500mg",
    defaultFrequency: "Three times daily",
    defaultDuration: "7 days",
    commonInstructions: ["Take with food", "Complete full course", "Take at regular intervals"]
  },
  {
    id: "3",
    name: "Metformin",
    genericName: "Metformin",
    category: "Antidiabetic",
    defaultDosage: "500mg",
    defaultFrequency: "Twice daily",
    defaultDuration: "Ongoing",
    commonInstructions: ["Take with meals", "Monitor blood glucose", "Stay hydrated"]
  },
  {
    id: "4",
    name: "Omeprazole",
    genericName: "Omeprazole",
    category: "Proton pump inhibitor",
    defaultDosage: "20mg",
    defaultFrequency: "Once daily",
    defaultDuration: "14 days",
    commonInstructions: ["Take before breakfast", "Do not chew or crush", "Take on empty stomach"]
  },
  {
    id: "5",
    name: "Aspirin",
    genericName: "Acetylsalicylic acid",
    category: "Antiplatelet",
    defaultDosage: "75mg",
    defaultFrequency: "Once daily",
    defaultDuration: "Ongoing",
    commonInstructions: ["Take with food", "Monitor for bleeding", "Take at same time daily"]
  }
];

export function PrescriptionGeneration({
  patientId,
  consultationId,
  prescriptions,
  patientAllergies,
  patientCurrentMedications,
  canCreate = true,
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
    defaultValues: {
      type: "regular",
      priority: "medium",
      status: "active",
      medications: [
        {
          name: "",
          genericName: "",
          dosage: "",
          frequency: "",
          duration: "",
          quantity: 0,
          instructions: "",
          route: "oral",
        }
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "medications",
  });

  // react-hook-form mutates the watched array in place, so key the memo on the drug
  // names themselves rather than the array reference.
  const watchedMedications = form.watch("medications");
  const medicationKey = JSON.stringify((watchedMedications ?? []).map((m) => [m?.name ?? "", m?.genericName ?? ""]));
  const safetyWarnings = useMemo(
    () =>
      checkPrescriptionSafety(
        (JSON.parse(medicationKey) as [string, string][]).map(([name, genericName]) => ({ name, genericName })),
        { allergies: patientAllergies, currentMedications: patientCurrentMedications }
      ),
    [medicationKey, patientAllergies, patientCurrentMedications]
  );
  const [safetyAcknowledged, setSafetyAcknowledged] = useState(false);
  const warningKey = safetyWarnings.map((w) => w.id).join("|");
  // A changed set of warnings needs a fresh acknowledgement
  useEffect(() => setSafetyAcknowledged(false), [warningKey]);
  const blockedBySafety = requiresAcknowledgement(safetyWarnings) && !safetyAcknowledged;

  const handleSubmit = async (data: PrescriptionFormData) => {
    if (blockedBySafety) return;
    try {
      if (editingPrescription) {
        await onUpdatePrescription(editingPrescription.id, data);
      } else {
        await onCreatePrescription(
          data,
          safetyWarnings.length > 0 ? { overriddenWarnings: safetyWarnings.map((w) => w.message) } : undefined
        );
      }
      setPrescriptionDialogOpen(false);
      setEditingPrescription(null);
      form.reset();
    } catch (error) {
      console.error("Error saving prescription:", error);
    }
  };

  const openPrescriptionDialog = (prescription?: Prescription) => {
    if (prescription) {
      setEditingPrescription(prescription);
      form.reset({
        type: prescription.type,
        priority: prescription.priority,
        status: prescription.status,
        notes: prescription.notes || "",
        medications: prescription.medications.map((m) => ({
          name: m.name,
          genericName: m.genericName,
          dosage: m.dosage,
          frequency: m.frequency,
          duration: m.duration,
          quantity: m.quantity,
          instructions: m.instructions,
          route: m.route === "iv" || m.route === "im" || m.route === "sc" ? "injection" : m.route,
        })),
      });
    } else {
      setEditingPrescription(null);
      form.reset();
    }
    setPrescriptionDialogOpen(true);
  };

  const addMedication = () => {
    append({
      name: "",
      genericName: "",
      dosage: "",
      frequency: "",
      duration: "",
      quantity: 0,
      instructions: "",
      route: "oral",
    });
  };

  const removeMedication = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const applyTemplate = (template: MedicationTemplate, index: number) => {
    form.setValue(`medications.${index}.name`, template.name);
    form.setValue(`medications.${index}.genericName`, template.genericName);
    form.setValue(`medications.${index}.dosage`, template.defaultDosage);
    form.setValue(`medications.${index}.frequency`, template.defaultFrequency);
    form.setValue(`medications.${index}.duration`, template.defaultDuration);
    form.setValue(`medications.${index}.instructions`, template.commonInstructions.join("; "));
  };

  const applyMultipleTemplates = () => {
    // Remove existing medications except the first one
    while (fields.length > 1) {
      remove(1);
    }

    selectedTemplates.forEach((templateId, index) => {
      const template = medicationTemplates.find(t => t.id === templateId);
      if (template) {
        if (index === 0) {
          // Apply to first medication
          applyTemplate(template, 0);
        } else {
          // Add new medication with template
          append({
            name: template.name,
            genericName: template.genericName,
            dosage: template.defaultDosage,
            frequency: template.defaultFrequency,
            duration: template.defaultDuration,
            quantity: 0,
            instructions: template.commonInstructions.join("; "),
            route: "oral",
          });
        }
      }
    });

    setSelectedTemplates([]);
    setTemplateDialogOpen(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "completed": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "on_hold": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredMedicationTemplates = medicationTemplates.filter((template) =>
    template.name.toLowerCase().includes(medicationSearch.toLowerCase()) ||
    template.genericName.toLowerCase().includes(medicationSearch.toLowerCase()) ||
    template.category.toLowerCase().includes(medicationSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Prescription Generation</h1>
        <p className="text-gray-600">Create and manage patient prescriptions</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Prescriptions ({prescriptions.length})</h2>
        </div>
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
                <DialogDescription>
                  Select common medications to add to your prescription
                </DialogDescription>
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
                        <TableHead>Default Dose</TableHead>
                        <TableHead>Frequency</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredMedicationTemplates.map((template) => (
                        <TableRow key={template.id}>
                          <TableCell>
                            <Checkbox
                              checked={selectedTemplates.includes(template.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedTemplates([...selectedTemplates, template.id]);
                                } else {
                                  setSelectedTemplates(selectedTemplates.filter(id => id !== template.id));
                                }
                              }}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell>{template.genericName}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{template.category}</Badge>
                          </TableCell>
                          <TableCell>{template.defaultDosage}</TableCell>
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
                <Button 
                  onClick={applyMultipleTemplates}
                  disabled={selectedTemplates.length === 0}
                >
                  Add Selected Medications ({selectedTemplates.length})
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={prescriptionDialogOpen} onOpenChange={setPrescriptionDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => openPrescriptionDialog()} disabled={!canCreate}>
                <Plus className="mr-2 h-4 w-4" />
                New Prescription
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingPrescription ? "Edit Prescription" : "Create New Prescription"}
                </DialogTitle>
                <DialogDescription>
                  Add medications and instructions for the patient
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Prescription Type</Label>
                    <Select onValueChange={(value) => form.setValue("type", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="repeat">Repeat</SelectItem>
                        <SelectItem value="discharge">Discharge</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Priority</Label>
                    <Select onValueChange={(value) => form.setValue("priority", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select onValueChange={(value) => form.setValue("status", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="on_hold">On Hold</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-lg">Medications</Label>
                    <Button type="button" onClick={addMedication} size="sm">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Medication
                    </Button>
                  </div>

                  {fields.map((field, index) => (
                    <Card key={field.id} className="p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-sm font-medium">Medication {index + 1}</h4>
                        <div className="flex gap-2">
                          <Select onValueChange={(templateId) => {
                            const template = medicationTemplates.find(t => t.id === templateId);
                            if (template) {
                              applyTemplate(template, index);
                            }
                          }}>
                            <SelectTrigger className="w-48">
                              <SelectValue placeholder="Apply template" />
                            </SelectTrigger>
                            <SelectContent>
                              {medicationTemplates.map((template) => (
                                <SelectItem key={template.id} value={template.id}>
                                  {template.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeMedication(index)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label htmlFor={`medications.${index}.name`}>Medication Name *</Label>
                          <Input
                            {...form.register(`medications.${index}.name`)}
                            placeholder="e.g., Paracetamol"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`medications.${index}.genericName`}>Generic Name</Label>
                          <Input
                            {...form.register(`medications.${index}.genericName`)}
                            placeholder="e.g., Acetaminophen"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
                        <div className="space-y-2">
                          <Label htmlFor={`medications.${index}.dosage`}>Dosage *</Label>
                          <Input
                            {...form.register(`medications.${index}.dosage`)}
                            placeholder="e.g., 500mg"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`medications.${index}.frequency`}>Frequency *</Label>
                          <Input
                            {...form.register(`medications.${index}.frequency`)}
                            placeholder="e.g., Twice daily"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`medications.${index}.duration`}>Duration *</Label>
                          <Input
                            {...form.register(`medications.${index}.duration`)}
                            placeholder="e.g., 7 days"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor={`medications.${index}.quantity`}>Quantity</Label>
                          <Input
                            type="number"
                            {...form.register(`medications.${index}.quantity`, { valueAsNumber: true })}
                            placeholder="30"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Route</Label>
                          <Select onValueChange={(value) => form.setValue(`medications.${index}.route`, value as any)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select route" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="oral">Oral</SelectItem>
                              <SelectItem value="topical">Topical</SelectItem>
                              <SelectItem value="injection">Injection</SelectItem>
                              <SelectItem value="inhalation">Inhalation</SelectItem>
                              <SelectItem value="rectal">Rectal</SelectItem>
                              <SelectItem value="sublingual">Sublingual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2">
                        <Label htmlFor={`medications.${index}.instructions`}>Special Instructions</Label>
                        <Textarea
                          {...form.register(`medications.${index}.instructions`)}
                          placeholder="e.g., Take with food, avoid alcohol"
                          rows={2}
                        />
                      </div>
                    </Card>
                  ))}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Prescription Notes</Label>
                  <Textarea
                    {...form.register("notes")}
                    placeholder="Additional notes for the prescription"
                    rows={3}
                  />
                </div>

                {/* Pinned to the bottom so warnings stay visible while scrolling the medication list */}
                <div className="sticky -bottom-6 -mx-6 -mb-6 space-y-3 border-t bg-background px-6 py-4">
                <SafetyWarnings
                  warnings={safetyWarnings}
                  acknowledged={safetyAcknowledged}
                  onAcknowledgedChange={setSafetyAcknowledged}
                />

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPrescriptionDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={blockedBySafety}>
                    <Save className="mr-2 h-4 w-4" />
                    {editingPrescription ? "Update" : "Create"} Prescription
                  </Button>
                </DialogFooter>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6">
        {prescriptions.map((prescription) => (
          <Card key={prescription.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Prescription #{prescription.id}
                    <Badge className={getStatusColor(prescription.status)}>
                      {prescription.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getPriorityColor(prescription.priority)}>
                      {prescription.priority}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {prescription.type.charAt(0).toUpperCase() + prescription.type.slice(1)} prescription
                    • Created: {new Date(prescription.createdAt).toLocaleDateString()}
                    • By: {prescription.prescribedBy}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openPrescriptionDialog(prescription)}
                    disabled={!canCreate}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPrintPrescription(prescription.id)}
                  >
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Medications ({prescription.medications.length})</h4>
                  <div className="grid gap-3">
                    {prescription.medications.map((medication, index) => (
                      <div key={index} className="border rounded-lg p-3 bg-gray-50">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{medication.name}</h5>
                          {medication.genericName && (
                            <Badge variant="outline">{medication.genericName}</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
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
                        </div>
                        {medication.quantity && (
                          <div className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">Quantity:</span> {medication.quantity}
                          </div>
                        )}
                        {medication.instructions && (
                          <div className="text-sm text-muted-foreground mt-2 p-2 bg-blue-50 rounded">
                            <span className="font-medium">Instructions:</span> {medication.instructions}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                {prescription.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-lg">
                      {prescription.notes}
                    </p>
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
                <p className="text-sm text-muted-foreground mt-2">
                  Create a new prescription to get started
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}