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
import { CalendarIcon, Plus, Save } from "lucide-react";
import { useDateFormat, useT } from "@/lib/i18n/messages";
import { STAFF_KM } from "@/features/admin/staff/km";

interface StaffRegistrationProps {
  onSubmit?: (data: any) => void;
}

export function StaffRegistration({ onSubmit }: StaffRegistrationProps) {
  const t = useT(STAFF_KM);
  const fmt = useDateFormat();
  const [dateOfBirth, setDateOfBirth] = useState<Date>();
  const [joiningDate, setJoiningDate] = useState<Date>(new Date());
  const [licenseExpiry, setLicenseExpiry] = useState<Date>();

  const [formData, setFormData] = useState({
    employeeId: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    alternatePhone: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    nationality: "",
    
    department: "",
    position: "",
    role: "",
    specialization: "",
    qualification: "",
    experience: "",
    employmentType: "",
    
    licenseNumber: "",
    shiftType: "",
    workingHoursPerWeek: "",
    salary: "",
    
    emergencyContactName: "",
    emergencyContactRelation: "",
    emergencyContactPhone: "",
    
    notes: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      ...formData,
      dateOfBirth,
      joiningDate,
      licenseExpiry,
    };
    console.log("Staff registration:", data);
    onSubmit?.(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">{t("Staff Registration")}</h2>
        <p className="text-muted-foreground">{t("Register new staff member")}</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Personal Information")}</CardTitle>
              <CardDescription>{t("Basic details of the staff member")}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employeeId">{t("Employee ID *")}</Label>
                <Input
                  id="employeeId"
                  placeholder={"EMP001"}
                  value={formData.employeeId}
                  onChange={(e) => handleChange("employeeId", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="firstName">{t("First Name *")}</Label>
                <Input
                  id="firstName"
                  placeholder={t("Dara")}
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">{t("Last Name *")}</Label>
                <Input
                  id="lastName"
                  placeholder={t("Sok")}
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("Email *")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={"dara.sok@hospital.gov.kh"}
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t("Phone *")}</Label>
                <Input
                  id="phone"
                  placeholder="1234567890"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="alternatePhone">{t("Alternate Phone")}</Label>
                <Input
                  id="alternatePhone"
                  placeholder="0987654321"
                  value={formData.alternatePhone}
                  onChange={(e) => handleChange("alternatePhone", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">{t("Date of Birth *")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="dateOfBirth"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dateOfBirth ? fmt(dateOfBirth, "PPP") : t("Select date")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={dateOfBirth} onSelect={setDateOfBirth} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gender">{t("Gender *")}</Label>
                <Select value={formData.gender} onValueChange={(value) => handleChange("gender", value)}>
                  <SelectTrigger id="gender">
                    <SelectValue placeholder={t("Select gender")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("Male")}</SelectItem>
                    <SelectItem value="female">{t("Female")}</SelectItem>
                    <SelectItem value="other">{t("Other")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">{t("Address *")}</Label>
                <Input
                  id="address"
                  placeholder={t("Street address")}
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="city">{t("City *")}</Label>
                <Input
                  id="city"
                  placeholder={t("City")}
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">{t("State *")}</Label>
                <Input
                  id="state"
                  placeholder={t("State")}
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="postalCode">{t("Postal Code *")}</Label>
                <Input
                  id="postalCode"
                  placeholder="123456"
                  value={formData.postalCode}
                  onChange={(e) => handleChange("postalCode", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nationality">{t("Nationality *")}</Label>
                <Input
                  id="nationality"
                  placeholder={t("Nationality")}
                  value={formData.nationality}
                  onChange={(e) => handleChange("nationality", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Employment Details */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Employment Details")}</CardTitle>
              <CardDescription>{t("Job and professional information")}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">{t("Department *")}</Label>
                <Select value={formData.department} onValueChange={(value) => handleChange("department", value)}>
                  <SelectTrigger id="department">
                    <SelectValue placeholder={t("Select department")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cardiology">{t("Cardiology")}</SelectItem>
                    <SelectItem value="surgery">{t("Surgery")}</SelectItem>
                    <SelectItem value="emergency">{t("Emergency")}</SelectItem>
                    <SelectItem value="radiology">{t("Radiology")}</SelectItem>
                    <SelectItem value="laboratory">{t("Laboratory")}</SelectItem>
                    <SelectItem value="admin">{t("Administration")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="position">{t("Position *")}</Label>
                <Input
                  id="position"
                  placeholder={t("e.g., Senior Nurse")}
                  value={formData.position}
                  onChange={(e) => handleChange("position", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">{t("Role *")}</Label>
                <Select value={formData.role} onValueChange={(value) => handleChange("role", value)}>
                  <SelectTrigger id="role">
                    <SelectValue placeholder={t("Select role")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doctor">{t("Doctor")}</SelectItem>
                    <SelectItem value="nurse">{t("Nurse")}</SelectItem>
                    <SelectItem value="technician">{t("Technician")}</SelectItem>
                    <SelectItem value="admin">{t("Admin")}</SelectItem>
                    <SelectItem value="support">{t("Support")}</SelectItem>
                    <SelectItem value="management">{t("Management")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialization">{t("Specialization")}</Label>
                <Input
                  id="specialization"
                  placeholder={t("e.g., Cardiology")}
                  value={formData.specialization}
                  onChange={(e) => handleChange("specialization", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="qualification">{t("Qualification *")}</Label>
                <Input
                  id="qualification"
                  placeholder={t("e.g., MD, Medical Doctor")}
                  value={formData.qualification}
                  onChange={(e) => handleChange("qualification", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience">{t("Experience (years) *")}</Label>
                <Input
                  id="experience"
                  type="number"
                  placeholder="5"
                  value={formData.experience}
                  onChange={(e) => handleChange("experience", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="joiningDate">{t("Joining Date *")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="joiningDate"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {joiningDate ? fmt(joiningDate, "PPP") : t("Select date")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={joiningDate} onSelect={(date) => date && setJoiningDate(date)} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="employmentType">{t("Employment Type *")}</Label>
                <Select value={formData.employmentType} onValueChange={(value) => handleChange("employmentType", value)}>
                  <SelectTrigger id="employmentType">
                    <SelectValue placeholder={t("Select type")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full-time">{t("Full-time")}</SelectItem>
                    <SelectItem value="part-time">{t("Part-time")}</SelectItem>
                    <SelectItem value="contract">{t("Contract")}</SelectItem>
                    <SelectItem value="consultant">{t("Consultant")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseNumber">{t("License Number")}</Label>
                <Input
                  id="licenseNumber"
                  placeholder={"LIC123456"}
                  value={formData.licenseNumber}
                  onChange={(e) => handleChange("licenseNumber", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseExpiry">{t("License Expiry")}</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="licenseExpiry"
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {licenseExpiry ? fmt(licenseExpiry, "PPP") : t("Select date")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={licenseExpiry} onSelect={setLicenseExpiry} />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="shiftType">{t("Shift Type *")}</Label>
                <Select value={formData.shiftType} onValueChange={(value) => handleChange("shiftType", value)}>
                  <SelectTrigger id="shiftType">
                    <SelectValue placeholder={t("Select shift")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="morning">{t("Morning")}</SelectItem>
                    <SelectItem value="afternoon">{t("Afternoon")}</SelectItem>
                    <SelectItem value="night">{t("Night")}</SelectItem>
                    <SelectItem value="rotating">{t("Rotating")}</SelectItem>
                    <SelectItem value="flexible">{t("Flexible")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="workingHours">{t("Working Hours/Week *")}</Label>
                <Input
                  id="workingHours"
                  type="number"
                  placeholder="40"
                  value={formData.workingHoursPerWeek}
                  onChange={(e) => handleChange("workingHoursPerWeek", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary">{t("Salary *")}</Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="50000"
                  value={formData.salary}
                  onChange={(e) => handleChange("salary", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Emergency Contact")}</CardTitle>
              <CardDescription>{t("Contact person in case of emergency")}</CardDescription>
            </CardHeader>
            <CardContent className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergencyContactName">{t("Name *")}</Label>
                <Input
                  id="emergencyContactName"
                  placeholder={t("Emergency contact name")}
                  value={formData.emergencyContactName}
                  onChange={(e) => handleChange("emergencyContactName", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactRelation">{t("Relationship *")}</Label>
                <Input
                  id="emergencyContactRelation"
                  placeholder={t("e.g., Spouse, Parent")}
                  value={formData.emergencyContactRelation}
                  onChange={(e) => handleChange("emergencyContactRelation", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyContactPhone">{t("Phone *")}</Label>
                <Input
                  id="emergencyContactPhone"
                  placeholder="1234567890"
                  value={formData.emergencyContactPhone}
                  onChange={(e) => handleChange("emergencyContactPhone", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle>{t("Additional Notes")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                id="notes"
                placeholder={t("Any additional information...")}
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                rows={3}
              />
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline">
              {t("Cancel")}
            </Button>
            <Button type="submit">
              <Save className="mr-2 h-4 w-4" />
              {t("Register Staff")}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
