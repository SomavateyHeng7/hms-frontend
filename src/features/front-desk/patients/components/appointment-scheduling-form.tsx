"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, Clock } from "lucide-react";
import { appointmentSchema, AppointmentFormData } from "@/features/front-desk/patients/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useT, useTranslateAny } from "@/lib/i18n/messages";
import { PATIENTS_KM } from "../km";

interface AppointmentSchedulingFormProps {
  onSubmit: (data: AppointmentFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<AppointmentFormData>;
  preSelectedPatientId?: string;
  preSelectedPatientName?: string;
  isEditing?: boolean;
}

export function AppointmentSchedulingForm({
  onSubmit,
  onCancel,
  initialData,
  preSelectedPatientId,
  preSelectedPatientName,
  isEditing = false
}: AppointmentSchedulingFormProps) {
  const t = useT(PATIENTS_KM);
  const tAny = useTranslateAny(PATIENTS_KM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      ...initialData,
      patientId: preSelectedPatientId || initialData?.patientId || "",
      duration: initialData?.duration || 30,
    }
  });

  const watchedAppointmentDate = watch("appointmentDate");

  const handleFormSubmit = async (data: AppointmentFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const appointmentTypes = [
    { value: "consultation", label: t("Consultation") },
    { value: "follow-up", label: t("Follow-up") },
    { value: "surgery", label: t("Surgery") },
    { value: "test", label: t("Test/Lab") },
    { value: "emergency", label: t("Emergency") }
  ];

  const departments = [
    "Cardiology",
    "Dermatology", 
    "Emergency Medicine",
    "Endocrinology",
    "Gastroenterology",
    "General Medicine",
    "Neurology",
    "Obstetrics & Gynecology",
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

  const durations = [
    { value: 15, label: t("15 minutes") },
    { value: 30, label: t("30 minutes") },
    { value: 45, label: t("45 minutes") },
    { value: 60, label: t("1 hour") },
    { value: 90, label: t("1.5 hours") },
    { value: 120, label: t("2 hours") }
  ];

  // Mock doctors data - in real app, this would come from API
  const doctors = [
    { id: "DOC001", name: "Dr. Chea Sovann", department: "General Medicine" },
    { id: "DOC002", name: "Dr. Lim Pisey", department: "Pediatrics" },
    { id: "DOC003", name: "Dr. Nhem Rithy", department: "Cardiology" },
    { id: "DOC004", name: "Dr. Ouk Sreyneang", department: "Obstetrics & Gynecology" },
    { id: "DOC005", name: "Dr. Pich Sokunthea", department: "Orthopedics" },
  ];

  // Mock patients data - in real app, this would come from API
  const patients = [
    { id: "PT-000001", name: "សុខ ដារ៉ា · SOK Dara" },
    { id: "PT-000002", name: "ចាន់ ស្រីមុំ · CHAN Sreymom" },
    { id: "PT-000003", name: "គីម សុខា · KIM Sokha" },
    { id: "PT-000004", name: "ហេង សុភាព · HENG Sopheap" },
    { id: "PT-000005", name: "ឡុង វណ្ណៈ · LONG Vannak" },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{isEditing ? t("Edit Appointment") : t("Schedule New Appointment")}</CardTitle>
        <CardDescription>
          {preSelectedPatientName 
            ? t("Scheduling appointment for {name}", { name: preSelectedPatientName })
            : t("Fill in the appointment details below")
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          {/* Patient Selection */}
          {!preSelectedPatientId && (
            <div className="space-y-2">
              <Label>{t("Patient *")}</Label>
              <Select 
                onValueChange={(value) => {
                  setValue("patientId", value);
                  trigger("patientId");
                }}
                defaultValue={initialData?.patientId}
              >
                <SelectTrigger className={errors.patientId ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("Select a patient")} />
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
                <p className="text-sm text-red-500">{tAny(errors.patientId.message)}</p>
              )}
            </div>
          )}

          {preSelectedPatientId && (
            <input type="hidden" {...register("patientId")} value={preSelectedPatientId} />
          )}

          {/* Doctor and Department Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("Doctor *")}</Label>
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
                  <SelectValue placeholder={t("Select a doctor")} />
                </SelectTrigger>
                <SelectContent>
                  {doctors.map((doctor) => (
                    <SelectItem key={doctor.id} value={doctor.id}>
                      {doctor.name} - {tAny(doctor.department)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.doctorId && (
                <p className="text-sm text-red-500">{tAny(errors.doctorId.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("Department *")}</Label>
              <Select 
                onValueChange={(value) => {
                  setValue("department", value);
                  trigger("department");
                }}
                defaultValue={initialData?.department}
              >
                <SelectTrigger className={errors.department ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("Select department")} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {tAny(dept)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.department && (
                <p className="text-sm text-red-500">{tAny(errors.department.message)}</p>
              )}
            </div>
          </div>

          {/* Date and Time Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>{t("Appointment Date *")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchedAppointmentDate && "text-muted-foreground",
                      errors.appointmentDate && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedAppointmentDate ? format(watchedAppointmentDate, "PPP") : t("Pick a date")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watchedAppointmentDate}
                    onSelect={(date) => {
                      setValue("appointmentDate", date as Date);
                      trigger("appointmentDate");
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.appointmentDate && (
                <p className="text-sm text-red-500">{tAny(errors.appointmentDate.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("Appointment Time *")}</Label>
              <Select 
                onValueChange={(value) => {
                  setValue("appointmentTime", value);
                  trigger("appointmentTime");
                }}
                defaultValue={initialData?.appointmentTime}
              >
                <SelectTrigger className={errors.appointmentTime ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("Select time")} />
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
              {errors.appointmentTime && (
                <p className="text-sm text-red-500">{tAny(errors.appointmentTime.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>{t("Duration *")}</Label>
              <Select 
                onValueChange={(value) => {
                  setValue("duration", parseInt(value));
                  trigger("duration");
                }}
                defaultValue={initialData?.duration?.toString() || "30"}
              >
                <SelectTrigger className={errors.duration ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("Select duration")} />
                </SelectTrigger>
                <SelectContent>
                  {durations.map((duration) => (
                    <SelectItem key={duration.value} value={duration.value.toString()}>
                      {duration.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.duration && (
                <p className="text-sm text-red-500">{tAny(errors.duration.message)}</p>
              )}
            </div>
          </div>

          {/* Appointment Type and Room */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t("Appointment Type *")}</Label>
              <Select 
                onValueChange={(value) => {
                  setValue("type", value as AppointmentFormData["type"]);
                  trigger("type");
                }}
                defaultValue={initialData?.type}
              >
                <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                  <SelectValue placeholder={t("Select appointment type")} />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-red-500">{tAny(errors.type.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomNumber">{t("Room Number")}</Label>
              <Input
                id="roomNumber"
                {...register("roomNumber")}
                placeholder={t("Enter room number (optional)")}
              />
            </div>
          </div>

          {/* Reason for Appointment */}
          <div className="space-y-2">
            <Label htmlFor="reason">{t("Reason for Appointment *")}</Label>
            <Textarea
              id="reason"
              {...register("reason")}
              placeholder={t("Describe the reason for this appointment")}
              rows={3}
              className={errors.reason ? "border-red-500" : ""}
            />
            {errors.reason && (
              <p className="text-sm text-red-500">{tAny(errors.reason.message)}</p>
            )}
          </div>

          {/* Additional Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">{t("Additional Notes")}</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder={t("Any additional notes or special instructions")}
              rows={2}
            />
          </div>

          {/* Hidden fields for doctor name (will be set by doctor selection) */}
          <input type="hidden" {...register("doctorName")} />

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-4">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                {t("Cancel")}
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? t("Saving...") : isEditing ? t("Update Appointment") : t("Schedule Appointment")}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}