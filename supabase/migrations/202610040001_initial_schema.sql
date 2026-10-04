create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type public.user_role as enum ('student', 'faculty', 'vendor', 'resident', 'admin');
create type public.verification_status as enum ('pending', 'verified', 'rejected');
create type public.listing_status as enum ('draft', 'available', 'reserved', 'sold', 'removed');
create type public.order_status as enum ('pending_payment', 'paid', 'ready_for_collection', 'completed', 'cancelled', 'refunded');
create type public.payment_gateway as enum ('payfast', 'snapscan');
create type public.bulletin_category as enum ('Events', 'Announcements', 'Study groups');
create type public.report_target_type as enum ('listing', 'profile');
create type public.report_reason as enum ('Suspicious or misleading', 'Prohibited item', 'Harassment or abuse', 'Spam', 'Other');
create type public.report_status as enum ('open', 'resolved', 'dismissed');
create type public.notification_type as enum ('order', 'review', 'community', 'account');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'student',
  full_name text not null check (char_length(full_name) between 2 and 100),
  campus text not null default 'Bellville' check (char_length(campus) between 2 and 80),
  verified boolean not null default false,
  verification_status public.verification_status not null default 'pending',
  avatar_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 100),
  description text not null check (char_length(description) between 10 and 2000),
  price numeric(12,2) not null check (price >= 0),
  category text not null check (category in ('Books', 'Electronics', 'Home', 'Services')),
  condition text not null check (char_length(condition) between 2 and 60),
  campus text not null default 'Bellville',
  status public.listing_status not null default 'available',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings(id) on delete cascade,
  storage_path text not null unique,
  position smallint not null default 0 check (position between 0 and 9),
  alt_text text not null default '',
  created_at timestamptz not null default now(),
  unique (listing_id, position)
);

create table public.cart_items (
  user_id uuid not null references public.profiles(id) on delete cascade,
  listing_id uuid not null references public.listings(id) on delete cascade,
  quantity integer not null default 1 check (quantity between 1 and 20),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('RK-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8))),
  buyer_id uuid not null references public.profiles(id),
  status public.order_status not null default 'pending_payment',
  payment_gateway public.payment_gateway not null,
  payment_reference text unique,
  total numeric(12,2) not null check (total >= 0),
  collection_name text not null,
  collection_phone text not null,
  collection_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  listing_id uuid not null references public.listings(id),
  seller_id uuid not null references public.profiles(id),
  title_snapshot text not null,
  unit_price numeric(12,2) not null check (unit_price >= 0),
  quantity integer not null check (quantity between 1 and 20),
  unique (order_id, listing_id)
);

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references public.orders(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(comment) between 10 and 1000),
  created_at timestamptz not null default now(),
  check (seller_id <> reviewer_id)
);

create table public.bulletin_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 3 and 80),
  body text not null check (char_length(body) between 10 and 800),
  category public.bulletin_category not null,
  campus text not null default 'Bellville',
  event_date date,
  event_time time,
  location text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    category = 'Announcements'
    or (event_date is not null and event_time is not null and char_length(location) between 2 and 150)
  )
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.notification_type not null,
  title text not null check (char_length(title) between 2 and 100),
  message text not null check (char_length(message) between 2 and 300),
  href text not null default '/',
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles(id) on delete cascade,
  target_type public.report_target_type not null,
  target_id uuid not null,
  reason public.report_reason not null,
  details text not null default '' check (char_length(details) <= 500),
  status public.report_status not null default 'open',
  resolution_note text not null default '' check (char_length(resolution_note) <= 1000),
  resolved_by uuid references public.profiles(id),
  resolved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'open' and resolved_at is null and resolved_by is null)
    or (status <> 'open' and resolved_at is not null and resolved_by is not null)
  )
);

create unique index reports_one_open_per_target
  on public.reports (reporter_id, target_type, target_id)
  where status = 'open';
create index listings_feed_idx on public.listings (campus, status, created_at desc);
create index listings_seller_idx on public.listings (seller_id, status);
create index listings_search_idx on public.listings using gin ((title || ' ' || description) gin_trgm_ops);
create index order_items_seller_idx on public.order_items (seller_id, order_id);
create index orders_buyer_idx on public.orders (buyer_id, created_at desc);
create index reviews_seller_idx on public.reviews (seller_id, created_at desc);
create index bulletin_feed_idx on public.bulletin_posts (campus, category, created_at desc);
create index notifications_user_idx on public.notifications (user_id, read_at, created_at desc);
create index reports_queue_idx on public.reports (status, created_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin' and verified);
$$;

create function public.current_user_is_verified()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and verified);
$$;

