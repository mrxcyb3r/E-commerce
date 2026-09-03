import React, { useState } from 'react';
import {
  FileText,
  Save,
  Check,
  Plus,
  Trash2,
  Image as ImageIcon,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

export const AboutAdminPage: React.FC = () => {
  const { aboutCms, updateAboutCms } = useStore();

  const [title, setTitle] = useState(aboutCms.title);
  const [subtitle, setSubtitle] = useState(aboutCms.subtitle);
  const [mainStory, setMainStory] = useState(aboutCms.mainStory);
  const [secondStory, setSecondStory] = useState(aboutCms.secondStory);
  const [mission, setMission] = useState(aboutCms.mission);
  const [vision, setVision] = useState(aboutCms.vision);

  // Gallery
  const [galleryImages, setGalleryImages] = useState<string[]>(aboutCms.images || []);
  const [newImageInput, setNewImageInput] = useState('');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddGalleryImage = () => {
    if (newImageInput.trim()) {
      setGalleryImages([...galleryImages, newImageInput.trim()]);
      setNewImageInput('');
    }
  };

  const handleRemoveGalleryImage = (index: number) => {
    setGalleryImages(galleryImages.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateAboutCms({
      title,
      subtitle,
      mainStory,
      secondStory,
      mission,
      vision,
      images: galleryImages,
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
            Biz Haqimizda Sahifasi (About CMS)
          </h2>
          <p className="text-xs sm:text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
            Do'kon tarixi, missiyasi va fotogalereyasini tahrirlang
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

      {/* Main Header */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">
          Sahifa Boshligi (Hero Header)
        </h3>

        <div className="space-y-3">
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
              Izoh (Subtitle)
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Story */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">
          Do'konimiz Tarixi va Rivojlanishi
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              1-Paragraf
            </label>
            <textarea
              rows={3}
              value={mainStory}
              onChange={(e) => setMainStory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs leading-relaxed rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300 mb-1">
              2-Paragraf
            </label>
            <textarea
              rows={3}
              value={secondStory}
              onChange={(e) => setSecondStory(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs leading-relaxed rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider">
          Missiya va Maqsadlarimiz
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Missiyamiz
            </label>
            <textarea
              rows={4}
              value={mission}
              onChange={(e) => setMission(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs leading-relaxed rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-300">
              Nigohimiz / Vision
            </label>
            <textarea
              rows={4}
              value={vision}
              onChange={(e) => setVision(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs leading-relaxed rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Gallery Images */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 shadow-xs space-y-4">
        <h3 className="text-sm font-extrabold text-neutral-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
          <ImageIcon className="w-4 h-4 text-amber-500" />
          <span>Fotogalereya Rasmlari</span>
        </h3>

        <div className="flex gap-2">
          <input
            type="url"
            value={newImageInput}
            onChange={(e) => setNewImageInput(e.target.value)}
            placeholder="Yangi rasm URL manzilini kiriting..."
            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-neutral-50 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-neutral-900 dark:text-white"
          />
          <button
            type="button"
            onClick={handleAddGalleryImage}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-bold flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Qo'shish</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {galleryImages.map((img, idx) => (
            <div key={idx} className="relative group aspect-4/3 rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-700">
              <img
                src={img}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <button
                type="button"
                onClick={() => handleRemoveGalleryImage(idx)}
                className="absolute top-2 right-2 p-1.5 rounded-xl bg-red-600/90 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </form>
  );
};
