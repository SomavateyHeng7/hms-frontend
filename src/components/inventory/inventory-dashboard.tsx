"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InventoryItem, PurchaseOrder } from "@/types/inventory";
import { Package, AlertTriangle, TrendingDown, ShoppingCart, FileText } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function InventoryDashboard() {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock data
  const items: InventoryItem[] = [
    {
      id: "1",
      itemCode: "INV-001",
      name: "Surgical Gloves (Box)",
      category: "consumables",
      description: "Sterile surgical gloves",
      unit: "box",
      currentStock: 45,
      minimumStock: 50,
      maximumStock: 200,
      reorderLevel: 75,
      reorderQuantity: 100,
      unitPrice: 25.0,
      totalValue: 1125.0,
      location: "Store Room A",
      batchNumber: "GLV2025001",
      expiryDate: new Date(2025, 11, 31),
      status: "low-stock",
      isActive: true,
    },
    {
      id: "2",
      itemCode: "INV-002",
      name: "Disposable Syringes 5ml",
      category: "consumables",
      description: "5ml disposable syringes",
      unit: "piece",
      currentStock: 850,
      minimumStock: 500,
      maximumStock: 2000,
      reorderLevel: 750,
      reorderQuantity: 500,
      unitPrice: 0.5,
      totalValue: 425.0,
      location: "Store Room A",
      batchNumber: "SYR2025002",
      expiryDate: new Date(2026, 5, 30),
      status: "in-stock",
      isActive: true,
    },
    {
      id: "3",
      itemCode: "INV-003",
      name: "Paracetamol 500mg",
      category: "medication",
      description: "Pain relief medication",
      unit: "strip",
      currentStock: 120,
      minimumStock: 100,
      maximumStock: 500,
      reorderLevel: 150,
      reorderQuantity: 200,
      unitPrice: 1.5,
      totalValue: 180.0,
      location: "Pharmacy Store",
      batchNumber: "PAR2025003",
      expiryDate: new Date(2026, 2, 15),
      status: "in-stock",
      isActive: true,
    },
  ];

  const purchaseOrders: PurchaseOrder[] = [
    {
      id: "1",
      poNumber: "PO-2025-001",
      supplierId: "SUP001",
      supplierName: "MedSupply Inc",
      orderDate: new Date(2025, 0, 15),
      expectedDeliveryDate: new Date(2025, 0, 22),
      status: "pending",
      items: [
        {
          itemId: "1",
          itemName: "Surgical Gloves (Box)",
          itemCode: "INV-001",
          quantity: 100,
          unit: "box",
          unitPrice: 25.0,
          totalPrice: 2500.0,
        },
      ],
      subtotal: 2500.0,
      tax: 250.0,
      discount: 0,
      shippingCost: 50.0,
      totalAmount: 2800.0,
      requestedBy: "Inventory Manager",
      paymentStatus: "pending",
      deliveryAddress: "Hospital Main Store, 123 Medical Street",
    },
  ];

  const stats = {
    totalItems: 245,
    lowStockItems: 12,
    outOfStock: 3,
    expiringIn30Days: 8,
    totalValue: 125000,
    pendingOrders: 5,
    receivedThisMonth: 18,
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case "in-stock":
        return "bg-green-500";
      case "low-stock":
        return "bg-yellow-500";
      case "below-minimum":
        return "bg-orange-500";
      case "out-of-stock":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStockPercentage = (item: InventoryItem) => {
    return (item.currentStock / item.maximumStock) * 100;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Inventory & Supply Chain</h1>
        <p className="text-muted-foreground">Manage stock levels and procurement</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">Inventory Items</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalItems}</div>
                <p className="text-xs text-muted-foreground">Active inventory items</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">{stats.lowStockItems}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.outOfStock} out of stock
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
                <TrendingDown className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.expiringIn30Days}</div>
                <p className="text-xs text-muted-foreground">Items expiring in 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">{stats.pendingOrders} pending orders</p>
              </CardContent>
            </Card>
          </div>

          {/* Critical Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Critical Stock Alerts</CardTitle>
              <CardDescription>Items requiring immediate attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items
                  .filter((item) => item.status === "low-stock" || item.status === "out-of-stock")
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{item.name}</h4>
                          <Badge variant="outline">{item.itemCode}</Badge>
                          <Badge variant="destructive">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            {item.status.replace("-", " ")}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Current: {item.currentStock} {item.unit} | Min: {item.minimumStock} | Reorder: {item.reorderLevel}
                        </p>
                        <div className="w-full max-w-md">
                          <Progress value={getStockPercentage(item)} className="h-2" />
                        </div>
                      </div>
                      <Button size="sm">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Reorder
                      </Button>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="items" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Inventory Items</CardTitle>
                  <CardDescription>All items in stock</CardDescription>
                </div>
                <Button>
                  <Package className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {items.map((item) => (
                  <Card key={item.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{item.name}</h3>
                            <Badge variant="outline">{item.itemCode}</Badge>
                            <Badge
                              className="capitalize"
                              variant={
                                item.status === "in-stock"
                                  ? "secondary"
                                  : item.status === "out-of-stock"
                                  ? "destructive"
                                  : "default"
                              }
                            >
                              {item.status.replace("-", " ")}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Category</div>
                              <div className="font-medium capitalize">{item.category}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Quantity</div>
                              <div className="font-medium">
                                {item.currentStock} {item.unit}
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Min Level</div>
                              <div className="font-medium">{item.minimumStock}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Location</div>
                              <div className="font-medium">{item.location}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Value</div>
                              <div className="font-medium">${item.totalValue.toFixed(2)}</div>
                            </div>
                          </div>

                          <div className="w-full max-w-xl">
                            <Progress value={getStockPercentage(item)} className="h-2" />
                            <p className="text-xs text-muted-foreground mt-1">
                              {getStockPercentage(item).toFixed(0)}% of maximum capacity
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Purchase Orders</CardTitle>
                  <CardDescription>Manage procurement orders</CardDescription>
                </div>
                <Button>
                  <FileText className="mr-2 h-4 w-4" />
                  Create PO
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {purchaseOrders.map((po) => (
                  <Card key={po.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{po.poNumber}</h3>
                            <Badge className="capitalize" variant={po.status === "pending" ? "default" : "secondary"}>
                              {po.status}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Supplier</div>
                              <div className="font-medium">{po.supplierName}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Order Date</div>
                              <div className="font-medium">{po.orderDate.toLocaleDateString()}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Expected Delivery</div>
                              <div className="font-medium">{po.expectedDeliveryDate.toLocaleDateString()}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Total Amount</div>
                              <div className="font-medium">${po.totalAmount.toFixed(2)}</div>
                            </div>
                          </div>

                          <div className="text-sm">
                            <div className="text-muted-foreground">Items</div>
                            <div>{po.items.length} item(s)</div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">View</Button>
                          {po.status === "pending" && (
                            <Button size="sm">Approve</Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