create function public.current_user_participates_in_order(target_order_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select
    public.current_user_is_admin()
    or exists (select 1 from public.orders o where o.id = target_order_id and o.buyer_id = auth.uid())
    or exists (select 1 from public.order_items i where i.order_id = target_order_id and i.seller_id = auth.uid());
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role;
begin
  requested_role := case
    when new.raw_user_meta_data ->> 'role' in ('student', 'faculty', 'vendor', 'resident')
      then (new.raw_user_meta_data ->> 'role')::public.user_role
    else 'student'::public.user_role
  end;

  insert into public.profiles (id, role, full_name, campus)
  values (
    new.id,
    requested_role,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'campus'), ''), 'Bellville')
  );
  return new;
end;
$$;

create function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is not null and not public.current_user_is_admin() then
    new.role := old.role;
    new.verified := old.verified;
    new.verification_status := old.verification_status;
  end if;
  return new;
end;
$$;

create function public.validate_report_target()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.target_type = 'listing' and not exists (select 1 from public.listings where id = new.target_id) then
    raise foreign_key_violation using message = 'The reported listing does not exist.';
  end if;
  if new.target_type = 'profile' and not exists (select 1 from public.profiles where id = new.target_id) then
    raise foreign_key_violation using message = 'The reported profile does not exist.';
  end if;
  return new;
end;
$$;

create function public.finalize_report_resolution()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.status = 'open' and new.status <> 'open' then
    new.resolved_by := auth.uid();
    new.resolved_at := now();
  elsif new.status = 'open' then
    new.resolved_by := null;
    new.resolved_at := null;
  end if;
  return new;
end;
$$;

create function public.advance_order_status(target_order_id uuid, next_status public.order_status)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  current_order public.orders;
begin
  select * into current_order from public.orders where id = target_order_id for update;
  if current_order.id is null then raise exception 'Order not found.'; end if;

  if public.current_user_is_admin()
    or (next_status = 'ready_for_collection' and current_order.status = 'paid' and exists (select 1 from public.order_items where order_id = target_order_id and seller_id = auth.uid()))
    or (next_status = 'completed' and current_order.status = 'ready_for_collection' and current_order.buyer_id = auth.uid())
    or (next_status = 'cancelled' and current_order.status = 'pending_payment' and current_order.buyer_id = auth.uid())
  then
    update public.orders set status = next_status where id = target_order_id returning * into current_order;
    return current_order;
  end if;

  raise insufficient_privilege using message = 'This order transition is not allowed.';
end;
$$;

create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();
create trigger protect_profile_privileges_before_update before update on public.profiles
for each row execute function public.protect_profile_privileges();
create trigger profiles_updated_at before update on public.profiles for each row execute function public.set_updated_at();
create trigger listings_updated_at before update on public.listings for each row execute function public.set_updated_at();
create trigger cart_items_updated_at before update on public.cart_items for each row execute function public.set_updated_at();
create trigger orders_updated_at before update on public.orders for each row execute function public.set_updated_at();
create trigger bulletin_posts_updated_at before update on public.bulletin_posts for each row execute function public.set_updated_at();
create trigger reports_updated_at before update on public.reports for each row execute function public.set_updated_at();
create trigger validate_report_target_before_insert before insert on public.reports for each row execute function public.validate_report_target();
create trigger finalize_report_resolution_before_update before update on public.reports for each row execute function public.finalize_report_resolution();

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_images enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.bulletin_posts enable row level security;
alter table public.notifications enable row level security;
alter table public.reports enable row level security;

create policy profiles_read_authenticated on public.profiles for select to authenticated using (true);
create policy profiles_update_self_or_admin on public.profiles for update to authenticated
  using (id = auth.uid() or public.current_user_is_admin())
  with check (id = auth.uid() or public.current_user_is_admin());

create policy listings_read_available_or_owned on public.listings for select to authenticated
  using (status = 'available' or seller_id = auth.uid() or public.current_user_is_admin());
create policy listings_insert_verified_owner on public.listings for insert to authenticated
  with check (seller_id = auth.uid() and public.current_user_is_verified());
create policy listings_update_owner_or_admin on public.listings for update to authenticated
  using (seller_id = auth.uid() or public.current_user_is_admin())
  with check (seller_id = auth.uid() or public.current_user_is_admin());
