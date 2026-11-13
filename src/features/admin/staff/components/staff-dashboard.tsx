"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StaffRegistration } from "./staff-registration";
import { LeaveManagement } from "./leave-management";
import { Staff } from "@/features/admin/staff/types";
import { Users, UserPlus, Calendar, TrendingUp, Award, Clock } from "lucide-react";
import { useTabParam } from "@/hooks/use-tab-param";

export function StaffDashboard() {
  const [activeTab, setActiveTab] = useTabParam("overview", ["overview", "register", "leave"] as const);

  // Mock data
  const staff: Staff[] = [
    {
      id: "1",
      employeeId: "EMP001",
      firstName: "John",
      lastName: "Smith",
      fullName: "Dr. John Smith",
      email: "john.smith@hospital.com",
      phone: "1234567890",
      dateOfBirth: new Date(1985, 5, 15),
      gender: "male",
      address: "123 Main St",
      city: "New York",
      state: "NY",
      postalCode: "10001",
      nationality: "American",
      department: "Cardiology",
      position: "Senior Cardiologist",
      role: "doctor",
      specialization: "Interventional Cardiology",
      qualification: "MBBS, MD Cardiology",
      experience: 12,
      joiningDate: new Date(2018, 3, 1),
      employmentType: "full-time",
      employmentStatus: "active",
      licenseNumber: "MED12345",
      certifications: ["ACLS", "BLS"],
      shiftType: "flexible",
      workingHoursPerWeek: 40,
      salary: 150000,
      emergencyContact: {
        name: "Jane Smith",
        relationship: "Spouse",
        phone: "0987654321",
      },
      permissions: [],
      isActive: true,
    },
  ];

  const stats = {
    totalStaff: 250,
    activeStaff: 245,
    onLeave: 5,
    doctors: 45,
    nurses: 120,
    technicians: 50,
    adminStaff: 35,
    newJoining: 3,
    attendanceToday: 98,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Management</h1>
        <p className="text-muted-foreground">Manage hospital staff, attendance, and leave</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="register">Staff Registration</TabsTrigger>
          <TabsTrigger value="leave">Leave Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStaff}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeStaff} active · {stats.onLeave} on leave
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Today</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.attendanceToday}%</div>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${stats.attendanceToday}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Joining</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.newJoining}</div>
                <p className="text-xs text-muted-foreground">This month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.onLeave}</div>
                <p className="text-xs text-muted-foreground">Currently away</p>
              </CardContent>
            </Card>
          </div>

          {/* Staff by Department */}
          <Card>
            <CardHeader>
              <CardTitle>Staff by Department</CardTitle>
              <CardDescription>Distribution of staff across departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.doctors}</div>
                  <div className="text-sm text-muted-foreground">Doctors</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.nurses}</div>
                  <div className="text-sm text-muted-foreground">Nurses</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.technicians}</div>
                  <div className="text-sm text-muted-foreground">Technicians</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{stats.adminStaff}</div>
                  <div className="text-sm text-muted-foreground">Admin Staff</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Staff Members</CardTitle>
                  <CardDescription>All registered staff members</CardDescription>
                </div>
                <Button onClick={() => setActiveTab("register")}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Add Staff
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {staff.map((member) => (
                  <Card key={member.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-lg">{member.fullName}</h3>
                            <Badge variant="outline">{member.employeeId}</Badge>
                            <Badge
                              variant={member.isActive ? "default" : "secondary"}
                              className="capitalize"
                            >
                              {member.employmentStatus}
                            </Badge>
                          </div>

                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <div className="text-muted-foreground">Department</div>
                              <div className="font-medium">{member.department}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Position</div>
                              <div className="font-medium">{member.position}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Specialization</div>
                              <div className="font-medium">{member.specialization || "N/A"}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Experience</div>
                              <div className="font-medium">{member.experience} years</div>
                            </div>
                          </div>

                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Email: </span>
                              <span>{member.email}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Phone: </span>
                              <span>{member.phone}</span>
                            </div>
                          </div>

                          {member.certifications.length > 0 && (
                            <div className="flex items-center gap-2">
                              <Award className="h-4 w-4 text-muted-foreground" />
                              <div className="flex gap-1">
                                {member.certifications.map((cert, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {cert}
                                  </Badge>
                                ))}
                              </div>
                            </div>
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

        <TabsContent value="register">
          <StaffRegistration />
        </TabsContent>

        <TabsContent value="leave">
          <LeaveManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
