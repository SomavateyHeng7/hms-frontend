"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTabParam } from "@/hooks/use-tab-param";
import { LaboratoryDashboard } from "./laboratory-dashboard";
import { LabOrders } from "./lab-orders";
import { SampleTracking } from "./sample-tracking";
import { TestResultEntry } from "./test-result-entry";
import { EquipmentIntegration } from "./equipment-integration";
import { AutomatedNotifications } from "./automated-notifications";

const TABS = ["overview", "orders", "samples", "results", "equipment", "notifications"] as const;

// Placeholder handlers until the mock data layer (roadmap Phase 1) is in place.
const noop = async (...args: unknown[]) => {
  console.info("[laboratory]", ...args);
};

export function LaboratoryManagement() {
  const [tab, setTab] = useTabParam("overview", TABS);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Laboratory</h1>
        <p className="text-muted-foreground">Orders, samples, results and equipment</p>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="flex w-full flex-wrap h-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="samples">Samples</TabsTrigger>
          <TabsTrigger value="results">Results</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <LaboratoryDashboard
            tests={[]}
            orders={[]}
            samples={[]}
            results={[]}
            reports={[]}
            equipment={[]}
            qualityControls={[]}
            onRefreshData={() => noop("refresh")}
          />
        </TabsContent>

        <TabsContent value="orders">
          <LabOrders
            orders={[]}
            tests={[]}
            patients={[]}
            physicians={[]}
            onCreateOrder={(data) => noop("create order", data)}
            onUpdateOrder={(id, data) => noop("update order", id, data)}
            onCancelOrder={(id, reason) => noop("cancel order", id, reason)}
            onCollectSample={() => setTab("samples")}
          />
        </TabsContent>

        <TabsContent value="samples">
          <SampleTracking
            samples={[]}
            onCollectSample={(data) => noop("collect sample", data)}
            onReceiveSample={(id) => noop("receive sample", id)}
            onRejectSample={(id, reason) => noop("reject sample", id, reason)}
            onUpdateLocation={(id, location) => noop("move sample", id, location)}
            onGenerateBarcode={(id) => id}
          />
        </TabsContent>

        <TabsContent value="results">
          <TestResultEntry
            results={[]}
            reports={[]}
            onEnterResult={(data) => noop("enter result", data)}
            onValidateResult={(id, by, comments) => noop("validate result", id, by, comments)}
            onCreateReport={(data) => noop("create report", data)}
            onHandleCriticalValue={(data) => noop("critical value", data)}
            onDownloadReport={(id) => noop("download report", id)}
            onPrintReport={(id) => noop("print report", id)}
            onSendReport={(id, method, recipient) => noop("send report", id, method, recipient)}
          />
        </TabsContent>

        <TabsContent value="equipment">
          <EquipmentIntegration
            equipment={[]}
            qualityControls={[]}
            onPerformQC={(data) => noop("quality control", data)}
            onScheduleMaintenance={(id, data) => noop("schedule maintenance", id, data)}
            onConnectEquipment={(id) => noop("connect", id)}
            onDisconnectEquipment={(id) => noop("disconnect", id)}
            onCalibrateEquipment={(id) => noop("calibrate", id)}
          />
        </TabsContent>

        <TabsContent value="notifications">
          <AutomatedNotifications
            results={[]}
            reports={[]}
            notifications={[]}
            rules={[]}
            onCreateRule={(rule) => noop("create rule", rule)}
            onUpdateRule={(id, updates) => noop("update rule", id, updates)}
            onDeleteRule={(id) => noop("delete rule", id)}
            onSendNotification={(n) => noop("send notification", n)}
            onAcknowledgeNotification={(id) => noop("acknowledge", id)}
            onRetryNotification={(id) => noop("retry", id)}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
