"use client";

import React, { useState, useCallback } from "react";
import { Plus, Settings, Download, Eye, EyeOff, Trash2, Edit3, Grid, BarChart3, PieChart, Activity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CustomDashboard, DashboardWidget } from "@/features/admin/reporting/types";

interface CustomDashboardsProps {
  dashboards: CustomDashboard[];
  onCreateDashboard: () => void;
  onEditDashboard: (dashboardId: string) => void;
  onDeleteDashboard: (dashboardId: string) => void;
  onExportDashboard: (dashboardId: string, format: string) => void;
  onToggleWidgetVisibility: (dashboardId: string, widgetId: string, visible: boolean) => void;
}

export function CustomDashboards({ 
  dashboards, 
  onCreateDashboard,
  onEditDashboard,
  onDeleteDashboard,
  onExportDashboard,
  onToggleWidgetVisibility
}: CustomDashboardsProps) {
  const [selectedDashboard, setSelectedDashboard] = useState<string>(dashboards[0]?.id || "");
  const [editMode, setEditMode] = useState(false);

  const currentDashboard = dashboards.find(d => d.id === selectedDashboard);

  const getWidgetIcon = (type: DashboardWidget["type"]) => {
    switch (type) {
      case "chart": return BarChart3;
      case "metric": return Activity;
      case "table": return Grid;
      case "gauge": return PieChart;
      default: return BarChart3;
    }
  };

  const renderWidget = useCallback((widget: DashboardWidget) => {
    if (!widget.isVisible) return null;

    const Icon = getWidgetIcon(widget.type);

    return (
      <Card key={widget.id} className="relative group">
        {editMode && (
          <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onToggleWidgetVisibility(selectedDashboard, widget.id, !widget.isVisible)}
            >
              {widget.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="sm">
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
        
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Icon className={`h-5 w-5 ${widget.textColor || 'text-blue-600'}`} />
            {widget.title}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {widget.type === "metric" && (
            <div className="space-y-2">
              <div className="text-3xl font-bold">Sample Metric</div>
              <div className="flex items-center gap-1 text-sm text-green-600">
                +5.2%
                <span className="text-muted-foreground">vs last period</span>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Target: 100</span>
                  <span>85%</span>
                </div>
                <Progress value={85} className="h-2" />
              </div>
            </div>
          )}

          {widget.type === "chart" && (
            <div className="h-48 flex items-center justify-center border border-dashed rounded-lg text-muted-foreground">
              [Chart Placeholder: {widget.chartType || 'bar'}]
            </div>
          )}

          {widget.type === "table" && (
            <div className="space-y-2">
              {[
                { label: "Appointments", value: "245" },
                { label: "Patients", value: "189" },
                { label: "Revenue", value: "$12,450" },
                { label: "Efficiency", value: "87%" }
              ].map((row, index) => (
                <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                  <span className="text-sm">{row.label}</span>
                  <span className="font-medium">{row.value}</span>
                </div>
              ))}
            </div>
          )}

          {widget.type === "gauge" && (
            <div className="flex flex-col items-center space-y-2">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-8 border-gray-200"></div>
                <div 
                  className="absolute inset-0 rounded-full border-8 border-transparent border-l-blue-600"
                  style={{
                    transform: "rotate(135deg)",
                    borderTopColor: "transparent",
                    borderRightColor: "transparent"
                  }}
                ></div>
                <div className="text-2xl font-bold">75%</div>
              </div>
              <div className="text-sm text-muted-foreground">Performance Score</div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }, [editMode, selectedDashboard, onToggleWidgetVisibility]);

  if (!currentDashboard) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="text-lg font-medium">No Dashboards Available</div>
        <p className="text-muted-foreground">Create your first custom dashboard to get started.</p>
        <Button onClick={onCreateDashboard}>
          <Plus className="mr-2 h-4 w-4" />
          Create Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Custom Dashboards</h2>
          <p className="text-muted-foreground">
            Personalized analytics and reporting views
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch
              id="edit-mode"
              checked={editMode}
              onCheckedChange={setEditMode}
            />
            <Label htmlFor="edit-mode" className="text-sm">Edit Mode</Label>
          </div>
          <Button variant="outline" size="sm" onClick={onCreateDashboard}>
            <Plus className="mr-2 h-4 w-4" />
            New Dashboard
          </Button>
          <Button variant="outline" size="sm" onClick={() => onExportDashboard(selectedDashboard, "pdf")}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <Tabs value={selectedDashboard} onValueChange={setSelectedDashboard}>
        <div className="flex items-center justify-between">
          <TabsList>
            {dashboards.map((dashboard) => (
              <TabsTrigger key={dashboard.id} value={dashboard.id} className="flex items-center gap-2">
                {dashboard.name}
                <Badge variant="outline" className="text-xs">
                  {dashboard.widgets.filter(w => w.isVisible).length} widgets
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {editMode && currentDashboard && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditDashboard(currentDashboard.id)}
              >
                <Settings className="mr-2 h-4 w-4" />
                Configure
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600"
                onClick={() => onDeleteDashboard(currentDashboard.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          )}
        </div>

        {dashboards.map((dashboard) => (
          <TabsContent key={dashboard.id} value={dashboard.id} className="space-y-6 mt-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">{dashboard.name}</h3>
                <p className="text-muted-foreground">{dashboard.description}</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Layout: {dashboard.layout}</span>
                <span>Category: {dashboard.category}</span>
                <span>Updated: {new Date(dashboard.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div 
              className={`grid gap-6 ${
                dashboard.layout === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" :
                "grid-cols-1 md:grid-cols-2"
              }`}
            >
              {dashboard.widgets
                .filter(widget => widget.isVisible || editMode)
                .map(renderWidget)}
            </div>

            {editMode && (
              <Card className="border-2 border-dashed border-gray-300 bg-gray-50">
                <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
                  <Plus className="h-12 w-12 text-gray-400" />
                  <div className="text-center">
                    <div className="font-medium text-gray-600">Add New Widget</div>
                    <p className="text-sm text-gray-500">
                      Click to add charts, metrics, tables, or gauges
                    </p>
                  </div>
                  <Button variant="outline">Add Widget</Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}