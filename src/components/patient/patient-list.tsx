"use client";

import React, { useState } from "react";
import { Activity, Search, Plus, Eye, Edit, QrCode, Barcode, CreditCard, FileText, Calendar } from "lucide-react";
import { Patient } from "@/types/patient";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface PatientListProps {
  patients: Patient[];
  onAddPatient: () => void;
  onViewPatient: (patient: Patient) => void;
  onEditPatient: (patient: Patient) => void;
  onViewEHR: (patient: Patient) => void;
  onScheduleAppointment: (patient: Patient) => void;
}

export function PatientList({
  patients,
  onAddPatient,
  onViewPatient,
  onEditPatient,
  onViewEHR,
  onScheduleAppointment
}: PatientListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive" | "deceased">("all");

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery);
    
    const matchesFilter = filterStatus === "all" || patient.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-200";
      case "inactive":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "deceased":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Patient Management</h1>
          <p className="text-muted-foreground">
            Manage patient records, registration, and information
          </p>
        </div>
        <Button onClick={onAddPatient}>
          <Plus className="mr-2 h-4 w-4" />
          Add New Patient
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Search Patients</CardTitle>
          <CardDescription>
            Search by name, patient ID, email, or phone number
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 transform -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search patients..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {["all", "active", "inactive", "deceased"].map((status) => (
                <Button
                  key={status}
                  variant={filterStatus === status ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(status as any)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patient List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredPatients.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No patients found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "Try adjusting your search criteria" : "Get started by adding your first patient"}
            </p>
            {!searchQuery && (
              <Button onClick={onAddPatient}>
                <Plus className="mr-2 h-4 w-4" />
                Add First Patient
              </Button>
            )}
          </div>
        ) : (
          filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">
                      {patient.firstName} {patient.lastName}
                    </CardTitle>
                    <CardDescription className="space-y-1">
                      <div>ID: {patient.patientId}</div>
                      <div>Age: {calculateAge(patient.dateOfBirth)} years</div>
                      <div>Phone: {patient.phone}</div>
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(patient.status)}>
                    {patient.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Quick Info */}
                  <div className="text-sm space-y-1">
                    <div><span className="font-medium">Gender:</span> {patient.gender}</div>
                    {patient.bloodType && (
                      <div><span className="font-medium">Blood Type:</span> {patient.bloodType}</div>
                    )}
                    <div><span className="font-medium">Registered:</span> {format(patient.registrationDate, "MMM dd, yyyy")}</div>
                    {patient.lastVisit && (
                      <div><span className="font-medium">Last Visit:</span> {format(patient.lastVisit, "MMM dd, yyyy")}</div>
                    )}
                  </div>

                  {/* Identification Methods */}
                  <div className="flex gap-2 flex-wrap">
                    {patient.qrCode && (
                      <Badge variant="outline" className="text-xs">
                        <QrCode className="mr-1 h-3 w-3" />
                        QR
                      </Badge>
                    )}
                    {patient.barcode && (
                      <Badge variant="outline" className="text-xs">
                        <Barcode className="mr-1 h-3 w-3" />
                        Barcode
                      </Badge>
                    )}
                    {patient.rfidId && (
                      <Badge variant="outline" className="text-xs">
                        <CreditCard className="mr-1 h-3 w-3" />
                        RFID
                      </Badge>
                    )}
                    {patient.insurance && (
                      <Badge variant="outline" className="text-xs">
                        <CreditCard className="mr-1 h-3 w-3" />
                        Insured
                      </Badge>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewPatient(patient)}
                      className="flex-1"
                    >
                      <Eye className="mr-1 h-3 w-3" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEditPatient(patient)}
                      className="flex-1"
                    >
                      <Edit className="mr-1 h-3 w-3" />
                      Edit
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewEHR(patient)}
                      className="flex-1"
                    >
                      <FileText className="mr-1 h-3 w-3" />
                      EHR
                    </Button>
                    <Button size="sm" variant="outline" asChild className="flex-1">
                      <Link href={`/patients/${patient.id}`}>
                        <Activity className="mr-1 h-3 w-3" />
                        Timeline
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onScheduleAppointment(patient)}
                      className="flex-1"
                    >
                      <Calendar className="mr-1 h-3 w-3" />
                      Book
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Summary Stats */}
      {filteredPatients.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{filteredPatients.length}</div>
              <p className="text-xs text-muted-foreground">Total Patients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredPatients.filter(p => p.status === "active").length}
              </div>
              <p className="text-xs text-muted-foreground">Active Patients</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredPatients.filter(p => p.lastVisit && 
                  new Date(p.lastVisit) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
              </div>
              <p className="text-xs text-muted-foreground">Recent Visits (30d)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredPatients.filter(p => p.insurance).length}
              </div>
              <p className="text-xs text-muted-foreground">With Insurance</p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}