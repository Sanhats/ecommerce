export type ProductStatus = "draft" | "active" | "archived";
export type OrderStatus = "pending" | "confirmed" | "preparing" | "shipped" | "completed" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "authorized" | "paid" | "failed" | "refunded";
export type FulfillmentMethod = "shipping" | "pickup" | "showroom";

export interface ProductVariant {
  id: string;
  product_id: string;
  sku: string;
  barcode?: string | null;
  price: number;
  compare_at_price?: number | null;
  cost_price?: number | null;
  is_active: boolean;
}

export interface Product {
  id: string;
  store_id: string;
  category_id?: string | null;
  name: string;
  slug: string;
  description?: string | null;
  brand?: string | null;
  season?: string | null;
  gender?: string | null;
  status: ProductStatus;
  is_featured: boolean;
  variants?: ProductVariant[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  variant_id?: string | null;
  product_name: string;
  variant_label?: string | null;
  sku?: string | null;
  quantity: number;
  unit_price: number;
  total: number;
}

export interface Order {
  id: string;
  order_number: number;
  customer_id?: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  fulfillment_method: FulfillmentMethod;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  total: number;
  items?: OrderItem[];
}
