"use client";

import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileImage, 
  Calendar, 
  BarChart3, 
  Settings, 
  AlertTriangle,
  TrendingUp,
  Activity,
  Clock
} from "lucide-react";

// Import all radiology components
import { useTabParam } from "@/hooks/use-tab-param";
import { toast } from "sonner";
import { useClinicalData } from "@/lib/clinical-store";
import { useAccess } from "@/lib/access";
import { RoleNotice } from "@/components/layout/role-notice";
import { PatientFilterBanner, useSelectedPatient } from "@/components/layout/patient-filter-banner";
import type { ImagingOrderFormData } from "@/lib/validations/radiology";
import { ImagingOrders } from "./imaging-orders";
import { RadiologyScheduling } from "./radiology-scheduling";
import { StudyManagement } from "./study-management";
import { RadiologyReports } from "./radiology-reports";
import { PACSIntegration } from "./pacs-integration";
import { formatEquipmentLocation } from "@/lib/radiology-utils";
import type { ImagingOrder, ImagingEquipment, ImagingSchedule, ImagingStudy, RadiologyReport, PACSConfig } from "@/types/radiology";

// Mock data for demonstration
const mockOrders: ImagingOrder[] = [
  {
    id: "ORD-001",
    orderNumber: "IMG2024001",
    patientId: "1",
    patientName: "John Smith",
    patientMRN: "PAT001",
    imagingType: "ct" as const,
    examType: "Head CT",
    bodyPart: "Head",
    clinicalIndication: "Headache with neurological symptoms",
    urgency: "urgent" as const,
    status: "ordered" as const,
    orderDate: new Date("2024-11-15T08:00:00"),
    orderingPhysician: {
      id: "DOC-001",
      name: "Dr. Sarah Johnson",
      department: "Neurology",
      license: "MD12345"
    },
    contrast: {
      required: true,
      type: "iv" as const,
      agent: "Iodine-based",
      allergies: []
    },
    preparationInstructions: [
      "Fast for 4 hours before exam",
      "Arrive 30 minutes early",
      "Inform staff of any allergies"
    ],
    specialInstructions: "Patient has mild anxiety - may need reassurance",
    scheduledDateTime: new Date("2024-11-15T14:00:00"),
    estimatedDuration: 45,
    technologist: { id: "TECH-001", name: "Mike Rodriguez", license: "RT12345" },
    radiologist: { id: "RAD-001", name: "Dr. Emily Chen", license: "RAD12345" },
    createdBy: "DOC-001",
    createdAt: new Date("2024-11-15T08:00:00"),
    updatedAt: new Date("2024-11-15T08:00:00"),
  }
];

const mockSchedules: ImagingSchedule[] = [
  {
    id: "SCH-001",
    orderId: "ORD-001",
    orderNumber: "IMG2024001",
    patientName: "John Smith",
    patientMRN: "MRN001234",
    examType: "Head CT",
    bodyPart: "Head",
    urgency: "urgent" as const,
    scheduledDateTime: new Date("2024-11-15T14:00:00"),
    estimatedDuration: 45,
    status: "scheduled" as const,
    equipmentId: "EQ-001",
    equipment: {
      id: "EQ-001",
      name: "Siemens CT Scanner",
      location: "Radiology Suite 1"
    },
    technicianId: "TECH-001",
    technician: {
      id: "TECH-001",
      name: "Mike Rodriguez"
    },
    notes: "",
    preparationRequired: true,
    preparationInstructions: ["Fast for 4 hours", "Arrive 30 minutes early"]
  }
];

const mockStudies: ImagingStudy[] = [
  {
    id: "STU-001",
    studyInstanceUID: "1.2.840.113619.2.5.1762583153.215519.978957063.78",
    accessionNumber: "ACC001234",
    patientName: "John Smith",
    patientId: "PAT-001",
    studyDate: new Date("2024-11-15T14:00:00"),
    studyDescription: "CT Head without contrast",
    modality: "CT",
    institutionName: "City General Hospital",
    equipment: {
      id: "EQ-001",
      name: "Siemens CT Scanner"
    },
    referringPhysician: "Dr. Sarah Johnson",
    status: "completed" as const,
    series: [
      {
        seriesInstanceUID: "1.2.840.113619.2.5.1762583153.215519.978957063.79",
        seriesNumber: 1,
        seriesDescription: "Axial Head CT",
        instanceCount: 25,
        bodyPartExamined: "HEAD",
        imageSize: 2048576
      }
    ],
    pacsInfo: {
      server: "pacs.hospital.com",
      aeTitle: "HMS_PACS",
      stored: true,
      archived: false,
      retrieveAeTitle: "HMS_RETRIEVE"
    },
    qualityControl: {
      status: "passed" as const,
      overallQuality: "good" as const,
      technicalAdequacy: "adequate" as const,
      artifactsPresent: false,
      reviewedBy: "TECH-001",
      reviewedAt: new Date("2024-11-15T14:45:00"),
      comments: "Good image quality, adequate contrast"
    }
  }
];

