import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Check, Package } from 'lucide-react';
import { Product } from '../../types/product';
import { formatPrice } from '../../lib/utils';
import { useFavorites } from '../../context/FavoritesContext';
import { useI18n } from '../../i18n/I18nContext';

interface ProductCardProps {
  product: Product;
  index?: number;
  variant?: 'default' | 'featured' | 'compact' | 'editorial';
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  index = 0,
  variant = 'default',
}) => {
  const { t } = useI18n();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const [imgError, setImgError] = useState(false);

  const isOnSale = !!product.originalPrice && product.originalPrice > product.price;
  const discountPercent = isOnSale
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0;

  const aspectRatio = variant === 'editorial' ? 'aspect-[16/10]' : variant === 'compact' ? 'aspect-square' : 'aspect-[3/4]';

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(product);
  };

  if (variant === 'editorial') {
    return (
      <article className="group relative">
        <Link
          to={`/products/${product.id}`}
          className="block relative overflow-hidden rounded-2xl"
          aria-label={`View ${product.name}`}
        >
          <div className={`relative ${aspectRatio} overflow-hidden bg-muted`}>
            {product.images?.[0] && !imgError ? (
              <img
                src={product.images[0]}
                alt={product.name}
                className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Package className="w-10 h-10 opacity-40" />
              </div>
            )}

            <div className="absolute top-3 left-3 right-3 flex justify-between pointer-events-none">
              {isOnSale && (
                <span className="pointer-events-auto px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-accent text-accent-foreground rounded-full">
                  -{discountPercent}%
                </span>
              )}
              <button
                onClick={handleFavorite}
                className={`pointer-events-auto p-1.5 rounded-full transition-all hover:scale-110 active:scale-95 ${
                  favorite
                    ? 'bg-rose-500 text-white'
                    : 'bg-card/80 text-muted-foreground hover:text-rose-500 backdrop-blur-sm'
                }`}
                aria-label={favorite ? t('product', 'removeFav') : t('product', 'addFav')}
              >
                <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-current' : ''}`} strokeWidth={favorite ? 0 : 2} />
              </button>
            </div>
          </div>

          <div className="mt-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {product.categoryName}
            </span>
            <h3 className="text-sm font-medium text-foreground line-clamp-1 mt-0.5">
              {product.name}
            </h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm font-semibold text-foreground">{formatPrice(product.price)}</span>
              {isOnSale && (
                <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice!)}</span>
              )}
            </div>
          </div>
        </Link>
      </article>
    );
  }

  return (
    <article className="group relative">
      <Link
        to={`/products/${product.id}`}
        className="block relative overflow-hidden rounded-xl bg-card"
        aria-label={`View ${product.name}`}
      >
        <div className={`relative ${aspectRatio} overflow-hidden bg-muted`}>
          {product.images?.[0] && !imgError ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Package className="w-10 h-10 opacity-40" />
            </div>
          )}

          <div className="absolute top-2 left-2 right-2 flex justify-between pointer-events-none">
            {isOnSale && (
              <span className="pointer-events-auto px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider bg-accent text-accent-foreground rounded-full">
                -{discountPercent}%
              </span>
            )}
            <button
              onClick={handleFavorite}
              className={`pointer-events-auto p-1.5 rounded-full transition-all hover:scale-110 active:scale-95 ${
                favorite
                  ? 'bg-rose-500 text-white'
                  : 'bg-card/80 text-muted-foreground hover:text-rose-500 backdrop-blur-sm'
              }`}
              aria-label={favorite ? t('product', 'removeFav') : t('product', 'addFav')}
            >
              <Heart className={`w-3.5 h-3.5 ${favorite ? 'fill-current' : ''}`} strokeWidth={favorite ? 0 : 2} />
            </button>
          </div>
        </div>

        <div className="p-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {product.categoryName}
          </span>
          <h3 className="text-sm font-medium text-foreground line-clamp-1 mt-0.5">
            {product.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-semibold text-foreground">{formatPrice(product.price)}</span>
            {isOnSale && (
              <span className="text-xs text-muted-foreground line-through">{formatPrice(product.originalPrice!)}</span>
            )}
          </div>
          <div className="flex items-center gap-1 mt-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${product.inStock ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <span className="text-[10px] font-medium text-muted-foreground">
              {product.inStock ? t('common', 'inStore') : t('common', 'soldOut')}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

export default ProductCard;
