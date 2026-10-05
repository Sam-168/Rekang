create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create table if not exists private.runtime_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

insert into private.runtime_settings (key, value)
values ('payments_mode', 'sandbox')
on conflict (key) do nothing;

revoke all on private.runtime_settings from public, anon, authenticated;

drop policy if exists listings_read_available_or_owned on public.listings;
create policy listings_read_available_or_participant on public.listings for select to authenticated
using (
  status = 'available'
  or seller_id = auth.uid()
  or public.current_user_is_admin()
  or exists (
    select 1
    from public.order_items item
    join public.orders purchase on purchase.id = item.order_id
    where item.listing_id = listings.id and purchase.buyer_id = auth.uid()
  )
);

create or replace function public.create_order_from_cart(
  checkout_gateway public.payment_gateway,
  checkout_collection_name text,
  checkout_collection_phone text,
  checkout_collection_note text default ''
)
returns public.orders
language plpgsql
security definer
set search_path = public, private
as $$
declare
  created_order public.orders;
  item_count integer;
  seller_count integer;
  calculated_total numeric(12,2);
begin
  if auth.uid() is null then raise insufficient_privilege using message = 'Sign in before checking out.'; end if;
  if not public.current_user_is_verified() then raise insufficient_privilege using message = 'Verify your account before checking out.'; end if;
  if char_length(trim(checkout_collection_name)) < 2 then raise exception 'Enter the collection name.'; end if;
  if char_length(regexp_replace(checkout_collection_phone, '[^0-9+]', '', 'g')) < 9 then raise exception 'Enter a valid collection phone number.'; end if;
  if char_length(coalesce(checkout_collection_note, '')) > 500 then raise exception 'Collection note is too long.'; end if;

  perform listing.id
  from public.cart_items cart
  join public.listings listing on listing.id = cart.listing_id
  where cart.user_id = auth.uid()
  for update of listing;

  select count(*), count(distinct listing.seller_id), coalesce(sum(listing.price * cart.quantity), 0)
  into item_count, seller_count, calculated_total
  from public.cart_items cart
  join public.listings listing on listing.id = cart.listing_id
  where cart.user_id = auth.uid() and listing.status = 'available';

  if item_count = 0 then raise exception 'Your cart contains no available listings.'; end if;
  if seller_count <> 1 then raise exception 'Checkout currently supports items from one seller at a time.'; end if;
  if exists (
    select 1 from public.cart_items cart join public.listings listing on listing.id = cart.listing_id
    where cart.user_id = auth.uid() and listing.seller_id = auth.uid()
  ) then raise exception 'You cannot purchase your own listing.'; end if;
  if item_count <> (select count(*) from public.cart_items where user_id = auth.uid()) then
    raise exception 'One or more cart items are no longer available.';
  end if;

  insert into public.orders (
    buyer_id, payment_gateway, total, collection_name, collection_phone, collection_note
  ) values (
    auth.uid(), checkout_gateway, calculated_total, trim(checkout_collection_name), trim(checkout_collection_phone), trim(coalesce(checkout_collection_note, ''))
  ) returning * into created_order;

  insert into public.order_items (order_id, listing_id, seller_id, title_snapshot, unit_price, quantity)
  select created_order.id, listing.id, listing.seller_id, listing.title, listing.price, cart.quantity
  from public.cart_items cart
  join public.listings listing on listing.id = cart.listing_id
  where cart.user_id = auth.uid();

  update public.listings
  set status = 'reserved'
  where id in (select listing_id from public.cart_items where user_id = auth.uid());

  delete from public.cart_items where user_id = auth.uid();
  return created_order;
end;
$$;

create or replace function public.complete_sandbox_payment(target_order_id uuid)
returns public.orders
language plpgsql
security definer
set search_path = public, private
as $$
declare
  current_order public.orders;
begin
  if (select value from private.runtime_settings where key = 'payments_mode') <> 'sandbox' then
    raise insufficient_privilege using message = 'Sandbox payments are disabled.';
  end if;
  select * into current_order from public.orders where id = target_order_id for update;
  if current_order.id is null then raise exception 'Order not found.'; end if;
  if current_order.buyer_id <> auth.uid() then raise insufficient_privilege using message = 'This order does not belong to you.'; end if;
  if current_order.status <> 'pending_payment' then raise exception 'This order is not awaiting payment.'; end if;

  update public.orders
  set status = 'paid', payment_reference = 'sandbox-' || replace(gen_random_uuid()::text, '-', '')
  where id = target_order_id
  returning * into current_order;
  return current_order;
end;
$$;

create or replace function public.advance_order_status(target_order_id uuid, next_status public.order_status)
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
    if next_status = 'cancelled' then
      update public.listings set status = 'available'
      where id in (select listing_id from public.order_items where order_id = target_order_id);
    elsif next_status = 'completed' then
      update public.listings set status = 'sold'
      where id in (select listing_id from public.order_items where order_id = target_order_id);
    end if;
    return current_order;
  end if;

  raise insufficient_privilege using message = 'This order transition is not allowed.';
end;
$$;

revoke insert, update on public.orders from authenticated;
revoke insert on public.order_items from authenticated;
revoke all on function public.create_order_from_cart(public.payment_gateway, text, text, text) from public;
revoke all on function public.complete_sandbox_payment(uuid) from public;
grant execute on function public.create_order_from_cart(public.payment_gateway, text, text, text) to authenticated;
grant execute on function public.complete_sandbox_payment(uuid) to authenticated;
