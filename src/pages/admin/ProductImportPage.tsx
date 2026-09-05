import React, { useState, useMemo, useRef } from 'react';
import {
  UploadCloud,
  FileSpreadsheet,
  Download,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileJson,
  ClipboardPaste,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { DEFAULT_IMAGE } from '../../lib/supabase/mappers';
import type { Product } from '../../types/product';

type FieldKey =
  | 'name' | 'price' | 'originalPrice' | 'sku' | 'category' | 'description'
  | 'shortDescription' | 'stockCount' | 'sizes' | 'colors' | 'tags'
  | 'images' | 'isNew' | 'isFeatured' | 'isOnSale' | 'published';

const ALIASES: Record<FieldKey, string[]> = {
  name: ['name', 'nomi', 'mahsulot', 'title', 'наименование'],
  price: ['price', 'narx', 'narhi', 'цена'],
  originalPrice: ['original_price', 'originalprice', 'eski_narx', 'old_price', 'crossprice', 'chena_bez', 'старая_цена'],
  sku: ['sku', 'artikul', 'artikel', 'code', 'kod', 'артикул'],
  category: ['category', 'kategoriya', 'bo\'lim', 'bolim', 'section', 'категория'],
  description: ['description', 'tavsif', 'full_description', 'to_liq_tavsif', 'opolnie', 'описание'],
  shortDescription: ['short_description', 'shortdescription', 'qisqa_tavsif', 'краткое_описание'],
  stockCount: ['stock_count', 'stockcount', 'zaxira', 'count', 'soni', 'qty', 'batch', 'остаток'],
  sizes: ['sizes', 'o\'lchamlar', 'olchamlar', 'size', 'razmer', 'o\'lcham', 'olcham', 'размеры'],
  colors: ['colors', 'ranglar', 'colour', 'colors_name', 'цвета'],
  tags: ['tags', 'tegler', 'teglar', 'метки'],
  images: ['images', 'images_url', 'image_urls', 'rasmlar', 'image', 'photo', 'surat', 'file', 'img', 'фото'],
  isNew: ['is_new', 'new', 'yangi', 'novinka', 'новинка'],
  isFeatured: ['is_featured', 'featured', 'mashhur', 'рекоменд'],
  isOnSale: ['is_on_sale', 'chegirma', 'discount', 'sale', 'скидка'],
  published: ['published', 'nashr', 'active', 'faol', 'опубликован'],
};

interface ParsedRow {
  index: number;
  name: string;
  price: number | null;
  originalPrice: number | null;
  sku: string;
  category: string;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[];
  tags: string[];
  stockCount: number;
  flags: { isNew: boolean; isFeatured: boolean; isOnSale: boolean; published: boolean };
  skip: string | null;
}

function headerField(cell: string): FieldKey | null {
  const key = cell.toLowerCase().replace(/[\s']/g, '_');
  for (const field of Object.keys(ALIASES) as FieldKey[]) {
    if (ALIASES[field].some((alias) => alias.toLowerCase().replace(/[\s']/g, '_') === key)) return field;
  }
  return null;
}

function parseDelimited(text: string, sep: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else inQuotes = false;
      } else field += c;
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === sep) {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      field = '';
      if (row.some((r) => r.trim() !== '')) rows.push(row);
      row = [];
    } else if (c === '\r') {
      // ignore
    } else {
      field += c;
    }
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    if (row.some((r) => r.trim() !== '')) rows.push(row);
  }
  return rows;
}

function detectSeparator(text: string): string {
  const first = text.split('\n')[0] || '';
  const counts: Record<string, number> = { ',': 0, ';': 0, '\t': 0 };
  for (const c of first) {
    if (counts[c] !== undefined) counts[c]++;
  }
  return counts[';'] > counts[','] && counts[';'] >= counts['\t'] ? ';' : counts['\t'] > counts[','] ? '\t' : ',';
}

function parsePrice(raw: string): number | null {
  const seg = raw.match(/-?\d[\d\s.,]*/);
  if (!seg) return null;
  let s = seg[0].replace(/\s/g, '');
  const hasDot = s.includes('.');
  const hasComma = s.includes(',');
  if (hasDot && hasComma) s = s.replace(/,/g, '');
  else if (hasComma && !hasDot) s = s.replace(/,/g, '');
  const n = parseFloat(s);
  return isNaN(n) ? null : Math.round(n);
}

function splitList(raw: string): string[] {
  return raw
    .split(/[|;,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseColors(raw: string): { name: string; hex: string }[] {
  return raw
    .split(/[|;,]/)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const m = s.match(/^(.+?)#([0-9a-fA-F]{6})$/);
      return m ? { name: m[1].trim(), hex: `#${m[2]}` } : { name: s, hex: '#18181b' };
    });
}

function splitImages(raw: string): string[] {
  return raw
    .split(/\s+/)
    .map((s) => s.trim())
    .filter((s) => /^https?:\/\//i.test(s));
}

function parseBool(raw: string): boolean {
  return ['1', 'true', 'yes', 'ha', 'да', 'true'].includes(raw.trim().toLowerCase()) || raw.trim() === '+';
}

function slugify(name: string): string {
  const map: Record<string, string> = {
    'o\'': 'o', "oʻ": 'o', 'g\'': 'g', "gʻ": 'g',
    'sh': 'sh', 'ch': 'ch', 'ng': 'ng',
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'j', 'з': 'z', 'и': 'i', 'й': 'i', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'c', 'ч': 'ch', 'ш': 'sh', 'щ': 'sh',
    'ъ': '', 'ы': 'i', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  };
  let s = name.toLowerCase();
  for (const [k, v] of Object.entries(map)) s = s.split(k).join(v);
  return s
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || `item-${Date.now()}`;
}

const EXAMPLE_CSV = `Nomi,Narxi,Artikul,Kategoriya,O'lchamlar,Ranglar,Tavsif,Soni,Rasmlar
Oversize futbolka,120000,T-001,Erkaklar,XL;XXL,Oq#ffffff,Misol tavsifi,10,https://example.com/tshirt.jpg
Premium krossovka,450000,SN-002,Oyoq kiyimlar,42;43;44,Qora,Krossovka tavsifi,5,`;

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([`\uFEFF${content}`], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

interface ImportSummary {
  ok: number;
  failed: number;
  skipped: number;
  errors: { row: number; reason: string; name: string }[];
}

export const ProductImportPage: React.FC = () => {
  const { products, categories, addCategory, insertBulkProduct } = useStore();
  const [mode, setMode] = useState<'csv' | 'json'>('csv');
  const [text, setText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const [parsed, setParsed] = useState<ParsedRow[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const existingSkus = useMemo(() => new Set(products.map((p) => p.sku?.toLowerCase()).filter(Boolean)), [products]);
  const existingNames = useMemo(() => new Set(products.map((p) => p.name.toLowerCase())), [products]);

  const JSON_COLUMNS: FieldKey[] = [
  'name', 'price', 'originalPrice', 'sku', 'category', 'description',
  'shortDescription', 'stockCount', 'sizes', 'colors', 'tags', 'images',
  'isNew', 'isFeatured', 'isOnSale', 'published',
];

const formatJsonCell = (col: FieldKey, value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) {
    if (col === 'images') return value.map(String).join(' ');
    return value
      .map((item) => {
        if (typeof item === 'object' && item !== null && 'name' in item) {
          const c = item as { name?: string; hex?: string };
          return c.hex ? `${c.name}#${c.hex.replace('#', '')}` : (c.name ?? '');
        }
        return String(item);
      })
      .join('|');
  }
  return String(value);
};

const parseInput = () => {
    setSummary(null);
    let headers: string[] | null = null;
    let rows: string[][] = [];

    if (mode === 'csv') {
      rows = parseDelimited(text, detectSeparator(text));
      if (rows.length > 0) {
        const first = rows[0];
        const found = first.map(headerField);
        const knownCount = found.filter(Boolean).length;
        if (knownCount >= 2 || (knownCount === 1 && found[0] === 'name')) {
          headers = first;
          rows.shift();
        }
      }
    } else {
      const jsonRows = parseJsonRows(text);
      if (jsonRows.length > 0) {
        headers = JSON_COLUMNS;
        rows = jsonRows.map((obj) => JSON_COLUMNS.map((col) => formatJsonCell(col, obj[col])));
      }
    }

    if (rows.length === 0) {
      setParsed([]);
      return;
    }

    const colMap: (FieldKey | null)[] = headers
      ? headers.map((h) => headerField(h))
      : ['name', 'price', 'sku', 'category', 'description', 'sizes', 'colors', 'stockCount', 'images'];

    const out: ParsedRow[] = [];
    rows.forEach((row, idx) => {
      const data = (Object.fromEntries(row.map((v, i) => [colMap[i] ?? `_${i}`, v])) as Record<string, string>) || {};
      const name = (data.name ?? '').trim();
      const priceRaw = (data.price ?? '').trim();
      const price = parsePrice(priceRaw);
      const category = (data.category ?? '').trim();

      const errors: string[] = [];
      if (!name) errors.push('Nomi (name) yo\'q');
      if (price === null) errors.push('Narxi (price) noto\'g\'ri');
      const skip = errors.length ? errors.join('; ') : null;

      out.push({
        index: idx + 1,
        name,
        price,
        originalPrice: price !== null ? parsePrice(data.originalPrice ?? '') : null,
        sku: ((data.sku ?? '').trim()).toUpperCase(),
        category,
        sizes: splitList(data.sizes ?? ''),
        colors: parseColors(data.colors ?? ''),
        images: splitImages(data.images ?? ''),
        tags: splitList(data.tags ?? ''),
        stockCount: data.stockCount ? Math.max(0, parseInt(String(data.stockCount).replace(/\D/g, ''), 10) || 0) : 0,
        flags: {
          isNew: parseBool(data.isNew ?? ''),
          isFeatured: parseBool(data.isFeatured ?? ''),
          isOnSale: parseBool(data.isOnSale ?? ''),
          published: (data.published ?? '') ? parseBool(data.published ?? '') : true,
        },
        skip,
      });
    });

    setParsed(out);
  };

  const parseJsonRows = (text: string): Array<Record<string, unknown>> => {
    try {
      const data = JSON.parse(text);
      const arr = Array.isArray(data) ? data : data.products;
      if (!Array.isArray(arr)) return [];
      return arr.filter((o): o is Record<string, unknown> => typeof o === 'object' && o !== null);
    } catch {
      return [];
    }
  };

  const handleFile = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result || '');
      setMode(file.name.toLowerCase().endsWith('.json') ? 'json' : 'csv');
      setText(content.trim());
    };
    reader.readAsText(file, 'utf-8');
  };

  const runImport = async () => {
    if (!parsed) return;
    setBusy(true);
    const results: ImportSummary['errors'] = [];
    let ok = 0;
    let skipped = 0;
    let failed = 0;

    const catCache = new Map<string, string | null>();

    const resolveCategoryId = (name: string): string | null => {
      if (!name) return null;
      const lower = name.toLowerCase();
      if (catCache.has(lower)) return catCache.get(lower) ?? null;
      const existing = categories.find(
        (c) => c.name.toLowerCase() === lower || c.slug.toLowerCase() === lower.replace(/\s+/g, '-'),
      );
      if (existing) {
        catCache.set(lower, existing.id);
        return existing.id;
      }
      const slug = slugify(name);
      const id = slug;
      addCategory({ name, slug: id, description: '', image: DEFAULT_IMAGE });
      catCache.set(lower, id);
      return id;
    };

    for (const row of parsed) {
      if (row.skip) {
        skipped++;
        results.push({ row: row.index, name: row.name, reason: row.skip });
        continue;
      }
      if (!row.name || row.price === null) {
        failed++;
        results.push({ row: row.index, name: row.name, reason: 'Nomi yoki narxi yo\'q' });
        continue;
      }
      if (row.sku && existingSkus.has(row.sku.toLowerCase())) {
        skipped++;
        results.push({ row: row.index, name: row.name, reason: `SKU ${row.sku} allaqachon mavjud` });
        continue;
      }

      const categoryId = resolveCategoryId(row.category);
      const baseSlug = slugify(row.name);
      let slug = baseSlug;
      let n = 2;
      while (existingNames.has(row.name.toLowerCase()) || slugExists(slug)) {
        slug = `${baseSlug}-${n++}`;
      }

      const product: Product = {
        id: `import-${Date.now()}-${row.index}`,
        name: row.name,
        slug,
        price: row.price,
        originalPrice: row.originalPrice !== null ? row.originalPrice : undefined,
        currency: 'uzs',
        short_description: '',
        category: categoryId ? slugify(row.category) : '',
        categoryName: row.category,
        description: '',
        details: [],
        images: row.images.length ? row.images : [DEFAULT_IMAGE],
        sizes: row.sizes,
        colors: row.colors,
        inStock: row.flags.published,
        stockCount: 0,
        isNew: row.flags.isNew,
        isFeatured: row.flags.isFeatured,
        isOnSale: row.flags.isOnSale,
        published: row.flags.published,
        sku: row.sku || '',
        tags: row.tags,
      };

      if (row.stockCount > 0) {
        product.stockCount = row.stockCount;
        product.inStock = true;
      }

      try {
        await insertBulkProduct(product, categoryId);
        existingSkus.add(row.sku ? row.sku.toLowerCase() : '');
        existingNames.add(row.name.toLowerCase());
        ok++;
      } catch {
        failed++;
        results.push({ row: row.index, name: row.name, reason: 'Bazaga yozishda xatolik' });
      }
    }

    setBusy(false);
    setSummary({ ok, failed, skipped, errors: results });
    setParsed(null);
    setText('');
    setFileName(null);
  };

  const slugExists = (slug: string): boolean => {
    return products.some((p) => p.slug === slug);
  };

  const exportCsv = () => {
    const header = [
      'Nomi', 'Narxi', 'Artikul', 'Kategoriya', 'Tavsif', 'Qisqa tavsif',
      'O\'lchamlar', 'Ranglar', 'Teglar', 'Rasmlar', 'Soni', 'Yangi', 'Mashhur', 'Chegirma',
    ];
    const rows = products.map((p) => [
      p.name,
      String(p.originalPrice && p.originalPrice > p.price ? p.originalPrice : p.price),
      p.sku || '',
      p.categoryName || p.category,
      p.description,
      p.short_description || '',
      p.sizes.join('; '),
      p.colors.map((c) => (c.hex ? `${c.name}#${c.hex.replace('#', '')}` : c.name)).join('; '),
      (p.tags || []).join('; '),
      p.images.join(' '),
      String(p.stockCount ?? (p.inStock ? 1 : 0)),
      p.isNew ? '1' : '0',
      p.isFeatured ? '1' : '0',
      p.isOnSale ? '1' : '0',
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    downloadFile('mahsulotlar.csv', csv, 'text/csv');
  };

  const readyCount = parsed ? parsed.filter((r) => !r.skip).length : 0;
  const flaggedCount = parsed ? parsed.filter((r) => r.skip).length : 0;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Import / Eksport
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            CSV yoki JSON fayldan mahsulotlarni ommaviy yuklab oling. Kategoriyalar avtomatik yaratiladi.
          </p>
        </div>
        <button
          type="button"
          onClick={exportCsv}
          className="px-4 py-2.5 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-300 dark:border-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          Katalog CSV eksporti
        </button>
      </div>

      {/* Input Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { setMode('csv'); setParsed(null); setSummary(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              mode === 'csv'
                ? 'bg-amber-500 text-neutral-950 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            CSV
          </button>
          <button
            type="button"
            onClick={() => { setMode('json'); setParsed(null); setSummary(null); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              mode === 'json'
                ? 'bg-amber-500 text-neutral-950 shadow-xs'
                : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300'
            }`}
          >
            <FileJson className="w-4 h-4" />
            JSON
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 transition-colors flex items-center gap-2"
          >
            <UploadCloud className="w-4 h-4" />
            {fileName || 'Fayl tanlash (*.csv, *.json)'}
          </button>
          {fileName && (
            <button
              type="button"
              onClick={() => { setFileName(null); setText(''); if (fileRef.current) fileRef.current.value = ''; }}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-red-500 hover:underline"
            >
              <Trash2 className="w-3.5 h-3.5" />
              O'chirish
            </button>
          )}
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.json,text/csv,application/json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile(f);
            }}
          />
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1.5">
            <ClipboardPaste className="w-3.5 h-3.5 text-neutral-400" />
            <label className="text-xs font-bold text-neutral-700 dark:text-neutral-300">
              {mode === 'csv' ? 'CSV matnini qo\'shing (pastga qo\'yish / yozish)' : 'JSON matni (mahsulotlar massivi)'}
            </label>
          </div>
          <textarea
            value={text}
            onChange={(e) => { setText(e.target.value); setParsed(null); setSummary(null); }}
            rows={8}
            placeholder={EXAMPLE_CSV}
            spellCheck={false}
            className="w-full px-3.5 py-2.5 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white placeholder:opacity-50 focus:ring-2 focus:ring-amber-500 resize-y"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={parseInput}
            disabled={!text.trim()}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-current" />
            Tahlil qilish
          </button>
          <button
            type="button"
            onClick={() => setText(EXAMPLE_CSV)}
            className="px-4 py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-bold text-neutral-700 dark:text-neutral-200 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Namuna ko'rsatish
          </button>
        </div>

        {/* Supported fields legend */}
        <details className="rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 px-4 py-3">
          <summary className="text-xs font-bold text-neutral-600 dark:text-neutral-300 cursor-pointer select-none">
            Qo'llab-quvvatlanadigan ustunlar
          </summary>
          <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-[11px] text-neutral-600 dark:text-neutral-400">
            <p><b className="text-neutral-800 dark:text-neutral-200">Nomi*</b> — Nomi / Name</p>
            <p><b className="text-neutral-800 dark:text-neutral-200">Narxi*</b> — Narx / Price / Narhi</p>
            <p><b className="text-neutral-800 dark:text-neutral-200">Artikul</b> — SKU / Kod</p>
            <p><b className="text-neutral-800 dark:text-neutral-200">Kategoriya</b> — Category (yangi bo'lsa avtomatik yaratiladi)</p>
            <p><b className="text-neutral-800 dark:text-neutral-200">Tavsif</b> — Description / Tavsif</p>
            <p><b className="text-neutral-800 dark:text-neutral-200">Qisqa tavsif</b> — Short description</p>
            <p><b className="text-neutral-800 dark:text-neutral-200">O'lchamlar</b> — Sizes (vergul/; bilan ajrating)</p>
            <p><b className="text-neutral-800 dark:text-neutral-200">Ranglar</b> — Colors (Qora#000000)</p>
            <p><b className="text-neutral-800 dark:text-neutral-200">Teglar</b> — Tags</p>
            <p><b className="text-neutral-800 dark:text-neutral-200">Rasmlar</b> — Images (URL, probel bilan)</p>
            <p><b className="text-neutral-800 dark:text-neutral-200">Soni</b> — Stock / Zaxira</p>
            <p><b className="text-neutral-800 dark:text-neutral-200">Yangi/Mashhur/Chegirma</b> — 1/0 bayroqlar</p>
          </div>
        </details>
      </div>

      {/* Preview */}
      {parsed && (
        <div className="p-6 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
              Tayyor reja — {parsed.length} ta qator
            </h3>
            <div className="flex items-center gap-3 text-[11px] font-bold">
              <span className="text-emerald-600 dark:text-emerald-400">{readyCount} tayyor</span>
              {flaggedCount > 0 && <span className="text-red-500">{flaggedCount} xato/skip</span>}
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto rounded-2xl border border-neutral-200 dark:border-neutral-700">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-neutral-50 dark:bg-neutral-800 text-neutral-500 dark:text-neutral-400 font-bold uppercase text-[10px] z-10">
                <tr>
                  <th className="py-3 pl-4 pr-2">#</th>
                  <th className="py-3 px-2">Nomi</th>
                  <th className="py-3 px-2">Narxi</th>
                  <th className="py-3 px-2">SKU</th>
                  <th className="py-3 px-2">Kategoriya</th>
                  <th className="py-3 px-2">O'lchamlar</th>
                  <th className="py-3 pr-4 pl-2">Holat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {parsed.slice(0, 200).map((row) => (
                  <tr key={row.index} className={row.skip ? 'opacity-60 bg-red-50/30 dark:bg-red-950/10' : ''}>
                    <td className="py-2.5 pl-4 pr-2 text-neutral-400">{row.index}</td>
                    <td className="py-2.5 px-2 font-semibold max-w-[200px] truncate">{row.name || '—'}</td>
                    <td className="py-2.5 px-2 font-mono">{row.price !== null ? row.price.toLocaleString('uz-UZ') : '—'}</td>
                    <td className="py-2.5 px-2 font-mono">{row.sku || '—'}</td>
                    <td className="py-2.5 px-2">{row.category || '—'}</td>
                    <td className="py-2.5 px-2">
                      <div className="flex flex-wrap gap-1 max-w-[160px]">
                        {row.sizes.slice(0, 3).map((s) => (
                          <span key={s} className="px-1.5 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-[10px]">{s}</span>
                        ))}
                        {row.sizes.length > 3 && <span className="text-[10px] text-neutral-400">+{row.sizes.length - 3}</span>}
                      </div>
                    </td>
                    <td className="py-2.5 pr-4 pl-2">
                      {row.skip ? (
                        <span className="inline-flex items-center gap-1 text-red-500 text-[10px] font-bold">
                          <XCircle className="w-3.5 h-3.5" /> {row.skip}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Tayyor
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {parsed.length > 200 && (
            <p className="text-[11px] text-neutral-500">Jadvalda dastlabki 200 ta qator ko'rsatilgan.</p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={runImport}
              disabled={busy || readyCount === 0}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-sm transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              {busy ? 'Import qilinmoqda...' : `${readyCount} ta mahsulotni import qilish`}
            </button>
            {flaggedCount > 0 && (
              <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                Xatolikli qatorlar o'tkazib yuboriladi.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Summary */}
      {summary && (
        <div className={`p-6 rounded-3xl border shadow-xs space-y-3 ${
          summary.failed === 0
            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300/60 dark:border-emerald-900/60'
            : 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300/60 dark:border-amber-900/60'
        }`}>
          <div className="flex items-center gap-3">
            {summary.failed === 0 ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            )}
            <div>
              <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white">
                Import yakuni
              </h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-300 mt-0.5">
                {summary.ok} muvaffaqiyatli · {summary.skipped} o'tkazib yuborildi · {summary.failed} xato
              </p>
            </div>
          </div>
          {summary.errors.length > 0 && (
            <div className="rounded-xl bg-white/70 dark:bg-neutral-900/70 border border-neutral-200 dark:border-neutral-700 divide-y divide-neutral-100 dark:divide-neutral-800 max-h-48 overflow-auto">
              {summary.errors.map((err, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 text-[11px]">
                  <span className="text-neutral-400 font-mono">#{err.row}</span>
                  <span className="font-bold text-neutral-800 dark:text-neutral-200 truncate">{err.name || '—'}</span>
                  <span className="text-red-500 font-semibold ml-auto shrink-0">{err.reason}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductImportPage;