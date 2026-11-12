"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { 
  UserCheck, 
  Award,
  TrendingUp,
  TrendingDown,
  Clock,
  Star,
  Download,
  Filter,
  BarChart3,
  Users,
  Target
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DoctorPerformanceReport } from "@/types/reporting";

interface DoctorPerformanceReportProps {
  report: DoctorPerformanceReport;
  onExport: (format: string) => void;
  onDrillDown: (doctorId: string) => void;
}

export function DoctorPerformanceReport({ report, onExport, onDrillDown }: DoctorPerformanceReportProps) {
  const [selectedView, setSelectedView] = useState("overview");

  const performanceStats = [
    {
      title: "Total Doctors",
      value: report.totalDoctors.toString(),
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Avg Satisfaction",
      value: `${report.averageSatisfactionScore.toFixed(1)}/5`,
      icon: Star,
      color: "text-yellow-600",
      bgColor: "bg-yellow-100"
    },
    {
      title: "Quality Score",
      value: `${report.averageQualityScore}%`,
      icon: Award,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Efficiency Score",
      value: `${report.averageEfficiencyScore}%`,
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    }
  ];

  const getPerformanceColor = (score: number) => {
    if (score >= 85) return "text-green-600";
    if (score >= 70) return "text-yellow-600";
    return "text-red-600";
  };

  const getPerformanceBadge = (score: number) => {
    if (score >= 85) return { color: "default", label: "Excellent" };
    if (score >= 70) return { color: "secondary", label: "Good" };
    return { color: "destructive", label: "Needs Improvement" };
  };

  const getSatisfactionStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Doctor Performance</h2>
          <p className="text-muted-foreground">
            Performance analysis for {format(report.reportDate, "MMMM dd, yyyy")}
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
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="specialties">Specialties</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Performance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {performanceStats.map((stat) => {
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

          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <Award className="h-5 w-5" />
                  Top Quality Performers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.topPerformers
                    .sort((a, b) => b.qualityScore - a.qualityScore)
                    .slice(0, 5)
                    .map((doctor, index) => (
                      <div key={doctor.doctorId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-green-600">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium">{doctor.name}</div>
                            <div className="text-xs text-muted-foreground">{doctor.specialty}</div>
                          </div>
                        </div>
                        <Badge variant="default" className="text-xs">
                          {doctor.qualityScore}%
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <Star className="h-5 w-5" />
                  Highest Patient Satisfaction
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.topPerformers
                    .sort((a, b) => b.patientSatisfactionScore - a.patientSatisfactionScore)
                    .slice(0, 5)
                    .map((doctor, index) => (
                      <div key={doctor.doctorId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-yellow-600">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium">{doctor.name}</div>
                            <div className="flex items-center gap-1 mt-1">
                              {getSatisfactionStars(Math.round(doctor.patientSatisfactionScore))}
                            </div>
                          </div>
                        </div>
                        <span className="font-medium">{doctor.patientSatisfactionScore.toFixed(1)}</span>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Target className="h-5 w-5" />
                  Most Efficient
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.topPerformers
                    .sort((a, b) => b.efficiency - a.efficiency)
                    .slice(0, 5)
                    .map((doctor, index) => (
                      <div key={doctor.doctorId} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-purple-600">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium">{doctor.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {doctor.patientsPerDay} patients/day avg
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {doctor.efficiency}%
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Individual Performance Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.doctors
                  .sort((a, b) => 
                    (b.qualityScore + b.patientSatisfactionScore * 20 + b.efficiency) / 3 -
                    (a.qualityScore + a.patientSatisfactionScore * 20 + a.efficiency) / 3
                  )
                  .map((doctor) => {
                    const overallScore = (doctor.qualityScore + doctor.patientSatisfactionScore * 20 + doctor.efficiency) / 3;
                    const badge = getPerformanceBadge(overallScore);
                    
                    return (
                      <div key={doctor.doctorId} className="space-y-3 p-4 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              Dr. {doctor.name}
                              <Badge variant="outline" className="text-xs">
                                {doctor.specialty}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span>Experience: {doctor.experienceYears} years</span>
                              <span>Patients: {doctor.totalPatients} total</span>
                              <span>Success Rate: {doctor.successRate}%</span>
                            </div>
                            <div className="flex items-center gap-1 mt-1">
                              {getSatisfactionStars(Math.round(doctor.patientSatisfactionScore))}
                              <span className="text-sm text-muted-foreground ml-2">
                                {doctor.patientSatisfactionScore.toFixed(1)}/5
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={badge.color as any} className="mb-2">
                              {badge.label}
                            </Badge>
                            <div className="text-lg font-bold">
                              {Math.round(overallScore)}%
                            </div>
                            <div className="text-xs text-muted-foreground">overall score</div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Quality</span>
                              <span className={getPerformanceColor(doctor.qualityScore)}>
                                {doctor.qualityScore}%
                              </span>
                            </div>
                            <Progress value={doctor.qualityScore} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Satisfaction</span>
                              <span className={getPerformanceColor(doctor.patientSatisfactionScore * 20)}>
                                {doctor.patientSatisfactionScore.toFixed(1)}/5
                              </span>
                            </div>
                            <Progress value={doctor.patientSatisfactionScore * 20} className="h-2" />
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Efficiency</span>
                              <span className={getPerformanceColor(doctor.efficiency)}>
                                {doctor.efficiency}%
                              </span>
                            </div>
                            <Progress value={doctor.efficiency} className="h-2" />
                          </div>
                        </div>

                        <div className="flex justify-between items-center pt-2">
                          <div className="text-sm text-muted-foreground">
                            Avg consultation: {doctor.averageConsultationTime} min •
                            Revenue: ${doctor.revenue.toLocaleString()}
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDrillDown(doctor.doctorId)}
                          >
                            View Details
                          </Button>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="specialties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-purple-600" />
                Performance by Specialty
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.specialtyPerformance
                  .sort((a, b) => b.averageQualityScore - a.averageQualityScore)
                  .map((specialty) => (
                    <div key={specialty.specialty} className="space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">{specialty.specialty}</div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span>{specialty.doctorCount} doctors</span>
                            <span>{specialty.totalPatients} patients</span>
                            <span>{specialty.averageExperience} years avg exp</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">
                            {specialty.averageQualityScore}%
                          </div>
                          <div className="text-xs text-muted-foreground">quality score</div>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Quality</div>
                          <Progress value={specialty.averageQualityScore} className="h-2" />
                          <div className="text-xs">{specialty.averageQualityScore}%</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Satisfaction</div>
                          <Progress value={specialty.averageSatisfaction * 20} className="h-2" />
                          <div className="text-xs">{specialty.averageSatisfaction.toFixed(1)}/5</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Efficiency</div>
                          <Progress value={specialty.averageEfficiency} className="h-2" />
                          <div className="text-xs">{specialty.averageEfficiency}%</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">Revenue</div>
                          <div className="text-sm font-medium">${specialty.totalRevenue.toLocaleString()}</div>
                          <div className="text-xs text-muted-foreground">total</div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Performance Trends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-green-800">Quality Improvement</div>
                        <div className="text-sm text-green-700">
                          Average quality score increased
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-green-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-bold">+{report.trends.qualityImprovement}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-blue-800">Patient Satisfaction</div>
                        <div className="text-sm text-blue-700">
                          Overall satisfaction trending upward
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-blue-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-bold">+{report.trends.satisfactionImprovement.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-purple-800">Efficiency Gains</div>
                        <div className="text-sm text-purple-700">
                          Consultation times optimized
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-purple-600">
                        <TrendingUp className="h-4 w-4" />
                        <span className="font-bold">+{report.trends.efficiencyImprovement}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-orange-600" />
                  Achievement Highlights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <Award className="h-5 w-5 text-yellow-600" />
                      <div>
                        <div className="font-medium text-yellow-800">Excellence Awards</div>
                        <div className="text-sm text-yellow-700">
                          {report.achievements.excellenceAwards} doctors received recognition
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <Target className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-800">Quality Targets Met</div>
                        <div className="text-sm text-green-700">
                          {report.achievements.qualityTargetsMet}% of quality benchmarks achieved
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <Users className="h-5 w-5 text-blue-600" />
                      <div>
                        <div className="font-medium text-blue-800">Patient Advocacy</div>
                        <div className="text-sm text-blue-700">
                          {report.achievements.patientAdvocacyScore}% positive patient feedback
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                      <Clock className="h-5 w-5 text-purple-600" />
                      <div>
                        <div className="font-medium text-purple-800">Efficiency Leaders</div>
                        <div className="text-sm text-purple-700">
                          {report.achievements.efficiencyLeaders} doctors exceeded efficiency targets
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}