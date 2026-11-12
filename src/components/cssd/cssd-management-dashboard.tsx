"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Package, 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  Settings,
  FileText
} from "lucide-react";
import { format } from "date-fns";
import type { 
  SterilizationPack, 
  SterilizationCycle, 
  SterilizationEquipment,
  DepartmentRequest,
  CssdStats 
} from "@/types/cssd";

export function CssdManagementDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const packs: SterilizationPack[] = [
    {
      id: "1",
      packNumber: "PACK-2025-001",
      barcodeNumber: "BC-001",
      itemType: "instrument-set",
      itemId: "SET001",
      itemName: "General Surgery Set",
      contents: [
        { name: "Scalpel", quantity: 2 },
        { name: "Forceps", quantity: 4 },
        { name: "Scissors", quantity: 2 },
      ],
      department: "Surgery",
      packagingDate: new Date(2025, 0, 10),
      packedBy: "Staff 001",
      packagingMaterial: "paper",
      sterilizationMethod: "steam-autoclave",
      sterilizationCycleId: "CYC-001",
      sterilizationDate: new Date(2025, 0, 10),
      sterilizedBy: "Tech 001",
      expiryDate: new Date(2025, 3, 10),
      chemicalIndicatorResult: "pass",
      biologicalIndicatorResult: "negative",
      status: "sterilized",
      qualityCheck: {
        checkedBy: "QC Staff",
        checkDate: new Date(2025, 0, 10),
        packIntegrity: "intact",
        indicatorStatus: "acceptable",
        approved: true,
      },
      reprocessingCount: 15,
    },
  ];

  const cycles: SterilizationCycle[] = [
    {
      id: "1",
      cycleNumber: "CYC-2025-001",
      sterilizerId: "EQP001",
      sterilizerName: "Autoclave-1",
      sterilizationMethod: "steam-autoclave",
      startTime: new Date(2025, 0, 15, 8, 0),
      endTime: new Date(2025, 0, 15, 9, 30),
      loadItems: [
        {
          itemId: "1",
          itemType: "set",
          itemName: "General Surgery Set",
          packNumber: "PACK-2025-001",
          quantity: 5,
          department: "Surgery",
        },
        {
          itemId: "2",
          itemType: "set",
          itemName: "Orthopedic Set",
          packNumber: "PACK-2025-002",
          quantity: 3,
          department: "Orthopedics",
        },
      ],
      parameters: {
        temperature: 134,
        pressure: 30,
        duration: 90,
        cycleType: "Standard",
      },
      biologicalIndicator: {
        batchNumber: "BI-2025-001",
        testResult: "negative",
        testedBy: "Lab Tech",
        testedDate: new Date(2025, 0, 15),
      },
      chemicalIndicator: {
        batchNumber: "CI-2025-001",
        testResult: "pass",
        testedBy: "Tech 001",
      },
      status: "completed",
      operatedBy: "Tech 001",
      verifiedBy: "Supervisor 001",
    },
  ];

  const equipment: SterilizationEquipment[] = [
    {
      id: "1",
      equipmentCode: "EQP-001",
      equipmentName: "Autoclave-1",
      type: "steam-autoclave",
      manufacturer: "Getinge",
      model: "GSS67",
      serialNumber: "SN-12345",
      capacity: 200,
      installationDate: new Date(2023, 0, 1),
      warrantyExpiry: new Date(2026, 0, 1),
      specifications: {
        temperatureRange: { min: 121, max: 134 },
        pressureRange: { min: 15, max: 35 },
        maxLoadWeight: 100,
      },
      status: "operational",
      maintenanceSchedule: {
        frequency: "monthly",
        lastMaintenance: new Date(2024, 11, 15),
        nextMaintenance: new Date(2025, 0, 15),
        maintenanceBy: "Service Team",
      },
      calibration: {
        lastCalibration: new Date(2024, 11, 1),
        nextCalibration: new Date(2025, 5, 1),
        calibrationBy: "Calibration Lab",
        certificateNumber: "CAL-2024-001",
      },
      totalCycles: 1250,
      cyclesThisMonth: 85,
      currentLocation: "CSSD Main Floor",
      isActive: true,
    },
  ];

  const requests: DepartmentRequest[] = [
    {
      id: "1",
      requestNumber: "REQ-2025-001",
      department: "Surgery",
      requestedBy: "Dr. Smith",
      requestDate: new Date(2025, 0, 15),
      requiredDate: new Date(2025, 0, 16),
      items: [
        {
          itemType: "set",
          itemId: "SET001",
          itemName: "General Surgery Set",
          quantity: 3,
          urgency: "urgent",
        },
      ],
      purpose: "Scheduled surgeries",
      status: "approved",
      approvedBy: "CSSD Manager",
      approvedDate: new Date(2025, 0, 15),
    },
  ];

  const stats: CssdStats = {
    totalInstruments: 2450,
    totalSets: 145,
    sterilizationCyclesToday: 12,
    packsProcessedToday: 68,
    sterilePacksAvailable: 320,
    packsDispatchedToday: 42,
    packsReturnedToday: 38,
    expiringPacks7Days: 15,
    equipmentOperational: 8,
    equipmentMaintenance: 1,
    averageTurnaroundTime: 6,
    pendingProcessing: 25,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">CSSD Management</h2>
          <p className="text-muted-foreground">
            Central Sterile Supply Department - Sterilization & Instrument Management
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Cycle
          </Button>
          <Button variant="outline">
            <FileText className="mr-2 h-4 w-4" />
            Reports
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sterile Packs</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sterilePacksAvailable}</div>
            <p className="text-xs text-muted-foreground">
              {stats.packsProcessedToday} processed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cycles Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sterilizationCyclesToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingProcessing} items pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Turnaround</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageTurnaroundTime}h</div>
            <p className="text-xs text-muted-foreground">
              {stats.packsDispatchedToday} dispatched today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Equipment Status</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.equipmentOperational}</div>
            <p className="text-xs text-muted-foreground">
              {stats.equipmentMaintenance} in maintenance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="cycles">Sterilization</TabsTrigger>
          <TabsTrigger value="packs">Packs</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Sterilization Cycles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cycles.map((cycle) => (
                    <div
                      key={cycle.id}
                      className="border rounded-lg p-4 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{cycle.cycleNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {cycle.sterilizerName} • {cycle.sterilizationMethod}
                          </p>
                        </div>
                        <Badge
                          variant={
                            cycle.status === "completed"
                              ? "default"
                              : cycle.status === "failed"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {cycle.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Temp:</span>{" "}
                          {cycle.parameters.temperature}°C
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration:</span>{" "}
                          {cycle.parameters.duration} min
                        </div>
                        <div>
                          <span className="text-muted-foreground">Load:</span>{" "}
                          {cycle.loadItems.length} items
                        </div>
                        <div>
                          <span className="text-muted-foreground">BI Test:</span>{" "}
                          <Badge variant="outline" className="text-xs">
                            {cycle.biologicalIndicator?.testResult}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Alerts & Notifications
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Packs Expiring Soon</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.expiringPacks7Days} packs expiring in next 7 days
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Equipment Maintenance Due</p>
                      <p className="text-xs text-muted-foreground">
                        Autoclave-2 maintenance scheduled for tomorrow
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Quality Check Passed</p>
                      <p className="text-xs text-muted-foreground">
                        All packs in CYC-2025-001 passed inspection
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cycles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sterilization Cycles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {cycles.map((cycle) => (
                  <div
                    key={cycle.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-lg">{cycle.cycleNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {cycle.sterilizerName} • {format(cycle.startTime, "MMM dd, yyyy HH:mm")}
                        </p>
                      </div>
                      <Badge
                        variant={
                          cycle.status === "completed"
                            ? "default"
                            : cycle.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {cycle.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Method:</span>{" "}
                        <span className="capitalize">
                          {cycle.sterilizationMethod.replace("-", " ")}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Temperature:</span>{" "}
                        {cycle.parameters.temperature}°C
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pressure:</span>{" "}
                        {cycle.parameters.pressure} PSI
                      </div>
                      <div>
                        <span className="text-muted-foreground">Duration:</span>{" "}
                        {cycle.parameters.duration} min
                      </div>
                      <div>
                        <span className="text-muted-foreground">Operator:</span>{" "}
                        {cycle.operatedBy}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Verified:</span>{" "}
                        {cycle.verifiedBy}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Load Items ({cycle.loadItems.length})</p>
                      <div className="space-y-1">
                        {cycle.loadItems.map((item, idx) => (
                          <div key={idx} className="text-sm flex items-center justify-between">
                            <span>
                              {item.itemName} ({item.packNumber})
                            </span>
                            <Badge variant="outline">
                              Qty: {item.quantity} • {item.department}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Biological Indicator:</span>
                          <Badge
                            variant={
                              cycle.biologicalIndicator?.testResult === "negative"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {cycle.biologicalIndicator?.testResult}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Chemical Indicator:</span>
                          <Badge
                            variant={
                              cycle.chemicalIndicator?.testResult === "pass"
                                ? "default"
                                : "destructive"
                            }
                          >
                            {cycle.chemicalIndicator?.testResult}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Print Report
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="packs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sterilization Packs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {packs.map((pack) => (
                  <div
                    key={pack.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-lg">{pack.itemName}</p>
                        <p className="text-sm text-muted-foreground">
                          {pack.packNumber} • {pack.barcodeNumber}
                        </p>
                      </div>
                      <Badge
                        variant={
                          pack.status === "sterilized"
                            ? "default"
                            : pack.status === "contaminated"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {pack.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Department:</span>{" "}
                        {pack.department}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>{" "}
                        <span className="capitalize">{pack.itemType.replace("-", " ")}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sterilized:</span>{" "}
                        {pack.sterilizationDate
                          ? format(pack.sterilizationDate, "MMM dd, yyyy")
                          : "N/A"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Expires:</span>{" "}
                        {format(pack.expiryDate, "MMM dd, yyyy")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Reprocessing Count:</span>{" "}
                        {pack.reprocessingCount}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Method:</span>{" "}
                        <span className="capitalize">
                          {pack.sterilizationMethod.replace("-", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Contents</p>
                      <div className="flex flex-wrap gap-2">
                        {pack.contents.map((item, idx) => (
                          <Badge key={idx} variant="outline">
                            {item.name} × {item.quantity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Chemical Indicator:</span>
                          <Badge variant="default">{pack.chemicalIndicatorResult}</Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground">Biological Indicator:</span>
                          <Badge variant="default">{pack.biologicalIndicatorResult}</Badge>
                        </div>
                      </div>
                    </div>

                    {pack.qualityCheck && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-1">Quality Check</p>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Pack Integrity:</span>
                            <Badge variant="outline">{pack.qualityCheck.packIntegrity}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Approved:</span>
                            <Badge variant={pack.qualityCheck.approved ? "default" : "destructive"}>
                              {pack.qualityCheck.approved ? "Yes" : "No"}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Dispatch
                      </Button>
                      <Button size="sm" variant="outline">
                        Print Label
                      </Button>
                      <Button size="sm" variant="outline">
                        View History
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-lg">{request.requestNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.department} • {request.requestedBy}
                        </p>
                      </div>
                      <Badge
                        variant={
                          request.status === "completed"
                            ? "default"
                            : request.status === "pending"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {request.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Requested:</span>{" "}
                        {format(request.requestDate, "MMM dd, yyyy")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Required By:</span>{" "}
                        {format(request.requiredDate, "MMM dd, yyyy")}
                      </div>
                      {request.approvedBy && (
                        <>
                          <div>
                            <span className="text-muted-foreground">Approved By:</span>{" "}
                            {request.approvedBy}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Approved:</span>{" "}
                            {request.approvedDate
                              ? format(request.approvedDate, "MMM dd, yyyy")
                              : "N/A"}
                          </div>
                        </>
                      )}
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Items Requested</p>
                      <div className="space-y-2">
                        {request.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span>{item.itemName}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Qty: {item.quantity}</Badge>
                              <Badge
                                variant={
                                  item.urgency === "emergency"
                                    ? "destructive"
                                    : item.urgency === "urgent"
                                    ? "secondary"
                                    : "outline"
                                }
                              >
                                {item.urgency}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm">Process Request</Button>
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sterilization Equipment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {equipment.map((equip) => (
                  <div
                    key={equip.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-lg">{equip.equipmentName}</p>
                        <p className="text-sm text-muted-foreground">
                          {equip.equipmentCode} • {equip.manufacturer} {equip.model}
                        </p>
                      </div>
                      <Badge
                        variant={
                          equip.status === "operational"
                            ? "default"
                            : equip.status === "breakdown"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {equip.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Type:</span>{" "}
                        <span className="capitalize">{equip.type.replace("-", " ")}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Capacity:</span>{" "}
                        {equip.capacity}L
                      </div>
                      <div>
                        <span className="text-muted-foreground">Location:</span>{" "}
                        {equip.currentLocation}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Cycles:</span>{" "}
                        {equip.totalCycles.toLocaleString()}
                      </div>
                      <div>
                        <span className="text-muted-foreground">This Month:</span>{" "}
                        {equip.cyclesThisMonth}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Serial:</span>{" "}
                        {equip.serialNumber}
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Maintenance</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Frequency:</span>{" "}
                          <span className="capitalize">
                            {equip.maintenanceSchedule.frequency}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Service:</span>{" "}
                          {format(equip.maintenanceSchedule.lastMaintenance, "MMM dd, yyyy")}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Next Service:</span>{" "}
                          {format(equip.maintenanceSchedule.nextMaintenance, "MMM dd, yyyy")}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Service By:</span>{" "}
                          {equip.maintenanceSchedule.maintenanceBy || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Calibration</p>
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="text-muted-foreground">Last Calibration:</span>{" "}
                          {format(equip.calibration.lastCalibration, "MMM dd, yyyy")}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Next Due:</span>{" "}
                          {format(equip.calibration.nextCalibration, "MMM dd, yyyy")}
                        </div>
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Certificate:</span>{" "}
                          {equip.calibration.certificateNumber || "N/A"}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Schedule Maintenance
                      </Button>
                      <Button size="sm" variant="outline">
                        Service History
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
