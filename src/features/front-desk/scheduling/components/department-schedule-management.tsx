"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, addWeeks, subWeeks } from "date-fns";
import { 
  Building, 
  Users, 
  Calendar,
  Clock,
  MapPin,
  Stethoscope,
  UserCheck,
  Activity,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Download,
  Settings,
  Eye,
  Edit,
  Trash2,
  BarChart3
} from "lucide-react";
import { z } from "zod";
import { Department, Doctor, SchedulingAppointment } from "@/features/front-desk/scheduling/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Department Schedule Types
interface DepartmentSchedule {
  id: string;
  departmentId: string;
  doctorId: string;
  date: Date;
  startTime: string;
  endTime: string;
  status: "scheduled" | "cancelled" | "completed";
  maxPatients: number;
  currentPatients: number;
  roomNumber?: string;
  notes?: string;
}

interface ResourceAllocation {
  id: string;
  departmentId: string;
  resourceType: "room" | "equipment" | "staff";
  resourceName: string;
  schedules: Array<{
    date: Date;
    startTime: string;
    endTime: string;
    allocatedTo: string; // doctor or appointment ID
    status: "allocated" | "available" | "maintenance";
  }>;
}

interface DepartmentStats {
  totalDoctors: number;
  totalAppointments: number;
  utilizationRate: number;
  avgWaitTime: number;
  patientSatisfaction: number;
}

