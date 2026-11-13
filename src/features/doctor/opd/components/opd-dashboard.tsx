"use client";

import React, { useState } from "react";
import { Calendar, Users, FileText, Stethoscope, Pill, Activity, ChevronRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OPDPatient, ConsultationNote, Diagnosis, TreatmentPlan, Prescription } from "@/features/doctor/opd/types";

interface OPDDashboardProps {
  patients: OPDPatient[];
  consultations: ConsultationNote[];
  diagnoses: Diagnosis[];
  treatments: TreatmentPlan[];
  prescriptions: Prescription[];
  onNavigateToRegistration: () => void;
  onNavigateToConsultation: () => void;
  onNavigateToDiagnosis: () => void;
  onNavigateToPrescription: () => void;
}

interface DashboardStats {
  todayPatients: number;
  pendingConsultations: number;
  activeTreatments: number;
}

export function OPDDashboard({
  patients,
  consultations,
  diagnoses,
  treatments,
  prescriptions,
  onNavigateToRegistration,
  onNavigateToConsultation,
  onNavigateToDiagnosis,
  onNavigateToPrescription,
}: OPDDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");

  // Calculate dashboard statistics
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats: DashboardStats = {
    todayPatients: patients.filter(p => new Date(p.visitInfo.registrationDate) >= today).length,
    pendingConsultations: consultations.length, // ConsultationNote doesn't have status field
    activeTreatments: treatments.filter(t => t.status === "in_progress").length,
  };

  // Recent activities
  const recentPatients = patients
    .sort((a, b) => new Date(b.visitInfo.registrationDate).getTime() - new Date(a.visitInfo.registrationDate).getTime())
    .slice(0, 5);

  const recentConsultations = consultations
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const urgentTreatments = treatments
    .filter(t => t.priority === "urgent" && t.status === "in_progress")
    .slice(0, 3);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
      case "completed":
      case "paid": return "bg-green-100 text-green-800";
      case "in_progress":
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "cancelled":
      case "overdue": return "bg-red-100 text-red-800";
      case "on_hold":
      case "partial": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">OPD Management Dashboard</h1>
        <p className="text-gray-600">Comprehensive outpatient department management</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayPatients}</div>
            <p className="text-xs text-muted-foreground">
              +{Math.round((stats.todayPatients / Math.max(patients.length, 1)) * 100)}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Consultations</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingConsultations}</div>
            <p className="text-xs text-muted-foreground">
              {consultations.length} total consultations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Treatments</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTreatments}</div>
            <p className="text-xs text-muted-foreground">
              {treatments.length} total treatments
            </p>
          </CardContent>
        </Card>

      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Navigate to common OPD tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={onNavigateToRegistration}
            >
              <Users className="h-6 w-6" />
              <span className="text-sm">New Patient</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={onNavigateToConsultation}
            >
              <Stethoscope className="h-6 w-6" />
              <span className="text-sm">Consultation</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={onNavigateToDiagnosis}
            >
              <FileText className="h-6 w-6" />
              <span className="text-sm">Diagnosis</span>
            </Button>
            <Button
              variant="outline"
              className="h-20 flex flex-col gap-2"
              onClick={onNavigateToPrescription}
            >
              <Pill className="h-6 w-6" />
              <span className="text-sm">Prescription</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Patients</CardTitle>
              <Button variant="ghost" size="sm" onClick={onNavigateToRegistration}>
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Latest patient registrations</CardDescription>
          </CardHeader>
          <CardContent>
            {recentPatients.length > 0 ? (
              <div className="space-y-3">
                {recentPatients.map((patient) => (
                  <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{patient.personalInfo.firstName} {patient.personalInfo.lastName}</p>
                      <p className="text-sm text-muted-foreground">
                        {patient.visitInfo.chiefComplaint} • {new Date(patient.visitInfo.registrationDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(patient.status)}>
                        {patient.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={getPriorityColor(patient.visitInfo.priority)}>
                        {patient.visitInfo.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No recent patients</p>
            )}
          </CardContent>
        </Card>

        {/* Recent Consultations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Active Consultations</CardTitle>
              <Button variant="ghost" size="sm" onClick={onNavigateToConsultation}>
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Ongoing patient consultations</CardDescription>
          </CardHeader>
          <CardContent>
            {recentConsultations.length > 0 ? (
              <div className="space-y-3">
                {recentConsultations.map((consultation) => (
                  <div key={consultation.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Patient ID: {consultation.patientId}</p>
                      <p className="text-sm text-muted-foreground">
                        {consultation.chiefComplaint} • {new Date(consultation.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline">
                      consultation
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No active consultations</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Treatments */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Urgent Treatments</CardTitle>
              <Button variant="ghost" size="sm" onClick={onNavigateToDiagnosis}>
                View All <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <CardDescription>High priority treatment plans</CardDescription>
          </CardHeader>
          <CardContent>
            {urgentTreatments.length > 0 ? (
              <div className="space-y-3">
                {urgentTreatments.map((treatment) => (
                  <div key={treatment.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{treatment.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {treatment.planType} • Due: {new Date(treatment.endDate || treatment.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getPriorityColor(treatment.priority)}>
                        {treatment.priority}
                      </Badge>
                      <Badge className={getStatusColor(treatment.status)}>
                        {treatment.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No urgent treatments</p>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Department Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
          <CardDescription>Key metrics and performance indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Patient Satisfaction</span>
                <span className="text-sm text-muted-foreground">95%</span>
              </div>
              <Progress value={95} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Treatment Completion</span>
                <span className="text-sm text-muted-foreground">88%</span>
              </div>
              <Progress value={88} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Payment Collection</span>
                <span className="text-sm text-muted-foreground">92%</span>
              </div>
              <Progress value={92} className="h-2" />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{patients.length}</p>
              <p className="text-sm text-muted-foreground">Total Patients</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{prescriptions.length}</p>
              <p className="text-sm text-muted-foreground">Prescriptions</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{diagnoses.length}</p>
              <p className="text-sm text-muted-foreground">Diagnoses</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{consultations.length}</p>
              <p className="text-sm text-muted-foreground">Consultations</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}