"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MedicalRecord, MedicalDocument, ConsentForm as ConsentFormRecord } from "@/features/doctor/medical-records/types";
import type { ConsentFormData } from "@/features/doctor/medical-records/validations";
import { ConsentForm, CONSENT_TYPE_LABELS } from "@/features/doctor/medical-records/components/consent-form";
import { FileText, Download, Upload, Shield, Clock, File, FileSignature, Plus } from "lucide-react";
import { format } from "date-fns";
import { useTabParam } from "@/hooks/use-tab-param";

export function MedicalRecordsDashboard() {
  const [activeTab, setActiveTab] = useTabParam("overview", ["overview", "records", "documents", "consents"] as const);

  // Mock data
  const record: MedicalRecord = {
    id: "1",
    recordNumber: "MR-001",
    patientId: "PAT001",
    patientName: "John Doe",
    dateOfBirth: new Date(1980, 5, 15),
    gender: "male",
    bloodGroup: "A+",
    allergies: [
      { allergen: "Penicillin", reaction: "Rash", severity: "moderate", dateIdentified: new Date(2010, 5, 1) },
    ],
    chronicConditions: [
      { condition: "Hypertension", diagnosedDate: new Date(2015, 0, 1), status: "managed", notes: "Well controlled" },
      { condition: "Type 2 Diabetes", diagnosedDate: new Date(2018, 5, 15), status: "managed", notes: "Diet and medication" },
    ],
    surgicalHistory: [
      {
        procedure: "Appendectomy",
        date: new Date(2015, 3, 10),
        surgeon: "Dr. Smith",
        hospital: "City Hospital",
      },
    ],
    familyHistory: [
      { relation: "Father", condition: "Hypertension", ageOfOnset: 55 },
    ],
    socialHistory: {
      smokingStatus: "never",
      alcoholConsumption: "occasional",
      occupation: "Software Engineer",
      maritalStatus: "married",
    },
    currentMedications: [
      {
        medicationName: "Lisinopril",
        dosage: "10mg",
        frequency: "once daily",
        startDate: new Date(2023, 0, 1),
        prescribedBy: "Dr. Johnson",
        indication: "Hypertension",
      },
    ],
    immunizations: [
      {
        vaccine: "COVID-19",
        dateAdministered: new Date(2024, 5, 1),
        administeredBy: "Nurse Mary",
        batchNumber: "ABC123",
      },
    ],
    lastUpdated: new Date(),
    lastUpdatedBy: "Dr. Johnson",
  };

  const documents: MedicalDocument[] = [
    {
      id: "1",
      documentNumber: "DOC-001",
      patientId: "PAT001",
      patientName: "John Doe",
      documentType: "lab-report",
      title: "Complete Blood Count",
      description: "CBC test results",
      uploadedDate: new Date(2025, 0, 10),
      uploadedBy: "Lab Technician",
      fileUrl: "/documents/cbc-001.pdf",
      fileName: "cbc-001.pdf",
      fileSize: 245000,
      fileType: "application/pdf",
      tags: ["lab", "blood-test"],
      category: "clinical",
      isVerified: true,
      isConfidential: true,
      accessLevel: "confidential",
    },
    {
      id: "2",
      documentNumber: "DOC-002",
      patientId: "PAT001",
      patientName: "John Doe",
      documentType: "radiology-report",
      title: "Chest X-Ray",
      description: "Chest X-ray examination",
      uploadedDate: new Date(2025, 0, 5),
      uploadedBy: "Radiology Tech",
      fileUrl: "/documents/xray-001.jpg",
      fileName: "xray-001.jpg",
      fileSize: 1250000,
      fileType: "image/jpeg",
      tags: ["radiology", "chest"],
      category: "clinical",
      isVerified: true,
      isConfidential: true,
      accessLevel: "confidential",
    },
  ];

  const patients = [
    { id: "PAT001", name: "John Doe" },
    { id: "PAT002", name: "Jane Smith" },
    { id: "PAT003", name: "Robert Brown" },
  ];

  const [consents, setConsents] = useState<ConsentFormRecord[]>([
    {
      id: "1",
      formNumber: "CF-0001",
      patientId: "PAT001",
      patientName: "John Doe",
      consentType: "surgery",
      procedureName: "Laparoscopic Cholecystectomy",
      procedureDescription: "Removal of the gallbladder through small incisions using a camera.",
      risks: ["Bleeding", "Infection", "Bile duct injury"],
      benefits: ["Relief from gallstone pain"],
      alternatives: ["Open surgery", "Medication"],
      explainedBy: "Dr. Smith",
      explainedByDesignation: "Consultant Surgeon",
      explainedDate: new Date(2025, 0, 12),
      patientUnderstands: true,
      questionsAnswered: true,
      consentGivenBy: "patient",
      witnessName: "Nurse Mary",
      patientSignature: "John Doe",
      signedDate: new Date(2025, 0, 12),
      relatedProcedureId: "SUR-0042",
      status: "signed",
    },
  ]);
  const [isConsentDialogOpen, setIsConsentDialogOpen] = useState(false);

  const handleCreateConsent = (data: ConsentFormData) => {
    const now = new Date();
    const { signatureName, ...rest } = data;
    setConsents((prev) => [
      {
        ...rest,
        id: crypto.randomUUID(),
        formNumber: `CF-${String(prev.length + 1).padStart(4, "0")}`,
        patientName: patients.find((p) => p.id === data.patientId)?.name ?? data.patientId,
        relatedProcedureId: data.relatedProcedureId || undefined,
        guardianName: data.consentGivenBy === "patient" ? undefined : data.guardianName,
        guardianRelation: data.consentGivenBy === "patient" ? undefined : data.guardianRelation,
        guardianPhone: data.consentGivenBy === "patient" ? undefined : data.guardianPhone,
        patientSignature: data.consentGivenBy === "patient" ? signatureName : undefined,
        guardianSignature: data.consentGivenBy === "patient" ? undefined : signatureName,
        explainedDate: now,
        signedDate: now,
        status: "signed",
      },
      ...prev,
    ]);
    setIsConsentDialogOpen(false);
  };

  const handleWithdrawConsent = (id: string) => {
    const reason = window.prompt("Reason for withdrawing consent:");
    if (!reason?.trim()) return;
    setConsents((prev) =>
      prev.map((c) =>
        c.id === id ? { ...c, status: "withdrawn", withdrawnDate: new Date(), withdrawnReason: reason.trim() } : c
      )
    );
  };

  const consentStatusVariant: Record<ConsentFormRecord["status"], "default" | "secondary" | "destructive" | "outline"> = {
    signed: "default",
    pending: "secondary",
    withdrawn: "destructive",
    expired: "outline",
  };

  const stats = {
    totalPatients: 1250,
    activeRecords: 1180,
    documentsStored: 5420,
    pendingUploads: 12,
    recentUpdates: 35,
    certificatesIssued: 48,
    dischargeSummaries: 23,
  };

  const getSecurityIcon = (level: string) => {
    return <Shield className={`h-4 w-4 ${level === "confidential" ? "text-red-500" : "text-yellow-500"}`} />;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Medical Records Management</h1>
        <p className="text-muted-foreground">Comprehensive patient medical records and documents</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="records">Patient Records</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="consents">Consent Forms</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPatients}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeRecords} active records
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Documents Stored</CardTitle>
                <File className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.documentsStored}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.pendingUploads} pending uploads
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Recent Updates</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.recentUpdates}</div>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certificates Issued</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.certificatesIssued}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common medical record operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  New Record
                </Button>
                <Button variant="outline" className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  Issue Certificate
                </Button>
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Discharge Summary
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates to medical records</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Medical record updated</p>
                    <p className="text-sm text-muted-foreground">John Doe - New medication added</p>
                  </div>
                  <Badge variant="outline">2 hours ago</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Document uploaded</p>
                    <p className="text-sm text-muted-foreground">Jane Smith - Lab report</p>
                  </div>
                  <Badge variant="outline">3 hours ago</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <p className="font-medium">Certificate issued</p>
                    <p className="text-sm text-muted-foreground">Medical fitness certificate</p>
                  </div>
                  <Badge variant="outline">5 hours ago</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Patient Medical Record</CardTitle>
                  <CardDescription>Comprehensive medical history</CardDescription>
                </div>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Edit Record
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Patient Info */}
              <div>
                <h3 className="font-semibold text-lg mb-3">{record.patientName}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Date of Birth</div>
                    <div className="font-medium">{format(record.dateOfBirth, "PP")}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Blood Group</div>
                    <div className="font-medium">{record.bloodGroup}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Marital Status</div>
                    <div className="font-medium capitalize">{record.socialHistory.maritalStatus}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Occupation</div>
                    <div className="font-medium">{record.socialHistory.occupation}</div>
                  </div>
                </div>
              </div>

              {/* Allergies */}
              <div>
                <h4 className="font-semibold mb-2">Allergies</h4>
                <div className="space-y-2">
                  {record.allergies.map((allergy, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <span className="font-medium">{allergy.allergen}</span>
                        <span className="text-sm text-muted-foreground ml-2">• {allergy.reaction}</span>
                      </div>
                      <Badge variant={allergy.severity === "severe" ? "destructive" : "secondary"}>
                        {allergy.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chronic Conditions */}
              <div>
                <h4 className="font-semibold mb-2">Chronic Conditions</h4>
                <div className="space-y-2">
                  {record.chronicConditions.map((condition, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{condition.condition}</p>
                          <p className="text-sm text-muted-foreground">
                            Diagnosed: {format(condition.diagnosedDate, "PP")}
                          </p>
                          {condition.notes && (
                            <p className="text-sm text-muted-foreground">{condition.notes}</p>
                          )}
                        </div>
                        <Badge variant={condition.status === "active" ? "default" : "secondary"}>
                          {condition.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Medications */}
              <div>
                <h4 className="font-semibold mb-2">Current Medications</h4>
                <div className="space-y-2">
                  {record.currentMedications.map((med, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium">{med.medicationName}</p>
                          <p className="text-sm text-muted-foreground">
                            {med.dosage} • {med.frequency}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Prescribed by {med.prescribedBy} on {format(med.startDate, "PP")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Surgical History */}
              <div>
                <h4 className="font-semibold mb-2">Surgical History</h4>
                <div className="space-y-2">
                  {record.surgicalHistory.map((surgery, idx) => (
                    <div key={idx} className="p-3 border rounded-lg">
                      <p className="font-medium">{surgery.procedure}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(surgery.date, "PP")} • {surgery.surgeon} • {surgery.hospital}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Immunizations */}
              <div>
                <h4 className="font-semibold mb-2">Immunization Records</h4>
                <div className="space-y-2">
                  {record.immunizations.map((vacc, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{vacc.vaccine}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(vacc.dateAdministered, "PP")} • {vacc.administeredBy}
                        </p>
                      </div>
                      <Badge variant="outline">Batch: {vacc.batchNumber}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Medical Documents</CardTitle>
                  <CardDescription>Patient documents and reports</CardDescription>
                </div>
                <Button>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {documents.map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <File className="h-5 w-5" />
                            <h3 className="font-semibold text-lg">{doc.title}</h3>
                            <Badge variant="outline" className="capitalize">
                              {doc.documentType.replace("-", " ")}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Type</div>
                              <div className="font-medium capitalize">
                                {doc.documentType.replace("-", " ")}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">File</div>
                              <div className="font-medium">{doc.fileName}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Uploaded By</div>
                              <div className="font-medium">{doc.uploadedBy}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Date</div>
                              <div className="font-medium">{format(doc.uploadedDate, "PP")}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Size</div>
                              <div className="font-medium">
                                {(doc.fileSize / 1000).toFixed(0)} KB
                              </div>
                            </div>
                          </div>

                          {doc.description && (
                            <div className="text-sm text-muted-foreground">{doc.description}</div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Download className="mr-2 h-4 w-4" />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="consents" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Consent Forms</CardTitle>
                  <CardDescription>Informed consent for procedures, treatment and research</CardDescription>
                </div>
                <Button onClick={() => setIsConsentDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Consent
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {consents.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No consent forms recorded yet.</p>
              ) : (
                <div className="space-y-4">
                  {consents.map((consent) => (
                    <Card key={consent.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <FileSignature className="h-5 w-5" />
                              <h3 className="font-semibold text-lg">{consent.procedureName}</h3>
                              <Badge variant="outline">{CONSENT_TYPE_LABELS[consent.consentType]}</Badge>
                              <Badge variant={consentStatusVariant[consent.status]} className="capitalize">
                                {consent.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                              <div>
                                <div className="text-muted-foreground">Form #</div>
                                <div className="font-medium">{consent.formNumber}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Patient</div>
                                <div className="font-medium">{consent.patientName}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Consent By</div>
                                <div className="font-medium capitalize">
                                  {consent.consentGivenBy === "patient"
                                    ? "Patient"
                                    : `${consent.guardianName} (${consent.guardianRelation})`}
                                </div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Explained By</div>
                                <div className="font-medium">{consent.explainedBy}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Signed</div>
                                <div className="font-medium">{format(consent.signedDate, "PP")}</div>
                              </div>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Risks: {consent.risks.join(", ")} · Witness: {consent.witnessName}
                            </div>
                            {consent.status === "withdrawn" && consent.withdrawnDate && (
                              <div className="text-sm text-red-600">
                                Withdrawn {format(consent.withdrawnDate, "PP")}: {consent.withdrawnReason}
                              </div>
                            )}
                          </div>
                          {consent.status === "signed" && (
                            <Button size="sm" variant="outline" onClick={() => handleWithdrawConsent(consent.id)}>
                              Withdraw
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Dialog open={isConsentDialogOpen} onOpenChange={setIsConsentDialogOpen}>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>New Consent Form</DialogTitle>
                <DialogDescription>Record informed consent before the procedure.</DialogDescription>
              </DialogHeader>
              <ConsentForm
                patients={patients}
                onSubmit={handleCreateConsent}
                onCancel={() => setIsConsentDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}
