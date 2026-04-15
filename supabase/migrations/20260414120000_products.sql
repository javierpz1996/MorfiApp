-- Ejecutá este SQL en el editor SQL de Supabase (o con la CLI) si aún no tenés la tabla.

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  category_id text not null,
  price_normal numeric(12, 2) not null check (price_normal >= 0),
  price_offer numeric(12, 2) not null check (price_offer >= 0),
  address text not null default '',
  latitude double precision not null,
  longitude double precision not null,
  created_at timestamptz not null default now()
);

create index if not exists products_created_at_idx on public.products (created_at desc);

alter table public.products enable row level security;

drop policy if exists "products_select_authenticated" on public.products;
create policy "products_select_authenticated"
  on public.products
  for select
  to authenticated
  using (true);

drop policy if exists "products_insert_own" on public.products;
create policy "products_insert_own"
  on public.products
  for insert
  to authenticated
  with check (auth.uid() = user_id);

drop policy if exists "products_update_own" on public.products;
create policy "products_update_own"
  on public.products
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "products_delete_own" on public.products;
create policy "products_delete_own"
  on public.products
  for delete
  to authenticated
  using (auth.uid() = user_id);
