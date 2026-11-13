"use client";

import React, { useState } from "react";
import { subDays, subMonths } from "date-fns";
import { 
  BarChart3,
  FileText,
  Activity,
  Users,
  Calendar,
  Download,
  Filter,
  Settings,
  Plus,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

import { DailyCensusReport } from "@/features/admin/reporting/components/daily-census-report";
import { ClinicalReports } from "@/features/admin/reporting/components/clinical-reports";
import { CustomDashboards } from "@/features/admin/reporting/components/custom-dashboards";

// Import types
import { 
  DailyCensusReport as DailyCensusType,
  ClinicalReport,
  CustomDashboard
} from "@/features/admin/reporting/types";
import { useTabParam } from "@/hooks/use-tab-param";
import { useDateFormat, useT, useTranslateAny } from "@/lib/i18n/messages";
import { REPORTING_KM } from "@/features/admin/reporting/km";

interface ReportingAnalyticsProps {
  dailyCensus: DailyCensusType;
  clinicalReports: ClinicalReport[];
  customDashboards: CustomDashboard[];
}

export function ReportingAnalytics({
  dailyCensus,
  clinicalReports,
  customDashboards
}: ReportingAnalyticsProps) {
  const t = useT(REPORTING_KM);
  const tAny = useTranslateAny(REPORTING_KM);
  const fmt = useDateFormat();
  const [activeTab, setActiveTab] = useTabParam("overview", ["overview", "census", "clinical"] as const);
  const [selectedDateRange, setSelectedDateRange] = useState("today");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Quick metrics for overview
  const quickMetrics = [
    {
      title: t("Total Patients Today"),
      value: dailyCensus.totalPatients,
      change: "+12%",
      trend: "up" as const,
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: t("Bed Occupancy"),
      value: `${dailyCensus.bedOccupancy.occupancyRate}%`,
      change: "+5%",
      trend: "up" as const,
      icon: Building2,
      color: "text-green-600"
    }
  ];

  const recentAlerts = [
    {
      id: "1",
      type: "critical",
      message: t("ICU bed capacity at 95%"),
      timestamp: new Date(),
      department: "ICU"
    },
    {
      id: "3",
      type: "info",
      message: t("Monthly reports generated successfully"),
      timestamp: subDays(new Date(), 2),
      department: "Administration"
    }
  ];

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-l-red-500 bg-red-50";
      case "warning":
        return "border-l-yellow-500 bg-yellow-50";
      case "info":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-500 bg-muted/50";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("Reporting & Analytics")}</h1>
          <p className="text-muted-foreground">
            {t("Comprehensive reports and insights for hospital operations")}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            {t("Filters")}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            {t("Export")}
          </Button>
          <Button size="sm">
            <Plus className="mr-2 h-4 w-4" />
            {t("New Report")}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
          <TabsTrigger value="census">{t("Census")}</TabsTrigger>
          <TabsTrigger value="clinical">{t("Clinical")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quickMetrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <Card key={metric.title}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {metric.title}
                        </p>
                        <p className="text-2xl font-bold">{metric.value}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {metric.trend === "up" ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span className={`text-xs ${
                            metric.trend === "up" ? "text-green-600" : "text-red-600"
                          }`}>
                            {metric.change}
                          </span>
                        </div>
                      </div>
                      <Icon className={`h-8 w-8 ${metric.color}`} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 gap-6">
            {/* Patient Flow Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  {t("Patient Flow (Last 7 Days)")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  {t("[Patient Flow Chart Placeholder]")}
                </div>
              </CardContent>
            </Card>

          </div>

          {/* Department Performance & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Department Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-purple-500" />
                  {t("Department Performance")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dailyCensus.departmentBreakdown.slice(0, 5).map((dept) => (
                    <div key={dept.departmentId} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{dept.departmentName}</span>
                        <span className="text-sm text-muted-foreground">
                          {dept.patientCount}/{dept.capacity}
                        </span>
                      </div>
                      <Progress value={dept.utilizationRate} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {t("{utilizationRate}% utilization", { utilizationRate: dept.utilizationRate })}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  {t("Recent Alerts")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={`p-3 border-l-4 rounded-r-md ${getAlertColor(alert.type)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {tAny(alert.department)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {fmt(alert.timestamp, "MMM dd, HH:mm")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full mt-2">
                    {t("View All Alerts")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="census">
          <DailyCensusReport 
            report={dailyCensus}
            onExport={(format) => console.log("Export census report as", format)}
            onRefresh={() => console.log("Refresh census report")}
          />
        </TabsContent>

        <TabsContent value="clinical">
          <ClinicalReports 
            reports={clinicalReports}
            onGenerateReport={(data) => console.log("Generate clinical report", data)}
            onExportReport={(id, format) => console.log("Export clinical report", id, format)}
          />
        </TabsContent>




      </Tabs>

      {/* Quick Actions Footer */}
      <div className="border-t pt-4">
        <div className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {t("Last updated: {date}", { date: fmt(new Date(), "MMM dd, yyyy 'at' HH:mm") })}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              {t("Configure")}
            </Button>
            <Button variant="outline" size="sm">
              <Eye className="mr-2 h-4 w-4" />
              {t("Custom Dashboard")}
            </Button>
            <Button size="sm">
              <Calendar className="mr-2 h-4 w-4" />
              {t("Schedule Reports")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}