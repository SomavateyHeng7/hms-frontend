"use client";

import { percentOf } from "@/lib/utils";
import React, { useState } from "react";
import { format } from "date-fns";
import { 
  DollarSign, 
  TrendingUp,
  TrendingDown,
  CreditCard,
  Building2,
  Download,
  Filter,
  PieChart,
  BarChart3
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DonutChart } from "@/components/ui/charts";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BillingSummary } from "@/types/reporting";

interface BillingSummaryReportProps {
  summary: BillingSummary;
  onExport: (format: string) => void;
  onDrillDown: (department: string) => void;
}

export function BillingSummaryReport({ summary, onExport, onDrillDown }: BillingSummaryReportProps) {
  const [selectedView, setSelectedView] = useState("summary");

  const financialStats = [
    {
      title: "Total Revenue",
      value: `$${summary.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Collected Amount",
      value: `$${summary.collectedAmount.toLocaleString()}`,
      icon: CreditCard,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Pending Amount",
      value: `$${summary.pendingAmount.toLocaleString()}`,
      icon: TrendingUp,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      title: "Collection Rate",
      value: `${percentOf(summary.collectedAmount, summary.totalRevenue)}%`,
      icon: BarChart3,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Billing Summary</h2>
          <p className="text-muted-foreground">
            Financial overview for {format(summary.reportDate, "MMMM dd, yyyy")}
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
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="payments">Payment Methods</TabsTrigger>
          <TabsTrigger value="aging">Aging Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="space-y-6">
          {/* Financial Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {financialStats.map((stat) => {
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

          {/* Top Services */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChart className="h-5 w-5 text-blue-600" />
                Top Revenue Services
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.topServices.slice(0, 5).map((service, index) => (
                  <div key={service.serviceCode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                        <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{service.serviceName}</div>
                        <div className="text-sm text-muted-foreground">
                          Code: {service.serviceCode} • Qty: {service.quantity}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        ${service.revenue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Avg: ${service.averagePrice.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-purple-600" />
                Department Revenue Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summary.departmentRevenue
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((dept) => (
                    <div key={dept.departmentId} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{dept.departmentName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              ${dept.revenue.toLocaleString()} revenue
                            </Badge>
                            <Badge 
                              variant={dept.growthRate > 0 ? "default" : "destructive"}
                              className="text-xs"
                            >
                              {dept.growthRate > 0 ? "+" : ""}{dept.growthRate}% growth
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">${dept.collections.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">collected</div>
                        </div>
                      </div>
                      <Progress 
                        value={Math.round((dept.collections / dept.revenue) * 100)} 
                        className="h-2" 
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Collection Rate: {Math.round((dept.collections / dept.revenue) * 100)}%</span>
                        <span>Pending: ${dept.pending.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-green-600" />
                Payment Method Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {summary.paymentMethods.map((method) => (
                    <div key={method.method} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium capitalize">{method.method.replace("_", " ")}</span>
                        <div className="text-right">
                          <div className="font-bold">${method.amount.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">{method.percentage}%</div>
                        </div>
                      </div>
                      <Progress value={method.percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground">
                        {method.transactionCount} transactions
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <DonutChart
                    data={summary.paymentMethods.map((m) => ({
                      name: m.method.replace("_", " "),
                      value: m.amount,
                    }))}
                    valueFormatter={(v) => `$${v.toLocaleString()}`}
                    emptyTitle="No payments recorded"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="aging" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-orange-600" />
                Accounts Receivable Aging
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {summary.ageingAnalysis.map((group) => (
                  <Card key={group.ageGroup}>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold">${group.amount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">{group.ageGroup} days</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {group.percentage}% of total
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2 text-yellow-800">
                  <TrendingDown className="h-4 w-4" />
                  <span className="font-medium">Collection Priority</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Focus on collecting accounts in the 61-90 day range to prevent them from becoming overdue.
                  Consider implementing automated reminders for accounts over 30 days.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}