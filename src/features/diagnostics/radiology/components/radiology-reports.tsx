"use client";

import React, { useState } from "react";
import { Plus, Search, Filter, FileText, AlertTriangle, Clock, CheckCircle, Edit, Eye, Download, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { RadiologyReport, RadiologyReportFormData, CriticalFindingFormData } from "@/features/diagnostics/radiology/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { radiologyReportSchema, criticalFindingSchema } from "@/features/diagnostics/radiology/validations";
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { RADIOLOGY_KM } from "@/features/diagnostics/radiology/km";

interface RadiologyReportsProps {
  reports: RadiologyReport[];
  studies: { id: string; studyInstanceUID: string; patientName: string; studyDescription: string; studyDate: Date }[];
  radiologists: { id: string; name: string; license: string; specialties: string[] }[];
  onCreateReport: (data: RadiologyReportFormData) => Promise<void>;
  onUpdateReport: (id: string, data: Partial<RadiologyReport>) => Promise<void>;
  onFinalizeReport: (reportId: string, signature: string) => Promise<void>;
  onSendReport: (reportId: string, recipients: string[]) => Promise<void>;
  onReportCriticalFinding: (data: CriticalFindingFormData) => Promise<void>;
}

const REPORT_STATUS_CONFIG = {
  draft: { color: "bg-gray-100 text-gray-800", icon: Edit },
  preliminary: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  final: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  amended: { color: "bg-blue-100 text-blue-800", icon: FileText },
  cancelled: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
};

const REPORT_TEMPLATES = {
  normal_chest_xray: {
    name: "Normal Chest X-Ray",
    impression: "Normal chest radiograph. No acute cardiopulmonary abnormality.",
    findings: "Heart size is normal. Lungs are clear bilaterally. No pleural effusion or pneumothorax. Mediastinum is unremarkable. Osseous structures appear intact.",
  },
  normal_ct_abdomen: {
    name: "Normal CT Abdomen/Pelvis",
    impression: "Normal CT abdomen and pelvis. No acute findings.",
    findings: "Liver, gallbladder, pancreas, spleen, and kidneys appear normal. No evidence of obstruction or inflammation. Bowel appears normal. No lymphadenopathy or free fluid.",
  },
  normal_mri_brain: {
    name: "Normal MRI Brain",
    impression: "Normal MRI brain. No acute intracranial abnormality.",
    findings: "No evidence of acute infarct, hemorrhage, or mass effect. Ventricular system is normal. No midline shift. Brain parenchyma appears normal for age.",
  },
};

export function RadiologyReports({
  reports,
  studies,
  radiologists,
  onCreateReport,
  onUpdateReport,
  onFinalizeReport,
  onSendReport,
  onReportCriticalFinding,
}: RadiologyReportsProps) {
  const fmt = useDateFormat();
  const t = useT(RADIOLOGY_KM);
  const tAny = useTranslateAny(RADIOLOGY_KM);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [criticalDialogOpen, setCriticalDialogOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<RadiologyReport | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [radiologistFilter, setRadiologistFilter] = useState("all");

  const reportForm = useForm<RadiologyReportFormData>({
    resolver: zodResolver(radiologyReportSchema),
    defaultValues: {
      reportType: "preliminary",
      clinicalHistory: "",
      technique: "",
      findings: "",
      impression: "",
    },
  });

  const criticalForm = useForm<CriticalFindingFormData>({
    resolver: zodResolver(criticalFindingSchema),
    defaultValues: {
      severity: "high",
      notificationMethod: "phone",
      notifiedPersonnel: [],
    },
  });

  const handleSubmitReport = async (data: RadiologyReportFormData) => {
    try {
      if (editingReport) {
        await onUpdateReport(editingReport.id, data as any);
      } else {
        await onCreateReport(data);
      }
      setReportDialogOpen(false);
      setEditingReport(null);
      reportForm.reset();
    } catch (error) {
      console.error("Error saving report:", error);
    }
  };

  const handleSubmitCriticalFinding = async (data: CriticalFindingFormData) => {
    try {
      await onReportCriticalFinding(data);
      setCriticalDialogOpen(false);
      criticalForm.reset();
    } catch (error) {
      console.error("Error reporting critical finding:", error);
    }
  };

  const openReportDialog = (report?: RadiologyReport) => {
    if (report) {
      setEditingReport(report);
      reportForm.reset({
        studyId: report.studyId,
        reportType: report.reportType,
        clinicalHistory: report.clinicalHistory,
        technique: report.technique,
        findings: report.findings,
        impression: report.impression,
        recommendations: report.recommendations,
      });
    } else {
      setEditingReport(null);
      reportForm.reset();
    }
    setReportDialogOpen(true);
  };

  const loadTemplate = (templateKey: string) => {
    const template = REPORT_TEMPLATES[templateKey as keyof typeof REPORT_TEMPLATES];
    if (template) {
      reportForm.setValue("impression", template.impression);
      reportForm.setValue("findings", template.findings);
    }
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = 
      report.studyInstanceUID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.reportNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || report.priority === priorityFilter;
    const matchesRadiologist = radiologistFilter === "all" || report.radiologistId === radiologistFilter;
    return matchesSearch && matchesStatus && matchesPriority && matchesRadiologist;
  });

  const getStatusColor = (status: string) => REPORT_STATUS_CONFIG[status as keyof typeof REPORT_STATUS_CONFIG]?.color || "bg-gray-100 text-gray-800";
  const getStatusIcon = (status: string) => REPORT_STATUS_CONFIG[status as keyof typeof REPORT_STATUS_CONFIG]?.icon || FileText;

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "stat":
      case "critical": return "bg-red-100 text-red-800";
      case "urgent": return "bg-orange-100 text-orange-800";
      case "routine": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t("Radiology Reports")}</h1>
        <p className="text-muted-foreground">{t("Create, manage, and distribute radiology reports")}</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("Search reports, patients, or study IDs...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("Status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Status")}</SelectItem>
            <SelectItem value="draft">{t("Draft")}</SelectItem>
            <SelectItem value="preliminary">{t("Preliminary")}</SelectItem>
            <SelectItem value="final">{t("Final")}</SelectItem>
            <SelectItem value="amended">{t("Amended")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("Priority")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Priority")}</SelectItem>
            <SelectItem value="routine">{t("Routine")}</SelectItem>
            <SelectItem value="urgent">{t("Urgent")}</SelectItem>
            <SelectItem value="stat">{t("STAT")}</SelectItem>
            <SelectItem value="critical">{t("Critical")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={radiologistFilter} onValueChange={setRadiologistFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("Radiologist")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Radiologists")}</SelectItem>
            {radiologists.map((radiologist) => (
              <SelectItem key={radiologist.id} value={radiologist.id}>
                {radiologist.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openReportDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              {t("New Report")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingReport ? t("Edit Radiology Report") : t("Create New Radiology Report")}
              </DialogTitle>
              <DialogDescription>
                {t("Create or edit a radiology report")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={reportForm.handleSubmit(handleSubmitReport)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("Study *")}</Label>
                  <Select onValueChange={(value) => reportForm.setValue("studyId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select study")} />
                    </SelectTrigger>
                    <SelectContent>
                      {studies.map((study) => (
                        <SelectItem key={study.id} value={study.id}>
                          {study.patientName} - {study.studyDescription} ({fmt(study.studyDate, "PP")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{t("Report Type")}</Label>
                  <Select onValueChange={(value) => reportForm.setValue("reportType", value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diagnostic">{t("Diagnostic")}</SelectItem>
                      <SelectItem value="screening">{t("Screening")}</SelectItem>
                      <SelectItem value="intervention">{t("Intervention")}</SelectItem>
                      <SelectItem value="consultation">{t("Consultation")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("Template")}</Label>
                <Select onValueChange={loadTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select template")} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(REPORT_TEMPLATES).map(([key, template]) => (
                      <SelectItem key={key} value={key}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicalHistory">{t("Clinical History *")}</Label>
                <Textarea
                  id="clinicalHistory"
                  {...reportForm.register("clinicalHistory")}
                  placeholder={t("Relevant clinical history and indication for study...")}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="technique">{t("Technique")}</Label>
                <Textarea
                  id="technique"
                  {...reportForm.register("technique")}
                  placeholder={t("Imaging technique and parameters used...")}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="findings">{t("Findings *")}</Label>
                <Textarea
                  id="findings"
                  {...reportForm.register("findings")}
                  placeholder={t("Describe imaging findings...")}
                  rows={4}
                />
                {reportForm.formState.errors.findings && (
                  <p className="text-sm text-red-500">{tAny(reportForm.formState.errors.findings.message)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="impression">{t("Impression *")}</Label>
                <Textarea
                  id="impression"
                  {...reportForm.register("impression")}
                  placeholder={t("Summary and diagnostic impression...")}
                  rows={3}
                />
                {reportForm.formState.errors.impression && (
                  <p className="text-sm text-red-500">{tAny(reportForm.formState.errors.impression.message)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="recommendations">{t("Recommendations")}</Label>
                <Textarea
                  id="recommendations"
                  {...reportForm.register("recommendations")}
                  placeholder={t("Clinical recommendations...")}
                  rows={2}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setReportDialogOpen(false)}
                >
                  {t("Cancel")}
                </Button>
                <Button type="submit">
                  {t(editingReport ? "Update Report" : "Create Report")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={criticalDialogOpen} onOpenChange={setCriticalDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="destructive">
              <AlertTriangle className="mr-2 h-4 w-4" />
              {t("Critical Finding")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("Report Critical Finding")}</DialogTitle>
              <DialogDescription>
                {t("Report a critical or urgent finding that requires immediate attention")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={criticalForm.handleSubmit(handleSubmitCriticalFinding)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="finding">{t("Critical Finding *")}</Label>
                <Textarea
                  id="finding"
                  {...criticalForm.register("finding")}
                  placeholder={t("Describe the critical finding...")}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("Severity *")}</Label>
                <RadioGroup onValueChange={(value: string) => criticalForm.setValue("severity", value as "high" | "medium" | "low")}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="high" id="high" />
                    <Label htmlFor="high">{t("High - Immediate action required")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="medium" />
                    <Label htmlFor="medium">{t("Medium - Urgent follow-up needed")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="low" id="low" />
                    <Label htmlFor="low">{t("Low - Routine follow-up")}</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notificationMethod">{t("Notification Method *")}</Label>
                <Select onValueChange={(value) => criticalForm.setValue("notificationMethod", value as "phone" | "email" | "page" | "in_person")}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select notification method")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">{t("Phone")}</SelectItem>
                    <SelectItem value="email">{t("Email")}</SelectItem>
                    <SelectItem value="page">{t("Page")}</SelectItem>
                    <SelectItem value="in_person">{t("In Person")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notificationTime">{t("Notification Time *")}</Label>
                <Input
                  id="notificationTime"
                  type="datetime-local"
                  {...criticalForm.register("notificationTime")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notifiedPersonnel">{t("Notified Personnel (comma-separated) *")}</Label>
                <Input
                  id="notifiedPersonnel"
                  placeholder={t("Names separated by commas...")}
                  onChange={(e) => {
                    const personnel = e.target.value.split(",").map(p => p.trim()).filter(Boolean);
                    criticalForm.setValue("notifiedPersonnel", personnel);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reportId">{t("Report ID *")}</Label>
                <Input
                  id="reportId"
                  {...criticalForm.register("reportId")}
                  placeholder={t("Report identifier...")}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCriticalDialogOpen(false)}>
                  {t("Cancel")}
                </Button>
                <Button type="submit" variant="destructive">
                  {t("Report Critical Finding")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {filteredReports.map((report) => {
          const StatusIcon = getStatusIcon(report.status);
          
          return (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {t("Report #")}{report.reportNumber}
                        <Badge className={getStatusColor(report.status)}>
                          {tAny(report.status)}
                        </Badge>
                        <Badge className={getPriorityColor(report.priority)}>
                          {report.priority.toUpperCase()}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {t("Patient: {patientName} • Study: {studyInstanceUID} • Date: {toLocaleDateString}", { patientName: report.patientName, studyInstanceUID: report.studyInstanceUID, toLocaleDateString: fmt(report.reportDate, "PP") })}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => onFinalizeReport(report.id, "")}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {report.status === "draft" ? t("Finalize") : t("View")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => openReportDialog(report)}>
                      <Edit className="mr-2 h-4 w-4" />
                      {t("Edit")}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      {t("Download")}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onSendReport(report.id, [])}>
                      <Send className="mr-2 h-4 w-4" />
                      {t("Send")}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="content" className="w-full">
                  <TabsList>
                    <TabsTrigger value="content">{t("Report Content")}</TabsTrigger>
                    <TabsTrigger value="details">{t("Report Details")}</TabsTrigger>
                    <TabsTrigger value="history">{t("History")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="content" className="space-y-4">
                    {report.clinicalHistory && (
                      <div>
                        <h4 className="font-medium text-foreground">{t("Clinical History")}</h4>
                        <p className="text-muted-foreground text-sm mt-1">{report.clinicalHistory}</p>
                      </div>
                    )}
                    
                    {report.technique && (
                      <div>
                        <h4 className="font-medium text-foreground">{t("Technique")}</h4>
                        <p className="text-muted-foreground text-sm mt-1">{report.technique}</p>
                      </div>
                    )}

                    {report.findings && (
                      <div>
                        <h4 className="font-medium text-foreground">{t("Findings")}</h4>
                        <div className="text-muted-foreground text-sm mt-1 whitespace-pre-wrap">
                          {report.findings}
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="font-medium text-foreground">{t("Impression")}</h4>
                      <p className="text-muted-foreground text-sm mt-1">{report.impression}</p>
                    </div>

                    {report.recommendations && (
                      <div>
                        <h4 className="font-medium text-foreground">{t("Recommendations")}</h4>
                        <p className="text-muted-foreground text-sm mt-1 whitespace-pre-wrap">
                          {report.recommendations}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-foreground">{t("Report Type")}</p>
                        <p className="text-muted-foreground">{tAny(report.reportType)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t("Radiologist")}</p>
                        <p className="text-muted-foreground">{report.radiologist.name}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t("Created")}</p>
                        <p className="text-muted-foreground">{fmt(report.createdAt, "PP p")}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t("Last Modified")}</p>
                        <p className="text-muted-foreground">{fmt(report.updatedAt, "PP p")}</p>
                      </div>
                    </div>
                    
                    {report.signedAt && (
                      <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="font-medium text-green-900">{t("Electronically Signed")}</p>
                        <p className="text-green-800 text-sm">
                          {t("Signed by {name} on {amount}", { name: report.radiologist.name, amount: fmt(report.signedAt, "PP p") })}
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="history" className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t("Report created")}</p>
                          <p className="text-xs text-muted-foreground">{fmt(report.createdAt, "PP p")}</p>
                        </div>
                      </div>
                      
                      {report.signedAt && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{t("Report finalized and signed")}</p>
                            <p className="text-xs text-muted-foreground">{fmt(report.signedAt, "PP p")}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}

        {filteredReports.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t("No radiology reports found")}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("Create a new report to get started")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}