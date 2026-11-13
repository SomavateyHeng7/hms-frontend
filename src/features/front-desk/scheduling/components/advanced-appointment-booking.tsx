"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, startOfDay, isSameDay, isAfter, isBefore } from "date-fns";
import { CalendarIcon, Clock, Video, Phone, Mail, AlertTriangle, CreditCard } from "lucide-react";
import { appointmentBookingSchema, AppointmentBookingFormData } from "@/features/front-desk/scheduling/validations";
import { Doctor, Department, AppointmentSlot } from "@/features/front-desk/scheduling/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { SCHEDULING_KM } from "@/features/front-desk/scheduling/km";

interface AdvancedAppointmentBookingProps {
  onSubmit: (data: AppointmentBookingFormData) => void;
  onCancel?: () => void;
  doctors: Doctor[];
  departments: Department[];
  availableSlots: AppointmentSlot[];
  preSelectedPatientId?: string;
  preSelectedPatientName?: string;
  initialData?: Partial<AppointmentBookingFormData>;
  isEditing?: boolean;
}

export function AdvancedAppointmentBooking({
  onSubmit,
  onCancel,
  doctors,
  departments,
  availableSlots,
  preSelectedPatientId,
  preSelectedPatientName,
  initialData,
  isEditing = false
}: AdvancedAppointmentBookingProps) {
  const tAny = useTranslateAny(SCHEDULING_KM);
  const t = useT(SCHEDULING_KM);
  const fmt = useDateFormat();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialData?.appointmentDate);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(initialData?.departmentId || "");
  const [selectedDoctor, setSelectedDoctor] = useState<string>(initialData?.doctorId || "");
  const [availableTimeSlots, setAvailableTimeSlots] = useState<AppointmentSlot[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<AppointmentSlot | null>(null);
  const [isTelemedicine, setIsTelemedicine] = useState(initialData?.isTelemedicine || false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger,
    reset
  } = useForm<AppointmentBookingFormData>({
    resolver: zodResolver(appointmentBookingSchema),
    defaultValues: {
      ...initialData,
      patientId: preSelectedPatientId || initialData?.patientId || "",
      isTelemedicine: false,
      reminderPreferences: {
        sms: true,
        email: true,
        push: false,
        reminderTimes: [1440, 60], // 24 hours and 1 hour before
      }
    }
  });

  const watchedDepartment = watch("departmentId");
  const watchedDoctor = watch("doctorId");

  // Filter doctors by selected department
  const filteredDoctors = selectedDepartment
    ? doctors.filter(doctor => doctor.department === departments.find(d => d.id === selectedDepartment)?.name)
    : doctors;

  // Filter available slots based on selected date, department, and doctor
  useEffect(() => {
    if (selectedDate && selectedDepartment && selectedDoctor) {
      const daySlots = availableSlots.filter(slot =>
        isSameDay(slot.date, selectedDate) &&
        slot.departmentId === selectedDepartment &&
        slot.doctorId === selectedDoctor &&
        slot.isAvailable &&
        slot.currentAppointments < slot.maxAppointments
      );
      setAvailableTimeSlots(daySlots);
    } else {
      setAvailableTimeSlots([]);
    }
  }, [selectedDate, selectedDepartment, selectedDoctor, availableSlots]);

  const handleFormSubmit = async (data: AppointmentBookingFormData) => {
    setIsSubmitting(true);
    try {
      // Add selected slot information
      if (selectedSlot) {
        data.slotId = selectedSlot.id;
      }
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDepartmentChange = (departmentId: string) => {
    setSelectedDepartment(departmentId);
    setSelectedDoctor("");
    setSelectedDate(undefined);
    setSelectedSlot(null);
    setValue("departmentId", departmentId);
    setValue("doctorId", "");
    setValue("slotId", "");
  };

  const handleDoctorChange = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      setSelectedDoctor(doctorId);
      setSelectedDate(undefined);
      setSelectedSlot(null);
      setValue("doctorId", doctorId);
      setValue("slotId", "");
      
      // Check if doctor supports telemedicine
      if (!doctor.telemedicineEnabled && isTelemedicine) {
        setIsTelemedicine(false);
        setValue("isTelemedicine", false);
        setValue("type", "consultation");
      }
    }
  };

  const handleSlotSelection = (slot: AppointmentSlot) => {
    setSelectedSlot(slot);
    setValue("slotId", slot.id);
    setValue("appointmentTime", slot.startTime);
    setValue("duration", 30); // Default duration, can be customized
    
    // Set appointment type based on slot type
    if (slot.appointmentType) {
      setValue("type", slot.appointmentType);
    }
  };

  const appointmentTypes = [
    { value: "consultation", label: t("Consultation") },
    { value: "follow-up", label: t("Follow-up") },
    { value: "surgery", label: t("Surgery") },
    { value: "test", label: t("Test/Lab") },
    { value: "emergency", label: t("Emergency") },
    { value: "telemedicine", label: t("Telemedicine") }
  ];

  const reminderOptions = [
    { value: 10, label: t("10 minutes before") },
    { value: 30, label: t("30 minutes before") },
    { value: 60, label: t("1 hour before") },
    { value: 1440, label: t("24 hours before") },
    { value: 2880, label: t("2 days before") },
    { value: 10080, label: t("1 week before") }
  ];

  // Mock patients data
  const patients = [
    { id: "PAT001", name: "Sok Dara" },
    { id: "PAT002", name: "Heng Sopheap" },
    { id: "PAT003", name: "Kim Sokha" },
    { id: "PAT004", name: "Mao Chenda" },
    { id: "PAT005", name: "Long Vannak" },
  ];

  const getSlotTypeColor = (type: string) => {
    switch (type) {
      case "consultation":
        return "bg-blue-100 text-blue-800";
      case "surgery":
        return "bg-red-100 text-red-800";
      case "emergency":
        return "bg-orange-100 text-orange-800";
      case "telemedicine":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">
          {isEditing ? t("Edit Appointment") : t("Book New Appointment")}
        </h1>
        <p className="text-muted-foreground">
          {preSelectedPatientName 
            ? t("Booking appointment for {preSelectedPatientName}", { preSelectedPatientName: preSelectedPatientName })
            : t("Schedule a new appointment with comprehensive options")
          }
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Patient Information")}</CardTitle>
            <CardDescription>{t("Select the patient for this appointment")}</CardDescription>
          </CardHeader>
          <CardContent>
            {!preSelectedPatientId ? (
              <div className="space-y-2">
                <Label>{t("Patient *")}</Label>
                <Select onValueChange={(value) => setValue("patientId", value)}>
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
            ) : (
              <>
                <input type="hidden" {...register("patientId")} value={preSelectedPatientId} />
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium">{t("Patient: {preSelectedPatientName}", { preSelectedPatientName: preSelectedPatientName })}</p>
                  <p className="text-sm text-muted-foreground">{t("ID: {preSelectedPatientId}", { preSelectedPatientId: preSelectedPatientId })}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Department and Doctor Selection */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Healthcare Provider")}</CardTitle>
            <CardDescription>{t("Select department and doctor for the appointment")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("Department *")}</Label>
                <Select onValueChange={handleDepartmentChange} value={selectedDepartment}>
                  <SelectTrigger className={errors.departmentId ? "border-red-500" : ""}>
                    <SelectValue placeholder={t("Select department")} />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        <div className="flex flex-col">
                          <span>{dept.name}</span>
                          <span className="text-xs text-muted-foreground">{dept.location}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.departmentId && (
                  <p className="text-sm text-red-500">{tAny(errors.departmentId.message)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("Doctor *")}</Label>
                <Select onValueChange={handleDoctorChange} value={selectedDoctor} disabled={!selectedDepartment}>
                  <SelectTrigger className={errors.doctorId ? "border-red-500" : ""}>
                    <SelectValue placeholder={t("Select doctor")} />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex flex-col">
                          <span>{t("Dr. {firstName} {lastName}", { firstName: doctor.firstName, lastName: doctor.lastName })}</span>
                          <span className="text-xs text-muted-foreground">
                            {tAny(doctor.specialization)} • ${doctor.consultationFee}
                            {doctor.telemedicineEnabled && t("• Telemedicine available")}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.doctorId && (
                  <p className="text-sm text-red-500">{tAny(errors.doctorId.message)}</p>
                )}
              </div>
            </div>

            {/* Doctor Information Display */}
            {selectedDoctor && (
              <div className="p-4 bg-muted/50 rounded-lg">
                {(() => {
                  const doctor = doctors.find(d => d.id === selectedDoctor);
                  if (!doctor) return null;
                  return (
                    <div className="space-y-2">
                      <h4 className="font-medium">{t("Dr. {firstName} {lastName}", { firstName: doctor.firstName, lastName: doctor.lastName })}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>{t("Specialization: {specialization}", { specialization: tAny(doctor.specialization) })}</div>
                        <div>{t("Experience: {experience} years", { experience: doctor.experience })}</div>
                        <div>{t("Consultation Fee: ${consultationFee}", { consultationFee: doctor.consultationFee })}</div>
                        <div className="flex gap-2 flex-wrap">
                          {doctor.telemedicineEnabled && (
                            <Badge variant="outline">
                              <Video className="mr-1 h-3 w-3" />
                              {t("Telemedicine")}
                            </Badge>
                          )}
                          <Badge variant="outline">{t("Available")}</Badge>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Appointment Type and Telemedicine */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Appointment Type")}</CardTitle>
            <CardDescription>{t("Select the type of appointment and delivery method")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("Appointment Type *")}</Label>
                <Select onValueChange={(value) => setValue("type", value as any)}>
                  <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder={t("Select appointment type")} />
                  </SelectTrigger>
                  <SelectContent>
                    {appointmentTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {tAny(type.label)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{tAny(errors.type.message)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("Delivery Method")}</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="telemedicine"
                    checked={isTelemedicine}
                    onCheckedChange={(checked) => {
                      setIsTelemedicine(checked as boolean);
                      setValue("isTelemedicine", checked as boolean);
                      if (checked) {
                        setValue("type", "telemedicine");
                      }
                    }}
                    disabled={!!selectedDoctor && !doctors.find(d => d.id === selectedDoctor)?.telemedicineEnabled}
                  />
                  <Label htmlFor="telemedicine" className="flex items-center gap-2">
                    <Video className="h-4 w-4" />
                    {t("Telemedicine (Virtual Consultation)")}
                  </Label>
                </div>
                {selectedDoctor && !doctors.find(d => d.id === selectedDoctor)?.telemedicineEnabled && isTelemedicine && (
                  <p className="text-sm text-orange-600">
                    {t("This doctor does not support telemedicine appointments")}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date and Time Selection */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Schedule")}</CardTitle>
            <CardDescription>{t("Select your preferred date and time slot")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label>{t("Appointment Date *")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground",
                        errors.appointmentDate && "border-red-500"
                      )}
                      disabled={!selectedDoctor}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? fmt(selectedDate, "PPP") : t("Pick a date")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => {
                        setSelectedDate(date);
                        setValue("appointmentDate", date as Date);
                        setSelectedSlot(null);
                        setValue("slotId", "");
                        trigger("appointmentDate");
                      }}
                      disabled={(date) => 
                        date < startOfDay(new Date()) || 
                        date > addDays(new Date(), 90) // Allow booking up to 90 days in advance
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {errors.appointmentDate && (
                  <p className="text-sm text-red-500">{tAny(errors.appointmentDate.message)}</p>
                )}
              </div>

              {/* Available Time Slots */}
              <div className="space-y-2">
                <Label>{t("Available Time Slots")}</Label>
                {!selectedDate || !selectedDoctor ? (
                  <div className="p-4 border rounded-lg text-center text-muted-foreground">
                    {t("Please select a doctor and date to view available slots")}
                  </div>
                ) : availableTimeSlots.length === 0 ? (
                  <div className="p-4 border rounded-lg text-center text-muted-foreground">
                    {t("No available slots for the selected date")}
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableTimeSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-colors hover:bg-muted",
                          selectedSlot?.id === slot.id && "border-blue-500 bg-blue-50"
                        )}
                        onClick={() => handleSlotSelection(slot)}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {slot.startTime} - {slot.endTime}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {t("{value} slots available", { value: slot.maxAppointments - slot.currentAppointments })}</div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={getSlotTypeColor(slot.appointmentType)}>
                              {slot.appointmentType}
                            </Badge>
                            <div className="text-sm font-medium">${slot.consultationFee}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {errors.slotId && (
                  <p className="text-sm text-red-500">{t("Please select a time slot")}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <CardTitle>{t("Appointment Details")}</CardTitle>
            <CardDescription>{t("Provide reason for visit and additional information")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="notes">{t("Additional Notes")}</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder={t("Any additional notes or special requirements")}
                rows={2}
              />
            </div>

            {/* Emergency Contact (for surgery or high-risk appointments) */}
            <div className="space-y-4">
              <Label className="text-base font-medium">{t("Emergency Contact (Optional)")}</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">{t("Contact Name")}</Label>
                  <Input
                    id="emergencyContactName"
                    {...register("emergencyContact.name")}
                    placeholder={t("Emergency contact name")}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">{t("Contact Phone")}</Label>
                  <Input
                    id="emergencyContactPhone"
                    {...register("emergencyContact.phone")}
                    placeholder={t("Emergency contact phone")}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Reminder Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              {t("Reminder Preferences")}
            </CardTitle>
            <CardDescription>{t("Configure how you'd like to receive appointment reminders")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">{t("Reminder Methods")}</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smsReminder"
                      {...register("reminderPreferences.sms")}
                    />
                    <Label htmlFor="smsReminder" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {t("SMS Text Message")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailReminder"
                      {...register("reminderPreferences.email")}
                    />
                    <Label htmlFor="emailReminder" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {t("Email")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pushReminder"
                      {...register("reminderPreferences.push")}
                    />
                    <Label htmlFor="pushReminder" className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      {t("Push Notification")}
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">{t("Reminder Schedule")}</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {reminderOptions.map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <Checkbox
                        id={`reminder-${option.value}`}
                        value={option.value}
                        // This would need custom handling for array values
                      />
                      <Label htmlFor={`reminder-${option.value}`} className="text-sm">
                        {option.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        {selectedSlot && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                {t("Payment Summary")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{t("Consultation Fee:")}</span>
                  <span>${selectedSlot.consultationFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t("Booking Fee:")}</span>
                  <span>$5.00</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold">
                  <span>{t("Total:")}</span>
                  <span>${selectedSlot.consultationFee + 5}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-4">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              {t("Cancel")}
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || !selectedSlot}>
            {isSubmitting ? t("Booking...") : isEditing ? t("Update Appointment") : t("Book Appointment")}
          </Button>
        </div>
      </form>
    </div>
  );
}