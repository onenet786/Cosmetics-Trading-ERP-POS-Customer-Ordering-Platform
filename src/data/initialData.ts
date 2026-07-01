import { 
  Branch, Product, ProductVariant, Batch, COAAccount, Party, Order, ReturnRequest, Notification 
} from '../types';

export const INITIAL_BRANCHES: Branch[] = [
  { id: 'b-01', name: 'Islamabad Centaurus Mall', code: 'ISB-01', location: 'Centaurus Mall, F-8, Islamabad' },
  { id: 'b-02', name: 'Lahore DHA Phase 6', code: 'LHR-02', location: 'DHA Phase 6, Lahore' },
  { id: 'b-03', name: 'Karachi Clifton Road', code: 'KHI-03', location: 'Clifton Block 5, Karachi' },
  { id: 'b-04', name: 'Rawalpindi Saddar', code: 'RWP-04', location: 'Saddar Bazar, Rawalpindi' }
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p-01',
    name: 'Glow Silk Liquid Foundation',
    brand: 'SilkGlow',
    category: 'Makeup',
    subcategory: 'Face',
    description: 'Medium to full coverage hydrating foundation with SPF 15 and radiant finish.',
    hsCode: '3304.9910',
    taxRate: 0.17,
    baseUnit: 'Piece',
    isBatchTracked: true,
    image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=300&q=80'
  },
  {
    id: 'p-02',
    name: 'Velvet Matte Cushion Lipstick',
    brand: 'Cosmopol',
    category: 'Makeup',
    subcategory: 'Lips',
    description: 'Long-lasting, intense pigment liquid lipstick with hydrating coconut oil extracts.',
    hsCode: '3304.1000',
    taxRate: 0.17,
    baseUnit: 'Piece',
    isBatchTracked: true,
    image: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=300&q=80'
  },
  {
    id: 'p-03',
    name: 'Multi-Active Hyaluronic B5 Serum',
    brand: 'DermaCare',
    category: 'Skincare',
    subcategory: 'Serums',
    description: 'Intense 2% Hyaluronic Acid + Vitamin B5 serum for deep, multi-depth skin hydration.',
    hsCode: '3304.9990',
    taxRate: 0.17,
    baseUnit: 'Piece',
    isBatchTracked: true,
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&q=80'
  },
  {
    id: 'p-04',
    name: 'Mineral Sun Shield SPF 50',
    brand: 'DermaCare',
    category: 'Skincare',
    subcategory: 'Sun Protection',
    description: 'Broad spectrum physical sunscreen with Zinc Oxide, non-greasy matte texture.',
    hsCode: '3304.9920',
    taxRate: 0.17,
    baseUnit: 'Piece',
    isBatchTracked: false,
    image: 'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=300&q=80'
  },
  {
    id: 'p-05',
    name: 'Radiant Peach Powder Blush',
    brand: 'SilkGlow',
    category: 'Makeup',
    subcategory: 'Face',
    description: 'Silk-textured micro-milled cheek pigment with radiant peach and gold undertones.',
    hsCode: '3304.9100',
    taxRate: 0.17,
    baseUnit: 'Piece',
    isBatchTracked: true,
    image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300&q=80'
  }
];

