"use client";

import React, { useState } from "react";
import { 
  Users, 
  Bed, 
  TrendingUp, 
  Download, 
  RefreshCw, 
  Activity,
  Building2,
  Clock,
  PlusCircle,
  MinusCircle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DailyCensusReport as DailyCensusType } from "@/features/admin/reporting/types";
import { useDateFormat, useT } from "@/lib/i18n/messages";
import { REPORTING_KM } from "@/features/admin/reporting/km";

interface DailyCensusReportProps {
  report: DailyCensusType;
  onExport: (format: string) => void;
  onRefresh: () => void;
}

export function DailyCensusReport({ report, onExport, onRefresh }: DailyCensusReportProps) {
  const t = useT(REPORTING_KM);
  const fmt = useDateFormat();
  const [selectedView, setSelectedView] = useState("summary");

  const censusStats = [
    {
      title: t("Total Patients"),
      value: report.totalPatients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: t("In-Patients"),
      value: report.inPatients,
      icon: Bed,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: t("Out-Patients"), 
      value: report.outPatients,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: t("Emergency Patients"),
      value: report.emergencyPatients,
      icon: TrendingUp,
      color: "text-red-600",
      bgColor: "bg-red-100"
    }
  ];

  const patientMovements = [
    {
      title: t("Admitted"),
      value: report.admittedPatients,
      icon: PlusCircle,
      color: "text-green-600"
    },
    {
      title: t("Discharged"), 
      value: report.dischargedPatients,
      icon: MinusCircle,
      color: "text-blue-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">{t("Daily Census Report")}</h2>
          <p className="text-muted-foreground">
            {t("Patient census for {reportDate}", { reportDate: fmt(report.reportDate, "MMMM dd, yyyy") })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {t("Refresh")}
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            {t("Export PDF")}
          </Button>
        </div>
      </div>

      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList>
          <TabsTrigger value="summary">{t("Summary")}</TabsTrigger>
          <TabsTrigger value="departments">{t("Departments")}</TabsTrigger>
          <TabsTrigger value="hourly">{t("Hourly Breakdown")}</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          {/* Census Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {censusStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-3xl font-bold">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-full ${stat.bgColor}`}>
                        <Icon className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Bed Occupancy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-green-600" />
                {t("Bed Occupancy Status")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{t("Overall Occupancy")}</span>
                    <span className="text-2xl font-bold">
                      {report.bedOccupancy.occupancyRate}%
                    </span>
                  </div>
                  <Progress value={report.bedOccupancy.occupancyRate} className="h-3" />
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-bold text-blue-600">
                        {report.bedOccupancy.totalBeds}
                      </p>
                      <p className="text-xs text-muted-foreground">{t("Total Beds")}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {report.bedOccupancy.occupiedBeds}
                      </p>
                      <p className="text-xs text-muted-foreground">{t("Occupied")}</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-muted-foreground">
                        {report.bedOccupancy.availableBeds}
                      </p>
                      <p className="text-xs text-muted-foreground">{t("Available")}</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">{t("Patient Movements Today")}</h4>
                  {patientMovements.map((movement) => {
                    const Icon = movement.icon;
                    return (
                      <div key={movement.title} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Icon className={`h-5 w-5 ${movement.color}`} />
                          <span className="font-medium">{movement.title}</span>
                        </div>
                        <span className="text-xl font-bold">{movement.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                {t("Department Breakdown")}
              </CardTitle>
              <CardDescription>
                {t("Patient distribution across departments")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.departmentBreakdown.map((dept) => (
                  <div key={dept.departmentId} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium">{dept.departmentName}</span>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {t("{patientCount} patients", { patientCount: dept.patientCount })}</Badge>
                          <Badge 
                            variant={dept.utilizationRate > 90 ? "destructive" : dept.utilizationRate > 75 ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {t("{utilizationRate}% capacity", { utilizationRate: dept.utilizationRate })}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{dept.patientCount}/{dept.capacity}</div>
                        <div className="text-xs text-muted-foreground">{t("patients")}</div>
                      </div>
                    </div>
                    <Progress value={dept.utilizationRate} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hourly" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-orange-600" />
                {t("Hourly Patient Flow")}
              </CardTitle>
              <CardDescription>
                {t("Patient admissions, discharges, and emergency arrivals by hour")}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {report.hourlyBreakdown ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {report.hourlyBreakdown.reduce((sum, hour) => sum + hour.admissions, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">{t("Total Admissions")}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {report.hourlyBreakdown.reduce((sum, hour) => sum + hour.discharges, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">{t("Total Discharges")}</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {report.hourlyBreakdown.reduce((sum, hour) => sum + hour.emergencyArrivals, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">{t("Emergency Arrivals")}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {report.hourlyBreakdown.map((hourData) => (
                      <div key={hourData.hour} className="grid grid-cols-4 gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="font-medium">
                          {hourData.hour.toString().padStart(2, "0")}:00
                        </div>
                        <div className="text-center">
                          <div className="text-green-600 font-medium">+{hourData.admissions}</div>
                          <div className="text-xs text-muted-foreground">{t("Admissions")}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-600 font-medium">-{hourData.discharges}</div>
                          <div className="text-xs text-muted-foreground">{t("Discharges")}</div>
                        </div>
                        <div className="text-center">
                          <div className="text-red-600 font-medium">{hourData.emergencyArrivals}</div>
                          <div className="text-xs text-muted-foreground">{t("Emergency")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="mx-auto h-12 w-12 mb-4" />
                  <p>{t("Hourly breakdown data not available")}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}