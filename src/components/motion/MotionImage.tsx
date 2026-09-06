import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { fadeUp } from '../../lib/animations';

interface MotionImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** Reveal delay */
  delay?: number;
  /** Scale on hover (default 1.03) */
  hoverScale?: number;
}

/**
 * Image that fades in with subtle scale on viewport entry.
 * Hovers with gentle zoom on desktop.
 * Respects prefers-reduced-motion.
 */
export const MotionImage: React.FC<MotionImageProps> = ({
  delay = 0,
  hoverScale = 1.03,
  className,
  ...props
}) => {
  const prefersReduced = useReducedMotion() ?? false;

  if (prefersReduced) {
    return <img className={className} {...props} />;
  }

  return (
    <motion.img
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={fadeUp}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      whileHover={{ scale: hoverScale }}
      className={className}
      {...props}
    />
  );
};
