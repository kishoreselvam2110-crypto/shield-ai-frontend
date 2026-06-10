import React from 'react';
import { motion } from 'framer-motion';

interface GlowingCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function GlowingCard({ children, className }: GlowingCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className={`glass-card ${className ? className : ''} relative group`}
    >
      {/* Neon border overlay */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500 to-pink-500 opacity-0 group-hover:opacity-30 transition-opacity" />
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
