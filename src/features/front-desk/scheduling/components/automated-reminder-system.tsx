"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatDistanceToNow } from "date-fns";
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Phone,
  Send,
  Clock,
  User,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Settings,
  Users,
  BarChart3,
  Pause,
  Play,
  Trash2,
  Edit,
  RefreshCw
} from "lucide-react";
import { z } from "zod";
import { SchedulingAppointment } from "@/features/front-desk/scheduling/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { SCHEDULING_KM } from "@/features/front-desk/scheduling/km";

// Reminder Types
interface ReminderTemplate {
  id: string;
  name: string;
  type: "sms" | "email" | "phone" | "push";
  timing: number; // minutes before appointment
  isActive: boolean;
  message: string;
  subject?: string;
}

interface ScheduledReminder {
  id: string;
  appointmentId: string;
  patientId: string;
  type: "sms" | "email" | "phone" | "push";
  timing: number;
  scheduledTime: Date;
  status: "pending" | "sent" | "failed" | "cancelled";
  message: string;
  subject?: string;
  sentAt?: Date;
  deliveredAt?: Date;
  error?: string;
  retryCount: number;
  maxRetries: number;
}

interface ReminderStats {
  totalReminders: number;
  sentToday: number;
  deliveredToday: number;
  failedToday: number;
  appointmentAttendanceRate: number;
}

// Form schemas
const reminderTemplateSchema = z.object({
  name: z.string().min(1, "Template name is required"),
  type: z.enum(["sms", "email", "phone", "push"]),
  timing: z.number().min(15, "Minimum timing is 15 minutes").max(10080, "Maximum timing is 7 days"),
  message: z.string().min(10, "Message must be at least 10 characters"),
  subject: z.string().optional(),
  isActive: z.boolean()
});

const bulkReminderSchema = z.object({
  templateId: z.string().min(1, "Template is required"),
  appointmentIds: z.array(z.string()).min(1, "At least one appointment must be selected"),
  sendImmediately: z.boolean(),
  customMessage: z.string().optional()
});

type ReminderTemplateFormData = z.infer<typeof reminderTemplateSchema>;
type BulkReminderFormData = z.infer<typeof bulkReminderSchema>;

interface AutomatedReminderSystemProps {
  appointments: SchedulingAppointment[];
  reminderTemplates: ReminderTemplate[];
  scheduledReminders: ScheduledReminder[];
  reminderStats: ReminderStats;
  onCreateTemplate: (data: ReminderTemplateFormData) => void;
  onUpdateTemplate: (id: string, data: ReminderTemplateFormData) => void;
  onDeleteTemplate: (id: string) => void;
  onScheduleBulkReminders: (data: BulkReminderFormData) => void;
  onCancelReminder: (id: string) => void;
  onResendReminder: (id: string) => void;
}

