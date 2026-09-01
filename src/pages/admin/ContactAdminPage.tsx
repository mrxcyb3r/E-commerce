import React, { useState } from 'react';
import {
  Mail,
  Save,
  Check,
  Send,
  HelpCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const ContactAdminPage: React.FC = () => {
  const { contactCms, updateContactCms } = useStore();

  const [title, setTitle] = useState(contactCms.title);
  const [subtitle, setSubtitle] = useState(contactCms.subtitle);
  const [description, setDescription] = useState(contactCms.description);
  const [directHelpText, setDirectHelpText] = useState(contactCms.directHelpText);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateContactCms({
      title,
      subtitle,
      description,
      directHelpText,
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
            Aloqa Sahifasi (Contact CMS)
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Aloqa sahifasidagi matnlar, sarlavhalar va yo'riqnomalarni tahrirlang
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
              <span>O'zgarishlarni saqlash</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <Mail className="w-4 h-4 text-amber-500" />
          <span>Aloqa Sahifasi Matnlari</span>
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Asosiy Sarlavha
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Quyi Matn (Subtitle)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Tushuntirish Matni
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs leading-relaxed rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              Tezkor Yordam va Maslahat Qutisi Matni
            </label>
            <textarea
              rows={3}
              value={directHelpText}
              onChange={(e) => setDirectHelpText(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs leading-relaxed rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
