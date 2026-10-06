create or replace function public.create_report(
  target_kind public.report_target_type,
  target_uuid uuid,
  report_reason public.report_reason,
  report_details text default ''
)
returns public.reports
language plpgsql
security definer
set search_path = public
as $$
declare
  created_report public.reports;
begin
  if auth.uid() is null then raise insufficient_privilege using message = 'Sign in before sending a report.'; end if;
  if not public.current_user_is_verified() then raise insufficient_privilege using message = 'Verify your account before sending a report.'; end if;
  if char_length(coalesce(report_details, '')) > 500 then raise exception 'Report details are too long.'; end if;

  insert into public.reports (reporter_id, target_type, target_id, reason, details)
  values (auth.uid(), target_kind, target_uuid, report_reason, trim(coalesce(report_details, '')))
  returning * into created_report;
  return created_report;
exception
  when unique_violation then
    raise exception 'You already have an open report for this item.';
end;
$$;

create or replace function public.resolve_report(
  target_report_id uuid,
  next_status public.report_status,
  decision_note text
)
returns public.reports
language plpgsql
security definer
set search_path = public
as $$
declare
  changed_report public.reports;
begin
  if not public.current_user_is_admin() then raise insufficient_privilege using message = 'Administrator access is required.'; end if;
  if next_status not in ('resolved', 'dismissed') then raise exception 'Choose resolved or dismissed.'; end if;
  if char_length(trim(coalesce(decision_note, ''))) < 3 then raise exception 'Add a short moderation note.'; end if;
  if char_length(decision_note) > 1000 then raise exception 'The moderation note is too long.'; end if;

  update public.reports
  set status = next_status, resolution_note = trim(decision_note)
  where id = target_report_id and status = 'open'
  returning * into changed_report;
  if changed_report.id is null then raise exception 'Open report not found.'; end if;
  return changed_report;
end;
$$;

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
    select distinct item.seller_id, 'order', 'New paid order', 'Order ' || new.reference || ' is paid and ready to prepare.', '/orders/' || new.id
    from public.order_items item where item.order_id = new.id;
  elsif new.status = 'ready_for_collection' then
    insert into public.notifications (user_id, type, title, message, href)
    values (new.buyer_id, 'order', 'Ready for collection', 'Order ' || new.reference || ' is ready to collect.', '/orders/' || new.id);
  elsif new.status = 'completed' then
    insert into public.notifications (user_id, type, title, message, href)
    select distinct item.seller_id, 'order', 'Order completed', 'Order ' || new.reference || ' was confirmed as collected.', '/orders/' || new.id
    from public.order_items item where item.order_id = new.id;
  elsif new.status = 'cancelled' then
    insert into public.notifications (user_id, type, title, message, href)
    select distinct item.seller_id, 'order', 'Order cancelled', 'Order ' || new.reference || ' was cancelled.', '/orders/' || new.id
    from public.order_items item where item.order_id = new.id;
  end if;
  return new;
end;
$$;

create or replace function public.notify_new_review()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare reviewer_name text;
begin
  select full_name into reviewer_name from public.profiles where id = new.reviewer_id;
  insert into public.notifications (user_id, type, title, message, href)
  values (new.seller_id, 'review', 'A new review', coalesce(reviewer_name, 'A buyer') || ' left a verified review.', '/sellers/' || new.seller_id || '?tab=reviews');
  return new;
end;
$$;

create or replace function public.notify_new_bulletin_post()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.notifications (user_id, type, title, message, href)
  select profile.id, 'community', 'New campus post', new.title, '/community/' || new.id
  from public.profiles profile
  where profile.verified and profile.campus = new.campus and profile.id <> new.author_id;
  return new;
end;
$$;

create or replace function public.notify_account_verified()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.verified and not old.verified then
    insert into public.notifications (user_id, type, title, message, href)
    values (new.id, 'account', 'Account verified', 'Your account is verified. You can now use all Rekang features.', '/verify');
  end if;
  return new;
end;
$$;

drop trigger if exists notify_order_status_after_update on public.orders;
create trigger notify_order_status_after_update after update of status on public.orders
for each row execute function public.notify_order_status_change();

drop trigger if exists notify_review_after_insert on public.reviews;
create trigger notify_review_after_insert after insert on public.reviews
for each row execute function public.notify_new_review();

drop trigger if exists notify_bulletin_after_insert on public.bulletin_posts;
create trigger notify_bulletin_after_insert after insert on public.bulletin_posts
for each row execute function public.notify_new_bulletin_post();

drop trigger if exists notify_profile_verified_after_update on public.profiles;
create trigger notify_profile_verified_after_update after update of verified on public.profiles
for each row execute function public.notify_account_verified();

revoke insert, update on public.reports from authenticated;
revoke all on function public.create_report(public.report_target_type, uuid, public.report_reason, text) from public;
revoke all on function public.resolve_report(uuid, public.report_status, text) from public;
revoke all on function public.notify_order_status_change() from public;
revoke all on function public.notify_new_review() from public;
revoke all on function public.notify_new_bulletin_post() from public;
revoke all on function public.notify_account_verified() from public;
grant execute on function public.create_report(public.report_target_type, uuid, public.report_reason, text) to authenticated;
grant execute on function public.resolve_report(uuid, public.report_status, text) to authenticated;
