"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { CalendarIcon, QrCode, Barcode, CreditCard } from "lucide-react";
import { patientRegistrationSchema, PatientRegistrationFormData } from "@/lib/validations/patient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface PatientRegistrationFormProps {
  onSubmit: (data: PatientRegistrationFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<PatientRegistrationFormData>;
  isEditing?: boolean;
}

export function PatientRegistrationForm({
  onSubmit,
  onCancel,
  initialData,
  isEditing = false
}: PatientRegistrationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    trigger
  } = useForm<PatientRegistrationFormData>({
    resolver: zodResolver(patientRegistrationSchema),
    defaultValues: initialData || {
      gender: undefined,
      emergencyContact: {
        name: "",
        relationship: "",
        phone: ""
      },
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        country: "USA"
      }
    }
  });

  const watchedDateOfBirth = watch("dateOfBirth");

  const handleFormSubmit = async (data: PatientRegistrationFormData) => {
    setIsSubmitting(true);
    try {
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const bloodTypes = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
  const relationships = ["Spouse", "Parent", "Child", "Sibling", "Friend", "Other"];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Basic patient details and contact information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name *</Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Enter first name"
                className={errors.firstName ? "border-red-500" : ""}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500">{errors.firstName.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="middleName">Middle Name</Label>
              <Input
                id="middleName"
                {...register("middleName")}
                placeholder="Enter middle name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name *</Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Enter last name"
                className={errors.lastName ? "border-red-500" : ""}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500">{errors.lastName.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date of Birth *</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !watchedDateOfBirth && "text-muted-foreground",
                      errors.dateOfBirth && "border-red-500"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {watchedDateOfBirth ? format(watchedDateOfBirth, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={watchedDateOfBirth}
                    onSelect={(date) => {
                      setValue("dateOfBirth", date as Date);
                      trigger("dateOfBirth");
                    }}
                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.dateOfBirth && (
                <p className="text-sm text-red-500">{errors.dateOfBirth.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Gender *</Label>
              <Select onValueChange={(value) => setValue("gender", value as any)}>
                <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <p className="text-sm text-red-500">{errors.gender.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Blood Type</Label>
              <Select onValueChange={(value) => setValue("bloodType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select blood type" />
                </SelectTrigger>
                <SelectContent>
                  {bloodTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter email address"
                className={errors.email ? "border-red-500" : ""}
              />
              {errors.email && (
                <p className="text-sm text-red-500">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Enter phone number"
                className={errors.phone ? "border-red-500" : ""}
              />
              {errors.phone && (
                <p className="text-sm text-red-500">{errors.phone.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Address Information */}
      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
          <CardDescription>Patient's residential address details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              {...register("address.street")}
              placeholder="Enter street address"
              className={errors.address?.street ? "border-red-500" : ""}
            />
            {errors.address?.street && (
              <p className="text-sm text-red-500">{errors.address.street.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="city">City *</Label>
              <Input
                id="city"
                {...register("address.city")}
                placeholder="Enter city"
                className={errors.address?.city ? "border-red-500" : ""}
              />
              {errors.address?.city && (
                <p className="text-sm text-red-500">{errors.address.city.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input
                id="state"
                {...register("address.state")}
                placeholder="Enter state"
                className={errors.address?.state ? "border-red-500" : ""}
              />
              {errors.address?.state && (
                <p className="text-sm text-red-500">{errors.address.state.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="zipCode">ZIP Code *</Label>
              <Input
                id="zipCode"
                {...register("address.zipCode")}
                placeholder="Enter ZIP code"
                className={errors.address?.zipCode ? "border-red-500" : ""}
              />
              {errors.address?.zipCode && (
                <p className="text-sm text-red-500">{errors.address.zipCode.message}</p>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              {...register("address.country")}
              placeholder="Enter country"
              className={errors.address?.country ? "border-red-500" : ""}
            />
            {errors.address?.country && (
              <p className="text-sm text-red-500">{errors.address.country.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contact */}
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contact</CardTitle>
          <CardDescription>Contact information for emergencies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyName">Emergency Contact Name *</Label>
            <Input
              id="emergencyName"
              {...register("emergencyContact.name")}
              placeholder="Enter emergency contact name"
              className={errors.emergencyContact?.name ? "border-red-500" : ""}
            />
            {errors.emergencyContact?.name && (
              <p className="text-sm text-red-500">{errors.emergencyContact.name.message}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Relationship *</Label>
              <Select onValueChange={(value) => setValue("emergencyContact.relationship", value)}>
                <SelectTrigger className={errors.emergencyContact?.relationship ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select relationship" />
                </SelectTrigger>
                <SelectContent>
                  {relationships.map((relationship) => (
                    <SelectItem key={relationship} value={relationship}>
                      {relationship}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.emergencyContact?.relationship && (
                <p className="text-sm text-red-500">{errors.emergencyContact.relationship.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyPhone">Emergency Contact Phone *</Label>
              <Input
                id="emergencyPhone"
                {...register("emergencyContact.phone")}
                placeholder="Enter emergency contact phone"
                className={errors.emergencyContact?.phone ? "border-red-500" : ""}
              />
              {errors.emergencyContact?.phone && (
                <p className="text-sm text-red-500">{errors.emergencyContact.phone.message}</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medical Information */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Information</CardTitle>
          <CardDescription>Patient's medical history and current medications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medicalHistory">Medical History</Label>
            <Textarea
              id="medicalHistory"
              {...register("medicalHistory")}
              placeholder="Enter patient's medical history, previous diagnoses, surgeries, etc."
              rows={3}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="allergies">Allergies</Label>
            <Textarea
              id="allergies"
              {...register("allergies")}
              placeholder="Enter any known allergies (medications, food, environmental, etc.)"
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentMedications">Current Medications</Label>
            <Textarea
              id="currentMedications"
              {...register("currentMedications")}
              placeholder="Enter current medications and dosages"
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Insurance Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Insurance Information
          </CardTitle>
          <CardDescription>Patient's insurance provider and policy details (optional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="insuranceProvider">Insurance Provider</Label>
              <Input
                id="insuranceProvider"
                {...register("insurance.provider")}
                placeholder="Enter insurance provider name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="membershipId">Membership ID</Label>
              <Input
                id="membershipId"
                {...register("insurance.membershipId")}
                placeholder="Enter membership ID"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="policyNumber">Policy Number</Label>
              <Input
                id="policyNumber"
                {...register("insurance.policyNumber")}
                placeholder="Enter policy number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="groupNumber">Group Number</Label>
              <Input
                id="groupNumber"
                {...register("insurance.groupNumber")}
                placeholder="Enter group number (if applicable)"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : isEditing ? "Update Patient" : "Register Patient"}
        </Button>
      </div>
    </form>
  );
}