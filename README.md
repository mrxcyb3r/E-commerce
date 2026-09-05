# E-Commerce App — White-Label Commerce Platform

A production-ready, fully white-label e-commerce platform: React 19 + TypeScript + Vite + Supabase.
Every store is configured through the **database + env** (no code changes per client), so a new shop
can be onboarded live in ~15–30 minutes — see **[`ONBOARDING.md`](./ONBOARDING.md)**.

## ✨ Features

### 🛍️ Customer Storefront
* Product catalog with search, sort, filters (category / size / color / max price / in-stock)
* Product detail pages with gallery, sizes/colors, stock status, SEO meta + JSON-LD
* Favorites list with a "show in store / send via Telegram" workflow
* Short-form video feed (reels) with product cards
* Homepage, About, Store Location (Google/Yandex maps), Contact (form + Telegram), FAQ, newsletter
* **Tri-lingual UI** (Uzbek / Russian / English) — retailer switch via `src/i18n` locales
* Light/dark mode, fully responsive, PWA + offline pages
* Anonymous engagement: favorites, feed saves, comments, likes — zero sign-up friction

### 🎥 Product Feed
A reels-style video feed to discover products through engaging content. Likes, saves, and comments
are stored per visitor (admin-authenticated comments are flagged `is_admin`).

### 🧠 Prompt Library
Goes offline-first (optional). Prompts are organized into categories and managed through the admin
dashboard. **AI generation itself is intentionally deferred** ("no ai yet").

### 🔐 Admin Dashboard (`/admin`)
Everything customer-facing is manageable here — no hardcoded content:
* **Products** — create/edit, bulk create, bulk duplicate, **CSV/JSON import & CSV export**
* **Categories**, **Feed** (videos/likes/comments analytics), **Testimonials**, **Prompts**
* **Store settings** — branding (name, logo, colors, hero, about/mission/vision, SEO, contact,
  working hours, maps) — drives the entire storefront via `store_settings`
* **Analytics** — events, feed/product performance, storage & health

### 🌍 White-Label Branding
Store identity (name, address, phone, Telegram, colors, hero copy, SEO defaults, admin credentials)
comes from `store_settings` in the database with sensible fallbacks in
`src/config/business.ts`. Navbar, footer, pages, and SEO all read from the same source.

---

## 🏗️ Tech Stack

React 19 | TypeScript | Vite | Tailwind CSS | Supabase (Postgres, Auth, Storage) | motion | lucide-react

> No new runtime dependencies are added for features; the platform is intentionally dependency-light.

---

## 🚀 Local Development

```bash
npx pnpm install   # or npm install
cp .env.example .env   # fill in VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY
npm run dev
```

### Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npx tsc --noEmit` | Type check (`npm run lint`) |
| `npm run build` | Generate icons + SEO files, then production build |
| `npm run preview` | Preview the production build |

### Environment variables (see `.env.example`)
* `VITE_SUPABASE_URL` — Supabase project URL (client-safe)
* `VITE_SUPABASE_PUBLISHABLE_KEY` — publishable key (client-safe)
* `SITE_URL` / `VITE_SITE_URL` / `URL` — used by `scripts/generate-seo.mjs`
  (sitemap.xml / robots.txt); falls back to `https://example.com` and warns.
* Server-only keys (migrations / edge functions) must **not** be prefixed `VITE_`.

---

## 🗄️ Database

Supabase provides the backend. Apply migrations in order — each new shop needs **every** file in
[`supabase/migrations/`](./supabase/migrations/), especially:

* `20260905140000_feed_comments_upgrade.sql` — feed comments + likes upgrade
* `20260905150000_store_branding_expansion.sql` — white-label `store_settings` columns
  (short_name, colors, hero, about, mission/vision, SEO, admin email, copyright/footer)

Row Level Security (RLS) protects admin data; storefront reads are public/anon.

### Onboarding a new shop (15–30 min)
> Full step-by-step guide: **[`ONBOARDING.md`](./ONBOARDING.md)**

1. Create a fresh Supabase project.
2. Apply all migrations in `supabase/migrations/`.
3. Import the client's product catalog via **Admin → Products → Import / Eksport**
   (CSV or JSON, Uzbek/Russian/English headers supported).
4. Configure **Admin → Store settings** (brand, contact, SEO) or seed defaults.
5. Deploy to Netlify with the two `VITE_*` env vars + site URL.
6. Sign in at `/admin` with the admin credentials.

---

## 📱 Support
Works on mobile, tablet, and desktop.

## 📄 License
Private project under active development.