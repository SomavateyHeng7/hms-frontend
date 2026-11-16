"use client";

import React, { useMemo, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTabParam } from "@/hooks/use-tab-param";
import { LaboratoryDashboard } from "@/components/laboratory/laboratory-dashboard";
import { LabOrders } from "@/components/laboratory/lab-orders";
import { SampleTracking } from "@/components/laboratory/sample-tracking";
import { TestResultEntry } from "@/components/laboratory/test-result-entry";
import { EquipmentIntegration } from "@/components/laboratory/equipment-integration";
import { AutomatedNotifications } from "@/components/laboratory/automated-notifications";
import { toast } from "sonner";
import { useClinicalData } from "@/lib/clinical-store";
import { PatientFilterBanner, useSelectedPatient } from "@/components/layout/patient-filter-banner";
import { mockLabTests } from "@/mocks/lab-tests";
import type { LabOrderFormData, LabReportFormData, CriticalValueFormData } from "@/lib/validations/laboratory";
import { printDocument, labReportHtml } from "@/lib/print";
import { isCriticalResult } from "@/lib/clinical-store";
import { useAccess } from "@/lib/access";
import { RoleNotice } from "@/components/layout/role-notice";
import type {
  LabOrder,
  LabSample,
  LabTestResult,
  LabReport,
  LabEquipment,
  QualityControl,
} from "@/types/laboratory";

