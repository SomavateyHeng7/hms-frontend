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
import { useT, useTranslateAny } from "@/lib/i18n/messages";
import { STAFF_KM } from "@/features/admin/staff/km";

export function StaffDashboard() {
  const t = useT(STAFF_KM);
  const tAny = useTranslateAny(STAFF_KM);
  const [activeTab, setActiveTab] = useTabParam("overview", ["overview", "register", "leave"] as const);

  // Mock data
  const staff: Staff[] = [
    {
      id: "1",
      employeeId: "EMP001",
      firstName: "Dara",
      lastName: "Sok",
      fullName: "Dr. Nhem Rithy",
      email: "rithy.nhem@hospital.gov.kh",
      phone: "1234567890",
      dateOfBirth: new Date(1985, 5, 15),
      gender: "male",
      address: "123 Main St",
      city: "Phnom Penh",
      state: "NY",
      postalCode: "10001",
      nationality: "Cambodian",
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
        name: "Chan Sreymom",
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
        <h1 className="text-3xl font-bold">{t("Staff Management")}</h1>
        <p className="text-muted-foreground">{t("Manage hospital staff, attendance, and leave")}</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">{t("Overview")}</TabsTrigger>
          <TabsTrigger value="register">{t("Staff Registration")}</TabsTrigger>
          <TabsTrigger value="leave">{t("Leave Management")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("Total Staff")}</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStaff}</div>
                <p className="text-xs text-muted-foreground">
                  {t("{activeStaff} active · {onLeave} on leave", { activeStaff: stats.activeStaff, onLeave: stats.onLeave })}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("Attendance Today")}</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.attendanceToday}%</div>
                <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500"
                    style={{ width: `${stats.attendanceToday}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("New Joining")}</CardTitle>
                <UserPlus className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.newJoining}</div>
                <p className="text-xs text-muted-foreground">{t("This month")}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{t("On Leave")}</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.onLeave}</div>
                <p className="text-xs text-muted-foreground">{t("Currently away")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Staff by Department */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Staff by Department")}</CardTitle>
              <CardDescription>{t("Distribution of staff across departments")}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{stats.doctors}</div>
                  <div className="text-sm text-muted-foreground">{t("Doctors")}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.nurses}</div>
                  <div className="text-sm text-muted-foreground">{t("Nurses")}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{stats.technicians}</div>
                  <div className="text-sm text-muted-foreground">{t("Technicians")}</div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{stats.adminStaff}</div>
                  <div className="text-sm text-muted-foreground">{t("Admin Staff")}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staff List */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{t("Staff Members")}</CardTitle>
                  <CardDescription>{t("All registered staff members")}</CardDescription>
                </div>
                <Button onClick={() => setActiveTab("register")}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  {t("Add Staff")}
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
                              <div className="text-muted-foreground">{t("Department")}</div>
                              <div className="font-medium">{tAny(member.department)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">{t("Position")}</div>
                              <div className="font-medium">{tAny(member.position)}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">{t("Specialization")}</div>
                              <div className="font-medium">{member.specialization || "N/A"}</div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">{t("Experience")}</div>
                              <div className="font-medium">{t("{experience} years", { experience: member.experience })}</div>
                            </div>
                          </div>

                          <div className="flex gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">{t("Email:")} </span>
                              <span>{member.email}</span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">{t("Phone:")} </span>
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
