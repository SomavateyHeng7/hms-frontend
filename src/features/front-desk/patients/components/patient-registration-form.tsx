"use client";

import { Controller, useForm, useWatch, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PROVINCES, getDistrict, getProvince } from "@/lib/cambodia/address";
import { patientRegistrationSchema, type PatientRegistrationFormData } from "@/features/front-desk/patients/validations";
import { BLOOD_TYPES, COVERAGE_LABELS, RELATIONSHIPS, emptyRegistrationForm } from "@/features/front-desk/patients/patient-utils";
import { useT, useTranslateAny } from "@/lib/i18n/messages";
import { useLanguage } from "@/lib/i18n/language-provider";
import { PATIENTS_KM } from "../km";

interface PatientRegistrationFormProps {
  onSubmit: (data: PatientRegistrationFormData) => void | Promise<void>;
  onCancel?: () => void;
  initialData?: PatientRegistrationFormData;
  isEditing?: boolean;
}

function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
  className,
}: {
  id?: string;
  label: string;
  required?: boolean;
  error?: FieldError;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const tAny = useTranslateAny(PATIENTS_KM);
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <Label htmlFor={id}>
        {label}
        {required && " *"}
      </Label>
      {children}
      {error?.message ? (
        <p className="text-sm text-red-500">{tAny(error.message)}</p>
      ) : (
        hint && <p className="text-xs text-muted-foreground">{hint}</p>
      )}
    </div>
  );
}

const invalid = (error?: FieldError) => (error ? "border-red-500" : "");

