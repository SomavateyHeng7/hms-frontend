"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays, startOfDay, isSameDay, isAfter, isBefore } from "date-fns";
import { CalendarIcon, Clock, Video, Phone, Mail, AlertTriangle, CreditCard } from "lucide-react";
import { appointmentBookingSchema, AppointmentBookingFormData } from "@/lib/validations/scheduling";
import { Doctor, Department, AppointmentSlot } from "@/types/scheduling";
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
    { value: "consultation", label: "Consultation" },
    { value: "follow-up", label: "Follow-up" },
    { value: "surgery", label: "Surgery" },
    { value: "test", label: "Test/Lab" },
    { value: "emergency", label: "Emergency" },
    { value: "telemedicine", label: "Telemedicine" }
  ];

  const reminderOptions = [
    { value: 10, label: "10 minutes before" },
    { value: 30, label: "30 minutes before" },
    { value: 60, label: "1 hour before" },
    { value: 1440, label: "24 hours before" },
    { value: 2880, label: "2 days before" },
    { value: 10080, label: "1 week before" }
  ];

  // Mock patients data
  const patients = [
    { id: "PAT001", name: "John Smith" },
    { id: "PAT002", name: "Mary Johnson" },
    { id: "PAT003", name: "Robert Davis" },
    { id: "PAT004", name: "Sarah Wilson" },
    { id: "PAT005", name: "Michael Brown" },
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
          {isEditing ? "Edit Appointment" : "Book New Appointment"}
        </h1>
        <p className="text-muted-foreground">
          {preSelectedPatientName 
            ? `Booking appointment for ${preSelectedPatientName}`
            : "Schedule a new appointment with comprehensive options"
          }
        </p>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Patient Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Select the patient for this appointment</CardDescription>
          </CardHeader>
          <CardContent>
            {!preSelectedPatientId ? (
              <div className="space-y-2">
                <Label>Patient *</Label>
                <Select onValueChange={(value) => setValue("patientId", value)}>
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
            ) : (
              <>
                <input type="hidden" {...register("patientId")} value={preSelectedPatientId} />
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium">Patient: {preSelectedPatientName}</p>
                  <p className="text-sm text-muted-foreground">ID: {preSelectedPatientId}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Department and Doctor Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Healthcare Provider</CardTitle>
            <CardDescription>Select department and doctor for the appointment</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select onValueChange={handleDepartmentChange} value={selectedDepartment}>
                  <SelectTrigger className={errors.departmentId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select department" />
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
                  <p className="text-sm text-red-500">{errors.departmentId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Doctor *</Label>
                <Select onValueChange={handleDoctorChange} value={selectedDoctor} disabled={!selectedDepartment}>
                  <SelectTrigger className={errors.doctorId ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredDoctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        <div className="flex flex-col">
                          <span>Dr. {doctor.firstName} {doctor.lastName}</span>
                          <span className="text-xs text-muted-foreground">
                            {doctor.specialization} • ${doctor.consultationFee}
                            {doctor.telemedicineEnabled && " • Telemedicine available"}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.doctorId && (
                  <p className="text-sm text-red-500">{errors.doctorId.message}</p>
                )}
              </div>
            </div>

            {/* Doctor Information Display */}
            {selectedDoctor && (
              <div className="p-4 bg-gray-50 rounded-lg">
                {(() => {
                  const doctor = doctors.find(d => d.id === selectedDoctor);
                  if (!doctor) return null;
                  return (
                    <div className="space-y-2">
                      <h4 className="font-medium">Dr. {doctor.firstName} {doctor.lastName}</h4>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div>Specialization: {doctor.specialization}</div>
                        <div>Experience: {doctor.experience} years</div>
                        <div>Consultation Fee: ${doctor.consultationFee}</div>
                        <div className="flex gap-2 flex-wrap">
                          {doctor.telemedicineEnabled && (
                            <Badge variant="outline">
                              <Video className="mr-1 h-3 w-3" />
                              Telemedicine
                            </Badge>
                          )}
                          <Badge variant="outline">Available</Badge>
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
            <CardTitle>Appointment Type</CardTitle>
            <CardDescription>Select the type of appointment and delivery method</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Appointment Type *</Label>
                <Select onValueChange={(value) => setValue("type", value as any)}>
                  <SelectTrigger className={errors.type ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select appointment type" />
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
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Delivery Method</Label>
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
                    Telemedicine (Virtual Consultation)
                  </Label>
                </div>
                {selectedDoctor && !doctors.find(d => d.id === selectedDoctor)?.telemedicineEnabled && isTelemedicine && (
                  <p className="text-sm text-orange-600">
                    This doctor does not support telemedicine appointments
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date and Time Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Schedule</CardTitle>
            <CardDescription>Select your preferred date and time slot</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Appointment Date *</Label>
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
                      {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
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
                  <p className="text-sm text-red-500">{errors.appointmentDate.message}</p>
                )}
              </div>

              {/* Available Time Slots */}
              <div className="space-y-2">
                <Label>Available Time Slots</Label>
                {!selectedDate || !selectedDoctor ? (
                  <div className="p-4 border rounded-lg text-center text-muted-foreground">
                    Please select a doctor and date to view available slots
                  </div>
                ) : availableTimeSlots.length === 0 ? (
                  <div className="p-4 border rounded-lg text-center text-muted-foreground">
                    No available slots for the selected date
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {availableTimeSlots.map((slot) => (
                      <div
                        key={slot.id}
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50",
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
                              {slot.maxAppointments - slot.currentAppointments} slots available
                            </div>
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
                  <p className="text-sm text-red-500">Please select a time slot</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
            <CardDescription>Provide reason for visit and additional information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Appointment *</Label>
              <Textarea
                id="reason"
                {...register("reason")}
                placeholder="Describe the reason for this appointment"
                rows={3}
                className={errors.reason ? "border-red-500" : ""}
              />
              {errors.reason && (
                <p className="text-sm text-red-500">{errors.reason.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Any additional notes or special requirements"
                rows={2}
              />
            </div>

            {/* Emergency Contact (for surgery or high-risk appointments) */}
            <div className="space-y-4">
              <Label className="text-base font-medium">Emergency Contact (Optional)</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Contact Name</Label>
                  <Input
                    id="emergencyContactName"
                    {...register("emergencyContact.name")}
                    placeholder="Emergency contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                  <Input
                    id="emergencyContactPhone"
                    {...register("emergencyContact.phone")}
                    placeholder="Emergency contact phone"
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
              Reminder Preferences
            </CardTitle>
            <CardDescription>Configure how you'd like to receive appointment reminders</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-base font-medium">Reminder Methods</Label>
                <div className="space-y-2 mt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="smsReminder"
                      {...register("reminderPreferences.sms")}
                    />
                    <Label htmlFor="smsReminder" className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      SMS Text Message
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emailReminder"
                      {...register("reminderPreferences.email")}
                    />
                    <Label htmlFor="emailReminder" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="pushReminder"
                      {...register("reminderPreferences.push")}
                    />
                    <Label htmlFor="pushReminder" className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Push Notification
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-base font-medium">Reminder Schedule</Label>
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
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Consultation Fee:</span>
                  <span>${selectedSlot.consultationFee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Booking Fee:</span>
                  <span>$5.00</span>
                </div>
                <hr />
                <div className="flex justify-between font-bold">
                  <span>Total:</span>
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
              Cancel
            </Button>
          )}
          <Button type="submit" disabled={isSubmitting || !selectedSlot}>
            {isSubmitting ? "Booking..." : isEditing ? "Update Appointment" : "Book Appointment"}
          </Button>
        </div>
      </form>
    </div>
  );
}