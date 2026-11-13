"use client";

import { useState } from "react";
import { Eye, Download, Upload, Share2, AlertTriangle, CheckCircle, Clock, FileText, Monitor } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import type { ImagingStudy, QCStatus, StudyStatus } from "@/features/diagnostics/radiology/types";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studyQualityControlSchema, type StudyQualityControlFormData } from "@/features/diagnostics/radiology/validations";
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { RADIOLOGY_KM } from "@/features/diagnostics/radiology/km";

interface StudyManagementProps {
  studies: ImagingStudy[];
  onViewStudy: (studyId: string) => void;
  onQualityControl: (studyId: string, data: StudyQualityControlFormData) => Promise<void>;
  onUploadImages: (studyId: string, files: FileList) => Promise<void>;
  onDownloadStudy: (studyId: string) => Promise<void>;
  onShareStudy: (studyId: string, recipients: string[]) => Promise<void>;
  onArchiveStudy: (studyId: string) => Promise<void>;
}

const STUDY_STATUS_CONFIG: Record<StudyStatus, { color: string; icon: typeof Clock }> = {
  pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  in_progress: { color: "bg-blue-100 text-blue-800", icon: Monitor },
  completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
  archived: { color: "bg-gray-100 text-gray-800", icon: FileText },
};

const QC_STATUS_CONFIG: Record<QCStatus, { color: string; label: string }> = {
  pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending QC" },
  passed: { color: "bg-green-100 text-green-800", label: "QC Passed" },
  failed: { color: "bg-red-100 text-red-800", label: "QC Failed" },
  needs_repeat: { color: "bg-orange-100 text-orange-800", label: "Needs Repeat" },
};

const emptyQc = (): StudyQualityControlFormData => ({
  status: "passed",
  overallQuality: "acceptable",
  technicalAdequacy: "adequate",
  artifactsPresent: false,
  reviewer: "",
  comments: "",
});

