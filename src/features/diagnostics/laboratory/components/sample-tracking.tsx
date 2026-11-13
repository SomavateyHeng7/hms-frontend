"use client";

import React, { useState, useRef } from "react";
import { Package, Search, QrCode, MapPin, Thermometer, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LabSample } from "@/features/diagnostics/laboratory/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sampleCollectionSchema, type SampleCollectionFormData } from "@/features/diagnostics/laboratory/validations";
import QRCode from "react-qr-code";
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { LAB_KM } from "@/features/diagnostics/laboratory/km";

interface SampleTrackingProps {
  samples: LabSample[];
  onCollectSample: (data: SampleCollectionFormData) => Promise<void>;
  onReceiveSample: (sampleId: string) => Promise<void>;
  onRejectSample: (sampleId: string, reason: string) => Promise<void>;
  onUpdateLocation: (sampleId: string, location: string) => Promise<void>;
  onGenerateBarcode: (sampleId: string) => string;
}

const SAMPLE_STATUS_CONFIG = {
  collected: { color: "bg-blue-100 text-blue-800", icon: Package },
  received: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  processing: { color: "bg-purple-100 text-purple-800", icon: Package },
  completed: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
};

const SAMPLE_TYPES = [
  { value: "blood", label: "Blood", icon: "🩸" },
  { value: "serum", label: "Serum", icon: "🧪" },
  { value: "plasma", label: "Plasma", icon: "🧪" },
  { value: "urine", label: "Urine", icon: "💧" },
  { value: "stool", label: "Stool", icon: "🟤" },
  { value: "csf", label: "CSF", icon: "🧠" },
  { value: "tissue", label: "Tissue", icon: "🔬" },
  { value: "swab", label: "Swab", icon: "🦠" },
  { value: "sputum", label: "Sputum", icon: "🫁" },
  { value: "saliva", label: "Saliva", icon: "💧" },
];

const REJECTION_REASONS = [
  "Hemolyzed sample",
  "Insufficient volume",
  "Contaminated sample",
  "Improper collection",
  "Expired sample",
  "Unlabeled sample",
  "Temperature abuse",
  "Clotted sample",
  "Other",
];

const STORAGE_LOCATIONS = [
  "Room Temperature Rack A",
  "Room Temperature Rack B",
  "Refrigerator 1 - Shelf A",
  "Refrigerator 1 - Shelf B",
  "Refrigerator 2 - Shelf A",
  "Refrigerator 2 - Shelf B",
  "Freezer -20°C - Section 1",
  "Freezer -20°C - Section 2",
  "Freezer -80°C - Section 1",
  "Freezer -80°C - Section 2",
];

