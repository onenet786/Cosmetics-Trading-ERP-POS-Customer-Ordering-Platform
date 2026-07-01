import fs from 'fs';
import path from 'path';
import pkg from 'pg';
const { Pool } = pkg;

import { 
  INITIAL_BRANCHES, INITIAL_PRODUCTS, INITIAL_VARIANTS, INITIAL_BATCHES, 
  INITIAL_COA, INITIAL_PARTIES, INITIAL_ORDERS, INITIAL_NOTIFICATIONS 
} from '../data/initialData.ts';

const FALLBACK_FILE = path.join(process.cwd(), 'silkglow_db.json');

// Define connection parameters
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  host: process.env.PGHOST || process.env.SQL_HOST,
  port: parseInt(process.env.PGPORT || '5432'),
  user: process.env.PGUSER || process.env.SQL_USER,
  password: process.env.PGPASSWORD || process.env.SQL_PASSWORD,
  database: process.env.PGDATABASE || process.env.SQL_DB_NAME,
  ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : undefined
};

let pool: any = null;
let useFallback = true;
let memoryDb: Record<string, any[]> = {};

// Safe JSON file read/write helpers
const readFallbackFile = (): Record<string, any[]> => {
  try {
    if (fs.existsSync(FALLBACK_FILE)) {
      const data = fs.readFileSync(FALLBACK_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.warn('Failed to read fallback database file, resetting', err);
  }
  return {};
};

const writeFallbackFile = (data: Record<string, any[]>) => {
  try {
    fs.writeFileSync(FALLBACK_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write to fallback database file', err);
  }
};

// Initialize Fallback JSON Database with Initial Data
const initFallbackDb = () => {
  console.log('Initialize local file-based fallback database...');
  const current = readFallbackFile();
  
  if (!current.branches || current.branches.length === 0) current.branches = INITIAL_BRANCHES;
  if (!current.products || current.products.length === 0) current.products = INITIAL_PRODUCTS;
  if (!current.variants || current.variants.length === 0) current.variants = INITIAL_VARIANTS;
  if (!current.batches || current.batches.length === 0) current.batches = INITIAL_BATCHES;
  if (!current.coaAccounts || current.coaAccounts.length === 0) current.coaAccounts = INITIAL_COA;
  if (!current.parties || current.parties.length === 0) current.parties = INITIAL_PARTIES;
  if (!current.orders || current.orders.length === 0) current.orders = INITIAL_ORDERS;
  if (!current.notifications || current.notifications.length === 0) current.notifications = INITIAL_NOTIFICATIONS;
  if (!current.returnRequests || current.returnRequests.length === 0) {
    current.returnRequests = [{
      id: 'ret-80912',
      sessionNo: 'SESS-8091',
      cashierName: 'Zainab Fatima',
      branchId: 'b-01',
      originalInvoiceNo: 'INV-309142',
      itemName: 'Velvet Matte Cushion Lipstick (Rosewood Blush)',
      qty: 1,
      uom: 'Piece',
      reason: 'Customer shade did not match expectation',
      refundAmount: 1400,
      status: 'Pending',
      requestedAt: '12:45 PM'
    }];
  }
  if (!current.stockTransfers) current.stockTransfers = [];
  if (!current.vouchers) current.vouchers = [];

  writeFallbackFile(current);
  memoryDb = current;
};

// Main Database Initialization Engine
export async function initDatabase() {
  const hasPgConfig = !!(dbConfig.connectionString || dbConfig.host);
  
  if (!hasPgConfig) {
    console.warn('⚠️ No PostgreSQL database credentials supplied in environment. Launching with local fallback DB.');
    useFallback = true;
    initFallbackDb();
    return;
  }

  try {
    console.log('Connecting to PostgreSQL database...', {
      host: dbConfig.host,
      database: dbConfig.database,
      user: dbConfig.user
    });

    pool = dbConfig.connectionString 
      ? new Pool({ connectionString: dbConfig.connectionString })
      : new Pool({
          host: dbConfig.host,
          port: dbConfig.port,
          user: dbConfig.user,
          password: dbConfig.password,
          database: dbConfig.database,
          ssl: dbConfig.ssl,
          connectionTimeoutMillis: 5000
        });

    // Test the connection
    const client = await pool.connect();
    client.release();
    useFallback = false;
    console.log('🎉 PostgreSQL connection successful! Initializing schema tables and seeding...');

    // Execute table creations
    await createTables();
    await seedTables();
    
  } catch (err: any) {
    console.error('❌ Failed to connect to PostgreSQL database:', err.message || err);
    console.warn('⚠️ Falling back to local file-based fallback database for seamless offline/local operation.');
    useFallback = true;
    initFallbackDb();
  }
}

async function createTables() {
  const queries = [
    `CREATE TABLE IF NOT EXISTS branches (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      code TEXT NOT NULL,
      location TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      description TEXT NOT NULL,
      hs_code TEXT,
      tax_rate DOUBLE PRECISION NOT NULL,
      base_unit TEXT NOT NULL,
      is_batch_tracked BOOLEAN NOT NULL,
      image TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      name TEXT NOT NULL,
      sku TEXT NOT NULL,
      barcode TEXT NOT NULL,
      price_piece INT NOT NULL,
      price_dozen INT NOT NULL,
      price_carton INT NOT NULL,
      stock_level INT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS batches (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      batch_number TEXT NOT NULL,
      expiry_date TEXT NOT NULL,
      quantity INT NOT NULL,
      cost_price INT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS coa_accounts (
      id TEXT PRIMARY KEY,
      code TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      parent_id TEXT,
      balance DOUBLE PRECISION NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS parties (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      classification TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      credit_limit INT NOT NULL,
      credit_period INT NOT NULL,
      balance DOUBLE PRECISION NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT NOT NULL,
      date TEXT NOT NULL,
      party_id TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      items JSONB NOT NULL,
      subtotal DOUBLE PRECISION NOT NULL,
      tax DOUBLE PRECISION NOT NULL,
      discount DOUBLE PRECISION NOT NULL,
      total DOUBLE PRECISION NOT NULL,
      status TEXT NOT NULL,
      payment_status TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      delivery_address TEXT NOT NULL,
      rider_position INT NOT NULL,
      rider_id TEXT,
      estimated_delivery_time TEXT NOT NULL,
      notes TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      time TEXT NOT NULL,
      type TEXT NOT NULL,
      read BOOLEAN NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS return_requests (
      id TEXT PRIMARY KEY,
      session_no TEXT NOT NULL,
      cashier_name TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      original_invoice_no TEXT NOT NULL,
      item_name TEXT NOT NULL,
      qty INT NOT NULL,
      uom TEXT NOT NULL,
      reason TEXT NOT NULL,
      refund_amount INT NOT NULL,
      status TEXT NOT NULL,
      requested_at TEXT NOT NULL,
      approved_at TEXT,
      rejected_reason TEXT
    )`,
    `CREATE TABLE IF NOT EXISTS stock_transfers (
      id TEXT PRIMARY KEY,
      transfer_number TEXT NOT NULL,
      from_branch_id TEXT NOT NULL,
      to_branch_id TEXT NOT NULL,
      product_id TEXT NOT NULL,
      qty INT NOT NULL,
      uom TEXT NOT NULL,
      status TEXT NOT NULL,
      date TEXT NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS vouchers (
      id TEXT PRIMARY KEY,
      number TEXT NOT NULL,
      date TEXT NOT NULL,
      type TEXT NOT NULL,
      branch_id TEXT NOT NULL,
      narration TEXT NOT NULL,
      lines JSONB NOT NULL,
      approved BOOLEAN NOT NULL,
      approved_by TEXT,
      attachment_url TEXT
    )`
  ];

  for (const q of queries) {
    await pool.query(q);
  }
}

async function seedTables() {
  // Check and seed branches
  const bCheck = await pool.query('SELECT COUNT(*) FROM branches');
  if (parseInt(bCheck.rows[0].count) === 0) {
    console.log('Seeding branches table...');
    for (const b of INITIAL_BRANCHES) {
      await pool.query('INSERT INTO branches (id, name, code, location) VALUES ($1, $2, $3, $4)', [b.id, b.name, b.code, b.location]);
    }
  }

  // Check and seed products
  const pCheck = await pool.query('SELECT COUNT(*) FROM products');
  if (parseInt(pCheck.rows[0].count) === 0) {
    console.log('Seeding products table...');
    for (const p of INITIAL_PRODUCTS) {
      await pool.query(
        `INSERT INTO products (id, name, brand, category, subcategory, description, hs_code, tax_rate, base_unit, is_batch_tracked, image) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`, 
        [p.id, p.name, p.brand, p.category, p.subcategory, p.description, p.hsCode, p.taxRate, p.baseUnit, p.isBatchTracked, p.image]
      );
    }
  }

  // Check and seed variants
  const vCheck = await pool.query('SELECT COUNT(*) FROM variants');
  if (parseInt(vCheck.rows[0].count) === 0) {
    console.log('Seeding variants table...');
    for (const v of INITIAL_VARIANTS) {
      await pool.query(
        `INSERT INTO variants (id, product_id, name, sku, barcode, price_piece, price_dozen, price_carton, stock_level) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [v.id, v.productId, v.name, v.sku, v.barcode, v.pricePiece, v.priceDozen, v.priceCarton, v.stockLevel]
      );
    }
  }

  // Check and seed batches
  const btCheck = await pool.query('SELECT COUNT(*) FROM batches');
  if (parseInt(btCheck.rows[0].count) === 0) {
    console.log('Seeding batches table...');
    for (const b of INITIAL_BATCHES) {
      await pool.query(
        'INSERT INTO batches (id, product_id, batch_number, expiry_date, quantity, cost_price) VALUES ($1, $2, $3, $4, $5, $6)',
        [b.id, b.productId, b.batchNumber, b.expiryDate, b.quantity, b.costPrice]
      );
    }
  }

  // Check and seed COA Accounts
  const coaCheck = await pool.query('SELECT COUNT(*) FROM coa_accounts');
  if (parseInt(coaCheck.rows[0].count) === 0) {
    console.log('Seeding coa_accounts table...');
    for (const c of INITIAL_COA) {
      await pool.query(
        'INSERT INTO coa_accounts (id, code, name, type, parent_id, balance) VALUES ($1, $2, $3, $4, $5, $6)',
        [c.id, c.code, c.name, c.type, c.parentId, c.balance]
      );
    }
  }

  // Check and seed Parties
  const ptyCheck = await pool.query('SELECT COUNT(*) FROM parties');
  if (parseInt(ptyCheck.rows[0].count) === 0) {
    console.log('Seeding parties table...');
    for (const p of INITIAL_PARTIES) {
      await pool.query(
        'INSERT INTO parties (id, name, type, classification, phone, email, credit_limit, credit_period, balance) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        [p.id, p.name, p.type, p.classification, p.phone, p.email, p.creditLimit, p.creditPeriod, p.balance]
      );
    }
  }

  // Check and seed Orders
  const ordCheck = await pool.query('SELECT COUNT(*) FROM orders');
  if (parseInt(ordCheck.rows[0].count) === 0) {
    console.log('Seeding orders table...');
    for (const o of INITIAL_ORDERS) {
      await pool.query(
        `INSERT INTO orders (id, order_number, date, party_id, customer_name, customer_phone, items, subtotal, tax, discount, total, status, payment_status, payment_method, branch_id, delivery_address, rider_position, rider_id, estimated_delivery_time, notes) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
        [o.id, o.orderNumber, o.date, o.partyId, o.customerName, o.customerPhone, JSON.stringify(o.items), o.subtotal, o.tax, o.discount, o.total, o.status, o.paymentStatus, o.paymentMethod, o.branchId, o.deliveryAddress, o.riderPosition, o.riderId || null, o.estimatedDeliveryTime, o.notes || null]
      );
    }
  }

  // Check and seed Notifications
  const notCheck = await pool.query('SELECT COUNT(*) FROM notifications');
  if (parseInt(notCheck.rows[0].count) === 0) {
    console.log('Seeding notifications table...');
    for (const n of INITIAL_NOTIFICATIONS) {
      await pool.query(
        'INSERT INTO notifications (id, title, message, time, type, read) VALUES ($1, $2, $3, $4, $5, $6)',
        [n.id, n.title, n.message, n.time, n.type, n.read]
      );
    }
  }

  // Check and seed Return Requests
  const retCheck = await pool.query('SELECT COUNT(*) FROM return_requests');
  if (parseInt(retCheck.rows[0].count) === 0) {
    console.log('Seeding return_requests table...');
    await pool.query(
      `INSERT INTO return_requests (id, session_no, cashier_name, branch_id, original_invoice_no, item_name, qty, uom, reason, refund_amount, status, requested_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
      ['ret-80912', 'SESS-8091', 'Zainab Fatima', 'b-01', 'INV-309142', 'Velvet Matte Cushion Lipstick (Rosewood Blush)', 1, 'Piece', 'Customer shade did not match expectation', 1400, 'Pending', '12:45 PM']
    );
  }
}

// Map frontend camelCase table names to database snake_case names
const getTableName = (collectionName: string) => {
  switch (collectionName) {
    case 'coaAccounts': return 'coa_accounts';
    case 'returnRequests': return 'return_requests';
    case 'stockTransfers': return 'stock_transfers';
    default: return collectionName; // branches, products, variants, batches, parties, orders, notifications, vouchers
  }
};

// Generic Database Queries Wrapper
export const dbService = {
  async getCollection<T>(collectionName: string): Promise<T[]> {
    if (useFallback) {
      const col = getTableName(collectionName);
      return (memoryDb[col] || []) as T[];
    }

    const table = getTableName(collectionName);
    const result = await pool.query(`SELECT * FROM ${table}`);
    
    // Convert back from snake_case database columns to camelCase frontend models
    return result.rows.map((row: any) => {
      const item: any = { id: row.id };
      for (const key of Object.keys(row)) {
        if (key === 'id') continue;
        // Convert camelCase columns matching database snake_case structures
        let camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
        
        // Custom key corrections
        if (camelKey === 'hsCode') camelKey = 'hsCode';
        if (camelKey === 'taxRate') camelKey = 'taxRate';
        if (camelKey === 'baseUnit') camelKey = 'baseUnit';
        if (camelKey === 'isBatchTracked') camelKey = 'isBatchTracked';
        if (camelKey === 'productId') camelKey = 'productId';
        if (camelKey === 'pricePiece') camelKey = 'pricePiece';
        if (camelKey === 'priceDozen') camelKey = 'priceDozen';
        if (camelKey === 'priceCarton') camelKey = 'priceCarton';
        if (camelKey === 'stockLevel') camelKey = 'stockLevel';
        if (camelKey === 'batchNumber') camelKey = 'batchNumber';
        if (camelKey === 'expiryDate') camelKey = 'expiryDate';
        if (camelKey === 'costPrice') camelKey = 'costPrice';
        if (camelKey === 'parentId') camelKey = 'parentId';
        if (camelKey === 'creditLimit') camelKey = 'creditLimit';
        if (camelKey === 'creditPeriod') camelKey = 'creditPeriod';
        if (camelKey === 'orderNumber') camelKey = 'orderNumber';
        if (camelKey === 'partyId') camelKey = 'partyId';
        if (camelKey === 'customerName') camelKey = 'customerName';
        if (camelKey === 'customerPhone') camelKey = 'customerPhone';
        if (camelKey === 'paymentStatus') camelKey = 'paymentStatus';
        if (camelKey === 'paymentMethod') camelKey = 'paymentMethod';
        if (camelKey === 'branchId') camelKey = 'branchId';
        if (camelKey === 'deliveryAddress') camelKey = 'deliveryAddress';
        if (camelKey === 'riderPosition') camelKey = 'riderPosition';
        if (camelKey === 'riderId') camelKey = 'riderId';
        if (camelKey === 'estimatedDeliveryTime') camelKey = 'estimatedDeliveryTime';
        if (camelKey === 'sessionNo') camelKey = 'sessionNo';
        if (camelKey === 'cashierName') camelKey = 'cashierName';
        if (camelKey === 'originalInvoiceNo') camelKey = 'originalInvoiceNo';
        if (camelKey === 'itemName') camelKey = 'itemName';
        if (camelKey === 'refundAmount') camelKey = 'refundAmount';
        if (camelKey === 'requestedAt') camelKey = 'requestedAt';
        if (camelKey === 'approvedAt') camelKey = 'approvedAt';
        if (camelKey === 'rejectedReason') camelKey = 'rejectedReason';
        if (camelKey === 'transferNumber') camelKey = 'transferNumber';
        if (camelKey === 'fromBranchId') camelKey = 'fromBranchId';
        if (camelKey === 'toBranchId') camelKey = 'toBranchId';
        if (camelKey === 'attachmentUrl') camelKey = 'attachmentUrl';
        if (camelKey === 'approvedBy') camelKey = 'approvedBy';

        item[camelKey] = row[key];
      }
      return item;
    });
  },

  async saveDoc<T extends { id: string }>(collectionName: string, data: T): Promise<void> {
    if (useFallback) {
      const col = getTableName(collectionName);
      if (!memoryDb[col]) memoryDb[col] = [];
      const idx = memoryDb[col].findIndex(item => item.id === data.id);
      if (idx >= 0) {
        memoryDb[col][idx] = data;
      } else {
        memoryDb[col].push(data);
      }
      writeFallbackFile(memoryDb);
      return;
    }

    const table = getTableName(collectionName);
    
    // Build SQL INSERT ON CONFLICT UPDATE dynamic query safely
    const fields: string[] = [];
    const dbColumns: string[] = [];
    const values: any[] = [data.id];
    const placeholders: string[] = ['$1'];
    let updateClauses: string[] = [];

    let count = 2;
    for (const key of Object.keys(data)) {
      if (key === 'id') continue;
      
      // Map camelCase properties to snake_case table columns
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      dbColumns.push(snakeKey);
      
      let val = (data as any)[key];
      if (val !== null && typeof val === 'object') {
        val = JSON.stringify(val);
      }
      values.push(val);
      placeholders.push(`$${count}`);
      updateClauses.push(`${snakeKey} = $${count}`);
      count++;
    }

    if (dbColumns.length === 0) {
      // Insertion of an entity containing only ID
      await pool.query(`INSERT INTO ${table} (id) VALUES ($1) ON CONFLICT (id) DO NOTHING`, [data.id]);
      return;
    }

    const insertQuery = `
      INSERT INTO ${table} (id, ${dbColumns.join(', ')}) 
      VALUES ($1, ${placeholders.slice(1).join(', ')})
      ON CONFLICT (id) DO UPDATE SET ${updateClauses.join(', ')}
    `;

    await pool.query(insertQuery, values);
  },

  async updateDoc(collectionName: string, id: string, fields: Record<string, any>): Promise<void> {
    if (useFallback) {
      const col = getTableName(collectionName);
      if (!memoryDb[col]) memoryDb[col] = [];
      const idx = memoryDb[col].findIndex(item => item.id === id);
      if (idx >= 0) {
        memoryDb[col][idx] = { ...memoryDb[col][idx], ...fields };
        writeFallbackFile(memoryDb);
      }
      return;
    }

    const table = getTableName(collectionName);
    const updateClauses: string[] = [];
    const values: any[] = [id];

    let count = 2;
    for (const key of Object.keys(fields)) {
      const snakeKey = key.replace(/([A-Z])/g, "_$1").toLowerCase();
      let val = fields[key];
      if (val !== null && typeof val === 'object') {
        val = JSON.stringify(val);
      }
      values.push(val);
      updateClauses.push(`${snakeKey} = $${count}`);
      count++;
    }

    if (updateClauses.length === 0) return;

    const query = `UPDATE ${table} SET ${updateClauses.join(', ')} WHERE id = $1`;
    await pool.query(query, values);
  },

  async deleteDoc(collectionName: string, id: string): Promise<void> {
    if (useFallback) {
      const col = getTableName(collectionName);
      if (memoryDb[col]) {
        memoryDb[col] = memoryDb[col].filter(item => item.id !== id);
        writeFallbackFile(memoryDb);
      }
      return;
    }

    const table = getTableName(collectionName);
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
  }
};
