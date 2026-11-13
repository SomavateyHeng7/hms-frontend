"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  FileText, 
  Heart, 
  Activity,
  Thermometer,
  Eye,
  Save,
  Clock,
  User,
  Calendar,
  Stethoscope
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { consultationNoteSchema, ConsultationNoteFormData } from "@/features/doctor/opd/validations";
import { OPDPatient } from "@/features/doctor/opd/types";
import { format } from "date-fns";

interface ConsultationNotesProps {
  patient: OPDPatient;
  onSave: (data: ConsultationNoteFormData) => Promise<void>;
  onCancel: () => void;
  doctorInfo: {
    id: string;
    name: string;
    department: string;
    license: string;
  };
}

export function ConsultationNotes({ patient, onSave, onCancel, doctorInfo }: ConsultationNotesProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTab, setCurrentTab] = useState("history");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<ConsultationNoteFormData>({
    resolver: zodResolver(consultationNoteSchema),
    defaultValues: {
      chiefComplaint: patient.visitInfo.chiefComplaint,
      reviewOfSystems: {
        constitutional: "",
        cardiovascular: "",
        respiratory: "",
        gastrointestinal: "",
        genitourinary: "",
        musculoskeletal: "",
        neurological: "",
        psychiatric: "",
        endocrine: "",
        hematologic: "",
        allergic: "",
      },
      physicalExamination: {
        vitalSigns: {
          temperature: 98.6,
          bloodPressure: "",
          heartRate: 72,
          respiratoryRate: 16,
          oxygenSaturation: 98,
          height: 0,
          weight: 0,
          bmi: 0,
        },
        generalAppearance: "",
        heent: "",
        cardiovascular: "",
        pulmonary: "",
        abdominal: "",
        musculoskeletal: "",
        neurological: "",
        skin: "",
        other: "",
      },
      differentialDiagnosis: [],
    },
  });

  const weight = watch("physicalExamination.vitalSigns.weight");
  const height = watch("physicalExamination.vitalSigns.height");

  React.useEffect(() => {
    if (weight > 0 && height > 0) {
      const heightInMeters = height / 100;
      const bmi = weight / (heightInMeters * heightInMeters);
      setValue("physicalExamination.vitalSigns.bmi", Math.round(bmi * 10) / 10);
    }
  }, [weight, height, setValue]);

  const handleFormSubmit = async (data: ConsultationNoteFormData) => {
    try {
      setIsSubmitting(true);
      await onSave(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getBMIStatus = (bmi: number) => {
    if (bmi < 18.5) return { status: "Underweight", color: "bg-blue-100 text-blue-800" };
    if (bmi < 25) return { status: "Normal", color: "bg-green-100 text-green-800" };
    if (bmi < 30) return { status: "Overweight", color: "bg-yellow-100 text-yellow-800" };
    return { status: "Obese", color: "bg-red-100 text-red-800" };
  };

  const renderPatientHeader = () => (
    <Card className="mb-6">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {patient.personalInfo.firstName} {patient.personalInfo.lastName}
              </h2>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>ID: {patient.registrationNumber}</span>
                <span>Age: {new Date().getFullYear() - new Date(patient.personalInfo.dateOfBirth).getFullYear()}</span>
                <span>Gender: {patient.personalInfo.gender}</span>
                <span>Visit: {patient.visitNumber}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(), "MMMM dd, yyyy")}
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Stethoscope className="h-4 w-4 text-blue-600" />
              Dr. {doctorInfo.name}
            </div>
            <div className="text-xs text-muted-foreground">{doctorInfo.department}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderHistory = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            Chief Complaint & History
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="chiefComplaint">Chief Complaint *</Label>
            <Textarea
              id="chiefComplaint"
              placeholder="Patient's main complaint in their own words"
              {...register("chiefComplaint")}
              className={errors.chiefComplaint ? "border-red-500" : ""}
            />
            {errors.chiefComplaint && (
              <p className="text-sm text-red-500">{errors.chiefComplaint.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="historyOfPresentIllness">History of Present Illness *</Label>
            <Textarea
              id="historyOfPresentIllness"
              placeholder="Detailed description of current symptoms, onset, duration, severity, associated symptoms, etc."
              rows={4}
              {...register("historyOfPresentIllness")}
              className={errors.historyOfPresentIllness ? "border-red-500" : ""}
            />
            {errors.historyOfPresentIllness && (
              <p className="text-sm text-red-500">{errors.historyOfPresentIllness.message}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Review of Systems</CardTitle>
          <CardDescription>
            Systematic review of body systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="constitutional">Constitutional</Label>
              <Textarea
                id="constitutional"
                placeholder="Fever, chills, weight changes, fatigue"
                {...register("reviewOfSystems.constitutional")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardiovascular">Cardiovascular</Label>
              <Textarea
                id="cardiovascular"
                placeholder="Chest pain, palpitations, shortness of breath"
                {...register("reviewOfSystems.cardiovascular")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="respiratory">Respiratory</Label>
              <Textarea
                id="respiratory"
                placeholder="Cough, dyspnea, wheezing"
                {...register("reviewOfSystems.respiratory")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gastrointestinal">Gastrointestinal</Label>
              <Textarea
                id="gastrointestinal"
                placeholder="Nausea, vomiting, diarrhea, constipation"
                {...register("reviewOfSystems.gastrointestinal")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genitourinary">Genitourinary</Label>
              <Textarea
                id="genitourinary"
                placeholder="Urinary frequency, urgency, dysuria"
                {...register("reviewOfSystems.genitourinary")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="musculoskeletal">Musculoskeletal</Label>
              <Textarea
                id="musculoskeletal"
                placeholder="Joint pain, muscle weakness, swelling"
                {...register("reviewOfSystems.musculoskeletal")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neurological">Neurological</Label>
              <Textarea
                id="neurological"
                placeholder="Headache, dizziness, seizures"
                {...register("reviewOfSystems.neurological")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="psychiatric">Psychiatric</Label>
              <Textarea
                id="psychiatric"
                placeholder="Mood changes, anxiety, depression"
                {...register("reviewOfSystems.psychiatric")}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderPhysicalExam = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-red-600" />
            Vital Signs
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="temperature">Temperature (°F) *</Label>
              <Input
                id="temperature"
                type="number"
                step="0.1"
                min="90"
                max="110"
                {...register("physicalExamination.vitalSigns.temperature", { valueAsNumber: true })}
                className={errors.physicalExamination?.vitalSigns?.temperature ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloodPressure">Blood Pressure *</Label>
              <Input
                id="bloodPressure"
                placeholder="120/80"
                {...register("physicalExamination.vitalSigns.bloodPressure")}
                className={errors.physicalExamination?.vitalSigns?.bloodPressure ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heartRate">Heart Rate (bpm) *</Label>
              <Input
                id="heartRate"
                type="number"
                min="40"
                max="200"
                {...register("physicalExamination.vitalSigns.heartRate", { valueAsNumber: true })}
                className={errors.physicalExamination?.vitalSigns?.heartRate ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="respiratoryRate">Respiratory Rate *</Label>
              <Input
                id="respiratoryRate"
                type="number"
                min="8"
                max="40"
                {...register("physicalExamination.vitalSigns.respiratoryRate", { valueAsNumber: true })}
                className={errors.physicalExamination?.vitalSigns?.respiratoryRate ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="oxygenSaturation">O2 Saturation (%) *</Label>
              <Input
                id="oxygenSaturation"
                type="number"
                min="70"
                max="100"
                {...register("physicalExamination.vitalSigns.oxygenSaturation", { valueAsNumber: true })}
                className={errors.physicalExamination?.vitalSigns?.oxygenSaturation ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="height">Height (cm) *</Label>
              <Input
                id="height"
                type="number"
                min="20"
                max="300"
                {...register("physicalExamination.vitalSigns.height", { valueAsNumber: true })}
                className={errors.physicalExamination?.vitalSigns?.height ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight">Weight (kg) *</Label>
              <Input
                id="weight"
                type="number"
                min="1"
                max="500"
                step="0.1"
                {...register("physicalExamination.vitalSigns.weight", { valueAsNumber: true })}
                className={errors.physicalExamination?.vitalSigns?.weight ? "border-red-500" : ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bmi">BMI</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="bmi"
                  type="number"
                  step="0.1"
                  {...register("physicalExamination.vitalSigns.bmi", { valueAsNumber: true })}
                  readOnly
                />
                {watch("physicalExamination.vitalSigns.bmi") > 0 && (
                  <Badge className={getBMIStatus(watch("physicalExamination.vitalSigns.bmi")).color}>
                    {getBMIStatus(watch("physicalExamination.vitalSigns.bmi")).status}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-purple-600" />
            Physical Examination
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="generalAppearance">General Appearance</Label>
              <Textarea
                id="generalAppearance"
                placeholder="Well-appearing, alert, oriented, no acute distress"
                {...register("physicalExamination.generalAppearance")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="heent">HEENT</Label>
              <Textarea
                id="heent"
                placeholder="Head, Eyes, Ears, Nose, Throat examination"
                {...register("physicalExamination.heent")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cardiovascularExam">Cardiovascular</Label>
              <Textarea
                id="cardiovascularExam"
                placeholder="Regular rate and rhythm, no murmurs"
                {...register("physicalExamination.cardiovascular")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pulmonaryExam">Pulmonary</Label>
              <Textarea
                id="pulmonaryExam"
                placeholder="Clear to auscultation bilaterally"
                {...register("physicalExamination.pulmonary")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="abdominalExam">Abdominal</Label>
              <Textarea
                id="abdominalExam"
                placeholder="Soft, non-tender, non-distended"
                {...register("physicalExamination.abdominal")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="musculoskeletalExam">Musculoskeletal</Label>
              <Textarea
                id="musculoskeletalExam"
                placeholder="Normal range of motion, no deformities"
                {...register("physicalExamination.musculoskeletal")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="neurologicalExam">Neurological</Label>
              <Textarea
                id="neurologicalExam"
                placeholder="Alert and oriented, normal reflexes"
                {...register("physicalExamination.neurological")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skinExam">Skin</Label>
              <Textarea
                id="skinExam"
                placeholder="Warm, dry, intact, no rashes"
                {...register("physicalExamination.skin")}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAssessmentPlan = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-green-600" />
            Assessment & Plan
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="assessment">Assessment *</Label>
            <Textarea
              id="assessment"
              placeholder="Clinical assessment based on history and physical examination"
              rows={3}
              {...register("assessment")}
              className={errors.assessment ? "border-red-500" : ""}
            />
            {errors.assessment && (
              <p className="text-sm text-red-500">{errors.assessment.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="plan">Plan *</Label>
            <Textarea
              id="plan"
              placeholder="Treatment plan including medications, procedures, follow-up, etc."
              rows={4}
              {...register("plan")}
              className={errors.plan ? "border-red-500" : ""}
            />
            {errors.plan && (
              <p className="text-sm text-red-500">{errors.plan.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="followUpInstructions">Follow-up Instructions</Label>
            <Textarea
              id="followUpInstructions"
              placeholder="Instructions for patient care, follow-up appointments, return precautions"
              rows={3}
              {...register("followUpInstructions")}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="nextAppointment">Next Appointment</Label>
            <Input
              id="nextAppointment"
              type="datetime-local"
              {...register("nextAppointment")}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Consultation Notes</h1>
        <p className="text-gray-600">Complete consultation documentation</p>
      </div>

      {renderPatientHeader()}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <Tabs value={currentTab} onValueChange={setCurrentTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="history">History & ROS</TabsTrigger>
            <TabsTrigger value="physical">Physical Exam</TabsTrigger>
            <TabsTrigger value="assessment">Assessment & Plan</TabsTrigger>
          </TabsList>

          <TabsContent value="history">{renderHistory()}</TabsContent>
          <TabsContent value="physical">{renderPhysicalExam()}</TabsContent>
          <TabsContent value="assessment">{renderAssessmentPlan()}</TabsContent>
        </Tabs>

        <div className="flex justify-between pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting && <Clock className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Consultation"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}