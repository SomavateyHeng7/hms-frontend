"use client";

import React, { useState, useEffect } from "react";
import { FileText, CheckCircle, AlertTriangle, Edit, User, Calendar, Clock, Download, Printer, Eye, Send } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { LabTestResult, LabReport, LabReportDeliveryMethod } from "@/types/laboratory";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { labReportSchema, criticalValueSchema, LabReportFormData, CriticalValueFormData } from "@/lib/validations/laboratory";

interface TestResultEntryProps {
  results: LabTestResult[];
  reports: LabReport[];
  onEnterResult: (result: LabTestResult) => Promise<void>;
  onValidateResult: (resultId: string, validatedBy: string, comments?: string) => Promise<void>;
  onCreateReport: (data: LabReportFormData) => Promise<void>;
  onHandleCriticalValue: (data: CriticalValueFormData) => Promise<void>;
  onDownloadReport: (reportId: string) => Promise<void>;
  onPrintReport: (reportId: string) => Promise<void>;
  onSendReport: (reportId: string, method: 'email' | 'portal' | 'fax', recipient: string) => Promise<void>;
  /** Critical results whose provider notification has already been recorded */
  acknowledgedResultIds?: string[];
  /** Orders that results can be entered against (suggested while typing the order ID) */
  orderOptions?: { id: string; orderNumber: string; patientName: string }[];
  /** Role-based access; the matching actions are disabled when false */
  canEnterResults?: boolean;
  canValidate?: boolean;
  canAcknowledge?: boolean;
  canCreateReport?: boolean;
}

// Stable references so omitted props do not retrigger effects on every render
const NO_IDS: string[] = [];
const NO_ORDER_OPTIONS: { id: string; orderNumber: string; patientName: string }[] = [];

const RESULT_STATUS_CONFIG = {
  pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock },
  preliminary: { color: "bg-blue-100 text-blue-800", icon: Edit },
  final: { color: "bg-green-100 text-green-800", icon: CheckCircle },
  corrected: { color: "bg-purple-100 text-purple-800", icon: Edit },
  cancelled: { color: "bg-red-100 text-red-800", icon: AlertTriangle },
};

const FLAG_TYPES = [
  { value: "normal", label: "Normal", color: "text-green-600" },
  { value: "low", label: "Low", color: "text-blue-600" },
  { value: "high", label: "High", color: "text-red-600" },
  { value: "critical_low", label: "Critical Low", color: "text-red-800" },
  { value: "critical_high", label: "Critical High", color: "text-red-800" },
  { value: "abnormal", label: "Abnormal", color: "text-orange-600" },
];

const DELIVERY_METHODS: { value: LabReportDeliveryMethod; label: string; icon: string }[] = [
  { value: "digital", label: "Digital Portal", icon: "💻" },
  { value: "email", label: "Email", icon: "📧" },
  { value: "print", label: "Print", icon: "🖨️" },
  { value: "fax", label: "Fax", icon: "📠" },
];

