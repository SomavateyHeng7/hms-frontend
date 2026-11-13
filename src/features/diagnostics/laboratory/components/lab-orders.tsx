"use client";

import React, { useState } from "react";
import { Plus, Search, Filter, TestTube, Calendar, Clock, AlertTriangle, FileText } from "lucide-react";
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
import { LabOrder, LabTest } from "@/features/diagnostics/laboratory/types";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { labOrderSchema, LabOrderFormData } from "@/features/diagnostics/laboratory/validations";
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { LAB_KM } from "@/features/diagnostics/laboratory/km";

interface LabOrdersProps {
  orders: LabOrder[];
  tests: LabTest[];
  patients: { id: string; name: string; mrn: string; dob: Date; gender: string }[];
  physicians: { id: string; name: string; department: string; license: string }[];
  onCreateOrder: (data: LabOrderFormData) => Promise<void>;
  onUpdateOrder: (id: string, data: Partial<LabOrder>) => Promise<void>;
  onCancelOrder: (id: string, reason: string) => Promise<void>;
  onCollectSample: (orderId: string) => void;
}

const PRIORITY_COLORS = {
  routine: "bg-blue-100 text-blue-800",
  urgent: "bg-orange-100 text-orange-800",
  stat: "bg-red-100 text-red-800",
  asap: "bg-red-100 text-red-800",
};

const STATUS_COLORS = {
  ordered: "bg-yellow-100 text-yellow-800",
  pending: "bg-gray-100 text-gray-800",
  collected: "bg-blue-100 text-blue-800",
  processing: "bg-purple-100 text-purple-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

const TEST_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "hematology", label: "Hematology" },
  { value: "chemistry", label: "Chemistry" },
  { value: "immunology", label: "Immunology" },
  { value: "microbiology", label: "Microbiology" },
  { value: "molecular", label: "Molecular" },
  { value: "pathology", label: "Pathology" },
  { value: "toxicology", label: "Toxicology" },
  { value: "coagulation", label: "Coagulation" },
  { value: "endocrinology", label: "Endocrinology" },
  { value: "cardiology", label: "Cardiology" },
];

