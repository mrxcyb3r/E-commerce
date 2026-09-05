import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'motion/react';

interface CountUpProps {
  value: string;
  duration?: number;
  className?: string;
}

const NUMERIC_PATTERN = /^(\d+(?:[.,]\d+)?)([+\-%]?)$/;

export const CountUp: React.FC<CountUpProps> = ({
  value,
  duration = 1600,
  className,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const reduceMotion = useReducedMotion();

  const parts = useMemo(() => {
    const parsed = value.match(NUMERIC_PATTERN);
    if (!parsed) return null;
    const base = parseFloat(parsed[1].replace(',', '.'));
    if (Number.isNaN(base)) return null;
    return { base, suffix: parsed[2] ?? '' };
  }, [value]);

  const [display, setDisplay] = useState<string>(
    parts ? `${parts.base}${parts.suffix}` : value,
  );

  useEffect(() => {
    if (!parts || !inView) return;
    if (reduceMotion) {
      setDisplay(`${parts.base}${parts.suffix}`);
      return;
    }

    let raf = 0;
    let start: number | null = null;
    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = parts.base * eased;
      const formatted =
        Number.isInteger(parts.base) && Number.isInteger(current)
          ? String(Math.round(current))
          : String(current.toFixed(2).replace(/\.?0+$/, ''));
      setDisplay(`${formatted}${parts.suffix}`);
      if (progress < 1) raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [parts, inView, reduceMotion, duration]);

  if (!parts) {
    return (
      <motion.span
        ref={ref}
        className={className}
        initial={{ opacity: 0, scale: 0.95, y: 4 }}
        animate={inView ? { opacity: 1, scale: 1, y: 0 } : undefined}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        {value}
      </motion.span>
    );
  }

  return (
    <span ref={ref} className={className}>
      {inView ? display : value}
    </span>
  );
};