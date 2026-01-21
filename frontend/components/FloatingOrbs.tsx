 import { motion } from 'framer-motion';

export default function FloatingOrbs() {
  return (
    <>
 {/* Bubble Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-800 via-purple-700 to-indigo-600" />

        {Array.from({ length: 50 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute bottom-[-200px] rounded-full bg-white/15 backdrop-blur-sm border border-white/25"
            style={{
              width: `${30 + Math.random() * 90}px`,
              height: `${30 + Math.random() * 90}px`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -1400],
              opacity: [0, 0.9, 0.9, 0],
              scale: [0.8, 1.05, 1],
            }}
            transition={{
              duration: 6 + Math.random() * 6,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: 'linear',
            }}
          />
        ))}
      </div>
    </>
  );
}