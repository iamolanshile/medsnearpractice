-- Enable PostGIS for geo queries
create extension if not exists postgis;

-- Agents
create table agents (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text unique not null,
  email text unique not null,
  password_hash text not null,
  status text default 'pending' check (status in ('pending','active','suspended')),
  region text,
  created_at timestamptz default now()
);

-- Admins
create table admins (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  created_at timestamptz default now()
);

-- Pharmacies
create table pharmacies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  lga text,
  state text default 'Lagos',
  phone text,
  lat double precision,
  lng double precision,
  location geography(Point, 4326),
  added_by uuid references agents(id),
  created_at timestamptz default now()
);

-- Inventory
create table inventory (
  id uuid primary key default gen_random_uuid(),
  pharmacy_id uuid references pharmacies(id) on delete cascade,
  agent_id uuid references agents(id),
  drug_name text not null,
  brand text,
  price numeric(10,2) not null,
  quantity int not null default 0,
  expiry_date date,
  photo_url text,
  is_available boolean generated always as (quantity > 0) stored,
  uploaded_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Orders
create table orders (
  id uuid primary key default gen_random_uuid(),
  inventory_id uuid references inventory(id),
  pharmacy_id uuid references pharmacies(id),
  agent_id uuid references agents(id),
  customer_phone text not null,
  customer_name text,
  drug_name text not null,
  quantity int default 1,
  total_price numeric(10,2),
  status text default 'pending' check (status in ('pending','confirmed','in_progress','delivered','cancelled')),
  payment_confirmed boolean default false,
  delivery_address text,
  whatsapp_session jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Monthly payout tracking
create table payouts (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id),
  month text not null, -- e.g. "2025-01"
  upload_count int default 0,
  rate_per_upload numeric(10,2) default 50,
  bonus numeric(10,2) default 0,
  total_amount numeric(10,2),
  status text default 'pending' check (status in ('pending','approved','paid')),
  approved_by uuid references admins(id),
  paid_at timestamptz,
  created_at timestamptz default now()
);

-- Indexes
create index on inventory(drug_name);
create index on inventory(pharmacy_id);
create index on pharmacies using gist(location);
create index on orders(status);
create index on orders(agent_id);

-- Function: update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger inventory_updated_at before update on inventory
  for each row execute function update_updated_at();

create trigger orders_updated_at before update on orders
  for each row execute function update_updated_at();

-- RPC: search drug nearby using PostGIS
create or replace function search_drug_nearby(
  drug_query text,
  user_lat double precision,
  user_lng double precision,
  radius_m double precision default 10000
)
returns table (
  id uuid,
  drug_name text,
  brand text,
  price numeric,
  quantity int,
  is_available boolean,
  photo_url text,
  agent_id uuid,
  pharmacy_id uuid,
  pharmacy_name text,
  address text,
  distance_m double precision
)
language sql stable as $$
  select
    i.id, i.drug_name, i.brand, i.price, i.quantity, i.is_available, i.photo_url, i.agent_id,
    p.id as pharmacy_id, p.name as pharmacy_name, p.address,
    ST_Distance(p.location, ST_MakePoint(user_lng, user_lat)::geography) as distance_m
  from inventory i
  join pharmacies p on p.id = i.pharmacy_id
  where
    i.drug_name ilike '%' || drug_query || '%'
    and i.quantity > 0
    and p.location is not null
    and ST_DWithin(p.location, ST_MakePoint(user_lng, user_lat)::geography, radius_m)
  order by distance_m asc
  limit 5;
$$;

-- Agent verification documents
create table agent_verifications (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade unique,
  doc_type text check (doc_type in ('nin','drivers_licence','passport','voters_card')),
  doc_number text,
  doc_url text,
  id_address text,
  consent_form_url text,
  status text default 'pending' check (status in ('pending','approved','rejected')),
  rejection_reason text,
  reviewed_by uuid references admins(id),
  reviewed_at timestamptz,
  submitted_at timestamptz default now()
);

-- Agent pharmacies (one agent can cover multiple pharmacies)
create table agent_pharmacies (
  id uuid primary key default gen_random_uuid(),
  agent_id uuid references agents(id) on delete cascade,
  pharmacy_id uuid references pharmacies(id) on delete cascade,
  consent_form_url text,
  assigned_at timestamptz default now(),
  unique(agent_id, pharmacy_id)
);

-- Alter agents table to add verification status + address fields
alter table agents add column if not exists state text;
alter table agents add column if not exists lga text;
alter table agents add column if not exists id_address text;
alter table agents add column if not exists verification_status text default 'unverified'
  check (verification_status in ('unverified','pending','verified','rejected'));

-- Platform settings (admin-controlled)
create table platform_settings (
  key text primary key,
  value text not null,
  label text,
  updated_at timestamptz default now()
);

-- Seed default settings
insert into platform_settings (key, value, label) values
  ('payout_rate_per_upload', '50', 'Payout rate per upload (₦)'),
  ('bonus_tier_1_uploads', '50', 'Bonus tier 1 — min uploads'),
  ('bonus_tier_1_amount', '1000', 'Bonus tier 1 — amount (₦)'),
  ('bonus_tier_2_uploads', '100', 'Bonus tier 2 — min uploads'),
  ('bonus_tier_2_amount', '2000', 'Bonus tier 2 — amount (₦)'),
  ('company_bank_name', 'First Bank', 'Company bank name'),
  ('company_account_number', '1234567890', 'Company account number'),
  ('company_account_name', 'MedsNear Ltd', 'Company account name'),
  ('whatsapp_search_radius_km', '10', 'WhatsApp search radius (km)'),
  ('consent_form_url', '', 'Consent form download URL')
on conflict (key) do nothing;
