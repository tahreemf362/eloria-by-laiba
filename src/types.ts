export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  badge?: string;
  image: string;
  description: string;
  customisable?: boolean;
}

export interface CartItem {
  product: Product;
  size: string;
  quantity: number;
}

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
  items_json?: string;
  items: CartItem[];
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

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  totalCustomRequests: number;
}
