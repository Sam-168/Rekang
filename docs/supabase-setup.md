# Supabase setup and security model

The project can run without Supabase while the Controlled screens use local adapters. The hosted `Rekang` project is now provisioned and the checked-in migrations have been applied. Keep using migrations for every schema change so local and hosted environments stay reproducible.

## Current hosted project

- Project reference: `tqiyqcihmgfbemzuabro`
- Project URL: `https://tqiyqcihmgfbemzuabro.supabase.co`
- Region: Central EU (Frankfurt)
- Initial schema applied on: 2026-10-04
- Authentication migration applied on: 2026-10-05
- Orders and payments migration applied on: 2026-10-05
- Verified state: 10 application tables with RLS, browser writes protected by RLS and database functions, 4 storage policies, 2 storage buckets, 2 Realtime tables, and authentication/profile triggers

The migrations were applied through the dashboard SQL editor because the Supabase CLI could not persist its local runtime files on this machine. Before the first future `supabase db push`, link the project and mark the existing migrations as applied:

```bash
supabase link --project-ref tqiyqcihmgfbemzuabro
supabase migration repair --status applied 202610040001
supabase migration repair --status applied 202610040002
supabase migration repair --status applied 202610050001
supabase migration repair --status applied 202610050002
```

## Connect the project

1. Install or run the Supabase CLI and sign in.
2. From the repository root, link project `tqiyqcihmgfbemzuabro`.
3. Repair the migration history once using the commands above.
4. Review future migrations, then run `supabase db push`.
5. Copy `.env.example` to `.env` and add the project URL and public publishable key.
6. Generate TypeScript types after each schema change:

   ```bash
   supabase gen types typescript --linked > src/types/database.generated.ts
   ```

Never add the service-role key to a Vite environment variable. Vite exposes `VITE_*` values to the browser.

## Authentication configuration

- Email/password authentication and email confirmation are enabled.
- The current Site URL is `http://localhost:5173`; redirects allow `http://localhost:5173/**` and `http://127.0.0.1:5173/**`.
- Replace the Site URL and add the production redirect URL before deployment.
- The React client sends `full_name`, `role`, and `campus` as sign-up metadata. The database trigger creates the matching profile and refuses `admin` as a self-selected role.
- Student and faculty accounts must use a `.ac.za` address. After Supabase confirms the email, a database trigger verifies non-vendor profiles automatically.
- Set `verified`, `verification_status`, and admin roles through a trusted admin workflow or SQL run by the service role. Profile updates from the browser cannot change these protected fields.
- Vendor verification remains pending after email confirmation until a moderator approves it.

## Storage paths

Upload listing images as `<user-id>/<listing-id>/<random-file-name>.<ext>` and avatars as `<user-id>/<random-file-name>.<ext>`. Policies require the first folder to match the authenticated user. Buckets accept JPEG, PNG, and WebP files; listing images are limited to 5 MB and avatars to 2 MB.

## Access policy summary

- Only verified accounts can create listings, bulletin posts, reports, or upload images.
- Users manage their own profile, listings, cart, bulletin posts, and storage objects. Protected profile fields cannot be self-promoted.
- Buyers and the relevant sellers can read orders and their reserved/sold listing snapshots. Only completed-order buyers can submit one review per order.
- Notifications are visible and editable only by their recipient.
- Reports are insert-only for verified users. Only verified admins can read or resolve the moderation queue.
- Notifications and orders are added to Supabase Realtime.

Checkout currently uses the explicit `sandbox` value in the private `private.runtime_settings` table. The browser can complete only its own pending order through `complete_sandbox_payment`; direct order writes are revoked. Before accepting real money, deploy a provider-specific Edge Function that verifies PayFast/SnapScan signatures and amounts, writes payment status with the service role, and change `payments_mode` to `live`. The sandbox function then refuses payment completion automatically.

## Local database verification

Once Docker and the Supabase CLI are available, run:

```bash
supabase start
supabase db reset
supabase db lint
```

The hosted migrations were verified in the dashboard. Local Docker verification remains useful before future schema changes are pushed.
