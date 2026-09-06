import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { fadeUp } from '../../lib/animations';

interface MotionImageProps {
  src: string;
  alt: string;
  className?: string;
  delay?: number;
  hoverScale?: number;
  loading?: 'lazy' | 'eager';
  referrerPolicy?: 'no-referrer' | 'no-referrer-when-downgrade' | 'origin' | 'origin-when-cross-origin' | 'same-origin' | 'strict-origin' | 'strict-origin-when-cross-origin' | 'unsafe-url';
  width?: number | string;
  height?: number | string;
}

/**
 * Image that fades in with subtle scale on viewport entry.
 * Hovers with gentle zoom on desktop.
 * Respects prefers-reduced-motion.
 */
export const MotionImage: React.FC<MotionImageProps> = ({
  src,
  alt,
  className,
  delay = 0,
  hoverScale = 1.03,
  loading = 'lazy',
  referrerPolicy = 'no-referrer',
  width,
  height,
}) => {
  const prefersReduced = useReducedMotion() ?? false;

  if (prefersReduced) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        loading={loading}
        referrerPolicy={referrerPolicy}
        width={width}
        height={height}
      />
    );
  }

  return (
    <motion.img
      src={src}
      alt={alt}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      whileHover={{ scale: hoverScale }}
      className={className}
      loading={loading}
      referrerPolicy={referrerPolicy}
      width={width}
      height={height}
    />
  );
};
