'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Orb {
  size: number;
  left: number;
  duration: number;
  delay: number;
}

export default function FloatingOrbs() {
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    const generated = Array.from({ length: 50 }).map(() => ({
      size: 30 + Math.random() * 90,
      left: Math.random() * 100,
      duration: 6 + Math.random() * 6,
      delay: Math.random() * 2,
    }));

    setOrbs(generated);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 via-purple-700 to-indigo-600" />

      {orbs.map((orb, i) => (
        <motion.span
          key={i}
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
