import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const DATA_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'eloria.sqlite');
const db = new DatabaseSync(DB_PATH);

// Initialize tables
db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    city TEXT DEFAULT '',
    address TEXT DEFAULT '',
    total_orders INTEGER DEFAULT 1,
    total_spent REAL DEFAULT 0,
    created_at TEXT NOT NULL,
    last_order_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    customer_id TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT DEFAULT '',
    city TEXT NOT NULL,
    address TEXT NOT NULL,
    payment_method TEXT NOT NULL,
    notes TEXT DEFAULT '',
    items_json TEXT NOT NULL,
    subtotal REAL NOT NULL,
    delivery_fee REAL NOT NULL,
    total_amount REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    created_at TEXT NOT NULL,
    FOREIGN KEY(customer_id) REFERENCES customers(id)
  );

  CREATE TABLE IF NOT EXISTS custom_requests (
    id TEXT PRIMARY KEY,
    request_number TEXT UNIQUE NOT NULL,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT DEFAULT '',
    length TEXT NOT NULL,
    sleeves TEXT NOT NULL,
    size TEXT NOT NULL,
    colour TEXT NOT NULL,
    notes TEXT DEFAULT '',
    status TEXT NOT NULL DEFAULT 'New',
    created_at TEXT NOT NULL
  );
`);

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  total_orders: number;
  total_spent: number;
  created_at: string;
  last_order_at: string;
}

export interface OrderItem {
  product: {
    id: number;
    name: string;
    price: number;
    image: string;
    category?: string;
  };
  size: string;
  quantity: number;
}

export interface Order {
  id: string;
  order_number: string;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  city: string;
  address: string;
  payment_method: string;
  notes: string;
  items_json: string;
  items?: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
  status: string;
  created_at: string;
}

export interface CustomRequest {
  id: string;
  request_number: string;
  customer_name: string;
  phone: string;
  email: string;
  length: string;
  sleeves: string;
  size: string;
  colour: string;
  notes: string;
  status: string;
  created_at: string;
}

// Order Operations
export function createOrder(data: {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  city: string;
  address: string;
  payment_method: string;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  delivery_fee: number;
  total_amount: number;
}): Order {
  const orderId = 'ord_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const orderNumber = 'EL-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toISOString();

  // Find or create customer by phone
  const cleanPhone = (data.customer_phone || '').trim();
  const findCustomerStmt = db.prepare('SELECT * FROM customers WHERE phone = ? LIMIT 1');
  const existingCustomer = findCustomerStmt.get(cleanPhone) as unknown as Customer | undefined;

  let customerId = '';
  if (existingCustomer) {
    customerId = existingCustomer.id;
    const updateCustomerStmt = db.prepare(`
      UPDATE customers 
      SET name = ?, email = COALESCE(NULLIF(?, ''), email), city = ?, address = ?,
          total_orders = total_orders + 1, total_spent = total_spent + ?, last_order_at = ?
      WHERE id = ?
    `);
    updateCustomerStmt.run(
      data.customer_name.trim(),
      (data.customer_email || '').trim(),
      data.city,
      data.address,
      data.total_amount,
      now,
      customerId
    );
  } else {
    customerId = 'cust_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    const insertCustomerStmt = db.prepare(`
      INSERT INTO customers (id, name, phone, email, city, address, total_orders, total_spent, created_at, last_order_at)
      VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
    `);
    insertCustomerStmt.run(
      customerId,
      data.customer_name.trim(),
      cleanPhone,
      (data.customer_email || '').trim(),
      data.city,
      data.address,
      data.total_amount,
      now,
      now
    );
  }

  // Insert Order
  const insertOrderStmt = db.prepare(`
    INSERT INTO orders (
      id, order_number, customer_id, customer_name, customer_phone, customer_email,
      city, address, payment_method, notes, items_json, subtotal, delivery_fee, total_amount, status, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
  `);

  insertOrderStmt.run(
    orderId,
    orderNumber,
    customerId,
    data.customer_name.trim(),
    cleanPhone,
    (data.customer_email || '').trim(),
    data.city,
    data.address,
    data.payment_method,
    (data.notes || '').trim(),
    JSON.stringify(data.items),
    data.subtotal,
    data.delivery_fee,
    data.total_amount,
    now
  );

  return {
    id: orderId,
    order_number: orderNumber,
    customer_id: customerId,
    customer_name: data.customer_name,
    customer_phone: cleanPhone,
    customer_email: data.customer_email || '',
    city: data.city,
    address: data.address,
    payment_method: data.payment_method,
    notes: data.notes || '',
    items_json: JSON.stringify(data.items),
    items: data.items,
    subtotal: data.subtotal,
    delivery_fee: data.delivery_fee,
    total_amount: data.total_amount,
    status: 'Pending',
    created_at: now,
  };
}

export function getAllOrders(): Order[] {
  const stmt = db.prepare('SELECT * FROM orders ORDER BY created_at DESC');
  const rows = stmt.all() as unknown as Order[];
  return rows.map(row => ({
    ...row,
    items: JSON.parse(row.items_json || '[]'),
  }));
}

export function getOrderByNumber(orderNumber: string): Order | null {
  const stmt = db.prepare('SELECT * FROM orders WHERE order_number = ? LIMIT 1');
  const row = stmt.get(orderNumber) as unknown as Order | undefined;
  if (!row) return null;
  return {
    ...row,
    items: JSON.parse(row.items_json || '[]'),
  };
}

export function updateOrderStatus(orderId: string, status: string): boolean {
  const stmt = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
  stmt.run(status, orderId);
  return true;
}

// Custom Requests Operations
export function createCustomRequest(data: {
  customer_name: string;
  phone: string;
  email?: string;
  length: string;
  sleeves: string;
  size: string;
  colour: string;
  notes?: string;
}): CustomRequest {
  const id = 'req_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const requestNumber = 'REQ-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO custom_requests (
      id, request_number, customer_name, phone, email, length, sleeves, size, colour, notes, status, created_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'New', ?)
  `);

  stmt.run(
    id,
    requestNumber,
    data.customer_name.trim(),
    data.phone.trim(),
    (data.email || '').trim(),
    data.length.trim(),
    data.sleeves.trim(),
    data.size.trim(),
    data.colour.trim(),
    (data.notes || '').trim(),
    now
  );

  return {
    id,
    request_number: requestNumber,
    customer_name: data.customer_name,
    phone: data.phone,
    email: data.email || '',
    length: data.length,
    sleeves: data.sleeves,
    size: data.size,
    colour: data.colour,
    notes: data.notes || '',
    status: 'New',
    created_at: now,
  };
}