export function AutomatedReminderSystem({
  appointments,
  reminderTemplates,
  scheduledReminders,
  reminderStats,
  onCreateTemplate,
  onUpdateTemplate,
  onDeleteTemplate,
  onScheduleBulkReminders,
  onCancelReminder,
  onResendReminder
}: AutomatedReminderSystemProps) {
  const t = useT(SCHEDULING_KM);
  const tAny = useTranslateAny(SCHEDULING_KM);
  const fmt = useDateFormat();
  const [activeTab, setActiveTab] = useState("overview");
  const [editingTemplate, setEditingTemplate] = useState<ReminderTemplate | null>(null);
  const [selectedAppointments, setSelectedAppointments] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const templateForm = useForm<ReminderTemplateFormData>({
    resolver: zodResolver(reminderTemplateSchema),
    defaultValues: {
      type: "sms",
      timing: 60,
      isActive: true
    }
  });

  const bulkForm = useForm<BulkReminderFormData>({
    resolver: zodResolver(bulkReminderSchema),
    defaultValues: {
      sendImmediately: false
    }
  });

  const handleTemplateSubmit = async (data: ReminderTemplateFormData) => {
    setIsSubmitting(true);
    try {
      if (editingTemplate) {
        await onUpdateTemplate(editingTemplate.id, data);
        setEditingTemplate(null);
      } else {
        await onCreateTemplate(data);
      }
      templateForm.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkReminderSubmit = async (data: BulkReminderFormData) => {
    setIsSubmitting(true);
    try {
      await onScheduleBulkReminders({
        ...data,
        appointmentIds: selectedAppointments
      });
      setSelectedAppointments([]);
      bulkForm.reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getReminderStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-blue-100 text-blue-800";
      case "sent":
        return "bg-green-100 text-green-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getReminderTypeIcon = (type: string) => {
    switch (type) {
      case "sms":
        return <MessageSquare className="h-4 w-4" />;
      case "email":
        return <Mail className="h-4 w-4" />;
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "push":
        return <Bell className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getUpcomingReminders = () => {
    return scheduledReminders
      .filter(reminder => 
        reminder.status === "pending" && 
        new Date(reminder.scheduledTime) > new Date()
      )
      .sort((a, b) => 
        new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime()
      )
      .slice(0, 10);
  };

  const getRecentReminders = () => {
    return scheduledReminders
      .filter(reminder => reminder.status === "sent" || reminder.status === "failed")
      .sort((a, b) => {
        const aTime = a.sentAt || a.scheduledTime;
        const bTime = b.sentAt || b.scheduledTime;
        return new Date(bTime).getTime() - new Date(aTime).getTime();
      })
      .slice(0, 10);
  };

  const defaultTemplates: ReminderTemplate[] = [
    {
      id: "template-1",
      name: "24 Hour SMS Reminder",
      type: "sms",
      timing: 1440,
      isActive: true,
      message: t("Hi {patient_name}, this is a reminder that you have an appointment with {doctor_name} tomorrow at {appointment_time}. Please call us at {clinic_phone} if you need to reschedule.")
    },
    {
      id: "template-2", 
      name: "2 Hour Email Reminder",
      type: "email",
      timing: 120,
      isActive: true,
      subject: "Upcoming Appointment Reminder - {appointment_time}",
      message: t("Dear {patient_name}, This is a reminder that you have an appointment with {doctor_name} in 2 hours at {appointment_time}. Location: {clinic_address} Phone: {clinic_phone} Please arrive 15 minutes early for check-in. Best regards, {clinic_name}")
    }
  ];

  const allTemplates = [...reminderTemplates, ...defaultTemplates];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-orange-600">{t("Reminder Center")}</h1>
          <p className="text-muted-foreground">
            {t("Automated appointment reminders and patient communication")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">{t("Sent Today:")} </span>
            <span className="text-2xl font-bold text-green-600">{reminderStats.sentToday}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{getUpcomingReminders().length}</p>
                <p className="text-xs text-muted-foreground">{t("Upcoming Reminders")}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{reminderStats.sentToday}</p>
                <p className="text-xs text-muted-foreground">{t("Sent Today")}</p>
              </div>
              <Send className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{reminderStats.failedToday}</p>
                <p className="text-xs text-muted-foreground">{t("Failed Today")}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{Math.round(reminderStats.appointmentAttendanceRate)}%</p>
                <p className="text-xs text-muted-foreground">{t("Attendance Rate")}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
          <TabsTrigger value="templates">{t("Templates")}</TabsTrigger>
          <TabsTrigger value="bulk">{t("Bulk Send")}</TabsTrigger>
          <TabsTrigger value="scheduled">{t("Scheduled")}</TabsTrigger>
          <TabsTrigger value="history">{t("History")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Upcoming Reminders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  {t("Upcoming Reminders")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getUpcomingReminders().length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Clock className="mx-auto h-8 w-8 mb-2" />
                      <p>{t("No upcoming reminders")}</p>
                    </div>
                  ) : (
                    getUpcomingReminders().map((reminder) => (
                      <div key={reminder.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getReminderTypeIcon(reminder.type)}
                          <div className="text-sm">
                            <div className="font-medium">{t("Patient: {patientId}", { patientId: reminder.patientId })}</div>
                            <div className="text-muted-foreground">
                              {formatDistanceToNow(reminder.scheduledTime, { addSuffix: true })}
                            </div>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onCancelReminder(reminder.id)}
                        >
                          {t("Cancel")}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5 text-green-500" />
                  {t("Recent Activity")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {getRecentReminders().length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <Send className="mx-auto h-8 w-8 mb-2" />
                      <p>{t("No recent activity")}</p>
                    </div>
                  ) : (
                    getRecentReminders().map((reminder) => (
                      <div key={reminder.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getReminderTypeIcon(reminder.type)}
                          <div className="text-sm">
                            <div className="font-medium">{t("Patient: {patientId}", { patientId: reminder.patientId })}</div>
                            <div className="text-muted-foreground">
                              {reminder.sentAt ? 
                                fmt(reminder.sentAt, "MMM dd, HH:mm") : 
                                t("Failed to send")
                              }
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getReminderStatusColor(reminder.status)}>
                            {tAny(reminder.status)}
                          </Badge>
                          {reminder.status === "failed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onResendReminder(reminder.id)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              {t("Retry")}
                            </Button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Create/Edit Template Form */}
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingTemplate ? t("Edit Template") : t("Create New Template")}
                </CardTitle>
                <CardDescription>
                  {editingTemplate ? t("Update reminder template") : t("Create a new reminder template")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={templateForm.handleSubmit(handleTemplateSubmit)} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">{t("Template Name *")}</Label>
                    <Input
                      id="name"
                      {...templateForm.register("name")}
                      className={templateForm.formState.errors.name ? "border-red-500" : ""}
                      placeholder={t("24 Hour SMS Reminder")}
                    />
                    {templateForm.formState.errors.name && (
                      <p className="text-sm text-red-500">{tAny(templateForm.formState.errors.name.message)}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("Reminder Type *")}</Label>
                      <Select onValueChange={(value) => templateForm.setValue("type", value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Select type")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sms">
                            <div className="flex items-center gap-2">
                              <MessageSquare className="h-4 w-4" />
                              {t("SMS")}
                            </div>
                          </SelectItem>
                          <SelectItem value="email">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              {t("Email")}
                            </div>
                          </SelectItem>
                          <SelectItem value="phone">
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              {t("Phone Call")}
                            </div>
                          </SelectItem>
                          <SelectItem value="push">
                            <div className="flex items-center gap-2">
                              <Bell className="h-4 w-4" />
                              {t("Push Notification")}
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timing">{t("Timing (minutes before) *")}</Label>
                      <Select onValueChange={(value) => templateForm.setValue("timing", parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder={t("Select timing")} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30">{t("30 minutes")}</SelectItem>
                          <SelectItem value="60">{t("1 hour")}</SelectItem>
                          <SelectItem value="120">{t("2 hours")}</SelectItem>
                          <SelectItem value="360">{t("6 hours")}</SelectItem>
                          <SelectItem value="720">{t("12 hours")}</SelectItem>
                          <SelectItem value="1440">{t("1 day")}</SelectItem>
                          <SelectItem value="2880">{t("2 days")}</SelectItem>
                          <SelectItem value="4320">{t("3 days")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {templateForm.watch("type") === "email" && (
                    <div className="space-y-2">
                      <Label htmlFor="subject">{t("Email Subject")}</Label>
                      <Input
                        id="subject"
                        {...templateForm.register("subject")}
                        placeholder={t("Appointment Reminder - {appointment_time}")}
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="message">{t("Message *")}</Label>
                    <Textarea
                      id="message"
                      {...templateForm.register("message")}
                      className={templateForm.formState.errors.message ? "border-red-500" : ""}
                      placeholder={t("Hi {patient_name}, you have an appointment with {doctor_name} at {appointment_time}...")}
                      rows={4}
                    />
                    {templateForm.formState.errors.message && (
                      <p className="text-sm text-red-500">{tAny(templateForm.formState.errors.message.message)}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {t("Available variables: {patient_name}, {doctor_name}, {appointment_time}, {clinic_name}, {clinic_phone}, {clinic_address}", {  })}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isActive"
                      {...templateForm.register("isActive")}
                    />
                    <Label htmlFor="isActive">{t("Active Template")}</Label>
                  </div>

                  <div className="flex justify-end space-x-2">
                    {editingTemplate && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingTemplate(null);
                          templateForm.reset();
                        }}
                      >
                        {t("Cancel")}
                      </Button>
                    )}
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? t("Saving...") : (editingTemplate ? t("Update Template") : t("Create Template"))}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Template List */}
            <Card>
              <CardHeader>
                <CardTitle>{t("Reminder Templates")}</CardTitle>
                <CardDescription>
                  {t("Manage your reminder templates")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {allTemplates.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Settings className="mx-auto h-8 w-8 mb-2" />
                      <p>{t("No templates created yet")}</p>
                    </div>
                  ) : (
                    allTemplates.map((template) => (
                      <div key={template.id} className="p-4 border rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{template.name}</span>
                              {!template.isActive && (
                                <Badge variant="outline">{t("Inactive")}</Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <div className="flex items-center gap-1">
                                {getReminderTypeIcon(template.type)}
                                <span className="capitalize">{tAny(template.type)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{t("{timing} min before", { timing: template.timing })}</span>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {template.message}
                            </p>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingTemplate(template);
                                templateForm.reset({
                                  name: template.name,
                                  type: template.type,
                                  timing: template.timing,
                                  message: template.message,
                                  subject: template.subject,
                                  isActive: template.isActive
                                });
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onDeleteTemplate(template.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                {t("Bulk Reminder Scheduling")}
              </CardTitle>
              <CardDescription>
                {t("Send reminders to multiple appointments at once")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={bulkForm.handleSubmit(handleBulkReminderSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label>{t("Reminder Template *")}</Label>
                  <Select onValueChange={(value) => bulkForm.setValue("templateId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select template")} />
                    </SelectTrigger>
                    <SelectContent>
                      {allTemplates
                        .filter(template => template.isActive)
                        .map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            <div className="flex items-center gap-2">
                              {getReminderTypeIcon(template.type)}
                              <span>{template.name}</span>
                              <span className="text-muted-foreground">
                                {t("({timing} min)", { timing: template.timing })}</span>
                            </div>
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Appointment Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>{t("Select Appointments ({length} selected)", { length: selectedAppointments.length })}</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const allIds = appointments.map(apt => apt.id);
                        setSelectedAppointments(
                          selectedAppointments.length === allIds.length ? [] : allIds
                        );
                      }}
                    >
                      {selectedAppointments.length === appointments.length ? t("Deselect All") : t("Select All")}
                    </Button>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto border rounded-lg">
                    {appointments.length === 0 ? (
                      <div className="p-4 text-center text-muted-foreground">
                        {t("No appointments available")}
                      </div>
                    ) : (
                      <div className="space-y-1 p-2">
                        {appointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center space-x-3 p-3 hover:bg-muted rounded"
                          >
                            <Checkbox
                              checked={selectedAppointments.includes(appointment.id)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedAppointments(prev => [...prev, appointment.id]);
                                } else {
                                  setSelectedAppointments(prev => prev.filter(id => id !== appointment.id));
                                }
                              }}
                            />
                            <div className="flex-1 text-sm">
                              <div className="font-medium">
                                {appointment.patientId} - {appointment.doctorId}
                              </div>
                              <div className="text-muted-foreground">
                                {fmt(appointment.appointmentDate, "MMM dd, yyyy HH:mm")}
                              </div>
                            </div>
                            <Badge variant="outline">
                              {tAny(appointment.status)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customMessage">{t("Custom Message (Optional)")}</Label>
                  <Textarea
                    id="customMessage"
                    {...bulkForm.register("customMessage")}
                    placeholder={t("Override template message for this bulk send")}
                    rows={3}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="sendImmediately"
                    {...bulkForm.register("sendImmediately")}
                  />
                  <Label htmlFor="sendImmediately">{t("Send immediately (ignore timing)")}</Label>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isSubmitting || selectedAppointments.length === 0}>
                    {isSubmitting ? t("Scheduling...") : t("Schedule {length} Reminders", { length: selectedAppointments.length })}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scheduled" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Scheduled Reminders")}</CardTitle>
              <CardDescription>
                {t("View and manage upcoming reminders")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledReminders.filter(r => r.status === "pending").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="mx-auto h-12 w-12 mb-4" />
                    <p>{t("No scheduled reminders")}</p>
                  </div>
                ) : (
                  scheduledReminders
                    .filter(reminder => reminder.status === "pending")
                    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
                    .map((reminder) => (
                      <div
                        key={reminder.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-3">
                            {getReminderTypeIcon(reminder.type)}
                            <span className="font-medium">
                              {t("Patient: {patientId}", { patientId: reminder.patientId })}
                            </span>
                            <Badge className={getReminderStatusColor(reminder.status)}>
                              {tAny(reminder.status)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>{t("Scheduled: {scheduledTime}", { scheduledTime: fmt(reminder.scheduledTime, "MMM dd, yyyy HH:mm") })}</div>
                            <div className="line-clamp-1">{t("Message: {message}", { message: reminder.message })}</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onCancelReminder(reminder.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            {t("Cancel")}
                          </Button>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Reminder History")}</CardTitle>
              <CardDescription>
                {t("View sent and failed reminders")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scheduledReminders.filter(r => r.status !== "pending").length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Send className="mx-auto h-12 w-12 mb-4" />
                    <p>{t("No reminder history available")}</p>
                  </div>
                ) : (
                  scheduledReminders
                    .filter(reminder => reminder.status !== "pending")
                    .sort((a, b) => {
                      const aTime = a.sentAt || a.scheduledTime;
                      const bTime = b.sentAt || b.scheduledTime;
                      return new Date(bTime).getTime() - new Date(aTime).getTime();
                    })
                    .map((reminder) => (
                      <div
                        key={reminder.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-3">
                            {getReminderTypeIcon(reminder.type)}
                            <span className="font-medium">
                              {t("Patient: {patientId}", { patientId: reminder.patientId })}
                            </span>
                            <Badge className={getReminderStatusColor(reminder.status)}>
                              {tAny(reminder.status)}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>
                              {reminder.sentAt ? 
                                t("Sent: {sentAt}", { sentAt: fmt(reminder.sentAt, "MMM dd, yyyy HH:mm") }) :
                                t("Failed: {scheduledTime}", { scheduledTime: fmt(reminder.scheduledTime, "MMM dd, yyyy HH:mm") })
                              }
                            </div>
                            <div className="line-clamp-1">{t("Message: {message}", { message: reminder.message })}</div>
                            {reminder.error && (
                              <div className="text-red-600">{t("Error: {error}", { error: reminder.error })}</div>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {reminder.status === "failed" && reminder.retryCount < reminder.maxRetries && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => onResendReminder(reminder.id)}
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              {t("Retry")}
                            </Button>
                          )}
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