import React from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';

interface RevealProps {
  children: React.ReactNode;
  variant?: Variants;
  /** Custom transition override */
  transition?: Record<string, unknown>;
  /** Delay in seconds */
  delay?: number;
  /** once = animate only on first viewport entry */
  once?: boolean;
  /** Viewport amount threshold */
  amount?: number | 'some' | 'all';
  /** Additional class on wrapper */
  className?: string;
}

/**
 * Viewport-triggered reveal wrapper.
 * Uses fadeUp by default. Pass variant to customize.
 * Respects prefers-reduced-motion.
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  variant,
  transition,
  delay = 0,
  once = true,
  amount = 0.15,
  className,
}) => {
  const prefersReduced = useReducedMotion() ?? false;

  // When reduced motion is preferred, skip animation entirely
  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variant}
      transition={transition ?? { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
