"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { 
  AlertTriangle, 
  Heart, 
  Thermometer, 
  Activity, 
  Clock, 
  User,
  Stethoscope,
  Pill,
  CheckCircle,
  XCircle,
  RotateCcw
} from "lucide-react";
import { emergencyTriageSchema, EmergencyTriageFormData } from "@/features/front-desk/scheduling/validations";
import { EmergencyQueue } from "@/features/front-desk/scheduling/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

interface EmergencyTriageManagementProps {
  emergencyQueue: EmergencyQueue[];
  onSubmitTriage: (data: EmergencyTriageFormData) => void;
  onUpdateEmergencyStatus: (emergencyId: string, status: string, assignedDoctor?: string) => void;
  onTransferPatient: (emergencyId: string, department: string) => void;
}

export function EmergencyTriageManagement({
  emergencyQueue,
  onSubmitTriage,
  onUpdateEmergencyStatus,
  onTransferPatient
}: EmergencyTriageManagementProps) {
  const [activeTab, setActiveTab] = useState("queue");
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyQueue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    trigger
  } = useForm<EmergencyTriageFormData>({
    resolver: zodResolver(emergencyTriageSchema),
  });

  const handleTriageSubmit = async (data: EmergencyTriageFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmitTriage(data);
      reset();
    } finally {
      setIsSubmitting(false);
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "transferred":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const priorityDescriptions = {
    critical: "Life-threatening condition requiring immediate attention",
    high: "Severe condition requiring urgent care within 10 minutes",
    medium: "Moderate condition requiring care within 30 minutes",
    low: "Minor condition that can wait up to 2 hours"
  };

  const departments = [
    "Emergency Medicine",
    "Cardiology",
    "Neurology",
    "Surgery",
    "Pediatrics",
    "Orthopedics",
    "Radiology",
    "Intensive Care",
    "Operating Room"
  ];

  const mockDoctors = [
    { id: "DOC001", name: "Dr. Sarah Johnson", department: "Emergency Medicine" },
    { id: "DOC002", name: "Dr. Michael Chen", department: "Cardiology" },
    { id: "DOC003", name: "Dr. Emily Rodriguez", department: "Emergency Medicine" },
    { id: "DOC004", name: "Dr. David Wilson", department: "Surgery" },
  ];

  const sortedQueue = emergencyQueue.sort((a, b) => {
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(a.arrivalTime).getTime() - new Date(b.arrivalTime).getTime();
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-red-600">Emergency Triage</h1>
          <p className="text-muted-foreground">
            Manage emergency patients based on priority and medical urgency
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm">
            <span className="font-medium">Total in Queue: </span>
            <span className="text-2xl font-bold text-red-600">{emergencyQueue.length}</span>
          </div>
        </div>
      </div>

      {/* Emergency Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {(["critical", "high", "medium", "low"] as const).map((priority) => {
          const count = emergencyQueue.filter(e => e.priority === priority).length;
          return (
            <Card key={priority}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className={cn("text-xs font-medium", {
                      "text-red-600": priority === "critical",
                      "text-orange-600": priority === "high",
                      "text-yellow-600": priority === "medium",
                      "text-green-600": priority === "low",
                    })}>
                      {priority.toUpperCase()} Priority
                    </p>
                  </div>
                  <AlertTriangle className={cn("h-8 w-8", {
                    "text-red-500": priority === "critical",
                    "text-orange-500": priority === "high",
                    "text-yellow-500": priority === "medium",
                    "text-green-500": priority === "low",
                  })} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="queue">Emergency Queue</TabsTrigger>
          <TabsTrigger value="triage">New Triage</TabsTrigger>
        </TabsList>

        <TabsContent value="queue" className="space-y-4">
          {sortedQueue.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <Heart className="mx-auto h-12 w-12 text-green-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-green-600">All Clear!</h3>
                  <p className="text-muted-foreground">
                    No emergency patients in the queue at this time
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {sortedQueue.map((emergency, index) => (
                <Card key={emergency.id} className={cn("hover:shadow-md transition-shadow", {
                  "border-red-500 shadow-red-100": emergency.priority === "critical",
                  "border-orange-500 shadow-orange-100": emergency.priority === "high",
                })}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                            <h3 className="text-lg font-semibold">{emergency.patientName}</h3>
                          </div>
                          <Badge className={getPriorityColor(emergency.priority)}>
                            {emergency.priority.toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(emergency.status)}>
                            {emergency.status}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Patient ID:</span> {emergency.patientId}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Arrival:</span> {format(emergency.arrivalTime, "HH:mm")}
                            </div>
                            <div className="flex items-center gap-1">
                              <Activity className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium">Department:</span> {emergency.department}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div>
                              <span className="font-medium">Wait Time:</span> ~{emergency.estimatedWaitTime} min
                            </div>
                            {emergency.assignedDoctor && (
                              <div className="flex items-center gap-1">
                                <Stethoscope className="h-4 w-4 text-muted-foreground" />
                                <span className="font-medium">Assigned:</span> {emergency.assignedDoctor}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="p-3 bg-gray-50 rounded-lg">
                          <span className="font-medium text-sm">Triage Notes:</span>
                          <p className="text-sm mt-1">{emergency.triageNotes}</p>
                        </div>

                        <div className="text-xs text-muted-foreground">
                          {priorityDescriptions[emergency.priority]}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 ml-4">
                        {emergency.status === "waiting" && (
                          <>
                            <Select onValueChange={(doctorId) => {
                              const doctor = mockDoctors.find(d => d.id === doctorId);
                              onUpdateEmergencyStatus(emergency.id, "in-progress", doctor?.name);
                            }}>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Assign Doctor" />
                              </SelectTrigger>
                              <SelectContent>
                                {mockDoctors
                                  .filter(d => d.department === emergency.department || d.department === "Emergency Medicine")
                                  .map((doctor) => (
                                  <SelectItem key={doctor.id} value={doctor.id}>
                                    {doctor.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </>
                        )}

                        {emergency.status === "in-progress" && (
                          <div className="space-y-2">
                            <Button
                              size="sm"
                              onClick={() => onUpdateEmergencyStatus(emergency.id, "completed")}
                              className="w-full"
                            >
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Complete
                            </Button>
                            <Select onValueChange={(dept) => onTransferPatient(emergency.id, dept)}>
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Transfer to..." />
                              </SelectTrigger>
                              <SelectContent>
                                {departments.map((dept) => (
                                  <SelectItem key={dept} value={dept}>
                                    {dept}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedEmergency(emergency)}
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

        <TabsContent value="triage" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Emergency Triage Assessment
              </CardTitle>
              <CardDescription>
                Perform initial assessment and prioritize emergency patients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(handleTriageSubmit)} className="space-y-6">
                {/* Patient Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="patientId">Patient ID *</Label>
                    <Input
                      id="patientId"
                      {...register("patientId")}
                      placeholder="Enter patient ID"
                      className={errors.patientId ? "border-red-500" : ""}
                    />
                    {errors.patientId && (
                      <p className="text-sm text-red-500">{errors.patientId.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="patientName">Patient Name *</Label>
                    <Input
                      id="patientName"
                      {...register("patientName")}
                      placeholder="Enter patient name"
                      className={errors.patientName ? "border-red-500" : ""}
                    />
                    {errors.patientName && (
                      <p className="text-sm text-red-500">{errors.patientName.message}</p>
                    )}
                  </div>
                </div>

                {/* Chief Complaint */}
                <div className="space-y-2">
                  <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
                  <Textarea
                    id="chiefComplaint"
                    {...register("chiefComplaint")}
                    placeholder="Describe the patient's primary concern or symptoms"
                    rows={3}
                    className={errors.chiefComplaint ? "border-red-500" : ""}
                  />
                  {errors.chiefComplaint && (
                    <p className="text-sm text-red-500">{errors.chiefComplaint.message}</p>
                  )}
                </div>

                {/* Vital Signs */}
                <div className="space-y-4">
                  <Label className="text-base font-medium">Vital Signs</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="temperature" className="flex items-center gap-2">
                        <Thermometer className="h-4 w-4" />
                        Temperature (°F)
                      </Label>
                      <Input
                        id="temperature"
                        type="number"
                        step="0.1"
                        {...register("vitalSigns.temperature", { valueAsNumber: true })}
                        placeholder="98.6"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bloodPressure">Blood Pressure</Label>
                      <Input
                        id="bloodPressure"
                        {...register("vitalSigns.bloodPressure")}
                        placeholder="120/80"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="heartRate" className="flex items-center gap-2">
                        <Heart className="h-4 w-4" />
                        Heart Rate (bpm)
                      </Label>
                      <Input
                        id="heartRate"
                        type="number"
                        {...register("vitalSigns.heartRate", { valueAsNumber: true })}
                        placeholder="72"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="respiratoryRate">Respiratory Rate (bpm)</Label>
                      <Input
                        id="respiratoryRate"
                        type="number"
                        {...register("vitalSigns.respiratoryRate", { valueAsNumber: true })}
                        placeholder="16"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
                      <Input
                        id="oxygenSaturation"
                        type="number"
                        min="0"
                        max="100"
                        {...register("vitalSigns.oxygenSaturation", { valueAsNumber: true })}
                        placeholder="98"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="painLevel">Pain Level (0-10)</Label>
                      <Input
                        id="painLevel"
                        type="number"
                        min="0"
                        max="10"
                        {...register("vitalSigns.painLevel", { valueAsNumber: true })}
                        placeholder="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Priority and Assessment */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Priority Level *</Label>
                    <Select onValueChange={(value) => setValue("priority", value as any)}>
                      <SelectTrigger className={errors.priority ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select priority level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                            <span>Critical - Life threatening</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="high">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                            <span>High - Urgent care needed</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                            <span>Medium - Moderate condition</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="low">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <span>Low - Minor condition</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.priority && (
                      <p className="text-sm text-red-500">{errors.priority.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label>Consciousness Level *</Label>
                    <Select onValueChange={(value) => setValue("consciousness", value as any)}>
                      <SelectTrigger className={errors.consciousness ? "border-red-500" : ""}>
                        <SelectValue placeholder="Select consciousness level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="alert">Alert and responsive</SelectItem>
                        <SelectItem value="drowsy">Drowsy or confused</SelectItem>
                        <SelectItem value="unconscious">Unconscious</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.consciousness && (
                      <p className="text-sm text-red-500">{errors.consciousness.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Arrival Mode *</Label>
                    <Select onValueChange={(value) => setValue("arrivalMode", value as any)}>
                      <SelectTrigger className={errors.arrivalMode ? "border-red-500" : ""}>
                        <SelectValue placeholder="How did patient arrive?" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="walk-in">Walk-in</SelectItem>
                        <SelectItem value="ambulance">Ambulance</SelectItem>
                        <SelectItem value="transfer">Transfer from other facility</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.arrivalMode && (
                      <p className="text-sm text-red-500">{errors.arrivalMode.message}</p>
                    )}
                  </div>
                </div>

                {/* Medical Information */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="triageNotes">Triage Assessment Notes *</Label>
                    <Textarea
                      id="triageNotes"
                      {...register("triageNotes")}
                      placeholder="Detailed assessment notes, observations, and initial treatment recommendations"
                      rows={4}
                      className={errors.triageNotes ? "border-red-500" : ""}
                    />
                    {errors.triageNotes && (
                      <p className="text-sm text-red-500">{errors.triageNotes.message}</p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="allergies">Known Allergies</Label>
                      <Textarea
                        id="allergies"
                        {...register("allergies")}
                        placeholder="List any known allergies"
                        rows={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currentMedications">Current Medications</Label>
                      <Textarea
                        id="currentMedications"
                        {...register("currentMedications")}
                        placeholder="List current medications"
                        rows={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4 pt-4">
                  <Button type="button" variant="outline" onClick={() => reset()}>
                    Clear Form
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="bg-red-600 hover:bg-red-700">
                    {isSubmitting ? "Adding to Queue..." : "Add to Emergency Queue"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}