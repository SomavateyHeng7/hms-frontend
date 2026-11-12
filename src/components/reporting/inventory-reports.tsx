"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { 
  Package, 
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Clock,
  Download,
  Filter,
  Search,
  BarChart3,
  AlertCircle,
  DollarSign
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryReport } from "@/types/reporting";

interface InventoryReportsProps {
  report: InventoryReport;
  onExport: (format: string) => void;
  onReorder: (itemId: string) => void;
}

export function InventoryReports({ report, onExport, onReorder }: InventoryReportsProps) {
  const [selectedView, setSelectedView] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");

  const inventoryStats = [
    {
      title: "Total Items",
      value: report.totalItems.toString(),
      icon: Package,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Low Stock Items",
      value: report.lowStockItems.toString(),
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Out of Stock",
      value: report.outOfStockItems.toString(),
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Total Value",
      value: `$${report.totalValue.toLocaleString()}`,
      icon: BarChart3,
      color: "text-green-600",
      bgColor: "bg-green-100"
    }
  ];

  const filteredItems = report.topUsedItems.filter(item =>
    item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Inventory Reports</h2>
          <p className="text-muted-foreground">
            Inventory status as of {format(report.reportDate, "MMMM dd, yyyy")}
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
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Analysis</TabsTrigger>
          <TabsTrigger value="purchasing">Purchase Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Inventory Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {inventoryStats.map((stat) => {
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

          {/* Top Used Items */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Most Used Items
                </CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredItems.slice(0, 10).map((item) => (
                  <div key={item.itemId} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package className="h-6 w-6 text-gray-600" />
                      </div>
                      <div>
                        <div className="font-medium">{item.itemName}</div>
                        <div className="text-sm text-muted-foreground">
                          Category: {item.category} • Supplier: {item.supplier}
                        </div>
                        <Badge variant="outline" className="mt-1">
                          Used: {item.quantityUsed} units
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        ${item.cost.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total cost
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="mt-2"
                        onClick={() => onReorder(item.itemId)}
                      >
                        Reorder
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Category Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.categories
                  .sort((a, b) => b.totalValue - a.totalValue)
                  .map((category) => (
                    <div key={category.categoryId} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{category.categoryName}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs">
                              {category.itemCount} items
                            </Badge>
                            {category.lowStockCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {category.lowStockCount} low stock
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {category.turnoverRate.toFixed(1)}x turnover
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            ${category.totalValue.toLocaleString()}
                          </div>
                          <div className="text-xs text-muted-foreground">total value</div>
                        </div>
                      </div>
                      <Progress 
                        value={Math.min((category.totalValue / report.totalValue) * 100, 100)} 
                        className="h-2" 
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{Math.round((category.totalValue / report.totalValue) * 100)}% of total value</span>
                        <span>Turnover: {category.turnoverRate.toFixed(1)}x</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Stock Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                  Stock Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div>
                    <div className="font-medium">Low Stock Items</div>
                    <div className="text-sm text-muted-foreground">
                      Items below minimum threshold
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-orange-600">
                    {report.lowStockItems}
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div>
                    <div className="font-medium">Out of Stock</div>
                    <div className="text-sm text-muted-foreground">
                      Items completely depleted
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-red-600">
                    {report.outOfStockItems}
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div>
                    <div className="font-medium">Expiring Soon</div>
                    <div className="text-sm text-muted-foreground">
                      Items expiring within 30 days
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-yellow-600">
                    {report.expiringItems}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Waste Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  Waste Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <div className="font-medium">Expired Items</div>
                      <div className="text-sm text-muted-foreground">
                        {report.wasteAnalysis.expiredItems} items
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        ${report.wasteAnalysis.expiredValue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">value lost</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <div>
                      <div className="font-medium">Damaged Items</div>
                      <div className="text-sm text-muted-foreground">
                        {report.wasteAnalysis.damagedItems} items
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-600">
                        ${report.wasteAnalysis.damagedValue.toLocaleString()}
                      </div>
                      <div className="text-xs text-muted-foreground">value lost</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="purchasing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Purchase Orders */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Purchase Orders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {report.purchaseOrders.pending}
                    </div>
                    <div className="text-sm text-muted-foreground">Pending</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {report.purchaseOrders.completed}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Value</span>
                    <span className="font-medium">${report.purchaseOrders.totalValue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Average Lead Time</span>
                    <span className="font-medium">{report.purchaseOrders.averageLeadTime} days</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Cost Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  Cost Analysis
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Total Purchases</span>
                    <span className="text-lg font-bold">
                      ${report.costAnalysis.totalPurchases.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Average Cost per Item</span>
                    <span className="text-lg font-bold">
                      ${report.costAnalysis.averageCostPerItem.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Bulk Order Savings</span>
                    <span className="text-lg font-bold text-green-600">
                      ${report.costAnalysis.savingsFromBulkOrders.toLocaleString()}
                    </span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-800">
                    <TrendingUp className="h-4 w-4" />
                    <span className="font-medium">Cost Efficiency</span>
                  </div>
                  <p className="text-sm text-green-700 mt-1">
                    Bulk ordering has saved {Math.round((report.costAnalysis.savingsFromBulkOrders / report.costAnalysis.totalPurchases) * 100)}% 
                    on total purchases this period.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}