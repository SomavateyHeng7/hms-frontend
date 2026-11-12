"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Bed, type Ward } from "@/types/inpatient";
import { Search, Plus, Filter, BedDouble, CheckCircle2, AlertCircle, Wrench, Clock } from "lucide-react";

interface BedManagementProps {
  onBedSelect?: (bed: Bed) => void;
}

export function BedManagement({ onBedSelect }: BedManagementProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterWard, setFilterWard] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");

  // Mock data
  const beds: Bed[] = [
    {
      id: "1",
      bedNumber: "ICU-101",
      wardId: "ward-1",
      wardName: "ICU Ward",
      bedType: "icu",
      status: "occupied",
      floor: "2nd Floor",
      features: ["Ventilator", "Cardiac Monitor", "Oxygen"],
      dailyRate: 5000,
      currentPatientId: "PAT001",
      lastCleaned: new Date(),
    },
    {
      id: "2",
      bedNumber: "GEN-201",
      wardId: "ward-2",
      wardName: "General Ward A",
      bedType: "general",
      status: "available",
      floor: "3rd Floor",
      features: ["AC", "TV"],
      dailyRate: 1500,
      lastCleaned: new Date(),
    },
    {
      id: "3",
      bedNumber: "PVT-301",
      wardId: "ward-3",
      wardName: "Private Wing",
      bedType: "private",
      status: "available",
      floor: "4th Floor",
      features: ["AC", "TV", "Refrigerator", "Attached Bathroom"],
      dailyRate: 3500,
      lastCleaned: new Date(),
    },
    {
      id: "4",
      bedNumber: "ICU-102",
      wardId: "ward-1",
      wardName: "ICU Ward",
      bedType: "icu",
      status: "maintenance",
      floor: "2nd Floor",
      features: ["Ventilator", "Cardiac Monitor"],
      dailyRate: 5000,
    },
  ];

  const wards: Ward[] = [
    {
      id: "ward-1",
      name: "ICU Ward",
      code: "ICU-A",
      department: "Critical Care",
      floor: "2nd Floor",
      totalBeds: 20,
      occupiedBeds: 15,
      availableBeds: 5,
      wardType: "icu",
      nursingStationId: "NS-1",
      features: ["24/7 Monitoring", "Ventilators"],
      capacity: 20,
    },
    {
      id: "ward-2",
      name: "General Ward A",
      code: "GEN-A",
      department: "General Medicine",
      floor: "3rd Floor",
      totalBeds: 40,
      occupiedBeds: 28,
      availableBeds: 12,
      wardType: "general",
      nursingStationId: "NS-2",
      features: ["AC", "WiFi"],
      capacity: 40,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "available":
        return <CheckCircle2 className="h-4 w-4" />;
      case "occupied":
        return <BedDouble className="h-4 w-4" />;
      case "maintenance":
        return <Wrench className="h-4 w-4" />;
      case "reserved":
        return <Clock className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-500";
      case "occupied":
        return "bg-red-500";
      case "maintenance":
        return "bg-orange-500";
      case "reserved":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const filteredBeds = beds.filter((bed) => {
    const matchesSearch =
      bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bed.wardName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || bed.status === filterStatus;
    const matchesWard = filterWard === "all" || bed.wardId === filterWard;
    const matchesType = filterType === "all" || bed.bedType === filterType;
    return matchesSearch && matchesStatus && matchesWard && matchesType;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bed Management</h2>
          <p className="text-muted-foreground">Manage hospital beds and occupancy</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Bed
        </Button>
      </div>

      {/* Ward Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {wards.map((ward) => (
          <Card key={ward.id}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">{ward.name}</CardTitle>
              <CardDescription>{ward.department}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Beds:</span>
                  <span className="font-semibold">{ward.totalBeds}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Occupied:</span>
                  <span className="font-semibold text-red-600">{ward.occupiedBeds}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Available:</span>
                  <span className="font-semibold text-green-600">{ward.availableBeds}</span>
                </div>
                <div className="pt-2">
                  <div className="text-xs text-muted-foreground mb-1">Occupancy Rate</div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500"
                      style={{ width: `${(ward.occupiedBeds / ward.totalBeds) * 100}%` }}
                    />
                  </div>
                  <div className="text-xs text-right mt-1">
                    {Math.round((ward.occupiedBeds / ward.totalBeds) * 100)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Bed Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Bed number or ward..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger id="status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="occupied">Occupied</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="reserved">Reserved</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="ward">Ward</Label>
              <Select value={filterWard} onValueChange={setFilterWard}>
                <SelectTrigger id="ward">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  {wards.map((ward) => (
                    <SelectItem key={ward.id} value={ward.id}>
                      {ward.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type">Bed Type</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger id="type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="icu">ICU</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="semi-private">Semi-Private</SelectItem>
                  <SelectItem value="isolation">Isolation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Bed List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBeds.map((bed) => (
              <Card
                key={bed.id}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => onBedSelect?.(bed)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{bed.bedNumber}</CardTitle>
                      <CardDescription>{bed.wardName}</CardDescription>
                    </div>
                    <div className={`p-2 rounded-full ${getStatusColor(bed.status)}`}>
                      {getStatusIcon(bed.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="capitalize">
                        {bed.bedType}
                      </Badge>
                      <Badge
                        variant={bed.status === "available" ? "default" : "secondary"}
                        className="capitalize"
                      >
                        {bed.status}
                      </Badge>
                    </div>
                    <div className="text-sm">
                      <div className="text-muted-foreground">{bed.floor}</div>
                      <div className="font-semibold mt-1">₹{bed.dailyRate}/day</div>
                    </div>
                    {bed.features.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {bed.features.slice(0, 2).map((feature, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {feature}
                          </Badge>
                        ))}
                        {bed.features.length > 2 && (
                          <Badge variant="secondary" className="text-xs">
                            +{bed.features.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredBeds.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <BedDouble className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>No beds found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
