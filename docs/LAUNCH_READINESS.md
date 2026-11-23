# ChanakyaOS Launch Readiness

Status of the production-readiness audit, known gaps, and what the owner must decide or provide before launch.

## 1. What was done

| Area | Change |
| :--- | :--- |
| Build health | `.npmrc` with `legacy-peer-deps`, lint at 0 errors, `typecheck` and `test` scripts, package renamed to `chanakyaos` |
| API security | Shared guards in `src/lib/api-guard.ts`: auth (user or guest), per-caller rate limit, JSON size cap and zod validation, PDF upload checks (5MB, type, `%PDF` magic bytes). Generic 500s, no `error.message` leaks |
| Prompt safety | Chat route rejects client-supplied `system` roles, caps messages and context length |
| Redirects | `safeRedirectPath` on login, signup and `/auth/callback` (open redirect fix) |
| Config | `src/config/env.ts` lazy zod validation, `.env.example`, `.env*` ignored |
| Headers | nosniff, X-Frame-Options, Referrer-Policy, Permissions-Policy, HSTS, minimal CSP in `next.config.ts` |
| Database | Migration `00009_security_hardening.sql` (plan self-upgrade block, WITH CHECK clauses, delete policies, `handle_new_user` trigger, contact message limits), `00010_public_portfolio.sql` (`username`, `is_public`, `get_public_portfolio` function; **owner must apply it**) |
| Tests | Vitest, 43 tests for rate limiter, redirect guard, env, API guard, PDF upload, utils, sitemap and robots |
| CI | `.github/workflows/ci.yml`: Node 22, `npm ci`, lint, typecheck, test, build with dummy env |
| Error handling | `error.tsx`, `global-error.tsx`, `not-found.tsx`, dashboard `loading.tsx` |
| SEO | `metadataBase`, title template, OpenGraph and Twitter metadata, `robots.ts`, `sitemap.ts`, metadata for blog, careers and contact |
| Accessibility | Labels and `autocomplete` on login, signup, onboarding and profile fields; `role="alert"` on errors; `role="dialog"`, `aria-modal`, Escape to close and labelled close buttons on the guest, settings, edit profile and task modals; decorative SVGs hidden from screen readers |

## 2. Decisions and secrets needed from the owner

1. **Production secrets** (set in Vercel, never commit): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GROQ_API_KEY`, optional `GEMINI_API_KEY`.
2. **`NEXT_PUBLIC_SITE_URL`**: the final domain. Without it sitemap, robots and OpenGraph use `http://localhost:3000`.
3. **Rate limiting backend**: the limiter is in memory per serverless instance. Choose whether to adopt Upstash Redis (`@upstash/ratelimit`, same call shape) before paid traffic. Needs an Upstash account and two env vars.
4. **Apply migration `00010_public_portfolio.sql`** in Supabase. Portfolios are opt-in: users set a username and turn on `is_public` (default private) on the Profile page.
5. **Resume PDF rendering**: decide whether to keep the third party LaTeX service (see gaps).
6. **Email enumeration vs duplicate-signup UX**: `/api/auth/check-user` tells callers whether an email exists. Keep it (better UX, rate limited) or remove it and rely on Supabase's own signup response.
7. **OpenGraph image**: `/logo.png` is used as a placeholder. Provide a 1200x630 image for better link previews.
8. **Legal review** of the Privacy and Terms pages before collecting real user data.
9. **Custom SMTP** for Supabase auth emails (the default Supabase mailer is heavily rate limited and not meant for production).

## 3. Known gaps (not fixed, with reasons)

