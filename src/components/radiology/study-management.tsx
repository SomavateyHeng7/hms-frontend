"use client";

import React, { useState } from "react";
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
import { ImagingStudy, StudyQualityControlFormData } from "@/types/radiology";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { studyQualityControlSchema } from "@/lib/validations/radiology";

interface StudyManagementProps {
  studies: ImagingStudy[];
  onViewStudy: (studyId: string) => void;
  onQualityControl: (studyId: string, data: StudyQualityControlFormData) => Promise<void>;
  onUploadImages: (studyId: string, files: FileList) => Promise<void>;
  onDownloadStudy: (studyId: string) => Promise<void>;
  onShareStudy: (studyId: string, recipients: string[]) => Promise<void>;
  onArchiveStudy: (studyId: string) => Promise<void>;
}

const STUDY_STATUS_CONFIG = {
  pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  in_progress: { color: "bg-blue-100 text-blue-800", icon: Monitor },
  completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  cancelled: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
  archived: { color: "bg-gray-100 text-gray-800", icon: FileText },
};

const QC_STATUS_CONFIG = {
  pending: { color: "bg-yellow-100 text-yellow-800", label: "Pending QC" },
  passed: { color: "bg-green-100 text-green-800", label: "QC Passed" },
  failed: { color: "bg-red-100 text-red-800", label: "QC Failed" },
  review_required: { color: "bg-orange-100 text-orange-800", label: "Review Required" },
};

