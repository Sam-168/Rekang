# Controlled implementation progress

## Batch 1 — Account entry and verification

Implemented on the `develop` branch:

- `/login` — sign in, invalid-credentials state, password visibility and password-recovery entry
- `/signup` — account form, validation and duplicate-account state
- `/signup/role` — student, faculty, vendor and resident role selection
- `/forgot-password` — reset request and email-sent state
- `/reset-password` — new password, mismatch validation and success state
- `/verify` — email verification, resend feedback, verified state and vendor-review variant

The pages use shared auth layout, field, notice and progress components. `src/lib/auth.ts` is a temporary asynchronous adapter for local UI development. Replace its methods with Supabase Auth calls when the Supabase project is configured; page components should not need to change.

Successful authentication now hands off to the implemented `/home` marketplace route.

## Batch 2 — Marketplace, listings and cart

Implemented on the `develop` branch:

- `/home` — searchable marketplace feed, category switching, loading and no-results states
- `/filters` — category, price and campus filters with validation
- `/listings/:listingId` — listing imagery, facts, seller summary, add-to-cart and buy-now actions
- `/listings/new` — listing creation with image, field and price validation
- `/listings/:listingId/edit` — prefilled listing editor and update success state
- `/cart` — empty state, cart lines, quantity limits, removal and running totals

`src/lib/listings.ts` is the temporary listing query/write adapter. `MarketplaceProvider` holds filters and cart state while Supabase is unavailable. Supabase queries and persisted cart storage can replace these boundaries without changing the screen components.

The generated product photography sheet in `src/assets/product-photography.png` supplies realistic development imagery. Production listing records will use Supabase Storage URLs instead.

Routes for checkout, community, account, and seller profiles currently show explicit handoff placeholders instead of redirecting into an unrelated flow.

## Local test scenarios

- Use an email containing `invalid` or password `wrongpass` to see the login error.
- Use an email containing `existing` to see the duplicate-account error.
- Choose Local vendor to see manual-review verification.
- The verification screen includes a temporary “Preview verified state” control for UI review. Remove or replace it when live verification is connected.

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

`src/lib/orders.ts` is a temporary in-memory service for orders and reviews. Supabase will replace this service after the screens are complete. Payment actions are simulations and never contact PayFast or SnapScan.

The Account navigation item currently opens order history. A fuller personal-account hub can be added after the required screens are complete.

## Remaining batches

1. Reporting and admin moderation, then Supabase migrations, storage/RLS policies and complete integration testing.

Batch 3 verification covers seven desktop and mobile routes plus cart-to-checkout payment, confirmation-to-order navigation, buyer/seller history switching, seller tabs, and eligible review submission.

## Batch 4 — Community bulletin and notifications

Implemented on the `develop` branch:

- `/community` — campus bulletin feed with Events, Announcements and Study groups filters
- `/community/:postId` — bulletin details, event time/location and verified author details
- `/community/new` — category-aware post form, preview/edit step and publishing flow
- `/notifications` — order, review, community and account updates with unread state and mark-all action

`src/lib/community.ts` is the temporary in-memory bulletin adapter. `CommunityProvider` owns local notification read state until Supabase Realtime and persisted notifications are connected.

Batch 4 verification covers desktop and 390 × 844 rendering, category filters, feed-to-detail navigation, draft retention through preview, post publishing, unread notification state and horizontal overflow.
