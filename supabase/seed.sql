-- Seed data for Ecommerce Platform
-- Order matters: categories must be inserted before products due to FK constraints

-- Categories (insert first - no FK dependencies)
-- Using explicit UUIDs to match product.category references
INSERT INTO public.categories (id, name, slug, description, is_visible, is_featured, sort_order, image_url) VALUES
('erkaklar-uuid', 'Erkaklar', 'erkaklar', 'Zamonaviy kiyimlar, ko''ylaklar, futbolkalar va shimlar', true, true, 1, 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80'),
('ayollar-uuid', 'Ayollar', 'ayollar', 'Nafis liboslar, ko''ylaklar, kurtkalar va kundalik to''plamlar', true, true, 2, 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80'),
('bolalar-uuid', 'Bolalar', 'bolalar', 'Qulay, xavfsiz va chiroyli bolalar kiyimlari', true, true, 3, 'https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?auto=format&fit=crop&w=800&q=80'),
('oyoq-kiyimlar-uuid', 'Oyoq kiyimlar', 'oyoq-kiyimlar', 'Krossovkalar, klassik tufli va kundalik qulay poyabzallar', true, true, 4, 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'),
('aksessuarlar-uuid', 'Aksessuarlar', 'aksessuarlar', 'Ryukzaklar, soatlar, kamarlar, kepkalar va sumkalar', true, true, 5, 'https://images.unsplash.com/photo-1523779164922-4ced3ec43714?auto=format&fit=crop&w=800&q=80');

-- Products (insert after categories - references categories.id)
INSERT INTO public.products (id, slug, name, description, short_description, price, original_price, currency, category_id, brand, is_published, is_featured, is_new, is_on_sale, stock_status, stock_count, sku, rating, review_count, tags, material, made_in, sort_order) VALUES
-- Erkaklar category products
('prod-1', 'classic-oversize-t-shirt', 'Classic Oversize T-Shirt', '100% paxtali, qulay va yengil oversize bichimli zamonaviy futbolka. Kundalik kiyish uchun juda qulay.', 'Premium cotton oversize tee', 149000, 180000, 'uzs', 'erkaklar-uuid', 'Minimalist Line', true, true, true, false, 'mavjud', 14, 'TSH-OVR-01', 4.9, 28, '["futbolka", "oversize", "erkaklar", "yozgi", "paxta"]', 'paxta', 'Uzbekistan', 1),
('prod-2', 'premium-sport-krossovka', 'Premium Sport Krossovka', 'Amortizatsiyalovchi taglikka ega yengil sport krossovkasi. Yugurish, trenirovka va kundalik yurish uchun ideal.', 'EVA lightweight sport sneakers', 399000, 450000, 'uzs', 'oyoq-kiyimlar-uuid', 'AeroStep', true, true, true, false, 'mavjud', 8, 'SH-SPR-02', 5.0, 41, '["krossovka", "sport", "yugurish", "oyoq kiyim", "qulay"]', 'eko-teri', 'Uzbekistan', 2),
('prod-3', 'urban-hoodie', 'Urban Hoodie', 'Zich futer matosidan tikilgan issiq kapyushonli xudi. Qishki va bahorgi fasllarda kiyish uchun ajoyib qulaylik.', 'Warm zip-up hoodie', 249000, 290000, 'uzs', 'erkaklar-uuid', 'UrbanStyle', true, true, false, true, 'mavjud', 19, 'HD-URB-03', 4.8, 35, '["xudi", "hoodie", "issiq", "kuzgi", "qishki"]', 'zich', 'Uzbekistan', 3),
('prod-4', 'classic-denim', 'Classic Denim Shim', 'Klassik to''g''i bichimli premium djensi shim. Yuqori sifatli denim matodan tikilgan, uzoq yillar xizmat qiladi.', 'Premium denim jeans', 289000, 330000, 'uzs', 'erkaklar-uuid', 'Nordic Denim', true, true, false, false, 'mavjud', 11, 'JNS-CLS-04', 4.7, 22, '["djinsi", "shim", "klassik", "denim"]', 'denim', 'Uzbekistan', 4),
('prod-5', 'basic-polo', 'Basic Pique Polo', 'Pike to''qimali nafis paxta polo ko''ylak. Ham ish uchrashuvlari, ham dam olish kunlari uchun mos tushadi.', 'Classic cotton polo shirt', 179000, 210000, 'uzs', 'erkaklar-uuid', 'Gentleman Wear', true, true, true, false, 'mavjud', 15, 'POL-BSC-05', 4.9, 19, '["polo", "ko''ylak", "yozgi", "klassik"]', 'paxta', 'Uzbekistan', 5),

-- Oyoq kiyimlar category products
('prod-6', 'sport-kostyum', 'Sport Kostyum To''plami', 'Zamonaviy ikki qismli sport kostyumi. Mashg''ulotlar va kundalik sayrlar uchun juda qulay.', 'Modern sportsuit set', 450000, 520000, 'uzs', 'erkaklar-uuid', 'ProActive', true, true, false, false, 'mavjud', 7, 'SPT-SET-06', 4.8, 30, '["sport", "kostyum", "to''plam", "trening"]', 'ekoloqiy', 'Uzbekistan', 6),
('prod-7', 'daily-sneakers', 'Daily Minimal Sneakers', 'Har qanday kiyimga mos tushuvchi minimalist oq keda poyabzali. Yumshoq taglik va mustahkam tikuv.', 'Minimalist white sneakers', 320000, 370000, 'uzs', 'oyoq-kiyimlar-uuid', 'CityWalk', true, true, true, false, 'mavjud', 12, 'SNK-MIN-07', 4.9, 26, '["sneakers", "keda", "oyoq kiyim", "oq keda", "minimalist"]', 'eko-teri', 'Uzbekistan', 7),

-- Aksessuarlar category products
('prod-8', 'leather-backpack', 'Leather Urban Backpack', 'Noutbuk va kundalik buyumlar uchun mo''ljallangan zamonaviy shahar ryukzagi. Suv o''tkazmaydigan qoplama.', 'Urban leather backpack', 290000, 340000, 'uzs', 'aksessuarlar-uuid', 'Nomad Goods', true, true, true, false, 'mavjud', 10, 'ACC-BPK-08', 4.9, 38, '["ryukzak", "sumka", "noutbuk", "aksessuar"]', 'qinniq ko''rmoqchi', 'Uzbekistan', 8),
('prod-9', 'nafis-ayollar-koylagi', 'Nafis Ayollar Ko''ylagi', 'Bahor va yozViewportiga mos nafis, qulay va yengil matoli zamonaviy ayollar ko''ylagi.', 'Elegant women''s summer dress', 275000, 310000, 'uzs', 'ayollar-uuid', 'Elegance Bloom', true, false, true, false, 'mavjud', 6, 'DRS-WMN-09', 5.0, 15, '["ko''ylak", "ayollar", "libos", "bahorgi"]', 'viskoza', 'Uzbekistan', 9),

-- Ayollar category products
('prod-10', 'bolalar-qulay-paxta-toplami', 'Bolalar Qulay Paxta To''plami', 'Bolalar terisi uchun 100% xavfsiz, tabiiy organik paxtadan tayyorlangan yorqin va quvnoq kiyim to''plami.', 'Organic cotton kids set', 135000, 160000, 'uzs', 'bolalar-uuid', 'Little Stars', true, false, true, false, 'mavjud', 16, 'KID-SET-10', 4.9, 21, '["bolalar", "to''plam", "paxta", "qulay"]', 'organik paxta', 'Uzbekistan', 10),
('prod-11', 'klassik-teri-kamar', 'Klassik Teri Kamar', 'Haqiqiy mustahkam presslangan charmdan ishlangan metall to''qali klassik erkaklar kamari.', 'Classic leather belt', 95000, 120000, 'uzs', 'aksessuarlar-uuid', 'BeltCraft', true, false, false, false, 'mavjud', 25, 'ACC-BLT-11', 4.8, 12, '["kamar", "charm", "aksessuar", "erkaklar"]', 'haqiqiy qurilma', 'Uzbekistan', 11),

-- Ayollar category products (continued)
('prod-12', 'ayollar-trikotaj-sviter', 'Ayollar Qalin Trikotaj Sviteri', 'Yumshoq jun va akril aralashmasidan to''qilgan issiq va zamonaviy ayollar sviteri.', 'Cozy knit sweater', 260000, 300000, 'uzs', 'ayollar-uuid', 'Cozy Knit', true, false, false, false, 'mavjud', 9, 'SWT-WMN-12', 4.9, 18, '["sviter", "ayollar", "issiq", "trikotaj"]', 'jun akril', 'Uzbekistan', 12);
