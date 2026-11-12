"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { 
  Video, 
  Phone, 
  MessageSquare, 
  Monitor, 
  Mic, 
  MicOff, 
  VideoOff,
  Share,
  CircleDot,
  Calendar,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Play,
  Square
} from "lucide-react";
import { telemedicineSessionSchema, TelemedicineSessionFormData } from "@/lib/validations/scheduling";
import { TelemedicineSession, SchedulingAppointment } from "@/types/scheduling";
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

interface TelemedicineManagementProps {
  telemedicineSessions: TelemedicineSession[];
  telemedicineAppointments: SchedulingAppointment[];
  onCreateSession: (data: TelemedicineSessionFormData) => void;
  onStartSession: (sessionId: string) => void;
  onEndSession: (sessionId: string) => void;
  onJoinSession: (sessionId: string) => void;
}

export function TelemedicineManagement({
  telemedicineSessions,
  telemedicineAppointments,
  onCreateSession,
  onStartSession,
  onEndSession,
  onJoinSession
}: TelemedicineManagementProps) {
  const [activeTab, setActiveTab] = useState("sessions");
  const [selectedSession, setSelectedSession] = useState<TelemedicineSession | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeSessionControls, setActiveSessionControls] = useState({
    video: true,
    audio: true,
    screen: false,
    recording: false
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch
  } = useForm<TelemedicineSessionFormData>({
    resolver: zodResolver(telemedicineSessionSchema),
    defaultValues: {
      sessionType: "video",
      recordingEnabled: false,
      chatEnabled: true,
      screenSharingEnabled: true,
      requiresSpecialEquipment: false,
      estimatedDuration: 30
    }
  });

  const watchedSessionType = watch("sessionType");

  const handleSessionSubmit = async (data: TelemedicineSessionFormData) => {
    setIsSubmitting(true);
    try {
      await onCreateSession(data);
      reset();
    } finally {
      setIsSubmitting(false);
    }
  };

  const getSessionStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in-progress":
        return "bg-green-100 text-green-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getUpcomingSessions = () => {
    return telemedicineSessions.filter(session => 
      session.status === "scheduled" && 
      new Date(session.scheduledStart) > new Date()
    ).sort((a, b) => 
      new Date(a.scheduledStart).getTime() - new Date(b.scheduledStart).getTime()
    );
  };

  const getActiveSessions = () => {
    return telemedicineSessions.filter(session => session.status === "in-progress");
  };

  const mockPatients = [
    { id: "PAT001", name: "John Smith" },
    { id: "PAT002", name: "Mary Johnson" },
    { id: "PAT003", name: "Robert Davis" },
  ];

  const mockDoctors = [
    { id: "DOC001", name: "Dr. Sarah Johnson" },
    { id: "DOC002", name: "Dr. Michael Chen" },
    { id: "DOC003", name: "Dr. Emily Rodriguez" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-purple-600">Telemedicine Center</h1>
          <p className="text-muted-foreground">
            Virtual consultations and remote patient care management
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">Active Sessions: </span>
            <span className="text-2xl font-bold text-green-600">{getActiveSessions().length}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{getUpcomingSessions().length}</p>
                <p className="text-xs text-muted-foreground">Upcoming Sessions</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{getActiveSessions().length}</p>
                <p className="text-xs text-muted-foreground">Active Sessions</p>
              </div>
              <Video className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {telemedicineSessions.filter(s => s.status === "completed").length}
                </p>
                <p className="text-xs text-muted-foreground">Completed Today</p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">
                  {telemedicineAppointments.length}
                </p>
                <p className="text-xs text-muted-foreground">Total Appointments</p>
              </div>
              <Monitor className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="sessions">Active Sessions</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="schedule">Schedule New</TabsTrigger>
          <TabsTrigger value="history">Session History</TabsTrigger>
        </TabsList>

        <TabsContent value="sessions" className="space-y-4">
          {getActiveSessions().length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Video className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Active Sessions</h3>
                  <p className="text-muted-foreground">
                    There are currently no ongoing telemedicine sessions
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {getActiveSessions().map((session) => (
                <Card key={session.id} className="border-green-500 shadow-green-100">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">
                            Session {session.id.slice(-6)}
                          </h3>
                          <Badge className="bg-green-500 text-white">
                            <Video className="mr-1 h-3 w-3" />
                            LIVE
                          </Badge>
                          <Badge variant="outline">
                            Duration: {session.actualStart ? 
                              Math.floor((new Date().getTime() - new Date(session.actualStart).getTime()) / 60000)
                              : 0} min
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div><span className="font-medium">Patient:</span> {session.patientId}</div>
                            <div><span className="font-medium">Doctor:</span> {session.doctorId}</div>
                            <div><span className="font-medium">Started:</span> {
                              session.actualStart ? format(session.actualStart, "HH:mm") : "N/A"
                            }</div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex gap-2">
                              {session.recordingEnabled && (
                                <Badge variant="outline">
                                  <CircleDot className="mr-1 h-3 w-3 text-red-500" />
                                  Recording
                                </Badge>
                              )}
                              {session.chatEnabled && (
                                <Badge variant="outline">
                                  <MessageSquare className="mr-1 h-3 w-3" />
                                  Chat
                                </Badge>
                              )}
                              {session.screenSharingEnabled && (
                                <Badge variant="outline">
                                  <Share className="mr-1 h-3 w-3" />
                                  Screen Share
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Session Controls */}
                        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <Button
                            size="sm"
                            variant={activeSessionControls.video ? "default" : "outline"}
                            onClick={() => setActiveSessionControls(prev => ({
                              ...prev,
                              video: !prev.video
                            }))}
                          >
                            {activeSessionControls.video ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant={activeSessionControls.audio ? "default" : "outline"}
                            onClick={() => setActiveSessionControls(prev => ({
                              ...prev,
                              audio: !prev.audio
                            }))}
                          >
                            {activeSessionControls.audio ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                          </Button>
                          <Button
                            size="sm"
                            variant={activeSessionControls.screen ? "default" : "outline"}
                            onClick={() => setActiveSessionControls(prev => ({
                              ...prev,
                              screen: !prev.screen
                            }))}
                          >
                            <Share className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant={activeSessionControls.recording ? "destructive" : "outline"}
                            onClick={() => setActiveSessionControls(prev => ({
                              ...prev,
                              recording: !prev.recording
                            }))}
                          >
                            {activeSessionControls.recording ? <Square className="h-4 w-4" /> : <CircleDot className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          onClick={() => onJoinSession(session.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Video className="mr-2 h-4 w-4" />
                          Join Session
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => onEndSession(session.id)}
                        >
                          End Session
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="upcoming" className="space-y-4">
          {getUpcomingSessions().length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Upcoming Sessions</h3>
                  <p className="text-muted-foreground">
                    No telemedicine sessions scheduled for today
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {getUpcomingSessions().map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">
                            Session {session.id.slice(-6)}
                          </h3>
                          <Badge className={getSessionStatusColor(session.status)}>
                            {session.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Patient:</span> {session.patientId}
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Doctor:</span> {session.doctorId}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Scheduled:</span> {format(session.scheduledStart, "MMM dd, HH:mm")}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex gap-2 flex-wrap">
                              {session.recordingEnabled && (
                                <Badge variant="outline">
                                  <CircleDot className="mr-1 h-3 w-3" />
                                  Recording
                                </Badge>
                              )}
                              {session.chatEnabled && (
                                <Badge variant="outline">
                                  <MessageSquare className="mr-1 h-3 w-3" />
                                  Chat
                                </Badge>
                              )}
                              {session.screenSharingEnabled && (
                                <Badge variant="outline">
                                  <Share className="mr-1 h-3 w-3" />
                                  Screen Share
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Time until session */}
                        <div className="text-sm text-muted-foreground">
                          Starts in {Math.max(0, Math.floor((new Date(session.scheduledStart).getTime() - new Date().getTime()) / 60000))} minutes
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {new Date(session.scheduledStart).getTime() - new Date().getTime() < 15 * 60 * 1000 && (
                          <Button
                            onClick={() => onStartSession(session.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Play className="mr-2 h-4 w-4" />
                            Start Early
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => setSelectedSession(session)}
                        >
                          View Details
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5 text-purple-500" />
                Schedule Telemedicine Session
              </CardTitle>
              <CardDescription>
                Create a new virtual consultation session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handleSessionSubmit)} className="space-y-6">
                {/* Appointment and Participants */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Appointment *</Label>
                    <Select onValueChange={(value) => setValue("appointmentId", value)}>
                      <SelectTrigger className={errors.appointmentId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select appointment" />
                      </SelectTrigger>
                      <SelectContent>
                        {telemedicineAppointments.map((appointment) => (
                          <SelectItem key={appointment.id} value={appointment.id}>
                            {appointment.patientId} - {format(appointment.appointmentDate, "MMM dd, HH:mm")}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.appointmentId && (
                      <p className="text-sm text-red-500">{errors.appointmentId.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Session Type *</Label>
                    <Select onValueChange={(value) => setValue("sessionType", value as any)}>
                      <SelectTrigger className={errors.sessionType ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select session type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Video Call
                          </div>
                        </SelectItem>
                        <SelectItem value="audio">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4" />
                            Audio Call
                          </div>
                        </SelectItem>
                        <SelectItem value="chat">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Text Chat
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.sessionType && (
                      <p className="text-sm text-red-500">{errors.sessionType.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Patient *</Label>
                    <Select onValueChange={(value) => setValue("patientId", value)}>
                      <SelectTrigger className={errors.patientId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select patient" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockPatients.map((patient) => (
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

                  <div className="space-y-2">
                    <Label htmlFor="doctorId">Doctor *</Label>
                    <Select onValueChange={(value) => setValue("doctorId", value)}>
                      <SelectTrigger className={errors.doctorId ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select doctor" />
                      </SelectTrigger>
                      <SelectContent>
                        {mockDoctors.map((doctor) => (
                          <SelectItem key={doctor.id} value={doctor.id}>
                            {doctor.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.doctorId && (
                      <p className="text-sm text-red-500">{errors.doctorId.message}</p>
                    )}
                  </div>
                </div>

                {/* Session Configuration */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Session Features</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="recordingEnabled"
                          {...register("recordingEnabled")}
                        />
                        <Label htmlFor="recordingEnabled" className="flex items-center gap-2">
                          <CircleDot className="h-4 w-4 text-red-500" />
                          Enable Recording
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="chatEnabled"
                          {...register("chatEnabled")}
                        />
                        <Label htmlFor="chatEnabled" className="flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Enable Chat
                        </Label>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="screenSharingEnabled"
                          {...register("screenSharingEnabled")}
                        />
                        <Label htmlFor="screenSharingEnabled" className="flex items-center gap-2">
                          <Share className="h-4 w-4" />
                          Enable Screen Sharing
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="requiresSpecialEquipment"
                          {...register("requiresSpecialEquipment")}
                        />
                        <Label htmlFor="requiresSpecialEquipment" className="flex items-center gap-2">
                          <Monitor className="h-4 w-4" />
                          Special Equipment Required
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimatedDuration">Duration (minutes) *</Label>
                    <Input
                      id="estimatedDuration"
                      type="number"
                      min="15"
                      max="120"
                      {...register("estimatedDuration", { valueAsNumber: true })}
                      className={errors.estimatedDuration ? "border-red-500" : ""}
                    />
                    {errors.estimatedDuration && (
                      <p className="text-sm text-red-500">{errors.estimatedDuration.message}</p>
                    )}
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="equipmentNotes">Equipment Notes</Label>
                    <Textarea
                      id="equipmentNotes"
                      {...register("equipmentNotes")}
                      placeholder="Special equipment or setup requirements"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="patientInstructions">Patient Instructions</Label>
                    <Textarea
                      id="patientInstructions"
                      {...register("patientInstructions")}
                      placeholder="Instructions for the patient to prepare for the session"
                      rows={3}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => reset()}>
                    Clear Form
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-purple-600 hover:bg-purple-700">
                    {isSubmitting ? "Creating..." : "Schedule Session"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session History</CardTitle>
              <CardDescription>
                View completed and cancelled telemedicine sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {telemedicineSessions
                  .filter(session => session.status === "completed" || session.status === "cancelled")
                  .length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Video className="mx-auto h-12 w-12 mb-4" />
                    <p>No session history available</p>
                  </div>
                ) : (
                  telemedicineSessions
                    .filter(session => session.status === "completed" || session.status === "cancelled")
                    .map((session) => (
                      <div
                        key={session.id}
                        className="flex items-center justify-between p-4 border rounded-lg"
                      >
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Session {session.id.slice(-6)}</span>
                            <Badge className={getSessionStatusColor(session.status)}>
                              {session.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <div>Patient: {session.patientId} • Doctor: {session.doctorId}</div>
                            <div>
                              {session.actualStart && session.actualEnd && (
                                <>Started: {format(session.actualStart, "MMM dd, HH:mm")} • 
                                Duration: {Math.floor((new Date(session.actualEnd).getTime() - new Date(session.actualStart).getTime()) / 60000)} min</>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {session.recordingUrl && (
                            <Button size="sm" variant="outline">
                              View Recording
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            View Details
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