export function StudyManagement({
  studies,
  onViewStudy,
  onQualityControl,
  onUploadImages,
  onDownloadStudy,
  onShareStudy,
  onArchiveStudy,
}: StudyManagementProps) {
  const fmt = useDateFormat();
  const t = useT(RADIOLOGY_KM);
  const tAny = useTranslateAny(RADIOLOGY_KM);
  const [qcDialogOpen, setQcDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedStudy, setSelectedStudy] = useState<ImagingStudy | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [shareRecipients, setShareRecipients] = useState<string[]>([]);

  const qcForm = useForm<StudyQualityControlFormData>({
    resolver: zodResolver(studyQualityControlSchema),
    defaultValues: emptyQc(),
  });

  const handleQualityControl = async (data: StudyQualityControlFormData) => {
    if (!selectedStudy) return;
    
    try {
      await onQualityControl(selectedStudy.id, data);
      setQcDialogOpen(false);
      setSelectedStudy(null);
      qcForm.reset(emptyQc());
    } catch (error) {
      console.error("Error submitting quality control:", error);
    }
  };

  const handleFileUpload = async (studyId: string, files: FileList) => {
    try {
      setUploadProgress({ ...uploadProgress, [studyId]: 0 });
      
      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress(prev => {
          const currentProgress = prev[studyId] || 0;
          const newProgress = Math.min(currentProgress + 10, 100);
          
          if (newProgress === 100) {
            clearInterval(interval);
            setTimeout(() => {
              setUploadProgress(prev => {
                const { [studyId]: _, ...rest } = prev;
                return rest;
              });
            }, 1000);
          }
          
          return { ...prev, [studyId]: newProgress };
        });
      }, 200);

      await onUploadImages(studyId, files);
    } catch (error) {
      console.error("Error uploading images:", error);
      setUploadProgress(prev => {
        const { [studyId]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleShare = async () => {
    if (!selectedStudy || shareRecipients.length === 0) return;

    try {
      await onShareStudy(selectedStudy.id, shareRecipients);
      setShareDialogOpen(false);
      setSelectedStudy(null);
      setShareRecipients([]);
    } catch (error) {
      console.error("Error sharing study:", error);
    }
  };

  const openQcDialog = (study: ImagingStudy) => {
    setSelectedStudy(study);
    const qc = study.qualityControl;
    qcForm.reset({
      status: qc && qc.status !== "pending" ? qc.status : "passed",
      overallQuality: qc?.overallQuality ?? "acceptable",
      technicalAdequacy: qc?.technicalAdequacy ?? "adequate",
      artifactsPresent: qc?.artifactsPresent ?? false,
      reviewer: qc?.reviewedBy ?? "",
      comments: qc?.comments ?? "",
    });
    setQcDialogOpen(true);
  };

  const openShareDialog = (study: ImagingStudy) => {
    setSelectedStudy(study);
    setShareDialogOpen(true);
  };

  const filteredStudies = studies.filter((study) => {
    const matchesSearch = 
      study.studyInstanceUID.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      study.studyDescription.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || study.status === statusFilter;
    const matchesModality = modalityFilter === "all" || study.modality === modalityFilter;
    return matchesSearch && matchesStatus && matchesModality;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t("Study Management")}</h1>
        <p className="text-muted-foreground">{t("Manage imaging studies and quality control")}</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder={t("Search studies, patients, or descriptions...")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("Status")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Status")}</SelectItem>
            <SelectItem value="pending">{t("Pending")}</SelectItem>
            <SelectItem value="in_progress">{t("In Progress")}</SelectItem>
            <SelectItem value="completed">{t("Completed")}</SelectItem>
            <SelectItem value="cancelled">{t("Cancelled")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={modalityFilter} onValueChange={setModalityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("Modality")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Modalities")}</SelectItem>
            <SelectItem value="XR">{t("X-Ray")}</SelectItem>
            <SelectItem value="CT">{t("CT")}</SelectItem>
            <SelectItem value="MR">{t("MRI")}</SelectItem>
            <SelectItem value="US">{t("Ultrasound")}</SelectItem>
            <SelectItem value="MG">{t("Mammography")}</SelectItem>
            <SelectItem value="NM">{t("Nuclear Medicine")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filteredStudies.map((study) => {
          const StatusIcon = STUDY_STATUS_CONFIG[study.status].icon;
          const qcStatus = study.qualityControl?.status || "pending";
          
          return (
            <Card key={study.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {study.studyDescription}
                        <Badge className={STUDY_STATUS_CONFIG[study.status].color}>
                          {tAny(study.status)}
                        </Badge>
                        <Badge className={QC_STATUS_CONFIG[qcStatus].color}>
                          {QC_STATUS_CONFIG[qcStatus].label}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {t("Patient: {patientName} • Study UID: {studyInstanceUID} • Date: {toLocaleDateString}", { patientName: study.patientName, studyInstanceUID: study.studyInstanceUID, toLocaleDateString: fmt(study.studyDate, "PP") })}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewStudy(study.id)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {t("View")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openQcDialog(study)}
                    >
                      {t("QC Review")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openShareDialog(study)}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      {t("Share")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownloadStudy(study.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {t("Download")}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList>
                    <TabsTrigger value="details">{t("Study Details")}</TabsTrigger>
                    <TabsTrigger value="series">{t("Series ({length})", { length: study.series.length })}</TabsTrigger>
                    <TabsTrigger value="upload">{t("Upload Images")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-foreground">{t("Modality")}</p>
                        <p className="text-muted-foreground">{tAny(study.modality)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t("Institution")}</p>
                        <p className="text-muted-foreground">{study.institutionName}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t("Equipment")}</p>
                        <p className="text-muted-foreground">{study.equipment?.name}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t("Referring Physician")}</p>
                        <p className="text-muted-foreground">{study.referringPhysician}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t("Study Description")}</p>
                      <p className="text-muted-foreground">{study.studyDescription}</p>
                    </div>
                    {study.qualityControl && (
                      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                        <h4 className="font-medium mb-2">{t("Quality Control Results")}</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><strong>{t("Overall Quality:")}</strong> {study.qualityControl.overallQuality}</p>
                            <p><strong>{t("Technical Adequacy:")}</strong> {study.qualityControl.technicalAdequacy}</p>
                          </div>
                          <div>
                            <p><strong>{t("Artifacts Present:")}</strong> {study.qualityControl.artifactsPresent ? t("Yes") : t("No")}</p>
                            <p><strong>{t("Reviewed By:")}</strong> {study.qualityControl.reviewedBy ?? "—"}</p>
                          </div>
                        </div>
                        {study.qualityControl.comments && (
                          <p className="mt-2"><strong>{t("Comments:")}</strong> {study.qualityControl.comments}</p>
                        )}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="series" className="space-y-4">
                    {study.series.map((series, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{series.seriesDescription}</h4>
                            <p className="text-sm text-muted-foreground">
                              {t("Series {seriesNumber} • {instanceCount} images", { seriesNumber: series.seriesNumber, instanceCount: series.instanceCount })}</p>
                            <p className="text-sm text-muted-foreground">
                              {t("UID: {seriesInstanceUID}", { seriesInstanceUID: series.seriesInstanceUID })}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-medium">{formatFileSize(series.imageSize * series.instanceCount)}</p>
                            <p className="text-muted-foreground">{series.bodyPartExamined}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-4">
                    <div className="border-2 border-dashed border-border rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-muted-foreground" />
                        <div className="mt-4">
                          <Label htmlFor={`file-upload-${study.id}`} className="cursor-pointer">
                            <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                              {t("Upload DICOM files")}
                            </span>
                            <span className="text-sm text-muted-foreground"> {t("or drag and drop")}</span>
                          </Label>
                          <Input
                            id={`file-upload-${study.id}`}
                            type="file"
                            multiple
                            accept=".dcm,.dicom"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files) {
                                handleFileUpload(study.id, e.target.files);
                              }
                            }}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          {t("DICOM files only. Maximum 100MB per file.")}
                        </p>
                      </div>
                    </div>
                    {uploadProgress[study.id] !== undefined && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>{t("Uploading...")}</span>
                          <span>{uploadProgress[study.id]}%</span>
                        </div>
                        <Progress value={uploadProgress[study.id]} />
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quality Control Dialog */}
      <Dialog open={qcDialogOpen} onOpenChange={setQcDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("Quality Control Review")}</DialogTitle>
            <DialogDescription>
              {t("Review and assess the quality of the imaging study")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={qcForm.handleSubmit(handleQualityControl)} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("QC Result *")}</Label>
              <Controller
                control={qcForm.control}
                name="status"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="passed">{t("Passed")}</SelectItem>
                      <SelectItem value="needs_repeat">{t("Needs Repeat")}</SelectItem>
                      <SelectItem value="failed">{t("Failed")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t("Overall Quality")}</Label>
                <Controller
                  control={qcForm.control}
                  name="overallQuality"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="excellent">{t("Excellent")}</SelectItem>
                        <SelectItem value="good">{t("Good")}</SelectItem>
                        <SelectItem value="acceptable">{t("Acceptable")}</SelectItem>
                        <SelectItem value="poor">{t("Poor")}</SelectItem>
                        <SelectItem value="unacceptable">{t("Unacceptable")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>{t("Technical Adequacy")}</Label>
                <Controller
                  control={qcForm.control}
                  name="technicalAdequacy"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="adequate">{t("Adequate")}</SelectItem>
                        <SelectItem value="suboptimal">{t("Suboptimal")}</SelectItem>
                        <SelectItem value="inadequate">{t("Inadequate")}</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <Controller
              control={qcForm.control}
              name="artifactsPresent"
              render={({ field }) => (
                <div className="flex items-center gap-2">
                  <Checkbox id="artifactsPresent" checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} />
                  <Label htmlFor="artifactsPresent" className="font-normal">
                    {t("Artifacts present")}
                  </Label>
                </div>
              )}
            />

            <div className="space-y-2">
              <Label htmlFor="reviewer">{t("Reviewer *")}</Label>
              <Input id="reviewer" {...qcForm.register("reviewer")} placeholder={t("Your name")} />
              {qcForm.formState.errors.reviewer && (
                <p className="text-sm text-red-500">{tAny(qcForm.formState.errors.reviewer.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">{t("Comments")}</Label>
              <Textarea
                id="comments"
                {...qcForm.register("comments")}
                placeholder={t("Quality control notes and observations...")}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setQcDialogOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button type="submit">{t("Submit Review")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Share Study Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("Share Study")}</DialogTitle>
            <DialogDescription>
              {t("Share this study with other healthcare providers")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("Recipients (Email addresses)")}</Label>
              <Textarea
                placeholder={t("Enter email addresses, separated by commas")}
                value={shareRecipients.join(", ")}
                onChange={(e) => setShareRecipients(e.target.value.split(",").map(email => email.trim()))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button onClick={handleShare}>{t("Share Study")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}