export function PatientRegistrationForm({ onSubmit, onCancel, initialData, isEditing = false }: PatientRegistrationFormProps) {
  const t = useT(PATIENTS_KM);
  const tAny = useTranslateAny(PATIENTS_KM);
  const { language } = useLanguage();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PatientRegistrationFormData>({
    resolver: zodResolver(patientRegistrationSchema),
    defaultValues: initialData ?? emptyRegistrationForm(),
  });

  const [birthDateKnown, identityType, provinceId, districtId, coverageScheme] = useWatch({
    control,
    name: ["birthDateKnown", "identityType", "provinceId", "districtId", "coverageScheme"],
  });
  const districts = getProvince(provinceId)?.districts ?? [];
  const communes = getDistrict(provinceId, districtId)?.communes ?? [];
  const isForeign = identityType === "passport";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Name */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Name")}</CardTitle>
          <CardDescription>{t("Family name first, as on the ID card. The Latin spelling is used on documents and for search.")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field id="khmerFamilyName" label={t("Family name (Khmer)")} required={!isForeign} error={errors.khmerFamilyName}>
              <Input id="khmerFamilyName" lang="km" {...register("khmerFamilyName")} placeholder="សុខ" className={invalid(errors.khmerFamilyName)} />
            </Field>
            <Field id="khmerGivenName" label={t("Given name (Khmer)")} required={!isForeign} error={errors.khmerGivenName}>
              <Input id="khmerGivenName" lang="km" {...register("khmerGivenName")} placeholder="ដារ៉ា" className={invalid(errors.khmerGivenName)} />
            </Field>
            <Field id="latinFamilyName" label={t("Family name (Latin)")} required error={errors.latinFamilyName}>
              <Input id="latinFamilyName" {...register("latinFamilyName")} placeholder={t("Sok")} className={invalid(errors.latinFamilyName)} />
            </Field>
            <Field id="latinGivenName" label={t("Given name (Latin)")} required error={errors.latinGivenName}>
              <Input id="latinGivenName" {...register("latinGivenName")} placeholder={t("Dara")} className={invalid(errors.latinGivenName)} />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Sex and age */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Sex and Age")}</CardTitle>
          <CardDescription>{t("Many patients do not know their exact birth date; an estimated age is accepted.")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label={t("Sex")} required error={errors.sex}>
            <Controller
              control={control}
              name="sex"
              render={({ field }) => (
                <RadioGroup value={field.value ?? ""} onValueChange={field.onChange} className="flex gap-6" aria-label={t("Sex")}>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="male" id="sex-male" />
                    <Label htmlFor="sex-male" className="font-normal">{t("Male")}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <RadioGroupItem value="female" id="sex-female" />
                    <Label htmlFor="sex-female" className="font-normal">{t("Female")}</Label>
                  </div>
                </RadioGroup>
              )}
            />
          </Field>

          <Controller
            control={control}
            name="birthDateKnown"
            render={({ field }) => (
              <div className="flex items-center gap-3">
                <Switch id="birthDateKnown" checked={field.value} onCheckedChange={field.onChange} />
                <Label htmlFor="birthDateKnown" className="font-normal">{t("Exact date of birth is known")}</Label>
              </div>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {birthDateKnown ? (
              <Field id="dateOfBirth" label={t("Date of birth")} required error={errors.dateOfBirth}>
                <Input id="dateOfBirth" type="date" {...register("dateOfBirth")} className={invalid(errors.dateOfBirth)} />
              </Field>
            ) : (
              <Field id="estimatedAge" label={t("Estimated age (years)")} required error={errors.estimatedAge}>
                <Input
                  id="estimatedAge"
                  type="number"
                  min={0}
                  max={120}
                  {...register("estimatedAge", { setValueAs: (v) => (v === "" || v === null ? undefined : Number(v)) })}
                  className={invalid(errors.estimatedAge)}
                />
              </Field>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Identity document */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Identity Document")}</CardTitle>
          <CardDescription>{t("Optional for Cambodian patients. Foreign patients register with a passport.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field id="identityType" label={t("Document")}>
              <Controller
                control={control}
                name="identityType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="identityType">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{t("No document")}</SelectItem>
                      <SelectItem value="national_id">{t("Khmer national ID card")}</SelectItem>
                      <SelectItem value="passport">{t("Passport (foreign patient)")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            {identityType !== "none" && (
              <Field id="identityNumber" label={isForeign ? t("Passport number") : t("National ID number")} required error={errors.identityNumber}>
                <Input id="identityNumber" {...register("identityNumber")} className={invalid(errors.identityNumber)} />
              </Field>
            )}
            {isForeign && (
              <Field id="nationality" label={t("Nationality")} required error={errors.nationality}>
                <Input id="nationality" {...register("nationality")} placeholder={t("e.g. Australian")} className={invalid(errors.nationality)} />
              </Field>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Contact and address */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Contact and Address")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field id="phone" label={t("Phone")} required error={errors.phone} hint={t("e.g. 012 345 678")}>
              <Input id="phone" type="tel" inputMode="tel" {...register("phone")} className={invalid(errors.phone)} />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field id="provinceId" label={t("Province / Capital")} required error={errors.provinceId}>
              <Controller
                control={control}
                name="provinceId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(v) => {
                      field.onChange(v);
                      setValue("districtId", "");
                      setValue("communeId", "");
                    }}
                  >
                    <SelectTrigger id="provinceId" className={invalid(errors.provinceId)}>
                      <SelectValue placeholder={t("Select province")} />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCES.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {language === "km" ? `${p.nameKm} · ${p.nameEn}` : `${p.nameEn} · ${p.nameKm}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field id="districtId" label={t("District / Khan")} required error={errors.districtId}>
              <Controller
                control={control}
                name="districtId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    disabled={!provinceId}
                    onValueChange={(v) => {
                      field.onChange(v);
                      setValue("communeId", "");
                    }}
                  >
                    <SelectTrigger id="districtId" className={invalid(errors.districtId)}>
                      <SelectValue placeholder={provinceId ? t("Select district") : t("Select a province first")} />
                    </SelectTrigger>
                    <SelectContent>
                      {districts.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {language === "km" ? `${d.nameKm} · ${d.nameEn}` : `${d.nameEn} · ${d.nameKm}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field id="communeId" label={t("Commune / Sangkat")} required error={errors.communeId}>
              <Controller
                control={control}
                name="communeId"
                render={({ field }) => (
                  <Select value={field.value} disabled={!districtId} onValueChange={field.onChange}>
                    <SelectTrigger id="communeId" className={invalid(errors.communeId)}>
                      <SelectValue placeholder={districtId ? t("Select commune") : t("Select a district first")} />
                    </SelectTrigger>
                    <SelectContent>
                      {communes.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {language === "km" ? `${c.nameKm} · ${c.nameEn}` : `${c.nameEn} · ${c.nameKm}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field id="village" label={t("Village (Phum)")}>
              <Input id="village" {...register("village")} placeholder={t("e.g. Phum 3")} />
            </Field>
            <Field id="houseStreet" label={t("House / Street")}>
              <Input id="houseStreet" {...register("houseStreet")} placeholder={t("e.g. #12, St. 308")} />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Coverage */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Coverage")}</CardTitle>
          <CardDescription>{t("Who pays. Eligibility checks and claims are handled by the billing system.")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field id="coverageScheme" label={t("Scheme")}>
              <Controller
                control={control}
                name="coverageScheme"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="coverageScheme">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(COVERAGE_LABELS) as (keyof typeof COVERAGE_LABELS)[]).map((k) => (
                        <SelectItem key={k} value={k}>
                          {tAny(COVERAGE_LABELS[k])}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            {(coverageScheme === "nssf" || coverageScheme === "hef") && (
              <Field
                id="coverageMemberId"
                label={coverageScheme === "nssf" ? t("NSSF member number") : t("Equity card number")}
                required
                error={errors.coverageMemberId}
              >
                <Input id="coverageMemberId" {...register("coverageMemberId")} className={invalid(errors.coverageMemberId)} />
              </Field>
            )}
            {coverageScheme === "private" && (
              <>
                <Field id="insurer" label={t("Insurer")} required error={errors.insurer}>
                  <Input id="insurer" {...register("insurer")} className={invalid(errors.insurer)} />
                </Field>
                <Field id="policyNumber" label={t("Policy number")} required error={errors.policyNumber}>
                  <Input id="policyNumber" {...register("policyNumber")} className={invalid(errors.policyNumber)} />
                </Field>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Emergency contact */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Emergency Contact")}</CardTitle>
          <CardDescription>{t("Optional")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field id="emergencyName" label={t("Name")}>
              <Input id="emergencyName" {...register("emergencyName")} />
            </Field>
            <Field id="emergencyRelationship" label={t("Relationship")}>
              <Controller
                control={control}
                name="emergencyRelationship"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger id="emergencyRelationship">
                      <SelectValue placeholder={t("Select")} />
                    </SelectTrigger>
                    <SelectContent>
                      {RELATIONSHIPS.map((r) => (
                        <SelectItem key={r} value={r}>
                          {tAny(r)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
            <Field id="emergencyPhone" label={t("Phone")} error={errors.emergencyPhone}>
              <Input id="emergencyPhone" type="tel" inputMode="tel" {...register("emergencyPhone")} className={invalid(errors.emergencyPhone)} />
            </Field>
          </div>
        </CardContent>
      </Card>

      {/* Medical */}
      <Card>
        <CardHeader>
          <CardTitle>{t("Medical Information")}</CardTitle>
          <CardDescription>{t("Optional; can be completed by the nurse or doctor later.")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field id="bloodType" label={t("Blood type")}>
              <Controller
                control={control}
                name="bloodType"
                render={({ field }) => (
                  <Select value={field.value || undefined} onValueChange={field.onChange}>
                    <SelectTrigger id="bloodType">
                      <SelectValue placeholder={t("Unknown")} />
                    </SelectTrigger>
                    <SelectContent>
                      {BLOOD_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </Field>
          </div>
          <Field id="allergies" label={t("Allergies")}>
            <Textarea id="allergies" rows={2} {...register("allergies")} placeholder={t("e.g. Penicillin")} />
          </Field>
          <Field id="medicalHistory" label={t("Medical history")}>
            <Textarea id="medicalHistory" rows={2} {...register("medicalHistory")} />
          </Field>
          <Field id="currentMedications" label={t("Current medications")}>
            <Textarea id="currentMedications" rows={2} {...register("currentMedications")} />
          </Field>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            {t("Cancel")}
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? t("Saving...") : isEditing ? t("Save Changes") : t("Register Patient")}
        </Button>
      </div>
    </form>
  );
}
