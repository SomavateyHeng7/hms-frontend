"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Surgery, OperationTheater } from "@/features/nursing/operation-theater/types";
import { Calendar, Clock, Users, Activity, AlertCircle, CheckCircle2, Scissors } from "lucide-react";
import { format } from "date-fns";
import { useTabParam } from "@/hooks/use-tab-param";

export function OperationTheaterDashboard() {
  const [activeTab, setActiveTab] = useTabParam("overview", ["overview", "schedule", "theaters"] as const);

  // Mock data
  const theaters: OperationTheater[] = [
    {
      id: "1",
      name: "OT 1",
      code: "OT-1",
      floor: "3rd Floor",
      type: "general",
      status: "occupied",
      capacity: 3,
      equipment: ["Anesthesia Machine", "Surgical Lights", "Monitor"],
      features: ["HEPA Filter", "Laminar Flow"],
      isActive: true,
    },
    {
      id: "2",
      name: "OT 2 - Cardiac",
      code: "OT-2",
      floor: "3rd Floor",
      type: "cardiac",
      status: "available",
      capacity: 5,
      equipment: ["Heart-Lung Machine", "ECG", "Defibrillator"],
      features: ["HEPA Filter", "Cardiac Monitoring"],
      isActive: true,
    },
  ];

  const surgeries: Surgery[] = [
    {
      id: "1",
      surgeryNumber: "SUR-2025-001",
      patientId: "PAT001",
      patientName: "John Doe",
      surgeryType: "Orthopedic",
      surgeryName: "Total Knee Replacement",
      operationTheaterId: "1",
      operationTheaterName: "OT 1",
      scheduledDate: new Date(2025, 11, 30),
      scheduledStartTime: "09:00",
      scheduledEndTime: "12:00",
      estimatedDuration: 180,
      priority: "elective",
      status: "in-progress",
      diagnosis: "Osteoarthritis of the knee",
      surgicalProcedure: "Total knee arthroplasty",
      anesthesiaType: "general",
      preOpInstructions: "NPO after midnight, pre-op antibiotics",
      consentObtained: true,
      surgeonId: "DOC001",
      surgeonName: "Dr. Smith",
      assistantSurgeons: [{ id: "DOC002", name: "Dr. Johnson" }],
      anesthesiologistId: "DOC003",
      anesthesiologistName: "Dr. Williams",
      nurses: [
        { id: "NUR001", name: "Nurse Sarah", role: "scrub" },
        { id: "NUR002", name: "Nurse Mike", role: "circulating" },
      ],
      requiredEquipment: ["Knee Replacement Set", "Drills", "Saw"],
      requiredInstruments: ["Scalpels", "Retractors", "Sutures"],
    },
  ];

  const stats = {
    totalTheaters: 8,
    availableTheaters: 3,
    occupiedTheaters: 4,
    maintenanceTheaters: 1,
    scheduledToday: 12,
    completed: 4,
    inProgress: 3,
    upcoming: 5,
    utilizationRate: 75,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "occupied":
        return "bg-red-500";
      case "cleaning":
        return "bg-yellow-500";
      case "maintenance":
        return "bg-orange-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Operation Theater Management</h1>
        <p className="text-muted-foreground">Manage surgical procedures and OT schedules</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="schedule">Surgery Schedule</TabsTrigger>
          <TabsTrigger value="theaters">Theaters</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Theaters</CardTitle>
                <Scissors className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTheaters}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.availableTheaters} available · {stats.occupiedTheaters} occupied
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Surgeries Today</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.scheduledToday}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.completed} completed · {stats.inProgress} in progress
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                <Activity className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
                <p className="text-xs text-muted-foreground">Active surgeries</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Utilization Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.utilizationRate}%</div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${stats.utilizationRate}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Theater Status */}
          <Card>
            <CardHeader>
              <CardTitle>Theater Status</CardTitle>
              <CardDescription>Current status of all operation theaters</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {theaters.map((theater) => (
                  <Card key={theater.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold">{theater.name}</h3>
                          <p className="text-sm text-muted-foreground">{theater.floor}</p>
                        </div>
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(theater.status)}`} />
                      </div>
                      <Badge variant="outline" className="capitalize mb-2">
                        {theater.type}
                      </Badge>
                      <div className="text-sm">
                        <Badge className="capitalize">{theater.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Today's Surgery Schedule</CardTitle>
                  <CardDescription>{format(new Date(), "PPPP")}</CardDescription>
                </div>
                <Button>
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule Surgery
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {surgeries.map((surgery) => (
                  <Card key={surgery.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{surgery.surgeryNumber}</Badge>
                            <h3 className="font-semibold text-lg">{surgery.surgeryName}</h3>
                            <Badge
                              variant={
                                surgery.status === "in-progress"
                                  ? "default"
                                  : surgery.status === "completed"
                                  ? "secondary"
                                  : "outline"
                              }
                              className="capitalize"
                            >
                              {surgery.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Patient</div>
                              <div className="font-medium">{surgery.patientName}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Theater</div>
                              <div className="font-medium">{surgery.operationTheaterName}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Time</div>
                              <div className="font-medium">
                                {surgery.scheduledStartTime} - {surgery.scheduledEndTime}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Duration</div>
                              <div className="font-medium">{surgery.estimatedDuration} mins</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-muted-foreground" />
                              <span>Surgeon: {surgery.surgeonName}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Activity className="h-4 w-4 text-muted-foreground" />
                              <span>Anesthesia: {surgery.anesthesiaType}</span>
                            </div>
                          </div>

                          <div className="text-sm">
                            <div className="text-muted-foreground">Procedure</div>
                            <div>{surgery.surgicalProcedure}</div>
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

        <TabsContent value="theaters" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>All Operation Theaters</CardTitle>
              <CardDescription>Manage theater availability and equipment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {theaters.map((theater) => (
                  <Card key={theater.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{theater.name}</h3>
                            <Badge variant="outline">{theater.code}</Badge>
                            <Badge className="capitalize">{theater.status}</Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Type</div>
                              <div className="font-medium capitalize">{theater.type}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Location</div>
                              <div className="font-medium">{theater.floor}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Capacity</div>
                              <div className="font-medium">{theater.capacity} persons</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Equipment</div>
                              <div className="font-medium">{theater.equipment.length} items</div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-1">
                            {theater.equipment.slice(0, 3).map((eq, idx) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {eq}
                              </Badge>
                            ))}
                            {theater.equipment.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{theater.equipment.length - 3} more
                              </Badge>
                            )}
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
      </Tabs>
    </div>
  );
}
