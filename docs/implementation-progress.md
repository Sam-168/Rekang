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

The `/home` route is an intentional handoff placeholder for the marketplace batch.

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