export function getAllCustomRequests(): CustomRequest[] {
  const stmt = db.prepare('SELECT * FROM custom_requests ORDER BY created_at DESC');
  return stmt.all() as unknown as CustomRequest[];
}

export function updateCustomRequestStatus(id: string, status: string): boolean {
  const stmt = db.prepare('UPDATE custom_requests SET status = ? WHERE id = ?');
  stmt.run(status, id);
  return true;
}

// Customers Operations
export function getAllCustomers(): Customer[] {
  const stmt = db.prepare('SELECT * FROM customers ORDER BY last_order_at DESC');
  return stmt.all() as unknown as Customer[];
}

export function getStats() {
  const totalOrdersStmt = db.prepare('SELECT COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue FROM orders');
  const orderStats = totalOrdersStmt.get() as unknown as { count: number; revenue: number };

  const totalCustomersStmt = db.prepare('SELECT COUNT(*) as count FROM customers');
  const customerStats = totalCustomersStmt.get() as unknown as { count: number };

  const totalRequestsStmt = db.prepare('SELECT COUNT(*) as count FROM custom_requests');
  const requestStats = totalRequestsStmt.get() as unknown as { count: number };

  return {
    totalOrders: orderStats.count,
    totalRevenue: orderStats.revenue,
    totalCustomers: customerStats.count,
    totalCustomRequests: requestStats.count,
  };
}
