"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Clock, Thermometer, Activity, Weight, Ruler } from "lucide-react";
import { visitSchema, VisitFormData } from "@/lib/validations/patient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface VisitRecordFormProps {
  onSubmit: (data: VisitFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<VisitFormData>;
  preSelectedPatientId?: string;
  preSelectedPatientName?: string;
  preSelectedAppointmentId?: string;
  isEditing?: boolean;
}

export function VisitRecordForm({
  onSubmit,
  onCancel,
  initialData,
  preSelectedPatientId,
  preSelectedPatientName,
  preSelectedAppointmentId,
  isEditing = false
}: VisitRecordFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<VisitFormData>({
    resolver: zodResolver(visitSchema),
    defaultValues: {
      ...initialData,
      patientId: preSelectedPatientId || initialData?.patientId || "",
      appointmentId: preSelectedAppointmentId || initialData?.appointmentId || "",
      visitDate: initialData?.visitDate || new Date(),
      visitTime: initialData?.visitTime || format(new Date(), "HH:mm"),
      vitals: {
        temperature: initialData?.vitals?.temperature,
        bloodPressure: initialData?.vitals?.bloodPressure || "",
        heartRate: initialData?.vitals?.heartRate,
        respiratoryRate: initialData?.vitals?.respiratoryRate,
        weight: initialData?.vitals?.weight,
        height: initialData?.vitals?.height,
      }
    }
  });

  const watchedVisitDate = watch("visitDate");

  const handleFormSubmit = async (data: VisitFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const visitTypes = [
    { value: "routine", label: "Routine Checkup" },
    { value: "emergency", label: "Emergency" },
    { value: "follow-up", label: "Follow-up" },
    { value: "consultation", label: "Consultation" }
  ];

  const departments = [
    "Cardiology",
    "Dermatology",
    "Emergency Medicine",
    "Endocrinology",
    "Gastroenterology",
    "General Medicine",
    "Neurology",
    "Oncology",
    "Orthopedics",
    "Pediatrics",
    "Psychiatry",
    "Radiology",
    "Surgery",
    "Urology"
  ];

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30"
  ];

  // Mock doctors data
  const doctors = [
    { id: "DOC001", name: "Dr. Sarah Johnson", department: "Cardiology" },
    { id: "DOC002", name: "Dr. Michael Chen", department: "General Medicine" },
    { id: "DOC003", name: "Dr. Emily Rodriguez", department: "Pediatrics" },
    { id: "DOC004", name: "Dr. David Wilson", department: "Orthopedics" },
    { id: "DOC005", name: "Dr. Lisa Thompson", department: "Dermatology" },
  ];

  // Mock patients data
  const patients = [
    { id: "PAT001", name: "John Smith" },
    { id: "PAT002", name: "Mary Johnson" },
    { id: "PAT003", name: "Robert Davis" },
    { id: "PAT004", name: "Sarah Wilson" },
    { id: "PAT005", name: "Michael Brown" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">{isEditing ? "Edit Visit Record" : "Record New Visit"}</h1>
        <p className="text-muted-foreground">
          {preSelectedPatientName 
            ? `Recording visit for ${preSelectedPatientName}`
            : "Document patient visit and medical information"
          }
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Visit Information */}
        <Card>
          <CardHeader>
            <CardTitle>Visit Information</CardTitle>
            <CardDescription>Basic visit details and scheduling information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Patient Selection */}
            {!preSelectedPatientId && (
              <div className="space-y-2">
                <Label>Patient *</Label>
                <Select 
                  onValueChange={(value) => {
                    setValue("patientId", value);
                    trigger("patientId");
                  }}
                  defaultValue={initialData?.patientId}
                >
                  <SelectTrigger className={errors.patientId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a patient" />
                  </SelectTrigger>
                  <SelectContent>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.name} ({patient.id})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.patientId && (
                  <p className="text-sm text-red-500">{errors.patientId.message}</p>
                )}
              </div>
            )}

            {preSelectedPatientId && (
              <input type="hidden" {...register("patientId")} value={preSelectedPatientId} />
            )}

            {/* Appointment ID (hidden if pre-selected) */}
            {preSelectedAppointmentId && (
              <input type="hidden" {...register("appointmentId")} value={preSelectedAppointmentId} />
            )}

            {/* Date and Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Visit Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watchedVisitDate && "text-muted-foreground",
                        errors.visitDate && "border-red-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchedVisitDate ? format(watchedVisitDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={watchedVisitDate}
                      onSelect={(date) => {
                        setValue("visitDate", date as Date);
                        trigger("visitDate");
                      }}
                      disabled={(date) => date > new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.visitDate && (
                  <p className="text-sm text-red-500">{errors.visitDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Visit Time *</Label>
                <Select 
                  onValueChange={(value) => {
                    setValue("visitTime", value);
                    trigger("visitTime");
                  }}
                  defaultValue={initialData?.visitTime}
                >
                  <SelectTrigger className={errors.visitTime ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((time) => (
                      <SelectItem key={time} value={time}>
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4" />
                          {time}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.visitTime && (
                  <p className="text-sm text-red-500">{errors.visitTime.message}</p>
                )}
              </div>
            </div>

            {/* Visit Type */}
            <div className="space-y-2">
              <Label>Visit Type *</Label>
              <Select 
                onValueChange={(value) => {
                  setValue("type", value as any);
                  trigger("type");
                }}
                defaultValue={initialData?.type}
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select visit type" />
                </SelectTrigger>
                <SelectContent>
                  {visitTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{errors.type.message}</p>
              )}
            </div>

            {/* Doctor and Department */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Doctor *</Label>
                <Select 
                  onValueChange={(value) => {
                    const doctor = doctors.find(d => d.id === value);
                    if (doctor) {
                      setValue("doctorId", doctor.id);
                      setValue("doctorName", doctor.name);
                      setValue("department", doctor.department);
                      trigger(["doctorId", "doctorName", "department"]);
                    }
                  }}
                  defaultValue={initialData?.doctorId}
                >
                  <SelectTrigger className={errors.doctorId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select a doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {doctor.name} - {doctor.department}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.doctorId && (
                  <p className="text-sm text-red-500">{errors.doctorId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Department *</Label>
                <Select 
                  onValueChange={(value) => {
                    setValue("department", value);
                    trigger("department");
                  }}
                  defaultValue={initialData?.department}
                >
                  <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm text-red-500">{errors.department.message}</p>
                )}
              </div>
            </div>

            {/* Hidden field for doctor name */}
            <input type="hidden" {...register("doctorName")} />
          </CardContent>
        </Card>

        {/* Medical Information */}
        <Card>
          <CardHeader>
            <CardTitle>Medical Information</CardTitle>
            <CardDescription>Patient complaints, diagnosis, and treatment details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Chief Complaint */}
            <div className="space-y-2">
              <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
              <Textarea
                id="chiefComplaint"
                {...register("chiefComplaint")}
                placeholder="Describe the patient's main concern or reason for the visit"
                rows={2}
                className={errors.chiefComplaint ? "border-red-500" : ""}
              />
              {errors.chiefComplaint && (
                <p className="text-sm text-red-500">{errors.chiefComplaint.message}</p>
              )}
            </div>

            {/* Diagnosis */}
            <div className="space-y-2">
              <Label htmlFor="diagnosis">Diagnosis</Label>
              <Textarea
                id="diagnosis"
                {...register("diagnosis")}
                placeholder="Enter the diagnosis or assessment"
                rows={2}
              />
            </div>

            {/* Treatment */}
            <div className="space-y-2">
              <Label htmlFor="treatment">Treatment</Label>
              <Textarea
                id="treatment"
                {...register("treatment")}
                placeholder="Describe the treatment provided or recommended"
                rows={3}
              />
            </div>

            {/* Prescriptions */}
            <div className="space-y-2">
              <Label htmlFor="prescriptions">Prescriptions</Label>
              <Textarea
                id="prescriptions"
                {...register("prescriptions")}
                placeholder="List any medications prescribed with dosage and instructions"
                rows={3}
              />
            </div>

            {/* Visit Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Any additional notes or observations about the visit"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Vital Signs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Vital Signs
            </CardTitle>
            <CardDescription>Record patient's vital signs during the visit</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Temperature */}
              <div className="space-y-2">
                <Label htmlFor="temperature" className="flex items-center gap-2">
                  <Thermometer className="h-4 w-4" />
                  Temperature (°F)
                </Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  {...register("vitals.temperature", { valueAsNumber: true })}
                  placeholder="98.6"
                />
              </div>

              {/* Blood Pressure */}
              <div className="space-y-2">
                <Label htmlFor="bloodPressure">Blood Pressure</Label>
                <Input
                  id="bloodPressure"
                  {...register("vitals.bloodPressure")}
                  placeholder="120/80"
                />
              </div>

              {/* Heart Rate */}
              <div className="space-y-2">
                <Label htmlFor="heartRate" className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Heart Rate (bpm)
                </Label>
                <Input
                  id="heartRate"
                  type="number"
                  {...register("vitals.heartRate", { valueAsNumber: true })}
                  placeholder="72"
                />
              </div>

              {/* Respiratory Rate */}
              <div className="space-y-2">
                <Label htmlFor="respiratoryRate">Respiratory Rate (bpm)</Label>
                <Input
                  id="respiratoryRate"
                  type="number"
                  {...register("vitals.respiratoryRate", { valueAsNumber: true })}
                  placeholder="16"
                />
              </div>

              {/* Weight */}
              <div className="space-y-2">
                <Label htmlFor="weight" className="flex items-center gap-2">
                  <Weight className="h-4 w-4" />
                  Weight (lbs)
                </Label>
                <Input
                  id="weight"
                  type="number"
                  step="0.1"
                  {...register("vitals.weight", { valueAsNumber: true })}
                  placeholder="150.5"
                />
              </div>

              {/* Height */}
              <div className="space-y-2">
                <Label htmlFor="height" className="flex items-center gap-2">
                  <Ruler className="h-4 w-4" />
                  Height (inches)
                </Label>
                <Input
                  id="height"
                  type="number"
                  step="0.1"
                  {...register("vitals.height", { valueAsNumber: true })}
                  placeholder="70"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : isEditing ? "Update Visit" : "Save Visit Record"}
          </Button>
        </div>
      </form>
    </div>
  );
}