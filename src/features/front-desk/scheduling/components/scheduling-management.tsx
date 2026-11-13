"use client";

import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTabParam } from "@/hooks/use-tab-param";
import { SchedulingDashboard } from "./scheduling-dashboard";
import { AdvancedAppointmentBooking } from "./advanced-appointment-booking";
import { DepartmentScheduleManagement } from "./department-schedule-management";
import { AutomatedReminderSystem } from "./automated-reminder-system";
import { TelemedicineManagement } from "./telemedicine-management";
import { useT } from "@/lib/i18n/messages";
import { SCHEDULING_KM } from "@/features/front-desk/scheduling/km";

// Triage lives in the Emergency module; the scheduling copy is not shown (two triage screens confuse users).
const TABS = ["overview", "booking", "departments", "reminders", "telemedicine"] as const;

// Placeholder handlers until the mock data layer (roadmap Phase 1) is in place.
const log = (...args: unknown[]) => console.info("[scheduling]", ...args);

export function SchedulingManagement() {
  const t = useT(SCHEDULING_KM);
  const router = useRouter();
  const [tab, setTab] = useTabParam("overview", TABS);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{t("Scheduling")}</h1>
        <p className="text-muted-foreground">{t("Appointments, department rosters, reminders and telemedicine")}</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex w-full flex-wrap h-auto">
          <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
          <TabsTrigger value="booking">{t("Book Appointment")}</TabsTrigger>
          <TabsTrigger value="departments">{t("Departments")}</TabsTrigger>
          <TabsTrigger value="reminders">{t("Reminders")}</TabsTrigger>
          <TabsTrigger value="telemedicine">{t("Telemedicine")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <SchedulingDashboard
            appointments={[]}
            doctors={[]}
            departments={[]}
            appointmentSlots={[]}
            emergencyQueue={[]}
            onCreateAppointment={() => setTab("booking")}
            onEditAppointment={(a) => log("edit appointment", a)}
            onCancelAppointment={(id) => log("cancel appointment", id)}
            onRescheduleAppointment={(id) => log("reschedule appointment", id)}
            onConfirmAppointment={(id) => log("confirm appointment", id)}
            onManageEmergency={() => router.push("/nursing/emergency")}
            onScheduleTelemedicine={() => setTab("telemedicine")}
          />
        </TabsContent>

        <TabsContent value="booking">
          <AdvancedAppointmentBooking
            doctors={[]}
            departments={[]}
            availableSlots={[]}
            onSubmit={(data) => {
              log("book appointment", data);
              setTab("overview");
            }}
            onCancel={() => setTab("overview")}
          />
        </TabsContent>

        <TabsContent value="departments">
          <DepartmentScheduleManagement
            departments={[]}
            doctors={[]}
            appointments={[]}
            departmentSchedules={[]}
            resourceAllocations={[]}
            departmentStats={{}}
            onCreateScheduleSlot={(data) => log("create slot", data)}
            onUpdateScheduleSlot={(id, data) => log("update slot", id, data)}
            onDeleteScheduleSlot={(id) => log("delete slot", id)}
            onAllocateResource={(id, allocation) => log("allocate resource", id, allocation)}
          />
        </TabsContent>

        <TabsContent value="reminders">
          <AutomatedReminderSystem
            appointments={[]}
            reminderTemplates={[]}
            scheduledReminders={[]}
            reminderStats={{
              totalReminders: 0,
              sentToday: 0,
              deliveredToday: 0,
              failedToday: 0,
              appointmentAttendanceRate: 0,
            }}
            onCreateTemplate={(data) => log("create template", data)}
            onUpdateTemplate={(id, data) => log("update template", id, data)}
            onDeleteTemplate={(id) => log("delete template", id)}
            onScheduleBulkReminders={(data) => log("bulk reminders", data)}
            onCancelReminder={(id) => log("cancel reminder", id)}
            onResendReminder={(id) => log("resend reminder", id)}
          />
        </TabsContent>

        <TabsContent value="telemedicine">
          <TelemedicineManagement
            telemedicineSessions={[]}
            telemedicineAppointments={[]}
            onCreateSession={(data) => log("create session", data)}
            onStartSession={(id) => log("start session", id)}
            onEndSession={(id) => log("end session", id)}
            onJoinSession={(id) => log("join session", id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