// Form schemas
const scheduleSlotSchema = z.object({
  departmentId: z.string().min(1, "Department is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  date: z.date(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  maxPatients: z.number().min(1, "Maximum patients must be at least 1"),
  roomNumber: z.string().optional(),
  notes: z.string().optional()
});

type ScheduleSlotFormData = z.infer<typeof scheduleSlotSchema>;

interface DepartmentScheduleManagementProps {
  departments: Department[];
  doctors: Doctor[];
  appointments: SchedulingAppointment[];
  departmentSchedules: DepartmentSchedule[];
  resourceAllocations: ResourceAllocation[];
  departmentStats: Record<string, DepartmentStats>;
  onCreateScheduleSlot: (data: ScheduleSlotFormData) => void;
  onUpdateScheduleSlot: (id: string, data: ScheduleSlotFormData) => void;
  onDeleteScheduleSlot: (id: string) => void;
  onAllocateResource: (resourceId: string, allocation: any) => void;
}

export function DepartmentScheduleManagement({
  departments,
  doctors,
  appointments,
  departmentSchedules,
  resourceAllocations,
  departmentStats,
  onCreateScheduleSlot,
  onUpdateScheduleSlot,
  onDeleteScheduleSlot,
  onAllocateResource
}: DepartmentScheduleManagementProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentWeek, setCurrentWeek] = useState<Date>(new Date());
  const [editingSchedule, setEditingSchedule] = useState<DepartmentSchedule | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState<"day" | "week" | "month">("week");

  const scheduleForm = useForm<ScheduleSlotFormData>({
    resolver: zodResolver(scheduleSlotSchema),
    defaultValues: {
      maxPatients: 20
    }
  });

  const handleScheduleSubmit = async (data: ScheduleSlotFormData) => {
    setIsSubmitting(true);
    try {
      if (editingSchedule) {
        await onUpdateScheduleSlot(editingSchedule.id, data);
        setEditingSchedule(null);
      } else {
        await onCreateScheduleSlot(data);
      }
      scheduleForm.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek);
    const end = endOfWeek(currentWeek);
    return eachDayOfInterval({ start, end });
  };

  const getSchedulesForDay = (date: Date, departmentId?: string) => {
    return departmentSchedules.filter(schedule => {
      const matchesDate = isSameDay(schedule.date, date);
      const matchesDepartment = !departmentId || schedule.departmentId === departmentId;
      return matchesDate && matchesDepartment;
    });
  };

  const getSchedulesForWeek = (departmentId?: string) => {
    const weekDays = getWeekDays();
    return weekDays.map(day => ({
      date: day,
      schedules: getSchedulesForDay(day, departmentId)
    }));
  };

  const getDepartmentUtilization = (departmentId: string) => {
    const schedules = departmentSchedules.filter(s => s.departmentId === departmentId);
    if (schedules.length === 0) return 0;
    
    const totalCapacity = schedules.reduce((sum, schedule) => sum + schedule.maxPatients, 0);
    const totalBooked = schedules.reduce((sum, schedule) => sum + schedule.currentPatients, 0);
    
    return totalCapacity > 0 ? Math.round((totalBooked / totalCapacity) * 100) : 0;
  };

  const getTopPerformingDepartments = () => {
    return departments
      .map(dept => ({
        ...dept,
        stats: departmentStats[dept.id] || {
          totalDoctors: 0,
          totalAppointments: 0,
          utilizationRate: 0,
          avgWaitTime: 0,
          patientSatisfaction: 0
        }
      }))
      .sort((a, b) => b.stats.utilizationRate - a.stats.utilizationRate)
      .slice(0, 5);
  };

  const timeSlots = [
    "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", 
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", 
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", 
    "17:00", "17:30", "18:00"
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-indigo-600">Department Schedules</h1>
          <p className="text-muted-foreground">
            Manage department-wide scheduling and resource allocation
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={selectedDepartment || "all"}
            onValueChange={(v) => setSelectedDepartment(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept) => (
                <SelectItem key={dept.id} value={dept.id}>
                  {dept.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{departments.length}</p>
                <p className="text-xs text-muted-foreground">Total Departments</p>
              </div>
              <Building className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{doctors.length}</p>
                <p className="text-xs text-muted-foreground">Active Doctors</p>
              </div>
              <Stethoscope className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{departmentSchedules.length}</p>
                <p className="text-xs text-muted-foreground">Schedule Slots</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {selectedDepartment ? 
                    getDepartmentUtilization(selectedDepartment) : 
                    Math.round(departments.reduce((avg, dept) => avg + getDepartmentUtilization(dept.id), 0) / departments.length || 0)
                  }%
                </p>
                <p className="text-xs text-muted-foreground">Utilization Rate</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="schedule">Create Schedule</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Department Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {getTopPerformingDepartments().map((dept) => (
                    <div key={dept.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Building className="h-5 w-5 text-blue-500" />
                        <div>
                          <div className="font-medium">{dept.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {dept.stats.totalDoctors} doctors • {dept.stats.totalAppointments} appointments
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          {dept.stats.utilizationRate}%
                        </div>
                        <div className="text-xs text-muted-foreground">Utilization</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Today's Schedule Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-purple-500" />
                  Today's Schedule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.slice(0, 5).map((dept) => {
                    const todaySchedules = getSchedulesForDay(new Date(), dept.id);
                    const totalPatients = todaySchedules.reduce((sum, schedule) => sum + schedule.currentPatients, 0);
                    const maxCapacity = todaySchedules.reduce((sum, schedule) => sum + schedule.maxPatients, 0);
                    
                    return (
                      <div key={dept.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <div>
                            <div className="font-medium">{dept.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {todaySchedules.length} slots
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">
                            {totalPatients}/{maxCapacity}
                          </div>
                          <div className="text-xs text-muted-foreground">Patients</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          {/* Calendar Controls */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(subWeeks(currentWeek, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <h3 className="text-lg font-semibold ml-4">
                  {format(startOfWeek(currentWeek), "MMM dd")} - {format(endOfWeek(currentWeek), "MMM dd, yyyy")}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <Select value={viewMode} onValueChange={(value: "day" | "week" | "month") => setViewMode(value)}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Day</SelectItem>
                    <SelectItem value="week">Week</SelectItem>
                    <SelectItem value="month">Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Weekly Calendar View */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-8 gap-1">
                {/* Header */}
                <div className="p-2 font-medium text-center">Time</div>
                {getWeekDays().map((day) => (
                  <div key={day.toString()} className="p-2 font-medium text-center border-b">
                    <div>{format(day, "EEE")}</div>
                    <div className="text-sm text-muted-foreground">{format(day, "MMM dd")}</div>
                  </div>
                ))}

                {/* Time slots */}
                {timeSlots.map((time) => (
                  <React.Fragment key={time}>
                    <div className="p-2 text-sm text-muted-foreground border-r">
                      {time}
                    </div>
                    {getWeekDays().map((day) => {
                      const daySchedules = getSchedulesForDay(day, selectedDepartment).filter(
                        schedule => schedule.startTime <= time && schedule.endTime > time
                      );
                      
                      return (
                        <div key={`${day.toString()}-${time}`} className="min-h-12 border border-gray-100 p-1">
                          {daySchedules.map((schedule) => {
                            const doctor = doctors.find(d => d.id === schedule.doctorId);
                            const department = departments.find(d => d.id === schedule.departmentId);
                            
                            return (
                              <div
                                key={schedule.id}
                                className="text-xs p-1 mb-1 bg-blue-100 text-blue-800 rounded cursor-pointer hover:bg-blue-200 transition-colors"
                                onClick={() => setEditingSchedule(schedule)}
                              >
                                <div className="font-medium truncate">{doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : ""}</div>
                                <div className="truncate">{department?.name}</div>
                                <div>{schedule.currentPatients}/{schedule.maxPatients}</div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5 text-blue-500" />
                {editingSchedule ? "Edit Schedule Slot" : "Create Schedule Slot"}
              </CardTitle>
              <CardDescription>
                {editingSchedule ? "Update the schedule slot" : "Create a new department schedule slot"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={scheduleForm.handleSubmit(handleScheduleSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department *</Label>
                    <Select onValueChange={(value) => scheduleForm.setValue("departmentId", value)}>
                      <SelectTrigger className={scheduleForm.formState.errors.departmentId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            <div className="flex items-center gap-2">
                              <Building className="h-4 w-4" />
                              {dept.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {scheduleForm.formState.errors.departmentId && (
                      <p className="text-sm text-red-500">{scheduleForm.formState.errors.departmentId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Doctor *</Label>
                    <Select onValueChange={(value) => scheduleForm.setValue("doctorId", value)}>
                      <SelectTrigger className={scheduleForm.formState.errors.doctorId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            <div className="flex items-center gap-2">
                              <Stethoscope className="h-4 w-4" />
                              Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialization}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {scheduleForm.formState.errors.doctorId && (
                      <p className="text-sm text-red-500">{scheduleForm.formState.errors.doctorId.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Date *</Label>
                    <CalendarPicker
                      mode="single"
                      selected={scheduleForm.watch("date")}
                      onSelect={(date) => date && scheduleForm.setValue("date", date)}
                      className="rounded-md border"
                    />
                    {scheduleForm.formState.errors.date && (
                      <p className="text-sm text-red-500">{scheduleForm.formState.errors.date.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Start Time *</Label>
                    <Select onValueChange={(value) => scheduleForm.setValue("startTime", value)}>
                      <SelectTrigger className={scheduleForm.formState.errors.startTime ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select start time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {scheduleForm.formState.errors.startTime && (
                      <p className="text-sm text-red-500">{scheduleForm.formState.errors.startTime.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>End Time *</Label>
                    <Select onValueChange={(value) => scheduleForm.setValue("endTime", value)}>
                      <SelectTrigger className={scheduleForm.formState.errors.endTime ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select end time" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {scheduleForm.formState.errors.endTime && (
                      <p className="text-sm text-red-500">{scheduleForm.formState.errors.endTime.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxPatients">Maximum Patients *</Label>
                    <Input
                      id="maxPatients"
                      type="number"
                      min="1"
                      max="50"
                      {...scheduleForm.register("maxPatients", { valueAsNumber: true })}
                      className={scheduleForm.formState.errors.maxPatients ? "border-red-500" : ""}
                    />
                    {scheduleForm.formState.errors.maxPatients && (
                      <p className="text-sm text-red-500">{scheduleForm.formState.errors.maxPatients.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="roomNumber">Room Number</Label>
                    <Input
                      id="roomNumber"
                      {...scheduleForm.register("roomNumber")}
                      placeholder="e.g., Room 101"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Input
                    id="notes"
                    {...scheduleForm.register("notes")}
                    placeholder="Additional notes or special instructions"
                  />
                </div>

                <div className="flex justify-end space-x-4">
                  {editingSchedule && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setEditingSchedule(null);
                        scheduleForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : (editingSchedule ? "Update Schedule" : "Create Schedule")}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-green-500" />
                Resource Allocation
              </CardTitle>
              <CardDescription>
                Manage rooms, equipment, and staff allocation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Rooms */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Rooms</h3>
                  <div className="space-y-2">
                    {resourceAllocations
                      .filter(resource => resource.resourceType === "room")
                      .map((resource) => (
                        <div key={resource.id} className="p-3 border rounded-lg">
                          <div className="font-medium">{resource.resourceName}</div>
                          <div className="text-sm text-muted-foreground">
                            Department: {departments.find(d => d.id === resource.departmentId)?.name}
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            Available
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Equipment */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Equipment</h3>
                  <div className="space-y-2">
                    {resourceAllocations
                      .filter(resource => resource.resourceType === "equipment")
                      .map((resource) => (
                        <div key={resource.id} className="p-3 border rounded-lg">
                          <div className="font-medium">{resource.resourceName}</div>
                          <div className="text-sm text-muted-foreground">
                            Department: {departments.find(d => d.id === resource.departmentId)?.name}
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            Available
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Staff */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Staff</h3>
                  <div className="space-y-2">
                    {resourceAllocations
                      .filter(resource => resource.resourceType === "staff")
                      .map((resource) => (
                        <div key={resource.id} className="p-3 border rounded-lg">
                          <div className="font-medium">{resource.resourceName}</div>
                          <div className="text-sm text-muted-foreground">
                            Department: {departments.find(d => d.id === resource.departmentId)?.name}
                          </div>
                          <div className="text-xs text-green-600 mt-1">
                            Available
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Analytics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-purple-500" />
                  Department Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departments.map((dept) => {
                    const stats = departmentStats[dept.id] || {
                      totalDoctors: 0,
                      totalAppointments: 0,
                      utilizationRate: 0,
                      avgWaitTime: 0,
                      patientSatisfaction: 0
                    };
                    
                    return (
                      <div key={dept.id} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{dept.name}</h4>
                          <Badge variant="outline">
                            {stats.utilizationRate}% utilized
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Doctors:</span> {stats.totalDoctors}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Appointments:</span> {stats.totalAppointments}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Avg Wait:</span> {stats.avgWaitTime}min
                          </div>
                          <div>
                            <span className="text-muted-foreground">Satisfaction:</span> {stats.patientSatisfaction}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-500" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Overall Utilization</span>
                      <span className="text-sm text-muted-foreground">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: "85%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Patient Satisfaction</span>
                      <span className="text-sm text-muted-foreground">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: "92%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">On-Time Performance</span>
                      <span className="text-sm text-muted-foreground">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: "78%" }}></div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Resource Efficiency</span>
                      <span className="text-sm text-muted-foreground">89%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: "89%" }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}