import React, { useState } from 'react';
import { Store, QrCode, ScanLine, KeyRound, ArrowRight, Info, PackageOpen } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { decodeSessionFromQR } from '../../types/buySession';

type Stage = 'empty' | 'input' | 'scanned';

const PASSCODE_RE = /^[A-HJ-KM-NP-Z2-9]{6,8}$/;

export const InStoreSaleAdminPage: React.FC = () => {
  const { storeInfo } = useStore();
  const [passcode, setPasscode] = useState('');
  const [stage, setStage] = useState<Stage>('empty');
  const [notice, setNotice] = useState<string | null>(null);
  const [decoded, setDecoded] = useState<{ code: string; version: number; checksum: string } | null>(null);

  const submitPasscode = (raw: string) => {
    const value = raw.trim().toUpperCase();
    if (!value) {
      setNotice('Iltimos, passcode kiriting');
      return;
    }
    if (!PASSCODE_RE.test(value)) {
      setNotice('Passcode 6-8 belgidan iborat bo\'lishi kerak (O, 0, I, 1, L harflarsiz)');
      return;
    }
    setNotice(null);
    setDecoded({ code: value, version: 1, checksum: '' });
    setStage('input');
  };

  const handleQrData = (data: string) => {
    const parsed = decodeSessionFromQR(data);
    if (!parsed?.code) {
      setNotice('QR kod tanib olinmadi. Qaytadan skan qilib ko\'ring.');
      return;
    }
    setNotice(null);
    setDecoded({
      code: String(parsed.code).toUpperCase(),
      version: parsed.v ?? 1,
      checksum: parsed.checksum ?? '',
    });
    setStage('scanned');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500 mb-1">
            <Store className="w-3.5 h-3.5 fill-amber-500" />
            <span>{storeInfo.businessName || 'Do\'kon'}</span>
          </div>
          <h1 className="text-2xl font-black text-foreground font-display tracking-tighter">
            Do\'konda Sotuv (In-Store Sale)
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Xaridorning passcode yoki QR kodini qabul qilish uchun kirish nuqtasi.
          </p>
        </div>
      </div>

      {/* Empty / entry state */}
      {stage === 'empty' && (
        <div className="rounded-2xl border border-dashed border-border bg-card p-8 sm:p-12 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <ScanLine className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-lg font-black text-foreground">Xaridor sessiyasini qabul qiling</h2>
            <p className="text-sm text-muted-foreground">
              Xaridor buy listdan QR kod yaratadi. Sotuvchi bu sahifadan passcode kiritadi yoki QR
              kodni skan qiladi. Hozircha faqat kirish qismi tayyor — sessiya qidiruv backendga
              keyingi bosqichda ulanadi.
            </p>
          </div>

          {/* Passcode input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submitPasscode(passcode);
            }}
            className="max-w-md mx-auto"
          >
            <label className="block text-xs font-bold text-foreground mb-1.5 text-left">
              Passcode kiritish
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <KeyRound className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value.toUpperCase())}
                  placeholder="Masalan: 7XKF92"
                  maxLength={8}
                  autoCapitalize="characters"
                  autoComplete="off"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm font-mono tracking-widest text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-foreground text-background dark:bg-primary dark:text-primary-foreground text-xs font-black transition-all hover:opacity-90 active:scale-95"
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {notice && <p className="text-xs font-bold text-destructive mt-2 text-left">{notice}</p>}
          </form>

          {/* QR scanner placeholder */}
          <div className="max-w-md mx-auto">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex-1 h-px bg-border" />
              yoki
              <span className="flex-1 h-px bg-border" />
            </div>
            <button
              type="button"
              onClick={() => setNotice('Kamera skaneri keyingi bosqichda qo\'shiladi. Hozircha passcode rejimidan foydalaning.')}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border bg-muted/40 text-sm font-bold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <QrCode className="w-4 h-4" />
              QR skaner (keyingi bosqichda)
            </button>
          </div>
        </div>
      )}

      {/* Input stage — decoded passcode, waiting for backend */}
      {stage === 'input' && decoded && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Passcode</p>
                <p className="font-mono font-black tracking-[0.2em] text-lg text-foreground">{decoded.code}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setStage('empty');
                setPasscode('');
                setDecoded(null);
                setNotice(null);
              }}
              className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
            >
              Qaytish
            </button>
          </div>

          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-xs font-medium text-amber-900 dark:text-amber-200 space-y-1">
              <p><b>"{decoded.code}"</b> passcode qabul qilindi.</p>
              <p>
                Sessiya ma\'lumotlarini (mahsulotlar, miqdorlar, amal qilish muddati) qidirish
                backend tizimi hali ulanmagan. Keyingi bosqichda bu passcode serverda
                joylashgan buy_session jadvalidan qidiriladi.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-muted/40 border border-border p-4 flex items-start gap-3">
            <PackageOpen className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
            <div className="text-xs font-medium text-muted-foreground">
              <p className="font-bold text-foreground mb-0.5">Keyingi bosqich (rejalashtirilgan)</p>
              <p>
                Buy session sabqot backend → passcode/QR canonic lookup → mijoz ro\'yxati va
                sotuv ID yaratish. Bugungi kunga kelib, faqat mijoz tomonidagi sessiya yaratish
                qismi ishga tushirilgan.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Scanned stage */}
      {stage === 'scanned' && decoded && (
        <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">QR kod skan qilindi</p>
                <p className="font-mono font-black tracking-[0.2em] text-lg text-foreground">{decoded.code}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 rounded-md bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300">
              v{decoded.version}
            </span>
          </div>

          <div className="rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 p-4 flex items-start gap-3">
            <Info className="w-4 h-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs font-medium text-amber-900 dark:text-amber-200">
              QR kod tarkibi ochildi: versiya {decoded.version}, passcode <b>{decoded.code}</b>.
              To\'liq sessiya ma\'lumotlari (mahsulotlar ro\'yxati) backend lookup ulangach
              ko\'rinadi.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setStage('empty')}
            className="text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            Yangi session qabul qilish
          </button>
        </div>
      )}
    </div>
  );
};