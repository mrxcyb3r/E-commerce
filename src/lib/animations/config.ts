import type { Transition, Easing } from 'motion/react';

/** Consistent easing curves */
export const ease = {
  out: [0.25, 0.46, 0.45, 0.94] as Easing,
  inOut: [0.42, 0, 0.58, 1] as Easing,
  spring: { type: 'spring' as const, damping: 26, stiffness: 280 },
  springLight: { type: 'spring' as const, damping: 30, stiffness: 340 },
  springBouncy: { type: 'spring' as const, damping: 18, stiffness: 320 },
};

/** Consistent durations (seconds) */
export const duration = {
  micro: 0.15,
  fast: 0.2,
  base: 0.35,
  slow: 0.5,
  section: 0.65,
  page: 0.25,
};

/** Standard transition presets */
export const transitions = {
  fast: { duration: duration.fast, ease: ease.out } satisfies Transition,
  base: { duration: duration.base, ease: ease.out } satisfies Transition,
  slow: { duration: duration.slow, ease: ease.out } satisfies Transition,
  section: { duration: duration.section, ease: ease.out } satisfies Transition,
  spring: ease.spring,
  springLight: ease.springLight,
  springBouncy: ease.springBouncy,
} as const;
