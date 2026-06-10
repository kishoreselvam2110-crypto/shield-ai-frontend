import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  count?: number;
  height?: string;
  rounded?: string;
}

export function Skeleton({ className = '', height = 'h-4', rounded = 'rounded-md' }: SkeletonProps) {
  return (
    <div
      className={`relative overflow-hidden bg-white/5 ${height} ${rounded} ${className}`}
    >
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(90deg, transparent 0%, rgba(0,240,255,0.08) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
        }}
        animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-6 rounded-2xl space-y-4">
      <Skeleton height="h-6" className="w-1/3" />
      <Skeleton height="h-4" className="w-full" />
      <Skeleton height="h-4" className="w-5/6" />
      <Skeleton height="h-4" className="w-3/4" />
    </div>
  );
}

export function MapSkeleton() {
  return (
    <div className="relative w-full h-full min-h-[420px] rounded-2xl overflow-hidden bg-[#0a0a14] border border-white/10 flex items-center justify-center">
      <motion.div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(135deg, transparent 40%, rgba(0,240,255,0.04) 50%, transparent 60%)',
          backgroundSize: '300% 300%',
        }}
        animate={{ backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
      />
      <div className="flex flex-col items-center gap-3 text-center z-10">
        <div className="w-10 h-10 border-2 border-cyan-400 rounded-full border-t-transparent animate-spin" />
        <span className="text-xs text-gray-500 uppercase tracking-widest">Loading Map</span>
      </div>
    </div>
  );
}
