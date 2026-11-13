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
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { INPATIENT_KM } from "@/features/nursing/inpatient/km";

interface PatientAdmissionProps {
  onAdmissionComplete?: (admission: any) => void;
}

export function PatientAdmission({ onAdmissionComplete }: PatientAdmissionProps) {
  const tAny = useTranslateAny(INPATIENT_KM);
  const t = useT(INPATIENT_KM);
  const fmt = useDateFormat();
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
        <h2 className="text-2xl font-bold">{t("Patient Admission")}</h2>
        <p className="text-muted-foreground">{t("Register new patient admission")}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Patient Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Patient Information")}</CardTitle>
              <CardDescription>{t("Select patient and admission details")}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="patientId">{t("Patient *")}</Label>
                <Select
                  value={formData.patientId}
                  onValueChange={(value) => handleChange("patientId", value)}
                >
                  <SelectTrigger id="patientId">
                    <SelectValue placeholder={t("Select patient")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PT-000001">សុខ ដារ៉ា · SOK Dara (PT-000001)</SelectItem>
                    <SelectItem value="PT-000002">ចាន់ ស្រីមុំ · CHAN Sreymom (PT-000002)</SelectItem>
                    <SelectItem value="PT-000003">គីម សុខា · KIM Sokha (PT-000003)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admissionDate">{t("Admission Date *")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="admissionDate"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {admissionDate ? fmt(admissionDate, "PPP") : t("Select date")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={admissionDate} onSelect={(date) => date && setAdmissionDate(date)} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="admissionType">{t("Admission Type *")}</Label>
                <Select
                  value={formData.admissionType}
                  onValueChange={(value) => handleChange("admissionType", value)}
                >
                  <SelectTrigger id="admissionType">
                    <SelectValue placeholder={t("Select type")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="emergency">{t("Emergency")}</SelectItem>
                    <SelectItem value="elective">{t("Elective")}</SelectItem>
                    <SelectItem value="transfer">{t("Transfer")}</SelectItem>
                    <SelectItem value="delivery">{t("Delivery")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedDuration">{t("Estimated Duration (days)")}</Label>
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
              <CardTitle>{t("Medical Information")}</CardTitle>
              <CardDescription>{t("Diagnosis and medical details")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="chiefComplaint">{t("Chief Complaint *")}</Label>
                <Textarea
                  id="chiefComplaint"
                  placeholder={t("Primary reason for admission")}
                  value={formData.chiefComplaint}
                  onChange={(e) => handleChange("chiefComplaint", e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="diagnosis">{t("Provisional Diagnosis *")}</Label>
                <Textarea
                  id="diagnosis"
                  placeholder={t("Enter diagnosis")}
                  value={formData.diagnosis}
                  onChange={(e) => handleChange("diagnosis", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="admittingDoctor">{t("Admitting Doctor *")}</Label>
                  <Select
                    value={formData.admittingDoctorId}
                    onValueChange={(value) => handleChange("admittingDoctorId", value)}
                  >
                    <SelectTrigger id="admittingDoctor">
                      <SelectValue placeholder={t("Select doctor")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DOC001">Dr. Nhem Rithy ({tAny("Cardiology")})</SelectItem>
                      <SelectItem value="DOC002">Dr. Chea Sovann ({tAny("General Surgery")})</SelectItem>
                      <SelectItem value="DOC003">Dr. Lim Pisey ({tAny("Internal Medicine")})</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">{t("Department *")}</Label>
                  <Select
                    value={formData.department}
                    onValueChange={(value) => handleChange("department", value)}
                  >
                    <SelectTrigger id="department">
                      <SelectValue placeholder={t("Select department")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cardiology">{t("Cardiology")}</SelectItem>
                      <SelectItem value="surgery">{t("Surgery")}</SelectItem>
                      <SelectItem value="internal-medicine">{t("Internal Medicine")}</SelectItem>
                      <SelectItem value="orthopedics">{t("Orthopedics")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bed Assignment */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Bed Assignment")}</CardTitle>
              <CardDescription>{t("Assign ward and bed")}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ward">{t("Ward *")}</Label>
                <Select value={formData.wardId} onValueChange={(value) => handleChange("wardId", value)}>
                  <SelectTrigger id="ward">
                    <SelectValue placeholder={t("Select ward")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ward-1">{t("ICU Ward (2nd Floor)")}</SelectItem>
                    <SelectItem value="ward-2">{t("General Ward A (3rd Floor)")}</SelectItem>
                    <SelectItem value="ward-3">{t("Private Wing (4th Floor)")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bed">{t("Bed *")}</Label>
                <Select value={formData.bedId} onValueChange={(value) => handleChange("bedId", value)}>
                  <SelectTrigger id="bed">
                    <SelectValue placeholder={t("Select bed")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bed-1">{t("ICU-101 (Available)")}</SelectItem>
                    <SelectItem value="bed-2">{t("GEN-201 (Available)")}</SelectItem>
                    <SelectItem value="bed-3">{t("PVT-301 (Available)")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Insurance Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Insurance Information")}</CardTitle>
              <CardDescription>{t("Patient insurance details (optional)")}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insuranceProvider">{t("Insurance Provider")}</Label>
                <Input
                  id="insuranceProvider"
                  placeholder={t("Provider name")}
                  value={formData.insuranceProvider}
                  onChange={(e) => handleChange("insuranceProvider", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="policyNumber">{t("Policy Number")}</Label>
                <Input
                  id="policyNumber"
                  placeholder={t("Policy number")}
                  value={formData.policyNumber}
                  onChange={(e) => handleChange("policyNumber", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="coverage">{t("Coverage Amount")}</Label>
                <Input
                  id="coverage"
                  type="number"
                  placeholder={t("Amount")}
                  value={formData.coverage}
                  onChange={(e) => handleChange("coverage", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Additional Notes")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="notes"
                placeholder={t("Any additional information...")}
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline">
              {t("Cancel")}
            </Button>
            <Button type="submit">
              <Plus className="mr-2 h-4 w-4" />
              {t("Admit Patient")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
