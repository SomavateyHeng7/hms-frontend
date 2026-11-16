"use client";

import React, { useState } from "react";
import { Plus, Trash2, Edit3, Search, Calculator, Receipt, CreditCard, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import type { OPDBilling as OPDBillingRecord, BillingItem } from "@/types/opd";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { opdBillingSchema, OPDBillingFormData, OPDBillingSubmission } from "@/lib/validations/opd";

interface OPDBillingProps {
  patientId: string;
  consultationId: string;
  bills: OPDBillingRecord[];
  onCreateBill: (data: OPDBillingSubmission) => Promise<void>;
  onUpdateBill: (id: string, data: OPDBillingSubmission) => Promise<void>;
  onDeleteBill: (id: string) => Promise<void>;
  onProcessPayment: (billId: string, paymentMethod: string, amount: number) => Promise<void>;
  onPrintBill: (billId: string) => void;
  /** Role-based access; the matching actions are disabled when false */
  canCreate?: boolean;
  canRecordPayment?: boolean;
}

interface ServiceTemplate {
  id: string;
  name: string;
  category: string;
  basePrice: number;
  description: string;
}

// Mock service templates - in real app, this would come from a database
const serviceTemplates: ServiceTemplate[] = [
  {
    id: "1",
    name: "General Consultation",
    category: "Consultation",
    basePrice: 150.00,
    description: "General medical consultation with doctor"
  },
  {
    id: "2",
    name: "Specialist Consultation",
    category: "Consultation",
    basePrice: 300.00,
    description: "Specialist medical consultation"
  },
  {
    id: "3",
    name: "Blood Test - Basic Panel",
    category: "Laboratory",
    basePrice: 80.00,
    description: "Complete blood count and basic metabolic panel"
  },
  {
    id: "4",
    name: "X-Ray - Chest",
    category: "Radiology",
    basePrice: 120.00,
    description: "Chest X-ray examination"
  },
  {
    id: "5",
    name: "ECG",
    category: "Diagnostic",
    basePrice: 60.00,
    description: "Electrocardiogram test"
  },
  {
    id: "6",
    name: "Prescription Fee",
    category: "Pharmacy",
    basePrice: 25.00,
    description: "Prescription processing fee"
  },
  {
    id: "7",
    name: "Follow-up Visit",
    category: "Consultation",
    basePrice: 100.00,
    description: "Follow-up consultation visit"
  },
  {
    id: "8",
    name: "Wound Dressing",
    category: "Procedure",
    basePrice: 50.00,
    description: "Wound cleaning and dressing"
  }
];

export function OPDBilling({
  patientId,
  consultationId,
  bills,
  onCreateBill,
  onUpdateBill,
  onDeleteBill,
  onProcessPayment,
  onPrintBill,
  canCreate = true,
  canRecordPayment = true,
}: OPDBillingProps) {
  const [billingDialogOpen, setBillingDialogOpen] = useState(false);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<OPDBillingRecord | null>(null);
  const [selectedBillForPayment, setSelectedBillForPayment] = useState<OPDBillingRecord | null>(null);
  const [serviceSearch, setServiceSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const form = useForm<OPDBillingFormData>({
    resolver: zodResolver(opdBillingSchema),
    defaultValues: {
      status: "pending",
      paymentStatus: "pending",
      items: [
        {
          serviceCode: "",
          description: "",
          quantity: 1,
          unitPrice: 0,
          discount: 0,
          taxRate: 0,
        }
      ],
      discount: 0,
      taxRate: 10, // Default 10% tax
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });

  const watchedItems = form.watch("items");
  const watchedDiscount = form.watch("discount");
  const watchedTaxRate = form.watch("taxRate");

  // Calculate totals
  const subtotal = watchedItems.reduce((sum, item) => {
    const itemTotal = (item.quantity || 0) * (item.unitPrice || 0);
    const itemDiscount = itemTotal * ((item.discount || 0) / 100);
    return sum + itemTotal - itemDiscount;
  }, 0);

  const discountAmount = subtotal * ((watchedDiscount || 0) / 100);
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * ((watchedTaxRate || 0) / 100);
  const totalAmount = taxableAmount + taxAmount;

  const handleSubmit = async (data: OPDBillingFormData) => {
    try {
      const billData: OPDBillingSubmission = {
        ...data,
        subtotal,
        discountAmount,
        taxAmount,
        totalAmount,
      };

      if (editingBill) {
        await onUpdateBill(editingBill.id, billData);
      } else {
        await onCreateBill(billData);
      }
      setBillingDialogOpen(false);
      setEditingBill(null);
      form.reset();
    } catch (error) {
      console.error("Error saving bill:", error);
    }
  };

  const handlePayment = async () => {
    if (selectedBillForPayment && paymentMethod && paymentAmount > 0) {
      try {
        await onProcessPayment(selectedBillForPayment.id, paymentMethod, paymentAmount);
        setPaymentDialogOpen(false);
        setSelectedBillForPayment(null);
        setPaymentMethod("");
        setPaymentAmount(0);
      } catch (error) {
        console.error("Error processing payment:", error);
      }
    }
  };

  const openBillingDialog = (bill?: OPDBillingRecord) => {
    if (bill) {
      setEditingBill(bill);
      form.reset({
        status: bill.status,
        paymentStatus: bill.paymentStatus,
        items: bill.items,
        discount: bill.discount || 0,
        taxRate: bill.taxRate || 10,
        notes: bill.notes || "",
      });
    } else {
      setEditingBill(null);
      form.reset();
    }
    setBillingDialogOpen(true);
  };

  const openPaymentDialog = (bill: OPDBillingRecord) => {
    setSelectedBillForPayment(bill);
    setPaymentAmount(bill.totalAmount);
    setPaymentDialogOpen(true);
  };

  const addBillingItem = () => {
    append({
      serviceCode: "",
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 0,
    });
  };

  const removeBillingItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const applyServiceTemplate = (template: ServiceTemplate, index: number) => {
    form.setValue(`items.${index}.serviceCode`, template.id);
    form.setValue(`items.${index}.description`, template.name);
    form.setValue(`items.${index}.unitPrice`, template.basePrice);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-100 text-gray-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "approved": return "bg-blue-100 text-blue-800";
      case "cancelled": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "partial": return "bg-orange-100 text-orange-800";
      case "paid": return "bg-green-100 text-green-800";
      case "overdue": return "bg-red-100 text-red-800";
      case "refunded": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredServiceTemplates = serviceTemplates.filter((template) =>
    template.name.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    template.category.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">OPD Billing</h1>
        <p className="text-gray-600">Manage outpatient billing and payments</p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Bills ({bills.length})</h2>
        </div>
        <Dialog open={billingDialogOpen} onOpenChange={setBillingDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => openBillingDialog()} disabled={!canCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Create Bill
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingBill ? "Edit Bill" : "Create New Bill"}
              </DialogTitle>
              <DialogDescription>
                Add services and calculate billing amounts
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Bill Status</Label>
                  <Select onValueChange={(value) => form.setValue("status", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <Select onValueChange={(value) => form.setValue("paymentStatus", value as any)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="refunded">Refunded</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-lg">Billing Items</Label>
                  <Button type="button" onClick={addBillingItem} size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </div>

                {fields.map((field, index) => (
                  <Card key={field.id} className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium">Item {index + 1}</h4>
                      <div className="flex gap-2">
                        <Select onValueChange={(templateId) => {
                          const template = serviceTemplates.find(t => t.id === templateId);
                          if (template) {
                            applyServiceTemplate(template, index);
                          }
                        }}>
                          <SelectTrigger className="w-48">
                            <SelectValue placeholder="Apply service" />
                          </SelectTrigger>
                          <SelectContent>
                            {serviceTemplates.map((template) => (
                              <SelectItem key={template.id} value={template.id}>
                                {template.name} (${template.basePrice})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {fields.length > 1 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeBillingItem(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label htmlFor={`items.${index}.serviceCode`}>Service Code</Label>
                        <Input
                          {...form.register(`items.${index}.serviceCode`)}
                          placeholder="e.g., CONS001"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`items.${index}.description`}>Description *</Label>
                        <Input
                          {...form.register(`items.${index}.description`)}
                          placeholder="Service description"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`items.${index}.quantity`}>Quantity *</Label>
                        <Input
                          type="number"
                          min="1"
                          step="1"
                          {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`items.${index}.unitPrice`}>Unit Price *</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`items.${index}.discount`}>Discount (%)</Label>
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          {...form.register(`items.${index}.discount`, { valueAsNumber: true })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label>Item Total</Label>
                        <div className="p-2 bg-gray-50 rounded border text-sm font-medium">
                          ${((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unitPrice || 0) * (1 - ((watchedItems[index]?.discount || 0) / 100))).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>

              <Card className="p-4 bg-gray-50">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor="discount">Overall Discount (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      {...form.register("discount", { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      {...form.register("taxRate", { valueAsNumber: true })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Calculator className="h-4 w-4" />
                      Bill Summary
                    </Label>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Discount:</span>
                        <span>-${discountAmount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>${taxAmount.toFixed(2)}</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-medium">
                        <span>Total:</span>
                        <span>${totalAmount.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  {...form.register("notes")}
                  placeholder="Additional billing notes"
                  rows={3}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBillingDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  {editingBill ? "Update" : "Create"} Bill
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {bills.map((bill) => (
          <Card key={bill.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Bill #{bill.billNumber}
                    <Badge className={getStatusColor(bill.status)}>
                      {bill.status}
                    </Badge>
                    <Badge className={getPaymentStatusColor(bill.paymentStatus)}>
                      {bill.paymentStatus}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Created: {new Date(bill.billDate).toLocaleDateString()}
                    {bill.dueDate && ` • Due: ${new Date(bill.dueDate).toLocaleDateString()}`}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => openBillingDialog(bill)}
                    disabled={!canCreate}
                  >
                    <Edit3 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  {bill.paymentStatus !== "paid" && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => openPaymentDialog(bill)}
                      disabled={!canRecordPayment}
                    >
                      <CreditCard className="mr-2 h-4 w-4" />
                      Payment
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPrintBill(bill.id)}
                  >
                    <Receipt className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Billing Items ({bill.items.length})</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit Price</TableHead>
                        <TableHead>Discount</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bill.items.map((item, index) => {
                        const itemTotal = item.quantity * item.unitPrice;
                        const itemDiscount = itemTotal * (item.discount / 100);
                        const itemFinal = itemTotal - itemDiscount;
                        
                        return (
                          <TableRow key={index}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{item.description}</div>
                                {item.serviceCode && (
                                  <div className="text-sm text-muted-foreground">{item.serviceCode}</div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>{item.quantity}</TableCell>
                            <TableCell>${item.unitPrice.toFixed(2)}</TableCell>
                            <TableCell>{item.discount}%</TableCell>
                            <TableCell className="text-right">${itemFinal.toFixed(2)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex justify-end">
                  <Card className="w-80">
                    <CardContent className="pt-6">
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>${bill.subtotal.toFixed(2)}</span>
                        </div>
                        {bill.discountAmount > 0 && (
                          <div className="flex justify-between">
                            <span>Discount ({bill.discount}%):</span>
                            <span>-${bill.discountAmount.toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>Tax ({bill.taxRate}%):</span>
                          <span>${bill.taxAmount.toFixed(2)}</span>
                        </div>
                        <Separator />
                        <div className="flex justify-between font-medium text-lg">
                          <span>Total Amount:</span>
                          <span>${bill.totalAmount.toFixed(2)}</span>
                        </div>
                        {bill.paidAmount > 0 && (
                          <div className="flex justify-between text-green-600">
                            <span>Paid:</span>
                            <span>-${bill.paidAmount.toFixed(2)}</span>
                          </div>
                        )}
                        {bill.paidAmount > 0 && bill.paidAmount < bill.totalAmount && (
                          <div className="flex justify-between text-orange-600 font-medium">
                            <span>Balance:</span>
                            <span>${(bill.totalAmount - bill.paidAmount).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {bill.notes && (
                  <div>
                    <h4 className="font-medium mb-2">Notes</h4>
                    <p className="text-sm text-muted-foreground p-3 bg-gray-50 rounded-lg">
                      {bill.notes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {bills.length === 0 && (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-muted-foreground">No bills found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Create a new bill to get started
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
            <DialogDescription>
              Process payment for Bill #{selectedBillForPayment?.billNumber}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select payment method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                  <SelectItem value="insurance">Insurance</SelectItem>
                  <SelectItem value="check">Check</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="paymentAmount">Payment Amount</Label>
              <Input
                id="paymentAmount"
                type="number"
                min="0"
                step="0.01"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
              />
              {selectedBillForPayment && (
                <div className="text-sm text-muted-foreground">
                  Total: ${selectedBillForPayment.totalAmount.toFixed(2)} | 
                  Paid: ${selectedBillForPayment.paidAmount.toFixed(2)} | 
                  Balance: ${(selectedBillForPayment.totalAmount - selectedBillForPayment.paidAmount).toFixed(2)}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handlePayment}
              disabled={!paymentMethod || paymentAmount <= 0}
            >
              <DollarSign className="mr-2 h-4 w-4" />
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}