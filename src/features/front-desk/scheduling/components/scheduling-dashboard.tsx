"use client";

import React, { useState } from "react";
import { addDays, startOfWeek, addWeeks, subWeeks, isSameDay, isToday } from "date-fns";
import { 
  Calendar,
  Clock, 
  Users, 
  AlertTriangle, 
  Video, 
  Phone, 
  Mail, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Search,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  RotateCcw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SchedulingAppointment, Doctor, Department, AppointmentSlot, EmergencyQueue } from "@/features/front-desk/scheduling/types";
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { SCHEDULING_KM } from "@/features/front-desk/scheduling/km";

interface SchedulingDashboardProps {
  appointments: SchedulingAppointment[];
  doctors: Doctor[];
  departments: Department[];
  appointmentSlots: AppointmentSlot[];
  emergencyQueue: EmergencyQueue[];
  onCreateAppointment: () => void;
  onEditAppointment: (appointment: SchedulingAppointment) => void;
  onCancelAppointment: (appointmentId: string) => void;
  onRescheduleAppointment: (appointmentId: string) => void;
  onConfirmAppointment: (appointmentId: string) => void;
  onManageEmergency: (emergency: EmergencyQueue) => void;
  onScheduleTelemedicine: () => void;
}

export function SchedulingDashboard({
  appointments,
  doctors,
  departments,
  appointmentSlots,
  emergencyQueue,
  onCreateAppointment,
  onEditAppointment,
  onCancelAppointment,
  onRescheduleAppointment,
  onConfirmAppointment,
  onManageEmergency,
  onScheduleTelemedicine
}: SchedulingDashboardProps) {
  const t = useT(SCHEDULING_KM);
  const tAny = useTranslateAny(SCHEDULING_KM);
  const fmt = useDateFormat();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("appointments");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-orange-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      default:
        return "bg-blue-500 text-white";
    }
  };

  const filterAppointments = () => {
    return appointments.filter(appointment => {
      const matchesSearch = searchQuery === "" || 
        appointment.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        appointment.doctorName.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesDepartment = selectedDepartment === "all" || 
        appointment.department === selectedDepartment;
      
      const matchesDoctor = selectedDoctor === "all" || 
        appointment.doctorId === selectedDoctor;

      return matchesSearch && matchesDepartment && matchesDoctor;
    });
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentDate);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  };

  const getAppointmentsForDay = (date: Date) => {
    return filterAppointments().filter(appointment =>
      isSameDay(appointment.appointmentDate, date)
    );
  };

  const getTotalAppointmentsToday = () => {
    return appointments.filter(appointment => 
      isToday(appointment.appointmentDate)
    ).length;
  };

  const getConfirmedAppointmentsToday = () => {
    return appointments.filter(appointment => 
      isToday(appointment.appointmentDate) && appointment.status === "confirmed"
    ).length;
  };

  const getCancelledAppointmentsToday = () => {
    return appointments.filter(appointment => 
      isToday(appointment.appointmentDate) && appointment.status === "cancelled"
    ).length;
  };

  const getTelemedicineAppointmentsToday = () => {
    return appointments.filter(appointment => 
      isToday(appointment.appointmentDate) && appointment.isTelemedicine
    ).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Appointment & Scheduling")}</h1>
          <p className="text-muted-foreground">
            {t("Comprehensive scheduling system for all departments")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onScheduleTelemedicine} variant="outline">
            <Video className="mr-2 h-4 w-4" />
            {t("Telemedicine")}
          </Button>
          <Button onClick={onCreateAppointment}>
            <Plus className="mr-2 h-4 w-4" />
            {t("New Appointment")}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{getTotalAppointmentsToday()}</p>
                <p className="text-xs text-muted-foreground">{t("Today's Appointments")}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{getConfirmedAppointmentsToday()}</p>
                <p className="text-xs text-muted-foreground">{t("Confirmed Today")}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{emergencyQueue.length}</p>
                <p className="text-xs text-muted-foreground">{t("Emergency Queue")}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{getTelemedicineAppointmentsToday()}</p>
                <p className="text-xs text-muted-foreground">{t("Telemedicine Today")}</p>
              </div>
              <Video className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appointments">{t("Appointments")}</TabsTrigger>
          <TabsTrigger value="calendar">{t("Calendar View")}</TabsTrigger>
          <TabsTrigger value="emergency">{t("Emergency Queue")}</TabsTrigger>
          <TabsTrigger value="telemedicine">{t("Telemedicine")}</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Filter Appointments")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder={t("Search by reason or doctor...")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t("Select Department")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("All Departments")}</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder={t("Select Doctor")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t("All Doctors")}</SelectItem>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        {t("Dr. {firstName} {lastName}", { firstName: doctor.firstName, lastName: doctor.lastName })}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Appointments List */}
          <div className="grid grid-cols-1 gap-4">
            {filterAppointments().length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("No appointments found")}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t("Try adjusting your filters or create a new appointment")}
                    </p>
                    <Button onClick={onCreateAppointment}>
                      <Plus className="mr-2 h-4 w-4" />
                      {t("Create Appointment")}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filterAppointments().map((appointment) => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{appointment.doctorName}</h3>
                          <Badge className={getStatusColor(appointment.status)}>
                            {tAny(appointment.status)}
                          </Badge>
                          {appointment.isTelemedicine && (
                            <Badge variant="outline">
                              <Video className="mr-1 h-3 w-3" />
                              {t("Telemedicine")}
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {fmt(appointment.appointmentDate, "MMM dd, yyyy")} {t("at")} {appointment.appointmentTime}
                          </div>
                          <div>{t("Patient ID: {patientId}", { patientId: appointment.patientId })}</div>
                          <div>{t("Department: {department}", { department: appointment.department })}</div>
                          <div>{t("Reason: {reason}", { reason: appointment.reason })}</div>
                          {appointment.roomNumber && (
                            <div>{t("Room: {roomNumber}", { roomNumber: appointment.roomNumber })}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {appointment.status === "scheduled" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onConfirmAppointment(appointment.id)}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {t("Confirm")}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditAppointment(appointment)}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          {t("Edit")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRescheduleAppointment(appointment.id)}
                        >
                          <RotateCcw className="mr-1 h-3 w-3" />
                          {t("Reschedule")}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCancelAppointment(appointment.id)}
                        >
                          <XCircle className="mr-1 h-3 w-3" />
                          {t("Cancel")}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          {/* Calendar Controls */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>{t("Calendar View")}</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "day" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("day")}
                    >
                      {t("Day")}
                    </Button>
                    <Button
                      variant={viewMode === "week" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("week")}
                    >
                      {t("Week")}
                    </Button>
                    <Button
                      variant={viewMode === "month" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("month")}
                    >
                      {t("Month")}
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(subWeeks(currentDate, 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-medium min-w-[200px] text-center">
                      {fmt(currentDate, "MMMM yyyy")}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentDate(addWeeks(currentDate, 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Week View */}
          {viewMode === "week" && (
            <div className="grid grid-cols-7 gap-4">
              {getWeekDays().map((day, index) => (
                <Card key={index} className={isToday(day) ? "ring-2 ring-blue-500" : ""}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {fmt(day, "EEE dd")}
                      {isToday(day) && (
                        <Badge variant="outline" className="ml-2">{t("Today")}</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {getAppointmentsForDay(day).map((appointment) => (
                      <div
                        key={appointment.id}
                        className="p-2 bg-blue-50 rounded text-xs cursor-pointer hover:bg-blue-100"
                        onClick={() => onEditAppointment(appointment)}
                      >
                        <div className="font-medium">{appointment.appointmentTime}</div>
                        <div className="truncate">{appointment.doctorName}</div>
                        <div className="truncate text-muted-foreground">
                          {appointment.reason}
                        </div>
                        {appointment.isTelemedicine && (
                          <Badge variant="outline" className="text-xs">
                            <Video className="mr-1 h-2 w-2" />
                            {t("Video")}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                {t("Emergency Queue Management")}
              </CardTitle>
              <CardDescription>
                {t("Triage and manage emergency patients based on priority")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emergencyQueue.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">{t("No emergency patients")}</h3>
                  <p className="text-muted-foreground">{t("All clear in the emergency department")}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {emergencyQueue
                    .sort((a, b) => {
                      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                      return priorityOrder[a.priority] - priorityOrder[b.priority];
                    })
                    .map((emergency) => (
                      <div
                        key={emergency.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{emergency.patientName}</h3>
                            <Badge className={getPriorityColor(emergency.priority)}>
                              {emergency.priority.toUpperCase()}
                            </Badge>
                            <Badge variant="outline">{tAny(emergency.status)}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>{t("Patient ID: {patientId}", { patientId: emergency.patientId })}</div>
                            <div>{t("Department: {department}", { department: emergency.department })}</div>
                            <div>{t("Arrival: {arrivalTime}", { arrivalTime: fmt(emergency.arrivalTime, "HH:mm") })}</div>
                            <div>{t("Wait Time: ~{estimatedWaitTime} minutes", { estimatedWaitTime: emergency.estimatedWaitTime })}</div>
                            {emergency.assignedDoctor && (
                              <div>{t("Assigned: {assignedDoctor}", { assignedDoctor: emergency.assignedDoctor })}</div>
                            )}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">{t("Triage Notes:")}</span> {emergency.triageNotes}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => onManageEmergency(emergency)}
                          >
                            {t("Manage")}
                          </Button>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="telemedicine" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-500" />
                {t("Telemedicine Sessions")}
              </CardTitle>
              <CardDescription>
                {t("Virtual consultations and remote patient care")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments
                  .filter(appointment => appointment.isTelemedicine)
                  .length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">{t("No telemedicine sessions")}</h3>
                    <p className="text-muted-foreground mb-4">
                      {t("Schedule virtual consultations for remote patient care")}
                    </p>
                    <Button onClick={onScheduleTelemedicine}>
                      <Video className="mr-2 h-4 w-4" />
                      {t("Schedule Telemedicine")}
                    </Button>
                  </div>
                ) : (
                  appointments
                    .filter(appointment => appointment.isTelemedicine)
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{appointment.doctorName}</h3>
                            <Badge className={getStatusColor(appointment.status)}>
                              {tAny(appointment.status)}
                            </Badge>
                            <Badge variant="outline">
                              <Video className="mr-1 h-3 w-3" />
                              {t("Telemedicine")}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>{t("Patient ID: {patientId}", { patientId: appointment.patientId })}</div>
                            <div>
                              {t("{appointmentDate} at {appointmentTime}", { appointmentDate: fmt(appointment.appointmentDate, "MMM dd, yyyy"), appointmentTime: appointment.appointmentTime })}
                            </div>
                            <div>{t("Duration: {duration} minutes", { duration: appointment.duration })}</div>
                            <div>{t("Reason: {reason}", { reason: appointment.reason })}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {appointment.status === "confirmed" && (
                            <Button size="sm">
                              <Video className="mr-1 h-3 w-3" />
                              {t("Start Session")}
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditAppointment(appointment)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            {t("Edit")}
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}