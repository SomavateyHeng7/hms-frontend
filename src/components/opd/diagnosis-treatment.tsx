"use client";

import React, { useState } from "react";
import { Plus, Trash2, Edit3, Search, Filter } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Diagnosis, TreatmentPlan } from "@/types/opd";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { diagnosisSchema, treatmentPlanSchema, DiagnosisFormData, TreatmentPlanFormData } from "@/lib/validations/opd";

interface DiagnosisTreatmentProps {
  patientId: string;
  consultationId: string;
  diagnoses: Diagnosis[];
  treatmentPlans: TreatmentPlan[];
  onAddDiagnosis: (data: DiagnosisFormData) => Promise<void>;
  onUpdateDiagnosis: (id: string, data: DiagnosisFormData) => Promise<void>;
  onDeleteDiagnosis: (id: string) => Promise<void>;
  onAddTreatmentPlan: (data: TreatmentPlanFormData) => Promise<void>;
  onUpdateTreatmentPlan: (id: string, data: TreatmentPlanFormData) => Promise<void>;
  onDeleteTreatmentPlan: (id: string) => Promise<void>;
}

export function DiagnosisTreatment({
  patientId,
  consultationId,
  diagnoses,
  treatmentPlans,
  onAddDiagnosis,
  onUpdateDiagnosis,
  onDeleteDiagnosis,
  onAddTreatmentPlan,
  onUpdateTreatmentPlan,
  onDeleteTreatmentPlan,
}: DiagnosisTreatmentProps) {
  const [diagnosisDialogOpen, setDiagnosisDialogOpen] = useState(false);
  const [treatmentDialogOpen, setTreatmentDialogOpen] = useState(false);
  const [editingDiagnosis, setEditingDiagnosis] = useState<Diagnosis | null>(null);
  const [editingTreatment, setEditingTreatment] = useState<TreatmentPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const diagnosisForm = useForm<DiagnosisFormData>({
    resolver: zodResolver(diagnosisSchema),
    defaultValues: {
      type: "primary",
      severity: "mild",
      status: "active",
    },
  });

  const treatmentForm = useForm<TreatmentPlanFormData>({
    resolver: zodResolver(treatmentPlanSchema),
    defaultValues: {
      planType: "medication",
      priority: "medium",
    },
  });

  const handleDiagnosisSubmit = async (data: DiagnosisFormData) => {
    try {
      if (editingDiagnosis) {
        await onUpdateDiagnosis(editingDiagnosis.id, data);
      } else {
        await onAddDiagnosis(data);
      }
      setDiagnosisDialogOpen(false);
      setEditingDiagnosis(null);
      diagnosisForm.reset();
    } catch (error) {
      console.error("Error saving diagnosis:", error);
    }
  };

  const handleTreatmentSubmit = async (data: TreatmentPlanFormData) => {
    try {
      if (editingTreatment) {
        await onUpdateTreatmentPlan(editingTreatment.id, data);
      } else {
        await onAddTreatmentPlan(data);
      }
      setTreatmentDialogOpen(false);
      setEditingTreatment(null);
      treatmentForm.reset();
    } catch (error) {
      console.error("Error saving treatment plan:", error);
    }
  };

  const openDiagnosisDialog = (diagnosis?: Diagnosis) => {
    if (diagnosis) {
      setEditingDiagnosis(diagnosis);
      diagnosisForm.reset({
        icdCode: diagnosis.icdCode,
        description: diagnosis.description,
        type: diagnosis.type,
        severity: diagnosis.severity,
        status: diagnosis.status,
        onsetDate: diagnosis.onsetDate.toISOString().split('T')[0],
        notes: diagnosis.notes || "",
      });
    } else {
      setEditingDiagnosis(null);
      diagnosisForm.reset();
    }
    setDiagnosisDialogOpen(true);
  };

  const openTreatmentDialog = (treatment?: TreatmentPlan) => {
    if (treatment) {
      setEditingTreatment(treatment);
      treatmentForm.reset({
        planType: treatment.planType,
        title: treatment.title,
        description: treatment.description,
        instructions: treatment.instructions,
        duration: treatment.duration || "",
        frequency: treatment.frequency || "",
        dosage: treatment.dosage || "",
        startDate: treatment.startDate.toISOString().split('T')[0],
        endDate: treatment.endDate ? treatment.endDate.toISOString().split('T')[0] : "",
        priority: treatment.priority,
        assignedTo: treatment.assignedTo || "",
        notes: treatment.notes || "",
      });
    } else {
      setEditingTreatment(null);
      treatmentForm.reset();
    }
    setTreatmentDialogOpen(true);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "bg-red-100 text-red-800 border-red-300";
      case "severe": return "bg-orange-100 text-orange-800 border-orange-300";
      case "moderate": return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "mild": return "bg-blue-100 text-blue-800 border-blue-300";
      default: return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-800";
      case "resolved": return "bg-blue-100 text-blue-800";
      case "chronic": return "bg-purple-100 text-purple-800";
      case "inactive": return "bg-gray-100 text-gray-800";
      case "planned": return "bg-yellow-100 text-yellow-800";
      case "in_progress": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "on_hold": return "bg-orange-100 text-orange-800";
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

  const filteredDiagnoses = diagnoses.filter((diagnosis) => {
    const matchesSearch = diagnosis.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         diagnosis.icdCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "all" || diagnosis.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredTreatments = treatmentPlans.filter((treatment) => {
    const matchesSearch = treatment.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         treatment.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = statusFilter === "all" || treatment.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Diagnosis & Treatment Planning</h1>
        <p className="text-gray-600">Manage patient diagnoses and treatment plans</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search diagnoses and treatments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="chronic">Chronic</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
            <SelectItem value="planned">Planned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="diagnoses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="diagnoses">Diagnoses ({diagnoses.length})</TabsTrigger>
          <TabsTrigger value="treatments">Treatment Plans ({treatmentPlans.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="diagnoses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Patient Diagnoses</h2>
            <Dialog open={diagnosisDialogOpen} onOpenChange={setDiagnosisDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openDiagnosisDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Diagnosis
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingDiagnosis ? "Edit Diagnosis" : "Add New Diagnosis"}
                  </DialogTitle>
                  <DialogDescription>
                    Enter the diagnosis details below
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={diagnosisForm.handleSubmit(handleDiagnosisSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="icdCode">ICD Code *</Label>
                      <Input
                        id="icdCode"
                        {...diagnosisForm.register("icdCode")}
                        placeholder="e.g., J45.9"
                      />
                      {diagnosisForm.formState.errors.icdCode && (
                        <p className="text-sm text-red-500">{diagnosisForm.formState.errors.icdCode.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="onsetDate">Onset Date *</Label>
                      <Input
                        id="onsetDate"
                        type="date"
                        {...diagnosisForm.register("onsetDate")}
                      />
                      {diagnosisForm.formState.errors.onsetDate && (
                        <p className="text-sm text-red-500">{diagnosisForm.formState.errors.onsetDate.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      {...diagnosisForm.register("description")}
                      placeholder="Enter diagnosis description"
                    />
                    {diagnosisForm.formState.errors.description && (
                      <p className="text-sm text-red-500">{diagnosisForm.formState.errors.description.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select onValueChange={(value) => diagnosisForm.setValue("type", value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="primary">Primary</SelectItem>
                          <SelectItem value="secondary">Secondary</SelectItem>
                          <SelectItem value="rule_out">Rule Out</SelectItem>
                          <SelectItem value="differential">Differential</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Severity</Label>
                      <Select onValueChange={(value) => diagnosisForm.setValue("severity", value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select severity" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mild">Mild</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="severe">Severe</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select onValueChange={(value) => diagnosisForm.setValue("status", value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="chronic">Chronic</SelectItem>
                          <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      {...diagnosisForm.register("notes")}
                      placeholder="Additional notes about the diagnosis"
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setDiagnosisDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingDiagnosis ? "Update" : "Add"} Diagnosis
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredDiagnoses.map((diagnosis) => (
              <Card key={diagnosis.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{diagnosis.description}</h3>
                        <Badge variant="outline">{diagnosis.icdCode}</Badge>
                        <Badge className={getSeverityColor(diagnosis.severity)}>
                          {diagnosis.severity}
                        </Badge>
                        <Badge className={getStatusColor(diagnosis.status)}>
                          {diagnosis.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Type: {diagnosis.type.replace('_', ' ')}</p>
                        <p>Onset: {new Date(diagnosis.onsetDate).toLocaleDateString()}</p>
                        <p>Diagnosed by: {diagnosis.diagnosedBy}</p>
                        {diagnosis.notes && <p>Notes: {diagnosis.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDiagnosisDialog(diagnosis)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onDeleteDiagnosis(diagnosis.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredDiagnoses.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No diagnoses found</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="treatments" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Treatment Plans</h2>
            <Dialog open={treatmentDialogOpen} onOpenChange={setTreatmentDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => openTreatmentDialog()}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Treatment Plan
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                  <DialogTitle>
                    {editingTreatment ? "Edit Treatment Plan" : "Add New Treatment Plan"}
                  </DialogTitle>
                  <DialogDescription>
                    Enter the treatment plan details below
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={treatmentForm.handleSubmit(handleTreatmentSubmit)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title *</Label>
                      <Input
                        id="title"
                        {...treatmentForm.register("title")}
                        placeholder="Treatment plan title"
                      />
                      {treatmentForm.formState.errors.title && (
                        <p className="text-sm text-red-500">{treatmentForm.formState.errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label>Plan Type</Label>
                      <Select onValueChange={(value) => treatmentForm.setValue("planType", value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="medication">Medication</SelectItem>
                          <SelectItem value="procedure">Procedure</SelectItem>
                          <SelectItem value="therapy">Therapy</SelectItem>
                          <SelectItem value="surgery">Surgery</SelectItem>
                          <SelectItem value="observation">Observation</SelectItem>
                          <SelectItem value="referral">Referral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      {...treatmentForm.register("description")}
                      placeholder="Detailed description of the treatment plan"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instructions">Instructions *</Label>
                    <Textarea
                      id="instructions"
                      {...treatmentForm.register("instructions")}
                      placeholder="Specific instructions for the treatment"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="duration">Duration</Label>
                      <Input
                        id="duration"
                        {...treatmentForm.register("duration")}
                        placeholder="e.g., 2 weeks"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Input
                        id="frequency"
                        {...treatmentForm.register("frequency")}
                        placeholder="e.g., twice daily"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dosage">Dosage</Label>
                      <Input
                        id="dosage"
                        {...treatmentForm.register("dosage")}
                        placeholder="e.g., 500mg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date *</Label>
                      <Input
                        id="startDate"
                        type="date"
                        {...treatmentForm.register("startDate")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        {...treatmentForm.register("endDate")}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Priority</Label>
                      <Select onValueChange={(value) => treatmentForm.setValue("priority", value as any)}>
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
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="assignedTo">Assigned To</Label>
                      <Input
                        id="assignedTo"
                        {...treatmentForm.register("assignedTo")}
                        placeholder="Healthcare provider or specialist"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      {...treatmentForm.register("notes")}
                      placeholder="Additional notes about the treatment plan"
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setTreatmentDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingTreatment ? "Update" : "Add"} Treatment Plan
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {filteredTreatments.map((treatment) => (
              <Card key={treatment.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium">{treatment.title}</h3>
                        <Badge variant="outline">{treatment.planType.replace('_', ' ')}</Badge>
                        <Badge className={getPriorityColor(treatment.priority)}>
                          {treatment.priority}
                        </Badge>
                        <Badge className={getStatusColor(treatment.status)}>
                          {treatment.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{treatment.description}</p>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>Instructions: {treatment.instructions}</p>
                        {treatment.duration && <p>Duration: {treatment.duration}</p>}
                        {treatment.frequency && <p>Frequency: {treatment.frequency}</p>}
                        {treatment.dosage && <p>Dosage: {treatment.dosage}</p>}
                        <p>Start Date: {new Date(treatment.startDate).toLocaleDateString()}</p>
                        {treatment.endDate && <p>End Date: {new Date(treatment.endDate).toLocaleDateString()}</p>}
                        {treatment.assignedTo && <p>Assigned to: {treatment.assignedTo}</p>}
                        {treatment.notes && <p>Notes: {treatment.notes}</p>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openTreatmentDialog(treatment)}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => onDeleteTreatmentPlan(treatment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            {filteredTreatments.length === 0 && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No treatment plans found</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}