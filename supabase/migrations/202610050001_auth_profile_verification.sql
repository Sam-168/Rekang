create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role public.user_role;
  should_verify boolean;
begin
  requested_role := case
    when new.raw_user_meta_data ->> 'role' in ('student', 'faculty', 'vendor', 'resident')
      then (new.raw_user_meta_data ->> 'role')::public.user_role
    else 'student'::public.user_role
  end;

  if requested_role in ('student', 'faculty') and coalesce(new.email, '') !~* '@[^@]+\.ac\.za$' then
    raise exception 'Students and faculty must use a South African university email.';
  end if;

  should_verify := new.email_confirmed_at is not null and requested_role <> 'vendor';

  insert into public.profiles (
    id, role, full_name, campus, verified, verification_status
  ) values (
    new.id,
    requested_role,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), split_part(new.email, '@', 1)),
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'campus'), ''), 'Bellville'),
    should_verify,
    case when should_verify then 'verified'::public.verification_status else 'pending'::public.verification_status end
  );
  return new;
end;
$$;

create or replace function public.sync_email_confirmation_to_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email_confirmed_at is not null and old.email_confirmed_at is null then
    update public.profiles
    set verified = true, verification_status = 'verified'
    where id = new.id and role <> 'vendor';
  end if;
  return new;
end;
$$;

drop trigger if exists sync_auth_email_confirmation on auth.users;
create trigger sync_auth_email_confirmation
after update of email_confirmed_at on auth.users
for each row execute function public.sync_email_confirmation_to_profile();

update public.profiles as profile
set verified = true, verification_status = 'verified'
from auth.users as account
where profile.id = account.id
  and account.email_confirmed_at is not null
  and profile.role <> 'vendor';

revoke all on function public.sync_email_confirmation_to_profile() from public;
