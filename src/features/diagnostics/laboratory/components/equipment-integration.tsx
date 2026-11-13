"use client";

import React, { useState } from "react";
import { Monitor, Wrench, CheckCircle, AlertTriangle, TrendingUp, Thermometer, Activity, Calendar } from "lucide-react";
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
import { LabEquipment, QualityControl, QualityControlFormData } from "@/features/diagnostics/laboratory/types";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { qualityControlSchema, equipmentMaintenanceSchema } from "@/features/diagnostics/laboratory/validations";
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { LAB_KM } from "@/features/diagnostics/laboratory/km";

interface EquipmentIntegrationProps {
  equipment: LabEquipment[];
  qualityControls: QualityControl[];
  onPerformQC: (data: QualityControlFormData) => Promise<void>;
  onScheduleMaintenance: (equipmentId: string, data: any) => Promise<void>;
  onConnectEquipment: (equipmentId: string) => Promise<void>;
  onDisconnectEquipment: (equipmentId: string) => Promise<void>;
  onCalibrateEquipment: (equipmentId: string) => Promise<void>;
}

const EQUIPMENT_STATUS_CONFIG = {
  operational: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  maintenance: { color: "bg-yellow-100 text-yellow-800", icon: Wrench },
  calibration: { color: "bg-blue-100 text-blue-800", icon: Activity },
  out_of_service: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
};

const CONNECTION_STATUS_CONFIG = {
  connected: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  disconnected: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
  error: { color: "bg-orange-100 text-orange-800", icon: AlertTriangle },
};

const QC_STATUS_CONFIG = {
  pass: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  fail: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
  warning: { color: "bg-yellow-100 text-yellow-800", icon: AlertTriangle },
};

const EQUIPMENT_TYPES = [
  { value: "analyzer", label: "Clinical Analyzer", icon: "🔬" },
  { value: "centrifuge", label: "Centrifuge", icon: "🌀" },
  { value: "microscope", label: "Microscope", icon: "🔍" },
  { value: "incubator", label: "Incubator", icon: "🌡️" },
  { value: "pcr", label: "PCR Machine", icon: "🧬" },
  { value: "mass_spectrometer", label: "Mass Spectrometer", icon: "⚛️" },
  { value: "coagulation_analyzer", label: "Coagulation Analyzer", icon: "🩸" },
  { value: "blood_gas_analyzer", label: "Blood Gas Analyzer", icon: "💨" },
  { value: "immunoassay_analyzer", label: "Immunoassay Analyzer", icon: "🦠" },
];

