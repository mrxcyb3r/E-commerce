import React from 'react';
import { useLocation } from 'react-router-dom';
import { motion, useReducedMotion } from 'motion/react';

/**
 * Tasteful 150–250ms admin page transition. Respects prefers-reduced-motion.
 * Wraps <Outlet/> — no per-page animation code needed.
 */
export const AdminPageTransition: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      key={location.pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.18, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {children}
    </motion.div>
  );
};

export default AdminPageTransition;