| Gap | Detail | Suggested fix |
| :--- | :--- | :--- |
| ~~Public portfolio broken~~ (fixed) | Public sharing now uses `/portfolio/<username>`, exempt from the proxy auth redirect only for a single valid username segment. Data comes from the `get_public_portfolio` SECURITY DEFINER function (migration 00010), which returns an allow-list of fields and never email or ids | Apply migration 00010 |
| No script CSP | The CSP only sets `frame-ancestors`, `base-uri`, `object-src`, `form-action`. A strict `script-src` needs per-request nonces | Add nonce handling in `src/proxy.ts`, test with BlockNote and framer-motion |
| Per-instance rate limiter | Counters reset on cold start and are not shared across instances | Upstash Redis |
| Resume LaTeX privacy | `resume/page.tsx` sends resume LaTeX to `latexonline.cc` via a GET URL. The third party sees the resume and URLs can be logged | Self-hosted or server-side LaTeX compile, or client-side PDF generation |
| Contact form abuse | Anonymous inserts go straight to Supabase with no captcha or server rate limit. Migration 00009 adds length limits only | Route through an API handler with rate limit plus Turnstile or hCaptcha |
| Email enumeration | See decision 6 | See decision 6 |
| Lock-pathway dev bypass | `lock-pathway` keeps an auth bypass when `NODE_ENV=development`. Not active in production builds, but do not run `next dev` on a public host | Remove once local testing no longer needs it |
| Guest cookie | `guest_mode` is client-settable by design. It only unlocks stateless AI under strict per-IP limits | Optionally sign the cookie server-side |
| `generate-pathway` location | Route lives under `src/app/(dashboard)/api/ai/`. Works, but is unconventional | Move to `src/app/api/ai/` and update callers in a dedicated change |
| Lint warnings | About 140 warnings remain (`no-explicit-any`, React compiler rules downgraded to warn) | Fix gradually, then restore the rules to error |
| Dependency audit | `npm audit` reports advisories in transitive packages | Review before launch, avoid `--force` |

### Review follow-ups (second pass)

Fixed:
- Chat history cap: the route now trims to the last 30 messages instead of returning 400, and the assistant page sends only recent messages, clips each to 12,000 characters, and shows specific messages for 401 and 429.
- Signup trigger: `handle_new_user` skips null emails and catches insert errors with a warning, so it cannot abort `auth.users` creation. A profile row missing after a swallowed conflict is the accepted trade-off.

Not fixed, with reasons:
- Existing live trigger: cannot be checked from the repo. Before applying 00009, run `select tgname from pg_trigger where tgrelid = 'auth.users'::regclass and not tgisinternal;` and `select prosrc from pg_proc where proname = 'handle_new_user';` on the live project. If custom logic exists, merge it into the migration first. A note is in the migration header.
- Guest limits keyed by IP and held in instance memory: guest mode must stay stateless and open per the PRD. Before launch, replace `src/lib/rate-limit.ts` with Upstash or add a daily cap, and set Groq spend alerts.
- Shared "unknown" IP bucket: Vercel always sets `x-forwarded-for`, so the fallback is only hit in local development or behind an unsupported proxy. If you move off Vercel, confirm the platform sets the header.
- 401 handling in the client: a shared fetch wrapper touches about a dozen call sites on unrelated pages, which is outside this hardening scope. Page navigation is already redirected to login by `src/proxy.ts`; only in-page API calls after expiry show generic errors. Chat now reports expiry explicitly. Track the wrapper as a follow-up.
- HSTS preload and CSP: preload is only effective after submitting the domain to the preload list, which is a manual owner decision. Remove `preload` from `next.config.ts` if you do not want that commitment. A nonce-based script CSP needs testing against Next.js inline scripts and BlockNote, so it is deferred.

## 4. PRD coverage (section 3 pages, section 4 features)

Implemented routes: landing, about, pricing, blog (waitlist stub), careers (stub), contact, privacy, terms, login, signup, onboarding, dashboard, diagnosis, pathways, skills-gap, resume, linkedin, assistant, lms, trends, profile, portfolio.

| PRD item | Status |
| :--- | :--- |
| 2 How It Works page | Missing as a separate page. Covered partly by the landing scroll animation |
| 5 Features Overview page | Missing as a separate page |
| 7 Testimonials / Success Stories | Missing. Needs real user stories, do not fabricate |
| 8 Contact: FAQ, live chat, social links | Form exists. FAQ, live chat and social links not verified |
| 15 Selected Pathway Tracker | Delivered through `pathways` and `lms` |
| 22 Saved Pathways and Comparison | No dedicated comparison route found |
| 23 Certifications Tracker | No dedicated route found |
| 24 Profile and Settings: notification preferences, subscription management | Profile and a settings modal exist. Billing and notification preferences absent (no payment provider) |
| 25, 26 Community Hub, Mentorship | Marked Future in the PRD. Not built |
| F8 Portfolio and Project Builder | Public sharing implemented, requires migration 00010 |
| Pricing tiers (PRD section 9) | Pricing page is a "stealth mode" placeholder. No payment integration. `users.plan` is now protected from client edits, so a payment webhook using the service role is the only safe way to change it |