export function SampleTracking({
  samples,
  onCollectSample,
  onReceiveSample,
  onRejectSample,
  onUpdateLocation,
  onGenerateBarcode,
}: SampleTrackingProps) {
  const fmt = useDateFormat();
  const t = useT(LAB_KM);
  const tAny = useTranslateAny(LAB_KM);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<LabSample | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rejectionReason, setRejectionReason] = useState("");
  const barcodeRef = useRef<HTMLDivElement>(null);

  const form = useForm<SampleCollectionFormData>({
    resolver: zodResolver(sampleCollectionSchema),
    defaultValues: {
      unit: "mL",
      collectionDate: new Date().toISOString().slice(0, 16),
    },
  });

  const handleCollectSample = async (data: SampleCollectionFormData) => {
    try {
      await onCollectSample(data);
      setCollectionDialogOpen(false);
      form.reset();
    } catch (error) {
      console.error("Error collecting sample:", error);
    }
  };

  const handleRejectSample = async () => {
    if (!selectedSample || !rejectionReason) return;
    
    try {
      await onRejectSample(selectedSample.id, rejectionReason);
      setRejectDialogOpen(false);
      setSelectedSample(null);
      setRejectionReason("");
    } catch (error) {
      console.error("Error rejecting sample:", error);
    }
  };

  const openBarcodeDialog = (sample: LabSample) => {
    setSelectedSample(sample);
    setBarcodeDialogOpen(true);
  };

  const openRejectDialog = (sample: LabSample) => {
    setSelectedSample(sample);
    setRejectDialogOpen(true);
  };

  const printBarcode = () => {
    if (barcodeRef.current) {
      const printContent = barcodeRef.current.innerHTML;
      const printWindow = window.open("", "_blank");
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Sample Barcode</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .barcode-container { text-align: center; }
              </style>
            </head>
            <body>
              <div class="barcode-container">${printContent}</div>
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  const filteredSamples = samples.filter((sample) => {
    const matchesSearch = 
      sample.sampleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.barcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sample.patientMRN.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || sample.status === statusFilter;
    const matchesType = typeFilter === "all" || sample.sampleType === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => SAMPLE_STATUS_CONFIG[status as keyof typeof SAMPLE_STATUS_CONFIG]?.color || "bg-gray-100 text-gray-800";
  const getStatusIcon = (status: string) => SAMPLE_STATUS_CONFIG[status as keyof typeof SAMPLE_STATUS_CONFIG]?.icon || Package;

  const getSampleTypeIcon = (type: string) => {
    const sampleType = SAMPLE_TYPES.find(t => t.value === type);
    return sampleType?.icon || "🧪";
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t("Sample Tracking")}</h1>
        <p className="text-muted-foreground">{t("Track laboratory samples with barcode management")}</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("Search by sample ID, barcode, patient name, or MRN...")}
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
            <SelectItem value="collected">{t("Collected")}</SelectItem>
            <SelectItem value="received">{t("Received")}</SelectItem>
            <SelectItem value="processing">{t("Processing")}</SelectItem>
            <SelectItem value="completed">{t("Completed")}</SelectItem>
            <SelectItem value="rejected">{t("Rejected")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder={t("Sample Type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Types")}</SelectItem>
            {SAMPLE_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.icon} {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={collectionDialogOpen} onOpenChange={setCollectionDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Package className="mr-2 h-4 w-4" />
              {t("Collect Sample")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{t("Collect New Sample")}</DialogTitle>
              <DialogDescription>
                {t("Enter sample collection details")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleCollectSample)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">{t("Order ID *")}</Label>
                <Input
                  id="orderId"
                  {...form.register("orderId")}
                  placeholder={t("Enter lab order ID")}
                />
                {form.formState.errors.orderId && (
                  <p className="text-sm text-red-500">{tAny(form.formState.errors.orderId.message)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("Sample Type *")}</Label>
                <Select onValueChange={(value) => form.setValue("sampleType", value as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("Select sample type")} />
                  </SelectTrigger>
                  <SelectContent>
                    {SAMPLE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.icon} {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.sampleType && (
                  <p className="text-sm text-red-500">{tAny(form.formState.errors.sampleType.message)}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="volume">{t("Volume *")}</Label>
                  <Input
                    id="volume"
                    type="number"
                    step="0.1"
                    {...form.register("volume", { valueAsNumber: true })}
                    placeholder="e.g., 5.0"
                  />
                  {form.formState.errors.volume && (
                    <p className="text-sm text-red-500">{tAny(form.formState.errors.volume.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="unit">{t("Unit *")}</Label>
                  <Select onValueChange={(value) => form.setValue("unit", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mL">{t("mL")}</SelectItem>
                      <SelectItem value="L">L</SelectItem>
                      <SelectItem value="g">g</SelectItem>
                      <SelectItem value="mg">{t("mg")}</SelectItem>
                      <SelectItem value="pieces">{t("pieces")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="collectionDate">{t("Collection Date & Time *")}</Label>
                <Input
                  id="collectionDate"
                  type="datetime-local"
                  {...form.register("collectionDate")}
                />
                {form.formState.errors.collectionDate && (
                  <p className="text-sm text-red-500">{tAny(form.formState.errors.collectionDate.message)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="collectedBy">{t("Collected By *")}</Label>
                <Input
                  id="collectedBy"
                  {...form.register("collectedBy")}
                  placeholder={t("Staff member name")}
                />
                {form.formState.errors.collectedBy && (
                  <p className="text-sm text-red-500">{tAny(form.formState.errors.collectedBy.message)}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t("Notes")}</Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  placeholder={t("Collection notes, patient condition, etc...")}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setCollectionDialogOpen(false)}>
                  {t("Cancel")}
                </Button>
                <Button type="submit">{t("Collect Sample")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {filteredSamples.map((sample) => {
          const StatusIcon = getStatusIcon(sample.status);
          
          return (
            <Card key={sample.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getSampleTypeIcon(sample.sampleType)}</div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {t("Sample:")} {sample.sampleId}
                        <Badge className={getStatusColor(sample.status)}>
                          {tAny(sample.status)}
                        </Badge>
                        {sample.temperature && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Thermometer className="h-3 w-3" />
                            {sample.temperature}°C
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {t("Patient: {patientName} (MRN: {patientMRN}) • Barcode: {barcode} • Collected: {amount}", { patientName: sample.patientName, patientMRN: sample.patientMRN, barcode: sample.barcode, amount: fmt(sample.collectionDate, "PP p") })}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openBarcodeDialog(sample)}
                    >
                      <QrCode className="mr-2 h-4 w-4" />
                      {t("Barcode")}
                    </Button>
                    {sample.status === "collected" && (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onReceiveSample(sample.id)}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        {t("Receive")}
                      </Button>
                    )}
                    {(sample.status === "collected" || sample.status === "received") && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openRejectDialog(sample)}
                      >
                        <XCircle className="mr-2 h-4 w-4" />
                        {t("Reject")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="details" className="w-full">
                  <TabsList>
                    <TabsTrigger value="details">{t("Sample Details")}</TabsTrigger>
                    <TabsTrigger value="tests">{t("Tests ({length})", { length: sample.tests.length })}</TabsTrigger>
                    <TabsTrigger value="tracking">{t("Tracking")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-foreground">{t("Sample Type")}</p>
                        <p className="text-muted-foreground">{getSampleTypeIcon(sample.sampleType)} {tAny(sample.sampleType)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t("Volume")}</p>
                        <p className="text-muted-foreground">{sample.volume} {tAny(sample.unit)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t("Collected By")}</p>
                        <p className="text-muted-foreground">{sample.collectedBy}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t("Storage Location")}</p>
                        <p className="text-muted-foreground">
                          {sample.storageLocation ? (
                            <>
                              <MapPin className="inline h-4 w-4 mr-1" />
                              {sample.storageLocation}
                            </>
                          ) : (
                            t("Not assigned")
                          )}
                        </p>
                      </div>
                    </div>

                    {sample.expiryDate && (
                      <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="text-yellow-800">
                          {t("Expires: {toLocaleDateString}", { toLocaleDateString: fmt(sample.expiryDate, "PP") })}
                        </span>
                      </div>
                    )}

                    {sample.rejectionReason && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <XCircle className="h-4 w-4 text-red-600" />
                        <span className="text-red-800">
                          {t("Rejected: {rejectionReason}", { rejectionReason: sample.rejectionReason })}
                        </span>
                      </div>
                    )}

                    {sample.notes && (
                      <div>
                        <p className="font-medium text-foreground">{t("Notes")}</p>
                        <p className="text-muted-foreground">{sample.notes}</p>
                      </div>
                    )}

                    {sample.storageLocation && (
                      <div className="flex items-center gap-2">
                        <Label>{t("Update Location:")}</Label>
                        <Select onValueChange={(value) => onUpdateLocation(sample.id, value)}>
                          <SelectTrigger className="w-64">
                            <SelectValue placeholder={t("Select new location")} />
                          </SelectTrigger>
                          <SelectContent>
                            {STORAGE_LOCATIONS.map((location) => (
                              <SelectItem key={location} value={location}>
                                {tAny(location)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="tests" className="space-y-3">
                    {sample.tests.map((testId, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <p className="font-medium">{t("Test ID: {testId}", { testId: testId })}</p>
                        <p className="text-sm text-muted-foreground">{t("Associated with this sample")}</p>
                      </div>
                    ))}
                    {sample.tests.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">{t("No tests associated with this sample")}</p>
                    )}
                  </TabsContent>

                  <TabsContent value="tracking" className="space-y-3">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t("Sample collected")}</p>
                          <p className="text-xs text-muted-foreground">
                            {t("{amount} by {collectedBy}", { amount: fmt(sample.collectionDate, "PP p"), collectedBy: sample.collectedBy })}
                          </p>
                        </div>
                      </div>
                      
                      {sample.status !== "collected" && (
                        <div className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{t("Sample received in lab")}</p>
                            <p className="text-xs text-muted-foreground">{t("Status updated to {status}", { status: tAny(sample.status) })}</p>
                          </div>
                        </div>
                      )}

                      {sample.status === "rejected" && (
                        <div className="flex items-center gap-3 p-3 bg-red-50 rounded">
                          <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{t("Sample rejected")}</p>
                            <p className="text-xs text-muted-foreground">{t("Reason: {rejectionReason}", { rejectionReason: sample.rejectionReason })}</p>
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

        {filteredSamples.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Package className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t("No samples found")}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("Collect samples to start tracking")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Barcode Dialog */}
      <Dialog open={barcodeDialogOpen} onOpenChange={setBarcodeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("Sample Barcode")}</DialogTitle>
            <DialogDescription>
              {t("Barcode for sample {sampleId}", { sampleId: selectedSample?.sampleId })}
            </DialogDescription>
          </DialogHeader>
          {selectedSample && (
            <div ref={barcodeRef} className="text-center space-y-4">
              <QRCode
                size={200}
                value={selectedSample.barcode}
                className="mx-auto"
              />
              <div>
                <p className="font-mono text-lg">{selectedSample.barcode}</p>
                <p className="text-sm text-muted-foreground">{selectedSample.patientName}</p>
                <p className="text-sm text-muted-foreground">{t("{sampleType} sample", { sampleType: selectedSample.sampleType })}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setBarcodeDialogOpen(false)}>
              {t("Close")}
            </Button>
            <Button onClick={printBarcode}>{t("Print Barcode")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("Reject Sample")}</DialogTitle>
            <DialogDescription>
              {t("Select a reason for rejecting sample {sampleId}", { sampleId: selectedSample?.sampleId })}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{t("Rejection Reason")}</Label>
              <Select value={rejectionReason} onValueChange={setRejectionReason}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Select rejection reason")} />
                </SelectTrigger>
                <SelectContent>
                  {REJECTION_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {tAny(reason)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              {t("Cancel")}
            </Button>
            <Button variant="destructive" onClick={handleRejectSample}>
              {t("Reject Sample")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}