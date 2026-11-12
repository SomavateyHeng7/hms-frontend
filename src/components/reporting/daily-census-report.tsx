"use client";

import React, { useState } from "react";
import { format } from "date-fns";
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
import { DailyCensusReport as DailyCensusType } from "@/types/reporting";

interface DailyCensusReportProps {
  report: DailyCensusType;
  onExport: (format: string) => void;
  onRefresh: () => void;
}

export function DailyCensusReport({ report, onExport, onRefresh }: DailyCensusReportProps) {
  const [selectedView, setSelectedView] = useState("summary");

  const censusStats = [
    {
      title: "Total Patients",
      value: report.totalPatients,
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "In-Patients",
      value: report.inPatients,
      icon: Bed,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Out-Patients", 
      value: report.outPatients,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Emergency Patients",
      value: report.emergencyPatients,
      icon: TrendingUp,
      color: "text-red-600",
      bgColor: "bg-red-100"
    }
  ];

  const patientMovements = [
    {
      title: "Admitted",
      value: report.admittedPatients,
      icon: PlusCircle,
      color: "text-green-600"
    },
    {
      title: "Discharged", 
      value: report.dischargedPatients,
      icon: MinusCircle,
      color: "text-blue-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Daily Census Report</h2>
          <p className="text-muted-foreground">
            Patient census for {format(report.reportDate, "MMMM dd, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
        </div>
      </div>

      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="hourly">Hourly Breakdown</TabsTrigger>
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
                Bed Occupancy Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Overall Occupancy</span>
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
                      <p className="text-xs text-muted-foreground">Total Beds</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-green-600">
                        {report.bedOccupancy.occupiedBeds}
                      </p>
                      <p className="text-xs text-muted-foreground">Occupied</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-600">
                        {report.bedOccupancy.availableBeds}
                      </p>
                      <p className="text-xs text-muted-foreground">Available</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Patient Movements Today</h4>
                  {patientMovements.map((movement) => {
                    const Icon = movement.icon;
                    return (
                      <div key={movement.title} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
                Department Breakdown
              </CardTitle>
              <CardDescription>
                Patient distribution across departments
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
                            {dept.patientCount} patients
                          </Badge>
                          <Badge 
                            variant={dept.utilizationRate > 90 ? "destructive" : dept.utilizationRate > 75 ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {dept.utilizationRate}% capacity
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">{dept.patientCount}/{dept.capacity}</div>
                        <div className="text-xs text-muted-foreground">patients</div>
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
                Hourly Patient Flow
              </CardTitle>
              <CardDescription>
                Patient admissions, discharges, and emergency arrivals by hour
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
                      <div className="text-sm text-muted-foreground">Total Admissions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {report.hourlyBreakdown.reduce((sum, hour) => sum + hour.discharges, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Discharges</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {report.hourlyBreakdown.reduce((sum, hour) => sum + hour.emergencyArrivals, 0)}
                      </div>
                      <div className="text-sm text-muted-foreground">Emergency Arrivals</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {report.hourlyBreakdown.map((hourData) => (
                      <div key={hourData.hour} className="grid grid-cols-4 gap-4 p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium">
                          {hourData.hour.toString().padStart(2, "0")}:00
                        </div>
                        <div className="text-center">
                          <div className="text-green-600 font-medium">+{hourData.admissions}</div>
                          <div className="text-xs text-muted-foreground">Admissions</div>
                        </div>
                        <div className="text-center">
                          <div className="text-blue-600 font-medium">-{hourData.discharges}</div>
                          <div className="text-xs text-muted-foreground">Discharges</div>
                        </div>
                        <div className="text-center">
                          <div className="text-red-600 font-medium">{hourData.emergencyArrivals}</div>
                          <div className="text-xs text-muted-foreground">Emergency</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="mx-auto h-12 w-12 mb-4" />
                  <p>Hourly breakdown data not available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}