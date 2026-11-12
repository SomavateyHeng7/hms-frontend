"use client";

import React, { useState } from "react";
import { Patient, Appointment, Visit, EHRRecord } from "@/types/patient";
import { format } from "date-fns";
import { 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  FileText, 
  Heart, 
  Pill, 
  AlertTriangle,
  CreditCard,
  QrCode,
  Barcode,
  Edit,
  Download,
  Printer
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import QRCodeComponent from "react-qr-code";

interface PatientDetailsProps {
  patient: Patient;
  appointments?: Appointment[];
  visits?: Visit[];
  ehrRecords?: EHRRecord[];
  onEdit: () => void;
  onClose: () => void;
}

export function PatientDetails({
  patient,
  appointments = [],
  visits = [],
  ehrRecords = [],
  onEdit,
  onClose
}: PatientDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const calculateAge = (dateOfBirth: Date) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-yellow-100 text-yellow-800";
      case "deceased":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getAppointmentStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-orange-100 text-orange-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "no-show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const recentAppointments = appointments
    .sort((a, b) => new Date(b.appointmentDate).getTime() - new Date(a.appointmentDate).getTime())
    .slice(0, 5);

  const recentVisits = visits
    .sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
    .slice(0, 5);

  const recentEHRRecords = ehrRecords
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
            {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold">
              {patient.firstName} {patient.middleName && `${patient.middleName} `}{patient.lastName}
            </h1>
            <p className="text-lg text-muted-foreground">
              Patient ID: {patient.patientId} • Age: {calculateAge(patient.dateOfBirth)} years
            </p>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getStatusColor(patient.status)}>
                {patient.status}
              </Badge>
              {patient.bloodType && (
                <Badge variant="outline">
                  Blood Type: {patient.bloodType}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="visits">Visit History</TabsTrigger>
          <TabsTrigger value="ehr">EHR Records</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Date of Birth:</span>
                    <p>{format(patient.dateOfBirth, "MMMM dd, yyyy")}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Gender:</span>
                    <p>{patient.gender}</p>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Registration Date:</span>
                    <p>{format(patient.registrationDate, "MMMM dd, yyyy")}</p>
                  </div>
                  {patient.lastVisit && (
                    <div>
                      <span className="font-medium text-muted-foreground">Last Visit:</span>
                      <p>{format(patient.lastVisit, "MMMM dd, yyyy")}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.phone}</span>
                  </div>
                  {patient.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.email}</span>
                    </div>
                  )}
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <p>{patient.address.street}</p>
                      <p>{patient.address.city}, {patient.address.state} {patient.address.zipCode}</p>
                      <p>{patient.address.country}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Emergency Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">{patient.emergencyContact.name}</span>
                    <span className="text-muted-foreground ml-2">({patient.emergencyContact.relationship})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{patient.emergencyContact.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Insurance Information */}
            {patient.insurance && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Insurance Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div>
                    <span className="font-medium text-muted-foreground">Provider:</span>
                    <p>{patient.insurance.provider}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-muted-foreground">Policy Number:</span>
                      <p>{patient.insurance.policyNumber}</p>
                    </div>
                    <div>
                      <span className="font-medium text-muted-foreground">Member ID:</span>
                      <p>{patient.insurance.membershipId}</p>
                    </div>
                  </div>
                  {patient.insurance.groupNumber && (
                    <div>
                      <span className="font-medium text-muted-foreground">Group Number:</span>
                      <p>{patient.insurance.groupNumber}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Medical Information */}
            <div className="space-y-6">
              {patient.medicalHistory && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Medical History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{patient.medicalHistory}</p>
                  </CardContent>
                </Card>
              )}

              {patient.allergies && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      Allergies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{patient.allergies}</p>
                  </CardContent>
                </Card>
              )}

              {patient.currentMedications && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Pill className="h-5 w-5" />
                      Current Medications
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm whitespace-pre-wrap">{patient.currentMedications}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Patient Identification */}
            <Card>
              <CardHeader>
                <CardTitle>Patient Identification</CardTitle>
                <CardDescription>QR codes, barcodes, and RFID for patient identification</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {patient.qrCode && (
                  <div className="flex flex-col items-center space-y-2">
                    <div className="p-4 bg-white border rounded-lg">
                      <QRCodeComponent
                        value={patient.qrCode}
                        size={128}
                        style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">QR Code: {patient.qrCode}</p>
                  </div>
                )}
                
                <div className="flex gap-2 flex-wrap">
                  {patient.barcode && (
                    <Badge variant="outline">
                      <Barcode className="mr-1 h-3 w-3" />
                      Barcode: {patient.barcode}
                    </Badge>
                  )}
                  {patient.rfidId && (
                    <Badge variant="outline">
                      <CreditCard className="mr-1 h-3 w-3" />
                      RFID: {patient.rfidId}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Appointments</CardTitle>
              <CardDescription>Patient's appointment history and upcoming appointments</CardDescription>
            </CardHeader>
            <CardContent>
              {recentAppointments.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="mx-auto h-12 w-12 mb-4" />
                  <p>No appointments found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentAppointments.map((appointment) => (
                    <div key={appointment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{appointment.doctorName}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(appointment.appointmentDate, "MMMM dd, yyyy")} at {appointment.appointmentTime}
                        </div>
                        <div className="text-sm">{appointment.reason}</div>
                        <div className="text-xs text-muted-foreground">
                          {appointment.department} • {appointment.duration} minutes
                        </div>
                      </div>
                      <Badge className={getAppointmentStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visits" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visit History</CardTitle>
              <CardDescription>Patient's medical visits and consultations</CardDescription>
            </CardHeader>
            <CardContent>
              {recentVisits.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="mx-auto h-12 w-12 mb-4" />
                  <p>No visits found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentVisits.map((visit) => (
                    <div key={visit.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{visit.doctorName}</div>
                          <div className="text-sm text-muted-foreground">
                            {format(visit.visitDate, "MMMM dd, yyyy")} at {visit.visitTime}
                          </div>
                        </div>
                        <Badge variant="outline">{visit.type}</Badge>
                      </div>
                      <div className="space-y-1">
                        <div><span className="font-medium">Chief Complaint:</span> {visit.chiefComplaint}</div>
                        {visit.diagnosis && (
                          <div><span className="font-medium">Diagnosis:</span> {visit.diagnosis}</div>
                        )}
                        {visit.treatment && (
                          <div><span className="font-medium">Treatment:</span> {visit.treatment}</div>
                        )}
                        {visit.vitals && (
                          <div className="text-sm text-muted-foreground">
                            Vitals: 
                            {visit.vitals.temperature && ` Temp: ${visit.vitals.temperature}°F`}
                            {visit.vitals.bloodPressure && ` BP: ${visit.vitals.bloodPressure}`}
                            {visit.vitals.heartRate && ` HR: ${visit.vitals.heartRate} bpm`}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ehr" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Electronic Health Records</CardTitle>
              <CardDescription>Complete medical record history</CardDescription>
            </CardHeader>
            <CardContent>
              {recentEHRRecords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Heart className="mx-auto h-12 w-12 mb-4" />
                  <p>No EHR records found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentEHRRecords.map((record) => (
                    <div key={record.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-medium">{record.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {record.doctorName} • {record.department}
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{record.recordType}</Badge>
                          <div className="text-sm text-muted-foreground mt-1">
                            {format(record.date, "MMM dd, yyyy")}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm">{record.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}