"use client";

import { useState } from "react";
import { Calendar, Clock, User, MapPin, Search, Plus, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import type { ImagingAppointment, ImagingEquipment } from "@/features/diagnostics/radiology/types";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { imagingScheduleSchema, type ImagingScheduleFormData } from "@/features/diagnostics/radiology/validations";
import { addDays, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { RADIOLOGY_KM } from "@/features/diagnostics/radiology/km";

interface RadiologySchedulingProps {
  schedules: ImagingAppointment[];
  equipment: ImagingEquipment[];
  technologists: { id: string; name: string; certifications: string[]; shift: string }[];
  onCreateSchedule: (data: ImagingScheduleFormData) => Promise<void>;
  onUpdateSchedule: (id: string, data: ImagingScheduleFormData) => Promise<void>;
  onCancelAppointment: (scheduleId: string, reason: string) => Promise<void>;
  onRescheduleAppointment: (scheduleId: string, newDateTime: Date, newEquipmentId?: string) => Promise<void>;
}

const equipmentLocation = (eq: ImagingEquipment) => `${eq.location.room}, ${eq.location.building}`;

const emptyForm = (): ImagingScheduleFormData => ({
  orderId: "",
  equipmentId: "",
  scheduledDate: "",
  scheduledTime: "",
  duration: 30,
  technologistId: "",
  specialNotes: "",
});

export function RadiologyScheduling({
  schedules,
  equipment,
  technologists,
  onCreateSchedule,
  onUpdateSchedule,
  onCancelAppointment,
  onRescheduleAppointment,
}: RadiologySchedulingProps) {
  const t = useT(RADIOLOGY_KM);
  const tAny = useTranslateAny(RADIOLOGY_KM);
  const fmt = useDateFormat();
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ImagingAppointment | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewType, setViewType] = useState<"day" | "week">("day");
  const [searchTerm, setSearchTerm] = useState("");
  const [equipmentFilter, setEquipmentFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const form = useForm<ImagingScheduleFormData>({
    resolver: zodResolver(imagingScheduleSchema),
    defaultValues: emptyForm(),
  });

  const handleSubmit = async (data: ImagingScheduleFormData) => {
    try {
      if (editingSchedule) {
        await onUpdateSchedule(editingSchedule.id, data);
      } else {
        await onCreateSchedule(data);
      }
      setScheduleDialogOpen(false);
      setEditingSchedule(null);
      form.reset(emptyForm());
    } catch (error) {
      console.error("Error saving schedule:", error);
    }
  };

  const openScheduleDialog = (schedule?: ImagingAppointment) => {
    setEditingSchedule(schedule ?? null);
    form.reset(
      schedule
        ? {
            orderId: schedule.orderId,
            equipmentId: schedule.equipmentId,
            technologistId: schedule.technicianId,
            scheduledDate: fmt(schedule.scheduledDateTime, "yyyy-MM-dd"),
            scheduledTime: fmt(schedule.scheduledDateTime, "HH:mm"),
            duration: schedule.estimatedDuration,
            specialNotes: schedule.notes ?? "",
          }
        : emptyForm()
    );
    setScheduleDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled": return "bg-blue-100 text-blue-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "no_show": return "bg-gray-100 text-gray-800";
      case "rescheduled": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getSchedulesForDate = (date: Date) => {
    const dateStr = fmt(date, "yyyy-MM-dd");
    return schedules.filter(schedule => 
      fmt(schedule.scheduledDateTime, "yyyy-MM-dd") === dateStr &&
      (equipmentFilter === "all" || schedule.equipmentId === equipmentFilter) &&
      (statusFilter === "all" || schedule.status === statusFilter) &&
      (searchTerm === "" || 
        schedule.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        schedule.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  };

  const getWeekDays = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const renderDayView = () => {
    const daySchedules = getSchedulesForDate(selectedDate);

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {fmt(selectedDate, "EEEE, MMMM d, yyyy")}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, -1))}
            >
              {t("Previous Day")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
            >
              {t("Today")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, 1))}
            >
              {t("Next Day")}
            </Button>
          </div>
        </div>

        <div className="grid gap-4">
          {daySchedules.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">{t("No appointments scheduled for this day")}</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            daySchedules.map((schedule) => (
              <Card key={schedule.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{schedule.patientName}</CardTitle>
                      <Badge className={getStatusColor(schedule.status)}>
                        {tAny(schedule.status)}
                      </Badge>
                      {schedule.urgency === "emergency" && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {t("EMERGENCY")}
                        </Badge>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openScheduleDialog(schedule)}>
                        {t("Edit")}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => onCancelAppointment(schedule.id, "Patient request")}
                        disabled={schedule.status === "cancelled" || schedule.status === "completed"}
                      >
                        {t("Cancel")}
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {t("Order #{orderNumber} • MRN: {patientMRN}", { orderNumber: schedule.orderNumber, patientMRN: schedule.patientMRN })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {fmt(schedule.scheduledDateTime, "HH:mm")} - 
                        {fmt(new Date(schedule.scheduledDateTime.getTime() + schedule.estimatedDuration * 60000), "HH:mm")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{schedule.equipment?.name} - {schedule.equipment?.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{schedule.technician?.name}</span>
                    </div>
                  </div>
                  <div className="mt-3 space-y-2">
                    <p><strong>{t("Exam:")}</strong> {schedule.examType}</p>
                    <p><strong>{t("Body Part:")}</strong> {schedule.bodyPart}</p>
                    <p><strong>{t("Duration:")}</strong> {schedule.estimatedDuration} {t("minutes")}</p>
                    {schedule.notes && (
                      <p><strong>{t("Notes:")}</strong> {schedule.notes}</p>
                    )}
                    {schedule.preparationRequired && (
                      <div className="p-2 bg-blue-50 rounded text-blue-800">
                        <p className="font-medium">{t("Preparation Required")}</p>
                        <ul className="list-disc list-inside text-sm mt-1">
                          {schedule.preparationInstructions?.map((instruction, index) => (
                            <li key={index}>{instruction}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderWeekView = () => {
    const weekDays = getWeekDays();

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {t("Week of {date}", { date: fmt(weekDays[0], "MMMM d, yyyy") })}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            >
              {t("Previous Week")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(new Date())}
            >
              {t("This Week")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            >
              {t("Next Week")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const daySchedules = getSchedulesForDate(day);
            return (
              <Card key={day.toISOString()} className="min-h-[300px]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm text-center">
                    {fmt(day, "EEE d")}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                  <div className="space-y-1">
                    {daySchedules.map((schedule) => (
                      <div
                        key={schedule.id}
                        className="p-2 text-xs bg-blue-50 border border-blue-200 rounded cursor-pointer hover:bg-blue-100"
                        onClick={() => openScheduleDialog(schedule)}
                      >
                        <p className="font-medium">{fmt(schedule.scheduledDateTime, "HH:mm")}</p>
                        <p className="truncate">{schedule.patientName}</p>
                        <p className="text-muted-foreground truncate">{schedule.examType}</p>
                        <Badge className={`${getStatusColor(schedule.status)} text-xs`}>
                          {tAny(schedule.status)}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t("Radiology Scheduling")}</h1>
        <p className="text-muted-foreground">{t("Manage imaging appointments and equipment scheduling")}</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("Search patients, orders, or exam types...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={equipmentFilter} onValueChange={setEquipmentFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("Filter by equipment")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Equipment")}</SelectItem>
            {equipment.map((eq) => (
              <SelectItem key={eq.id} value={eq.id}>
                {eq.name} - {equipmentLocation(eq)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("Status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Status")}</SelectItem>
            <SelectItem value="scheduled">{t("Scheduled")}</SelectItem>
            <SelectItem value="in_progress">{t("In Progress")}</SelectItem>
            <SelectItem value="completed">{t("Completed")}</SelectItem>
            <SelectItem value="cancelled">{t("Cancelled")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={viewType} onValueChange={(value) => setViewType(value as "day" | "week")}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">{t("Day View")}</SelectItem>
            <SelectItem value="week">{t("Week View")}</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openScheduleDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              {t("Schedule Appointment")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingSchedule ? t("Edit Appointment") : t("Schedule New Appointment")}
              </DialogTitle>
              <DialogDescription>
                {t("Schedule an imaging appointment")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderId">{t("Order ID *")}</Label>
                  <Input
                    id="orderId"
                    {...form.register("orderId")}
                    placeholder={t("Enter order ID")}
                  />
                  {form.formState.errors.orderId && (
                    <p className="text-sm text-red-500">{tAny(form.formState.errors.orderId.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t("Equipment *")}</Label>
                  <Controller
                    control={form.control}
                    name="equipmentId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Select equipment")} />
                        </SelectTrigger>
                        <SelectContent>
                          {equipment
                            .filter((eq) => eq.status === "operational")
                            .map((eq) => (
                              <SelectItem key={eq.id} value={eq.id}>
                                {eq.name} - {equipmentLocation(eq)}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.equipmentId && (
                    <p className="text-sm text-red-500">{tAny(form.formState.errors.equipmentId.message)}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("Technologist *")}</Label>
                  <Controller
                    control={form.control}
                    name="technologistId"
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Select technologist")} />
                        </SelectTrigger>
                        <SelectContent>
                          {technologists.map((tech) => (
                            <SelectItem key={tech.id} value={tech.id}>
                              {tech.name} ({tAny(tech.shift)})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {form.formState.errors.technologistId && (
                    <p className="text-sm text-red-500">{tAny(form.formState.errors.technologistId.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration">{t("Duration (minutes) *")}</Label>
                  <Input
                    id="duration"
                    type="number"
                    {...form.register("duration", { valueAsNumber: true })}
                    placeholder="e.g., 30"
                  />
                  {form.formState.errors.duration && (
                    <p className="text-sm text-red-500">{tAny(form.formState.errors.duration.message)}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledDate">{t("Date *")}</Label>
                  <Input id="scheduledDate" type="date" {...form.register("scheduledDate")} />
                  {form.formState.errors.scheduledDate && (
                    <p className="text-sm text-red-500">{tAny(form.formState.errors.scheduledDate.message)}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledTime">{t("Time *")}</Label>
                  <Input id="scheduledTime" type="time" step={1800} {...form.register("scheduledTime")} />
                  {form.formState.errors.scheduledTime && (
                    <p className="text-sm text-red-500">{tAny(form.formState.errors.scheduledTime.message)}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialNotes">{t("Notes")}</Label>
                <Textarea
                  id="specialNotes"
                  {...form.register("specialNotes")}
                  placeholder={t("Any special notes or instructions...")}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setScheduleDialogOpen(false)}
                >
                  {t("Cancel")}
                </Button>
                <Button type="submit">
                  {t(editingSchedule ? "Update Appointment" : "Schedule Appointment")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {viewType === "day" ? renderDayView() : renderWeekView()}
    </div>
  );
}