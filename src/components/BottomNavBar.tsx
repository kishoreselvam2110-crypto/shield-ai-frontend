import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Map, Shield, AlertTriangle } from 'lucide-react';

type ViewType = 'dashboard' | 'digital-id' | 'trip-planner' | 'wilderness' | 'admin';

interface BottomNavBarProps {
  currentView: ViewType;
  onNavigate: (view: ViewType) => void;
}

const navItems: { id: ViewType; label: string; Icon: React.FC<any> }[] = [
  { id: 'dashboard',    label: 'Home',    Icon: Shield },
  { id: 'digital-id',  label: 'ID',      Icon: FileText },
  { id: 'trip-planner',label: 'Trip',    Icon: Map },
  { id: 'wilderness',  label: 'SOS',     Icon: AlertTriangle },
];

export default function BottomNavBar({ currentView, onNavigate }: BottomNavBarProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around px-2 py-2 md:hidden"
      style={{
        background: 'rgba(5,5,10,0.95)',
        backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {navItems.map(({ id, label, Icon }) => {
        const active = currentView === id;
        return (
          <motion.button
            key={id}
            onClick={() => onNavigate(id)}
            whileTap={{ scale: 0.88 }}
            className="relative flex flex-col items-center gap-0.5 px-5 py-2 rounded-xl transition-colors"
          >
            {active && (
              <motion.div
                layoutId="nav-pill"
                className="absolute inset-0 rounded-xl"
                style={{ background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
            <Icon
              className={`w-5 h-5 transition-colors ${active ? 'text-cyan-400' : 'text-gray-500'}`}
              style={active ? { filter: 'drop-shadow(0 0 4px #00f0ff)' } : {}}
            />
            <span className={`text-[10px] font-semibold tracking-wide transition-colors ${active ? 'text-cyan-400' : 'text-gray-600'}`}>
              {label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
}