export function TestResultEntry({
  results,
  reports,
  onEnterResult,
  onValidateResult,
  onCreateReport,
  onHandleCriticalValue,
  onDownloadReport,
  onPrintReport,
  onSendReport,
  acknowledgedResultIds = NO_IDS,
  orderOptions = NO_ORDER_OPTIONS,
  canEnterResults = true,
  canValidate = true,
  canAcknowledge = true,
  canCreateReport = true,
}: TestResultEntryProps) {
  const [resultDialogOpen, setResultDialogOpen] = useState(false);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [criticalDialogOpen, setCriticalDialogOpen] = useState(false);
  const [sendReportDialogOpen, setSendReportDialogOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<LabTestResult | null>(null);
  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [flagFilter, setFlagFilter] = useState("all");
  const [criticalResults, setCriticalResults] = useState<LabTestResult[]>([]);

  const resultForm = useForm<LabTestResult>({
    defaultValues: {
      status: "preliminary",
      flag: "normal",
    },
  });

  const reportForm = useForm<LabReportFormData>({
    resolver: zodResolver(labReportSchema),
    defaultValues: {
      template: "standard",
      deliveryMethod: ["digital"],
      autoSend: false,
    },
  });

  const criticalForm = useForm<CriticalValueFormData>({
    resolver: zodResolver(criticalValueSchema),
    defaultValues: {
      notificationMethod: "phone",
      urgency: "immediate",
    },
  });

  const [sendMethod, setSendMethod] = useState<'email' | 'portal' | 'fax'>('email');
  const [sendRecipient, setSendRecipient] = useState("");

  useEffect(() => {
    // Identify critical results
    const critical = results.filter(r =>
      (r.flag === "critical_low" || r.flag === "critical_high" || r.isCritical) &&
      !acknowledgedResultIds.includes(r.id)
    );
    setCriticalResults(critical);
  }, [results, acknowledgedResultIds]);

  const handleEnterResult = async (data: LabTestResult) => {
    try {
      await onEnterResult(data);
      setResultDialogOpen(false);
      resultForm.reset();
    } catch (error) {
      console.error("Error entering result:", error);
    }
  };

  const handleValidateResult = async (resultId: string) => {
    const comments = prompt("Validation comments (optional):");
    const validatedBy = "Current User"; // This would come from auth context
    
    try {
      await onValidateResult(resultId, validatedBy, comments || undefined);
    } catch (error) {
      console.error("Error validating result:", error);
    }
  };

  const handleCreateReport = async (data: LabReportFormData) => {
    try {
      await onCreateReport(data);
      setReportDialogOpen(false);
      reportForm.reset();
    } catch (error) {
      console.error("Error creating report:", error);
    }
  };

  const handleCriticalValue = async (data: CriticalValueFormData) => {
    try {
      await onHandleCriticalValue(data);
      setCriticalDialogOpen(false);
      criticalForm.reset();
    } catch (error) {
      console.error("Error handling critical value:", error);
    }
  };

  const handleSendReport = async () => {
    if (!selectedReport || !sendRecipient) return;
    
    try {
      await onSendReport(selectedReport.id, sendMethod, sendRecipient);
      setSendReportDialogOpen(false);
      setSendRecipient("");
      setSelectedReport(null);
    } catch (error) {
      console.error("Error sending report:", error);
    }
  };

  const openCriticalDialog = (result: LabTestResult) => {
    setSelectedResult(result);
    criticalForm.setValue("resultId", result.id);
    criticalForm.setValue("patientId", result.patientId ?? result.orderId);
    setCriticalDialogOpen(true);
  };

  const openSendReportDialog = (report: LabReport) => {
    setSelectedReport(report);
    setSendReportDialogOpen(true);
  };

  const filteredResults = results.filter((result) => {
    const matchesSearch = 
      result.testCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.value.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "all" || result.status === statusFilter;
    const matchesFlag = flagFilter === "all" || result.flag === flagFilter;
    return matchesSearch && matchesStatus && matchesFlag;
  });

  const getStatusColor = (status: string) => RESULT_STATUS_CONFIG[status as keyof typeof RESULT_STATUS_CONFIG]?.color || "bg-gray-100 text-gray-800";
  const getFlagColor = (flag: string) => FLAG_TYPES.find(f => f.value === flag)?.color || "text-gray-600";

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Test Result Entry & Validation</h1>
        <p className="text-gray-600">Enter, validate, and report laboratory test results</p>
      </div>

      {/* Critical Values Alert */}
      {criticalResults.length > 0 && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              <AlertTriangle className="h-5 w-5" />
              Critical Values Pending Notification
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {criticalResults.map((result) => (
                <div key={result.id} className="flex justify-between items-center p-3 bg-white border border-red-200 rounded">
                  <div>
                    <p className="font-medium text-red-900">
                      {result.testCode}: {result.value} {result.unit}
                    </p>
                    <p className="text-sm text-red-700">
                      Order: {result.orderId} • Entered: {new Date(result.enteredAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => openCriticalDialog(result)}
                    disabled={!canAcknowledge}
                  >
                    Notify
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Input
            placeholder="Search results by test code, order ID, or value..."
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
            <SelectItem value="preliminary">Preliminary</SelectItem>
            <SelectItem value="final">Final</SelectItem>
            <SelectItem value="corrected">Corrected</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={flagFilter} onValueChange={setFlagFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Flag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Flags</SelectItem>
            {FLAG_TYPES.map((flag) => (
              <SelectItem key={flag.value} value={flag.value}>
                {flag.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setResultDialogOpen(true)} disabled={!canEnterResults}>
          Enter Result
        </Button>
        <Button variant="outline" onClick={() => setReportDialogOpen(true)} disabled={!canCreateReport}>
          <FileText className="mr-2 h-4 w-4" />
          Create Report
        </Button>
      </div>

      <Tabs defaultValue="results" className="w-full">
        <TabsList>
          <TabsTrigger value="results">Test Results</TabsTrigger>
          <TabsTrigger value="reports">Lab Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="results" className="space-y-4">
          {filteredResults.map((result) => (
            <Card key={result.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {result.testCode}
                      <Badge className={getStatusColor(result.status)}>
                        {result.status}
                      </Badge>
                      <Badge variant="outline" className={getFlagColor(result.flag)}>
                        {FLAG_TYPES.find(f => f.value === result.flag)?.label}
                      </Badge>
                      {result.isCritical && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Critical
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription>
                      Order: {result.orderId} • Entered: {new Date(result.enteredAt).toLocaleString()}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    {result.status === "preliminary" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleValidateResult(result.id)}
                        disabled={!canValidate}
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Validate
                      </Button>
                    )}
                    {result.isCritical && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => openCriticalDialog(result)}
                    disabled={!canAcknowledge}
                      >
                        <AlertTriangle className="mr-2 h-4 w-4" />
                        Handle Critical
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">Result Value</p>
                    <p className={`text-lg font-bold ${getFlagColor(result.flag)}`}>
                      {result.value} {result.unit}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Reference Range</p>
                    <p className="text-gray-600">
                      {result.referenceRange || "Not specified"}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Entered By</p>
                    <p className="text-gray-600">{result.enteredBy}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Method</p>
                    <p className="text-gray-600">{result.method || "Standard"}</p>
                  </div>
                </div>

                {result.comments && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="font-medium text-gray-900">Comments</p>
                    <p className="text-gray-700">{result.comments}</p>
                  </div>
                )}

                {result.validatedBy && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded">
                    <p className="font-medium text-green-900">Validation Information</p>
                    <p className="text-green-700">
                      Validated by {result.validatedBy} on {result.validatedAt && new Date(result.validatedAt).toLocaleString()}
                    </p>
                    {result.validationComments && (
                      <p className="text-green-700 mt-1">{result.validationComments}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          {reports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Lab Report #{report.reportNumber}
                      <Badge className={getStatusColor(report.status)}>
                        {report.status}
                      </Badge>
                    </CardTitle>
                    <CardDescription>
                      Order: {report.orderId} • Generated: {report.generatedAt ? new Date(report.generatedAt).toLocaleString() : "—"}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownloadReport(report.id)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPrintReport(report.id)}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => openSendReportDialog(report)}
                    >
                      <Send className="mr-2 h-4 w-4" />
                      Send
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="font-medium text-gray-900">Template</p>
                    <p className="text-gray-600">{report.template}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Delivery Method</p>
                    <div className="flex gap-1">
                      {report.deliveryMethod.map((method) => {
                        const methodConfig = DELIVERY_METHODS.find(m => m.value === method);
                        return (
                          <Badge key={method} variant="outline">
                            {methodConfig?.icon} {methodConfig?.label}
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Generated By</p>
                    <p className="text-gray-600">{report.generatedBy}</p>
                  </div>
                </div>

                {report.comments && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="font-medium text-gray-900">Comments</p>
                    <p className="text-gray-700">{report.comments}</p>
                  </div>
                )}

                {report.deliveryStatus && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                    <p className="font-medium text-blue-900">Delivery Status</p>
                    <div className="space-y-1">
                      {Object.entries(report.deliveryStatus).map(([method, status]) => (
                        <p key={method} className="text-blue-700">
                          {DELIVERY_METHODS.find(m => m.value === method)?.label}: {status}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Result Entry Dialog */}
      <Dialog open={resultDialogOpen} onOpenChange={setResultDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Enter Test Result</DialogTitle>
            <DialogDescription>
              Enter laboratory test result and validation information
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={resultForm.handleSubmit(handleEnterResult)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="orderId">Order ID</Label>
                <Input
                  id="orderId"
                  list="result-order-options"
                  {...resultForm.register("orderId")}
                  placeholder="Order number, e.g. LAB00001"
                />
                <datalist id="result-order-options">
                  {orderOptions.map((o) => (
                    <option key={o.id} value={o.orderNumber}>
                      {o.patientName}
                    </option>
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label htmlFor="testCode">Test Code</Label>
                <Input
                  id="testCode"
                  {...resultForm.register("testCode")}
                  placeholder="Test code"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value">Result Value</Label>
                <Input
                  id="value"
                  type="number"
                  step="0.01"
                  {...resultForm.register("value", { valueAsNumber: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unit">Unit</Label>
                <Input
                  id="unit"
                  {...resultForm.register("unit")}
                  placeholder="e.g., mg/dL"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="referenceRange">Reference Range</Label>
              <Input
                id="referenceRange"
                {...resultForm.register("referenceRange")}
                placeholder="e.g., 70-100 mg/dL"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select onValueChange={(value) => resultForm.setValue("status", value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="preliminary">Preliminary</SelectItem>
                    <SelectItem value="final">Final</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Flag</Label>
                <Select onValueChange={(value) => resultForm.setValue("flag", value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FLAG_TYPES.map((flag) => (
                      <SelectItem key={flag.value} value={flag.value}>
                        {flag.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Method</Label>
              <Input
                id="method"
                {...resultForm.register("method")}
                placeholder="Testing method"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="enteredBy">Entered By</Label>
              <Input
                id="enteredBy"
                {...resultForm.register("enteredBy")}
                placeholder="Technologist name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                {...resultForm.register("comments")}
                placeholder="Result comments..."
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isCritical"
                onCheckedChange={(checked) => resultForm.setValue("isCritical", !!checked)}
              />
              <Label htmlFor="isCritical">Mark as critical value</Label>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setResultDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Enter Result</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Report Creation Dialog */}
      <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Lab Report</DialogTitle>
            <DialogDescription>
              Generate a laboratory report with selected results
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={reportForm.handleSubmit(handleCreateReport)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="orderId">Order ID</Label>
              <Input
                id="orderId"
                {...reportForm.register("orderId")}
                placeholder="Order ID for report"
              />
            </div>

            <div className="space-y-2">
              <Label>Template</Label>
              <Select onValueChange={(value) => reportForm.setValue("template", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard Report</SelectItem>
                  <SelectItem value="comprehensive">Comprehensive Report</SelectItem>
                  <SelectItem value="summary">Summary Report</SelectItem>
                  <SelectItem value="critical_only">Critical Values Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label>Delivery Methods</Label>
              {DELIVERY_METHODS.map((method) => (
                <div key={method.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={method.value}
                    onCheckedChange={(checked) => {
                      const current = reportForm.getValues("deliveryMethod");
                      if (checked) {
                        reportForm.setValue("deliveryMethod", [...current, method.value]);
                      } else {
                        reportForm.setValue("deliveryMethod", current.filter(m => m !== method.value));
                      }
                    }}
                  />
                  <Label htmlFor={method.value}>
                    {method.icon} {method.label}
                  </Label>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email (if email delivery)</Label>
              <Input
                id="recipientEmail"
                type="email"
                {...reportForm.register("recipientEmail")}
                placeholder="patient@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="generatedBy">Generated By</Label>
              <Input
                id="generatedBy"
                {...reportForm.register("generatedBy")}
                placeholder="Your name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="comments">Comments</Label>
              <Textarea
                id="comments"
                {...reportForm.register("comments")}
                placeholder="Report comments..."
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoSend"
                  onCheckedChange={(checked) => reportForm.setValue("autoSend", checked)}
                />
                <Label htmlFor="autoSend">Auto-send when ready</Label>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Generate Report</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Critical Value Dialog */}
      <Dialog open={criticalDialogOpen} onOpenChange={setCriticalDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Handle Critical Value</DialogTitle>
            <DialogDescription>
              Notify healthcare provider of critical result: {selectedResult?.testCode}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={criticalForm.handleSubmit(handleCriticalValue)} className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded">
              <p className="font-medium text-red-900">Critical Result</p>
              <p className="text-red-700">
                {selectedResult?.testCode}: {selectedResult?.value} {selectedResult?.unit}
              </p>
            </div>

            <div className="space-y-2">
              <Label>Notification Method</Label>
              <Select onValueChange={(value) => criticalForm.setValue("notificationMethod", value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="phone">Phone Call</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                  <SelectItem value="pager">Pager</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Urgency</Label>
              <Select onValueChange={(value) => criticalForm.setValue("urgency", value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                  <SelectItem value="routine">Routine</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notifiedPerson">Person Notified</Label>
              <Input
                id="notifiedPerson"
                {...criticalForm.register("notifiedPerson")}
                placeholder="Doctor or nurse name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notificationNotes">Notification Notes</Label>
              <Textarea
                id="notificationNotes"
                {...criticalForm.register("notificationNotes")}
                placeholder="Details of notification conversation..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setCriticalDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="destructive">
                Send Notification
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Send Report Dialog */}
      <Dialog open={sendReportDialogOpen} onOpenChange={setSendReportDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Send Report</DialogTitle>
            <DialogDescription>
              Send report #{selectedReport?.reportNumber} to recipient
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Delivery Method</Label>
              <Select value={sendMethod} onValueChange={(value: any) => setSendMethod(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">📧 Email</SelectItem>
                  <SelectItem value="portal">💻 Patient Portal</SelectItem>
                  <SelectItem value="fax">📠 Fax</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Input
                id="recipient"
                value={sendRecipient}
                onChange={(e) => setSendRecipient(e.target.value)}
                placeholder={
                  sendMethod === "email" ? "email@example.com" :
                  sendMethod === "fax" ? "555-123-4567" :
                  "Patient portal username"
                }
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setSendReportDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSendReport}>
                <Send className="mr-2 h-4 w-4" />
                Send Report
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}