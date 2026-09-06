import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Check, Package, Play } from 'lucide-react';
import { Product } from '../../types/product';
import { formatPrice } from '../../lib/utils';
import { useFavorites } from '../../context/FavoritesContext';
import { useI18n } from '../../i18n/I18nContext';
import { motion, AnimatePresence } from 'motion/react';

interface ProductCardProps {
  product: Product;
  index?: number;
}

function FavoriteButton({ product, size = 'sm' }: { product: Product; size?: 'sm' | 'md' }) {
  const { t } = useI18n();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const Icon = size === 'sm' ? Heart : Heart;

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(product);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={handleFavorite}
      className={`rounded-full backdrop-blur-sm shadow-md transition-all ${
        size === 'sm' ? 'p-2' : 'p-2.5'
      } ${
        favorite
          ? 'bg-destructive text-destructive-foreground shadow-destructive/30'
          : 'bg-card/90 text-foreground hover:bg-card border border-border'
      }`}
      aria-label={favorite ? t('product', 'removeFav') : t('product', 'addFav')}
    >
      <Icon className={`${size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'} ${favorite ? 'fill-current' : ''}`} strokeWidth={favorite ? 0 : 2} />
    </motion.button>
  );
}

function ProductImage({ product, aspect }: { product: Product; aspect: string }) {
  const imageCount = product.images?.length ?? 0;

  if (imageCount > 0) {
    return (
      <img
        src={product.images[0] ?? ''}
        alt={product.name}
        className={`w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105`}
        loading="lazy"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    <div className={`w-full h-full flex items-center justify-center bg-muted text-muted-foreground`}>
      <Package className="w-16 h-16 opacity-50" />
    </div>
  );
}

export const ProductCardCompact: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { t } = useI18n();
  const { isFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const isOnSale = !!product.originalPrice && product.originalPrice > product.price;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group"
    >
      <Link
        to={`/products/${product.id}`}
        className="flex gap-3 items-center group/card"
        aria-label={`${product.name} ${t('common', 'viewProduct')}`}
      >
        <div className="relative w-20 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-muted">
          <img
            src={product.images?.[0] ?? ''}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover/card:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {isOnSale && (
            <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[8px] font-black uppercase tracking-widest bg-accent text-accent-foreground rounded-full">
              {t('common', 'sale')}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="font-display font-semibold text-foreground text-sm line-clamp-1 group-hover/card:text-accent transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-display font-bold text-foreground text-sm">
              {formatPrice(product.price)}
            </span>
            {isOnSale && (
              <span className="font-display font-medium text-muted-foreground text-xs line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>
        </div>

        <div className="flex-shrink-0">
          <FavoriteButton product={product} size="sm" />
        </div>
      </Link>
    </motion.article>
  );
};

export const ProductCardStandard: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { t } = useI18n();
  const { isFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const isOnSale = !!product.originalPrice && product.originalPrice > product.price;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative"
    >
      <Link
        to={`/products/${product.id}`}
        className="block relative overflow-hidden rounded-xl bg-card"
        aria-label={`${product.name} ${t('common', 'viewProduct')}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden">
          <ProductImage product={product} aspect="aspect-[4/5]" />

          <div
            className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"
            aria-hidden="true"
          />

          <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 pointer-events-none">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleAddToCart}
              className="p-2.5 rounded-full bg-foreground text-background hover:opacity-90 shadow-lg transition-all pointer-events-auto"
                  aria-label={t('product', 'shopNow')}
            >
              <ShoppingBag className="w-5 h-5" />
            </motion.button>
          </div>

          <div className="absolute top-3 left-3 right-3 flex justify-between pointer-events-none">
            <div className="pointer-events-auto">
              {isOnSale && (
                <span className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-accent text-accent-foreground rounded-full shadow-md">
                  {t('common', 'sale')}
                </span>
              )}
            </div>

            <div className="pointer-events-auto">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={(e) => { e.stopPropagation(); e.preventDefault(); useFavorites().toggleFavorite(product); }}
                className={`p-2 rounded-full backdrop-blur-sm shadow-md transition-all ${
                  favorite
                    ? 'bg-destructive text-destructive-foreground shadow-destructive/30'
                    : 'bg-card/90 text-foreground hover:bg-card border border-border'
                }`}
                aria-label={favorite ? t('product', 'removeFav') : t('product', 'addFav')}
              >
                <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} strokeWidth={favorite ? 0 : 2} />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="mt-4 px-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
              {product.categoryName}
            </span>
          </div>

          <Link
            to={`/products/${product.id}`}
            className="font-display font-black text-foreground hover:text-accent transition-colors line-clamp-1 group-hover:text-accent mb-3 block"
            style={{ fontSize: '1.0625rem', letterSpacing: '-0.015em' }}
          >
            {product.name}
          </Link>

          <div className="flex items-end justify-between">
            <div className="flex items-baseline gap-2">
              <div className="font-display font-black text-foreground" style={{ fontSize: '1.125rem' }}>
                {formatPrice(product.price)}
              </div>
              {isOnSale && (
                <div className="font-display font-medium text-muted-foreground line-through" style={{ fontSize: '0.875rem' }}>
                  {formatPrice(product.originalPrice!)}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 text-[10px] font-semibold"
              style={{ color: product.inStock ? '#059669' : '#dc2626' }}>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                style={{ background: product.inStock ? '#d1fae5' : '#fee2e2' }}>
                {product.inStock ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>{t('product', 'inStock')}</span>
                  </>
                ) : (
                  <>
                    <Package className="w-3 h-3" />
                    <span>{t('product', 'soldOut')}</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export const ProductCardFeature: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { t } = useI18n();
  const { isFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const isOnSale = !!product.originalPrice && product.originalPrice > product.price;

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, delay: (index % 6) * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative"
    >
      <Link
        to={`/products/${product.id}`}
        className="block relative overflow-hidden rounded-2xl"
        aria-label={`${product.name} ${t('common', 'viewProduct')}`}
      >
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <ProductImage product={product} aspect="aspect-[16/10]" />

          <div
            className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            aria-hidden="true"
          />

          <div className="absolute bottom-0 left-0 right-0 p-6 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-white/10 backdrop-blur-sm text-white rounded-full border border-white/20">
                  {product.categoryName}
                </span>
                {isOnSale && (
                  <span className="px-3 py-1.5 text-[10px] font-black uppercase tracking-widest bg-accent text-accent-foreground rounded-full">
                    {t('common', 'sale')}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={(e) => { e.stopPropagation(); e.preventDefault(); useFavorites().toggleFavorite(product); }}
                  className={`p-2.5 rounded-full backdrop-blur-sm transition-all ${
                    favorite
                      ? 'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30'
                      : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/20'
                  }`}
                  aria-label={favorite ? t('product', 'removeFav') : t('product', 'addFav')}
                >
                  <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} strokeWidth={favorite ? 0 : 2} />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleQuickView}
                  className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 hover:bg-white/20 border border-white/20 transition-all"
                  aria-label={t('common', 'view')}
                >
                  <Eye className="w-5 h-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddToCart}
                  className="p-2.5 rounded-full bg-accent text-accent-foreground hover:opacity-90 shadow-lg shadow-accent/30 transition-all"
              aria-label={t('product', 'shopNow')}
                >
                  <ShoppingBag className="w-5 h-5" />
                </motion.button>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
          <div className="pointer-events-auto">
            {isOnSale && (
              <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-accent text-accent-foreground rounded-full shadow-lg">
                -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
              </span>
            )}
          </div>

          <div className="pointer-events-auto">
            <motion.button
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); useFavorites().toggleFavorite(product); }}
              className={`p-2.5 rounded-full backdrop-blur-sm transition-all shadow-lg ${
                favorite
                  ? 'bg-destructive text-destructive-foreground shadow-destructive/40'
                  : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/20'
              }`}
              aria-label={favorite ? t('product', 'removeFav') : t('product', 'addFav')}
            >
              <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} strokeWidth={favorite ? 0 : 2} />
            </motion.button>
          </div>
        </div>
      </Link>

      <div className="mt-5 text-center">
        <Link
          to={`/products/${product.id}`}
          className="font-display font-black text-foreground hover:text-accent transition-colors line-clamp-1 group-hover:text-accent"
          style={{ fontSize: 'clamp(1.125rem, 2vw, 1.5rem)', letterSpacing: '-0.02em' }}
        >
          {product.name}
        </Link>

        <div className="mt-2 flex items-center justify-center gap-3">
          <div className="font-display font-black text-foreground"
            style={{ fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)' }}>
            {formatPrice(product.price)}
          </div>
          {isOnSale && (
            <div className="font-display font-medium text-muted-foreground line-through"
              style={{ fontSize: 'clamp(1rem, 2vw, 1.25rem)' }}>
              {formatPrice(product.originalPrice!)}
            </div>
          )}
        </div>

        <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold"
          style={{ color: product.inStock ? '#059669' : '#dc2626' }}>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full"
            style={{ background: product.inStock ? '#d1fae5' : '#fee2e2', color: product.inStock ? '#059669' : '#dc2626' }}>
            {product.inStock ? (
              <>
                <Check className="w-3 h-3" />
                <span>{t('product', 'inStock')}</span>
              </>
            ) : (
              <>
                <Package className="w-3 h-3" />
                <span>{t('product', 'soldOut')}</span>
              </>
            )}
          </span>
        </div>
      </div>
    </motion.article>
  );
};

export const ProductCardMinimal: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { t } = useI18n();
  const isOnSale = !!product.originalPrice && product.originalPrice > product.price;

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.4, delay: (index % 8) * 0.04, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group"
    >
      <Link
        to={`/products/${product.id}`}
        className="block group/card"
        aria-label={`${product.name} ${t('common', 'viewProduct')}`}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-muted">
          <img
            src={product.images?.[0] ?? ''}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover/card:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
          {isOnSale && (
            <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest bg-accent text-accent-foreground rounded-full">
              {t('common', 'sale')}
            </span>
          )}
        </div>

        <div className="mt-3">
          <h3 className="font-display font-semibold text-foreground text-sm line-clamp-1 group-hover/card:text-accent transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-display font-bold text-foreground text-sm">
              {formatPrice(product.price)}
            </span>
            {isOnSale && (
              <span className="font-display font-medium text-muted-foreground text-xs line-through">
                {formatPrice(product.originalPrice!)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
};

export const ProductCardVideo: React.FC<ProductCardProps> = ({ product, index = 0 }) => {
  const { t } = useI18n();
  const { isFavorite } = useFavorites();
  const favorite = isFavorite(product.id);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative"
    >
      <Link
        to={`/products/${product.id}`}
        className="block relative overflow-hidden rounded-xl bg-card"
        aria-label={`${product.name} ${t('common', 'viewProduct')}`}
      >
        <div className="relative aspect-[9/16] overflow-hidden bg-muted">
          <img
            src={product.videoPosterUrl ?? product.images?.[0] ?? ''}
            alt={product.name}
            className="w-full h-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />

          <div
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-400"
            aria-hidden="true"
          />

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handlePlay}
            className="absolute inset-0 m-auto w-14 h-14 flex items-center justify-center rounded-full bg-white/90 text-foreground shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            aria-label={t('feed', 'prevVideo')}
          >
            <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
          </motion.button>

          <div className="absolute top-3 right-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); useFavorites().toggleFavorite(product); }}
              className={`p-2 rounded-full backdrop-blur-sm shadow-md transition-all ${
                favorite
                   ? 'bg-destructive text-destructive-foreground shadow-destructive/30'
                   : 'bg-card/90 text-foreground hover:bg-card border border-border'
              }`}
              aria-label={favorite ? t('product', 'removeFav') : t('product', 'addFav')}
            >
              <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} strokeWidth={favorite ? 0 : 2} />
            </motion.button>
          </div>
        </div>

        <div className="p-3">
          <h3 className="font-display font-semibold text-foreground text-sm line-clamp-1 group-hover:text-accent transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="font-display font-bold text-foreground text-sm">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="font-display font-medium text-muted-foreground text-xs line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.article>
  );
};
