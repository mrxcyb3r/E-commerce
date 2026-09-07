import React, { useState, useCallback } from 'react';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  Send,
  Instagram,
  Save,
  Check,
  Globe,
  Compass,
  Palette,
  Image as ImageIcon,
  Loader2,
  AlertCircle,
  Eye,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { SingleImageUpload } from '../../components/admin/SingleImageUpload';
import { MEDIA_BUCKETS } from '../../lib/supabase/storage';

export const StoreAdminPage: React.FC = () => {
  const { storeInfo, updateStoreInfo } = useStore();

  const [name, setName] = useState(storeInfo.businessName);
  const [tagline, setTagline] = useState(storeInfo.tagline);
  const [address, setAddress] = useState(storeInfo.address);
  const [landmark, setLandmark] = useState(storeInfo.landmark);
  const [city, setCity] = useState(storeInfo.city);
  const [workingHours, setWorkingHours] = useState(storeInfo.workingHours);
  const [phone1, setPhone1] = useState(storeInfo.phoneNumbers?.[0] || '');
  const [phone2, setPhone2] = useState(storeInfo.phoneNumbers?.[1] || '');
  const [email, setEmail] = useState(storeInfo.email || '');
  const [telegramUsername, setTelegramUsername] = useState(storeInfo.telegramUsername);
  const [telegramChannel, setTelegramChannel] = useState(storeInfo.telegramChannel || '');
  const [instagramUsername, setInstagramUsername] = useState(storeInfo.instagramUsername);
  const [googleMapsUrl, setGoogleMapsUrl] = useState(storeInfo.googleMapsUrl);
  const [yandexMapsUrl, setYandexMapsUrl] = useState(storeInfo.yandexMapsUrl);
  const [latitude, setLatitude] = useState(storeInfo.coordinates?.lat?.toString() || '40.1158');
  const [longitude, setLongitude] = useState(storeInfo.coordinates?.lng?.toString() || '67.8422');

  const [logoUrl, setLogoUrl] = useState(storeInfo.logoUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(storeInfo.faviconUrl || '');
  const [primaryColor, setPrimaryColor] = useState(storeInfo.primaryColor);
  const [businessCategory, setBusinessCategory] = useState(storeInfo.businessCategory || '');
  const [language, setLanguage] = useState(storeInfo.language || 'uz');
  const [defaultSeoTitle, setDefaultSeoTitle] = useState(storeInfo.defaultSeoTitle || '');
  const [defaultSeoDescription, setDefaultSeoDescription] = useState(storeInfo.defaultSeoDescription || '');
  const [defaultSeoKeywords, setDefaultSeoKeywords] = useState(storeInfo.defaultSeoKeywords || '');
  const [ogImageUrl, setOgImageUrl] = useState(storeInfo.ogImageUrl || '');
  const [twitterImageUrl, setTwitterImageUrl] = useState(storeInfo.twitterImageUrl || '');
  const [shortName, setShortName] = useState(storeInfo.shortName || '');
  const [secondaryColor, setSecondaryColor] = useState(storeInfo.secondaryColor || storeInfo.primaryColor);
  const [accentColor, setAccentColor] = useState(storeInfo.accentColor || '#f59e0b');
  const [heroTitle, setHeroTitle] = useState(storeInfo.heroTitle || '');
  const [heroSubtitle, setHeroSubtitle] = useState(storeInfo.heroSubtitle || '');
  const [aboutText, setAboutText] = useState(storeInfo.aboutText || '');
  const [mission, setMission] = useState(storeInfo.mission || '');
  const [vision, setVision] = useState(storeInfo.vision || '');
  const [adminEmail, setAdminEmail] = useState(storeInfo.adminEmail || storeInfo.email || '');
  const [copyright, setCopyright] = useState(storeInfo.copyright || '');
  const [footerText, setFooterText] = useState(storeInfo.footerText || '');

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = "Do'kon nomi kiritilishi shart";
    if (!phone1.trim()) errors.phone1 = "Asosiy telefon raqami kiritilishi shart";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Noto'g'ri email formati";
    if (adminEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(adminEmail)) errors.adminEmail = "Noto'g'ri admin email formati";
    if (googleMapsUrl && !googleMapsUrl.startsWith('http')) errors.googleMapsUrl = "Google Maps havolasi http/https bilan boshlanishi kerak";
    if (yandexMapsUrl && !yandexMapsUrl.startsWith('http')) errors.yandexMapsUrl = "Yandex Maps havolasi http/https bilan boshlanishi kerak";
    if (logoUrl && !logoUrl.startsWith('http')) errors.logoUrl = "Logo URL http/https bilan boshlanishi kerak";
    if (faviconUrl && !faviconUrl.startsWith('http')) errors.faviconUrl = "Favicon URL http/https bilan boshlanishi kerak";
    if (ogImageUrl && !ogImageUrl.startsWith('http')) errors.ogImageUrl = "OG rasm URL http/https bilan boshlanishi kerak";
    if (twitterImageUrl && !twitterImageUrl.startsWith('http')) errors.twitterImageUrl = "Twitter rasm URL http/https bilan boshlanishi kerak";

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (isNaN(lat) || lat < -90 || lat > 90) errors.latitude = "Noto'g'ri kenglik (latitude)";
    if (isNaN(lng) || lng < -180 || lng > 180) errors.longitude = "Noto'g'ri uzunlik (longitude)";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }, [name, phone1, email, adminEmail, googleMapsUrl, yandexMapsUrl, logoUrl, faviconUrl, ogImageUrl, twitterImageUrl, latitude, longitude]);

  const handleSave = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSaving(true);
    setSavedSuccess(false);
    setErrorMessage(null);

    try {
      updateStoreInfo({
        businessName: name,
        tagline,
        address,
        landmark,
        city,
        workingHours,
        phoneNumbers: [phone1, phone2].filter(Boolean),
        email: email || undefined,
        telegramUsername,
        telegramChannel,
        instagramUsername,
        googleMapsUrl: googleMapsUrl || undefined,
        yandexMapsUrl: yandexMapsUrl || undefined,
        coordinates: {
          lat: parseFloat(latitude) || 40.1158,
          lng: parseFloat(longitude) || 67.8422,
        },
        logoUrl: logoUrl || undefined,
        faviconUrl: faviconUrl || undefined,
        primaryColor,
        businessCategory: businessCategory || undefined,
        language,
        defaultSeoTitle: defaultSeoTitle || undefined,
        defaultSeoDescription: defaultSeoDescription || undefined,
        defaultSeoKeywords: defaultSeoKeywords || undefined,
        ogImageUrl: ogImageUrl || undefined,
        twitterImageUrl: twitterImageUrl || undefined,
        shortName: shortName || undefined,
        secondaryColor: secondaryColor || undefined,
        accentColor: accentColor || undefined,
        heroTitle: heroTitle || undefined,
        heroSubtitle: heroSubtitle || undefined,
        aboutText: aboutText || undefined,
        mission: mission || undefined,
        vision: vision || undefined,
        adminEmail: adminEmail || undefined,
        copyright: copyright || undefined,
        footerText: footerText || undefined,
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err) {
      console.error('Failed to save store info:', err);
      setErrorMessage(err instanceof Error ? err.message : 'Saqlashda xatolik yuz berdi');
    } finally {
      setIsSaving(false);
    }
  }, [name, tagline, address, landmark, city, workingHours, phone1, phone2, email, telegramUsername, telegramChannel, instagramUsername, googleMapsUrl, yandexMapsUrl, latitude, longitude, logoUrl, faviconUrl, primaryColor, businessCategory, language, defaultSeoTitle, defaultSeoDescription, defaultSeoKeywords, ogImageUrl, twitterImageUrl, shortName, secondaryColor, accentColor, heroTitle, heroSubtitle, aboutText, mission, vision, adminEmail, copyright, footerText, updateStoreInfo, validateForm]);

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-20 bg-muted/90 bg-card/90 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-foreground tracking-tight">
            Do'kon Ma'lumotlari va Aloqa
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Do'kon nomi, telefonlari, manzili va ijtimoiy tarmoqlarini yangilang
          </p>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-background text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin stroke-[3]" />
              <span>Saqlanmoqda...</span>
            </>
          ) : savedSuccess ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>Saqlandi!</span>
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              <span>Ma'lumotlarni saqlash</span>
            </>
          )}
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2" role="alert">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      {/* Brand preview */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs">
        <h3 className="text-sm font-extrabold uppercase tracking-wider flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-amber-500" /><span>Brend ko‘rinishi (jonli)</span>
        </h3>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 rounded-2xl border border-border overflow-hidden">
          <div className="flex items-center gap-3 p-4 flex-1 min-w-0" style={{ background: `linear-gradient(135deg, ${primaryColor}14, ${accentColor}14)` }}>
            {logoUrl ? (
              <img src={logoUrl} alt={name || 'Logo'} className="w-12 h-12 rounded-xl object-cover border border-border bg-white" referrerPolicy="no-referrer" />
            ) : (
              <span className="w-12 h-12 rounded-xl text-white font-black text-lg flex items-center justify-center" style={{ background: primaryColor }}>{(name || 'D').charAt(0).toUpperCase()}</span>
            )}
            <div className="min-w-0">
              <p className="text-sm font-black truncate">{name || 'Do‘kon nomi'}</p>
              <p className="text-[11px] text-muted-foreground truncate">{tagline || 'Shior kiritilmagan'}</p>
              <div className="flex gap-1.5 mt-1.5">
                <span className="w-5 h-5 rounded-md border border-border" style={{ background: primaryColor }} title="Asosiy rang" />
                <span className="w-5 h-5 rounded-md border border-border" style={{ background: secondaryColor }} title="Ikkinchi rang" />
                <span className="w-5 h-5 rounded-md border border-border" style={{ background: accentColor }} title="Aksent rang" />
              </div>
            </div>
          </div>
          <div className="p-4 sm:w-64 shrink-0 space-y-1.5 border-t sm:border-t-0 sm:border-l border-border">
            <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">SEO ko‘rinishi</p>
            <p className="text-xs font-bold text-blue-700 dark:text-blue-400 truncate">{defaultSeoTitle || name || 'Sayt sarlavhasi'}</p>
            <p className="text-[11px] text-muted-foreground line-clamp-2">{defaultSeoDescription || aboutText || 'Sayt tavsifi kiritilmagan'}</p>
            {(googleMapsUrl || yandexMapsUrl) && (
              <div className="flex gap-2 pt-1">
                {googleMapsUrl && <a href={googleMapsUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-primary hover:underline">Google Maps ↗</a>}
                {yandexMapsUrl && <a href={yandexMapsUrl} target="_blank" rel="noreferrer" className="text-[11px] font-bold text-primary hover:underline">Yandex Maps ↗</a>}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Info */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-500" />
          <span>Umumiy Do'kon Tafsilotlari</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Do'kon Nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground font-bold ${fieldErrors.name ? 'border-destructive' : ''}`}
              aria-invalid={!!fieldErrors.name}
              aria-describedby={fieldErrors.name ? 'name-error' : undefined}
            />
            {fieldErrors.name && <p id="name-error" className="text-[10px] text-destructive mt-1" role="alert">{fieldErrors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Shior / Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Zamonaviy kiyimlar va poyabzallar do'koni"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Ish Vaqti
            </label>
            <input
              type="text"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              placeholder="Har kuni: 09:00 - 21:00"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Shahar
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Shahringiz"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Contact Channels */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Phone className="w-4 h-4 text-amber-500" />
          <span>Telefon Raqamlari va Ijtimoiy Tarmoqlar</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Asosiy Telefon Raqami <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={phone1}
              onChange={(e) => setPhone1(e.target.value)}
              placeholder="+998 90 123 45 67"
              className={`w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-muted border border-border text-foreground ${fieldErrors.phone1 ? 'border-destructive' : ''}`}
              aria-invalid={!!fieldErrors.phone1}
              aria-describedby={fieldErrors.phone1 ? 'phone1-error' : undefined}
            />
            {fieldErrors.phone1 && <p id="phone1-error" className="text-[10px] text-destructive mt-1" role="alert">{fieldErrors.phone1}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Qo'shimcha Telefon Raqami
            </label>
            <input
              type="text"
              value={phone2}
              onChange={(e) => setPhone2(e.target.value)}
              placeholder="+998 91 987 65 43"
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-muted border border-border text-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Elektron Pochta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@do-konim.uz"
              className={`w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground ${fieldErrors.email ? 'border-destructive' : ''}`}
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
            />
            {fieldErrors.email && <p id="email-error" className="text-[10px] text-destructive mt-1" role="alert">{fieldErrors.email}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Telegram Administrator (Username)
            </label>
            <input
              type="text"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              placeholder="do_konim_admin"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Telegram Kanal
            </label>
            <input
              type="text"
              value={telegramChannel}
              onChange={(e) => setTelegramChannel(e.target.value)}
              placeholder="do_konim_kanal"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Instagram Username
            </label>
            <input
              type="text"
              value={instagramUsername}
              onChange={(e) => setInstagramUsername(e.target.value)}
              placeholder="do_konim.uz"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            />
          </div>
        </div>
      </div>

      {/* Address and Map Coordinates */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-500" />
          <span>Manzil va Xaritalar (Geolokatsiya)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              To'liq Manzil
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Sharof Rashidov shoh ko'chasi, 45-uy"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Mo'ljal (Landmark)
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Markaziy dehqon bozori ro'parasida"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Google Maps Havolasi
            </label>
            <input
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              className={`w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-muted border border-border text-foreground ${fieldErrors.googleMapsUrl ? 'border-destructive' : ''}`}
              aria-invalid={!!fieldErrors.googleMapsUrl}
              aria-describedby={fieldErrors.googleMapsUrl ? 'googleMapsUrl-error' : undefined}
            />
            {fieldErrors.googleMapsUrl && <p id="googleMapsUrl-error" className="text-[10px] text-destructive mt-1" role="alert">{fieldErrors.googleMapsUrl}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Yandex Maps Havolasi
            </label>
            <input
              type="url"
              value={yandexMapsUrl}
              onChange={(e) => setYandexMapsUrl(e.target.value)}
              placeholder="https://yandex.uz/maps/..."
              className={`w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-muted border border-border text-foreground ${fieldErrors.yandexMapsUrl ? 'border-destructive' : ''}`}
              aria-invalid={!!fieldErrors.yandexMapsUrl}
              aria-describedby={fieldErrors.yandexMapsUrl ? 'yandexMapsUrl-error' : undefined}
            />
            {fieldErrors.yandexMapsUrl && <p id="yandexMapsUrl-error" className="text-[10px] text-destructive mt-1" role="alert">{fieldErrors.yandexMapsUrl}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Kenglik (Latitude)
            </label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="40.1158"
              className={`w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-muted border border-border text-foreground ${fieldErrors.latitude ? 'border-destructive' : ''}`}
              aria-invalid={!!fieldErrors.latitude}
              aria-describedby={fieldErrors.latitude ? 'latitude-error' : undefined}
            />
            {fieldErrors.latitude && <p id="latitude-error" className="text-[10px] text-destructive mt-1" role="alert">{fieldErrors.latitude}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Uzunlik (Longitude)
            </label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="67.8422"
              className={`w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-muted border border-border text-foreground ${fieldErrors.longitude ? 'border-destructive' : ''}`}
              aria-invalid={!!fieldErrors.longitude}
              aria-describedby={fieldErrors.longitude ? 'longitude-error' : undefined}
            />
            {fieldErrors.longitude && <p id="longitude-error" className="text-[10px] text-destructive mt-1" role="alert">{fieldErrors.longitude}</p>}
          </div>
        </div>
      </div>

      {/* Brand Identity */}
      <div className="p-6 sm:p-8 rounded-3xl bg-card border border-border shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-foreground uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-500" />
          <span>Brend Identiteti va SEO</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Logo URL (Rasm havolasi)
            </label>
            <SingleImageUpload
              label="Logo rasmi"
              value={logoUrl || undefined}
              onChange={(url) => setLogoUrl(url || '')}
              bucket={MEDIA_BUCKETS.STORE_ASSETS}
              scope="store/logo"
            />
            {fieldErrors.logoUrl && <p className="text-[10px] text-destructive mt-1" role="alert">{fieldErrors.logoUrl}</p>}
            <p className="text-[10px] text-muted-foreground mt-1">
              Agar bo'sh bo'lsa, do'kon nomining bosh harfi (monogramma) ko'rsatiladi.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Favicon URL
            </label>
            <SingleImageUpload
              label="Favicon rasmi"
              value={faviconUrl || undefined}
              onChange={(url) => setFaviconUrl(url || '')}
              bucket={MEDIA_BUCKETS.STORE_ASSETS}
              scope="store/favicon"
            />
            {fieldErrors.faviconUrl && <p className="text-[10px] text-destructive mt-1" role="alert">{fieldErrors.faviconUrl}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Asosiy Rang (Accent)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-9 rounded-lg border border-border bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#0f172a"
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-muted border border-border text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Ikkinchi Rang (Secondary)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-10 h-9 rounded-lg border border-border bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                placeholder="#334155"
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-muted border border-border text-foreground"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Aksent Rang (CTA)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-9 rounded-lg border border-border bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                placeholder="#f59e0b"
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-muted border border-border text-foreground"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Savdo Sohasi
            </label>
            <input
              type="text"
              value={businessCategory}
              onChange={(e) => setBusinessCategory(e.target.value)}
              placeholder="Kiyim-kechak, poyabzal"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Til
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            >
              <option value="uz">O'zbekcha (uz)</option>
              <option value="ru">Русский (ru)</option>
              <option value="en">English (en)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Qisqa Nomi (Logo alt)
            </label>
            <input
              type="text"
              value={shortName}
              onChange={(e) => setShortName(e.target.value)}
              placeholder="Do'kon"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Administrator E-pochtasi
            </label>
            <input
              type="email"
              value={adminEmail}
              onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@dokon.uz"
              className={`w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-muted border border-border text-foreground ${fieldErrors.adminEmail ? 'border-destructive' : ''}`}
              aria-invalid={!!fieldErrors.adminEmail}
              aria-describedby={fieldErrors.adminEmail ? 'adminEmail-error' : undefined}
            />
            {fieldErrors.adminEmail && <p id="adminEmail-error" className="text-[10px] text-destructive mt-1" role="alert">{fieldErrors.adminEmail}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              SEO: Standart Sarlavha (Title)
            </label>
            <input
              type="text"
              value={defaultSeoTitle}
              onChange={(e) => setDefaultSeoTitle(e.target.value)}
              placeholder="Do'kon nomi — eng yaxshi mahsulotlar"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              SEO: Standart Tavsif (Description)
            </label>
            <input
              type="text"
              value={defaultSeoDescription}
              onChange={(e) => setDefaultSeoDescription(e.target.value)}
              placeholder="Do'konimizda sifatli mahsulotlar..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-foreground mb-1">
            SEO: Open Graph Rasm (ijtimoiy tarmoqlarda)
          </label>
          <SingleImageUpload
            label="OG rasm"
            value={ogImageUrl || undefined}
            onChange={(url) => setOgImageUrl(url || '')}
            bucket={MEDIA_BUCKETS.STORE_ASSETS}
            scope="store/og-image"
          />
          {fieldErrors.ogImageUrl && <p className="text-[10px] text-destructive mt-1" role="alert">{fieldErrors.ogImageUrl}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              SEO: Kalit So'zlar (Keywords)
            </label>
            <input
              type="text"
              value={defaultSeoKeywords}
              onChange={(e) => setDefaultSeoKeywords(e.target.value)}
              placeholder="kiyim, poyabzal, konsept do'kon"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              SEO: Twitter/X Rasm
            </label>
            <SingleImageUpload
              label="Twitter rasm"
              value={twitterImageUrl || undefined}
              onChange={(url) => setTwitterImageUrl(url || '')}
              bucket={MEDIA_BUCKETS.STORE_ASSETS}
              scope="store/twitter-image"
            />
            {fieldErrors.twitterImageUrl && <p className="text-[10px] text-destructive mt-1" role="alert">{fieldErrors.twitterImageUrl}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Bosh Sahifa Sarlavhasi (Hero)
            </label>
            <input
              type="text"
              value={heroTitle}
              onChange={(e) => setHeroTitle(e.target.value)}
              placeholder="Premium kiyimlar va poyabzallar"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Bosh Sahifa Kichik Matni (Hero)
            </label>
            <input
              type="text"
              value={heroSubtitle}
              onChange={(e) => setHeroSubtitle(e.target.value)}
              placeholder="2026 Ochirg'i eng yangi kolleksiyalari"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-foreground mb-1">
            Kompaniya Haqida Matn (About)
          </label>
          <textarea
            value={aboutText}
            onChange={(e) => setAboutText(e.target.value)}
            rows={3}
            placeholder="Biz haqimizda qisqacha ma'lumot..."
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground resize-y"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Missiya
            </label>
            <textarea
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              rows={2}
              placeholder="Bizning missiyamiz..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground resize-y"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Vizyon
            </label>
            <textarea
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              rows={2}
              placeholder="Bizning vizyonimiz..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground resize-y"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Copyright Matni (footer)
            </label>
            <input
              type="text"
              value={copyright}
              onChange={(e) => setCopyright(e.target.value)}
              placeholder="© 2026 Do'kon. Barcha huquqlar himoyalangan."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Footer Qo'shimcha Matn
            </label>
            <input
              type="text"
              value={footerText}
              onChange={(e) => setFooterText(e.target.value)}
              placeholder="20 yildan ortiq tajriba"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground"
            />
          </div>
        </div>
      </div>
    </form>
  );
};

export default StoreAdminPage;