import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DemoModeProps {
  /** The tourist path coordinates [lat, lng] to animate */
  path?: Array<[number, number]>;
  /** Whether to show the mic visualizer */
  showMicVisualizer?: boolean;
  /** Callback when demo sequence finishes */
  onComplete?: () => void;
}

const STEPS = [
  { target: 'demo-card-1', label: 'Digital ID – Secure your profile' },
  { target: 'demo-card-2', label: 'Trip Planner – AI-powered itineraries' },
  { target: 'demo-card-3', label: 'SOS – Instant distress alert' },
  { target: 'demo-card-4', label: 'Admin – Real-time safety feed' },
];

export default function DemoMode({ showMicVisualizer = false, onComplete }: DemoModeProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [visible, setVisible] = useState(true);
  const [bars, setBars] = useState<number[]>(Array(12).fill(4));
  const animFrameRef = useRef<number | null>(null);

  // Animate mic visualizer bars
  useEffect(() => {
    if (!showMicVisualizer) return;
    const animate = () => {
      setBars(Array.from({ length: 12 }, () => Math.random() * 36 + 4));
      animFrameRef.current = requestAnimationFrame(animate);
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, [showMicVisualizer]);

  // Step through highlights
  useEffect(() => {
    if (!visible) return;
    if (stepIdx >= STEPS.length) {
      setTimeout(() => {
        setVisible(false);
        onComplete?.();
      }, 800);
      return;
    }
    const timer = setTimeout(() => setStepIdx((i) => i + 1), 2200);
    return () => clearTimeout(timer);
  }, [stepIdx, visible]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      {/* Demo banner at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-[9998] flex items-center gap-4"
        style={{
          background: 'rgba(5,5,12,0.96)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(0,240,255,0.25)',
          borderRadius: '1rem',
          padding: '10px 20px',
          boxShadow: '0 0 24px rgba(0,240,255,0.15)',
          minWidth: '280px',
        }}
      >
        {/* Demo dot */}
        <div className="flex gap-1 items-center shrink-0">
          {STEPS.map((_, i) => (
            <motion.div
              key={i}
              className="rounded-full"
              animate={{
                width: i === stepIdx ? 18 : 6,
                background: i === stepIdx ? '#00f0ff' : 'rgba(255,255,255,0.2)',
              }}
              style={{ height: 6 }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>

        {/* Current step label */}
        <AnimatePresence mode="wait">
          <motion.span
            key={stepIdx}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="text-xs text-cyan-300 font-semibold flex-1"
          >
            {stepIdx < STEPS.length ? `✦ ${STEPS[stepIdx].label}` : '✓ Tour Complete!'}
          </motion.span>
        </AnimatePresence>

        <button
          onClick={() => { setVisible(false); onComplete?.(); }}
          className="text-gray-600 hover:text-white transition-colors text-[10px] shrink-0"
        >
          SKIP
        </button>
      </motion.div>

      {/* Microphone visualizer */}
      {showMicVisualizer && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="fixed bottom-36 md:bottom-24 left-1/2 -translate-x-1/2 z-[9997] flex items-end gap-1"
          style={{ height: 48 }}
        >
          {bars.map((h, i) => (
            <motion.div
              key={i}
              className="w-1 rounded-full"
              animate={{ height: h }}
              transition={{ duration: 0.08, ease: 'linear' }}
              style={{
                background: `hsl(${180 + i * 8}, 100%, 65%)`,
                boxShadow: `0 0 6px hsl(${180 + i * 8}, 100%, 65%)`,
                minHeight: 4,
              }}
            />
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
