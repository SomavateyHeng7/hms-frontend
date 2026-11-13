"use client";

import React, { useState, useEffect } from "react";
import { 
  Activity, 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Users, 
  FlaskConical, 
  AlertTriangle,
  CheckCircle,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Target,
  Zap
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { LabTest, LabOrder, LabSample, LabTestResult, LabReport, LabEquipment, QualityControl } from "@/features/diagnostics/laboratory/types";

interface LaboratoryDashboardProps {
  tests: LabTest[];
  orders: LabOrder[];
  samples: LabSample[];
  results: LabTestResult[];
  reports: LabReport[];
  equipment: LabEquipment[];
  qualityControls: QualityControl[];
  onRefreshData: () => Promise<void>;
}

interface DashboardStats {
  todayOrders: number;
  pendingSamples: number;
  pendingResults: number;
  completedTests: number;
  averageTurnaroundTime: number;
  criticalValues: number;
  equipmentStatus: {
    operational: number;
    maintenance: number;
    outOfService: number;
  };
  qcPassRate: number;
}

interface TrendData {
  period: string;
  orders: number;
  completedTests: number;
  turnaroundTime: number;
  criticalValues: number;
}

const PRIORITY_COLORS = {
  routine: 'bg-green-100 text-green-800',
  urgent: 'bg-yellow-100 text-yellow-800', 
  stat: 'bg-red-100 text-red-800',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  collected: 'bg-blue-100 text-blue-800',
  processing: 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function LaboratoryDashboard({
  tests,
  orders,
  samples,
  results,
  reports,
  equipment,
  qualityControls,
  onRefreshData,
}: LaboratoryDashboardProps) {
  const [dateRange, setDateRange] = useState("today");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [trends, setTrends] = useState<TrendData[]>([]);

  useEffect(() => {
    calculateStats();
    generateTrendData();
  }, [orders, samples, results, equipment, qualityControls, dateRange]);

  const calculateStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter data based on date range
    let startDate = new Date(today);
    if (dateRange === "week") {
      startDate.setDate(today.getDate() - 7);
    } else if (dateRange === "month") {
      startDate.setMonth(today.getMonth() - 1);
    }

    const filteredOrders = orders.filter(order => 
      new Date(order.orderDate) >= startDate
    );
    const filteredResults = results.filter(result => 
      new Date(result.enteredAt) >= startDate
    );
    const todayQCs = qualityControls.filter(qc => 
      new Date(qc.date) >= today
    );

    const todayOrders = orders.filter(order => 
      new Date(order.orderDate) >= today
    ).length;

    const pendingSamples = samples.filter(sample => 
      sample.status === "received" || sample.status === "collected"
    ).length;

    const pendingResults = results.filter(result => 
      result.status === "preliminary"
    ).length;

    const completedTests = results.filter(result => 
      result.status === "final" && new Date(result.enteredAt) >= startDate
    ).length;

    const criticalValues = results.filter(result => 
      (result.flag === "critical_high" || result.flag === "critical_low") && new Date(result.enteredAt) >= startDate
    ).length;

    // Calculate average turnaround time
    const completedOrders = filteredOrders.filter(order => order.status === "completed");
    const avgTurnaround = completedOrders.length > 0 
      ? completedOrders.reduce((sum, order) => {
          const orderTime = new Date(order.orderDate).getTime();
          const completionTime = new Date(order.completionDate || order.orderDate).getTime();
          return sum + ((completionTime - orderTime) / (1000 * 60 * 60)); // Hours
        }, 0) / completedOrders.length
      : 0;

    // Equipment status
    const equipmentStatus = {
      operational: equipment.filter(eq => eq.status === "operational").length,
      maintenance: equipment.filter(eq => eq.status === "maintenance" || eq.status === "calibration").length,
      outOfService: equipment.filter(eq => eq.status === "out_of_service").length,
    };

    // QC pass rate
    const qcPassRate = todayQCs.length > 0 
      ? (todayQCs.filter(qc => qc.status === "pass").length / todayQCs.length) * 100
      : 0;

    setStats({
      todayOrders,
      pendingSamples,
      pendingResults,
      completedTests,
      averageTurnaroundTime: avgTurnaround,
      criticalValues,
      equipmentStatus,
      qcPassRate,
    });
  };

  const generateTrendData = () => {
    const periods = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);

      const dayOrders = orders.filter(order => {
        const orderDate = new Date(order.orderDate);
        return orderDate >= dayStart && orderDate <= dayEnd;
      }).length;

      const dayCompleted = results.filter(result => {
        const resultDate = new Date(result.enteredAt);
        return resultDate >= dayStart && resultDate <= dayEnd && result.status === "final";
      }).length;

      const dayCritical = results.filter(result => {
        const resultDate = new Date(result.enteredAt);
        return resultDate >= dayStart && resultDate <= dayEnd && (result.flag === "critical_high" || result.flag === "critical_low");
      }).length;

      periods.push({
        period: dateStr,
        orders: dayOrders,
        completedTests: dayCompleted,
        turnaroundTime: Math.random() * 4 + 2, // Mock data for demo
        criticalValues: dayCritical,
      });
    }
    
    setTrends(periods);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await onRefreshData();
    } finally {
      setRefreshing(false);
    }
  };

  const getStatusColor = (status: string) => STATUS_COLORS[status as keyof typeof STATUS_COLORS] || "bg-gray-100 text-gray-800";
  const getPriorityColor = (priority: string) => PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS] || "bg-gray-100 text-gray-800";

  const recentOrders = orders
    .filter(order => new Date(order.orderDate) >= new Date(Date.now() - 24 * 60 * 60 * 1000))
    .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
    .slice(0, 5);

  const criticalResults = results
    .filter(result => (result.flag === "critical_high" || result.flag === "critical_low") && result.status !== "cancelled")
    .sort((a, b) => new Date(b.enteredAt).getTime() - new Date(a.enteredAt).getTime())
    .slice(0, 5);

  const equipmentAlerts = equipment
    .filter(eq => eq.status !== "operational" || new Date(eq.nextMaintenance) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000))
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Laboratory Dashboard</h1>
          <p className="text-gray-600">Real-time overview of laboratory operations</p>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today's Orders</p>
                <p className="text-2xl font-bold">{stats?.todayOrders || 0}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  12% from yesterday
                </p>
              </div>
              <FlaskConical className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Samples</p>
                <p className="text-2xl font-bold">{stats?.pendingSamples || 0}</p>
                <p className="text-xs text-yellow-600 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Avg wait: 45min
                </p>
              </div>
              <Activity className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Results</p>
                <p className="text-2xl font-bold">{stats?.pendingResults || 0}</p>
                <p className="text-xs text-orange-600 flex items-center">
                  <Target className="h-3 w-3 mr-1" />
                  Target: &lt;2 hrs
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Critical Values</p>
                <p className="text-2xl font-bold text-red-600">{stats?.criticalValues || 0}</p>
                <p className="text-xs text-red-600 flex items-center">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Immediate action
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Turnaround Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {stats?.averageTurnaroundTime.toFixed(1) || 0}h
            </div>
            <Progress value={75} className="h-2 mb-2" />
            <p className="text-sm text-gray-600">Target: &lt;4 hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Equipment Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm">Operational</span>
                <Badge className="bg-green-100 text-green-800">
                  {stats?.equipmentStatus.operational || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Maintenance</span>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {stats?.equipmentStatus.maintenance || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Out of Service</span>
                <Badge className="bg-red-100 text-red-800">
                  {stats?.equipmentStatus.outOfService || 0}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quality Control
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold mb-2">
              {stats?.qcPassRate.toFixed(1) || 0}%
            </div>
            <Progress value={stats?.qcPassRate || 0} className="h-2 mb-2" />
            <p className="text-sm text-gray-600">Pass rate today</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="activity" className="w-full">
        <TabsList>
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest laboratory orders received</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">Order #{order.id.slice(-6)}</p>
                        <p className="text-sm text-gray-600">
                          {order.tests.length} tests • Patient: {order.patientId}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(order.orderDate).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={getStatusColor(order.status)}>
                          {order.status}
                        </Badge>
                        <Badge className={getPriorityColor(order.priority)}>
                          {order.priority}
                        </Badge>
                      </div>
                    </div>
                  ))}
                  {recentOrders.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No recent orders</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Critical Values
                </CardTitle>
                <CardDescription>Results requiring immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {criticalResults.map((result) => (
                    <div key={result.id} className="flex justify-between items-center p-3 border border-red-200 bg-red-50 rounded">
                      <div>
                        <p className="font-medium text-red-900">
                          {result.componentName}: {result.value} {result.unit}
                        </p>
                        <p className="text-sm text-red-700">
                          Component ID: {result.testComponentId}
                        </p>
                        <p className="text-xs text-red-600">
                          {new Date(result.enteredAt).toLocaleString()}
                        </p>
                      </div>
                      <Badge variant="destructive">
                        Critical
                      </Badge>
                    </div>
                  ))}
                  {criticalResults.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No critical values</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Volume Trend</CardTitle>
                <CardDescription>Daily order volume over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{trend.period}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((trend.orders / 50) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">{trend.orders}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Completion Trend</CardTitle>
                <CardDescription>Daily completed tests over the past week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {trends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium">{trend.period}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${Math.min((trend.completedTests / 40) * 100, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-8">{trend.completedTests}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                Equipment Alerts
              </CardTitle>
              <CardDescription>Equipment requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {equipmentAlerts.map((eq) => {
                  const daysUntilMaintenance = Math.ceil(
                    (new Date(eq.nextMaintenance).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                  );
                  
                  return (
                    <div key={eq.id} className="flex justify-between items-center p-3 border rounded">
                      <div>
                        <p className="font-medium">{eq.name}</p>
                        <p className="text-sm text-gray-600">
                          {eq.location} • Serial: {eq.serialNumber}
                        </p>
                        <p className="text-xs text-gray-500">
                          {eq.status === "operational" 
                            ? `Maintenance due in ${daysUntilMaintenance} days`
                            : `Status: ${eq.status.replace('_', ' ')}`
                          }
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <Badge className={
                          eq.status === "operational" ? "bg-green-100 text-green-800" :
                          eq.status === "maintenance" ? "bg-yellow-100 text-yellow-800" :
                          "bg-red-100 text-red-800"
                        }>
                          {eq.status.replace('_', ' ')}
                        </Badge>
                        {daysUntilMaintenance <= 7 && eq.status === "operational" && (
                          <Badge variant="outline" className="text-orange-600">
                            Maintenance Due
                          </Badge>
                        )}
                      </div>
                    </div>
                  );
                })}
                {equipmentAlerts.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No equipment alerts</p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quality Control Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stats?.qcPassRate.toFixed(0) || 0}%
                  </div>
                  <p className="text-gray-600">Pass Rate Today</p>
                  <Progress value={stats?.qcPassRate || 0} className="mt-3" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Workload Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Routine</span>
                    <span className="text-sm font-medium">65%</span>
                  </div>
                  <Progress value={65} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Urgent</span>
                    <span className="text-sm font-medium">30%</span>
                  </div>
                  <Progress value={30} className="h-2" />
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm">STAT</span>
                    <span className="text-sm font-medium">5%</span>
                  </div>
                  <Progress value={5} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}