"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus } from "lucide-react";
import { format } from "date-fns";

interface PatientAdmissionProps {
  onAdmissionComplete?: (admission: any) => void;
}

export function PatientAdmission({ onAdmissionComplete }: PatientAdmissionProps) {
  const [admissionDate, setAdmissionDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    patientId: "",
    admittingDoctorId: "",
    department: "",
    wardId: "",
    bedId: "",
    admissionType: "",
    diagnosis: "",
    chiefComplaint: "",
    estimatedDuration: "",
    insuranceProvider: "",
    policyNumber: "",
    coverage: "",
    notes: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Admission data:", { ...formData, admissionDate });
    onAdmissionComplete?.({ ...formData, admissionDate });
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Patient Admission</h2>
        <p className="text-muted-foreground">Register new patient admission</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
              <CardDescription>Select patient and admission details</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">Patient *</Label>
                <Select
                  value={formData.patientId}
                  onValueChange={(value) => handleChange("patientId", value)}
                >
                  <SelectTrigger id="patientId">
                    <SelectValue placeholder="Select patient" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PAT001">John Doe (PAT001)</SelectItem>
                    <SelectItem value="PAT002">Jane Smith (PAT002)</SelectItem>
                    <SelectItem value="PAT003">Mike Johnson (PAT003)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admissionDate">Admission Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="admissionDate"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {admissionDate ? format(admissionDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={admissionDate} onSelect={(date) => date && setAdmissionDate(date)} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admissionType">Admission Type *</Label>
                <Select
                  value={formData.admissionType}
                  onValueChange={(value) => handleChange("admissionType", value)}
                >
                  <SelectTrigger id="admissionType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="elective">Elective</SelectItem>
                    <SelectItem value="transfer">Transfer</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">Estimated Duration (days)</Label>
                <Input
                  id="estimatedDuration"
                  type="number"
                  placeholder="e.g., 3"
                  value={formData.estimatedDuration}
                  onChange={(e) => handleChange("estimatedDuration", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Medical Information */}
          <Card>
            <CardHeader>
              <CardTitle>Medical Information</CardTitle>
              <CardDescription>Diagnosis and medical details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
                <Textarea
                  id="chiefComplaint"
                  placeholder="Primary reason for admission"
                  value={formData.chiefComplaint}
                  onChange={(e) => handleChange("chiefComplaint", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">Provisional Diagnosis *</Label>
                <Textarea
                  id="diagnosis"
                  placeholder="Enter diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => handleChange("diagnosis", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admittingDoctor">Admitting Doctor *</Label>
                  <Select
                    value={formData.admittingDoctorId}
                    onValueChange={(value) => handleChange("admittingDoctorId", value)}
                  >
                    <SelectTrigger id="admittingDoctor">
                      <SelectValue placeholder="Select doctor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DOC001">Dr. Smith (Cardiology)</SelectItem>
                      <SelectItem value="DOC002">Dr. Johnson (Surgery)</SelectItem>
                      <SelectItem value="DOC003">Dr. Williams (Internal Medicine)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department *</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleChange("department", value)}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">Cardiology</SelectItem>
                      <SelectItem value="surgery">Surgery</SelectItem>
                      <SelectItem value="internal-medicine">Internal Medicine</SelectItem>
                      <SelectItem value="orthopedics">Orthopedics</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bed Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>Bed Assignment</CardTitle>
              <CardDescription>Assign ward and bed</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ward">Ward *</Label>
                <Select value={formData.wardId} onValueChange={(value) => handleChange("wardId", value)}>
                  <SelectTrigger id="ward">
                    <SelectValue placeholder="Select ward" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ward-1">ICU Ward (2nd Floor)</SelectItem>
                    <SelectItem value="ward-2">General Ward A (3rd Floor)</SelectItem>
                    <SelectItem value="ward-3">Private Wing (4th Floor)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bed">Bed *</Label>
                <Select value={formData.bedId} onValueChange={(value) => handleChange("bedId", value)}>
                  <SelectTrigger id="bed">
                    <SelectValue placeholder="Select bed" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bed-1">ICU-101 (Available)</SelectItem>
                    <SelectItem value="bed-2">GEN-201 (Available)</SelectItem>
                    <SelectItem value="bed-3">PVT-301 (Available)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Information */}
          <Card>
            <CardHeader>
              <CardTitle>Insurance Information</CardTitle>
              <CardDescription>Patient insurance details (optional)</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insuranceProvider">Insurance Provider</Label>
                <Input
                  id="insuranceProvider"
                  placeholder="Provider name"
                  value={formData.insuranceProvider}
                  onChange={(e) => handleChange("insuranceProvider", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="policyNumber">Policy Number</Label>
                <Input
                  id="policyNumber"
                  placeholder="Policy number"
                  value={formData.policyNumber}
                  onChange={(e) => handleChange("policyNumber", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverage">Coverage Amount</Label>
                <Input
                  id="coverage"
                  type="number"
                  placeholder="Amount"
                  value={formData.coverage}
                  onChange={(e) => handleChange("coverage", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="notes"
                placeholder="Any additional information..."
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              Admit Patient
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
