# Controlled implementation progress

## Batch 1 — Account entry and verification

Implemented on the `develop` branch:

- `/login` — sign in, invalid-credentials state, password visibility and password-recovery entry
- `/signup` — account form, validation and duplicate-account state
- `/signup/role` — student, faculty, vendor and resident role selection
- `/forgot-password` — reset request and email-sent state
- `/reset-password` — new password, mismatch validation and success state
- `/verify` — email verification, resend feedback, verified state and vendor-review variant

The pages use shared auth layout, field, notice and progress components. The original local authentication adapter was replaced by Supabase Auth in Batch 6.

Successful authentication now hands off to the implemented `/home` marketplace route.

## Batch 2 — Marketplace, listings and cart

Implemented on the `develop` branch:

- `/home` — searchable marketplace feed, category switching, loading and no-results states
- `/filters` — category, price and campus filters with validation
- `/listings/:listingId` — listing imagery, facts, seller summary, add-to-cart and buy-now actions
- `/listings/new` — listing creation with image, field and price validation
- `/listings/:listingId/edit` — prefilled listing editor and update success state
- `/cart` — empty state, cart lines, quantity limits, removal and running totals

`src/lib/listings.ts` and `MarketplaceProvider` were connected to Supabase in Batch 7. Listing queries, seller profiles, product images and each authenticated user’s cart now persist in the hosted project.

The generated product photography sheet in `src/assets/product-photography.png` remains as fallback imagery for local order demos. Live listing records use public Supabase Storage URLs.

Routes for checkout, community, account, and seller profiles currently show explicit handoff placeholders instead of redirecting into an unrelated flow.

## Local test scenarios

- Use an email containing `invalid` or password `wrongpass` to see the login error.
- Use an email containing `existing` to see the duplicate-account error.
- Choose Local vendor to see manual-review verification.
- Account verification now follows Supabase confirmation links and the database-backed profile status.

## Verification completed

- TypeScript production build
- ESLint
- Desktop render at 1280 × 900 for all six routes
- Mobile render at 390 × 844 for all six routes
- Browser flow checks for invalid login, vendor signup/verification and password mismatch
- Horizontal-overflow checks at desktop and mobile sizes

Batch 2 additionally verifies desktop and 390 × 844 rendering for all six marketplace routes, search results, price filtering, detail-to-cart navigation, quantity totals, listing creation, and listing editing.

## Batch 3 — Checkout, orders, seller profiles and reviews

Implemented on the `develop` branch:

- `/checkout` — collection details, PayFast/SnapScan test selection, sandbox warning, processing and failure feedback
- `/orders/:orderId/confirmation` — successful test-payment confirmation and next actions
- `/orders` — buyer and seller order-history views with status badges
- `/orders/:orderId` — item, collection, payment and review-eligibility details
- `/sellers/:sellerId` — verified seller profile, listings and reviews tabs
- `/orders/:orderId/review` — rating, review validation, eligibility guard and submission confirmation

`src/lib/orders.ts` was connected to Supabase in Batch 8. Payment actions remain clearly labelled sandbox transactions and never contact PayFast or SnapScan.

The Account navigation item currently opens order history. A fuller personal-account hub can be added after the required screens are complete.

Batch 3 verification covers seven desktop and mobile routes plus cart-to-checkout payment, confirmation-to-order navigation, buyer/seller history switching, seller tabs, and eligible review submission.

## Batch 4 — Community bulletin and notifications

Implemented on the `develop` branch:

- `/community` — campus bulletin feed with Events, Announcements and Study groups filters
- `/community/:postId` — bulletin details, event time/location and verified author details
- `/community/new` — category-aware post form, preview/edit step and publishing flow
- `/notifications` — order, review, community and account updates with unread state and mark-all action

`src/lib/community.ts` is the temporary in-memory bulletin adapter. `CommunityProvider` owns local notification read state until Supabase Realtime and persisted notifications are connected.

Batch 4 verification covers desktop and 390 × 844 rendering, category filters, feed-to-detail navigation, draft retention through preview, post publishing, unread notification state and horizontal overflow.

