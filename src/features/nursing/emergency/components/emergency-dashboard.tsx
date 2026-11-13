"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmergencyCase, ERBed, Ambulance } from "@/features/nursing/emergency/types";
import { Ambulance as AmbulanceIcon, Activity, Users, Clock, AlertCircle, Bed } from "lucide-react";
import { useTabParam } from "@/hooks/use-tab-param";
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { EMERGENCY_KM } from "@/features/nursing/emergency/km";

export function EmergencyDashboard() {
  const t = useT(EMERGENCY_KM);
  const tAny = useTranslateAny(EMERGENCY_KM);
  const fmt = useDateFormat();
  const [activeTab, setActiveTab] = useTabParam("overview", ["overview", "cases", "beds", "ambulances"] as const);

  // Mock data
  const cases: EmergencyCase[] = [
    {
      id: "1",
      caseNumber: "ER-2025-001",
      patientId: "PAT001",
      patientName: "Chan Sreymom",
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
      assignedDoctorName: "Dr. Lim Pisey",
      assignedNurseId: "NUR001",
      assignedNurseName: "Nurse Sophea",
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
      currentPatientName: "Chan Sreymom",
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
        { staffId: "PMD001", name: "Paramedic Rotha", role: "paramedic" },
        { staffId: "EMT001", name: "EMT Sreyleak", role: "emt" },
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
        <h1 className="text-3xl font-bold">{t("Emergency Room Management")}</h1>
        <p className="text-muted-foreground">{t("Real-time ER operations and patient tracking")}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
          <TabsTrigger value="cases">{t("Active Cases")}</TabsTrigger>
          <TabsTrigger value="beds">{t("ER Beds")}</TabsTrigger>
          <TabsTrigger value="ambulances">{t("Ambulances")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("Total Cases")}</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCases}</div>
                <p className="text-xs text-muted-foreground">
                  {t("{waiting} waiting · {inTreatment} in treatment", { waiting: stats.waiting, inTreatment: stats.inTreatment })}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("Critical/Urgent")}</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {stats.critical + stats.urgent}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("{critical} critical · {urgent} urgent", { critical: stats.critical, urgent: stats.urgent })}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("Bed Occupancy")}</CardTitle>
                <Bed className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.occupiedBeds}/{stats.totalBeds}
                </div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${(stats.occupiedBeds / stats.totalBeds) * 100}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("Avg Wait Time")}</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{t("{averageWaitTime} min", { averageWaitTime: stats.averageWaitTime })}</div>
                <p className="text-xs text-muted-foreground">
                  {t("{ambulancesAvailable} ambulances available", { ambulancesAvailable: stats.ambulancesAvailable })}</p>
              </CardContent>
            </Card>
          </div>

          {/* Triage Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Triage Distribution")}</CardTitle>
              <CardDescription>{t("Current cases by severity level")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm font-medium">{t("Level 1 - Resuscitation (Critical)")}</span>
                  </div>
                  <Badge variant="destructive">{stats.critical}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span className="text-sm font-medium">{t("Level 2 - Emergency (Urgent)")}</span>
                  </div>
                  <Badge className="bg-orange-500">{stats.urgent}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm font-medium">{t("Level 3 - Urgent (Semi-Urgent)")}</span>
                  </div>
                  <Badge className="bg-yellow-500">{stats.semiUrgent}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">{t("Level 4 - Semi-Urgent (Non-Urgent)")}</span>
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
                  <CardTitle>{t("Active ER Cases")}</CardTitle>
                  <CardDescription>{t("Current emergency cases in the system")}</CardDescription>
                </div>
                <Button>
                  <Activity className="mr-2 h-4 w-4" />
                  {t("New Case")}
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
                              {t("Level {triageScore}", { triageScore: case_.triageScore })}
                            </Badge>
                            <Badge className="capitalize">{tAny(case_.status)}</Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">{t("Age/Gender")}</div>
                              <div className="font-medium">
                                {case_.age}y / {tAny(case_.gender)}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">{t("Arrival")}</div>
                              <div className="font-medium">{fmt(case_.arrivalTime, "HH:mm")}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">{t("Bed")}</div>
                              <div className="font-medium">{case_.bedNumber}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">{t("Doctor")}</div>
                              <div className="font-medium">{case_.assignedDoctorName}</div>
                            </div>
                          </div>

                          <div className="text-sm">
                            <div className="text-muted-foreground">{t("Chief Complaint")}</div>
                            <div>{case_.chiefComplaint}</div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <span>{t("BP: {bloodPressure}", { bloodPressure: case_.vitalSigns.bloodPressure })}</span>
                            <span>{t("HR: {heartRate}", { heartRate: case_.vitalSigns.heartRate })}</span>
                            <span>{t("SpO₂: {oxygenSaturation}%", { oxygenSaturation: case_.vitalSigns.oxygenSaturation })}</span>
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
              <CardTitle>{t("ER Bed Status")}</CardTitle>
              <CardDescription>{t("Real-time bed availability")}</CardDescription>
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
                            {tAny(bed.status)}
                          </Badge>
                        </div>
                        <div className="text-sm">
                          <div className="text-muted-foreground">{t("Type")}</div>
                          <div className="font-medium capitalize">{tAny(bed.bedType)}</div>
                        </div>
                        <div className="text-sm">
                          <div className="text-muted-foreground">{t("Location")}</div>
                          <div className="font-medium">{bed.location}</div>
                        </div>
                        {bed.currentPatientName && (
                          <div className="text-sm">
                            <div className="text-muted-foreground">{t("Patient")}</div>
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
              <CardTitle>{t("Ambulance Fleet")}</CardTitle>
              <CardDescription>{t("Ambulance status and dispatch")}</CardDescription>
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
                              {tAny(ambulance.status)}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">{t("Type")}</div>
                              <div className="font-medium uppercase">{tAny(ambulance.type)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">{t("Location")}</div>
                              <div className="font-medium">{ambulance.currentLocation}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">{t("Crew")}</div>
                              <div className="font-medium">{t("{length} members", { length: ambulance.crew.length })}</div>
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
                          <Button size="sm">{t("Dispatch")}</Button>
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
