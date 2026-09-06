import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Eye, Check, Package } from 'lucide-react';
import { Product } from '../../types/product';
import { formatPrice } from '../../lib/utils';
import { useFavorites } from '../../context/FavoritesContext';
import { motion, AnimatePresence } from 'motion/react';

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
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorite = isFavorite(product.id);
  const imageCount = product.images?.length ?? 0;
  const [hovered, setHovered] = useState(false);

  const isOnSale = !!product.originalPrice && product.originalPrice > product.price;

  const variants = {
    default: 'aspect-[4/5]',
    featured: 'aspect-[3/4]',
    compact: 'aspect-[1/1]',
    editorial: 'aspect-[16/10]',
  };

  const aspectRatio = variants[variant];

  const handleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    toggleFavorite(product);
  };

  const handleQuickView = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
  };

  const renderImage = () => {
    if (imageCount > 0) {
      return (
        <AnimatePresence mode="wait">
          <motion.img
            key={0}
            src={product.images[0] ?? ''}
            alt={product.name}
            initial={{ opacity: 0.8, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0.8, scale: 1.02 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="w-full h-full object-cover object-center transition-all duration-700 ease-out group-hover:scale-105"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </AnimatePresence>
      );
    }
    return (
      <div className="w-full h-full flex items-center justify-center bg-muted text-muted-foreground">
        <Package className="w-16 h-16 opacity-50" />
      </div>
    );
  };

  const renderOverlayActions = () => (
    <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-4 group-hover:translate-y-0 pointer-events-none">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleFavorite}
        className={`p-2.5 rounded-full backdrop-blur-sm shadow-lg transition-all ${
          favorite
            ? 'bg-destructive text-destructive-foreground shadow-destructive/40'
            : 'bg-card/90 text-foreground hover:bg-card border border-border'
        }`}
        aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} strokeWidth={favorite ? 0 : 2} />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleQuickView}
        className="p-2.5 rounded-full bg-card/90 backdrop-blur-sm text-foreground hover:bg-card border border-border shadow-lg transition-all"
        aria-label="Quick view"
      >
        <Eye className="w-5 h-5" />
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleAddToCart}
        className="p-2.5 rounded-full bg-foreground text-background hover:opacity-90 shadow-lg transition-all"
        aria-label="Add to cart"
      >
        <ShoppingBag className="w-5 h-5" />
      </motion.button>
    </div>
  );

  const renderTopBadges = () => (
    <div className="absolute top-3 left-3 right-3 flex justify-between pointer-events-none">
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -10 }}
        transition={{ duration: 0.25 }}
        className="pointer-events-auto"
      >
        {isOnSale && (
          <span className="inline-block px-2.5 py-1 text-[10px] font-black uppercase tracking-widest bg-accent text-accent-foreground rounded-full shadow-md">
            Sale
          </span>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 10 }}
        animate={{ opacity: favorite ? 1 : (hovered ? 0.3 : 0), x: 0 }}
        transition={{ duration: 0.25 }}
        className="pointer-events-auto"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={handleFavorite}
          className={`p-2 rounded-full backdrop-blur-sm shadow-md transition-all ${
            favorite
              ? 'bg-destructive text-destructive-foreground shadow-destructive/30'
              : 'bg-card/90 text-foreground hover:bg-card border border-border'
          }`}
          aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart className={`w-4 h-4 ${favorite ? 'fill-current' : ''}`} strokeWidth={favorite ? 0 : 2} />
        </motion.button>
      </motion.div>
    </div>
  );

  if (variant === 'editorial') {
    return (
      <>
        <motion.article
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6, delay: (index % 6) * 0.08, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="group relative"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <Link
            to={`/products/${product.id}`}
            className="block relative overflow-hidden rounded-2xl"
            aria-label={`View ${product.name}`}
          >
            <div className={`relative ${aspectRatio} overflow-hidden bg-muted`}>
              {renderImage()}

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
                        Sale
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleFavorite}
                      className={`p-2.5 rounded-full backdrop-blur-sm transition-all ${
                        favorite
                          ? 'bg-destructive text-destructive-foreground shadow-lg shadow-destructive/30'
                          : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/20'
                      }`}
                      aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} strokeWidth={favorite ? 0 : 2} />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleQuickView}
                      className="p-2.5 rounded-full bg-white/10 backdrop-blur-sm text-white/90 hover:bg-white/20 border border-white/20 transition-all"
                      aria-label="Quick view"
                    >
                      <Eye className="w-5 h-5" />
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddToCart}
                      className="p-2.5 rounded-full bg-accent text-accent-foreground hover:opacity-90 shadow-lg shadow-accent/30 transition-all"
                      aria-label="Add to cart"
                    >
                      <ShoppingBag className="w-5 h-5" />
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-4 left-4 right-4 flex justify-between pointer-events-none">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: hovered ? 1 : 0, x: hovered ? 0 : -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="pointer-events-auto"
              >
                {isOnSale && (
                  <span className="inline-block px-3 py-1 text-[10px] font-black uppercase tracking-widest bg-accent text-accent-foreground rounded-full shadow-lg">
                    -{Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)}%
                  </span>
                )}
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: favorite ? 1 : (hovered ? 0.4 : 0), x: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="pointer-events-auto"
              >
                <motion.button
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleFavorite}
                  className={`p-2.5 rounded-full backdrop-blur-sm transition-all shadow-lg ${
                    favorite
                      ? 'bg-destructive text-destructive-foreground shadow-destructive/40'
                      : 'bg-white/10 text-white/90 hover:bg-white/20 border border-white/20'
                  }`}
                  aria-label={favorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart className={`w-5 h-5 ${favorite ? 'fill-current' : ''}`} strokeWidth={favorite ? 0 : 2} />
                </motion.button>
              </motion.div>
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

            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] font-semibold">
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full ${product.inStock ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                {product.inStock ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>In Store</span>
                  </>
                ) : (
                  <>
                    <Package className="w-3 h-3" />
                    <span>Sold Out</span>
                  </>
                )}
              </span>
            </div>
          </div>
        </motion.article>
      </>
    );
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: (index % 8) * 0.05, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link
        to={`/products/${product.id}`}
        className="block relative overflow-hidden rounded-xl bg-card"
        aria-label={`View ${product.name}`}
      >
        <div className={`relative ${aspectRatio} overflow-hidden`}>
          {renderImage()}

          <div
            className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400"
            aria-hidden="true"
          />

          {renderOverlayActions()}

          {renderTopBadges()}
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
              <div className="font-display font-black text-foreground"
                style={{ fontSize: '1.125rem' }}>
                {formatPrice(product.price)}
              </div>
              {isOnSale && (
                <div className="font-display font-medium text-muted-foreground line-through"
                  style={{ fontSize: '0.875rem' }}>
                  {formatPrice(product.originalPrice!)}
                </div>
              )}
            </div>

            <div className="flex items-center gap-1 text-[10px] font-semibold">
              <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full ${product.inStock ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                {product.inStock ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>In Store</span>
                  </>
                ) : (
                  <>
                    <Package className="w-3 h-3" />
                    <span>Sold Out</span>
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

export default ProductCard;