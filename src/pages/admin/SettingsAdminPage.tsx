import React, { useState } from 'react';
import {
  Settings,
  KeyRound,
  Download,
  Upload,
  RotateCcw,
  Check,
  AlertTriangle,
  Lock,
  User,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';

export const SettingsAdminPage: React.FC = () => {
  const { adminUsername, changeCredentials } = useAuth();
  const { exportDataJSON, importDataJSON, resetAllToDefaults } = useStore();

  // Change Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Backup & Reset state
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);

    if (newPassword && newPassword !== confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Yangi parollar bir xil emas!' });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak!' });
      return;
    }

    const success = await changeCredentials(currentPassword, undefined, newPassword || undefined);
    if (success) {
      setPasswordMsg({ type: 'success', text: 'Admin paroli muvaffaqiyatli yangilandi!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: 'Joriy parol noto\'g\'ri kiritildi!' });
    }
  };

  const handleExport = () => {
    const data = exportDataJSON();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jizzax-store-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const res = importDataJSON(content);
        if (res) {
          setImportStatus('Nusxa muvaffaqiyatli tiklandi! Sahifa yangilanmoqda...');
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setImportStatus('Xatolik: Fayl formati mos kelmadi.');
        }
      } catch (err) {
        setImportStatus('Xatolik: Faylni o\'qib bo\'lmadi.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-16">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-neutral-900 dark:text-white tracking-tight">
          Admin Sozlamalari & Zaxira Nusxalash
        </h2>
        <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
          Admin parolini o'zgartirish, ma'lumotlarni JSON formatida eksport/import qilish
        </p>
      </div>

      {/* Change Password Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-6">
        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-amber-500" />
          <span>Admin Kirish Ma'lumotlarini O'zgartirish</span>
        </h3>

        {passwordMsg && (
          <div
            className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300'
                : 'bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300'
            }`}
          >
            {passwordMsg.type === 'success' ? (
              <Check className="w-4 h-4 text-emerald-500 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-500 shrink-0" />
            )}
            <span>{passwordMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Admin Kirish (Email)
            </label>
            <div className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-medium">
              admin@dokon.uz
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Joriy Parol <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Joriy parolingizni kiriting"
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Yangi Parol
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Yangi parol (ixtiyoriy)"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
                Yangi Parolni Qayta Kiriting
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Yangi parolni takrorlang"
                className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-white dark:text-neutral-900 text-xs font-bold transition-all shadow-xs"
            >
              Parolni Yangilash
            </button>
          </div>
        </form>
      </div>

      {/* Backup and Restore */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-6">
        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Download className="w-4 h-4 text-amber-500" />
          <span>Ma'lumotlar Zaxira Nusxasi (Backup & Restore)</span>
        </h3>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Do'kondagi barcha mahsulotlar, kategoriyalar, sharhlar, FAQ, AI promptlar va CMS matnlarini JSON fayl ko'rinishida yuklab oling yoki avvalgi nusxani qayta yuklang.
        </p>

        {importStatus && (
          <div className="p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 text-xs font-bold">
            {importStatus}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleExport}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-extrabold shadow-sm flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Zaxira Nusxasini Yuklab Olish (JSON)</span>
          </button>

          <label className="px-4 py-2.5 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs font-bold text-neutral-700 dark:text-neutral-200 hover:bg-neutral-50 dark:hover:bg-neutral-700 cursor-pointer flex items-center gap-2">
            <Upload className="w-4 h-4" />
            <span>Nusxadan Tiklash (Import)</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Factory Reset */}
      <div className="p-6 sm:p-8 rounded-3xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-red-700 dark:text-red-400 uppercase tracking-wider flex items-center gap-2">
          <AlertTriangle className="w-4 h-4" />
          <span>Barcha Ma'lumotlarni Dastlabki Holatga Qaytarish (Reset)</span>
        </h3>

        <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
          Agar qilingan o'zgarishlarni bekor qilib, dastlabki standart mahsulotlar va matnlarga qaytmoqchi bo'lsangiz, quyidagi tugmani bosing.
        </p>

        <button
          type="button"
          onClick={() => setShowResetConfirm(true)}
          className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold shadow-sm flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Dastlabki Holatga Qaytarish</span>
        </button>
      </div>

      {/* Reset Confirmation Modal */}
      <ConfirmDialog
        isOpen={showResetConfirm}
        title="Barcha ma'lumotlarni dastlabki holatga qaytarish"
        message="Barcha o'zingiz kiritgan mahsulotlar, tahrirlangan matnlar o'chiriladi va dastlabki standart namunalarga qaytariladi. Davom etasizmi?"
        confirmLabel="Ha, tozalash va qaytarish"
        onConfirm={() => {
          resetAllToDefaults();
          setShowResetConfirm(false);
          window.location.reload();
        }}
        onCancel={() => setShowResetConfirm(false)}
      />
    </div>
  );
};
