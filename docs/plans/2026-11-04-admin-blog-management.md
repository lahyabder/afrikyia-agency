# Plan: Admin Dashboard Blog Management (إدارة وتعديل ونشر مقالات المدونة في لوحة تحكم الأدمن)

- **Status:** completed
- **Size:** M/L   ·   **Branch:** `main`
- **Owner approval:** Approved
- **Created:** 2026-11-04 by Antigravity   ·   **Updated:** 2026-11-04

## Goal and acceptance criteria
Provide a comprehensive, intuitive CRUD interface (Create, Edit, Delete, Publish/Unpublish toggle) for blog articles in the AFRIKYIA Admin Dashboard, persist articles in Supabase `site_content` under key `'company_blog'`, and sync updates instantly with the public blog pages (`/blog` and `/blog/[slug]`).

Acceptance criteria:
1. **Blog Data Store & Persistence (`src/lib/blogStore.ts`):**
   - Persist articles in Supabase `site_content` under key `'company_blog'`.
   - Automatic fallback to initial `BLOG_POSTS` if database is uninitialized.
   - Functions for loading all articles (admin view with drafts), loading published articles (public view), creating, updating, deleting, and toggling publish status.
2. **Admin API Route (`/api/admin/blog`):**
   - `GET`: Returns all articles (published & drafts) with summary stats (total, published, drafts, categories).
   - `POST`: Creates a new article or imports.
   - `PUT`: Updates an existing article or toggles publication status.
   - `DELETE`: Deletes an article by slug.
   - Secured with `requireAccess(request, 'publishing')`.
3. **Public API & Sync Route (`/api/blog`):**
   - Returns active/published articles with `no-store` headers so dashboard changes reflect immediately.
4. **Admin UI Component (`src/components/admin/BlogManager.tsx`):**
   - Stats cards: Total Articles, Published, Drafts, Categories.
   - Filter by category and publish status (All, Published, Drafts).
   - Search bar by title, tag, or author.
   - Table/Card view with one-click Publish toggle, Edit button, Delete with confirmation, and View Live link.
   - Add/Edit Modal: Multilingual titles, slug generator, category picker (technology, news, studies, discoveries, knowledge), excerpt, content builder, author, tags, and featured/published switches.
5. **Admin Integration:**
   - Dedicated route: `src/app/[locale]/admin/blog/page.tsx`.
   - Sidebar link in `src/components/admin/AdminLayoutClient.tsx` under publishing group.
   - Stat card & Quick link in `src/app/[locale]/admin/dashboard/page.tsx`.
6. **TDD & QA:**
   - 100% test coverage with automated unit tests for store, API, UI, and admin page.
   - 0 TypeScript errors (`npx tsc --noEmit`), full test pass (`npm test` 34/34 suites, 153/153 tests).

## Tasks (each one runs a full RED → GREEN → REFACTOR cycle)
| # | Task | Test written first (file › case) | RED | GREEN | Refactor |
|---|------|----------------------------------|-----|-------|----------|
| 1 | Blog Store with Supabase Persistence & Fallback | `src/lib/blogStore.test.ts` › load, create, update, delete, toggle publish | ☑ | ☑ | ☑ |
| 2 | Authenticated Admin Blog API Route (`/api/admin/blog`) | `src/app/api/admin/blog/route.test.ts` › auth check, GET, POST, PUT, DELETE | ☑ | ☑ | ☑ |
| 3 | BlogManager UI Component (Stats, Search, Filter, Modals) | `src/components/admin/BlogManager.test.tsx` › renders, creates, edits, toggles publish | ☑ | ☑ | ☑ |
| 4 | Admin Dashboard & Sidebar Integration (`/admin/blog`) | `src/app/[locale]/admin/blog/AdminBlogPage.test.tsx` › renders admin blog page | ☑ | ☑ | ☑ |
| 5 | Full QA & Verification (Full test suite, typecheck, build validation) | Full suite `npm test` & `npx tsc --noEmit` | ☑ | ☑ | ☑ |

## Execution log
- 2026-11-04: Plan formulated by Antigravity and saved to `docs/plans/2026-11-04-admin-blog-management.md`.
- 2026-11-04: Built `src/lib/blogStore.ts` and verified with `src/lib/blogStore.test.ts` (6/6 tests passed).
- 2026-11-04: Implemented `/api/admin/blog` and `/api/blog` authenticated routes, verified with `src/app/api/admin/blog/route.test.ts` (6/6 tests passed).
- 2026-11-04: Created `src/components/admin/BlogManager.tsx`, verified with `src/components/admin/BlogManager.test.tsx` (4/4 tests passed).
- 2026-11-04: Built admin page `src/app/[locale]/admin/blog/page.tsx`, verified with `src/app/[locale]/admin/blog/AdminBlogPage.test.tsx` (1/1 test passed).
- 2026-11-04: Integrated sidebar link in `src/components/admin/AdminLayoutClient.tsx` and quick link in `src/app/[locale]/admin/dashboard/page.tsx`.
- 2026-11-04: Executed complete test suite: 34 passed suites, 153 passed unit tests, 0 failures.
- 2026-11-04: Executed `npx tsc --noEmit`: 0 TypeScript compilation errors. All tasks complete via Antigravity.
