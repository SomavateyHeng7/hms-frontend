"use client";

import { averageOf } from "@/lib/utils";
import React, { useState } from "react";
import { format } from "date-fns";
import { 
  Clock, 
  Activity,
  TrendingUp,
  TrendingDown,
  Bed,
  Monitor,
  Download,
  Filter,
  BarChart3,
  Zap,
  AlertTriangle
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ResourceUtilizationReport as ResourceUtilizationData } from "@/types/reporting";

interface ResourceUtilizationReportProps {
  report: ResourceUtilizationData;
  onExport: (format: string) => void;
  onDrillDown: (resourceId: string, type: "room" | "equipment" | "staff") => void;
}

export function ResourceUtilizationReport({ report, onExport, onDrillDown }: ResourceUtilizationReportProps) {
  const [selectedView, setSelectedView] = useState("overview");

  const utilizationStats = [
    {
      title: "Room Utilization",
      value: `${averageOf(report.rooms.map((room) => room.utilizationRate))}%`,
      icon: Bed,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Equipment Utilization", 
      value: `${averageOf(report.equipment.map((eq) => eq.utilizationRate))}%`,
      icon: Monitor,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Staff Efficiency",
      value: `${averageOf(report.staffUtilization.map((staff) => staff.utilizationRate))}%`,
      icon: Activity,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Energy Efficiency",
      value: `${report.energyUsage.efficiencyScore}%`,
      icon: Zap,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    }
  ];

  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getUtilizationBadge = (rate: number) => {
    if (rate >= 80) return { color: "default", label: "High" };
    if (rate >= 60) return { color: "secondary", label: "Medium" };
    return { color: "destructive", label: "Low" };
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Resource Utilization</h2>
          <p className="text-muted-foreground">
            Resource efficiency analysis for {format(report.reportDate, "MMMM dd, yyyy")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExport("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={selectedView} onValueChange={setSelectedView}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="rooms">Rooms</TabsTrigger>
          <TabsTrigger value="equipment">Equipment</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
          <TabsTrigger value="energy">Energy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Utilization Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {utilizationStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.title}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">
                          {stat.title}
                        </p>
                        <p className="text-2xl font-bold">{stat.value}</p>
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

          {/* Resource Performance Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Bed className="h-5 w-5" />
                  Room Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.rooms
                    .sort((a, b) => b.utilizationRate - a.utilizationRate)
                    .slice(0, 5)
                    .map((room) => {
                      const badge = getUtilizationBadge(room.utilizationRate);
                      return (
                        <div key={room.roomId} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{room.roomNumber}</div>
                            <div className="text-xs text-muted-foreground capitalize">
                              {room.type.replace("_", " ")}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={badge.color as any} className="text-xs">
                              {room.utilizationRate}%
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDrillDown(room.roomId, "room")}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Monitor className="h-5 w-5" />
                  Equipment Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.equipment
                    .sort((a, b) => b.utilizationRate - a.utilizationRate)
                    .slice(0, 5)
                    .map((equipment) => {
                      const badge = getUtilizationBadge(equipment.utilizationRate);
                      return (
                        <div key={equipment.equipmentId} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{equipment.equipmentName}</div>
                            <div className="text-xs text-muted-foreground">
                              {equipment.type}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={badge.color as any} className="text-xs">
                              {equipment.utilizationRate}%
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDrillDown(equipment.equipmentId, "equipment")}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Activity className="h-5 w-5" />
                  Staff Efficiency
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.staffUtilization
                    .sort((a, b) => b.utilizationRate - a.utilizationRate)
                    .slice(0, 5)
                    .map((staff) => {
                      const badge = getUtilizationBadge(staff.utilizationRate);
                      return (
                        <div key={staff.staffId} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-sm">{staff.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {staff.role} • {staff.department}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={badge.color as any} className="text-xs">
                              {staff.utilizationRate}%
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDrillDown(staff.staffId, "staff")}
                            >
                              View
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rooms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-blue-600" />
                Room Utilization Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.rooms
                  .sort((a, b) => b.utilizationRate - a.utilizationRate)
                  .map((room) => (
                    <div key={room.roomId} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium flex items-center gap-2">
                            {room.roomNumber}
                            <Badge variant="outline" className="text-xs capitalize">
                              {room.type.replace("_", " ")}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>Used: {room.hoursUsed}h</span>
                            <span>Available: {room.hoursAvailable}h</span>
                            <span>Maintenance: {room.maintenanceHours}h</span>
                            <span>Cleaning: {room.cleaningTime}h</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getUtilizationColor(room.utilizationRate)}`}>
                            {room.utilizationRate}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${room.revenue.toLocaleString()} revenue
                          </div>
                        </div>
                      </div>
                      <Progress value={room.utilizationRate} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Utilization Rate</span>
                        <span>Revenue per hour: ${Math.round(room.revenue / Math.max(room.hoursUsed, 1))}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equipment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-green-600" />
                Equipment Utilization Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.equipment
                  .sort((a, b) => b.utilizationRate - a.utilizationRate)
                  .map((equipment) => (
                    <div key={equipment.equipmentId} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{equipment.equipmentName}</div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>Type: {equipment.type}</span>
                            <span>Used: {equipment.hoursUsed}h</span>
                            <span>Available: {equipment.hoursAvailable}h</span>
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            {equipment.maintenanceStatus === "due" && (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="w-3 h-3 mr-1" />
                                Maintenance Due
                              </Badge>
                            )}
                            {equipment.utilizationRate < 30 && (
                              <Badge variant="secondary" className="text-xs">
                                Underutilized
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getUtilizationColor(equipment.utilizationRate)}`}>
                            {equipment.utilizationRate}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${equipment.revenue.toLocaleString()} revenue
                          </div>
                        </div>
                      </div>
                      <Progress value={equipment.utilizationRate} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Efficiency: {equipment.efficiency}%</span>
                        <span>Next maintenance: {equipment.nextMaintenance}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-purple-600" />
                Staff Utilization Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.staffUtilization
                  .sort((a, b) => b.utilizationRate - a.utilizationRate)
                  .map((staff) => (
                    <div key={staff.staffId} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{staff.name}</div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{staff.role}</span>
                            <span>{staff.department}</span>
                            <span>Shift: {staff.shift}</span>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>Worked: {staff.hoursWorked}h</span>
                            <span>Scheduled: {staff.hoursScheduled}h</span>
                            <span>Overtime: {staff.overtimeHours}h</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${getUtilizationColor(staff.utilizationRate)}`}>
                            {staff.utilizationRate}%
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Productivity: {staff.productivityScore}%
                          </div>
                        </div>
                      </div>
                      <Progress value={staff.utilizationRate} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Patient interactions: {staff.patientInteractions}</span>
                        <span>Satisfaction: {staff.satisfactionScore}/5</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="energy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-600" />
                Energy Usage Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div>
                      <div className="font-medium">Total Energy Used</div>
                      <div className="text-sm text-muted-foreground">
                        This reporting period
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-yellow-600">
                      {report.energyUsage.totalUsage.toLocaleString()} kWh
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div>
                      <div className="font-medium">Efficiency Score</div>
                      <div className="text-sm text-muted-foreground">
                        vs industry average
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {report.energyUsage.efficiencyScore}%
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <div className="font-medium">Cost Savings</div>
                      <div className="text-sm text-muted-foreground">
                        From efficiency measures
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-blue-600">
                      ${report.energyUsage.costSavings.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Department Usage Breakdown</h4>
                  {report.energyUsage.departmentUsage.map((dept) => (
                    <div key={dept.department} className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">{dept.department}</span>
                        <span className="text-sm">{dept.usage.toLocaleString()} kWh</span>
                      </div>
                      <Progress value={dept.percentage} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{dept.percentage}% of total</span>
                        <span>${dept.cost.toLocaleString()} cost</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2 text-blue-800">
                  <Zap className="h-4 w-4" />
                  <span className="font-medium">Energy Efficiency Recommendations</span>
                </div>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Consider LED lighting upgrades in departments with high usage</li>
                  <li>• Implement smart HVAC scheduling during off-peak hours</li>
                  <li>• Review equipment usage patterns to identify optimization opportunities</li>
                  <li>• Install motion sensors in low-traffic areas</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}