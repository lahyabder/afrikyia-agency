# Plan: AFRIKYIA Blog Platform & Official Navigation Integration (منصة مدونة أفريقيا وإضافتها للقائمة الرسمية)

- **Status:** done
- **Size:** M/L   ·   **Branch:** `main`
- **Owner approval:** Completed   ·   **Codex plan review:** none
- **Created:** 2026-11-04 by Antigravity   ·   **Updated:** 2026-11-04

## Goal and acceptance criteria
Create a world-class, ultra-minimalist institutional Blog section for AFRIKYIA to publish high-value articles, news, studies, discoveries, and knowledge across technology and software domains, and integrate it into the official website navigation (Header & Footer) across all 3 languages (`ar`, `fr`, `en`).

Acceptance criteria:
1. **Official Navigation Integration:**
   - Header (`src/components/layout/Header.tsx`): Add "المدونة" / "Blog" to the desktop and mobile navigation menus.
   - Footer (`src/components/layout/Footer.tsx`): Add "المدونة" / "Blog" to the footer links.
   - Translations in `messages/ar.json`, `messages/en.json`, `messages/fr.json`: key `blog` under `nav` and `home.nav`.
2. **Blog Data Model & Content (`src/data/blog.ts`):**
   - Strongly typed `BlogPost` model with `slug`, `category`, `title`, `excerpt`, `content`, `author`, `publishedAt`, `readTime`, `tags`, `featured`.
   - Core categories requested by user:
     - `technology` (تكنولوجيا)
     - `news` (أخبار)
     - `studies` (دراسات)
     - `discoveries` (اكتشافات)
     - `knowledge` (معارف)
   - Rich, curated initial articles showcasing AFRIKYIA's domain leadership (Cloud Engineering in Africa, Digital Transformation & Port Logistics, FinTech & NexConnect, Enterprise Arabic OCR, Cyber Resilience for Startups).
   - Utility functions: `getAllArticles`, `getArticleBySlug`, `getArticlesByCategory`, `searchArticles`, `getRelatedArticles`.
3. **Blog Hub Page (`/blog`):**
   - Path: `src/app/[locale]/blog/page.tsx`
   - Hero section with search bar and category pills with counts.
   - Featured article showcase card.
   - Responsive grid of article cards (title, excerpt, category badge with distinct color, reading time, publication date, author).
   - Empty state when search or filter returns no match.
4. **Article Detail Page (`/blog/[slug]`):**
   - Path: `src/app/[locale]/blog/[slug]/page.tsx`
   - Dynamic route supporting `generateStaticParams()` for all locales (`ar`, `fr`, `en`) and article slugs.
   - `generateMetadata()` for dynamic SEO, OpenGraph tags, and canonical links.
   - Breadcrumb navigation, publication metadata, structured article content, key takeaways, author bio, and related articles cards.
5. **Design System & UX Compliance:**
   - Adhere strictly to AFRIKYIA's ultra-minimalist design language (pure white backgrounds `#FFFFFF`, gentle `#F8FAFC`, hairline borders `border-slate-200/80`, dark slate headings `text-slate-900`, brand red accents `text-brand-red`, `bg-rose-50`).
   - Seamless RTL/LTR bidirectional support.
6. **TDD & Quality Assurance:**
   - 100% test coverage with automated unit tests:
     - `src/data/blog.test.ts`
     - `src/components/blog/BlogList.test.tsx`
     - `src/app/[locale]/blog/BlogPage.test.tsx`
     - `src/app/[locale]/blog/[slug]/BlogPostPage.test.tsx`
     - `src/components/layout/Header.test.tsx`
   - 0 TypeScript errors (`npx tsc --noEmit`), full test pass (`npm test`).

## Tasks (each one runs a full RED → GREEN → REFACTOR cycle)
| # | Task | Test written first (file › case) | RED | GREEN | Refactor |
|---|------|----------------------------------|-----|-------|----------|
| 1 | Blog Data Model, Categories, and Helper Functions | `src/data/blog.test.ts` › retrieval, filtering, search, related | ☑ | ☑ | ☑ |
| 2 | Navigation & Localization Integration (Header & Footer) | `src/components/layout/Header.test.tsx` › renders blog link in desktop and mobile nav | ☑ | ☑ | ☑ |
| 3 | Blog Hub UI Components (Hero, CategoryFilter, ArticleCard, BlogList) | `src/components/blog/BlogList.test.tsx` › renders articles, filters by category, searches | ☑ | ☑ | ☑ |
| 4 | Blog Hub Route (`/blog`) and Static Params Generation | `src/app/[locale]/blog/BlogPage.test.tsx` › renders blog page with localized content | ☑ | ☑ | ☑ |
| 5 | Single Article Page (`/blog/[slug]`) with SEO & Related Articles | `src/app/[locale]/blog/[slug]/BlogPostPage.test.tsx` › renders article by slug and 404 for unknown | ☑ | ☑ | ☑ |
| 6 | Full QA & Verification (Full test suite, typecheck, build validation) | Full suite `npm test` & `npx tsc --noEmit` | ☑ | ☑ | ☑ |

## Execution log
- 2026-11-04 Task 1 RED: `npx vitest run src/data/blog.test.ts` → Failed to resolve import "./blog" (no file).
- 2026-11-04 Task 1 GREEN: Implemented `src/data/blog.ts` with all 5 client categories and 5 rich articles. 8/8 tests passed in 660ms.
- 2026-11-04 Task 2 RED: `npx vitest run src/components/layout/Header.test.tsx` → Unable to find accessible element with name `/مدونة|المدونة|Blog/i`.
- 2026-11-04 Task 2 GREEN: Added `blog` link to `Header.tsx`, `Footer.tsx`, and updated `messages/{ar,en,fr}.json`. 2/2 tests passed in 874ms.
- 2026-11-04 Task 3 RED: `npx vitest run src/components/blog/BlogList.test.tsx` → Failed to resolve import "./BlogList".
- 2026-11-04 Task 3 GREEN: Implemented `CategoryFilter.tsx`, `ArticleCard.tsx`, `FeaturedArticle.tsx`, and `BlogList.tsx`. 4/4 tests passed in 969ms.
- 2026-11-04 Task 4 RED: `npx vitest run src/app/[locale]/blog/BlogPage.test.tsx` → Failed to resolve import "./page".
- 2026-11-04 Task 4 GREEN: Implemented `src/app/[locale]/blog/page.tsx` with localized hero and blog list. 1/1 test passed in 773ms.
- 2026-11-04 Task 5 RED: `npx vitest run src/app/[locale]/blog/[slug]/BlogPostPage.test.tsx` → Failed to resolve import "./page".
- 2026-11-04 Task 5 GREEN: Implemented `src/app/[locale]/blog/[slug]/page.tsx` with static params generation and metadata. 2/2 tests passed in 985ms.
- 2026-11-04 Task 6 QA: `npm test` → 136/136 tests passed across 30 test suites. `npx tsc --noEmit` → 0 errors. Work completed via Antigravity.
