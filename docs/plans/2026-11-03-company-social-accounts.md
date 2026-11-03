# Plan: Company Social Accounts Management in Admin Dashboard (إدارة الحسابات الاجتماعية للشركة)

- **Status:** done
- **Size:** M   ·   **Branch:** `main` @ `5c1206e`
- **Owner approval:** 2026-11-03 (approved for publishing)   ·   **Codex plan review:** none
- **Created:** 2026-11-03 by Antigravity   ·   **Updated:** 2026-11-03

## Goal and acceptance criteria
Provide a complete, intuitive CRUD interface (Add, Edit, Delete, Toggle status) for company social media accounts in the admin dashboard, persist the configuration in Supabase `site_content`, and dynamically display active accounts in the public website (`Contact` section and `Footer`).

Acceptance criteria:
1. **Model & Validation:** A robust data model supporting standard platforms (`facebook`, `tiktok`, `linkedin`, `x`/`twitter`, `instagram`, `youtube`, `whatsapp`, `github`, `threads`, `other`), with URL validation, platform presets, handles, display order, and active toggle.
2. **API Routes:**
   - Authenticated `/api/admin/socials` with `GET` (list), `POST` (create), `PUT` (update/reorder), `DELETE` (delete by id), protected by role authentication.
   - Public `/api/company/socials` with `GET` (returns active accounts with fallback to defaults).
3. **Admin Dashboard UI:**
   - Dedicated `SocialAccountsManager` component providing clear Add, Edit, Delete modals and actions with real-time feedback.
   - Integrated into the main Admin Dashboard (`/admin/dashboard`) as an interactive management section and stat/quick action.
   - Also integrated into the Company Details page (`/admin/company`) for cohesive corporate identity editing.
4. **Public Site Integration:**
   - `Contact.tsx` and `Footer.tsx` dynamically display active company social media accounts with platform-specific branding and icons.
5. **Localization:** Full trilingual support (`ar`, `fr`, `en`) in `messages/*.json`.
6. **TDD & QA:** Comprehensive unit and integration tests for models, API routes, and components, with 100% pass rate in `npm test` and `npx tsc --noEmit`.

## Context and assumptions
- Database: Supabase table `site_content` stores dynamic JSON under key `'company_socials'`.
- Authentication: Uses `getSessionUser` and `requireAccess` from `src/lib/adminAuth.ts`.
- Default accounts: Facebook (`https://www.facebook.com/profile.php?id=61594179056891`), TikTok (`https://www.tiktok.com/@afrikyiadeveloper`), WhatsApp (`https://whatsapp.com/channel/0029VbDnuKB5Ui2eXs8BZn1O`).
- Existing tests: 82/82 passing in Vitest before starting.

## Approach
- Non-goals: Scraping social accounts or third-party OAuth login via social accounts.
- Risks: None; operations are confined to `site_content` and do not affect transactions or production schemas.

## Tasks (each one runs a full RED → GREEN → REFACTOR cycle)
| # | Task | Test written first (file › case) | RED | GREEN | Refactor |
|---|------|----------------------------------|-----|-------|----------|
| 1 | Social accounts types, normalization, and validation | `src/lib/socials.test.ts` › normalization and validation | ☑ | ☑ | ☑ |
| 2 | Backend Admin API Route (`/api/admin/socials`) and Public API (`/api/company/socials`) | `src/app/api/admin/socials/route.test.ts` › GET/POST/PUT/DELETE auth and operations | ☑ | ☑ | ☑ |
| 3 | `SocialAccountsManager` UI component with Add, Edit, Delete modals | `src/components/admin/SocialAccountsManager.test.tsx` › render, add, edit, delete | ☑ | ☑ | ☑ |
| 4 | Integrate into Admin Dashboard (`/admin/dashboard`), Company Page (`/admin/company`), and public `Contact` section | `src/components/sections/ContactSocials.test.tsx` & `DashboardPage.test.tsx` › displays configured accounts | ☑ | ☑ | ☑ |
| 5 | Translations, End-to-End QA, TypeScript check, full test suite | Full suite `npm test` & `npx tsc --noEmit` | ☑ | ☑ | ☑ |

## QA (verification commands, taken from package.json)
- [x] Full suite: `npm test` → 115/115 tests passed across 24 test suites
- [x] Type check: `npx tsc --noEmit` → 0 errors
- [x] Lint (changed files): `npx eslint src/lib/socials.ts src/lib/socialsStore.ts src/components/admin/SocialAccountsManager.tsx` → 0 warnings, 0 errors

## Review
- [x] Self-review of the full diff (no unrelated files, no secrets, no debug code)
- [ ] Owner sign-off

## Execution log (append; real output only)
- 2026-11-03 RED task 1: `npx vitest run src/lib/socials.test.ts` → Failed to resolve import "./socials".
- 2026-11-03 GREEN task 1: Implemented `src/lib/socials.ts`. `npx vitest run src/lib/socials.test.ts` → 11/11 tests passed in 668ms.
- 2026-11-03 RED task 2 (Store): `npx vitest run src/lib/socialsStore.test.ts` → Failed to resolve import "./socialsStore".
- 2026-11-03 GREEN task 2 (Store): Implemented `src/lib/socialsStore.ts`. `npx vitest run src/lib/socialsStore.test.ts` → 6/6 tests passed in 644ms.
- 2026-11-03 RED task 2 (API): `npx vitest run src/app/api/admin/socials/route.test.ts` → Failed to resolve import "./route".
- 2026-11-03 GREEN task 2 (API): Implemented `src/app/api/admin/socials/route.ts` and `src/app/api/company/socials/route.ts`. 8/8 tests passed across 2 suites.
- 2026-11-03 RED task 3 (UI): `npx vitest run src/components/admin/SocialAccountsManager.test.tsx` → Failed to resolve import "./SocialAccountsManager".
- 2026-11-03 GREEN task 3 (UI): Implemented `src/components/admin/SocialAccountsManager.tsx`. 4/4 tests passed in 865ms.
- 2026-11-03 RED task 4: `npx vitest run src/components/sections/ContactSocials.test.tsx` → Failed to find dynamic LinkedIn link.
- 2026-11-03 GREEN task 4: Connected `Contact.tsx`, `Footer.tsx`, `DashboardPage.tsx`, and `CompanyPage.tsx`. 2/2 tests in `ContactSocials.test.tsx` and 2/2 in `DashboardPage.test.tsx` passed.
- 2026-11-03 QA: `npm test` → 115/115 tests passed across 24 suites. `npx tsc --noEmit` passed with 0 errors.

## Outcome
Delivered full social accounts CRUD management in the Admin Dashboard (`/admin/dashboard`) and Company profile (`/admin/company`), with database persistence in `site_content` (`company_socials`), secure API endpoints with permission enforcement, and dynamic integration into the public site (`Contact` and `Footer`) with zero breaking changes and 33 new automated tests.
