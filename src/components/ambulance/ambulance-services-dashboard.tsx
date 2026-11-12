"use client";

import { useState } from "react";
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
import { format } from "date-fns";
import type { 
  AmbulanceVehicle, 
  AmbulanceTrip, 
  AmbulanceRequest,
  AmbulanceStats 
} from "@/types/ambulance";

export function AmbulanceServicesDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

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
      callerName: "Sarah Johnson",
      callerContact: "+1234567892",
      patientName: "Robert Williams",
      patientAge: 45,
      patientGender: "male",
      chiefComplaint: "Chest pain, difficulty breathing",
      pickupLocation: {
        address: "456 Oak Street, Downtown",
        landmark: "Near City Mall",
        contactPerson: "Sarah Johnson",
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
          <h2 className="text-3xl font-bold tracking-tight">Ambulance Services</h2>
          <p className="text-muted-foreground">
            Manage fleet, trips, and emergency response
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Request
          </Button>
          <Button variant="outline">
            <MapPin className="mr-2 h-4 w-4" />
            Track Fleet
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Vehicles</CardTitle>
            <Ambulance className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.availableVehicles}</div>
            <p className="text-xs text-muted-foreground">
              {stats.onDutyVehicles} on duty, {stats.maintenanceVehicles} in maintenance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeTrips}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedTripsToday} completed today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageResponseTime} min</div>
            <p className="text-xs text-muted-foreground">
              {stats.emergencyTripsToday} emergency trips today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              {stats.tripsToday} total trips today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trips">Active Trips</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="fleet">Fleet</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Active Trips</CardTitle>
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
                          {trip.priority}
                        </Badge>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">From:</span>
                          <span>{trip.pickupLocation.address}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">To:</span>
                          <span>{trip.destination.facilityName}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t">
                        <Badge>{trip.status}</Badge>
                        <Button size="sm" variant="outline">
                          Track
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Requests</CardTitle>
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
                            {request.patientInfo.name || "Unknown Patient"}
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
                          {request.priority}
                        </Badge>
                      </div>
                      <div className="space-y-1 text-sm">
                        <p>
                          <span className="text-muted-foreground">Complaint:</span>{" "}
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
                        <Button size="sm">Assign Ambulance</Button>
                        <Button size="sm" variant="outline">
                          View Details
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
              <CardTitle>Active Trips</CardTitle>
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
                        {trip.priority}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Patient:</span>{" "}
                        {trip.patientName}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Age/Gender:</span>{" "}
                        {trip.patientAge}Y / {trip.patientGender}
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Complaint:</span>{" "}
                        {trip.chiefComplaint}
                      </div>
                    </div>

                    <div className="space-y-2 pt-2 border-t">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-green-600 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Pickup Location</p>
                          <p className="text-sm text-muted-foreground">
                            {trip.pickupLocation.address}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Navigation className="h-4 w-4 text-red-600 mt-1" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Destination</p>
                          <p className="text-sm text-muted-foreground">
                            {trip.destination.facilityName}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="secondary">{trip.status}</Badge>
                        <span className="text-muted-foreground">
                          ETA: {trip.estimatedDuration} min
                        </span>
                        <span className="text-muted-foreground">
                          {trip.estimatedDistance} km
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          <MapPin className="mr-1 h-3 w-3" />
                          Track
                        </Button>
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </div>
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Crew</p>
                      <div className="flex gap-2">
                        {trip.crew.map((member, idx) => (
                          <Badge key={idx} variant="outline">
                            {member.name} ({member.role})
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
              <CardTitle>Ambulance Requests</CardTitle>
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
                          {format(request.requestTime, "MMM dd, yyyy HH:mm")}
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
                        {request.priority}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Caller:</span>{" "}
                        {request.callerDetails.name}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contact:</span>{" "}
                        {request.callerDetails.contactNumber}
                      </div>
                      {request.patientInfo.name && (
                        <>
                          <div>
                            <span className="text-muted-foreground">Patient:</span>{" "}
                            {request.patientInfo.name}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Age:</span>{" "}
                            {request.patientInfo.age}Y
                          </div>
                        </>
                      )}
                    </div>

                    <div className="pt-2 border-t">
                      <p className="text-sm">
                        <span className="font-medium">Complaint:</span>{" "}
                        {request.patientInfo.chiefComplaint}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm font-medium">Pickup</p>
                          <p className="text-sm text-muted-foreground">
                            {request.pickupAddress}
                            {request.pickupLandmark && ` (${request.pickupLandmark})`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Navigation className="h-4 w-4 text-muted-foreground mt-1" />
                        <div>
                          <p className="text-sm font-medium">Destination</p>
                          <p className="text-sm text-muted-foreground">
                            {request.destinationAddress}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button size="sm">Assign Ambulance</Button>
                      <Button size="sm" variant="outline">
                        View Map
                      </Button>
                      <Button size="sm" variant="outline">
                        Call Caller
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
              <CardTitle>Fleet Status</CardTitle>
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
                          {vehicle.registrationNumber} • {vehicle.type}
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
                        {vehicle.status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Model:</span>{" "}
                        {vehicle.manufacturer} {vehicle.model}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Year:</span>{" "}
                        {vehicle.yearOfManufacture}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Capacity:</span>{" "}
                        {vehicle.capacity} passengers
                      </div>
                      <div>
                        <span className="text-muted-foreground">Fuel Level:</span>{" "}
                        {vehicle.fuelLevel}%
                      </div>
                      <div>
                        <span className="text-muted-foreground">Mileage:</span>{" "}
                        {vehicle.maintenance.mileage.toLocaleString()} km
                      </div>
                      <div>
                        <span className="text-muted-foreground">Base:</span>{" "}
                        {vehicle.baseStation}
                      </div>
                    </div>

                    {vehicle.crew && vehicle.crew.length > 0 && (
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium mb-2">Current Crew</p>
                        <div className="flex gap-2">
                          {vehicle.crew.map((member, idx) => (
                            <Badge key={idx} variant="outline">
                              {member.name} ({member.role})
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-2">Equipment</p>
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
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Maintenance Log
                      </Button>
                      <Button size="sm" variant="outline">
                        <MapPin className="mr-1 h-3 w-3" />
                        Track
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
