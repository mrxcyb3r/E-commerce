import React, { useState } from 'react';
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Play,
  XCircle,
  Percent,
  Banknote,
  Gift,
  Ticket,
  Clock,
  Loader2,
} from 'lucide-react';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { logBusinessAudit } from '../../lib/auth/security';
import {
  listCampaigns,
  saveCampaign,
  deleteCampaign,
  campaignStatus,
  nextCampaignId,
  Campaign,
  CampaignType,
  CampaignStatus,
} from '../../lib/admin/ops';
import { track } from '../../lib/analytics/client';
import { useStore } from '../../context/StoreContext';

const TASHKENT_OFFSET_MS = 5 * 3600 * 1000;

// datetime-local input works on Tashkent wall time (the shop's clock).
function toLocalInput(epoch: number | null): string {
  if (epoch == null) return '';
  const d = new Date(epoch + TASHKENT_OFFSET_MS);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}T${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}`;
}

function fromLocalInput(value: string): number {
  return new Date(value + ':00+05:00').getTime();
}

const TYPE_META: Record<CampaignType, { label: string; icon: React.ReactNode; hint: string }> = {
  percentage: { label: 'Foizli chegirma', icon: <Percent className="w-4 h-4" />, hint: 'Narxga % chegirma (masalan 15 = 15%)' },
  fixed: { label: 'Qat‘iy miqdor', icon: <Banknote className="w-4 h-4" />, hint: 'Narxdan chegiriladigan so‘m miqdori' },
  bogo: { label: 'X ol, Y tekin', icon: <Gift className="w-4 h-4" />, hint: "X dona olib, Y dona bepul (Buy X Get Y)" },
  code: { label: 'Kodli aktsiya', icon: <Ticket className="w-4 h-4" />, hint: 'Buy-sessiya bilan ishlash uchun kod (kelajakda)' },
};

const STATUS_META: Record<CampaignStatus, { label: string; cls: string; dot: string }> = {
  draft: { label: 'Qoralama', cls: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-300', dot: 'bg-zinc-400' },
  scheduled: { label: 'Rejalashtirilgan', cls: 'bg-sky-500/10 text-sky-600 dark:text-sky-400', dot: 'bg-sky-400' },
  running: { label: 'Amalda', cls: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400', dot: 'bg-emerald-500' },
  expired: { label: 'Yakunlangan', cls: 'bg-red-500/10 text-red-600 dark:text-red-400', dot: 'bg-red-400' },
};

const emptyForm = (): Omit<Campaign, 'id' | 'createdAt'> => ({
  name: '',
  type: 'percentage',
  value: 10,
  buyQty: 2,
  getQty: 1,
  code: '',
  description: '',
  beginAt: null,
  endAt: null,
});

export const CampaignsPage: React.FC = () => {
  const { logActivity } = useStore();
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => listCampaigns());
  const [modal, setModal] = useState<{ editing: Campaign | null } | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<Campaign | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = () => setCampaigns(listCampaigns());

  const openCreate = () => {
    setForm(emptyForm());
    setModal({ editing: null });
  };

  const openEdit = (c: Campaign) => {
    setForm({
      name: c.name,
      type: c.type,
      value: c.value,
      buyQty: c.buyQty ?? 2,
      getQty: c.getQty ?? 1,
      code: c.code ?? '',
      description: c.description ?? '',
      beginAt: c.beginAt,
      endAt: c.endAt,
    });
    setModal({ editing: c });
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    setBusy(true);
    const isNew = !modal?.editing;
    const record: Campaign = modal?.editing
      ? {
          ...modal.editing,
          name: form.name.trim(),
          type: form.type,
          value: Number(form.value) || 0,
          buyQty: form.type === 'bogo' ? Math.max(1, Number(form.buyQty) || 2) : undefined,
          getQty: form.type === 'bogo' ? Math.max(1, Number(form.getQty) || 1) : undefined,
          code: form.type === 'code' ? form.code?.trim() || undefined : undefined,
          description: form.description?.trim() || undefined,
          beginAt: form.beginAt,
          endAt: form.endAt,
        }
      : {
          id: nextCampaignId(),
          name: form.name.trim(),
          type: form.type,
          value: Number(form.value) || 0,
          buyQty: form.type === 'bogo' ? Math.max(1, Number(form.buyQty) || 2) : undefined,
          getQty: form.type === 'bogo' ? Math.max(1, Number(form.getQty) || 1) : undefined,
          code: form.type === 'code' ? form.code?.trim() || undefined : undefined,
          description: form.description?.trim() || undefined,
          beginAt: form.beginAt,
          endAt: form.endAt,
          createdAt: Date.now(),
        };
    saveCampaign(record);
    void logBusinessAudit(isNew ? 'campaign_created' : 'campaign_updated', 'campaigns', record.id, {
      name: record.name,
      type: record.type,
    });
    track(isNew ? 'campaign_created' : 'campaign_created', {
      metadata: { campaignId: record.id, name: record.name, type: record.type },
    });
    logActivity('create', 'campaign', `${isNew ? 'Aktsiya yaratildi' : 'Aktsiya yangilandi'}: "${record.name}"`);
    setBusy(false);
    setModal(null);
    refresh();
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCampaign(deleteTarget.id);
    void logBusinessAudit('campaign_deleted', 'campaigns', deleteTarget.id, {
      name: deleteTarget.name,
    });
    logActivity('delete', 'campaign', `Aktsiya o‘chirildi: "${deleteTarget.name}"`);
    setDeleteTarget(null);
    refresh();
  };

  const forceStart = (c: Campaign) => {
    saveCampaign({ ...c, forceRunning: true, forceExpired: false, beginAt: c.beginAt ?? Date.now() });
    track('campaign_started', { metadata: { campaignId: c.id, name: c.name } });
    logActivity('start', 'campaign', `Aktsiya ishga tushirildi: "${c.name}"`);
    refresh();
  };

  const forceFinish = (c: Campaign) => {
    saveCampaign({ ...c, forceExpired: true, forceRunning: false });
    track('campaign_finished', { metadata: { campaignId: c.id, name: c.name } });
    logActivity('complete', 'campaign', `Aktsiya yakunlandi: "${c.name}"`);
    refresh();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-500 mb-1">
            <Megaphone className="w-3.5 h-3.5" />
            <span>Savdo</span>
          </div>
          <h1 className="text-2xl font-black text-foreground font-display tracking-tighter">Aktsiyalar</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Chegirma va aksiyalarni rejalashtiring. Do‘konda sotuv jarayoniga kelajakda ulanadi — hozircha analitika uchun.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-foreground text-background dark:bg-primary dark:text-primary-foreground text-xs font-black transition-all hover:opacity-90 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          Yangi aktsiya
        </button>
      </div>

      {campaigns.length === 0 ? (
        <button
          type="button"
          onClick={openCreate}
          className="w-full rounded-2xl border border-dashed border-border bg-card p-10 text-center space-y-3 hover:border-amber-400/40 transition-colors"
        >
          <div className="w-14 h-14 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto">
            <Megaphone className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">Birinchi aktsiyani yarating</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Foizli chegirma, qat’iy miqdor, «X ol Y tekin» yoki kodli aktsiya.
            </p>
          </div>
        </button>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {campaigns.map((c) => {
            const status = campaignStatus(c);
            const st = STATUS_META[status];
            const t = TYPE_META[c.type];
            return (
              <div key={c.id} className="rounded-2xl border border-border bg-card p-4 flex flex-col">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-black text-foreground">{c.name}</h3>
                  <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-black ${st.cls}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${st.dot} ${status === 'running' ? 'animate-pulse' : ''}`} />
                    {st.label}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-muted/50 text-muted-foreground font-bold">
                    {t.icon}
                    {t.label}
                  </span>
                  <span className="font-black text-lg text-amber-600 dark:text-amber-400 tabular-nums">
                    {c.type === 'percentage' ? `${c.value}%` : c.type === 'fixed' ? `${c.value.toLocaleString('uz-UZ')} so‘m` : c.type === 'bogo' ? `${c.buyQty}+${c.getQty}` : (c.code ?? '—')}
                  </span>
                </div>

                {c.description && <p className="text-[11px] text-muted-foreground mt-2 line-clamp-2">{c.description}</p>}

                <div className="mt-3 space-y-1 text-[11px] text-muted-foreground">
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3 h-3" />
                    {c.beginAt ? new Date(c.beginAt).toLocaleString() : 'Boshlanishi aniq emas'}
                    {c.endAt ? ` → ${new Date(c.endAt).toLocaleString()}` : ''}
                  </p>
                  <p>Turi: {c.type} · Chegirma: {c.value}</p>
                </div>

                <div className="mt-auto pt-3 flex items-center gap-1.5">
                  {status !== 'running' && status !== 'expired' && (
                    <button
                      type="button"
                      onClick={() => forceStart(c)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-600 text-white text-[11px] font-black transition-all hover:bg-emerald-500 active:scale-95"
                    >
                      <Play className="w-3.5 h-3.5" />
                      Ishga tushirish
                    </button>
                  )}
                  {status === 'running' && (
                    <button
                      type="button"
                      onClick={() => forceFinish(c)}
                      className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-red-600 text-white text-[11px] font-black transition-all hover:bg-red-500 active:scale-95"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Yakunlash
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => openEdit(c)}
                    className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                    title="Tahrirlash"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(c)}
                    className="p-2 rounded-lg border border-border text-muted-foreground hover:text-destructive transition-colors"
                    title="O‘chirish"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" role="dialog" aria-modal="true">
          <div className="w-full max-w-lg rounded-2xl bg-card border border-border p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-black text-foreground">{modal.editing ? 'Aktsiyani tahrirlash' : 'Yangi aktsiya'}</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Chegirma faqat rejalashtirish — to‘lov qabul qilmaydi.</p>
            </div>

            <label className="block">
              <span className="block text-[11px] font-bold text-foreground mb-1">Nomi *</span>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="Masalan: Yangi yil chegirmasi"
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="block text-[11px] font-bold text-foreground mb-1">Turi</span>
                <select
                  value={form.type}
                  onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as CampaignType }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none"
                >
                  {(Object.keys(TYPE_META) as CampaignType[]).map((t) => (
                    <option key={t} value={t}>
                      {TYPE_META[t].label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block">
                <span className="block text-[11px] font-bold text-foreground mb-1">
                  {form.type === 'percentage' ? 'Chegirma %' : form.type === 'fixed' ? 'Miqdor (so‘m)' : form.type === 'bogo' ? 'X soni (oladi)' : 'Kod'}
                </span>
                <input
                  type={form.type === 'code' ? 'text' : 'number'}
                  min={0}
                  value={form.type === 'code' ? (form.code ?? '') : form.value}
                  onChange={(e) =>
                    setForm((f) => (form.type === 'code' ? { ...f, code: e.target.value } : { ...f, value: Number(e.target.value) }))
                  }
                  placeholder={form.type === 'code' ? 'SAVE2026' : '10'}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                />
              </label>
            </div>

            {form.type === 'bogo' && (
              <div className="grid grid-cols-2 gap-2">
                <label className="block">
                  <span className="block text-[11px] font-bold text-foreground mb-1">X (oladi)</span>
                  <input
                    type="number"
                    min={1}
                    value={form.buyQty ?? 2}
                    onChange={(e) => setForm((f) => ({ ...f, buyQty: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="block text-[11px] font-bold text-foreground mb-1">Y (tekin)</span>
                  <input
                    type="number"
                    min={1}
                    value={form.getQty ?? 1}
                    onChange={(e) => setForm((f) => ({ ...f, getQty: Number(e.target.value) }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none"
                  />
                </label>
              </div>
            )}

            <label className="block">
              <span className="block text-[11px] font-bold text-foreground mb-1">Tavsif</span>
              <input
                type="text"
                value={form.description ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Aktsiya shartlari haqida qisqa izoh…"
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
              />
            </label>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="block text-[11px] font-bold text-foreground mb-1">Boshlanishi</span>
                <input
                  type="datetime-local"
                  value={toLocalInput(form.beginAt)}
                  onChange={(e) => setForm((f) => ({ ...f, beginAt: e.target.value ? fromLocalInput(e.target.value) : null }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none"
                />
              </label>
              <label className="block">
                <span className="block text-[11px] font-bold text-foreground mb-1">Tugashi</span>
                <input
                  type="datetime-local"
                  value={toLocalInput(form.endAt)}
                  onChange={(e) => setForm((f) => ({ ...f, endAt: e.target.value ? fromLocalInput(e.target.value) : null }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-xs text-foreground focus:outline-none"
                />
              </label>
            </div>

            <p className="text-[11px] text-muted-foreground">{TYPE_META[form.type].hint}</p>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setModal(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-border text-xs font-black text-muted-foreground hover:text-foreground transition-colors"
              >
                Qaytish
              </button>
              <button
                type="button"
                disabled={busy || !form.name.trim()}
                onClick={handleSave}
                className="flex-1 px-4 py-2.5 rounded-xl bg-foreground text-background dark:bg-primary dark:text-primary-foreground text-xs font-black transition-all hover:opacity-90 active:scale-95 disabled:opacity-40"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Saqlash'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Aktsiya o‘chirilsinmi?"
        message={`"${deleteTarget?.name ?? ''}" aktsiyasi butunlay o‘chiriladi.`}
        confirmLabel="Ha, o‘chirish"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default CampaignsPage;