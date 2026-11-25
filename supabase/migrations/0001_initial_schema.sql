-- Modelo base para tienda online + showroom físico.
-- Requiere la extensión pgcrypto, disponible por defecto en Supabase.
create extension if not exists pgcrypto;

create type public.user_role as enum ('owner', 'admin', 'seller', 'warehouse');
create type public.product_status as enum ('draft', 'active', 'archived');
create type public.order_status as enum ('pending', 'confirmed', 'preparing', 'shipped', 'completed', 'cancelled', 'refunded');
create type public.payment_status as enum ('pending', 'authorized', 'paid', 'failed', 'refunded');
create type public.fulfillment_method as enum ('shipping', 'pickup', 'showroom');
create type public.stock_movement_type as enum ('purchase', 'sale', 'adjustment', 'return', 'transfer', 'reservation', 'release');

create table public.stores (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  currency text not null default 'ARS',
  timezone text not null default 'America/Argentina/Buenos_Aires',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role public.user_role not null default 'seller',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.store_members (
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.user_role not null default 'seller',
  created_at timestamptz not null default now(),
  primary key (store_id, user_id)
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  parent_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  image_url text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (store_id, slug)
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  category_id uuid references public.categories(id) on delete set null,
  name text not null,
  slug text not null,
  description text,
  brand text,
  season text,
  gender text,
  status public.product_status not null default 'draft',
  is_featured boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (store_id, slug)
);

create table public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid,
  url text not null,
  alt_text text,
  sort_order integer not null default 0
);

create table public.product_options (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sort_order integer not null default 0
);

create table public.product_option_values (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references public.product_options(id) on delete cascade,
  value text not null,
  sort_order integer not null default 0,
  unique (option_id, value)
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  sku text not null unique,
  barcode text,
  price numeric(12,2) not null default 0 check (price >= 0),
  compare_at_price numeric(12,2) check (compare_at_price is null or compare_at_price >= 0),
  cost_price numeric(12,2) check (cost_price is null or cost_price >= 0),
  weight_grams integer check (weight_grams is null or weight_grams >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.product_images
  add constraint product_images_variant_fk foreign key (variant_id) references public.product_variants(id) on delete cascade;

create table public.variant_option_values (
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  option_value_id uuid not null references public.product_option_values(id) on delete cascade,
  primary key (variant_id, option_value_id)
);

create table public.locations (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  name text not null,
  type text not null default 'showroom' check (type in ('showroom', 'warehouse', 'virtual')),
  address text,
  created_at timestamptz not null default now()
);

create table public.inventory (
  variant_id uuid not null references public.product_variants(id) on delete cascade,
  location_id uuid not null references public.locations(id) on delete cascade,
  quantity integer not null default 0 check (quantity >= 0),
  reserved_quantity integer not null default 0 check (reserved_quantity >= 0),
  updated_at timestamptz not null default now(),
  primary key (variant_id, location_id)
);

create table public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants(id),
  location_id uuid not null references public.locations(id),
  type public.stock_movement_type not null,
  quantity integer not null check (quantity <> 0),
  reference text,
  notes text,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  label text not null default 'Principal',
  recipient_name text not null,
  line1 text not null,
  line2 text,
  city text not null,
  province text,
  postal_code text,
  country text not null default 'AR',
  is_default boolean not null default false
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  order_number bigint generated always as identity unique,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  fulfillment_method public.fulfillment_method not null default 'shipping',
  subtotal numeric(12,2) not null default 0,
  discount_total numeric(12,2) not null default 0,
  shipping_total numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  currency text not null default 'ARS',
  customer_email text,
  customer_phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  product_name text not null,
  variant_label text,
  sku text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  total numeric(12,2) not null check (total >= 0)
);

create table public.promotions (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  code text,
  name text not null,
  discount_type text not null check (discount_type in ('percentage', 'fixed', 'free_shipping')),
  discount_value numeric(12,2) not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  usage_limit integer,
  usage_count integer not null default 0,
  is_active boolean not null default true,
  unique (store_id, code)
);

create index products_store_status_idx on public.products(store_id, status);
create index product_variants_product_idx on public.product_variants(product_id);
create index inventory_location_idx on public.inventory(location_id);
create index orders_store_status_idx on public.orders(store_id, status);
create index orders_customer_idx on public.orders(customer_id);

alter table public.stores enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.categories enable row level security;
alter table public.orders enable row level security;
alter table public.customers enable row level security;

-- El catálogo activo es público; las operaciones privadas se habilitarán junto con roles.
create policy "public can read active products" on public.products for select using (status = 'active');
create policy "public can read active categories" on public.categories for select using (true);
create policy "public can read active variants" on public.product_variants for select using (is_active = true);
