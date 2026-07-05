"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

/**
 * Grid-card wrapper: staggered fade-in on mount plus a gentle hover/tap
 * interaction. Opacity/transform only (no layout shift); renders a plain div
 * under prefers-reduced-motion.
 */
export default function MotionCard({
  children,
  index = 0,
  className = "h-full",
}: {
  children: ReactNode;
  index?: number;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.25,
        delay: Math.min(index * 0.04, 0.4),
        ease: "easeOut",
      }}
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
    >
      {children}
    </motion.div>
  );
}
