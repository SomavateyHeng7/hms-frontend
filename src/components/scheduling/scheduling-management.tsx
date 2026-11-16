"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTabParam } from "@/hooks/use-tab-param";
import { useAccess } from "@/lib/access";
import { RoleNotice } from "@/components/layout/role-notice";
import { SchedulingDashboard } from "@/components/scheduling/scheduling-dashboard";
import { AdvancedAppointmentBooking } from "@/components/scheduling/advanced-appointment-booking";
import { DepartmentScheduleManagement } from "@/components/scheduling/department-schedule-management";
import { AutomatedReminderSystem } from "@/components/scheduling/automated-reminder-system";
import { EmergencyTriageManagement } from "@/components/scheduling/emergency-triage-management";
import { TelemedicineManagement } from "@/components/scheduling/telemedicine-management";
import type {
  SchedulingAppointment,
  Doctor,
  Department,
  AppointmentSlot,
  EmergencyQueue,
} from "@/types/scheduling";

export function SchedulingManagement() {
  const { user, can } = useAccess();
  const canBook = can("appointment.book");
  const [activeTab, setActiveTab] = useTabParam("dashboard", [
    "dashboard",
    ...(canBook ? ["booking"] : []),
    "departments",
    "reminders",
    "triage",
    "telemedicine",
  ]);

  // Placeholder data - to be replaced by API calls once the backend exists
  const appointments: SchedulingAppointment[] = [];
  const doctors: Doctor[] = [];
  const departments: Department[] = [];
  const appointmentSlots: AppointmentSlot[] = [];
  const emergencyQueue: EmergencyQueue[] = [];

  const log = (name: string) => (...args: unknown[]) => {
    console.log(name, ...args);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {user && <RoleNotice role={user.role} limits={[!canBook && "you can't book appointments"].filter(Boolean) as string[]} />}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          {canBook && <TabsTrigger value="booking">Book Appointment</TabsTrigger>}
          <TabsTrigger value="departments">Department Schedules</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="triage">Emergency Triage</TabsTrigger>
          <TabsTrigger value="telemedicine">Telemedicine</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <SchedulingDashboard
            appointments={appointments}
            doctors={doctors}
            departments={departments}
            appointmentSlots={appointmentSlots}
            emergencyQueue={emergencyQueue}
            onCreateAppointment={() => setActiveTab("booking")}
            onEditAppointment={log("edit appointment")}
            onCancelAppointment={log("cancel appointment")}
            onRescheduleAppointment={log("reschedule appointment")}
            onConfirmAppointment={log("confirm appointment")}
            onManageEmergency={() => setActiveTab("triage")}
            onScheduleTelemedicine={() => setActiveTab("telemedicine")}
          />
        </TabsContent>

        <TabsContent value="booking">
          <AdvancedAppointmentBooking
            doctors={doctors}
            departments={departments}
            availableSlots={appointmentSlots}
            onSubmit={(data) => {
              console.log("book appointment", data);
              setActiveTab("dashboard");
            }}
            onCancel={() => setActiveTab("dashboard")}
          />
        </TabsContent>

        <TabsContent value="departments">
          <DepartmentScheduleManagement
            departments={departments}
            doctors={doctors}
            appointments={appointments}
            departmentSchedules={[]}
            resourceAllocations={[]}
            departmentStats={{}}
            onCreateScheduleSlot={log("create schedule slot")}
            onUpdateScheduleSlot={log("update schedule slot")}
            onDeleteScheduleSlot={log("delete schedule slot")}
            onAllocateResource={log("allocate resource")}
          />
        </TabsContent>

        <TabsContent value="reminders">
          <AutomatedReminderSystem
            appointments={appointments}
            reminderTemplates={[]}
            scheduledReminders={[]}
            reminderStats={{
              totalReminders: 0,
              sentToday: 0,
              deliveredToday: 0,
              failedToday: 0,
              appointmentAttendanceRate: 0,
            }}
            onCreateTemplate={log("create reminder template")}
            onUpdateTemplate={log("update reminder template")}
            onDeleteTemplate={log("delete reminder template")}
            onScheduleBulkReminders={log("schedule bulk reminders")}
            onCancelReminder={log("cancel reminder")}
            onResendReminder={log("resend reminder")}
          />
        </TabsContent>

        <TabsContent value="triage">
          <EmergencyTriageManagement
            emergencyQueue={emergencyQueue}
            onSubmitTriage={log("submit triage")}
            onUpdateEmergencyStatus={log("update emergency status")}
            onTransferPatient={log("transfer patient")}
          />
        </TabsContent>

        <TabsContent value="telemedicine">
          <TelemedicineManagement
            telemedicineSessions={[]}
            telemedicineAppointments={appointments.filter((a) => a.isTelemedicine)}
            onCreateSession={log("create telemedicine session")}
            onStartSession={log("start telemedicine session")}
            onEndSession={log("end telemedicine session")}
            onJoinSession={log("join telemedicine session")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
