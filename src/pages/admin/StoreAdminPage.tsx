import React, { useState } from 'react';
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
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

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
  const [ogImageUrl, setOgImageUrl] = useState(storeInfo.ogImageUrl || '');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
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
      googleMapsUrl,
      yandexMapsUrl,
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
      ogImageUrl: ogImageUrl || undefined,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <form onSubmit={handleSave} className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-16 z-20 bg-neutral-100/90 dark:bg-neutral-950/90 backdrop-blur-md py-3 -mx-4 px-4 sm:-mx-6 sm:px-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
            Do'kon Ma'lumotlari va Aloqa
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Do'kon nomi, telefonlari, manzili va ijtimoiy tarmoqlarini yangilang
          </p>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black shadow-md transition-all active:scale-95 flex items-center gap-2 self-start sm:self-auto"
        >
          {savedSuccess ? (
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

      {/* Main Info */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Store className="w-4 h-4 text-amber-500" />
          <span>Umumiy Do'kon Tafsilotlari</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Do'kon Nomi <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Shior / Tagline
            </label>
            <input
              type="text"
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="Zamonaviy kiyimlar va poyabzallar do'koni"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Ish Vaqti
            </label>
            <input
              type="text"
              value={workingHours}
              onChange={(e) => setWorkingHours(e.target.value)}
              placeholder="Har kuni: 09:00 - 21:00"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Shahar
            </label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Shahringiz"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Contact Channels */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Phone className="w-4 h-4 text-amber-500" />
          <span>Telefon Raqamlari va Ijtimoiy Tarmoqlar</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Asosiy Telefon Raqami
            </label>
            <input
              type="text"
              value={phone1}
              onChange={(e) => setPhone1(e.target.value)}
              placeholder="+998 90 123 45 67"
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Qo'shimcha Telefon Raqami
            </label>
            <input
              type="text"
              value={phone2}
              onChange={(e) => setPhone2(e.target.value)}
              placeholder="+998 91 987 65 43"
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Elektron Pochta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="info@do-konim.uz"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Telegram Administrator (Username)
            </label>
            <input
              type="text"
              value={telegramUsername}
              onChange={(e) => setTelegramUsername(e.target.value)}
              placeholder="do_konim_admin"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Telegram Kanal
            </label>
            <input
              type="text"
              value={telegramChannel}
              onChange={(e) => setTelegramChannel(e.target.value)}
              placeholder="do_konim_kanal"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Instagram Username
            </label>
            <input
              type="text"
              value={instagramUsername}
              onChange={(e) => setInstagramUsername(e.target.value)}
              placeholder="do_konim.uz"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Address and Map Coordinates */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-500" />
          <span>Manzil va Xaritalar (Geolokatsiya)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              To'liq Manzil
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Sharof Rashidov shoh ko'chasi, 45-uy"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Mo'ljal (Landmark)
            </label>
            <input
              type="text"
              value={landmark}
              onChange={(e) => setLandmark(e.target.value)}
              placeholder="Markaziy dehqon bozori ro'parasida"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Google Maps Havolasi
            </label>
            <input
              type="url"
              value={googleMapsUrl}
              onChange={(e) => setGoogleMapsUrl(e.target.value)}
              placeholder="https://maps.google.com/..."
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Yandex Maps Havolasi
            </label>
            <input
              type="url"
              value={yandexMapsUrl}
              onChange={(e) => setYandexMapsUrl(e.target.value)}
              placeholder="https://yandex.uz/maps/..."
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Kenglik (Latitude)
            </label>
            <input
              type="text"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="40.1158"
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Uzunlik (Longitude)
            </label>
            <input
              type="text"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="67.8422"
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Brand Identity */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-500" />
          <span>Brend Identiteti va SEO</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Logo URL (Rasm havolasi)
            </label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://.../logo.png"
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
            <p className="text-[10px] text-neutral-500 dark:text-neutral-400 mt-1">
              Agar bo'sh bo'lsa, do'kon nomining bosh harfi (monogramma) ko'rsatiladi.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" /> Favicon URL
            </label>
            <input
              type="url"
              value={faviconUrl}
              onChange={(e) => setFaviconUrl(e.target.value)}
              placeholder="https://.../favicon.ico"
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Asosiy Rang (Accent)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-10 h-9 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-transparent cursor-pointer"
              />
              <input
                type="text"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                placeholder="#0f172a"
                className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Savdo Sohasi
            </label>
            <input
              type="text"
              value={businessCategory}
              onChange={(e) => setBusinessCategory(e.target.value)}
              placeholder="Kiyim-kechak, poyabzal"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Til
            </label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            >
              <option value="uz">O'zbekcha (uz)</option>
              <option value="ru">Русский (ru)</option>
              <option value="en">English (en)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              SEO: Standart Sarlavha (Title)
            </label>
            <input
              type="text"
              value={defaultSeoTitle}
              onChange={(e) => setDefaultSeoTitle(e.target.value)}
              placeholder="Do'kon nomi — eng yaxshi mahsulotlar"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              SEO: Standart Tavsif (Description)
            </label>
            <input
              type="text"
              value={defaultSeoDescription}
              onChange={(e) => setDefaultSeoDescription(e.target.value)}
              placeholder="Do'konimizda sifatli mahsulotlar..."
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
            SEO: Open Graph Rasm (ijtimoiy tarmoqlarda)
          </label>
          <input
            type="url"
            value={ogImageUrl}
            onChange={(e) => setOgImageUrl(e.target.value)}
            placeholder="https://.../og-cover.jpg"
            className="w-full px-3.5 py-2 text-xs font-mono rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
          />
        </div>
      </div>
    </form>
  );
};
