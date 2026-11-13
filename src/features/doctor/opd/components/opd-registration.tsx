"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  Users, 
  Calendar,
  FileText,
  Phone,
  MapPin,
  Shield,
  Heart,
  AlertCircle,
  Clock,
  CheckCircle2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { opdRegistrationSchema, OPDRegistrationFormData } from "@/features/doctor/opd/validations";
import { OPDPatient } from "@/features/doctor/opd/types";
import { useT, useTranslateAny } from "@/lib/i18n/messages";
import { OPD_KM } from "@/features/doctor/opd/km";

interface OPDRegistrationProps {
  onSubmit: (data: OPDRegistrationFormData) => Promise<void>;
  onCancel: () => void;
  departments: Array<{ id: string; name: string; }>;
  doctors: Array<{ id: string; name: string; department: string; }>;
}

export function OPDRegistration({ onSubmit, onCancel, departments, doctors }: OPDRegistrationProps) {
  const tAny = useTranslateAny(OPD_KM);
  const t = useT(OPD_KM);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm<OPDRegistrationFormData>({
    resolver: zodResolver(opdRegistrationSchema),
    defaultValues: {
      personalInfo: {
        gender: "male",
      },
      insurance: {
        hasInsurance: false,
        copay: 0,
      },
      visitInfo: {
        visitType: "new_patient",
        department: "",
      },
    },
  });

  const hasInsurance = watch("insurance.hasInsurance");

  const handleFormSubmit = async (data: OPDRegistrationFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    {
      id: 1,
      title: t("Personal Information"),
      icon: Users,
      description: t("Basic patient details and contact information")
    },
    {
      id: 2,
      title: t("Address & Insurance"),
      icon: MapPin,
      description: t("Address details and insurance information")
    },
    {
      id: 3,
      title: t("Medical History"),
      icon: Heart,
      description: t("Medical background and health information")
    },
    {
      id: 4,
      title: t("Visit Information"),
      icon: Calendar,
      description: t("Appointment and visit details")
    }
  ];

  const renderStepIndicator = () => (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center">
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center border-2 mb-2
                ${isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                  isActive ? 'bg-blue-500 border-blue-500 text-white' : 
                  'border-border text-muted-foreground'}
              `}>
                {isCompleted ? <CheckCircle2 className="h-6 w-6" /> : <Icon className="h-6 w-6" />}
              </div>
              <div className="text-center">
                <div className={`text-sm font-medium ${isActive ? 'text-blue-600' : 'text-muted-foreground'}`}>
                  {step.title}
                </div>
                <div className="text-xs text-muted-foreground max-w-32">
                  {step.description}
                </div>
              </div>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderPersonalInfo = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">{t("First Name *")}</Label>
          <Input
            id="firstName"
            {...register("personalInfo.firstName")}
            className={errors.personalInfo?.firstName ? "border-red-500" : ""}
          />
          {errors.personalInfo?.firstName && (
            <p className="text-sm text-red-500">{tAny(errors.personalInfo.firstName.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">{t("Last Name *")}</Label>
          <Input
            id="lastName"
            {...register("personalInfo.lastName")}
            className={errors.personalInfo?.lastName ? "border-red-500" : ""}
          />
          {errors.personalInfo?.lastName && (
            <p className="text-sm text-red-500">{tAny(errors.personalInfo.lastName.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth">{t("Date of Birth *")}</Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register("personalInfo.dateOfBirth")}
            className={errors.personalInfo?.dateOfBirth ? "border-red-500" : ""}
          />
          {errors.personalInfo?.dateOfBirth && (
            <p className="text-sm text-red-500">{tAny(errors.personalInfo.dateOfBirth.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender">{t("Gender *")}</Label>
          <Select onValueChange={(value) => setValue("personalInfo.gender", value as any)}>
            <SelectTrigger>
              <SelectValue placeholder={t("Select gender")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="male">{t("Male")}</SelectItem>
              <SelectItem value="female">{t("Female")}</SelectItem>
              <SelectItem value="other">{t("Other")}</SelectItem>
            </SelectContent>
          </Select>
          {errors.personalInfo?.gender && (
            <p className="text-sm text-red-500">{tAny(errors.personalInfo.gender.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">{t("Phone Number *")}</Label>
          <Input
            id="phoneNumber"
            type="tel"
            {...register("personalInfo.phoneNumber")}
            className={errors.personalInfo?.phoneNumber ? "border-red-500" : ""}
          />
          {errors.personalInfo?.phoneNumber && (
            <p className="text-sm text-red-500">{tAny(errors.personalInfo.phoneNumber.message)}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">{t("Email")}</Label>
          <Input
            id="email"
            type="email"
            {...register("personalInfo.email")}
            className={errors.personalInfo?.email ? "border-red-500" : ""}
          />
          {errors.personalInfo?.email && (
            <p className="text-sm text-red-500">{tAny(errors.personalInfo.email.message)}</p>
          )}
        </div>
      </div>

      <Card className="bg-orange-50 border-orange-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertCircle className="h-5 w-5" />
            {t("Emergency Contact")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactName">{t("Contact Name *")}</Label>
              <Input
                id="emergencyContactName"
                {...register("personalInfo.emergencyContactName")}
                className={errors.personalInfo?.emergencyContactName ? "border-red-500" : ""}
              />
              {errors.personalInfo?.emergencyContactName && (
                <p className="text-sm text-red-500">{tAny(errors.personalInfo.emergencyContactName.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">{t("Contact Phone *")}</Label>
              <Input
                id="emergencyContactPhone"
                type="tel"
                {...register("personalInfo.emergencyContactPhone")}
                className={errors.personalInfo?.emergencyContactPhone ? "border-red-500" : ""}
              />
              {errors.personalInfo?.emergencyContactPhone && (
                <p className="text-sm text-red-500">{tAny(errors.personalInfo.emergencyContactPhone.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergencyContactRelation">{t("Relationship *")}</Label>
              <Input
                id="emergencyContactRelation"
                {...register("personalInfo.emergencyContactRelation")}
                className={errors.personalInfo?.emergencyContactRelation ? "border-red-500" : ""}
              />
              {errors.personalInfo?.emergencyContactRelation && (
                <p className="text-sm text-red-500">{tAny(errors.personalInfo.emergencyContactRelation.message)}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAddressInsurance = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-blue-600" />
            {t("Address Information")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">{t("Street Address *")}</Label>
            <Input
              id="street"
              {...register("address.street")}
              className={errors.address?.street ? "border-red-500" : ""}
            />
            {errors.address?.street && (
              <p className="text-sm text-red-500">{tAny(errors.address.street.message)}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">{t("City *")}</Label>
              <Input
                id="city"
                {...register("address.city")}
                className={errors.address?.city ? "border-red-500" : ""}
              />
              {errors.address?.city && (
                <p className="text-sm text-red-500">{tAny(errors.address.city.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">{t("State *")}</Label>
              <Input
                id="state"
                {...register("address.state")}
                className={errors.address?.state ? "border-red-500" : ""}
              />
              {errors.address?.state && (
                <p className="text-sm text-red-500">{tAny(errors.address.state.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="zipCode">{t("ZIP Code *")}</Label>
              <Input
                id="zipCode"
                {...register("address.zipCode")}
                className={errors.address?.zipCode ? "border-red-500" : ""}
              />
              {errors.address?.zipCode && (
                <p className="text-sm text-red-500">{tAny(errors.address.zipCode.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">{t("Country *")}</Label>
              <Input
                id="country"
                {...register("address.country")}
                className={errors.address?.country ? "border-red-500" : ""}
              />
              {errors.address?.country && (
                <p className="text-sm text-red-500">{tAny(errors.address.country.message)}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            {t("Insurance Information")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasInsurance"
              checked={hasInsurance}
              onCheckedChange={(checked) => setValue("insurance.hasInsurance", checked as boolean)}
            />
            <Label htmlFor="hasInsurance">{t("Patient has insurance coverage")}</Label>
          </div>

          {hasInsurance && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="insuranceProvider">{t("Insurance Provider")}</Label>
                <Input
                  id="insuranceProvider"
                  {...register("insurance.provider")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="policyNumber">{t("Policy Number")}</Label>
                <Input
                  id="policyNumber"
                  {...register("insurance.policyNumber")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="groupNumber">{t("Group Number")}</Label>
                <Input
                  id="groupNumber"
                  {...register("insurance.groupNumber")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validUntil">{t("Valid Until")}</Label>
                <Input
                  id="validUntil"
                  type="date"
                  {...register("insurance.validUntil")}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="copay">{t("Co-pay Amount ($)")}</Label>
                <Input
                  id="copay"
                  type="number"
                  min="0"
                  step="0.01"
                  {...register("insurance.copay", { valueAsNumber: true })}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderMedicalHistory = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-600" />
            {t("Medical History")}
          </CardTitle>
          <CardDescription>
            {t("Please provide detailed medical history information")}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="allergies">{t("Allergies")}</Label>
            <Textarea
              id="allergies"
              placeholder={t("List any known allergies (medications, foods, environmental, etc.)")}
              {...register("medicalHistory.allergies")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="currentMedications">{t("Current Medications")}</Label>
            <Textarea
              id="currentMedications"
              placeholder={t("List all current medications, supplements, and vitamins")}
              {...register("medicalHistory.currentMedications")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pastMedicalHistory">{t("Past Medical History")}</Label>
            <Textarea
              id="pastMedicalHistory"
              placeholder={t("Previous illnesses, surgeries, hospitalizations, chronic conditions")}
              {...register("medicalHistory.pastMedicalHistory")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="familyHistory">{t("Family History")}</Label>
            <Textarea
              id="familyHistory"
              placeholder={t("Family medical history (heart disease, diabetes, cancer, etc.)")}
              {...register("medicalHistory.familyHistory")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="socialHistory">{t("Social History")}</Label>
            <Textarea
              id="socialHistory"
              placeholder={t("Smoking, alcohol use, occupation, lifestyle factors")}
              {...register("medicalHistory.socialHistory")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderVisitInfo = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-purple-600" />
            {t("Visit Information")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">{t("Department *")}</Label>
              <Select onValueChange={(value) => setValue("visitInfo.department", value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Select department")} />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.visitInfo?.department && (
                <p className="text-sm text-red-500">{tAny(errors.visitInfo.department.message)}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="visitType">{t("Visit Type *")}</Label>
              <Select onValueChange={(value) => setValue("visitInfo.visitType", value as any)}>
                <SelectTrigger>
                  <SelectValue placeholder={t("Select visit type")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new_patient">{t("New Patient")}</SelectItem>
                  <SelectItem value="follow_up">{t("Follow-up")}</SelectItem>
                  <SelectItem value="emergency">{t("Emergency")}</SelectItem>
                  <SelectItem value="consultation">{t("Consultation")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.visitInfo?.visitType && (
                <p className="text-sm text-red-500">{tAny(errors.visitInfo.visitType.message)}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="chiefComplaint">{t("Chief Complaint *")}</Label>
            <Textarea
              id="chiefComplaint"
              placeholder={t("Describe the main reason for today's visit")}
              {...register("visitInfo.chiefComplaint")}
              className={errors.visitInfo?.chiefComplaint ? "border-red-500" : ""}
            />
            {errors.visitInfo?.chiefComplaint && (
              <p className="text-sm text-red-500">{tAny(errors.visitInfo.chiefComplaint.message)}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="referringDoctor">{t("Referring Doctor")}</Label>
              <Input
                id="referringDoctor"
                placeholder={t("Name of referring physician (if any)")}
                {...register("visitInfo.referringDoctor")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferredAppointmentTime">{t("Preferred Appointment Time")}</Label>
              <Input
                id="preferredAppointmentTime"
                type="datetime-local"
                {...register("visitInfo.preferredAppointmentTime")}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">{t("OPD Registration")}</h1>
        <p className="text-muted-foreground">{t("Complete patient registration for outpatient services")}</p>
      </div>

      {renderStepIndicator()}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        {currentStep === 1 && renderPersonalInfo()}
        {currentStep === 2 && renderAddressInsurance()}
        {currentStep === 3 && renderMedicalHistory()}
        {currentStep === 4 && renderVisitInfo()}

        <div className="flex justify-between pt-6">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                {t("Previous")}
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              {t("Cancel")}
            </Button>

            {currentStep < 4 ? (
              <Button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                {t("Next")}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2"
              >
                {isSubmitting && <Clock className="h-4 w-4 animate-spin" />}
                {isSubmitting ? t("Registering...") : t("Complete Registration")}
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}