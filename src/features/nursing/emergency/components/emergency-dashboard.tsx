"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmergencyCase, ERBed, Ambulance } from "@/features/nursing/emergency/types";
import { Ambulance as AmbulanceIcon, Activity, Users, Clock, AlertCircle, Bed } from "lucide-react";
import { format } from "date-fns";
import { useTabParam } from "@/hooks/use-tab-param";

export function EmergencyDashboard() {
  const [activeTab, setActiveTab] = useTabParam("overview", ["overview", "cases", "beds", "ambulances"] as const);

  // Mock data
  const cases: EmergencyCase[] = [
    {
      id: "1",
      caseNumber: "ER-2025-001",
      patientId: "PAT001",
      patientName: "Jane Smith",
      age: 45,
      gender: "female",
      arrivalTime: new Date(),
      arrivalMode: "ambulance",
      triageCategory: "urgent",
      triageScore: 2,
      presentingSymptoms: ["Chest pain", "Shortness of breath"],
      initialAssessment: "Possible cardiac event",
      investigations: [],
      treatments: [],
      medications: [],
      chiefComplaint: "Chest pain, shortness of breath",
      vitalSigns: {
        temperature: 37.2,
        bloodPressure: "150/95",
        heartRate: 105,
        respiratoryRate: 22,
        oxygenSaturation: 94,
        consciousness: "alert",
      },
      assignedDoctorId: "DOC001",
      assignedDoctorName: "Dr. Johnson",
      assignedNurseId: "NUR001",
      assignedNurseName: "Nurse Mary",
      bedId: "BED001",
      bedNumber: "ER-1",
      status: "in-treatment",
      disposition: "admitted",
      followUpRequired: false,
      createdBy: "ER Nurse",
    },
  ];

  const beds: ERBed[] = [
    {
      id: "BED001",
      bedNumber: "ER-1",
      bedType: "resuscitation",
      status: "occupied",
      location: "Resuscitation Bay",
      equipment: ["Ventilator", "Cardiac Monitor", "Defibrillator"],
      currentPatientId: "PAT001",
      currentPatientName: "Jane Smith",
    },
    {
      id: "BED002",
      bedNumber: "ER-2",
      bedType: "observation",
      status: "available",
      location: "Observation Area",
      equipment: ["Monitor", "Oxygen"],
    },
  ];

  const ambulances: Ambulance[] = [
    {
      id: "AMB001",
      vehicleNumber: "AMB-101",
      type: "advanced",
      status: "on-call",
      currentLocation: "Hospital Base",
      capacity: 2,
      crew: [
        { staffId: "PMD001", name: "Paramedic Mike", role: "paramedic" },
        { staffId: "EMT001", name: "EMT Sarah", role: "emt" },
      ],
      equipment: ["Defibrillator", "Ventilator", "Stretcher", "Trauma Kit"],
      lastMaintenance: new Date(2025, 0, 1),
      nextMaintenance: new Date(2025, 6, 1),
      mileage: 15000,
      isActive: true,
    },
  ];

  const stats = {
    totalCases: 24,
    waiting: 8,
    inTreatment: 12,
    admitted: 3,
    discharged: 1,
    critical: 2,
    urgent: 5,
    semiUrgent: 9,
    nonUrgent: 8,
    averageWaitTime: 15,
    totalBeds: 20,
    occupiedBeds: 14,
    availableBeds: 6,
    ambulancesAvailable: 3,
    ambulancesOnCall: 2,
  };

  const getTriageColor = (level: number) => {
    switch (level) {
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      case 5:
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Emergency Room Management</h1>
        <p className="text-muted-foreground">Real-time ER operations and patient tracking</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cases">Active Cases</TabsTrigger>
          <TabsTrigger value="beds">ER Beds</TabsTrigger>
          <TabsTrigger value="ambulances">Ambulances</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Cases</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCases}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.waiting} waiting · {stats.inTreatment} in treatment
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Critical/Urgent</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.critical + stats.urgent}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.critical} critical · {stats.urgent} urgent
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bed Occupancy</CardTitle>
                <Bed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.occupiedBeds}/{stats.totalBeds}
                </div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${(stats.occupiedBeds / stats.totalBeds) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Wait Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageWaitTime} min</div>
                <p className="text-xs text-muted-foreground">
                  {stats.ambulancesAvailable} ambulances available
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Triage Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Triage Distribution</CardTitle>
              <CardDescription>Current cases by severity level</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm font-medium">Level 1 - Resuscitation (Critical)</span>
                  </div>
                  <Badge variant="destructive">{stats.critical}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm font-medium">Level 2 - Emergency (Urgent)</span>
                  </div>
                  <Badge className="bg-orange-500">{stats.urgent}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm font-medium">Level 3 - Urgent (Semi-Urgent)</span>
                  </div>
                  <Badge className="bg-yellow-500">{stats.semiUrgent}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Level 4 - Semi-Urgent (Non-Urgent)</span>
                  </div>
                  <Badge className="bg-green-500">{stats.nonUrgent}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cases" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active ER Cases</CardTitle>
                  <CardDescription>Current emergency cases in the system</CardDescription>
                </div>
                <Button>
                  <Activity className="mr-2 h-4 w-4" />
                  New Case
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cases.map((case_) => (
                  <Card key={case_.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{case_.caseNumber}</Badge>
                            <h3 className="font-semibold text-lg">{case_.patientName}</h3>
                            <Badge className={`${getTriageColor(case_.triageScore)} text-white`}>
                              Level {case_.triageScore}
                            </Badge>
                            <Badge className="capitalize">{case_.status}</Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Age/Gender</div>
                              <div className="font-medium">
                                {case_.age}y / {case_.gender}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Arrival</div>
                              <div className="font-medium">{format(case_.arrivalTime, "HH:mm")}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Bed</div>
                              <div className="font-medium">{case_.bedNumber}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Doctor</div>
                              <div className="font-medium">{case_.assignedDoctorName}</div>
                            </div>
                          </div>

                          <div className="text-sm">
                            <div className="text-muted-foreground">Chief Complaint</div>
                            <div>{case_.chiefComplaint}</div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <span>BP: {case_.vitalSigns.bloodPressure}</span>
                            <span>HR: {case_.vitalSigns.heartRate}</span>
                            <span>SpO₂: {case_.vitalSigns.oxygenSaturation}%</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="beds" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>ER Bed Status</CardTitle>
              <CardDescription>Real-time bed availability</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {beds.map((bed) => (
                  <Card key={bed.id}>
                    <CardContent className="pt-6">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-lg">{bed.bedNumber}</h3>
                          <Badge
                            variant={bed.status === "available" ? "secondary" : "default"}
                            className="capitalize"
                          >
                            {bed.status}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <div className="text-muted-foreground">Type</div>
                          <div className="font-medium capitalize">{bed.bedType}</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-muted-foreground">Location</div>
                          <div className="font-medium">{bed.location}</div>
                        </div>
                        {bed.currentPatientName && (
                          <div className="text-sm">
                            <div className="text-muted-foreground">Patient</div>
                            <div className="font-medium">{bed.currentPatientName}</div>
                          </div>
                        )}
                        <div className="flex flex-wrap gap-1">
                          {bed.equipment.slice(0, 3).map((eq: string, idx: number) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {eq}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ambulances" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ambulance Fleet</CardTitle>
              <CardDescription>Ambulance status and dispatch</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {ambulances.map((ambulance) => (
                  <Card key={ambulance.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <AmbulanceIcon className="h-5 w-5" />
                            <h3 className="font-semibold text-lg">{ambulance.vehicleNumber}</h3>
                            <Badge
                              variant={ambulance.status === "available" ? "secondary" : "default"}
                              className="capitalize"
                            >
                              {ambulance.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Type</div>
                              <div className="font-medium uppercase">{ambulance.type}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Location</div>
                              <div className="font-medium">{ambulance.currentLocation}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Crew</div>
                              <div className="font-medium">{ambulance.crew.length} members</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {ambulance.equipment.slice(0, 4).map((eq, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {eq}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        {ambulance.status === "available" && (
                          <Button size="sm">Dispatch</Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