const mockReports: RadiologyReport[] = [
  {
    id: "REP-001",
    reportNumber: "RAD2024001",
    studyId: "STU-001",
    orderId: "ORD-001",
    patientId: "PAT-001",
    patientName: "John Smith",
    studyInstanceUID: "1.2.840.113619.2.5.1762583153.215519.978957063.78",
    radiologist: {
      id: "RAD-001",
      name: "Dr. Emily Chen",
      license: "RAD12345",
      signature: ""
    },
    reportType: "preliminary",
    clinicalHistory: "Headache with neurological symptoms",
    technique: "Non-contrast CT of the head performed",
    findings: [
      "No evidence of acute intracranial abnormality",
      "Ventricular system is normal in size and configuration",
      "No midline shift or mass effect"
    ].join("\n"),
    impression: "Normal CT head. No acute findings.",
    recommendations: [
      "Clinical correlation recommended",
      "Consider MRI if symptoms persist"
    ].join("\n"),
    reportStatus: "preliminary",
    status: "pending_review",
    priority: "urgent",
    reportDate: new Date("2024-11-15T15:30:00"),
    dictationDate: new Date("2024-11-15T15:15:00"),
    radiologistId: "RAD-001",
    createdAt: new Date("2024-11-15T15:15:00"),
    updatedAt: new Date("2024-11-15T15:30:00"),
  }
];

const mockPacsConfig: PACSConfig = {
  id: "PACS-001",
  name: "Main PACS Server",
  serverAddress: "pacs.hospital.com",
  port: 11112,
  aeTitle: "HMS_PACS",
  callingAeTitle: "HMS_CLIENT",
  supportedProtocols: ["C-FIND", "C-GET", "C-STORE", "C-ECHO"],
  timeout: 30,
  retryAttempts: 3,
  security: {
    tlsEnabled: true,
    username: "pacs_user",
    password: "encrypted_password",
    certificatePath: "/etc/ssl/certs/pacs.pem"
  },
  storage: {
    compression: "jpeg2000" as const,
    maxFileSize: 500,
    retentionDays: 2555,
    autoArchive: true,
    archivePath: "/archive/dicom"
  },
  isActive: true,
  createdAt: new Date("2024-01-01T00:00:00"),
  updatedAt: new Date("2024-11-15T10:00:00")
};

const mockConnectionStatus = {
  connected: true,
  lastSync: new Date("2024-11-15T10:00:00"),
  syncProgress: 0,
  errors: []
};

