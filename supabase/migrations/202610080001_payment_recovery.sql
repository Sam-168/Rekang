create or replace function public.notify_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = old.status then return new; end if;
  if new.status = 'paid' then
    insert into public.notifications (user_id, type, title, message, href)
    select distinct item.seller_id, 'order'::public.notification_type, 'New paid order', 'Order ' || new.reference || ' is paid and ready to prepare.', '/orders/' || new.id
    from public.order_items item where item.order_id = new.id;
  elsif new.status = 'ready_for_collection' then
    insert into public.notifications (user_id, type, title, message, href)
    values (new.buyer_id, 'order'::public.notification_type, 'Ready for collection', 'Order ' || new.reference || ' is ready to collect.', '/orders/' || new.id);
  elsif new.status = 'completed' then
    insert into public.notifications (user_id, type, title, message, href)
    select distinct item.seller_id, 'order'::public.notification_type, 'Order completed', 'Order ' || new.reference || ' was confirmed as collected.', '/orders/' || new.id
    from public.order_items item where item.order_id = new.id;
  elsif new.status = 'cancelled' then
    insert into public.notifications (user_id, type, title, message, href)
    select distinct item.seller_id, 'order'::public.notification_type, 'Order cancelled', 'Order ' || new.reference || ' was cancelled.', '/orders/' || new.id
    from public.order_items item where item.order_id = new.id;
  end if;
  return new;
end;
$$;

create or replace function public.expire_pending_orders()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare expired_count integer;
begin
  with expired as (
    update public.orders
    set status = 'cancelled'
    where status = 'pending_payment'
      and created_at < now() - interval '30 minutes'
    returning id
  ), released as (
    update public.listings
    set status = 'available'
    where status = 'reserved'
      and id in (
        select item.listing_id
        from public.order_items item
        join expired on expired.id = item.order_id
      )
    returning id
  )
  select count(*) into expired_count from expired;
  return expired_count;
end;
$$;

revoke all on function public.expire_pending_orders() from public;
grant execute on function public.expire_pending_orders() to authenticated;