export function LaboratoryManagement() {
  const [activeTab, setActiveTab] = useTabParam("dashboard", ["dashboard", "orders", "samples", "results", "equipment", "notifications"]);

  // Placeholder data - to be replaced by API calls once the backend exists
  const {
    patients: clinicalPatients,
    labOrders,
    labResults,
    labReports,
    criticalAcknowledgements,
    addLabOrder,
    cancelLabOrder,
    addLabResult,
    validateLabResult,
    acknowledgeCritical,
    addLabReport,
  } = useClinicalData();
  const { user, can, log: audit } = useAccess();
  const selectedPatient = useSelectedPatient();
  const tests = mockLabTests;
  const orders: LabOrder[] = selectedPatient
    ? labOrders.filter((o) => o.patientId === selectedPatient.id)
    : labOrders;
  const samples: LabSample[] = [];
  const results: LabTestResult[] = selectedPatient
    ? labResults.filter((r) => r.patientId === selectedPatient.id)
    : labResults;
  const reports: LabReport[] = selectedPatient
    ? labReports.filter((r) => r.patientId === selectedPatient.id)
    : labReports;
  const acknowledgedResultIds = useMemo(() => Object.keys(criticalAcknowledgements), [criticalAcknowledgements]);
  const orderOptions = labOrders.map((o) => ({ id: o.id, orderNumber: o.orderNumber, patientName: o.patientName }));
  const equipment: LabEquipment[] = [];
  const qualityControls: QualityControl[] = [];
  const patients = clinicalPatients.map((p) => ({
    id: p.id,
    name: `${p.firstName} ${p.lastName}`,
    mrn: p.patientId,
    dob: p.dateOfBirth,
    gender: p.gender,
  }));
  const physicians: { id: string; name: string; department: string; license: string }[] = [];

  const deny = (message: string) => {
    toast.error(message);
    throw new Error(message);
  };

  const handleCreateOrder = async (data: LabOrderFormData) => {
    if (!can("labOrder.create")) deny("Your role can't create lab orders");
    const order = addLabOrder(data, tests);
    if (order) {
      toast.success(`Lab order ${order.orderNumber} created`, {
        description: `${order.tests.length} test(s) for ${order.patientName}`,
      });
    } else {
      toast.error("Could not create lab order", { description: "Patient not found." });
    }
  };

  const handleCancelOrder = async (id: string, reason: string) => {
    if (!can("labOrder.cancel")) deny("Your role can't cancel lab orders");
    if (!cancelLabOrder(id)) deny("Could not cancel the order");
    toast.success("Lab order cancelled", { description: reason });
  };

  const handleEnterResult = async (data: LabTestResult) => {
    if (!can("labResult.enter")) deny("Your role can't enter lab results");
    const result = addLabResult(data);
    if (!result) {
      toast.error("Order not found", { description: "Enter an existing order number, e.g. LAB00001." });
      throw new Error("Order not found");
    }
    if (isCriticalResult(result)) {
      toast.warning("Critical value entered", {
        description: `${result.testCode} ${result.value} ${result.unit} — notify the provider and record it.`,
        duration: 10000,
      });
    } else {
      toast.success("Result entered", { description: `${result.testCode}: ${result.value} ${result.unit}` });
    }
  };

  // The validator is always the signed-in user; the screen's own "validatedBy" text is ignored.
  const handleValidateResult = async (resultId: string, _validatedBy: string, comments?: string) => {
    const outcome = validateLabResult(resultId, comments);
    if (outcome === "ok") toast.success("Result validated");
    else if (outcome === "self_validation")
      toast.error("You entered this result", { description: "A different technician must validate it." });
    else if (outcome === "denied") toast.error("Your role can't validate lab results");
    else toast.error("Result not found");
  };

  const handleCriticalValue = async (data: CriticalValueFormData) => {
    if (!can("criticalValue.acknowledge")) deny("Your role can't record critical-value notifications");
    if (!acknowledgeCritical(data)) {
      toast.error("Could not record notification", { description: "Result not found." });
      throw new Error("Result not found");
    }
    toast.success("Critical value acknowledged", {
      description: `${data.notifiedPerson} notified by ${data.notificationMethod}`,
    });
  };

  const handleCreateReport = async (data: LabReportFormData) => {
    if (!can("labReport.create")) deny("Your role can't create lab reports");
    const report = addLabReport(data);
    if (!report) {
      toast.error("Order not found", { description: "Enter an existing order number, e.g. LAB00001." });
      throw new Error("Order not found");
    }
    toast.success(`Report ${report.reportNumber} generated`);
  };

  const printReport = async (reportId: string) => {
    const report = labReports.find((r) => r.id === reportId);
    if (!report) {
      toast.error("Report not found");
      return;
    }
    if (!can("labReport.print")) {
      toast.error("Your role can't print lab reports");
      return;
    }
    audit({
      action: "document.print",
      entityType: "lab_report",
      entityId: report.reportNumber,
      patientId: report.patientId,
      patientName: report.patientName,
      summary: `Printed lab report ${report.reportNumber}`,
    });
    printDocument(labReportHtml(report, { printedBy: user ? `${user.name}` : undefined }));
  };

  const limits = [
    !can("labOrder.create") && "you can't create lab orders",
    !can("labResult.enter") && "you can't enter results",
    !can("labResult.validate") && "you can't validate results",
  ].filter(Boolean) as string[];

  // Placeholder handlers
  const log = (name: string) => async (...args: unknown[]) => {
    console.log(name, ...args);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {user && <RoleNotice role={user.role} limits={limits} />}
      <PatientFilterBanner />
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="samples">Samples</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="equipment">Equipment & QC</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <LaboratoryDashboard
            tests={tests}
            orders={orders}
            samples={samples}
            results={results}
            reports={reports}
            equipment={equipment}
            qualityControls={qualityControls}
            onRefreshData={log("refresh data")}
          />
        </TabsContent>

        <TabsContent value="orders">
          <LabOrders
            orders={orders}
            tests={tests}
            patients={patients}
            physicians={physicians}
            onCreateOrder={handleCreateOrder}
            onUpdateOrder={log("update order")}
            onCancelOrder={handleCancelOrder}
            defaultPatientId={selectedPatient?.id}
            canCreate={can("labOrder.create")}
            canCancel={can("labOrder.cancel")}
            onCollectSample={(orderId) => {
              console.log("collect sample for order", orderId);
              setActiveTab("samples");
            }}
          />
        </TabsContent>

        <TabsContent value="samples">
          <SampleTracking
            samples={samples}
            onCollectSample={log("collect sample")}
            onReceiveSample={log("receive sample")}
            onRejectSample={log("reject sample")}
            onUpdateLocation={log("update sample location")}
            onGenerateBarcode={(sampleId) => sampleId}
          />
        </TabsContent>

        <TabsContent value="results">
          <TestResultEntry
            results={results}
            reports={reports}
            onEnterResult={handleEnterResult}
            onValidateResult={handleValidateResult}
            onCreateReport={handleCreateReport}
            onHandleCriticalValue={handleCriticalValue}
            onDownloadReport={printReport}
            onPrintReport={printReport}
            onSendReport={async () => {
              toast.info("Sending reports isn't available in the demo yet");
            }}
            canEnterResults={can("labResult.enter")}
            canValidate={can("labResult.validate")}
            canAcknowledge={can("criticalValue.acknowledge")}
            canCreateReport={can("labReport.create")}
            acknowledgedResultIds={acknowledgedResultIds}
            orderOptions={orderOptions}
          />
        </TabsContent>

        <TabsContent value="equipment">
          <EquipmentIntegration
            equipment={equipment}
            qualityControls={qualityControls}
            onPerformQC={log("perform QC")}
            onScheduleMaintenance={log("schedule maintenance")}
            onConnectEquipment={log("connect equipment")}
            onDisconnectEquipment={log("disconnect equipment")}
            onCalibrateEquipment={log("calibrate equipment")}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <AutomatedNotifications
            results={results}
            reports={reports}
            notifications={[]}
            rules={[]}
            onCreateRule={log("create rule")}
            onUpdateRule={log("update rule")}
            onDeleteRule={log("delete rule")}
            onSendNotification={log("send notification")}
            onAcknowledgeNotification={log("acknowledge notification")}
            onRetryNotification={log("retry notification")}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
