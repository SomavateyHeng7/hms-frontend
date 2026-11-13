"use client";

import { useState, type KeyboardEvent } from "react";
import { useForm, useWatch, Controller, type Control, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, X } from "lucide-react";
import { consentFormSchema, type ConsentFormData } from "@/features/doctor/medical-records/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useT, useTranslateAny } from "@/lib/i18n/messages";
import { RECORDS_KM } from "@/features/doctor/medical-records/km";

export const CONSENT_TYPE_LABELS: Record<ConsentFormData["consentType"], string> = {
  surgery: "Surgery",
  procedure: "Procedure",
  anesthesia: "Anesthesia",
  "blood-transfusion": "Blood Transfusion",
  research: "Research Participation",
  photography: "Clinical Photography",
  "general-treatment": "General Treatment",
  other: "Other",
};

const CONSENTER_LABELS: Record<ConsentFormData["consentGivenBy"], string> = {
  patient: "Patient",
  guardian: "Guardian",
  "legal-representative": "Legal Representative",
};

interface ConsentFormProps {
  patients: { id: string; name: string }[];
  onSubmit: (data: ConsentFormData) => void | Promise<void>;
  onCancel?: () => void;
  initialData?: Partial<ConsentFormData>;
}

function FieldErrorText({ error }: { error?: { message?: string } }) {
  const tAny = useTranslateAny(RECORDS_KM);
  return error?.message ? <p className="text-sm text-red-500">{tAny(error.message)}</p> : null;
}

