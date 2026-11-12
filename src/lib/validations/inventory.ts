import { z } from 'zod';

export const inventoryItemSchema = z.object({
  itemCode: z.string().min(2, 'Item code is required'),
  name: z.string().min(2, 'Item name is required'),
  category: z.enum(['medication', 'medical-supplies', 'surgical-instruments', 'equipment', 'consumables', 'laboratory', 'radiology', 'other']),
  subCategory: z.string().optional(),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  unit: z.string().min(1, 'Unit is required'),
  
  currentStock: z.number().min(0, 'Stock cannot be negative'),
  minimumStock: z.number().min(0, 'Minimum stock cannot be negative'),
  maximumStock: z.number().min(0, 'Maximum stock cannot be negative'),
  reorderLevel: z.number().min(0, 'Reorder level cannot be negative'),
  reorderQuantity: z.number().min(1, 'Reorder quantity must be at least 1'),
  
  location: z.string().min(1, 'Location is required'),
  shelf: z.string().optional(),
  bin: z.string().optional(),
  
  unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  
  supplierId: z.string().optional(),
  batchNumber: z.string().optional(),
  expiryDate: z.date().optional(),
  manufacturingDate: z.date().optional(),
  
  notes: z.string().optional(),
});

export const purchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier is required'),
  orderDate: z.date(),
  expectedDeliveryDate: z.date(),
  
  items: z.array(z.object({
    itemId: z.string().min(1, 'Item is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    unitPrice: z.number().min(0, 'Unit price cannot be negative'),
  })).min(1, 'At least one item is required'),
  
  tax: z.number().min(0).default(0),
  discount: z.number().min(0).default(0),
  shippingCost: z.number().min(0).default(0),
  
  deliveryAddress: z.string().min(10, 'Delivery address is required'),
  terms: z.string().optional(),
  notes: z.string().optional(),
});

export const supplierSchema = z.object({
  supplierCode: z.string().min(2, 'Supplier code is required'),
  name: z.string().min(2, 'Supplier name is required'),
  contactPerson: z.string().min(2, 'Contact person is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  alternatePhone: z.string().regex(/^[0-9]{10}$/, 'Phone must be 10 digits').optional().or(z.literal('')),
  
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().regex(/^[0-9]{6}$/, 'Postal code must be 6 digits'),
  country: z.string().min(2, 'Country is required'),
  
  category: z.array(z.string()).min(1, 'At least one category is required'),
  productsSupplied: z.array(z.string()).default([]),
  
  taxId: z.string().optional(),
  registrationNumber: z.string().optional(),
  
  paymentTerms: z.string().min(2, 'Payment terms are required'),
  creditLimit: z.number().min(0).optional(),
  creditPeriod: z.number().min(0).optional(),
  
  isPreferred: z.boolean().default(false),
  
  notes: z.string().optional(),
});

export const stockTransactionSchema = z.object({
  type: z.enum(['purchase', 'issue', 'return', 'adjustment', 'transfer', 'disposal']),
  itemId: z.string().min(1, 'Item is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  
  fromLocation: z.string().optional(),
  toLocation: z.string().optional(),
  
  reason: z.string().optional(),
  reference: z.string().optional(),
  
  batchNumber: z.string().optional(),
  expiryDate: z.date().optional(),
  
  notes: z.string().optional(),
});

export const stockAdjustmentSchema = z.object({
  itemId: z.string().min(1, 'Item is required'),
  adjustedStock: z.number().min(0, 'Adjusted stock cannot be negative'),
  reason: z.enum(['physical-count', 'damage', 'expiry', 'theft', 'donation', 'error-correction', 'other']),
  reasonDescription: z.string().min(10, 'Reason description must be at least 10 characters'),
  notes: z.string().optional(),
});
