import { useReducedMotion } from 'motion/react';

/**
 * Central hook for reduced motion preference.
 * Returns true if the user prefers reduced motion.
 * Use this to conditionally disable animations.
 */
export const usePrefersReducedMotion = (): boolean => {
  return useReducedMotion() ?? false;
};

/**
 * Returns animation duration based on motion preference.
 * If reduced motion is preferred, returns 0.
 */
export const useAnimationDuration = (normalDuration: number): number => {
  const prefersReduced = useReducedMotion() ?? false;
  return prefersReduced ? 0 : normalDuration;
};

/**
 * Returns a transition object that respects reduced motion.
 */
export const useRespectfulTransition = (
  normal: Record<string, unknown>
): Record<string, unknown> => {
  const prefersReduced = useReducedMotion() ?? false;
  if (prefersReduced) {
    return { duration: 0 };
  }
  return normal;
};
