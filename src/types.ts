/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Branch {
  id: string;
  name: string;
  code: string;
  location: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Owner' | 'Accountant' | 'BranchManager' | 'Cashier' | 'Rider' | 'Customer';
  branchId: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  subcategory: string;
  description: string;
  hsCode: string;
  taxRate: number; // e.g. 0.17 for 17% FBR tax
  baseUnit: string; // e.g. "Piece"
  isBatchTracked: boolean;
  image: string;
}

export interface UOMConversion {
  fromUnit: string; // e.g. "Piece"
  toUnit: string; // e.g. "Dozen" or "Carton"
  factor: number; // to convert to base unit, e.g. Dozen = 12 Pieces
}

export interface ProductVariant {
  id: string;
  productId: string;
  name: string;
  sku: string;
  barcode: string;
  pricePiece: number;
  priceDozen: number;
  priceCarton: number;
  stockLevel: number; // in base units
}

export interface Batch {
  id: string;
  productId: string;
  batchNumber: string;
  expiryDate: string;
  quantity: number; // in base units
  costPrice: number; // per base unit
}

export interface StockLevel {
  productId: string;
  branchId: string;
  quantity: number; // in base units
}

export interface StockTransfer {
  id: string;
  transferNumber: string;
  fromBranchId: string;
  toBranchId: string;
  productId: string;
  qty: number;
  uom: string;
  status: 'Draft' | 'Requested' | 'Dispatched' | 'Received';
  date: string;
}

export interface COAAccount {
  id: string;
  code: string;
  name: string;
  type: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense' | 'COGS';
  parentId: string | null;
  balance: number;
}

export interface VoucherLine {
  accountId: string;
  debit: number;
  credit: number;
  costCenter?: string;
}

export interface Voucher {
  id: string;
  number: string;
  date: string;
  type: 'Journal' | 'Payment' | 'Receipt' | 'Contra' | 'DebitNote' | 'CreditNote';
  branchId: string;
  narration: string;
  lines: VoucherLine[];
  approved: boolean;
  approvedBy?: string;
  attachmentUrl?: string;
}

export interface Party {
  id: string;
  name: string;
  type: 'Customer' | 'Supplier' | 'Both';
  classification: 'Retailer' | 'Wholesaler' | 'Distributor' | 'Salon' | 'Walk-In';
  phone: string;
  email: string;
  creditLimit: number;
  creditPeriod: number; // days
  balance: number; // POS for Debit (AR), NEG for Credit (AP)
}

export interface OrderItem {
  productId: string;
  variantId: string;
  qty: number;
  uom: 'Piece' | 'Dozen' | 'Carton';
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  date: string;
  partyId: string; // Customer party ID or Walk-in
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  status: 'Pending' | 'Approved' | 'Packed' | 'Dispatched' | 'InTransit' | 'Delivered' | 'Cancelled';
  paymentStatus: 'Unpaid' | 'Paid' | 'Refunded';
  paymentMethod: 'Cash' | 'Card' | 'Wallet' | 'Credit';
  branchId: string;
  deliveryAddress: string;
  riderPosition: number; // 0 to 100 percentage along delivery route
  riderId?: string;
  estimatedDeliveryTime: string;
  notes?: string;
}

export interface POSSession {
  id: string;
  cashierId: string;
  branchId: string;
  startTime: string;
  endTime?: string;
  openingFloat: number;
  closingFloat?: number;
  expectedCash?: number;
  actualCash?: number;
  status: 'Active' | 'Closed';
}

export interface ReturnRequest {
  id: string;
  sessionNo: string;
  cashierName: string;
  branchId: string;
  originalInvoiceNo: string;
  itemName: string;
  qty: number;
  uom: string;
  reason: string;
  refundAmount: number;
  status: 'Pending' | 'Approved' | 'Rejected';
  requestedAt: string;
  approvedAt?: string;
  rejectedReason?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'alert' | 'success' | 'warning';
  read: boolean;
}
