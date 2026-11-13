"use client";

import React, { useState } from "react";
import { format, addDays, startOfWeek, addWeeks, subWeeks, isSameDay, isToday } from "date-fns";
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
          <h1 className="text-3xl font-bold tracking-tight">Appointment & Scheduling</h1>
          <p className="text-muted-foreground">
            Comprehensive scheduling system for all departments
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onScheduleTelemedicine} variant="outline">
            <Video className="mr-2 h-4 w-4" />
            Telemedicine
          </Button>
          <Button onClick={onCreateAppointment}>
            <Plus className="mr-2 h-4 w-4" />
            New Appointment
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
                <p className="text-xs text-muted-foreground">Today's Appointments</p>
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
                <p className="text-xs text-muted-foreground">Confirmed Today</p>
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
                <p className="text-xs text-muted-foreground">Emergency Queue</p>
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
                <p className="text-xs text-muted-foreground">Telemedicine Today</p>
              </div>
              <Video className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="emergency">Emergency Queue</TabsTrigger>
          <TabsTrigger value="telemedicine">Telemedicine</TabsTrigger>
        </TabsList>

        <TabsContent value="appointments" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle>Filter Appointments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search by reason or doctor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Departments</SelectItem>
                    {departments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select Doctor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Doctors</SelectItem>
                    {doctors.map((doctor) => (
                      <SelectItem key={doctor.id} value={doctor.id}>
                        Dr. {doctor.firstName} {doctor.lastName}
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
                    <h3 className="text-lg font-semibold mb-2">No appointments found</h3>
                    <p className="text-muted-foreground mb-4">
                      Try adjusting your filters or create a new appointment
                    </p>
                    <Button onClick={onCreateAppointment}>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Appointment
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
                            {appointment.status}
                          </Badge>
                          {appointment.isTelemedicine && (
                            <Badge variant="outline">
                              <Video className="mr-1 h-3 w-3" />
                              Telemedicine
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(appointment.appointmentDate, "MMM dd, yyyy")} at {appointment.appointmentTime}
                          </div>
                          <div>Patient ID: {appointment.patientId}</div>
                          <div>Department: {appointment.department}</div>
                          <div>Reason: {appointment.reason}</div>
                          {appointment.roomNumber && (
                            <div>Room: {appointment.roomNumber}</div>
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
                            Confirm
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onEditAppointment(appointment)}
                        >
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onRescheduleAppointment(appointment.id)}
                        >
                          <RotateCcw className="mr-1 h-3 w-3" />
                          Reschedule
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCancelAppointment(appointment.id)}
                        >
                          <XCircle className="mr-1 h-3 w-3" />
                          Cancel
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
                <CardTitle>Calendar View</CardTitle>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === "day" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("day")}
                    >
                      Day
                    </Button>
                    <Button
                      variant={viewMode === "week" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("week")}
                    >
                      Week
                    </Button>
                    <Button
                      variant={viewMode === "month" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setViewMode("month")}
                    >
                      Month
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
                      {format(currentDate, "MMMM yyyy")}
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
                      {format(day, "EEE dd")}
                      {isToday(day) && (
                        <Badge variant="outline" className="ml-2">Today</Badge>
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
                            Video
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
                Emergency Queue Management
              </CardTitle>
              <CardDescription>
                Triage and manage emergency patients based on priority
              </CardDescription>
            </CardHeader>
            <CardContent>
              {emergencyQueue.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No emergency patients</h3>
                  <p className="text-muted-foreground">All clear in the emergency department</p>
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
                            <Badge variant="outline">{emergency.status}</Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Patient ID: {emergency.patientId}</div>
                            <div>Department: {emergency.department}</div>
                            <div>Arrival: {format(emergency.arrivalTime, "HH:mm")}</div>
                            <div>Wait Time: ~{emergency.estimatedWaitTime} minutes</div>
                            {emergency.assignedDoctor && (
                              <div>Assigned: {emergency.assignedDoctor}</div>
                            )}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Triage Notes:</span> {emergency.triageNotes}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => onManageEmergency(emergency)}
                          >
                            Manage
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
                Telemedicine Sessions
              </CardTitle>
              <CardDescription>
                Virtual consultations and remote patient care
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {appointments
                  .filter(appointment => appointment.isTelemedicine)
                  .length === 0 ? (
                  <div className="text-center py-8">
                    <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No telemedicine sessions</h3>
                    <p className="text-muted-foreground mb-4">
                      Schedule virtual consultations for remote patient care
                    </p>
                    <Button onClick={onScheduleTelemedicine}>
                      <Video className="mr-2 h-4 w-4" />
                      Schedule Telemedicine
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
                              {appointment.status}
                            </Badge>
                            <Badge variant="outline">
                              <Video className="mr-1 h-3 w-3" />
                              Telemedicine
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>Patient ID: {appointment.patientId}</div>
                            <div>
                              {format(appointment.appointmentDate, "MMM dd, yyyy")} at {appointment.appointmentTime}
                            </div>
                            <div>Duration: {appointment.duration} minutes</div>
                            <div>Reason: {appointment.reason}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {appointment.status === "confirmed" && (
                            <Button size="sm">
                              <Video className="mr-1 h-3 w-3" />
                              Start Session
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onEditAppointment(appointment)}
                          >
                            <Edit className="mr-1 h-3 w-3" />
                            Edit
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