export function EquipmentIntegration({
  equipment,
  qualityControls,
  onPerformQC,
  onScheduleMaintenance,
  onConnectEquipment,
  onDisconnectEquipment,
  onCalibrateEquipment,
}: EquipmentIntegrationProps) {
  const fmt = useDateFormat();
  const t = useT(LAB_KM);
  const tAny = useTranslateAny(LAB_KM);
  const [qcDialogOpen, setQcDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<LabEquipment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const qcForm = useForm<QualityControlFormData>({
    resolver: zodResolver(qualityControlSchema),
    defaultValues: {
      level: "normal",
    },
  });

  const maintenanceForm = useForm({
    resolver: zodResolver(equipmentMaintenanceSchema),
    defaultValues: {
      type: "maintenance",
    },
  });

  const handlePerformQC = async (data: QualityControlFormData) => {
    try {
      await onPerformQC(data);
      setQcDialogOpen(false);
      setSelectedEquipment(null);
      qcForm.reset();
    } catch (error) {
      console.error("Error performing QC:", error);
    }
  };

  const handleScheduleMaintenance = async (data: any) => {
    if (!selectedEquipment) return;
    
    try {
      await onScheduleMaintenance(selectedEquipment.id, data);
      setMaintenanceDialogOpen(false);
      setSelectedEquipment(null);
      maintenanceForm.reset();
    } catch (error) {
      console.error("Error scheduling maintenance:", error);
    }
  };

  const openQcDialog = (eq: LabEquipment) => {
    setSelectedEquipment(eq);
    qcForm.setValue("equipmentId", eq.id);
    setQcDialogOpen(true);
  };

  const openMaintenanceDialog = (eq: LabEquipment) => {
    setSelectedEquipment(eq);
    maintenanceForm.setValue("equipmentId", eq.id);
    setMaintenanceDialogOpen(true);
  };

  const filteredEquipment = equipment.filter((eq) => {
    const matchesSearch = 
      eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eq.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || eq.status === statusFilter;
    const matchesType = typeFilter === "all" || eq.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => EQUIPMENT_STATUS_CONFIG[status as keyof typeof EQUIPMENT_STATUS_CONFIG]?.color || "bg-gray-100 text-gray-800";
  const getConnectionColor = (status: string) => CONNECTION_STATUS_CONFIG[status as keyof typeof CONNECTION_STATUS_CONFIG]?.color || "bg-gray-100 text-gray-800";
  const getQcColor = (status: string) => QC_STATUS_CONFIG[status as keyof typeof QC_STATUS_CONFIG]?.color || "bg-gray-100 text-gray-800";

  const getEquipmentIcon = (type: string) => {
    const equipmentType = EQUIPMENT_TYPES.find(t => t.value === type);
    return equipmentType?.icon || "🔬";
  };

  const getDaysUntilMaintenance = (equipment: LabEquipment) => {
    const today = new Date();
    const nextMaintenance = new Date(equipment.nextMaintenance);
    const diffTime = nextMaintenance.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t("Equipment Integration")}</h1>
        <p className="text-muted-foreground">{t("Manage laboratory equipment, connectivity, and quality control")}</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder={t("Search equipment by name, serial number, or location...")}
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
            <SelectItem value="operational">{t("Operational")}</SelectItem>
            <SelectItem value="maintenance">{t("Maintenance")}</SelectItem>
            <SelectItem value="calibration">{t("Calibration")}</SelectItem>
            <SelectItem value="out_of_service">{t("Out of Service")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder={t("Equipment Type")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Types")}</SelectItem>
            {EQUIPMENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.icon} {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6">
        {filteredEquipment.map((eq) => {
          const daysUntilMaintenance = getDaysUntilMaintenance(eq);
          const recentQCs = qualityControls
            .filter(qc => qc.date >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
            .filter(qc => eq.supportedTests.includes(qc.testCode));

          return (
            <Card key={eq.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getEquipmentIcon(eq.type)}</div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {eq.name}
                        <Badge className={getStatusColor(eq.status)}>
                          {tAny(eq.status)}
                        </Badge>
                        <Badge className={getConnectionColor(eq.connectionStatus)}>
                          {eq.connectionStatus}
                        </Badge>
                        {daysUntilMaintenance <= 7 && (
                          <Badge variant="destructive">
                            <Calendar className="h-3 w-3 mr-1" />
                            {t("Maintenance Due")}
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {t("{manufacturer} {model} • Serial: {serialNumber} • Location: {location}", { manufacturer: eq.manufacturer, model: eq.model, serialNumber: eq.serialNumber, location: eq.location })}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openQcDialog(eq)}
                      disabled={eq.status !== "operational"}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {t("QC Check")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openMaintenanceDialog(eq)}
                    >
                      <Wrench className="mr-2 h-4 w-4" />
                      {t("Maintenance")}
                    </Button>
                    {eq.connectionStatus === "connected" ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDisconnectEquipment(eq.id)}
                      >
                        {t("Disconnect")}
                      </Button>
                    ) : (
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => onConnectEquipment(eq.id)}
                      >
                        {t("Connect")}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList>
                    <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
                    <TabsTrigger value="qc">{t("Quality Control")}</TabsTrigger>
                    <TabsTrigger value="maintenance">{t("Maintenance")}</TabsTrigger>
                    <TabsTrigger value="tests">{t("Supported Tests")}</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-foreground">{t("Equipment Type")}</p>
                        <p className="text-muted-foreground">{getEquipmentIcon(eq.type)} {tAny(eq.type)}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t("Interface")}</p>
                        <p className="text-muted-foreground">{eq.interfaceType}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t("Install Date")}</p>
                        <p className="text-muted-foreground">{fmt(eq.installDate, "PP")}</p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t("Last Data")}</p>
                        <p className="text-muted-foreground">
                          {eq.lastDataReceived 
                            ? fmt(eq.lastDataReceived, "PP p")
                            : t("No data received")
                          }
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <TrendingUp className="h-5 w-5 text-blue-600" />
                          <span className="font-medium text-blue-900">{t("Performance")}</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-600">
                          {eq.status === "operational" ? "98.5%" : "N/A"}
                        </p>
                        <p className="text-sm text-blue-800">{t("Uptime")}</p>
                      </div>

                      <div className="p-4 bg-green-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-green-900">{t("QC Status")}</span>
                        </div>
                        <p className="text-2xl font-bold text-green-600">
                          {recentQCs.filter(qc => qc.status === "pass").length}
                        </p>
                        <p className="text-sm text-green-800">{t("Passed this week")}</p>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Calendar className="h-5 w-5 text-yellow-600" />
                          <span className="font-medium text-yellow-900">{t("Maintenance")}</span>
                        </div>
                        <p className="text-2xl font-bold text-yellow-600">
                          {daysUntilMaintenance > 0 ? daysUntilMaintenance : t("Overdue")}
                        </p>
                        <p className="text-sm text-yellow-800">{t("Days until next")}</p>
                      </div>
                    </div>

                    {eq.status !== "operational" && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                          <span className="font-medium text-yellow-900">{t("Equipment Status Alert")}</span>
                        </div>
                        <p className="text-sm text-yellow-800 mt-1">
                          {t("Equipment is currently {replace} and not available for testing.", { replace: tAny(eq.status) })}</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="qc" className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{t("Recent Quality Control Results")}</h4>
                      <Button size="sm" onClick={() => openQcDialog(eq)}>
                        {t("Perform QC")}
                      </Button>
                    </div>
                    
                    {recentQCs.length > 0 ? (
                      <div className="space-y-3">
                        {recentQCs.slice(0, 5).map((qc) => (
                          <div key={qc.id} className="flex justify-between items-center p-3 border rounded">
                            <div>
                              <p className="font-medium">{t("{testCode} - {level} level", { testCode: qc.testCode, level: qc.level })}</p>
                              <p className="text-sm text-muted-foreground">
                                {t("Expected: {expectedValue} {unit} • Actual: {actualValue} {unit2}", { expectedValue: qc.expectedValue, unit: qc.unit, actualValue: qc.actualValue, unit2: qc.unit })}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {t("{amount} by {performedBy}", { amount: fmt(qc.date, "PP p"), performedBy: qc.performedBy })}
                              </p>
                            </div>
                            <Badge className={getQcColor(qc.status)}>
                              {tAny(qc.status)}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-4">{t("No recent quality control results")}</p>
                    )}
                  </TabsContent>

                  <TabsContent value="maintenance" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium text-foreground">{t("Last Maintenance")}</p>
                        <p className="text-muted-foreground">
                          <Wrench className="inline h-4 w-4 mr-1" />
                          {fmt(eq.lastMaintenance, "PP")}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t("Next Maintenance")}</p>
                        <p className={`${daysUntilMaintenance <= 7 ? "text-red-600" : "text-muted-foreground"}`}>
                          <Calendar className="inline h-4 w-4 mr-1" />
                          {fmt(eq.nextMaintenance, "PP")}
                          {daysUntilMaintenance <= 7 && t("(Due Soon)")}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t("Last Calibration")}</p>
                        <p className="text-muted-foreground">
                          <Activity className="inline h-4 w-4 mr-1" />
                          {fmt(eq.lastCalibration, "PP")}
                        </p>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{t("Next Calibration")}</p>
                        <p className="text-muted-foreground">
                          <Activity className="inline h-4 w-4 mr-1" />
                          {fmt(eq.nextCalibration, "PP")}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onCalibrateEquipment(eq.id)}
                        disabled={eq.status === "out_of_service"}
                      >
                        <Activity className="mr-2 h-4 w-4" />
                        {t("Calibrate")}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openMaintenanceDialog(eq)}
                      >
                        <Wrench className="mr-2 h-4 w-4" />
                        {t("Schedule Maintenance")}
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="tests" className="space-y-4">
                    <h4 className="font-medium">{t("Supported Test Codes")}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {eq.supportedTests.map((testCode) => (
                        <Badge key={testCode} variant="outline" className="text-center">
                          {testCode}
                        </Badge>
                      ))}
                    </div>
                    {eq.supportedTests.length === 0 && (
                      <p className="text-muted-foreground text-center py-4">{t("No supported tests configured")}</p>
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
            <DialogTitle>{t("Quality Control Check")}</DialogTitle>
            <DialogDescription>
              {t("Perform quality control for {name}", { name: selectedEquipment?.name })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={qcForm.handleSubmit(handlePerformQC)} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("Test Code")}</Label>
              <Select onValueChange={(value) => qcForm.setValue("testCode", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Select test code")} />
                </SelectTrigger>
                <SelectContent>
                  {selectedEquipment?.supportedTests.map((testCode) => (
                    <SelectItem key={testCode} value={testCode}>
                      {tAny(testCode)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t("QC Level")}</Label>
              <Select onValueChange={(value) => qcForm.setValue("level", value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">{t("Low")}</SelectItem>
                  <SelectItem value="normal">{t("Normal")}</SelectItem>
                  <SelectItem value="high">{t("High")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="expectedValue">{t("Expected Value")}</Label>
                <Input
                  id="expectedValue"
                  type="number"
                  step="0.01"
                  {...qcForm.register("expectedValue", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="actualValue">{t("Actual Value")}</Label>
                <Input
                  id="actualValue"
                  type="number"
                  step="0.01"
                  {...qcForm.register("actualValue", { valueAsNumber: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="unit">{t("Unit")}</Label>
              <Input
                id="unit"
                {...qcForm.register("unit")}
                placeholder={t("e.g., mg/dL, mmol/L")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="performedBy">{t("Performed By")}</Label>
              <Input
                id="performedBy"
                {...qcForm.register("performedBy")}
                placeholder={t("Technologist name")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t("Notes")}</Label>
              <Textarea
                id="notes"
                {...qcForm.register("notes")}
                placeholder={t("QC observations or notes...")}
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setQcDialogOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button type="submit">{t("Submit QC")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Maintenance Dialog */}
      <Dialog open={maintenanceDialogOpen} onOpenChange={setMaintenanceDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t("Schedule Maintenance")}</DialogTitle>
            <DialogDescription>
              {t("Schedule maintenance for {name}", { name: selectedEquipment?.name })}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={maintenanceForm.handleSubmit(handleScheduleMaintenance)} className="space-y-4">
            <div className="space-y-2">
              <Label>{t("Maintenance Type")}</Label>
              <Select onValueChange={(value) => maintenanceForm.setValue("type", value as "maintenance" | "calibration" | "repair")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="maintenance">{t("Routine Maintenance")}</SelectItem>
                  <SelectItem value="calibration">{t("Calibration")}</SelectItem>
                  <SelectItem value="repair">{t("Repair")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t("Description")}</Label>
              <Textarea
                id="description"
                {...maintenanceForm.register("description")}
                placeholder={t("Describe the maintenance work...")}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">{t("Scheduled Date")}</Label>
                <Input
                  id="date"
                  type="date"
                  {...maintenanceForm.register("date")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="performedBy">{t("Performed By")}</Label>
                <Input
                  id="performedBy"
                  {...maintenanceForm.register("performedBy")}
                  placeholder={t("Technician name")}
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setMaintenanceDialogOpen(false)}>
                {t("Cancel")}
              </Button>
              <Button type="submit">{t("Schedule")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}