# Supabase setup and security model

The project can run without Supabase while the Controlled screens use local adapters. When the shared Supabase project is ready, apply the checked-in migrations rather than creating tables manually in the dashboard.

## Connect the project

1. Install or run the Supabase CLI and sign in.
2. From the repository root, run `supabase link --project-ref <project-ref>`.
3. Review the target project, then run `supabase db push`.
4. Copy `.env.example` to `.env` and add the project URL and public anon key.
5. Generate TypeScript types after each schema change:

   ```bash
   supabase gen types typescript --linked > src/types/database.generated.ts
   ```

Never add the service-role key to a Vite environment variable. Vite exposes `VITE_*` values to the browser.

## Authentication configuration

- Enable email/password authentication and email confirmation.
- Add the deployed site URL and local development redirect URL to Auth URL Configuration.
- Pass `full_name`, `role`, and `campus` as sign-up metadata. The database trigger creates the matching profile and refuses `admin` as a self-selected role.
- Set `verified`, `verification_status`, and admin roles through a trusted admin workflow or SQL run by the service role. Profile updates from the browser cannot change these protected fields.
- Keep vendor verification pending until a moderator approves it. University-domain verification should be performed by trusted server-side logic before setting `verified`.

## Storage paths

Upload listing images as `<user-id>/<listing-id>/<random-file-name>.<ext>` and avatars as `<user-id>/<random-file-name>.<ext>`. Policies require the first folder to match the authenticated user. Buckets accept JPEG, PNG, and WebP files; listing images are limited to 5 MB and avatars to 2 MB.

## Access policy summary

- Only verified accounts can create listings, bulletin posts, reports, or upload images.
- Users manage their own profile, listings, cart, bulletin posts, and storage objects. Protected profile fields cannot be self-promoted.
- Buyers and the relevant sellers can read orders. Only completed-order buyers can submit one review per order.
- Notifications are visible and editable only by their recipient.
- Reports are insert-only for verified users. Only verified admins can read or resolve the moderation queue.
- Notifications and orders are added to Supabase Realtime.

Checkout currently simulates PayFast/SnapScan. A production payment status must be written by a verified webhook Edge Function using the service role; the browser is intentionally unable to mark an order paid.

## Local database verification

Once Docker and the Supabase CLI are available, run:

```bash
supabase start
supabase db reset
supabase db lint
```

The migrations have not been applied to a remote project because no Supabase project credentials are configured in this repository.