export const INITIAL_VARIANTS: ProductVariant[] = [
  // Glow Foundation Variants
  { id: 'v-01', productId: 'p-01', name: '01 Light Porcelain', sku: 'SG-FND-01', barcode: '890123450011', pricePiece: 2400, priceDozen: 25920, priceCarton: 276480, stockLevel: 250 },
  { id: 'v-02', productId: 'p-01', name: '02 Warm Beige', sku: 'SG-FND-02', barcode: '890123450012', pricePiece: 2400, priceDozen: 25920, priceCarton: 276480, stockLevel: 420 },
  { id: 'v-03', productId: 'p-01', name: '03 Rich Tan', sku: 'SG-FND-03', barcode: '890123450013', pricePiece: 2400, priceDozen: 25920, priceCarton: 276480, stockLevel: 180 },

  // Velvet Matte Lipstick Variants
  { id: 'v-04', productId: 'p-02', name: 'Rosewood Blush', sku: 'CP-LIP-RB', barcode: '890123450021', pricePiece: 1400, priceDozen: 15120, priceCarton: 161280, stockLevel: 310 },
  { id: 'v-05', productId: 'p-02', name: 'Crimson Bold', sku: 'CP-LIP-CB', barcode: '890123450022', pricePiece: 1400, priceDozen: 15120, priceCarton: 161280, stockLevel: 190 },
  { id: 'v-06', productId: 'p-02', name: 'Peach Satin', sku: 'CP-LIP-PS', barcode: '890123450023', pricePiece: 1400, priceDozen: 15120, priceCarton: 161280, stockLevel: 220 },

  // Serum Variants
  { id: 'v-07', productId: 'p-03', name: '30ml Travel Vial', sku: 'DC-HYA-30', barcode: '890123450031', pricePiece: 3200, priceDozen: 34560, priceCarton: 368640, stockLevel: 150 },
  { id: 'v-08', productId: 'p-03', name: '50ml Standard Bottle', sku: 'DC-HYA-50', barcode: '890123450032', pricePiece: 4800, priceDozen: 51840, priceCarton: 552960, stockLevel: 300 },

  // Sunscreen Variants
  { id: 'v-09', productId: 'p-04', name: 'Standard Clear Matte', sku: 'DC-SUN-ST', barcode: '890123450041', pricePiece: 2900, priceDozen: 31320, priceCarton: 334080, stockLevel: 280 },
  { id: 'v-10', productId: 'p-04', name: 'Tinted Medium', sku: 'DC-SUN-TM', barcode: '890123450042', pricePiece: 3100, priceDozen: 33480, priceCarton: 357120, stockLevel: 140 },

  // Blush Variants
  { id: 'v-11', productId: 'p-05', name: 'Coral Glow', sku: 'SG-BLS-CG', barcode: '890123450051', pricePiece: 1800, priceDozen: 19440, priceCarton: 207360, stockLevel: 240 },
  { id: 'v-12', productId: 'p-05', name: 'Rose Mist', sku: 'SG-BLS-RM', barcode: '890123450052', pricePiece: 1800, priceDozen: 19440, priceCarton: 207360, stockLevel: 190 }
];

export const INITIAL_BATCHES: Batch[] = [
  { id: 'bt-01', productId: 'p-01', batchNumber: 'FND-JUL25-01', expiryDate: '2027-07-31', quantity: 450, costPrice: 950 },
  { id: 'bt-02', productId: 'p-01', batchNumber: 'FND-NOV25-02', expiryDate: '2027-11-30', quantity: 400, costPrice: 980 },
  { id: 'bt-03', productId: 'p-02', batchNumber: 'LIP-AUG25-A', expiryDate: '2028-08-15', quantity: 720, costPrice: 520 },
  { id: 'bt-04', productId: 'p-03', batchNumber: 'SRM-DEC25-99', expiryDate: '2026-12-31', quantity: 200, costPrice: 1450 }, // Near expiry in late 2026
  { id: 'bt-05', productId: 'p-03', batchNumber: 'SRM-MAR26-03', expiryDate: '2028-03-31', quantity: 250, costPrice: 1500 },
  { id: 'bt-06', productId: 'p-05', batchNumber: 'BLS-OCT25-10', expiryDate: '2027-10-15', quantity: 430, costPrice: 700 }
];