export function LabOrders({
  orders,
  tests,
  patients,
  physicians,
  onCreateOrder,
  onUpdateOrder,
  onCancelOrder,
  onCollectSample,
}: LabOrdersProps) {
  const fmt = useDateFormat();
  const t = useT(LAB_KM);
  const tAny = useTranslateAny(LAB_KM);
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<LabOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedTests, setSelectedTests] = useState<string[]>([]);

  const form = useForm<LabOrderFormData>({
    resolver: zodResolver(labOrderSchema),
    defaultValues: {
      priority: "routine",
      fastingRequired: false,
      tests: [],
    },
  });

  const handleSubmit = async (data: LabOrderFormData) => {
    try {
      if (editingOrder) {
        await onUpdateOrder(editingOrder.id, data as any);
      } else {
        await onCreateOrder(data);
      }
      setOrderDialogOpen(false);
      setEditingOrder(null);
      setSelectedTests([]);
      form.reset();
    } catch (error) {
      console.error("Error saving lab order:", error);
    }
  };

  const openOrderDialog = (order?: LabOrder) => {
    if (order) {
      setEditingOrder(order);
      const testIds = order.tests.map(t => t.testId);
      setSelectedTests(testIds);
      form.reset({
        patientId: order.patientId,
        tests: testIds,
        priority: order.priority,
        clinicalIndication: order.clinicalIndication,
        notes: order.notes,
        fastingRequired: order.fastingRequired,
      });
    } else {
      setEditingOrder(null);
      setSelectedTests([]);
      form.reset();
    }
    setOrderDialogOpen(true);
  };

  const handleTestSelection = (testId: string, checked: boolean) => {
    const newSelection = checked
      ? [...selectedTests, testId]
      : selectedTests.filter(id => id !== testId);
    setSelectedTests(newSelection);
    form.setValue("tests", newSelection);
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patientMRN.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const filteredTests = tests.filter((test) => {
    return categoryFilter === "all" || test.category === categoryFilter;
  });

  const calculateTotalAmount = () => {
    return selectedTests.reduce((total, testId) => {
      const test = tests.find(t => t.id === testId);
      return total + (test?.price || 0);
    }, 0);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">{t("Lab Orders")}</h1>
        <p className="text-muted-foreground">{t("Manage laboratory test orders and requests")}</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("Search orders, patients, or order numbers...")}
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
            <SelectItem value="ordered">{t("Ordered")}</SelectItem>
            <SelectItem value="collected">{t("Collected")}</SelectItem>
            <SelectItem value="processing">{t("Processing")}</SelectItem>
            <SelectItem value="completed">{t("Completed")}</SelectItem>
            <SelectItem value="cancelled">{t("Cancelled")}</SelectItem>
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
            <SelectItem value="asap">{t("ASAP")}</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openOrderDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              {t("New Lab Order")}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOrder ? t("Edit Lab Order") : t("Create New Lab Order")}
              </DialogTitle>
              <DialogDescription>
                {t("Select tests and enter order details")}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("Patient *")}</Label>
                  <Select onValueChange={(value) => form.setValue("patientId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select patient")} />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} - {patient.mrn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.patientId && (
                    <p className="text-sm text-red-500">{tAny(form.formState.errors.patientId.message)}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t("Priority *")}</Label>
                  <Select onValueChange={(value) => form.setValue("priority", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("Select priority")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">{t("Routine")}</SelectItem>
                      <SelectItem value="urgent">{t("Urgent")}</SelectItem>
                      <SelectItem value="stat">{t("STAT")}</SelectItem>
                      <SelectItem value="asap">{t("ASAP")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicalIndication">{t("Clinical Indication *")}</Label>
                <Textarea
                  id="clinicalIndication"
                  {...form.register("clinicalIndication")}
                  placeholder={t("Reason for testing, symptoms, suspected diagnosis...")}
                  rows={3}
                />
                {form.formState.errors.clinicalIndication && (
                  <p className="text-sm text-red-500">{tAny(form.formState.errors.clinicalIndication.message)}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>{t("Lab Tests *")}</Label>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder={t("Filter by category")} />
                    </SelectTrigger>
                    <SelectContent>
                      {TEST_CATEGORIES.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {tAny(category.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="max-h-60 overflow-y-auto border rounded-lg p-4">
                  <div className="grid gap-3">
                    {filteredTests.map((test) => (
                      <div key={test.id} className="flex items-center justify-between p-3 border rounded hover:bg-muted">
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={test.id}
                            checked={selectedTests.includes(test.id)}
                            onCheckedChange={(checked) => handleTestSelection(test.id, checked as boolean)}
                          />
                          <div>
                            <Label htmlFor={test.id} className="font-medium cursor-pointer">
                              {test.name} ({test.code})
                            </Label>
                            <p className="text-sm text-muted-foreground">{tAny(test.category)} • {tAny(test.sampleType)}</p>
                            {test.fastingRequired && (
                              <Badge variant="outline" className="text-xs">{t("Fasting Required")}</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${test.price}</p>
                          <p className="text-sm text-muted-foreground">{t("{turnaroundTime}h TAT", { turnaroundTime: test.turnaroundTime })}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {form.formState.errors.tests && (
                  <p className="text-sm text-red-500">{tAny(form.formState.errors.tests.message)}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fastingRequired"
                      checked={form.watch("fastingRequired")}
                      onCheckedChange={(checked) => form.setValue("fastingRequired", checked as boolean)}
                    />
                    <Label htmlFor="fastingRequired">{t("Fasting Required")}</Label>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-lg font-semibold">
                    {t("Total Amount: ${number}", { number: calculateTotalAmount().toFixed(2) })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("{length} test(s) selected", { length: selectedTests.length })}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">{t("Notes")}</Label>
                <Textarea
                  id="notes"
                  {...form.register("notes")}
                  placeholder={t("Additional instructions or notes...")}
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOrderDialogOpen(false)}
                >
                  {t("Cancel")}
                </Button>
                <Button type="submit">
                  {t(editingOrder ? "Update Order" : "Create Order")}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {t("Order #")}{order.orderNumber}
                    <Badge className={STATUS_COLORS[order.status]}>
                      {tAny(order.status)}
                    </Badge>
                    <Badge className={PRIORITY_COLORS[order.priority]}>
                      {order.priority.toUpperCase()}
                    </Badge>
                    {order.fastingRequired && (
                      <Badge variant="outline">{t("Fasting Required")}</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {t("Patient: {patientName} (MRN: {patientMRN}) • Ordered: {toLocaleDateString} • Physician: {name}", { patientName: order.patientName, patientMRN: order.patientMRN, toLocaleDateString: fmt(order.orderDate, "PP"), name: order.orderingPhysician.name })}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {order.status === "ordered" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onCollectSample(order.id)}
                    >
                      <TestTube className="mr-2 h-4 w-4" />
                      {t("Collect Sample")}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openOrderDialog(order)}
                  >
                    {t("Edit")}
                  </Button>
                  {order.status === "ordered" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onCancelOrder(order.id, "Physician request")}
                    >
                      {t("Cancel")}
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="details" className="w-full">
                <TabsList>
                  <TabsTrigger value="details">{t("Order Details")}</TabsTrigger>
                  <TabsTrigger value="tests">{t("Tests ({length})", { length: order.tests.length })}</TabsTrigger>
                  <TabsTrigger value="timeline">{t("Timeline")}</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{t("Clinical Indication")}</p>
                      <p className="text-muted-foreground">{order.clinicalIndication}</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{t("Total Amount")}</p>
                      <p className="text-muted-foreground">${order.totalAmount.toFixed(2)}</p>
                    </div>
                    {order.collectionDate && (
                      <div>
                        <p className="font-medium text-foreground">{t("Collection Date")}</p>
                        <p className="text-muted-foreground">
                          <Clock className="inline h-4 w-4 mr-1" />
                          {fmt(order.collectionDate, "PP p")}
                        </p>
                      </div>
                    )}
                    {order.completionDate && (
                      <div>
                        <p className="font-medium text-foreground">{t("Completion Date")}</p>
                        <p className="text-muted-foreground">
                          {fmt(order.completionDate, "PP p")}
                        </p>
                      </div>
                    )}
                  </div>
                  {order.notes && (
                    <div>
                      <p className="font-medium text-foreground">{t("Notes")}</p>
                      <p className="text-muted-foreground">{order.notes}</p>
                    </div>
                  )}
                  {order.insurance && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="font-medium text-blue-900">{t("Insurance Information")}</p>
                      <p className="text-blue-800 text-sm">
                        {t("{provider} - Policy: {policyNumber}{value}", { provider: order.insurance.provider, policyNumber: order.insurance.policyNumber, value: order.insurance.groupNumber ? t(" - Group: {group}", { group: order.insurance.groupNumber }) : "" })}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="tests" className="space-y-4">
                  {order.tests.map((test, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{test.testName}</h4>
                          <p className="text-sm text-muted-foreground">{t("Code: {testCode}", { testCode: test.testCode })}</p>
                          {test.sampleId && (
                            <p className="text-sm text-muted-foreground">{t("Sample: {sampleId}", { sampleId: test.sampleId })}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge className={STATUS_COLORS[test.status]}>
                            {tAny(test.status)}
                          </Badge>
                          {test.collectedAt && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {t("Collected: {amount}", { amount: fmt(test.collectedAt, "PP p") })}
                            </p>
                          )}
                        </div>
                      </div>
                      {test.results && test.results.length > 0 && (
                        <div className="mt-3 space-y-2">
                          <h5 className="font-medium text-sm">{t("Results:")}</h5>
                          {test.results.map((result, resultIndex) => (
                            <div key={resultIndex} className="flex justify-between text-sm">
                              <span>{result.componentName}</span>
                              <span className={`font-medium ${
                                result.flag === "normal" ? "text-green-600" :
                                result.flag === "critical_high" || result.flag === "critical_low" ? "text-red-600" :
                                "text-orange-600"
                              }`}>
                                {result.value} {tAny(result.unit)} ({tAny(result.flag)})
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="timeline" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{t("Order created")}</p>
                        <p className="text-xs text-muted-foreground">
                          {t("{amount} by {name}", { amount: fmt(order.orderDate, "PP p"), name: order.orderingPhysician.name })}
                        </p>
                      </div>
                    </div>
                    
                    {order.collectionDate && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t("Sample collected")}</p>
                          <p className="text-xs text-muted-foreground">
                            {fmt(order.collectionDate, "PP p")}
                          </p>
                        </div>
                      </div>
                    )}

                    {order.completionDate && (
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{t("Tests completed")}</p>
                          <p className="text-xs text-muted-foreground">
                            {fmt(order.completionDate, "PP p")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        ))}

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">{t("No lab orders found")}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {t("Create a new lab order to get started")}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}