"use client";

import React, { useState } from "react";
import { Plus, Search, Filter, Calendar, Clock, AlertTriangle, FileText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { ImagingOrder, ImagingOrderFormData } from "@/types/radiology";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { imagingOrderSchema } from "@/lib/validations/radiology";

interface ImagingOrdersProps {
  orders: ImagingOrder[];
  patients: { id: string; name: string; mrn: string; age: number; gender: string }[];
  physicians: { id: string; name: string; department: string; license: string }[];
  onCreateOrder: (data: ImagingOrderFormData) => Promise<void>;
  onUpdateOrder: (id: string, data: Partial<ImagingOrder>) => Promise<void>;
  onCancelOrder: (id: string, reason: string) => Promise<void>;
  onScheduleOrder: (orderId: string) => void;
}

const IMAGING_TYPES = {
  xray: "X-Ray",
  mri: "MRI",
  ct: "CT Scan",
  ultrasound: "Ultrasound",
  mammography: "Mammography",
  nuclear_medicine: "Nuclear Medicine",
  pet_scan: "PET Scan",
  fluoroscopy: "Fluoroscopy",
};

const EXAM_TYPES = {
  xray: [
    "Chest X-Ray",
    "Abdominal X-Ray",
    "Bone X-Ray",
    "Joint X-Ray",
    "Spine X-Ray",
    "Dental X-Ray"
  ],
  mri: [
    "Brain MRI",
    "Spine MRI",
    "Knee MRI",
    "Shoulder MRI",
    "Abdomen MRI",
    "Cardiac MRI"
  ],
  ct: [
    "Head CT",
    "Chest CT",
    "Abdominal CT",
    "Cardiac CT",
    "CT Angiography",
    "CT with Contrast"
  ],
  ultrasound: [
    "Abdominal Ultrasound",
    "Pelvic Ultrasound",
    "Cardiac Echo",
    "Vascular Ultrasound",
    "Obstetric Ultrasound",
    "Thyroid Ultrasound"
  ],
};

const PREPARATION_INSTRUCTIONS = {
  ct_contrast: [
    "Fast for 4 hours before exam",
    "Drink contrast solution as directed",
    "Arrive 30 minutes early",
    "Inform staff of any allergies"
  ],
  mri: [
    "Remove all metal objects",
    "Inform staff of any implants",
    "May require sedation consultation",
    "Wear comfortable, metal-free clothing"
  ],
  ultrasound_abdomen: [
    "Fast for 8 hours before exam",
    "Drink 32oz water 1 hour before exam",
    "Do not urinate before exam",
    "Arrive 15 minutes early"
  ],
  mammography: [
    "Schedule 1 week after menstrual period",
    "Do not use deodorant or powder",
    "Bring previous mammograms",
    "Wear two-piece clothing"
  ],
};

export function ImagingOrders({
  orders,
  patients,
  physicians,
  onCreateOrder,
  onUpdateOrder,
  onCancelOrder,
  onScheduleOrder,
}: ImagingOrdersProps) {
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<ImagingOrder | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgencyFilter, setUrgencyFilter] = useState("all");
  const [modalityFilter, setModalityFilter] = useState("all");

  const form = useForm<ImagingOrderFormData>({
    resolver: zodResolver(imagingOrderSchema),
    defaultValues: {
      urgency: "routine",
      contrast: {
        required: false,
        allergies: [],
      },
      preparationInstructions: [],
    },
  });

  const { fields: allergiesFields, append: appendAllergy, remove: removeAllergy } = useFieldArray({
    control: form.control,
    name: "contrast.allergies",
  });

  const { fields: prepFields, append: appendPrep, remove: removePrep } = useFieldArray({
    control: form.control,
    name: "preparationInstructions",
  });

  const watchedImagingType = form.watch("imagingType");
  const watchedContrastRequired = form.watch("contrast.required");

  const handleSubmit = async (data: ImagingOrderFormData) => {
    try {
      if (editingOrder) {
        await onUpdateOrder(editingOrder.id, data as any);
      } else {
        await onCreateOrder(data);
      }
      setOrderDialogOpen(false);
      setEditingOrder(null);
      form.reset();
    } catch (error) {
      console.error("Error saving imaging order:", error);
    }
  };

  const openOrderDialog = (order?: ImagingOrder) => {
    if (order) {
      setEditingOrder(order);
      form.reset({
        patientId: order.patientId,
        imagingType: order.imagingType,
        examType: order.examType,
        bodyPart: order.bodyPart,
        clinicalIndication: order.clinicalIndication,
        urgency: order.urgency,
        contrast: order.contrast,
        specialInstructions: order.specialInstructions,
        preparationInstructions: order.preparationInstructions,
      });
    } else {
      setEditingOrder(null);
      form.reset();
    }
    setOrderDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ordered": return "bg-blue-100 text-blue-800";
      case "scheduled": return "bg-green-100 text-green-800";
      case "in_progress": return "bg-yellow-100 text-yellow-800";
      case "completed": return "bg-green-100 text-green-800";
      case "cancelled": return "bg-red-100 text-red-800";
      case "no_show": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "stat":
      case "emergency": return "bg-red-100 text-red-800";
      case "urgent": return "bg-orange-100 text-orange-800";
      case "routine": return "bg-blue-100 text-blue-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.examType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesUrgency = urgencyFilter === "all" || order.urgency === urgencyFilter;
    const matchesModality = modalityFilter === "all" || order.imagingType === modalityFilter;
    return matchesSearch && matchesStatus && matchesUrgency && matchesModality;
  });

  const addPreparationInstruction = () => {
    appendPrep("");
  };

  const loadPreparationTemplate = (template: string) => {
    const instructions = PREPARATION_INSTRUCTIONS[template as keyof typeof PREPARATION_INSTRUCTIONS] || [];
    form.setValue("preparationInstructions", instructions);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Imaging Orders</h1>
        <p className="text-gray-600">Manage diagnostic imaging orders and requests</p>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search orders, patients, or exam types..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="ordered">Ordered</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Select value={urgencyFilter} onValueChange={setUrgencyFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Urgency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Urgency</SelectItem>
            <SelectItem value="routine">Routine</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="stat">STAT</SelectItem>
            <SelectItem value="emergency">Emergency</SelectItem>
          </SelectContent>
        </Select>
        <Select value={modalityFilter} onValueChange={setModalityFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Modality" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Modalities</SelectItem>
            {Object.entries(IMAGING_TYPES).map(([key, label]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openOrderDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingOrder ? "Edit Imaging Order" : "Create New Imaging Order"}
              </DialogTitle>
              <DialogDescription>
                Enter the imaging order details below
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Patient *</Label>
                  <Select onValueChange={(value) => form.setValue("patientId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.name} - {patient.mrn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.patientId && (
                    <p className="text-sm text-red-500">{form.formState.errors.patientId.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Imaging Type *</Label>
                  <Select onValueChange={(value) => form.setValue("imagingType", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select imaging type" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(IMAGING_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.imagingType && (
                    <p className="text-sm text-red-500">{form.formState.errors.imagingType.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Exam Type *</Label>
                  <Select 
                    onValueChange={(value) => form.setValue("examType", value)}
                    disabled={!watchedImagingType}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam type" />
                    </SelectTrigger>
                    <SelectContent>
                      {watchedImagingType && EXAM_TYPES[watchedImagingType as keyof typeof EXAM_TYPES]?.map((exam) => (
                        <SelectItem key={exam} value={exam}>{exam}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.examType && (
                    <p className="text-sm text-red-500">{form.formState.errors.examType.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bodyPart">Body Part *</Label>
                  <Input
                    id="bodyPart"
                    {...form.register("bodyPart")}
                    placeholder="e.g., Chest, Abdomen, Left Knee"
                  />
                  {form.formState.errors.bodyPart && (
                    <p className="text-sm text-red-500">{form.formState.errors.bodyPart.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="clinicalIndication">Clinical Indication *</Label>
                <Textarea
                  id="clinicalIndication"
                  {...form.register("clinicalIndication")}
                  placeholder="Reason for imaging study, symptoms, suspected diagnosis..."
                  rows={3}
                />
                {form.formState.errors.clinicalIndication && (
                  <p className="text-sm text-red-500">{form.formState.errors.clinicalIndication.message}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Urgency *</Label>
                  <Select onValueChange={(value) => form.setValue("urgency", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="routine">Routine</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                      <SelectItem value="stat">STAT</SelectItem>
                      <SelectItem value="emergency">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="contrastRequired"
                      checked={watchedContrastRequired}
                      onCheckedChange={(checked) => form.setValue("contrast.required", checked as boolean)}
                    />
                    <Label htmlFor="contrastRequired">Contrast Required</Label>
                  </div>
                </div>
              </div>

              {watchedContrastRequired && (
                <div className="border p-4 rounded-lg space-y-4">
                  <h4 className="font-medium">Contrast Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Contrast Type</Label>
                      <Select onValueChange={(value) => form.setValue("contrast.type", value as any)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select contrast type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="oral">Oral</SelectItem>
                          <SelectItem value="iv">IV</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="contrastAgent">Contrast Agent</Label>
                      <Input
                        id="contrastAgent"
                        {...form.register("contrast.agent")}
                        placeholder="e.g., Iodine-based, Gadolinium"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Known Allergies</Label>
                    {allergiesFields.map((field, index) => (
                      <div key={field.id} className="flex gap-2">
                        <Input
                          {...form.register(`contrast.allergies.${index}` as const)}
                          placeholder="Enter allergy"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeAllergy(index)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => appendAllergy("")}
                    >
                      Add Allergy
                    </Button>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Preparation Instructions</Label>
                  <Select onValueChange={loadPreparationTemplate}>
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Load template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ct_contrast">CT with Contrast</SelectItem>
                      <SelectItem value="mri">MRI</SelectItem>
                      <SelectItem value="ultrasound_abdomen">Abdominal Ultrasound</SelectItem>
                      <SelectItem value="mammography">Mammography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {prepFields.map((field, index) => (
                  <div key={field.id} className="flex gap-2">
                    <Input
                      {...form.register(`preparationInstructions.${index}` as const)}
                      placeholder="Preparation instruction"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removePrep(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addPreparationInstruction}
                >
                  Add Instruction
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="specialInstructions">Special Instructions</Label>
                <Textarea
                  id="specialInstructions"
                  {...form.register("specialInstructions")}
                  placeholder="Any special considerations or instructions..."
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setOrderDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingOrder ? "Update" : "Create"} Order
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {filteredOrders.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Order #{order.orderNumber}
                    <Badge className={getStatusColor(order.status)}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                    <Badge className={getUrgencyColor(order.urgency)}>
                      {order.urgency.toUpperCase()}
                    </Badge>
                    {order.contrast.required && (
                      <Badge variant="outline">Contrast</Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Patient: {order.patientName} (MRN: {order.patientMRN}) • 
                    Ordered: {new Date(order.orderDate).toLocaleDateString()} • 
                    Physician: {order.orderingPhysician.name}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  {order.status === "ordered" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onScheduleOrder(order.id)}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openOrderDialog(order)}
                  >
                    Edit
                  </Button>
                  {order.status === "ordered" && (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => onCancelOrder(order.id, "Physician request")}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium text-gray-900">Exam Details</p>
                  <p className="text-gray-600">{IMAGING_TYPES[order.imagingType]} - {order.examType}</p>
                  <p className="text-gray-600">Body Part: {order.bodyPart}</p>
                  {order.scheduledDateTime && (
                    <p className="text-gray-600">
                      <Clock className="inline h-4 w-4 mr-1" />
                      Scheduled: {new Date(order.scheduledDateTime).toLocaleString()}
                    </p>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Clinical Information</p>
                  <p className="text-gray-600">{order.clinicalIndication}</p>
                  {order.specialInstructions && (
                    <p className="text-gray-600 mt-1">Special: {order.specialInstructions}</p>
                  )}
                </div>
                <div>
                  <p className="font-medium text-gray-900">Staff Assignment</p>
                  {order.technologist && (
                    <p className="text-gray-600">Tech: {order.technologist.name}</p>
                  )}
                  {order.radiologist && (
                    <p className="text-gray-600">Radiologist: {order.radiologist.name}</p>
                  )}
                </div>
              </div>

              {order.preparationInstructions.length > 0 && (
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900 mb-2">Preparation Instructions:</p>
                  <ul className="text-blue-800 text-sm space-y-1">
                    {order.preparationInstructions.map((instruction, index) => (
                      <li key={index} className="flex items-start">
                        <span className="mr-2">•</span>
                        <span>{instruction}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {order.contrast.required && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="font-medium text-yellow-900 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Contrast Information
                  </p>
                  <div className="text-yellow-800 text-sm mt-1">
                    <p>Type: {order.contrast.type}</p>
                    {order.contrast.agent && <p>Agent: {order.contrast.agent}</p>}
                    {order.contrast.allergies && order.contrast.allergies.length > 0 && (
                      <p>Allergies: {order.contrast.allergies.join(", ")}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-muted-foreground">No imaging orders found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create a new imaging order to get started
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}