## Batch 5 — Reporting, moderation and Supabase foundation

Implemented on the `develop` branch:

- Report dialog on listing and seller-profile screens with reason selection, optional detail, confirmation and duplicate-open-report protection
- `/admin/moderation` — restricted-access state, status filters, report inspection, internal notes and resolve/dismiss decisions
- `supabase/migrations/202610040001_initial_schema.sql` — auth-linked profiles, listings/images, cart, orders/items, reviews, bulletin posts, notifications, reports, constraints, indexes, triggers, Realtime configuration and RLS policies
- `supabase/migrations/202610040002_storage_policies.sql` — listing-image and avatar buckets with MIME, size and owner-folder policies
- `src/lib/supabase.ts` — browser client enabled locally by the ignored `.env` project URL and public publishable key
- `docs/supabase-setup.md` — linking, migration, Auth, storage, security and local verification instructions

Final verification covers all 24 application routes at 1280 × 900 and 390 × 844, report submission and duplicate prevention, non-admin route denial, moderation filters and decisions, TypeScript production compilation, ESLint and whitespace checks. No route errors or horizontal overflow were found.

The hosted Supabase project is configured and the schema and storage migrations are applied. Remote verification found 10 application tables with RLS, 27 public-table policies, 4 storage policies, 2 storage buckets and 2 Realtime tables. Email/password sign-in, email confirmation, and local Vite redirect URLs are configured; the ignored local `.env` contains the project URL and public browser key.

## Batch 6 — Supabase authentication integration

Implemented on the `develop` branch:

- Real Supabase email/password sign-up, sign-in, sign-out, confirmation resend, password-reset request and password update
- In-memory sign-up handoff so passwords are never written to browser storage while the user chooses a role
- Persistent session provider, authenticated route guards, return-to-requested-page behavior and live profile loading
- Verified-profile and admin-role checks backed by the Supabase `profiles` table
- Database-enforced `.ac.za` addresses for student/faculty roles and automatic non-vendor verification after email confirmation
- Vendor accounts remain pending for manual review after their email is confirmed
- Removed the local verification and administrator preview shortcuts

`supabase/migrations/202610050001_auth_profile_verification.sql` is applied to the hosted project. Remote verification confirmed both authentication functions and both `auth.users` triggers.

## Batch 7 — Supabase marketplace integration

Implemented on the `develop` branch:

- Live listing feed queries with campus, category, price and text filtering
- Database-backed listing details, creation, ownership-checked editing and seller profiles
- Up to five listing images stored under owner/listing paths in the public `listing-images` bucket
- Public Storage URLs with the original product sheet retained as fallback imagery for local order demos
- Persistent per-user carts with add, remove, quantity, clear, loading, retry and optimistic feedback states
- Cart and checkout summaries now resolve the same live listing records
- Unverified profiles receive a verification-required state before the listing editor
- Seller ratings, review counts and active-listing totals are loaded from database records

End-to-end hosted verification used a disposable confirmed account to create a listing, upload an image, query the feed, persist and update a cart row, and then remove the listing, object and account. Production compilation, ESLint and whitespace checks also pass. Community/notifications and report moderation remain on local adapters.

## Batch 8 — Supabase orders and sandbox payments

Implemented on the `develop` branch:

- Atomic server-priced checkout from the authenticated cart, with listing row locks and one-seller orders
- Buyer collection details, order confirmation, purchase history and live order details
- Seller sales history and seller-only “ready for collection” transition
- Buyer-only collection confirmation, cancellation of pending orders and verified-purchase reviews
- Listing lifecycle updates from available to reserved to sold, with cancellation releasing inventory
- Private `payments_mode` setting and a sandbox payment function that cannot run after production mode is enabled
- Removed direct browser inserts and updates for orders and order items; clients use audited database functions

`supabase/migrations/202610050002_orders_payments.sql` is applied to the hosted project. A rollback-only hosted test passed checkout total calculation, cart clearing, inventory reservation, sandbox payment, seller and buyer transitions, final sold state, and review creation without retaining test data. Production compilation, ESLint and whitespace checks pass.