export const INITIAL_COA: COAAccount[] = [
  // Assets (1000)
  { id: 'a-1000', code: '1000', name: 'Assets', type: 'Asset', parentId: null, balance: 24500000 },
  { id: 'a-1100', code: '1100', name: 'Current Assets', type: 'Asset', parentId: 'a-1000', balance: 18500000 },
  { id: 'a-1110', code: '1110', name: 'Cash on Hand (Main Shop Till)', type: 'Asset', parentId: 'a-1100', balance: 450000 },
  { id: 'a-1115', code: '1115', name: 'Cash on Hand (Branch Shops Tills)', type: 'Asset', parentId: 'a-1100', balance: 350000 },
  { id: 'a-1120', code: '1120', name: 'Habib Bank Ltd - Current Account', type: 'Asset', parentId: 'a-1100', balance: 8200000 },
  { id: 'a-1130', code: '1130', name: 'Accounts Receivable (AR Control)', type: 'Asset', parentId: 'a-1100', balance: 4100000 },
  { id: 'a-1140', code: '1140', name: 'Inventory Asset (Cosmetics Control)', type: 'Asset', parentId: 'a-1100', balance: 5400000 },
  { id: 'a-1200', code: '1200', name: 'Fixed Assets', type: 'Asset', parentId: 'a-1000', balance: 6000000 },
  { id: 'a-1210', code: '1210', name: 'Shop Fixtures & POS Hardware', type: 'Asset', parentId: 'a-1200', balance: 7500000 },
  { id: 'a-1220', code: '1220', name: 'Accumulated Depreciation', type: 'Asset', parentId: 'a-1200', balance: -1500000 },

  // Liabilities (2000)
  { id: 'a-2000', code: '2000', name: 'Liabilities', type: 'Liability', parentId: null, balance: -6500000 },
  { id: 'a-2100', code: '2100', name: 'Current Liabilities', type: 'Liability', parentId: 'a-2000', balance: -6500000 },
  { id: 'a-2110', code: '2110', name: 'Accounts Payable (AP Control)', type: 'Liability', parentId: 'a-2100', balance: -4800000 },
  { id: 'a-2120', code: '2120', name: 'FBR Sales Tax Payable (17%)', type: 'Liability', parentId: 'a-2100', balance: -1200000 },
  { id: 'a-2130', code: '2130', name: 'Post-Dated Cheques Outstanding', type: 'Liability', parentId: 'a-2100', balance: -500000 },

  // Equity (3000)
  { id: 'a-3000', code: '3000', name: 'Equity', type: 'Equity', parentId: null, balance: -18000000 },
  { id: 'a-3100', code: '3100', name: 'Paid-Up Share Capital', type: 'Equity', parentId: 'a-3000', balance: -15000000 },
  { id: 'a-3200', code: '3200', name: 'Retained Earnings', type: 'Equity', parentId: 'a-3000', balance: -3000000 },

  // Revenue (4000)
  { id: 'a-4000', code: '4000', name: 'Revenue', type: 'Revenue', parentId: null, balance: -8400000 },
  { id: 'a-4100', code: '4100', name: 'Sales Revenue - Retail POS', type: 'Revenue', parentId: 'a-4000', balance: -4900000 },
  { id: 'a-4200', code: '4200', name: 'Sales Revenue - Wholesale B2B', type: 'Revenue', parentId: 'a-4000', balance: -3500000 },

  // Cost of Goods Sold (5000)
  { id: 'a-5000', code: '5000', name: 'Cost of Goods Sold', type: 'COGS', parentId: null, balance: 3900000 },
  { id: 'a-5100', code: '5100', name: 'Cost of Sales (Merchandise Cost)', type: 'COGS', parentId: 'a-5000', balance: 3750000 },
  { id: 'a-5200', code: '5200', name: 'Stock Variance & Adjustments', type: 'COGS', parentId: 'a-5000', balance: 150000 },

  // Expenses (6000)
  { id: 'a-6000', code: '6000', name: 'Expenses', type: 'Expense', parentId: null, balance: 4500000 },
  { id: 'a-6100', code: '6100', name: 'Shops Rental Expense', type: 'Expense', parentId: 'a-6000', balance: 1800000 },
  { id: 'a-6200', code: '6200', name: 'Electricity & Utilities Expense', type: 'Expense', parentId: 'a-6000', balance: 450000 },
  { id: 'a-6300', code: '6300', name: 'Staff Salaries & Commission', type: 'Expense', parentId: 'a-6000', balance: 1900000 },
  { id: 'a-6400', code: '6400', name: 'Marketing & Digital Ad Spend', type: 'Expense', parentId: 'a-6000', balance: 350000 }
];

