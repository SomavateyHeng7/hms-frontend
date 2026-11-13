"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Leave } from "@/features/admin/staff/types";
import { CalendarIcon, Plus, Check, X, FileText } from "lucide-react";
import { format } from "date-fns";

interface LeaveManagementProps {
  staffId?: string;
}

export function LeaveManagement({ staffId }: LeaveManagementProps) {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [formData, setFormData] = useState({
    staffId: staffId || "",
    leaveType: "",
    halfDay: false,
    reason: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  // Mock data
  const leaveApplications: Leave[] = [
    {
      id: "1",
      leaveId: "LV-2025-001",
      staffId: "STF001",
      staffName: "Dr. John Smith",
      department: "Cardiology",
      leaveType: "sick",
      startDate: new Date(2025, 11, 25),
      endDate: new Date(2025, 11, 27),
      totalDays: 3,
      halfDay: false,
      reason: "Viral fever and need rest",
      appliedDate: new Date(2025, 11, 23),
      status: "pending",
    },
    {
      id: "2",
      leaveId: "LV-2025-002",
      staffId: "STF002",
      staffName: "Nurse Sarah Johnson",
      department: "Emergency",
      leaveType: "casual",
      startDate: new Date(2026, 0, 5),
      endDate: new Date(2026, 0, 7),
      totalDays: 3,
      halfDay: false,
      reason: "Family function",
      appliedDate: new Date(2025, 11, 28),
      status: "approved",
      reviewedBy: "Manager",
      reviewedDate: new Date(2025, 11, 29),
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Leave application:", { ...formData, startDate, endDate });
  };

  const handleChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleApprove = (leaveId: string) => {
    console.log("Approving leave:", leaveId);
  };

  const handleReject = (leaveId: string) => {
    console.log("Rejecting leave:", leaveId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500";
      case "rejected":
        return "bg-red-500";
      case "pending":
        return "bg-yellow-500";
      case "cancelled":
        return "bg-gray-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Leave Management</h2>
          <p className="text-muted-foreground">Manage staff leave applications</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Leave Application Form */}
        <Card>
          <CardHeader>
            <CardTitle>Apply for Leave</CardTitle>
            <CardDescription>Submit new leave application</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="staff">Staff Member *</Label>
                <Select
                  value={formData.staffId}
                  onValueChange={(value) => handleChange("staffId", value)}
                >
                  <SelectTrigger id="staff">
                    <SelectValue placeholder="Select staff" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="STF001">Dr. John Smith (Cardiology)</SelectItem>
                    <SelectItem value="STF002">Nurse Sarah (Emergency)</SelectItem>
                    <SelectItem value="STF003">Tech Mike (Radiology)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leaveType">Leave Type *</Label>
                <Select
                  value={formData.leaveType}
                  onValueChange={(value) => handleChange("leaveType", value)}
                >
                  <SelectTrigger id="leaveType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="casual">Casual Leave</SelectItem>
                    <SelectItem value="earned">Earned Leave</SelectItem>
                    <SelectItem value="maternity">Maternity Leave</SelectItem>
                    <SelectItem value="paternity">Paternity Leave</SelectItem>
                    <SelectItem value="unpaid">Unpaid Leave</SelectItem>
                    <SelectItem value="compensatory">Compensatory Off</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="startDate"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, "PPP") : "Select"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={startDate} onSelect={setStartDate} />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        id="endDate"
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={endDate} onSelect={setEndDate} />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason *</Label>
                <Textarea
                  id="reason"
                  placeholder="Reason for leave..."
                  value={formData.reason}
                  onChange={(e) => handleChange("reason", e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyName">Emergency Contact Name</Label>
                <Input
                  id="emergencyName"
                  placeholder="Contact name"
                  value={formData.emergencyContactName}
                  onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyPhone">Emergency Contact Phone</Label>
                <Input
                  id="emergencyPhone"
                  placeholder="Phone number"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Submit Leave Application
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Leave Balance */}
        <Card>
          <CardHeader>
            <CardTitle>Leave Balance</CardTitle>
            <CardDescription>Available leave days for 2025</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">Casual Leave</div>
                  <div className="text-sm text-muted-foreground">12 allocated</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">8</div>
                  <div className="text-xs text-muted-foreground">remaining</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">Sick Leave</div>
                  <div className="text-sm text-muted-foreground">10 allocated</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">7</div>
                  <div className="text-xs text-muted-foreground">remaining</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">Earned Leave</div>
                  <div className="text-sm text-muted-foreground">20 allocated</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">15</div>
                  <div className="text-xs text-muted-foreground">remaining</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-semibold">Compensatory Off</div>
                  <div className="text-sm text-muted-foreground">Earned</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">3</div>
                  <div className="text-xs text-muted-foreground">available</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leave Applications List */}
      <Card>
        <CardHeader>
          <CardTitle>Leave Applications</CardTitle>
          <CardDescription>Recent leave requests</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {leaveApplications.map((leave) => (
              <Card key={leave.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{leave.leaveId}</Badge>
                        <h3 className="font-semibold">{leave.staffName}</h3>
                        <Badge variant="secondary">{leave.department}</Badge>
                        <Badge className={`${getStatusColor(leave.status)} text-white capitalize`}>
                          {leave.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Leave Type</div>
                          <div className="font-medium capitalize">{leave.leaveType}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Duration</div>
                          <div className="font-medium">{leave.totalDays} day(s)</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">From</div>
                          <div className="font-medium">
                            {format(new Date(leave.startDate), "PP")}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">To</div>
                          <div className="font-medium">
                            {format(new Date(leave.endDate), "PP")}
                          </div>
                        </div>
                      </div>

                      <div className="text-sm">
                        <div className="text-muted-foreground">Reason</div>
                        <div>{leave.reason}</div>
                      </div>

                      {leave.reviewedBy && (
                        <div className="text-sm text-muted-foreground">
                          {leave.status === "approved" ? "Approved" : "Reviewed"} by {leave.reviewedBy} on{" "}
                          {leave.reviewedDate && format(new Date(leave.reviewedDate), "PP")}
                        </div>
                      )}
                    </div>

                    {leave.status === "pending" && (
                      <div className="flex gap-2 ml-4">
                        <Button size="sm" onClick={() => handleApprove(leave.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(leave.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
