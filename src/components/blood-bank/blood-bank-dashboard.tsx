"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Droplet, 
  Users, 
  Calendar, 
  Package, 
  AlertCircle,
  Plus,
  FileText,
  Activity
} from "lucide-react";
import { format } from "date-fns";
import type { 
  Donor, 
  Donation, 
  BloodUnit, 
  BloodRequest, 
  BloodInventory,
  BloodBankStats 
} from "@/types/blood-bank";

export function BloodBankDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const donors: Donor[] = [
    {
      id: "1",
      donorNumber: "DON-2025-001",
      name: "John Smith",
      dateOfBirth: new Date(1990, 5, 15),
      gender: "male",
      bloodGroup: "O+",
      contactNumber: "+1234567890",
      email: "john.smith@email.com",
      address: "123 Main Street, City",
      donorType: "voluntary",
      registrationDate: new Date(2024, 0, 1),
      lastDonationDate: new Date(2024, 11, 15),
      totalDonations: 8,
      eligibilityStatus: "eligible",
      weight: 75,
      height: 175,
      medicalHistory: {
        chronicDiseases: [],
        currentMedications: [],
        allergies: ["Penicillin"],
        surgeries: [],
      },
      emergencyContact: {
        name: "Jane Smith",
        relationship: "Spouse",
        contactNumber: "+1234567891",
      },
      isActive: true,
    },
  ];

  const donations: Donation[] = [
    {
      id: "1",
      donationNumber: "DON-2025-001",
      donorId: "1",
      donorName: "John Smith",
      donorBloodGroup: "O+",
      donationDate: new Date(2024, 11, 15),
      donationType: "voluntary",
      donationCenter: "Main Blood Bank",
      preScreening: {
        hemoglobin: 14.5,
        bloodPressure: "120/80",
        pulse: 72,
        temperature: 36.8,
        weight: 75,
        medicalOfficer: "Dr. Wilson",
        screeningStatus: "passed",
      },
      collectionDetails: {
        bagNumber: "BAG-2025-001",
        volumeCollected: 450,
        anticoagulant: "CPD",
        phlebotomist: "Nurse Sarah",
        armUsed: "left",
      },
      testingStatus: "completed",
      testResults: {
        hiv: "negative",
        hbsag: "negative",
        hcv: "negative",
        vdrl: "negative",
        malaria: "negative",
        bloodGroupConfirmed: "O+",
        testedBy: "Lab Tech Mike",
        testedDate: new Date(2024, 11, 16),
      },
      componentsSeparated: [
        {
          component: "packed-rbc",
          unitNumber: "PRBC-2025-001",
          volume: 350,
          expiryDate: new Date(2025, 0, 15),
        },
        {
          component: "plasma",
          unitNumber: "PLS-2025-001",
          volume: 250,
          expiryDate: new Date(2025, 11, 15),
        },
      ],
      status: "ready",
      createdBy: "Staff 001",
    },
  ];

  const bloodUnits: BloodUnit[] = [
    {
      id: "1",
      unitNumber: "PRBC-2025-001",
      bagNumber: "BAG-2025-001",
      donationId: "1",
      donorBloodGroup: "O+",
      component: "packed-rbc",
      volume: 350,
      collectionDate: new Date(2024, 11, 15),
      expiryDate: new Date(2025, 0, 15),
      status: "available",
      storageLocation: "Fridge-A-Shelf-2",
      storageTemperature: 4,
      crossMatchingRequired: true,
      qualityCheck: {
        visualInspection: "passed",
        temperature: 4,
        checkedBy: "QC Staff",
        checkedDate: new Date(2024, 11, 16),
      },
      isActive: true,
    },
  ];

  const bloodRequests: BloodRequest[] = [
    {
      id: "1",
      requisitionNumber: "REQ-2025-001",
      patientId: "PAT001",
      patientName: "Michael Brown",
      patientBloodGroup: "O+",
      requestedBy: "Dr. Anderson",
      requestedDate: new Date(2024, 11, 20),
      requiredBy: new Date(2024, 11, 21),
      department: "Surgery",
      ward: "Ward-A",
      bedNumber: "A-101",
      clinicalDiagnosis: "Anemia post-surgery",
      indication: "Low hemoglobin - 7.5 g/dL",
      componentsRequested: [
        {
          component: "packed-rbc",
          quantity: 2,
          urgency: "urgent",
        },
      ],
      crossMatchRequired: true,
      patientHistory: {
        previousTransfusions: 1,
        lastTransfusionDate: new Date(2024, 0, 15),
      },
      status: "pending",
      priority: "urgent",
    },
  ];

  const inventory: BloodInventory[] = [
    { bloodGroup: "O+", component: "packed-rbc", available: 45, reserved: 5, expired: 2, expiringIn7Days: 3, minimumLevel: 30, status: "adequate" },
    { bloodGroup: "O-", component: "packed-rbc", available: 12, reserved: 2, expired: 0, expiringIn7Days: 1, minimumLevel: 15, status: "low" },
    { bloodGroup: "A+", component: "packed-rbc", available: 38, reserved: 3, expired: 1, expiringIn7Days: 2, minimumLevel: 25, status: "adequate" },
    { bloodGroup: "B+", component: "packed-rbc", available: 8, reserved: 1, expired: 0, expiringIn7Days: 2, minimumLevel: 20, status: "critical" },
  ];

  const stats: BloodBankStats = {
    totalDonors: 1250,
    activeDonors: 980,
    donationsToday: 12,
    donationsThisMonth: 285,
    totalUnitsAvailable: 420,
    unitsIssuedToday: 8,
    unitsExpiring7Days: 15,
    pendingRequests: 6,
    criticalStockItems: 2,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Blood Bank Management</h2>
          <p className="text-muted-foreground">
            Manage donations, inventory, and transfusion services
          </p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Register Donor
          </Button>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Camp
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeDonors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalDonors} total registered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Donations Today</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.donationsToday}</div>
            <p className="text-xs text-muted-foreground">
              {stats.donationsThisMonth} this month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Units Available</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUnitsAvailable}</div>
            <p className="text-xs text-muted-foreground">
              {stats.unitsExpiring7Days} expiring in 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingRequests}</div>
            <p className="text-xs text-muted-foreground">
              {stats.criticalStockItems} critical stock items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
          <TabsTrigger value="donors">Donors</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div
                      key={donation.id}
                      className="flex items-center justify-between border-b pb-2"
                    >
                      <div>
                        <p className="font-medium">{donation.donorName}</p>
                        <p className="text-sm text-muted-foreground">
                          {donation.donationNumber} • {donation.donorBloodGroup}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            donation.status === "ready"
                              ? "default"
                              : donation.status === "rejected"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {donation.status}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(donation.donationDate, "MMM dd, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Critical Stock Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {inventory
                    .filter((item) => item.status === "critical" || item.status === "low")
                    .map((item, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Droplet className="h-4 w-4 text-red-500" />
                            <span className="font-medium">
                              {item.bloodGroup} - {item.component}
                            </span>
                          </div>
                          <Badge
                            variant={item.status === "critical" ? "destructive" : "secondary"}
                          >
                            {item.available} units
                          </Badge>
                        </div>
                        <Progress
                          value={(item.available / item.minimumLevel) * 100}
                          className="h-2"
                        />
                        <p className="text-xs text-muted-foreground">
                          Minimum level: {item.minimumLevel} units
                        </p>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Blood Inventory Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {inventory.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100">
                          <Droplet className="h-6 w-6 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">
                            {item.bloodGroup} - {item.component}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Min Level: {item.minimumLevel} units
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge
                          variant={
                            item.status === "adequate"
                              ? "default"
                              : item.status === "low"
                              ? "secondary"
                              : "destructive"
                          }
                        >
                          {item.status}
                        </Badge>
                        <p className="text-sm mt-1">
                          <span className="font-semibold">{item.available}</span> available
                        </p>
                      </div>
                    </div>
                    <Progress
                      value={Math.min((item.available / item.minimumLevel) * 100, 100)}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Reserved: {item.reserved}</span>
                      <span>Expiring soon: {item.expiringIn7Days}</span>
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
              <CardTitle>Blood Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {bloodRequests.map((request) => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{request.patientName}</p>
                        <p className="text-sm text-muted-foreground">
                          {request.requisitionNumber} • {request.patientBloodGroup}
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
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Department:</span>{" "}
                        {request.department}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Ward:</span>{" "}
                        {request.ward}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Required By:</span>{" "}
                        {format(request.requiredBy, "MMM dd, HH:mm")}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Requested By:</span>{" "}
                        {request.requestedBy}
                      </div>
                    </div>
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-1">Components Requested:</p>
                      {request.componentsRequested.map((comp, idx) => (
                        <Badge key={idx} variant="outline" className="mr-2">
                          {comp.component} × {comp.quantity}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm">Approve</Button>
                      <Button size="sm" variant="outline">
                        Cross Match
                      </Button>
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

        <TabsContent value="donors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Registered Donors</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {donors.map((donor) => (
                  <div
                    key={donor.id}
                    className="border rounded-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{donor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {donor.donorNumber} • {donor.bloodGroup}
                        </p>
                      </div>
                      <Badge
                        variant={
                          donor.eligibilityStatus === "eligible"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {donor.eligibilityStatus}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Donor Type:</span>{" "}
                        {donor.donorType}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Total Donations:</span>{" "}
                        {donor.totalDonations}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Last Donation:</span>{" "}
                        {donor.lastDonationDate
                          ? format(donor.lastDonationDate, "MMM dd, yyyy")
                          : "Never"}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Contact:</span>{" "}
                        {donor.contactNumber}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        Schedule Donation
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
      </Tabs>
    </div>
  );
}
