import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Store,
  Palette,
  Phone,
  MapPin,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Rocket,
  Image as ImageIcon,
  Sparkles,
  ArrowRight,
  Target,
  X,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useVideoFeed } from '../../context/VideoContext';
import { SingleImageUpload } from '../../components/admin/SingleImageUpload';
import { MEDIA_BUCKETS } from '../../lib/supabase/storage';
import { track } from '../../lib/analytics/client';
import {
  computeStoreReadiness,
  topReadinessTasks,
  setOnboardingCompleted,
} from '../../lib/admin/readiness';
import { useI18n } from '../../i18n/I18nContext';

const STEPS = ['identity', 'brand', 'contact', 'location'] as const;
type StepId = (typeof STEPS)[number];

const STEP_ICONS: Record<StepId, React.ComponentType<{ className?: string }>> = {
  identity: Store,
  brand: Palette,
  contact: Phone,
  location: MapPin,
};

export const OnboardingPage: React.FC = () => {
  const { t } = useI18n();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const {
    products,
    categories,
    storeInfo,
    homepageCms,
    homepageSlides,
    updateStoreInfo,
  } = useStore();
  const { videos } = useVideoFeed();

  const stepFromUrl = Number(searchParams.get('step') || 1);
  const [stepIndex, setStepIndex] = useState<number>(() =>
    Math.max(0, Math.min(STEPS.length - 1, (Number.isFinite(stepFromUrl) ? stepFromUrl : 1) - 1))
  );
  const [finished, setFinished] = useState(searchParams.get('done') === '1');

  // --- Local form state (seeded from storeInfo) ---
  const [name, setName] = useState(storeInfo.businessName || '');
  const [tagline, setTagline] = useState(storeInfo.tagline || '');
  const [city, setCity] = useState(storeInfo.city || '');
  const [workingHours, setWorkingHours] = useState(storeInfo.workingHours || '');
  const [businessCategory, setBusinessCategory] = useState(storeInfo.businessCategory || '');

  const [logoUrl, setLogoUrl] = useState(storeInfo.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(storeInfo.primaryColor || '#0f172a');

  const [phone, setPhone] = useState(storeInfo.phoneNumbers?.[0] || storeInfo.phone || '');
  const [secondPhone, setSecondPhone] = useState(storeInfo.phoneNumbers?.[1] || '');
  const [telegramUsername, setTelegramUsername] = useState(storeInfo.telegramUsername || '');
  const [instagramUsername, setInstagramUsername] = useState(storeInfo.instagramUsername || '');

  const [address, setAddress] = useState(storeInfo.address || '');
  const [landmark, setLandmark] = useState(storeInfo.landmark || '');
  const [googleMapsUrl, setGoogleMapsUrl] = useState(storeInfo.googleMapsUrl || '');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [started, setStarted] = useState(false);

  const stepId: StepId = STEPS[stepIndex];

  useEffect(() => {
    if (started) return;
    setStarted(true);
    track('onboarding_started', { metadata: { step: stepId } });
  }, [started, stepId]);

  const readiness = useMemo(
    () =>
      computeStoreReadiness({
        products,
        categories,
        storeInfo,
        homepageCms,
        homepageSlides,
        videos,
      }),
    [products, categories, storeInfo, homepageCms, homepageSlides, videos]
  );

  useEffect(() => {
    if (finished && readiness.score === 100) {
      setOnboardingCompleted(true);
      track('store_completed', { metadata: { score: readiness.score } });
    }
  }, [finished, readiness.score]);

  const goToStep = (index: number) => {
    const clamped = Math.max(0, Math.min(STEPS.length - 1, index));
    setStepIndex(clamped);
    setSearchParams({ step: String(clamped + 1) }, { replace: true });
  };

  const validateStep = (id: StepId): boolean => {
    const errors: Record<string, string> = {};
    if (id === 'identity' && !name.trim()) errors.name = t('onboarding', 'requiredName');
    if (id === 'contact' && !phone.trim()) errors.phone = t('onboarding', 'requiredPhone');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const persistCurrentStep = () => {
    updateStoreInfo({
      businessName: name.trim() || storeInfo.businessName,
      tagline: tagline.trim() || undefined,
      city: city.trim() || undefined,
      workingHours: workingHours.trim() || undefined,
      businessCategory: businessCategory.trim() || undefined,
      logoUrl: logoUrl || undefined,
      primaryColor,
      phoneNumbers: [phone, secondPhone].filter(Boolean),
      email: storeInfo.email,
      telegramUsername: telegramUsername.trim() || undefined,
      instagramUsername: instagramUsername.trim() || undefined,
      address: address.trim() || undefined,
      landmark: landmark.trim() || undefined,
      googleMapsUrl: googleMapsUrl.trim() || undefined,
    });
  };

  const handleNext = () => {
    if (!validateStep(stepId)) return;
    setSaving(true);
    persistCurrentStep();
    // Defer so the store update flushes before the next panel reads readiness.
    setTimeout(() => {
      setSaving(false);
      if (stepIndex < STEPS.length - 1) {
        goToStep(stepIndex + 1);
      } else {
        track('onboarding_completed');
        if (readiness.score === 100) {
          setOnboardingCompleted(true);
          track('store_completed', { metadata: { score: readiness.score } });
        }
        setFinished(true);
      }
    }, 60);
  };

  const tasks = useMemo(() => topReadinessTasks(readiness, 4), [readiness]);

  const totalSteps = STEPS.length;
  const currentStepNumber = stepIndex + 1;

  return (
    <div className="space-y-6 max-w-3xl mx-auto pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-foreground tracking-tight flex items-center gap-2">
            <Rocket className="w-5 h-5 text-amber-500" />
            {t('onboarding', 'title')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t('onboarding', 'subtitle')}
          </p>
        </div>
        <Link
          to="/admin"
          className="px-3.5 py-2 rounded-lg bg-muted text-foreground text-xs font-semibold hover:bg-muted/80 border border-border inline-flex items-center gap-1.5 self-start sm:self-auto"
        >
          <X className="w-3.5 h-3.5" />
          {t('onboarding', 'skip')}
        </Link>
      </div>

      {finished ? (
        <FinishedPanel
          readiness={readiness}
          tasks={tasks}
          onRestart={() => {
            setFinished(false);
            goToStep(0);
          }}
        />
      ) : (
        <>
          {/* Progress */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              {STEPS.map((id, i) => {
                const Icon = STEP_ICONS[id];
                const active = i === stepIndex;
                const done = i < stepIndex;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => goToStep(i)}
                    className="flex-1 flex flex-col items-center gap-1 group"
                    aria-current={active}
                  >
                    <span
                      className={`w-full h-1.5 rounded-full transition-colors ${
                        done || active ? 'bg-amber-500' : 'bg-muted'
                      }`}
                    />
                    <span className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-amber-500 text-background shadow-md scale-105' : done ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
                      {done ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                    </span>
                    <span className={`text-[10px] font-semibold ${active ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {t('onboarding', id)}
                    </span>
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-muted-foreground text-center sm:text-left">
              {currentStepNumber} / {totalSteps} — {t('onboarding', 'stepHint')}
            </p>
          </div>

          {/* Step body */}
          <div className="rounded-3xl bg-card border border-border shadow-xs p-6 sm:p-8">
            {stepId === 'identity' && (
              <IdentityStep
                name={name}
                setName={setName}
                tagline={tagline}
                setTagline={setTagline}
                city={city}
                setCity={setCity}
                workingHours={workingHours}
                setWorkingHours={setWorkingHours}
                businessCategory={businessCategory}
                setBusinessCategory={setBusinessCategory}
                errors={fieldErrors}
                t={t}
              />
            )}
            {stepId === 'brand' && (
              <BrandStep
                logoUrl={logoUrl}
                setLogoUrl={setLogoUrl}
                primaryColor={primaryColor}
                setPrimaryColor={setPrimaryColor}
                name={name || storeInfo.businessName}
                t={t}
              />
            )}
            {stepId === 'contact' && (
              <ContactStep
                phone={phone}
                setPhone={setPhone}
                secondPhone={secondPhone}
                setSecondPhone={setSecondPhone}
                telegramUsername={telegramUsername}
                setTelegramUsername={setTelegramUsername}
                instagramUsername={instagramUsername}
                setInstagramUsername={setInstagramUsername}
                errors={fieldErrors}
                t={t}
              />
            )}
            {stepId === 'location' && (
              <LocationStep
                address={address}
                setAddress={setAddress}
                landmark={landmark}
                setLandmark={setLandmark}
                googleMapsUrl={googleMapsUrl}
                setGoogleMapsUrl={setGoogleMapsUrl}
                t={t}
              />
            )}
          </div>

          {/* Footer actions */}
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => (stepIndex === 0 ? navigate('/admin') : goToStep(stepIndex - 1))}
              disabled={saving}
              className="px-4 py-2.5 rounded-xl bg-muted text-foreground text-xs font-bold hover:bg-muted/80 border border-border inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <ChevronLeft className="w-4 h-4" />
              {t('onboarding', 'back')}
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={saving}
              className={`px-5 py-2.5 rounded-xl text-background text-xs font-black shadow-md transition-all active:scale-95 inline-flex items-center gap-1.5 disabled:opacity-50 ${stepIndex === STEPS.length - 1 ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-500 hover:bg-amber-400'}`}
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t('onboarding', 'saving')}
                </>
              ) : stepIndex === STEPS.length - 1 ? (
                <>
                  {t('onboarding', 'finish')}
                  <CheckCircle2 className="w-4 h-4" />
                </>
              ) : (
                <>
                  {t('onboarding', 'continue')}
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

function ReadyRing({ score, label }: { score: number; label: string }) {
  const r = 30;
  const c = 2 * Math.PI * r;
  const off = c - (score / 100) * c;
  return (
    <div className="relative w-24 h-24">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90" role="img" aria-label={label}>
        <circle cx="40" cy="40" r={r} fill="none" strokeWidth="8" className="stroke-muted" />
        <circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          className={score >= 80 ? 'stroke-emerald-500' : score >= 50 ? 'stroke-amber-500' : 'stroke-red-500'}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-black">{score}%</span>
    </div>
  );
}

function FinishedPanel({
  readiness,
  tasks,
  onRestart,
}: {
  readiness: { score: number; done: number; total: number };
  tasks: Array<{ key: string; label: string; suggestion: string; href: string }>;
  onRestart: () => void;
}) {
  const { t } = useI18n();
  return (
    <div className="rounded-3xl bg-card border border-border shadow-xs p-8 text-center">
      <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center mb-4">
        <Sparkles className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-black">{t('onboarding', 'doneTitle')}</h2>
      <p className="text-sm text-muted-foreground mt-1 max-w-md mx-auto">{t('onboarding', 'doneDesc')}</p>

      <div className="mt-6 flex items-center justify-center gap-4">
        <ReadyRing score={readiness.score} label={`${readiness.score}%`} />
        <div className="text-left">
          <p className="text-xs font-bold">{readiness.done}/{readiness.total} {t('onboarding', 'itemsDone')}</p>
          {readiness.score === 100 ? (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">✓ {t('onboarding', 'fullyReady')}</p>
          ) : (
            <p className="text-[11px] text-muted-foreground mt-1">{t('onboarding', 'stillIncomplete')}</p>
          )}
        </div>
      </div>

      {tasks.length > 0 ? (
        <div className="mt-6 text-left rounded-2xl bg-muted/40 border border-border/60 p-4">
          <p className="text-xs font-bold flex items-center gap-1.5 mb-2.5">
            <Target className="w-3.5 h-3.5 text-amber-500" />
            {t('onboarding', 'nextSteps')}
          </p>
          <ul className="space-y-1.5">
            {tasks.map((task) => (
              <li key={task.key}>
                <Link to={task.href} className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 group">
                  <ArrowRight className="w-3 h-3 text-amber-500 group-hover:translate-x-0.5 transition-transform" />
                  {task.suggestion}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
        <Link to="/admin/products/new" className="px-5 py-2.5 rounded-xl bg-foreground text-background text-xs font-black hover:bg-foreground/90 inline-flex items-center gap-1.5">
          <ImageIcon className="w-4 h-4" />
          {t('onboarding', 'addProductCta')}
        </Link>
        <Link to="/admin" className="px-5 py-2.5 rounded-xl bg-muted text-foreground text-xs font-bold hover:bg-muted/80 border border-border">
          {t('onboarding', 'goDashboard')}
        </Link>
      </div>

      <button type="button" onClick={onRestart} className="mt-4 text-[11px] text-muted-foreground hover:text-foreground underline underline-offset-2">
        {t('onboarding', 'restart')}
      </button>
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-foreground mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-[10px] text-destructive mt-1" role="alert">{error}</p>}
    </div>
  );
}

const inputCls = (error?: string) =>
  `w-full px-3.5 py-2 text-xs rounded-xl bg-muted border border-border text-foreground font-medium focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-ring ${error ? 'border-destructive' : ''}`;

function IdentityStep({ name, setName, tagline, setTagline, city, setCity, workingHours, setWorkingHours, businessCategory, setBusinessCategory, errors, t }: any) {
  return (
    <div className="space-y-4">
      <StepTitle icon={Store} titleKey="identityTitle" descKey="identityDesc" t={t} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t('onboarding', 'nameLabel')} required error={errors.name}>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Do'konim" className={inputCls(errors.name)} />
        </Field>
        <Field label={t('onboarding', 'cityLabel')}>
          <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder={t('onboarding', 'cityPlaceholder')} className={inputCls()} />
        </Field>
      </div>
      <Field label={t('onboarding', 'taglineLabel')}>
        <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder={t('onboarding', 'taglinePlaceholder')} className={inputCls()} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t('onboarding', 'hoursLabel')}>
          <input type="text" value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} placeholder={t('onboarding', 'hoursPlaceholder')} className={inputCls()} />
        </Field>
        <Field label={t('onboarding', 'categoryLabel')}>
          <input type="text" value={businessCategory} onChange={(e) => setBusinessCategory(e.target.value)} placeholder={t('onboarding', 'categoryPlaceholder')} className={inputCls()} />
        </Field>
      </div>
    </div>
  );
}

function BrandStep({ logoUrl, setLogoUrl, primaryColor, setPrimaryColor, name, t }: any) {
  return (
    <div className="space-y-4">
      <StepTitle icon={Palette} titleKey="brandTitle" descKey="brandDesc" t={t} />
      <div className="flex flex-col sm:flex-row items-start gap-4 rounded-2xl border border-border p-4 bg-muted/30">
        {logoUrl ? (
          <img src={logoUrl} alt={name || 'Logo'} className="w-14 h-14 rounded-xl object-cover border border-border bg-white" referrerPolicy="no-referrer" />
        ) : (
          <span className="w-14 h-14 rounded-xl text-white font-black text-lg flex items-center justify-center shrink-0" style={{ background: primaryColor }}>
            {(name || 'D').charAt(0).toUpperCase()}
          </span>
        )}
        <div className="flex-1 w-full">
          <SingleImageUpload
            label={t('onboarding', 'logoLabel')}
            value={logoUrl || undefined}
            onChange={(url) => setLogoUrl(url || '')}
            bucket={MEDIA_BUCKETS.STORE_ASSETS}
            scope="store/logo"
          />
          <p className="text-[10px] text-muted-foreground mt-1">{t('onboarding', 'logoHint')}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t('onboarding', 'colorLabel')}>
          <div className="flex items-center gap-2">
            <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-9 rounded-lg border border-border bg-transparent cursor-pointer" />
            <input type="text" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className={inputCls()} />
          </div>
        </Field>
      </div>
    </div>
  );
}

function ContactStep({ phone, setPhone, secondPhone, setSecondPhone, telegramUsername, setTelegramUsername, instagramUsername, setInstagramUsername, errors, t }: any) {
  return (
    <div className="space-y-4">
      <StepTitle icon={Phone} titleKey="contactTitle" descKey="contactDesc" t={t} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t('onboarding', 'phoneLabel')} required error={errors.phone}>
          <input type="text" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+998 90 123 45 67" className={inputCls(errors.phone)} />
        </Field>
        <Field label={t('onboarding', 'phone2Label')}>
          <input type="text" value={secondPhone} onChange={(e) => setSecondPhone(e.target.value)} placeholder="+998 91 987 65 43" className={inputCls()} />
        </Field>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t('onboarding', 'telegramLabel')}>
          <input type="text" value={telegramUsername} onChange={(e) => setTelegramUsername(e.target.value)} placeholder="do_konim_admin" className={inputCls()} />
        </Field>
        <Field label={t('onboarding', 'instagramLabel')}>
          <input type="text" value={instagramUsername} onChange={(e) => setInstagramUsername(e.target.value)} placeholder="do_konim.uz" className={inputCls()} />
        </Field>
      </div>
    </div>
  );
}

function LocationStep({ address, setAddress, landmark, setLandmark, googleMapsUrl, setGoogleMapsUrl, t }: any) {
  return (
    <div className="space-y-4">
      <StepTitle icon={MapPin} titleKey="locationTitle" descKey="locationDesc" t={t} />
      <Field label={t('onboarding', 'addressLabel')}>
        <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('onboarding', 'addressPlaceholder')} className={inputCls()} />
      </Field>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label={t('onboarding', 'landmarkLabel')}>
          <input type="text" value={landmark} onChange={(e) => setLandmark(e.target.value)} placeholder={t('onboarding', 'landmarkPlaceholder')} className={inputCls()} />
        </Field>
        <Field label={t('onboarding', 'mapsLabel')}>
          <input type="url" value={googleMapsUrl} onChange={(e) => setGoogleMapsUrl(e.target.value)} placeholder="https://maps.google.com/..." className={inputCls()} />
        </Field>
      </div>
    </div>
  );
}

function StepTitle({ icon: Icon, titleKey, descKey, t }: { icon: React.ComponentType<{ className?: string }>; titleKey: string; descKey: string; t: any }) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </span>
      <div>
        <h3 className="text-sm font-extrabold text-foreground">{t('onboarding', titleKey)}</h3>
        <p className="text-xs text-muted-foreground mt-0.5">{t('onboarding', descKey)}</p>
      </div>
    </div>
  );
}

export default OnboardingPage;