export function StudyManagement({
  studies,
  onViewStudy,
  onQualityControl,
  onUploadImages,
  onDownloadStudy,
  onShareStudy,
  onArchiveStudy,
}: StudyManagementProps) {
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
    defaultValues: {
      overallQuality: "acceptable",
      technicalAdequacy: "adequate",
      artifactsPresent: false,
    },
  });

  const handleQualityControl = async (data: StudyQualityControlFormData) => {
    if (!selectedStudy) return;
    
    try {
      await onQualityControl(selectedStudy.id, data);
      setQcDialogOpen(false);
      setSelectedStudy(null);
      qcForm.reset();
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
    qcForm.reset({
      overallQuality: study.qualityControl?.overallQuality || "acceptable",
      technicalAdequacy: study.qualityControl?.technicalAdequacy || "adequate",
      artifactsPresent: study.qualityControl?.artifactsPresent || false,
      comments: study.qualityControl?.comments || "",
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
        <h1 className="text-3xl font-bold text-gray-900">Study Management</h1>
        <p className="text-gray-600">Manage DICOM studies, quality control, and PACS integration</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Search studies, patients, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={modalityFilter} onValueChange={setModalityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Modality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modalities</SelectItem>
            <SelectItem value="XR">X-Ray</SelectItem>
            <SelectItem value="CT">CT</SelectItem>
            <SelectItem value="MR">MRI</SelectItem>
            <SelectItem value="US">Ultrasound</SelectItem>
            <SelectItem value="MG">Mammography</SelectItem>
            <SelectItem value="NM">Nuclear Medicine</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filteredStudies.map((study) => {
          const StatusIcon = STUDY_STATUS_CONFIG[study.status]?.icon || Clock;
          const qcStatus = study.qualityControl?.status || "pending";
          
          return (
            <Card key={study.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <StatusIcon className="h-5 w-5 text-gray-500" />
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {study.studyDescription}
                        <Badge className={STUDY_STATUS_CONFIG[study.status]?.color}>
                          {study.status.replace('_', ' ')}
                        </Badge>
                        <Badge className={QC_STATUS_CONFIG[qcStatus]?.color}>
                          {QC_STATUS_CONFIG[qcStatus]?.label}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Patient: {study.patientName} • Study UID: {study.studyInstanceUID} • 
                        Date: {new Date(study.studyDate).toLocaleDateString()}
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
                      View
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openQcDialog(study)}
                    >
                      QC Review
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openShareDialog(study)}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownloadStudy(study.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList>
                    <TabsTrigger value="details">Study Details</TabsTrigger>
                    <TabsTrigger value="series">Series ({study.series.length})</TabsTrigger>
                    <TabsTrigger value="pacs">PACS Info</TabsTrigger>
                    <TabsTrigger value="upload">Upload Images</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">Modality</p>
                        <p className="text-gray-600">{study.modality}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Institution</p>
                        <p className="text-gray-600">{study.institutionName}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Equipment</p>
                        <p className="text-gray-600">{study.equipment?.name}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Referring Physician</p>
                        <p className="text-gray-600">{study.referringPhysician}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Study Description</p>
                      <p className="text-gray-600">{study.studyDescription}</p>
                    </div>
                    {study.qualityControl && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium mb-2">Quality Control Results</h4>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p><strong>Overall Quality:</strong> {study.qualityControl.overallQuality}</p>
                            <p><strong>Technical Adequacy:</strong> {study.qualityControl.technicalAdequacy}</p>
                          </div>
                          <div>
                            <p><strong>Artifacts Present:</strong> {study.qualityControl.artifactsPresent ? "Yes" : "No"}</p>
                            <p><strong>Reviewed By:</strong> {study.qualityControl.reviewedBy}</p>
                          </div>
                        </div>
                        {study.qualityControl.comments && (
                          <p className="mt-2"><strong>Comments:</strong> {study.qualityControl.comments}</p>
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
                            <p className="text-sm text-gray-600">
                              Series {series.seriesNumber} • {series.instanceCount} images
                            </p>
                            <p className="text-sm text-gray-600">
                              UID: {series.seriesInstanceUID}
                            </p>
                          </div>
                          <div className="text-right text-sm">
                            <p className="font-medium">{formatFileSize(series.imageSize * series.instanceCount)}</p>
                            <p className="text-gray-600">{series.bodyPartExamined}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="pacs" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-gray-900">PACS Server</p>
                        <p className="text-gray-600">{study.pacsInfo.server}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">AE Title</p>
                        <p className="text-gray-600">{study.pacsInfo.aeTitle}</p>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Storage Status</p>
                        <Badge className={
                          study.pacsInfo.stored ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                        }>
                          {study.pacsInfo.stored ? "Stored" : "Pending"}
                        </Badge>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Archive Status</p>
                        <Badge className={
                          study.pacsInfo.archived ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"
                        }>
                          {study.pacsInfo.archived ? "Archived" : "Not Archived"}
                        </Badge>
                      </div>
                    </div>
                    {study.pacsInfo.retrieveAeTitle && (
                      <div>
                        <p className="font-medium text-gray-900">Retrieve AE Title</p>
                        <p className="text-gray-600">{study.pacsInfo.retrieveAeTitle}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-4">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="mx-auto h-12 w-12 text-gray-400" />
                        <div className="mt-4">
                          <Label htmlFor={`file-upload-${study.id}`} className="cursor-pointer">
                            <span className="text-sm font-medium text-blue-600 hover:text-blue-500">
                              Upload DICOM files
                            </span>
                            <span className="text-sm text-gray-500"> or drag and drop</span>
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
                        <p className="text-xs text-gray-500 mt-2">
                          DICOM files only. Maximum 100MB per file.
                        </p>
                      </div>
                    </div>
                    {uploadProgress[study.id] !== undefined && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Uploading...</span>
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
            <DialogTitle>Quality Control Review</DialogTitle>
            <DialogDescription>
              Review and assess the quality of the imaging study
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={qcForm.handleSubmit(handleQualityControl)} className="space-y-4">
            <div className="space-y-2">
              <Label>Overall Quality</Label>
              <Select onValueChange={(value) => qcForm.setValue("overallQuality", value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excellent">Excellent</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="acceptable">Acceptable</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="unacceptable">Unacceptable</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Technical Adequacy</Label>
              <Select onValueChange={(value) => qcForm.setValue("technicalAdequacy", value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adequate">Adequate</SelectItem>
                  <SelectItem value="suboptimal">Suboptimal</SelectItem>
                  <SelectItem value="inadequate">Inadequate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                {...qcForm.register("comments")}
                placeholder="Quality control notes and observations..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setQcDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Submit Review</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Share Study Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Share Study</DialogTitle>
            <DialogDescription>
              Share this study with other healthcare providers
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Recipients (Email addresses)</Label>
              <Textarea
                placeholder="Enter email addresses, separated by commas"
                value={shareRecipients.join(", ")}
                onChange={(e) => setShareRecipients(e.target.value.split(",").map(email => email.trim()))}
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShareDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleShare}>Share Study</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}