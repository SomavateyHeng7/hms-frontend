"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { VitalSigns } from "@/types/inpatient";
import { Activity, CalendarIcon, Heart, Thermometer, Wind, Droplet, Weight, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface VitalSignsMonitoringProps {
  patientId?: string;
  admissionId?: string;
}

export function VitalSignsMonitoring({ patientId, admissionId }: VitalSignsMonitoringProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [formData, setFormData] = useState({
    temperature: "",
    systolic: "",
    diastolic: "",
    heartRate: "",
    respiratoryRate: "",
    oxygenSaturation: "",
    bloodGlucose: "",
    weight: "",
    height: "",
    painLevel: "",
    consciousness: "alert",
    notes: "",
  });

  // Mock historical data
  const vitalHistory: VitalSigns[] = [
    {
      id: "1",
      patientId: "PAT001",
      admissionId: "ADM001",
      recordedAt: new Date(2025, 11, 30, 8, 0),
      recordedBy: "Nurse Sarah",
      temperature: 98.6,
      bloodPressureSystolic: 120,
      bloodPressureDiastolic: 80,
      heartRate: 72,
      respiratoryRate: 16,
      oxygenSaturation: 98,
      bloodGlucose: 95,
      weight: 70,
      consciousness: "alert",
    },
    {
      id: "2",
      patientId: "PAT001",
      admissionId: "ADM001",
      recordedAt: new Date(2025, 11, 30, 14, 0),
      recordedBy: "Nurse John",
      temperature: 99.1,
      bloodPressureSystolic: 125,
      bloodPressureDiastolic: 82,
      heartRate: 78,
      respiratoryRate: 18,
      oxygenSaturation: 97,
      bloodGlucose: 110,
      consciousness: "alert",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Vital signs recorded:", formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const getVitalStatus = (value: number, normal: { min: number; max: number }) => {
    if (value < normal.min) return "text-blue-600";
    if (value > normal.max) return "text-red-600";
    return "text-green-600";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Vital Signs Monitoring</h2>
        <p className="text-muted-foreground">Record and track patient vital signs</p>
      </div>

      <Tabs defaultValue="record" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="record">Record Vitals</TabsTrigger>
          <TabsTrigger value="history">View History</TabsTrigger>
        </TabsList>

        <TabsContent value="record" className="space-y-6">
          <form onSubmit={handleSubmit}>
            <div className="grid gap-6">
              {/* Basic Vitals */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Basic Vital Signs
                  </CardTitle>
                  <CardDescription>Record current vital measurements</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature" className="flex items-center gap-2">
                      <Thermometer className="h-4 w-4" />
                      Temperature (°F) *
                    </Label>
                    <Input
                      id="temperature"
                      type="number"
                      step="0.1"
                      placeholder="98.6"
                      value={formData.temperature}
                      onChange={(e) => handleChange("temperature", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Normal: 97.8 - 99.1°F</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="heartRate" className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      Heart Rate (bpm) *
                    </Label>
                    <Input
                      id="heartRate"
                      type="number"
                      placeholder="72"
                      value={formData.heartRate}
                      onChange={(e) => handleChange("heartRate", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Normal: 60 - 100 bpm</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="respiratoryRate" className="flex items-center gap-2">
                      <Wind className="h-4 w-4" />
                      Respiratory Rate *
                    </Label>
                    <Input
                      id="respiratoryRate"
                      type="number"
                      placeholder="16"
                      value={formData.respiratoryRate}
                      onChange={(e) => handleChange("respiratoryRate", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Normal: 12 - 20 /min</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="systolic">Blood Pressure (mmHg) *</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="systolic"
                        type="number"
                        placeholder="120"
                        value={formData.systolic}
                        onChange={(e) => handleChange("systolic", e.target.value)}
                      />
                      <span>/</span>
                      <Input
                        id="diastolic"
                        type="number"
                        placeholder="80"
                        value={formData.diastolic}
                        onChange={(e) => handleChange("diastolic", e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Normal: 120/80 mmHg</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="oxygenSaturation" className="flex items-center gap-2">
                      <Droplet className="h-4 w-4" />
                      O2 Saturation (%) *
                    </Label>
                    <Input
                      id="oxygenSaturation"
                      type="number"
                      placeholder="98"
                      value={formData.oxygenSaturation}
                      onChange={(e) => handleChange("oxygenSaturation", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Normal: 95 - 100%</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bloodGlucose">Blood Glucose (mg/dL)</Label>
                    <Input
                      id="bloodGlucose"
                      type="number"
                      placeholder="95"
                      value={formData.bloodGlucose}
                      onChange={(e) => handleChange("bloodGlucose", e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Fasting: 70 - 100</p>
                  </div>
                </CardContent>
              </Card>

              {/* Physical Measurements */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Weight className="h-5 w-5" />
                    Physical Measurements
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      step="0.1"
                      placeholder="70"
                      value={formData.weight}
                      onChange={(e) => handleChange("weight", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      step="0.1"
                      placeholder="170"
                      value={formData.height}
                      onChange={(e) => handleChange("height", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="painLevel">Pain Level (0-10)</Label>
                    <Input
                      id="painLevel"
                      type="number"
                      min="0"
                      max="10"
                      placeholder="0"
                      value={formData.painLevel}
                      onChange={(e) => handleChange("painLevel", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-4 justify-end">
                <Button type="button" variant="outline">
                  Clear
                </Button>
                <Button type="submit">Record Vital Signs</Button>
              </div>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs History</CardTitle>
              <CardDescription>Past vital sign recordings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vitalHistory.map((vital) => (
                  <Card key={vital.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="text-base">
                            {format(vital.recordedAt, "PPP p")}
                          </CardTitle>
                          <CardDescription>Recorded by {vital.recordedBy}</CardDescription>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {vital.consciousness}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Temperature</div>
                          <div className={`text-lg font-semibold ${getVitalStatus(vital.temperature, { min: 97.8, max: 99.1 })}`}>
                            {vital.temperature}°F
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Blood Pressure</div>
                          <div className="text-lg font-semibold">
                            {vital.bloodPressureSystolic}/{vital.bloodPressureDiastolic}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Heart Rate</div>
                          <div className={`text-lg font-semibold ${getVitalStatus(vital.heartRate, { min: 60, max: 100 })}`}>
                            {vital.heartRate} bpm
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">O2 Saturation</div>
                          <div className={`text-lg font-semibold ${getVitalStatus(vital.oxygenSaturation, { min: 95, max: 100 })}`}>
                            {vital.oxygenSaturation}%
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
      </Tabs>
    </div>
  );
}
