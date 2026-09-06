export const hoverTransition = {
  fast: { duration: 0.15, ease: [0.25, 0.46, 0.45, 0.94] },
  base: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  slow: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  spring: { type: "spring" as const, stiffness: 400, damping: 25 },
};

export const hoverClasses = {
  lift: 'transition-all duration-250 ease-out hover:-translate-y-0.5 hover:shadow-lg',
  scale: 'transition-transform duration-200 ease-out hover:scale-[1.02]',
  scaleImage: 'transition-transform duration-500 ease-out hover:scale-105',
  brighten: 'transition-all duration-200 ease-out hover:brightness-110',
  opacity: 'transition-opacity duration-200 ease-out hover:opacity-80',
  glow: 'transition-all duration-300 ease-out hover:shadow-[0_0_20px_-5px_rgba(245,158,11,0.3)]',
};
