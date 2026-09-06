import React from 'react';
import { useStore } from '../../context/StoreContext';
import { Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useBrand } from '../../hooks/useBrand';
import { Reveal } from '../motion';

interface CategoryTileProps {
  id: string;
  name: string;
  slug: string;
  productCount?: number;
  imageUrl?: string;
}

const CategoryTile: React.FC<CategoryTileProps> = ({
  id,
  name,
  slug,
  productCount,
  imageUrl,
}) => {
  return (
    <Link
      to={`/products?category=${slug}`}
      className={`group block rounded-xl overflow-hidden border border-zinc-200/30 dark:border-border/30 transition-all hover:border-zinc-400 dark:hover:border-zinc-600`}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      ) : (
        <div
          className="w-full h-48 bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400 dark:text-zinc-500"
        >
          <span className="text-xs font-bold">{name.substring(0, 3)}</span>
        </div>
      )}

      <div className="p-3">
        <p className="font-black text-foreground text-xs line-clamp-2">
          {name}
        </p>
        {productCount !== undefined && (
          <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium">
            {productCount} mahsulot
          </p>
        )}
      </div>
    </Link>
  );
};

export const CategoriesSection: React.FC = () => {
  const { publishedCategories } = useStore();
  const { name: storeName } = useBrand();

  const categoryTiles = publishedCategories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    productCount: cat.productCount,
    imageUrl: cat.image,
  }));

  return (
    <section id="categories" className="py-8 md:py-12 bg-card transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <Reveal className="space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{'Kategoriyalar'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-foreground font-display tracking-tighter">
              { 'Nima izlayapsiz?' }
            </h2>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 font-normal">
              { 'Sizga mos bo\'lgani kerakli bo\'limni tanlang.' }
            </p>
          </Reveal>

          {/* CTA */}
          <div className="self-start">
            <Link
              to="/products"
              className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-xs font-black tracking-wide text-zinc-900 dark:text-zinc-300 border border-border hover:bg-zinc-50 dark:hover:bg-background transition-all"
            >
              <span>Barcha kategoriyani ko'rish</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>

      {/* Category Tiles Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {categoryTiles.map((tile) => (
          <CategoryTile key={tile.id} {...tile} />
        ))}
      </div>
    </section>
  );
};
