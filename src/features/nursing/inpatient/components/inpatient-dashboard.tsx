"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BedManagement } from "./bed-management";
import { PatientAdmission } from "./patient-admission";
import { VitalSignsMonitoring } from "./vital-signs-monitoring";
import { Admission } from "@/features/nursing/inpatient/types";
import { BedDouble, Users, Activity, TrendingUp, UserPlus, Clock, ArrowRight } from "lucide-react";
import { useTabParam } from "@/hooks/use-tab-param";

interface InpatientDashboardProps {
  onSelectPatient?: (admission: Admission) => void;
}

export function InpatientDashboard({ onSelectPatient }: InpatientDashboardProps) {
  const [activeTab, setActiveTab] = useTabParam("overview", ["overview", "beds", "admission", "vitals"] as const);

  // Mock data
  const admissions: Admission[] = [
    {
      id: "1",
      patientId: "PAT001",
      patientName: "John Doe",
      admissionNumber: "ADM-2025-001",
      admissionDate: new Date(2025, 11, 28),
      admittingDoctorId: "DOC001",
      admittingDoctorName: "Dr. Smith",
      department: "Cardiology",
      wardId: "ward-1",
      wardName: "ICU Ward",
      bedId: "bed-1",
      bedNumber: "ICU-101",
      admissionType: "emergency",
      diagnosis: "Acute Myocardial Infarction",
      chiefComplaint: "Chest pain and shortness of breath",
      status: "active",
      estimatedDuration: 5,
    },
    {
      id: "2",
      patientId: "PAT002",
      patientName: "Jane Smith",
      admissionNumber: "ADM-2025-002",
      admissionDate: new Date(2025, 11, 29),
      admittingDoctorId: "DOC002",
      admittingDoctorName: "Dr. Johnson",
      department: "Surgery",
      wardId: "ward-2",
      wardName: "General Ward A",
      bedId: "bed-2",
      bedNumber: "GEN-201",
      admissionType: "elective",
      diagnosis: "Appendicitis",
      chiefComplaint: "Abdominal pain",
      status: "active",
      estimatedDuration: 3,
    },
  ];

  const stats = {
    totalBeds: 120,
    occupiedBeds: 85,
    availableBeds: 35,
    activeAdmissions: admissions.filter((a) => a.status === "active").length,
    admissionsToday: 5,
    dischargesExpected: 8,
    criticalPatients: 3,
    occupancyRate: 71,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inpatient Management</h1>
        <p className="text-muted-foreground">Manage hospital admissions, beds, and patient care</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="beds">Bed Management</TabsTrigger>
          <TabsTrigger value="admission">New Admission</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Beds</CardTitle>
                <BedDouble className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBeds}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.occupiedBeds} occupied · {stats.availableBeds} available
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Occupancy Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.occupancyRate}%</div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500" style={{ width: `${stats.occupancyRate}%` }} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Admissions</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeAdmissions}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.admissionsToday} new today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical Patients</CardTitle>
                <Activity className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.criticalPatients}</div>
                <p className="text-xs text-muted-foreground">Require immediate attention</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Admissions */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Admissions</CardTitle>
                  <CardDescription>Currently admitted patients</CardDescription>
                </div>
                <Button onClick={() => setActiveTab("admission")}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  New Admission
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {admissions.map((admission) => (
                  <Card
                    key={admission.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onSelectPatient?.(admission)}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{admission.patientName}</h3>
                            <Badge variant="outline">{admission.admissionNumber}</Badge>
                            <Badge
                              variant={
                                admission.admissionType === "emergency" ? "destructive" : "default"
                              }
                              className="capitalize"
                            >
                              {admission.admissionType}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Department</div>
                              <div className="font-medium">{admission.department}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Ward/Bed</div>
                              <div className="font-medium">{admission.bedNumber}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Attending Doctor</div>
                              <div className="font-medium">{admission.admittingDoctorName}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Admitted</div>
                              <div className="font-medium">
                                {new Date(admission.admissionDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm">
                            <div className="text-muted-foreground">Diagnosis</div>
                            <div>{admission.diagnosis}</div>
                          </div>
                        </div>
                        <ArrowRight className="h-5 w-5 text-muted-foreground ml-4" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Expected Discharges */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Expected Discharges Today
              </CardTitle>
              <CardDescription>{stats.dischargesExpected} patients expected to be discharged</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <p>No pending discharges for today</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beds">
          <BedManagement />
        </TabsContent>

        <TabsContent value="admission">
          <PatientAdmission />
        </TabsContent>

        <TabsContent value="vitals">
          <VitalSignsMonitoring />
        </TabsContent>
      </Tabs>
    </div>
  );
}
