import React from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { staggerContainer, staggerItem } from '../../lib/animations';

interface StaggerProps {
  children: React.ReactNode;
  /** Container variant — defaults to staggerContainer */
  containerVariant?: Variants;
  /** Item variant — defaults to staggerItem */
  itemVariant?: Variants;
  /** once = animate only on first viewport entry */
  once?: boolean;
  amount?: number | 'some' | 'all';
  className?: string;
}

/**
 * Stagger container — children animate in sequence.
 * Wrap a .map() result in this component.
 * Respects prefers-reduced-motion.
 */
export const Stagger: React.FC<StaggerProps> = ({
  children,
  containerVariant,
  itemVariant,
  once = true,
  amount = 0.1,
  className,
}) => {
  const prefersReduced = useReducedMotion() ?? false;
  const cv: Variants = containerVariant ?? staggerContainer;

  // When reduced motion is preferred, render children without animation
  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={cv}
      className={className}
    >
      {React.Children.map(children, (child) => (
        <motion.div variants={itemVariant ?? staggerItem}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};