function ListField({
  name,
  label,
  placeholder,
  required,
  control,
}: {
  name: "risks" | "benefits" | "alternatives";
  label: string;
  placeholder: string;
  required?: boolean;
  control: Control<ConsentFormData>;
}) {
  const [draft, setDraft] = useState("");

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => {
        const items = field.value ?? [];
        const add = () => {
          const value = draft.trim();
          if (!value || items.includes(value)) return;
          field.onChange([...items, value]);
          setDraft("");
        };
        const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
          if (e.key === "Enter") {
            e.preventDefault();
            add();
          }
        };
        const error = fieldState.error as (FieldError & { root?: FieldError }) | undefined;

        return (
          <div className="space-y-2">
            <Label htmlFor={`${name}-input`}>
              {label}
              {required && " *"}
            </Label>
            <div className="flex gap-2">
              <Input
                id={`${name}-input`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={onKeyDown}
                onBlur={field.onBlur}
                placeholder={placeholder}
                className={error ? "border-red-500" : ""}
              />
              <Button type="button" variant="outline" size="icon" onClick={add} aria-label={`Add ${label.toLowerCase()}`}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {items.length > 0 && (
              <ul className="space-y-1">
                {items.map((item, i) => (
                  <li key={item} className="flex items-center justify-between rounded-md border px-3 py-1.5 text-sm">
                    <span>{item}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => field.onChange(items.filter((_, j) => j !== i))}
                      aria-label={`Remove ${item}`}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
            <FieldErrorText error={error?.root ?? error} />
          </div>
        );
      }}
    />
  );
}

export function ConsentForm({ patients, onSubmit, onCancel, initialData }: ConsentFormProps) {
  const t = useT(RECORDS_KM);
  const tAny = useTranslateAny(RECORDS_KM);
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ConsentFormData>({
    resolver: zodResolver(consentFormSchema),
    defaultValues: {
      patientId: "",
      consentType: "procedure",
      procedureName: "",
      procedureDescription: "",
      relatedProcedureId: "",
      risks: [],
      benefits: [],
      alternatives: [],
      explainedBy: "",
      explainedByDesignation: "",
      patientUnderstands: false,
      questionsAnswered: false,
      consentGivenBy: "patient",
      guardianName: "",
      guardianRelation: "",
      guardianPhone: "",
      signatureName: "",
      witnessName: "",
      ...initialData,
    },
  });

  const consentGivenBy = useWatch({ control, name: "consentGivenBy" });
  const patientId = useWatch({ control, name: "patientId" });
  const patientName = patients.find((p) => p.id === patientId)?.name;
  const consenterIsPatient = consentGivenBy === "patient";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      <Card>
        <CardHeader>
          <CardTitle>{t("Procedure Details")}</CardTitle>
          <CardDescription>{t("What the patient is consenting to")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="consent-patient">{t("Patient *")}</Label>
              <Controller
                control={control}
                name="patientId"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="consent-patient" className={errors.patientId ? "border-red-500" : ""}>
                      <SelectValue placeholder={t("Select patient")} />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name} ({p.id})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              <FieldErrorText error={errors.patientId} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="consent-type">{t("Consent Type *")}</Label>
              <Controller
                control={control}
                name="consentType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="consent-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CONSENT_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {tAny(label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="procedureName">{t("Procedure Name *")}</Label>
              <Input
                id="procedureName"
                {...register("procedureName")}
                placeholder={t("e.g. Laparoscopic Cholecystectomy")}
                className={errors.procedureName ? "border-red-500" : ""}
              />
              <FieldErrorText error={errors.procedureName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relatedProcedureId">{t("Related Procedure / Surgery ID")}</Label>
              <Input id="relatedProcedureId" {...register("relatedProcedureId")} placeholder={t("Optional, e.g. SUR-0042")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="procedureDescription">{t("Description (in plain language) *")}</Label>
            <Textarea
              id="procedureDescription"
              rows={4}
              {...register("procedureDescription")}
              placeholder={t("Describe the procedure in terms the patient can understand")}
              className={errors.procedureDescription ? "border-red-500" : ""}
            />
            <FieldErrorText error={errors.procedureDescription} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Risks, Benefits & Alternatives")}</CardTitle>
          <CardDescription>{t("Press Enter or + to add each item")}</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ListField control={control} name="risks" label={t("Risks")} placeholder={t("e.g. Bleeding")} required />
          <ListField control={control} name="benefits" label={t("Benefits")} placeholder={t("e.g. Pain relief")} required />
          <ListField control={control} name="alternatives" label={t("Alternatives")} placeholder={t("e.g. Medication")} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Explanation")}</CardTitle>
          <CardDescription>{t("Clinician who explained the procedure and the consenter's understanding")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="explainedBy">{t("Explained By *")}</Label>
              <Input
                id="explainedBy"
                {...register("explainedBy")}
                placeholder={t("e.g. Dr. Chea Sovann")}
                className={errors.explainedBy ? "border-red-500" : ""}
              />
              <FieldErrorText error={errors.explainedBy} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="explainedByDesignation">{t("Designation *")}</Label>
              <Input
                id="explainedByDesignation"
                {...register("explainedByDesignation")}
                placeholder={t("e.g. Consultant Surgeon")}
                className={errors.explainedByDesignation ? "border-red-500" : ""}
              />
              <FieldErrorText error={errors.explainedByDesignation} />
            </div>
          </div>

          {(
            [
              ["patientUnderstands", "The consenter understands the nature, risks, benefits and alternatives of the procedure."],
              ["questionsAnswered", "The consenter had the opportunity to ask questions, and all questions were answered."],
            ] as const
          ).map(([name, text]) => (
            <Controller
              key={name}
              control={control}
              name={name}
              render={({ field }) => (
                <div className="space-y-1">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id={name}
                      checked={field.value}
                      onCheckedChange={(v) => field.onChange(v === true)}
                      className="mt-0.5"
                    />
                    <Label htmlFor={name} className="font-normal leading-snug">
                      {tAny(text)}
                    </Label>
                  </div>
                  <FieldErrorText error={errors[name]} />
                </div>
              )}
            />
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("Consent & Signatures")}</CardTitle>
          <CardDescription>{t("Who is giving consent, and the witness")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("Consent Given By *")}</Label>
            <Controller
              control={control}
              name="consentGivenBy"
              render={({ field }) => (
                <RadioGroup value={field.value} onValueChange={field.onChange} className="flex flex-wrap gap-6" aria-label={t("Consent given by")}>
                  {Object.entries(CONSENTER_LABELS).map(([value, label]) => (
                    <div key={value} className="flex items-center gap-2">
                      <RadioGroupItem value={value} id={`consenter-${value}`} />
                      <Label htmlFor={`consenter-${value}`} className="font-normal">
                        {tAny(label)}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              )}
            />
          </div>

          {!consenterIsPatient && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-md border p-4">
              <div className="space-y-2">
                <Label htmlFor="guardianName">{t("Name of {role} *", { role: tAny(CONSENTER_LABELS[consentGivenBy]) })}</Label>
                <Input
                  id="guardianName"
                  {...register("guardianName")}
                  className={errors.guardianName ? "border-red-500" : ""}
                />
                <FieldErrorText error={errors.guardianName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianRelation">{t("Relationship to Patient *")}</Label>
                <Input
                  id="guardianRelation"
                  {...register("guardianRelation")}
                  placeholder={t("e.g. Parent")}
                  className={errors.guardianRelation ? "border-red-500" : ""}
                />
                <FieldErrorText error={errors.guardianRelation} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="guardianPhone">{t("Phone *")}</Label>
                <Input
                  id="guardianPhone"
                  type="tel"
                  {...register("guardianPhone")}
                  className={errors.guardianPhone ? "border-red-500" : ""}
                />
                <FieldErrorText error={errors.guardianPhone} />
              </div>
            </div>
          )}

          <div className="rounded-md bg-muted p-4 text-sm">
            {consenterIsPatient
              ? t(
                  "I, the undersigned{patient}, confirm that the procedure described above has been explained to me, and I voluntarily give my consent. I understand I may withdraw this consent at any time before the procedure.",
                  { patient: patientName ? ` (${patientName})` : "" }
                )
              : t(
                  "I, the undersigned, acting as {role} of the patient{patient}, confirm that the procedure described above has been explained to me, and I voluntarily give my consent. I understand I may withdraw this consent at any time before the procedure.",
                  { role: tAny(CONSENTER_LABELS[consentGivenBy]), patient: patientName ? ` (${patientName})` : "" }
                )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="signatureName">{t("Signature of Consenter (type full name) *")}</Label>
              <Input
                id="signatureName"
                {...register("signatureName")}
                className={`font-serif italic ${errors.signatureName ? "border-red-500" : ""}`}
              />
              <FieldErrorText error={errors.signatureName} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="witnessName">{t("Witness Name *")}</Label>
              <Input
                id="witnessName"
                {...register("witnessName")}
                className={errors.witnessName ? "border-red-500" : ""}
              />
              <FieldErrorText error={errors.witnessName} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("Cancel")}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("Saving...") : t("Sign & Save Consent")}
        </Button>
      </div>
    </form>
  );
}