## 5. Deployment checklist

### Supabase
1. Create the project and note the URL, anon key and service role key.
2. Run migrations in order: `00001_initial_schema`, `00002_add_persistence_columns`, `00003_add_persistence_fields`, `00004_lms_and_gamification`, `00005_add_lms_workspace`, `00006_harden_pathways_unique`, `00007_add_contact_messages`, `00008_add_resume_schema_column`, `00009_security_hardening`. Never edit applied migrations, add new ones.
3. Auth, URL configuration: set Site URL to the production domain. Add redirect URLs `https://<domain>/auth/callback` and `http://localhost:3000/auth/callback`. Add preview URLs only if needed.
4. Auth, Providers: enable Email and Google. Add the Supabase callback URL (`https://<project>.supabase.co/auth/v1/callback`) to the Google OAuth client.
5. Auth, SMTP: configure a custom SMTP sender. Decide on email confirmation (the signup flow expects it).
6. Confirm RLS is enabled on every table (the Table Editor shows a warning if not).

### Vercel
1. Import the repo. Framework preset is Next.js. The `.npmrc` handles the peer dependency conflict.
2. Environment variables (Production and Preview): the keys in section 2. `SUPABASE_SERVICE_ROLE_KEY` and AI keys must not use the `NEXT_PUBLIC_` prefix.
3. Set `NEXT_PUBLIC_SITE_URL` to the production domain and attach the domain.
4. Region: pick the one nearest the Supabase region to lower latency.
5. Function duration: AI routes can run long. Check the plan's max duration (Hobby is short) and set `maxDuration` per route if needed.
6. Smoke test after deploy: signup, login, Google login, guest mode, onboarding with a PDF, pathway generation, chat, resume, contact form, `/robots.txt`, `/sitemap.xml`, a 404 page.

### AI provider limits
- **Groq**: the free tier has per-minute request and token limits per model and a daily cap. The app limits users to 10-30 requests per minute and guests to 3-8 per IP, which can still exceed a free quota across many users. Check the current limits on the Groq console and move to a paid tier before launch. Groq 429s currently surface as a generic 500.
- **Gemini**: `GEMINI_API_KEY` is declared but not used by current code paths. Check quotas on Google AI Studio if you enable it.
- Set provider-side spend or usage alerts and rotate keys if they leak.

## 6. Performance findings

| Finding | Detail | Recommendation |
| :--- | :--- | :--- |
| Hero frames are huge | `public/landing_page_images` holds 240 PNG frames at about 3.4MB each (803MB total, all committed to git). The hero canvas lazy loads in batches, but each frame is still several MB and the repo and deploy are heavy | Convert to WebP or AVIF at a canvas-appropriate resolution (typically 90 percent or more smaller), or use a single MP4/WebM. Use Git LFS or a CDN if frames stay. **Partly done:** the hero now serves WebP copies (`public/landing_page_images/webp`, 17MB total vs 803MB of PNG). The original PNGs are kept in place and used as a per-frame fallback. To regenerate, run `npm run optimize:hero`. The owner may later delete the PNGs (git history stays large unless rewritten) or move to a single video or a CDN |
| `next/image` | Marketing and auth pages use plain `<img>` for logos (`logo.png` is 192KB, `logo-single.png` is about 1MB and is also the favicon). The hero uses `<canvas>`, so `next/image` does not apply there | Switch logos to `next/image` and shrink `logo-single.png` |
| Heavy client libs | `lms/page.tsx` already loads BlockNote and task views with `next/dynamic`. `trends/page.tsx` imports `recharts` statically | Wrap the chart section in `next/dynamic` (`ssr: false`) in a follow-up |
| Fonts | `globals.css` imports fonts through CSS `@import` from Fontshare and Google, which blocks rendering | Move to `next/font` or self-host |
