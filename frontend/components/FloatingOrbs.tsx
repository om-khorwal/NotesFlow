'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState, useMemo } from 'react';

interface Orb {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
}

/**
 * Seeded random number generator for consistent orb generation.
 * This ensures the same orbs are generated on every render after hydration.
 */
function seededRandom(seed: number): () => number {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/**
 * Generate orbs with a seeded random for consistency.
 * Only called client-side after hydration.
 */
function generateOrbs(count: number): Orb[] {
  const random = seededRandom(42); // Fixed seed for consistency
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 30 + random() * 90,
    left: random() * 100,
    duration: 6 + random() * 6,
    delay: random() * 2,
  }));
}

export default function FloatingOrbs() {
  const [mounted, setMounted] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Only render orbs after client-side hydration to prevent mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate orbs only once, memoized for performance
  const orbs = useMemo(() => (mounted ? generateOrbs(50) : []), [mounted]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 via-purple-700 to-indigo-600" />

      {orbs.map((orb) => (
        <motion.span
          key={orb.id}
          className="absolute bottom-[-200px] rounded-full bg-white/15 backdrop-blur-sm border border-white/25"
          style={{
            width: `${orb.size}px`,
            height: `${orb.size}px`,
            left: `${orb.left}%`,
          }}
          animate={
            prefersReducedMotion
              ? undefined
              : {
                  y: [0, -1400],
                  opacity: [0, 0.9, 0.9, 0],
                  scale: [0.8, 1.05, 1],
                }
          }
          transition={
            prefersReducedMotion
              ? undefined
              : {
                  duration: orb.duration,
                  repeat: Infinity,
                  delay: orb.delay,
                  ease: 'linear',
                }
          }
        />
      ))}
    </div>
  );
}
