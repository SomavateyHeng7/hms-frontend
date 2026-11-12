"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { 
  FileText, 
  Plus, 
  Download, 
  Filter, 
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  Target,
  Calendar,
  User
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import { clinicalReportSchema, ClinicalReportFormData } from "@/lib/validations/reporting";
import { ClinicalReport } from "@/types/reporting";

interface ClinicalReportsProps {
  reports: ClinicalReport[];
  onGenerateReport: (data: ClinicalReportFormData) => void;
  onExportReport: (id: string, format: string) => void;
}

export function ClinicalReports({ reports, onGenerateReport, onExportReport }: ClinicalReportsProps) {
  const [activeTab, setActiveTab] = useState("reports");
  const [selectedReportType, setSelectedReportType] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);

  const reportForm = useForm<ClinicalReportFormData>({
    resolver: zodResolver(clinicalReportSchema),
    defaultValues: {
      reportType: "quality",
      includeRecommendations: true,
      includeBenchmarks: true
    }
  });

  const handleGenerateReport = async (data: ClinicalReportFormData) => {
    setIsGenerating(true);
    try {
      await onGenerateReport(data);
    } finally {
      setIsGenerating(false);
    }
  };

  const filteredReports = reports.filter(report => 
    selectedReportType === "all" || report.reportType === selectedReportType
  );

  const getReportTypeColor = (type: string) => {
    switch (type) {
      case "diagnostic":
        return "bg-blue-100 text-blue-800";
      case "treatment":
        return "bg-green-100 text-green-800";
      case "outcome":
        return "bg-purple-100 text-purple-800";
      case "quality":
        return "bg-yellow-100 text-yellow-800";
      case "safety":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getQualityStatusIcon = (status: string) => {
    switch (status) {
      case "good":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Clinical Reports</h2>
          <p className="text-muted-foreground">
            Generate and manage clinical quality reports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedReportType} onValueChange={setSelectedReportType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Reports</SelectItem>
              <SelectItem value="diagnostic">Diagnostic</SelectItem>
              <SelectItem value="treatment">Treatment</SelectItem>
              <SelectItem value="outcome">Outcome</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
              <SelectItem value="safety">Safety</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setActiveTab("generate")}>
            <Plus className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="reports">Clinical Reports</TabsTrigger>
          <TabsTrigger value="generate">Generate New</TabsTrigger>
          <TabsTrigger value="quality">Quality Indicators</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-6">
          {filteredReports.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Clinical Reports</h3>
                  <p className="text-muted-foreground mb-4">
                    No reports found for the selected criteria
                  </p>
                  <Button onClick={() => setActiveTab("generate")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Generate Your First Report
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredReports.map((report) => (
                <Card key={report.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getReportTypeColor(report.reportType)}>
                            {report.reportType}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {format(report.generatedAt, "MMM dd, yyyy")}
                          </span>
                        </div>
                        <CardTitle className="text-lg">{report.title}</CardTitle>
                        <CardDescription>{report.summary}</CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onExportReport(report.id, "pdf")}
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Key Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {report.metrics.slice(0, 3).map((metric, index) => (
                          <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold">{metric.value}</div>
                            <div className="text-sm text-muted-foreground">{metric.name}</div>
                            {metric.trend && (
                              <div className={`flex items-center justify-center gap-1 mt-1 ${
                                metric.trend === "up" ? "text-green-600" : "text-red-600"
                              }`}>
                                {metric.trend === "up" ? 
                                  <TrendingUp className="h-3 w-3" /> : 
                                  <TrendingDown className="h-3 w-3" />
                                }
                                <span className="text-xs">
                                  {metric.trend === "up" ? "Improving" : "Declining"}
                                </span>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Quality Indicators */}
                      {report.qualityIndicators && report.qualityIndicators.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Quality Indicators</h4>
                          <div className="space-y-2">
                            {report.qualityIndicators.slice(0, 3).map((indicator, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <div className="flex items-center gap-2">
                                  {getQualityStatusIcon(indicator.status)}
                                  <span className="text-sm">{indicator.indicator}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">
                                    {indicator.score}/{indicator.target}
                                  </span>
                                  <Badge 
                                    variant={indicator.status === "good" ? "default" : 
                                           indicator.status === "warning" ? "secondary" : "destructive"}
                                    className="text-xs"
                                  >
                                    {indicator.status}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {report.recommendations && report.recommendations.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">Key Recommendations</h4>
                          <ul className="space-y-1">
                            {report.recommendations.slice(0, 3).map((recommendation, index) => (
                              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                                <Target className="h-3 w-3 mt-0.5 text-blue-500" />
                                {recommendation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs text-muted-foreground pt-2 border-t">
                        <span>Generated by {report.generatedBy}</span>
                        <span>
                          Period: {format(report.dateRange.start, "MMM dd")} - {format(report.dateRange.end, "MMM dd, yyyy")}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Generate Clinical Report
              </CardTitle>
              <CardDescription>
                Create a new clinical quality report
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={reportForm.handleSubmit(handleGenerateReport)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Report Type</Label>
                    <Select onValueChange={(value) => reportForm.setValue("reportType", value as any)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select report type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diagnostic">Diagnostic Report</SelectItem>
                        <SelectItem value="treatment">Treatment Analysis</SelectItem>
                        <SelectItem value="outcome">Outcome Assessment</SelectItem>
                        <SelectItem value="quality">Quality Metrics</SelectItem>
                        <SelectItem value="safety">Safety Analysis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Report Title</Label>
                    <Input
                      id="title"
                      {...reportForm.register("title")}
                      placeholder="Monthly Quality Assessment Report"
                    />
                    {reportForm.formState.errors.title && (
                      <p className="text-sm text-red-500">{reportForm.formState.errors.title.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <CalendarPicker
                      mode="single"
                      selected={reportForm.watch("dateRange.start")}
                      onSelect={(date) => date && reportForm.setValue("dateRange.start", date)}
                      className="rounded-md border"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <CalendarPicker
                      mode="single"
                      selected={reportForm.watch("dateRange.end")}
                      onSelect={(date) => date && reportForm.setValue("dateRange.end", date)}
                      className="rounded-md border"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Department (Optional)</Label>
                    <Select onValueChange={(value) => reportForm.setValue("departmentId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All departments" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Departments</SelectItem>
                        <SelectItem value="DEPT001">Cardiology</SelectItem>
                        <SelectItem value="DEPT002">Neurology</SelectItem>
                        <SelectItem value="DEPT003">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Doctor (Optional)</Label>
                    <Select onValueChange={(value) => reportForm.setValue("doctorId", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="All doctors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Doctors</SelectItem>
                        <SelectItem value="DOC001">Dr. Sarah Johnson</SelectItem>
                        <SelectItem value="DOC002">Dr. Michael Chen</SelectItem>
                        <SelectItem value="DOC003">Dr. Emily Rodriguez</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Report Options</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeRecommendations"
                        {...reportForm.register("includeRecommendations")}
                        className="rounded"
                      />
                      <Label htmlFor="includeRecommendations" className="text-sm">
                        Include Recommendations
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="includeBenchmarks"
                        {...reportForm.register("includeBenchmarks")}
                        className="rounded"
                      />
                      <Label htmlFor="includeBenchmarks" className="text-sm">
                        Include Benchmarks
                      </Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={isGenerating}>
                    {isGenerating ? "Generating..." : "Generate Report"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports
              .filter(r => r.qualityIndicators && r.qualityIndicators.length > 0)
              .slice(0, 6)
              .map((report) => (
                <Card key={report.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{report.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {format(report.dateRange.start, "MMM dd")} - {format(report.dateRange.end, "MMM dd")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {report.qualityIndicators?.slice(0, 3).map((indicator, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getQualityStatusIcon(indicator.status)}
                            <span className="text-sm truncate">{indicator.indicator}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">
                              {indicator.score}/{indicator.target}
                            </div>
                            <div className={`text-xs ${
                              indicator.status === "good" ? "text-green-600" :
                              indicator.status === "warning" ? "text-yellow-600" :
                              "text-red-600"
                            }`}>
                              {Math.round((indicator.score / indicator.target) * 100)}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}