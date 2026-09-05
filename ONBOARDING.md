# White-Label Onboarding — Spin Up a New Shop in 15–30 Minutes

This platform is fully white-label: **each client = one Supabase project + one Netlify site**.
No code changes are required between clients — every store identity, product, and setting comes
from the database. This guide is the live-demo runbook.

---

## 1. Create the client's Supabase project (2 min)

1. [Supabase Dashboard](https://supabase.com/dashboard) → New project.
   - Note the **Project URL** and open **Settings → API**.
2. Copy the **publishable key** (`sb_publishable_...`).
   - Migrations must be run with server-side privileges; you can use the SQL Editor in the dashboard
     (it runs as `postgres`) or the Supabase CLI with a secret key. Never ship the secret key in the
     frontend.

## 2. Apply all database migrations (3 min)

Run **every** file in `supabase/migrations/` against the new project, in filename order.
The two most recent matter most for white-label:

| File | Purpose |
| --- | --- |
| `20260905140000_feed_comments_upgrade.sql` | Feed comments/likes upgrade |
| `20260905150000_store_branding_expansion.sql` | Adds `store_settings` white-label columns (short_name, colors, hero, about/mission/vision, SEO keywords, admin email, copyright/footer) |

All other files in the folder (RLS policies, analytics, storage bucket, seed defaults, favorites
feed, etc.) must also be applied — they are additive and safe on a fresh project.

> ⚠️ Do **not** run migrations across clients randomly; every shop gets the full set once.

## 3. Create the admin account (1 min)

Admin login uses **Supabase Auth**:

1. Project → **Authentication → Users → Add user**.
2. Email = the admin email that will be set in Store settings (default fallback: `admin@dokon.uz`).
3. Set the initial password.
4. The admin can change the password later at **Admin → Sozlamalar (Settings)** → "Admin parolini o'zgartirish" (AuthContext `changeCredentials`).

> Login accepts either the full email or the username prefix (the part before `@`).

## 4. Import the client's catalog (5–15 min)

Admin → **Products → Import / Eksport** (`/admin/products/import`):

- Paste or upload **CSV** (comma / semicolon / tab auto-detected, quoted fields supported) or **JSON**.
- Headers are recognized in **Uzbek, Russian, and English** (e.g. `name`/`nomi`/`Название`, ...).
- Supported columns: `name`, `price`, `category`, `sku`, `brand`, `description`, `sizes`, `colors`,
  `tags`, `images` (URLs or comma-separated), `stock`/`in_stock`, `is_published`.
- Prices like `45 000` or `45,000` parse automatically; categories are auto-created.
- Preview shows validation, skipped rows and reasons before you import.
- You can also **export the current catalog as CSV** for backup or transfer.

### JSON example
```json
[
  {
    "name": "Kurtka",
    "price": 450000,
    "category": "Upper Wear",
    "sku": "K-100",
    "sizes": ["S", "M", "L"],
    "colors": ["Qora", "Ko'k"],
    "images": ["https://cdn.example.com/kurtka.jpg"]
  }
]
```

### CSV example
```csv
name,price,category,sku,in_stock
"Futbolka",120000,"T-Shirts","T-200",true
```

## 5. Configure Store settings (5–10 min)

**Admin → Store settings** covers everything customer-facing:

- **Do'kon/Branding**: name, short name, logo, **primary/secondary/accent colors**, phone(s),
  Telegram, address + landmark, working hours, hero title/subtitle, about text, mission, vision.
- **SEO**: default title/description/keywords, social (`twitter_image_url`), copyright/footer text.
- Content lives in dedicated CMS pages (Homepage CMS, About, Testimonials, Feed, Brands) — all
  editable from the admin.

## 6. Deploy to Netlify (3 min)

From the shared repo, create a site and wire it to the client's branch or the monorepo.

1. **Build command:** `npm run build` — **Publish directory:** `dist`
2. **Environment variables** (Site settings → Environment variables — deploy time):
   - `VITE_SUPABASE_URL` = client's Supabase project URL
   - `VITE_SUPABASE_PUBLISHABLE_KEY` = client's publishable key
   - `URL` (or `VITE_SITE_URL` / `SITE_URL`) = the deployed site URL for `sitemap.xml` / `robots.txt`
3. **Do not** add server-only secrets with a `VITE_` prefix (they would be inlined into the bundle).

The same repo deploys every client — only env vars and the database differ.

## 7. Verify the live demo loop (2 min)

1. `/` — branded homepage with client colors, hero, about, location, products.
2. `/products` — catalog search/filter; open a product, add to favorites.
3. `/feed` — video feed; like/save/comment anonymously.
4. `/login` → `/admin` — dashboard, import/export, CMS, analytics.
5. Toggle **Uzbek / Русский / English** via the storefront language switcher.

---

## FAQ

**Do I need to edit code per client?** No. Branding, catalog, and content all come from the DB plus
the two `VITE_*` env vars. `src/config/business.ts` is only the fallback/seed default.

**How are favorites/saved items tracked without accounts?** An anonymous `visitor_id` in
localStorage is sent as the owner of favorites, feed saves, likes, and comments. No sign-up needed.

**SEO?** Each product/page emits meta tags + JSON-LD in the visitor's language; sitemap/robots are
generated at build time from `generate-seo.mjs`.

**Analytics?** Engagement events (views, saves, feed watches, map/direction clicks) are stored per
project and surfaced in **Admin → Analytics**.

**Where's the AI?** Prompt Library ships as a content/PM tool. AI generation is deferred ("no ai yet").