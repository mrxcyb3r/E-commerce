// Build-time SEO file generator.
// Renders robots.txt and sitemap.xml with the real site URL from
// VITE_SITE_URL (white-label: each client sets their own domain).
// Falls back to a placeholder that must be replaced before go-live.
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = join(__dirname, '..', 'public');
const outDir = join(__dirname, '..', 'dist');

const SITE_URL = (
  process.env.VITE_SITE_URL ||
  process.env.SITE_URL ||
  process.env.URL ||
  ''
).replace(/\/+$/, '');

if (!SITE_URL) {
  console.warn(
    '[generate-seo] No VITE_SITE_URL / SITE_URL / URL env set. Using https://example.com placeholder. Set VITE_SITE_URL for production.'
  );
}

const base = SITE_URL || 'https://example.com';

const routes = [
  { path: '/', priority: '1.0', change: 'daily' },
  { path: '/products', priority: '0.9', change: 'daily' },
  { path: '/feed', priority: '0.8', change: 'daily' },
  { path: '/about', priority: '0.7', change: 'monthly' },
  { path: '/location', priority: '0.7', change: 'monthly' },
  { path: '/contact', priority: '0.6', change: 'monthly' },
  { path: '/prompts', priority: '0.6', change: 'weekly' },
  { path: '/favorites', priority: '0.4', change: 'weekly' },
];

const urls = routes
  .map(
    (r) => `  <url><loc>${base}${r.path}</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod><changefreq>${r.change}</changefreq><priority>${r.priority}</priority></url>`
  )
  .join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;

const robots = `User-agent: *\nAllow: /\n\nDisallow: /admin/\nDisallow: /login\n\nSitemap: ${base}/sitemap.xml\n`;

mkdirSync(publicDir, { recursive: true });
mkdirSync(outDir, { recursive: true });
writeFileSync(join(publicDir, 'robots.txt'), robots);
writeFileSync(join(publicDir, 'sitemap.xml'), sitemap);
writeFileSync(join(outDir, 'robots.txt'), robots);
writeFileSync(join(outDir, 'sitemap.xml'), sitemap);
console.log(`[generate-seo] sitemap.xml & robots.txt written for ${base}`);