"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/**
 * App Router page transition: quick fade + small rise. Opacity/transform only,
 * so no layout shift; skipped entirely under prefers-reduced-motion.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion();
  if (reduceMotion) return <>{children}</>;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
