import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface SOSButtonProps {
  onTrigger: () => void;
  disabled?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
}

export default function SOSButton({ onTrigger, disabled = false, label = 'SOS', size = 'lg' }: SOSButtonProps) {
  const sizeMap = {
    sm: { btn: 'w-20 h-20', icon: 'w-6 h-6', text: 'text-xs', ring1: 'scale-125', ring2: 'scale-150' },
    md: { btn: 'w-28 h-28', icon: 'w-8 h-8', text: 'text-sm', ring1: 'scale-125', ring2: 'scale-150' },
    lg: { btn: 'w-36 h-36', icon: 'w-10 h-10', text: 'text-base', ring1: 'scale-125', ring2: 'scale-160' },
  };
  const s = sizeMap[size];

  const handleClick = () => {
    if (disabled) return;
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([200, 100, 200]);
    }
    onTrigger();
  };

  return (
    <div className="relative flex items-center justify-center">
      {/* Outer pulsing rings */}
      <motion.div
        className={`absolute ${s.btn} rounded-full bg-red-500/20`}
        animate={{ scale: [1, 1.4, 1], opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className={`absolute ${s.btn} rounded-full bg-red-500/10`}
        animate={{ scale: [1, 1.7, 1], opacity: [0.4, 0, 0.4] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
      />
      <motion.div
        className={`absolute ${s.btn} rounded-full bg-[#FF00FF]/10`}
        animate={{ scale: [1, 1.9, 1], opacity: [0.3, 0, 0.3] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
      />

      {/* Main SOS button */}
      <motion.button
        onClick={handleClick}
        disabled={disabled}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.93 }}
        animate={{ scale: [1, 1.03, 1] }}
        transition={{ scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' } }}
        className={`relative ${s.btn} rounded-full flex flex-col items-center justify-center gap-1 cursor-pointer z-10 disabled:opacity-50 disabled:cursor-not-allowed`}
        style={{
          background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
          border: '4px solid rgba(255,255,255,0.25)',
          boxShadow: '0 0 30px #ff3131, 0 0 60px #FF00FF30',
        }}
      >
        <Shield className={`${s.icon} text-white`} />
        <span className={`${s.text} font-extrabold text-white tracking-widest uppercase`}>{label}</span>
      </motion.button>
    </div>
  );
}