export const INITIAL_PARTIES: Party[] = [
  // Suppliers
  { id: 'pty-s01', name: "L'Oreal Pakistan Ltd (Distributors)", type: 'Supplier', classification: 'Distributor', phone: '+9221111567325', email: 'orders@loreal.com.pk', creditLimit: 5000000, creditPeriod: 30, balance: -2400000 },
  { id: 'pty-s02', name: 'Derma Skin Care Wholesalers Co.', type: 'Supplier', classification: 'Wholesaler', phone: '+924235882901', email: 'supply@dermacare.com', creditLimit: 2000000, creditPeriod: 15, balance: -1500000 },
  
  // Customers (Salons / Wholesalers)
  { id: 'pty-c01', name: 'Bella Rose Beauty Salon & Spa', type: 'Customer', classification: 'Salon', phone: '+923001234567', email: 'contact@bellarose.pk', creditLimit: 500000, creditPeriod: 15, balance: 350000 },
  { id: 'pty-c02', name: 'Metro Beauty Cosmetics Wholesaler', type: 'Customer', classification: 'Wholesaler', phone: '+923219876543', email: 'info@metrobeauty.pk', creditLimit: 1500000, creditPeriod: 30, balance: 1200000 },
  { id: 'pty-c03', name: 'The Royal Parlor & Bridal Studio', type: 'Customer', classification: 'Salon', phone: '+923334445556', email: 'royal@parlor.pk', creditLimit: 300000, creditPeriod: 10, balance: 150000 },
  { id: 'pty-c04', name: 'Walk-In Retail Customer', type: 'Customer', classification: 'Walk-In', phone: '0', email: 'walkin@retail.com', creditLimit: 0, creditPeriod: 0, balance: 0 }
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    orderNumber: 'SO-2026-001',
    date: '2026-06-28',
    partyId: 'pty-c01',
    customerName: 'Bella Rose Beauty Salon',
    customerPhone: '+923001234567',
    items: [
      { productId: 'p-01', variantId: 'v-02', qty: 10, uom: 'Piece', unitPrice: 2400, total: 24000 },
      { productId: 'p-02', variantId: 'v-04', qty: 1, uom: 'Dozen', unitPrice: 15120, total: 15120 }
    ],
    subtotal: 39120,
    tax: 6650.4,
    discount: 1120,
    total: 44650.4,
    status: 'Delivered',
    paymentStatus: 'Paid',
    paymentMethod: 'Credit',
    branchId: 'b-01',
    deliveryAddress: 'House 14, Street 3, Sector G-11/2, Islamabad',
    riderPosition: 100,
    estimatedDeliveryTime: 'Completed'
  },
  {
    id: 'ord-102',
    orderNumber: 'SO-2026-002',
    date: '2026-06-30',
    partyId: 'pty-c03',
    customerName: 'The Royal Parlor',
    customerPhone: '+923334445556',
    items: [
      { productId: 'p-03', variantId: 'v-08', qty: 5, uom: 'Piece', unitPrice: 4800, total: 24000 },
      { productId: 'p-05', variantId: 'v-11', qty: 5, uom: 'Piece', unitPrice: 1800, total: 9000 }
    ],
    subtotal: 33000,
    tax: 5610,
    discount: 500,
    total: 38110,
    status: 'InTransit',
    paymentStatus: 'Paid',
    paymentMethod: 'Card',
    branchId: 'b-01',
    deliveryAddress: 'Royal Arcade, Phase 4, Civic Center, Rawalpindi',
    riderPosition: 65,
    estimatedDeliveryTime: '12 mins'
  }
];

export const INITIAL_NOTIFICATIONS: Notification[] = [
  { id: 'not-1', title: 'Near Expiry Warning', message: 'Batch SRM-DEC25-99 of Hyaluronic B5 Serum is expiring in less than 180 days.', time: '2 hours ago', type: 'warning', read: false },
  { id: 'not-2', title: 'Low Stock Alert', message: 'Variant 03 Rich Tan Foundation is below the reorder level of 200 base units.', time: '4 hours ago', type: 'alert', read: false },
  { id: 'not-3', title: 'Large Credit Approved', message: 'Credit Override of PKR 150,000 approved for Metro Beauty Wholesalers.', time: '1 day ago', type: 'success', read: true }
];
