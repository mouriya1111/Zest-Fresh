"use client";

import { motion } from "framer-motion";

export function Reveal({
  children,
  delay = 0
}: Readonly<{
  children: React.ReactNode;
  delay?: number;
}>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.65, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
