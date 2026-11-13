export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  category: 'medication' | 'medical-supplies' | 'surgical-instruments' | 'equipment' | 'consumables' | 'laboratory' | 'radiology' | 'other';
  subCategory?: string;
  description: string;
  unit: string; // e.g., 'piece', 'box', 'bottle', 'vial', 'kg', 'liter'
  
  // Stock Information
  currentStock: number;
  minimumStock: number;
  maximumStock: number;
  reorderLevel: number;
  reorderQuantity: number;
  
  // Location
  location: string;
  shelf?: string;
  bin?: string;
  
  // Pricing
  unitPrice: number;
  totalValue: number;
  
  // Supplier
  supplierId?: string;
  supplierName?: string;
  
  // Batch/Lot
  batchNumber?: string;
  expiryDate?: Date;
  manufacturingDate?: Date;
  
  // Status
  status: 'in-stock' | 'low-stock' | 'out-of-stock' | 'expired' | 'discontinued';
  
  lastRestocked?: Date;
  lastUsed?: Date;
  isActive: boolean;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: Date;
  expectedDeliveryDate: Date;
  actualDeliveryDate?: Date;
  status: 'draft' | 'pending' | 'approved' | 'ordered' | 'partially-received' | 'received' | 'cancelled';
  
  items: Array<{
    itemId: string;
    itemName: string;
    itemCode: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    totalPrice: number;
    receivedQuantity?: number;
    batchNumber?: string;
    expiryDate?: Date;
  }>;
  
  subtotal: number;
  tax: number;
  discount: number;
  shippingCost: number;
  totalAmount: number;
  
  requestedBy: string;
  approvedBy?: string;
  approvedDate?: Date;
  
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethod?: 'cash' | 'cheque' | 'bank-transfer' | 'credit';
  
  deliveryAddress: string;
  terms?: string;
  notes?: string;
}

export interface Supplier {
  id: string;
  supplierCode: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  alternatePhone?: string;
  
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  
  category: string[];
  productsSupplied: string[];
  
  taxId?: string;
  registrationNumber?: string;
  
  paymentTerms: string;
  creditLimit?: number;
  creditPeriod?: number; // days
  
  rating?: number;
  isPreferred: boolean;
  isActive: boolean;
  
  bankDetails?: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
  };
  
  notes?: string;
}

export interface StockTransaction {
  id: string;
  transactionNumber: string;
  date: Date;
  type: 'purchase' | 'issue' | 'return' | 'adjustment' | 'transfer' | 'disposal';
  itemId: string;
  itemName: string;
  itemCode: string;
  
  quantity: number;
  unit: string;
  unitPrice?: number;
  totalValue?: number;
  
  fromLocation?: string;
  toLocation?: string;
  
  reason?: string;
  reference?: string; // PO number, patient ID, department, etc.
  
  batchNumber?: string;
  expiryDate?: Date;
  
  performedBy: string;
  approvedBy?: string;
  
  notes?: string;
}

export interface StockAdjustment {
  id: string;
  adjustmentNumber: string;
  date: Date;
  itemId: string;
  itemName: string;
  itemCode: string;
  
  currentStock: number;
  adjustedStock: number;
  difference: number;
  
  reason: 'physical-count' | 'damage' | 'expiry' | 'theft' | 'donation' | 'error-correction' | 'other';
  reasonDescription: string;
  
  performedBy: string;
  approvedBy?: string;
  approvedDate?: Date;
  
  notes?: string;
}

export interface StockAlert {
  id: string;
  itemId: string;
  itemName: string;
  itemCode: string;
  alertType: 'low-stock' | 'out-of-stock' | 'expiring-soon' | 'expired' | 'reorder-point';
  severity: 'info' | 'warning' | 'critical';
  
  currentStock?: number;
  minimumStock?: number;
  expiryDate?: Date;
  daysToExpiry?: number;
  
  message: string;
  createdAt: Date;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

export interface InventoryReport {
  id: string;
  reportType: 'stock-summary' | 'valuation' | 'movement' | 'expiry' | 'consumption' | 'reorder';
  generatedDate: Date;
  fromDate: Date;
  toDate: Date;
  generatedBy: string;
  
  filters?: {
    category?: string;
    location?: string;
    supplier?: string;
  };
  
  data: any; // Report-specific data structure
  totalValue?: number;
  totalItems?: number;
}

export interface AssetTracking {
  id: string;
  assetNumber: string;
  itemId: string;
  itemName: string;
  serialNumber: string;
  
  assignedTo?: string; // Department or person
  location: string;
  status: 'in-use' | 'available' | 'maintenance' | 'repair' | 'retired';
  
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  
  purchaseDate: Date;
  purchaseValue: number;
  currentValue: number;
  depreciationRate?: number;
  
  warrantyExpiry?: Date;
  lastMaintenance?: Date;
  nextMaintenance?: Date;
  maintenanceHistory: Array<{
    date: Date;
    description: string;
    cost: number;
    performedBy: string;
  }>;
  
  notes?: string;
}
