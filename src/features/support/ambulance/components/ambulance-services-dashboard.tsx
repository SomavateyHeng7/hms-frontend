"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Ambulance, 
  MapPin, 
  Clock, 
  Phone, 
  AlertCircle,
  Plus,
  Navigation,
  Activity
} from "lucide-react";
import type { 
  AmbulanceVehicle, 
  AmbulanceTrip, 
  AmbulanceRequest,
  AmbulanceStats 
} from "@/features/support/ambulance/types";
import { useTabParam } from "@/hooks/use-tab-param";
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { AMBULANCE_KM } from "@/features/support/ambulance/km";

export function AmbulanceServicesDashboard() {
  const t = useT(AMBULANCE_KM);
  const tAny = useTranslateAny(AMBULANCE_KM);
  const fmt = useDateFormat();
  const [activeTab, setActiveTab] = useTabParam("overview", ["overview", "trips", "requests", "fleet"] as const);

  // Mock data
  const vehicles: AmbulanceVehicle[] = [
    {
      id: "1",
      vehicleNumber: "AMB-101",
      registrationNumber: "MH-01-AB-1234",
      type: "advanced",
      status: "available",
      manufacturer: "Force Motors",
      model: "Traveller Ambulance",
      yearOfManufacture: 2023,
      capacity: 4,
      stretcherCapacity: 2,
      baseStation: "Central Hospital",
      currentLocation: {
        address: "Central Hospital Parking",
        latitude: 19.0760,
        longitude: 72.8777,
        lastUpdated: new Date(),
      },
      equipment: [
        { name: "Defibrillator", quantity: 1, status: "functional", lastChecked: new Date(2025, 0, 1) },
        { name: "Oxygen Cylinder", quantity: 2, status: "functional", lastChecked: new Date(2025, 0, 1) },
        { name: "Stretcher", quantity: 2, status: "functional", lastChecked: new Date(2025, 0, 1) },
      ],
      crew: [
        { staffId: "PMD001", name: "Paramedic John", role: "paramedic", contactNumber: "+1234567890" },
        { staffId: "DRV001", name: "Driver Mike", role: "driver", contactNumber: "+1234567891" },
      ],
      maintenance: {
        lastService: new Date(2024, 11, 1),
        nextService: new Date(2025, 2, 1),
        mileage: 15000,
        insuranceExpiry: new Date(2025, 11, 31),
        fitnessExpiry: new Date(2025, 11, 31),
        pollutionExpiry: new Date(2025, 5, 30),
      },
      fuelLevel: 85,
      isActive: true,
    },
  ];

  const trips: AmbulanceTrip[] = [
    {
      id: "1",
      tripNumber: "TRIP-2025-001",
      ambulanceId: "1",
      vehicleNumber: "AMB-101",
      ambulanceType: "advanced",
      priority: "emergency",
      status: "transporting",
      requestedBy: "Emergency Call 108",
      requestTime: new Date(2025, 0, 15, 10, 30),
      requestSource: "emergency-call",
      callerName: "Mao Chenda",
      callerContact: "+1234567892",
      patientName: "Touch Bunthoeun",
      patientAge: 45,
      patientGender: "male",
      chiefComplaint: "Chest pain, difficulty breathing",
      pickupLocation: {
        address: "456 Oak Street, Downtown",
        landmark: "Near City Mall",
        contactPerson: "Mao Chenda",
        contactNumber: "+1234567892",
        latitude: 19.0896,
        longitude: 72.8656,
      },
      destination: {
        facilityName: "Central Hospital",
        address: "789 Hospital Road",
        department: "Emergency Department",
        contactNumber: "+1234567893",
        latitude: 19.0760,
        longitude: 72.8777,
      },
      dispatchTime: new Date(2025, 0, 15, 10, 32),
      departureTime: new Date(2025, 0, 15, 10, 35),
      arrivalAtSceneTime: new Date(2025, 0, 15, 10, 48),
      departureFromSceneTime: new Date(2025, 0, 15, 10, 58),
      estimatedDistance: 8.5,
      estimatedDuration: 20,
      crew: [
        { staffId: "PMD001", name: "Paramedic John", role: "paramedic" },
        { staffId: "DRV001", name: "Driver Mike", role: "driver" },
      ],
      vitalsDuringTransport: [
        {
          time: new Date(2025, 0, 15, 11, 0),
          bloodPressure: "140/90",
          pulse: 95,
          spo2: 94,
          respiratoryRate: 22,
          recordedBy: "Paramedic John",
        },
      ],
      treatmentProvided: ["Oxygen therapy", "IV line established", "Cardiac monitoring"],
      baseFare: 500,
      distanceCharges: 170,
      totalCharges: 670,
      paymentStatus: "pending",
      createdBy: "Dispatcher 001",
    },
  ];

  const requests: AmbulanceRequest[] = [
    {
      id: "1",
      requestNumber: "REQ-2025-002",
      requestTime: new Date(2025, 0, 15, 11, 15),
      requestedBy: "Emergency Call",
      requestSource: "emergency-call",
      priority: "urgent",
      status: "pending",
      callerDetails: {
        name: "Emma Davis",
        contactNumber: "+1234567894",
        relationship: "Daughter",
      },
      patientInfo: {
        name: "Margaret Davis",
        age: 72,
        gender: "female",
        chiefComplaint: "Fall from stairs, possible fracture",
        consciousnessLevel: "alert",
        breathing: "normal",
        bleeding: "minor",
      },
      pickupAddress: "123 Elm Street, Suburban Area",
      pickupLandmark: "Near Green Park",
      destinationAddress: "Central Hospital Emergency",
    },
  ];

  const stats: AmbulanceStats = {
    totalVehicles: 12,
    availableVehicles: 8,
    onDutyVehicles: 3,
    maintenanceVehicles: 1,
    tripsToday: 24,
    emergencyTripsToday: 8,
    averageResponseTime: 12,
    pendingRequests: 2,
    activeTrips: 3,
    completedTripsToday: 21,
    revenue: {
      today: 18500,
      thisMonth: 425000,
      pending: 3500,
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{t("Ambulance Services")}</h2>
          <p className="text-muted-foreground">
            {t("Manage fleet, trips, and emergency response")}
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t("New Request")}
          </Button>
          <Button variant="outline">
            <MapPin className="mr-2 h-4 w-4" />
            {t("Track Fleet")}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("Available Vehicles")}</CardTitle>
            <Ambulance className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableVehicles}</div>
            <p className="text-xs text-muted-foreground">
              {t("{onDutyVehicles} on duty, {maintenanceVehicles} in maintenance", { onDutyVehicles: stats.onDutyVehicles, maintenanceVehicles: stats.maintenanceVehicles })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("Active Trips")}</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTrips}</div>
            <p className="text-xs text-muted-foreground">
              {t("{completedTripsToday} completed today", { completedTripsToday: stats.completedTripsToday })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("Avg Response Time")}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{t("{averageResponseTime} min", { averageResponseTime: stats.averageResponseTime })}</div>
            <p className="text-xs text-muted-foreground">
              {t("{emergencyTripsToday} emergency trips today", { emergencyTripsToday: stats.emergencyTripsToday })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("Pending Requests")}</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              {t("{tripsToday} total trips today", { tripsToday: stats.tripsToday })}</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
          <TabsTrigger value="trips">{t("Active Trips")}</TabsTrigger>
          <TabsTrigger value="requests">{t("Requests")}</TabsTrigger>
          <TabsTrigger value="fleet">{t("Fleet")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>{t("Active Trips")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trips.map((trip) => (
                    <div
                      key={trip.id}
                      className="border rounded-lg p-4 space-y-3"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{trip.tripNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {trip.vehicleNumber} • {trip.patientName}
                          </p>
                        </div>
                        <Badge
                          variant={
                            trip.priority === "emergency"
                              ? "destructive"
                              : trip.priority === "urgent"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {tAny(trip.priority)}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{t("From:")}</span>
                          <span>{trip.pickupLocation.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">{t("To:")}</span>
                          <span>{trip.destination.facilityName}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Badge>{tAny(trip.status)}</Badge>
                        <Button size="sm" variant="outline">
                          {t("Track")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("Pending Requests")}</CardTitle>
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
                          <p className="font-medium">{request.requestNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.patientInfo.name || t("Unknown Patient")}
                          </p>
                        </div>
                        <Badge
                          variant={
                            request.priority === "emergency"
                              ? "destructive"
                              : request.priority === "urgent"
                              ? "secondary"
                              : "outline"
                          }
                        >
                          {tAny(request.priority)}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">{t("Complaint:")}</span>{" "}
                          {request.patientInfo.chiefComplaint}
                        </p>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span>{request.pickupAddress}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span>{request.callerDetails.contactNumber}</span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm">{t("Assign Ambulance")}</Button>
                        <Button size="sm" variant="outline">
                          {t("View Details")}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trips" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Active Trips")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-lg">{trip.tripNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {trip.vehicleNumber} • {trip.ambulanceType}
                        </p>
                      </div>
                      <Badge
                        variant={
                          trip.priority === "emergency"
                            ? "destructive"
                            : trip.priority === "urgent"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {tAny(trip.priority)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t("Patient:")}</span>{" "}
                        {trip.patientName}
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("Age/Gender:")}</span>{" "}
                        {trip.patientAge}Y / {trip.patientGender}
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">{t("Complaint:")}</span>{" "}
                        {trip.chiefComplaint}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-green-600 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t("Pickup Location")}</p>
                          <p className="text-sm text-muted-foreground">
                            {trip.pickupLocation.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Navigation className="h-4 w-4 text-red-600 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t("Destination")}</p>
                          <p className="text-sm text-muted-foreground">
                            {trip.destination.facilityName}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="secondary">{tAny(trip.status)}</Badge>
                        <span className="text-muted-foreground">
                          {t("ETA: {estimatedDuration} min", { estimatedDuration: trip.estimatedDuration })}</span>
                        <span className="text-muted-foreground">
                          {t("{estimatedDistance} km", { estimatedDistance: trip.estimatedDistance })}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MapPin className="mr-1 h-3 w-3" />
                          {t("Track")}
                        </Button>
                        <Button size="sm" variant="outline">
                          {t("Details")}
                        </Button>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">{t("Crew")}</p>
                      <div className="flex gap-2">
                        {trip.crew.map((member, idx) => (
                          <Badge key={idx} variant="outline">
                            {member.name} ({tAny(member.role)})
                          </Badge>
                        ))}
                      </div>
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
              <CardTitle>{t("Ambulance Requests")}</CardTitle>
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
                          {fmt(request.requestTime, "MMM dd, yyyy HH:mm")}
                        </p>
                      </div>
                      <Badge
                        variant={
                          request.priority === "emergency"
                            ? "destructive"
                            : request.priority === "urgent"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {tAny(request.priority)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t("Caller:")}</span>{" "}
                        {request.callerDetails.name}
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("Contact:")}</span>{" "}
                        {request.callerDetails.contactNumber}
                      </div>
                      {request.patientInfo.name && (
                        <>
                          <div>
                            <span className="text-muted-foreground">{t("Patient:")}</span>{" "}
                            {request.patientInfo.name}
                          </div>
                          <div>
                            <span className="text-muted-foreground">{t("Age:")}</span>{" "}
                            {request.patientInfo.age}Y
                          </div>
                        </>
                      )}
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm">
                        <span className="font-medium">{t("Complaint:")}</span>{" "}
                        {request.patientInfo.chiefComplaint}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm font-medium">{t("Pickup")}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.pickupAddress}
                            {request.pickupLandmark && ` (${request.pickupLandmark})`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Navigation className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm font-medium">{t("Destination")}</p>
                          <p className="text-sm text-muted-foreground">
                            {request.destinationAddress}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm">{t("Assign Ambulance")}</Button>
                      <Button size="sm" variant="outline">
                        {t("View Map")}
                      </Button>
                      <Button size="sm" variant="outline">
                        {t("Call Caller")}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fleet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("Fleet Status")}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicles.map((vehicle) => (
                  <div
                    key={vehicle.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-lg">{vehicle.vehicleNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {vehicle.registrationNumber} • {tAny(vehicle.type)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          vehicle.status === "available"
                            ? "default"
                            : vehicle.status === "on-call"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {tAny(vehicle.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">{t("Model:")}</span>{" "}
                        {vehicle.manufacturer} {vehicle.model}
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("Year:")}</span>{" "}
                        {vehicle.yearOfManufacture}
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("Capacity:")}</span>{" "}
                        {vehicle.capacity} {t("passengers")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("Fuel Level:")}</span>{" "}
                        {vehicle.fuelLevel}%
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("Mileage:")}</span>{" "}
                        {vehicle.maintenance.mileage.toLocaleString()} {t("km")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">{t("Base:")}</span>{" "}
                        {vehicle.baseStation}
                      </div>
                    </div>

                    {vehicle.crew && vehicle.crew.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-2">{t("Current Crew")}</p>
                        <div className="flex gap-2">
                          {vehicle.crew.map((member, idx) => (
                            <Badge key={idx} variant="outline">
                              {member.name} ({tAny(member.role)})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">{t("Equipment")}</p>
                      <div className="flex flex-wrap gap-2">
                        {vehicle.equipment.map((item, idx) => (
                          <Badge
                            key={idx}
                            variant={
                              item.status === "functional" ? "default" : "secondary"
                            }
                          >
                            {item.name} × {item.quantity}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        {t("View Details")}
                      </Button>
                      <Button size="sm" variant="outline">
                        {t("Maintenance Log")}
                      </Button>
                      <Button size="sm" variant="outline">
                        <MapPin className="mr-1 h-3 w-3" />
                        {t("Track")}
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