create policy listings_delete_owner_or_admin on public.listings for delete to authenticated
  using (seller_id = auth.uid() or public.current_user_is_admin());

create policy listing_images_read_visible on public.listing_images for select to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id));
create policy listing_images_write_owner on public.listing_images for all to authenticated
  using (exists (select 1 from public.listings l where l.id = listing_id and (l.seller_id = auth.uid() or public.current_user_is_admin())))
  with check (exists (select 1 from public.listings l where l.id = listing_id and (l.seller_id = auth.uid() or public.current_user_is_admin())));

create policy cart_items_owner_only on public.cart_items for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy orders_read_participant_or_admin on public.orders for select to authenticated
  using (public.current_user_participates_in_order(id));
create policy orders_insert_verified_buyer on public.orders for insert to authenticated
  with check (buyer_id = auth.uid() and public.current_user_is_verified());
create policy orders_update_admin_only on public.orders for update to authenticated
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());

create policy order_items_read_participant_or_admin on public.order_items for select to authenticated
  using (public.current_user_participates_in_order(order_id));
create policy order_items_insert_buyer on public.order_items for insert to authenticated
  with check (exists (select 1 from public.orders o where o.id = order_id and o.buyer_id = auth.uid() and o.status = 'pending_payment'));

create policy reviews_read_authenticated on public.reviews for select to authenticated using (true);
create policy reviews_insert_completed_buyer on public.reviews for insert to authenticated
  with check (
    reviewer_id = auth.uid()
    and exists (
      select 1 from public.orders o join public.order_items i on i.order_id = o.id
      where o.id = order_id and o.buyer_id = auth.uid() and o.status = 'completed' and i.seller_id = seller_id
    )
  );
create policy reviews_update_admin_only on public.reviews for update to authenticated
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());
create policy reviews_delete_admin_only on public.reviews for delete to authenticated using (public.current_user_is_admin());

create policy bulletin_read_verified on public.bulletin_posts for select to authenticated using (public.current_user_is_verified());
create policy bulletin_insert_verified_author on public.bulletin_posts for insert to authenticated
  with check (author_id = auth.uid() and public.current_user_is_verified());
create policy bulletin_update_author_or_admin on public.bulletin_posts for update to authenticated
  using (author_id = auth.uid() or public.current_user_is_admin())
  with check (author_id = auth.uid() or public.current_user_is_admin());
create policy bulletin_delete_author_or_admin on public.bulletin_posts for delete to authenticated
  using (author_id = auth.uid() or public.current_user_is_admin());

create policy notifications_owner_read on public.notifications for select to authenticated using (user_id = auth.uid());
create policy notifications_owner_mark_read on public.notifications for update to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

revoke update on public.notifications from authenticated;
grant update (read_at) on public.notifications to authenticated;

create policy reports_insert_verified_reporter on public.reports for insert to authenticated
  with check (reporter_id = auth.uid() and public.current_user_is_verified());
create policy reports_read_admin_only on public.reports for select to authenticated using (public.current_user_is_admin());
create policy reports_update_admin_only on public.reports for update to authenticated
  using (public.current_user_is_admin()) with check (public.current_user_is_admin());

grant usage on schema public to authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.listings to authenticated;
grant select, insert, update, delete on public.listing_images to authenticated;
grant select, insert, update, delete on public.cart_items to authenticated;
grant select, insert, update on public.orders to authenticated;
grant select, insert on public.order_items to authenticated;
grant select, insert, update, delete on public.reviews to authenticated;
grant select, insert, update, delete on public.bulletin_posts to authenticated;
grant select, insert, update on public.reports to authenticated;
grant select on public.notifications to authenticated;

revoke all on function public.current_user_is_admin() from public;
revoke all on function public.current_user_is_verified() from public;
revoke all on function public.current_user_participates_in_order(uuid) from public;
revoke all on function public.advance_order_status(uuid, public.order_status) from public;
grant execute on function public.current_user_is_admin() to authenticated;
grant execute on function public.current_user_is_verified() to authenticated;
grant execute on function public.current_user_participates_in_order(uuid) to authenticated;
grant execute on function public.advance_order_status(uuid, public.order_status) to authenticated;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications') then
    alter publication supabase_realtime add table public.notifications;
  end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'orders') then
    alter publication supabase_realtime add table public.orders;
  end if;
end $$;
