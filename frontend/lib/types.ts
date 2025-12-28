export type Role = "admin" | "cashier";

export type User = {
  id: number;
  email: string;
  role: Role;
  is_active: boolean;
  created_at: string;
};

export type AuthState = {
  access_token: string;
  user: User;
};

export type Category = {
  id: number;
  name: string;
  is_active: boolean;
  created_at: string;
};

export type Product = {
  id: number;
  sku: string;
  name: string;
  category_id: number;
  price: string;
  is_active: boolean;
  created_at: string;
};

export type Inventory = {
  product_id: number;
  quantity: number;
  updated_at: string;
};

export type OrderItem = {
  id: number;
  product_id: number;
  unit_price: string;
  quantity: number;
  line_total: string;
};

export type Order = {
  id: number;
  created_by: number;
  total_amount: string;
  created_at: string;
  items: OrderItem[];
};

export type DailyReport = {
  date: string;
  order_count: number;
  total_amount: string;
  top_products: { product_id: number; name: string; quantity: number; total: string }[];
};