export default function RadiologyManagement() {
  const [activeTab, setActiveTab] = useTabParam("overview", ["overview", "orders", "scheduling", "studies", "reports", "pacs"]);

  // Mock data arrays
  const { patients: clinicalPatients, imagingOrders, addImagingOrder } = useClinicalData();
  const { user, can } = useAccess();
  const selectedPatient = useSelectedPatient();
  const patients = clinicalPatients.map((p) => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    mrn: p.patientId,
    age: new Date().getFullYear() - p.dateOfBirth.getFullYear(),
    gender: p.gender,
  }));
  const allOrders: ImagingOrder[] = [...imagingOrders, ...mockOrders];
  const orders = selectedPatient ? allOrders.filter((o) => o.patientId === selectedPatient.id) : allOrders;

  const physicians = [
    { id: "DOC-001", name: "Dr. Sarah Johnson", department: "Neurology", license: "MD12345" },
    { id: "DOC-002", name: "Dr. Michael Brown", department: "Emergency", license: "MD12346" }
  ];

  const equipment: ImagingEquipment[] = [
    {
      id: "EQ-001",
      name: "Siemens CT Scanner",
      type: "ct",
      manufacturer: "Siemens",
      model: "SOMATOM Definition AS",
      serialNumber: "CT001234",
      installationDate: new Date("2020-01-15"),
      lastMaintenanceDate: new Date("2024-10-01"),
      nextMaintenanceDate: new Date("2024-12-01"),
      location: { building: "Main Building", floor: "1", room: "Radiology Suite 1" },
      status: "operational",
      capabilities: ["contrast", "cardiac", "angiography"],
      maxPatientWeight: 227,
      powerRequirements: "480V 3-phase",
      operatingHours: { start: "07:00", end: "19:00", daysOfWeek: [1, 2, 3, 4, 5] },
      technicalSpecs: {},
      utilizationRate: 85,
      maintenanceHistory: [],
      createdAt: new Date("2020-01-15"),
      updatedAt: new Date("2024-10-01"),
    }
  ];

  const technologists = [
    { 
      id: "TECH-001", 
      name: "Mike Rodriguez", 
      certifications: ["CT", "MRI", "X-Ray"], 
      shift: "Day Shift" 
    },
    { 
      id: "TECH-002", 
      name: "Lisa Wong", 
      certifications: ["Ultrasound", "Mammography"], 
      shift: "Evening Shift" 
    }
  ];

  const radiologists = [
    { 
      id: "RAD-001", 
      name: "Dr. Emily Chen", 
      license: "RAD12345", 
      specialties: ["Neuroradiology", "Body Imaging"] 
    },
    { 
      id: "RAD-002", 
      name: "Dr. David Wilson", 
      license: "RAD12346", 
      specialties: ["Cardiac Imaging", "Interventional Radiology"] 
    }
  ];

  const studies = [
    {
      id: "STU-001",
      studyInstanceUID: "1.2.840.113619.2.5.1762583153.215519.978957063.78",
      patientName: "John Smith",
      studyDescription: "CT Head without contrast",
      studyDate: new Date("2024-11-15T14:00:00")
    }
  ];

  // Mock handlers
  const handleCreateOrder = async (data: ImagingOrderFormData) => {
    if (!can("imagingOrder.create")) {
      toast.error("Your role can't create imaging orders");
      return;
    }
    const order = addImagingOrder(data);
    if (order) {
      toast.success(`Imaging order ${order.orderNumber} created`, {
        description: `${order.examType} for ${order.patientName}`,
      });
    } else {
      toast.error("Could not create imaging order", { description: "Patient not found." });
    }
  };

  const handleUpdateOrder = async (id: string, data: any) => {
    console.log("Updating order:", id, data);
  };

  const handleCancelOrder = async (id: string, reason: string) => {
    console.log("Canceling order:", id, reason);
  };

  const handleScheduleOrder = (orderId: string) => {
    console.log("Scheduling order:", orderId);
    setActiveTab("scheduling");
  };

  const handleCreateSchedule = async (data: any) => {
    console.log("Creating schedule:", data);
  };

  const handleUpdateSchedule = async (id: string, data: any) => {
    console.log("Updating schedule:", id, data);
  };

  const handleCancelAppointment = async (scheduleId: string, reason: string) => {
    console.log("Canceling appointment:", scheduleId, reason);
  };

  const handleRescheduleAppointment = async (scheduleId: string, newDateTime: Date, newEquipmentId?: string) => {
    console.log("Rescheduling appointment:", scheduleId, newDateTime, newEquipmentId);
  };

  const handleViewStudy = (studyId: string) => {
    console.log("Viewing study:", studyId);
  };

  const handleQualityControl = async (studyId: string, data: any) => {
    console.log("Quality control:", studyId, data);
  };

  const handleUploadImages = async (studyId: string, files: FileList) => {
    console.log("Uploading images:", studyId, files);
  };

  const handleDownloadStudy = async (studyId: string) => {
    console.log("Downloading study:", studyId);
  };

  const handleShareStudy = async (studyId: string, recipients: string[]) => {
    console.log("Sharing study:", studyId, recipients);
  };

  const handleArchiveStudy = async (studyId: string) => {
    console.log("Archiving study:", studyId);
  };

  const handleCreateReport = async (data: any) => {
    console.log("Creating report:", data);
  };

  const handleUpdateReport = async (id: string, data: any) => {
    console.log("Updating report:", id, data);
  };

  const handleFinalizeReport = async (reportId: string, signature: string) => {
    console.log("Finalizing report:", reportId, signature);
  };

  const handleSendReport = async (reportId: string, recipients: string[]) => {
    console.log("Sending report:", reportId, recipients);
  };

  const handleReportCriticalFinding = async (data: any) => {
    console.log("Reporting critical finding:", data);
  };

  const handleUpdatePacsConfig = async (config: any) => {
    console.log("Updating PACS config:", config);
  };

  const handleTestConnection = async () => {
    console.log("Testing PACS connection");
    return true;
  };

  const handleSyncData = async () => {
    console.log("Syncing PACS data");
  };

  const handleResetConnection = async () => {
    console.log("Resetting PACS connection");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Radiology & Imaging Management</h1>
          <p className="text-lg text-gray-600 mt-2">
            Comprehensive digital imaging workflow management with PACS integration
          </p>
        </div>

        {user && <RoleNotice role={user.role} limits={[!can("imagingOrder.create") && "you can't create imaging orders"].filter(Boolean) as string[]} />}
        <PatientFilterBanner />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-3 sm:grid-cols-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="scheduling" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Scheduling
            </TabsTrigger>
            <TabsTrigger value="studies" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Studies
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="pacs" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              PACS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
                  <FileImage className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+3 from yesterday</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Today's Exams</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">18</div>
                  <p className="text-xs text-muted-foreground">85% completion rate</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">7</div>
                  <p className="text-xs text-muted-foreground">2 urgent, 5 routine</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">PACS Status</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">Online</div>
                  <p className="text-xs text-muted-foreground">98.5% uptime</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                  <CardDescription>Latest imaging orders requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.slice(0, 5).map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{order.patientName}</p>
                          <p className="text-sm text-gray-600">{order.examType}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            order.urgency === "emergency" ? "bg-red-100 text-red-800" :
                            order.urgency === "urgent" ? "bg-orange-100 text-orange-800" :
                            "bg-blue-100 text-blue-800"
                          }>
                            {order.urgency.toUpperCase()}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(order.orderDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Equipment Status</CardTitle>
                  <CardDescription>Current status of imaging equipment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {equipment.map((eq) => (
                      <div key={eq.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{eq.name}</p>
                          <p className="text-sm text-gray-600">{formatEquipmentLocation(eq.location)}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={
                            eq.status === "operational" ? "bg-green-100 text-green-800" :
                            eq.status === "maintenance" ? "bg-yellow-100 text-yellow-800" :
                            "bg-red-100 text-red-800"
                          }>
                            {eq.status.toUpperCase()}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">
                            {eq.utilizationRate}% utilization
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Critical Findings Alert</CardTitle>
                <CardDescription>Urgent findings requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center p-8 text-gray-500">
                  <div className="text-center">
                    <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No critical findings at this time</p>
                    <p className="text-sm mt-1">Critical findings will appear here for immediate review</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <ImagingOrders
              orders={orders}
              defaultPatientId={selectedPatient?.id}
              canCreate={can("imagingOrder.create")}
              patients={patients}
              physicians={physicians}
              onCreateOrder={handleCreateOrder}
              onUpdateOrder={handleUpdateOrder}
              onCancelOrder={handleCancelOrder}
              onScheduleOrder={handleScheduleOrder}
            />
          </TabsContent>

          <TabsContent value="scheduling">
            <RadiologyScheduling
              schedules={mockSchedules}
              equipment={equipment}
              technologists={technologists}
              onCreateSchedule={handleCreateSchedule}
              onUpdateSchedule={handleUpdateSchedule}
              onCancelAppointment={handleCancelAppointment}
              onRescheduleAppointment={handleRescheduleAppointment}
            />
          </TabsContent>

          <TabsContent value="studies">
            <StudyManagement
              studies={mockStudies}
              onViewStudy={handleViewStudy}
              onQualityControl={handleQualityControl}
              onUploadImages={handleUploadImages}
              onDownloadStudy={handleDownloadStudy}
              onShareStudy={handleShareStudy}
              onArchiveStudy={handleArchiveStudy}
            />
          </TabsContent>

          <TabsContent value="reports">
            <RadiologyReports
              reports={mockReports}
              studies={studies}
              radiologists={radiologists}
              onCreateReport={handleCreateReport}
              onUpdateReport={handleUpdateReport}
              onFinalizeReport={handleFinalizeReport}
              onSendReport={handleSendReport}
              onReportCriticalFinding={handleReportCriticalFinding}
            />
          </TabsContent>

          <TabsContent value="pacs">
            <PACSIntegration
              pacsConfig={mockPacsConfig}
              connectionStatus={mockConnectionStatus}
              onUpdateConfig={handleUpdatePacsConfig}
              onTestConnection={handleTestConnection}
              onSyncData={handleSyncData}
              onResetConnection={handleResetConnection}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}