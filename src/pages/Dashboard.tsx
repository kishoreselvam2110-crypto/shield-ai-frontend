import { useAppStore } from '../store/useAppStore';
import { useTranslation } from '../i18n';
import { FileText, Map, Shield, AlertTriangle, LogOut, Languages, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface DashboardProps {
  setView: (view: 'dashboard' | 'digital-id' | 'trip-planner' | 'wilderness' | 'admin') => void;
}


const menuItems = [
  {
    id: 'digital-id' as const,
    title: 'Digital ID',
    desc: 'Secure encrypted digital passport & emergency QR profile.',
    icon: FileText,
    gradient: 'from-cyan-500 to-blue-500',
    glow: '#00FFFF',
    demoId: 'demo-card-1',
  },
  {
    id: 'trip-planner' as const,
    title: 'Trip Planner',
    desc: 'AI-powered travel itineraries with live safety assessments.',
    icon: Map,
    gradient: 'from-purple-500 to-indigo-500',
    glow: '#8B5CF6',
    demoId: 'demo-card-2',
  },
  {
    id: 'wilderness' as const,
    title: 'SOS & Wilderness',
    desc: 'Instant SOS, fall detection, voice triggers & geofencing.',
    icon: Shield,
    gradient: 'from-pink-500 to-red-500',
    glow: '#FF00FF',
    demoId: 'demo-card-3',
  },
  {
    id: 'admin' as const,
    title: 'Admin Centre',
    desc: 'Real-time safety map, geofence alerts & E-FIR generation.',
    icon: AlertTriangle,
    gradient: 'from-amber-500 to-orange-500',
    glow: '#F59E0B',
    demoId: 'demo-card-4',
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};

const cardVariants = {
  hidden:  { opacity: 0, y: 30, scale: 0.95 },
  visible: { opacity: 1, y: 0,  scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function Dashboard({ setView }: DashboardProps) {
  const { t, language } = useTranslation();
  const user = useAppStore((state) => state.user);
  const logout = useAppStore((state) => state.logout);
  const setLanguage = useAppStore((state) => state.setLanguage);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-[#030306] flex flex-col p-4 md:p-8 relative overflow-hidden pb-24 md:pb-8">
      {/* Grid lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      {/* Ambient glows */}
      <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-500/8 rounded-full blur-[130px] pointer-events-none" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="z-10 flex flex-col sm:flex-row justify-between items-center gap-4 mb-10 w-full max-w-6xl mx-auto border-b border-white/8 pb-6"
      >
        <div className="flex items-center gap-3">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Shield className="w-9 h-9 text-cyan-400" style={{ filter: 'drop-shadow(0 0 8px #00FFFF)' }} />
          </motion.div>
          <div>
            <h1 className="text-2xl font-bold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-200 to-cyan-400">
              SHIELD AI
            </h1>
            <p className="text-[10px] text-gray-500 tracking-[0.3em] uppercase">Smart Tourist Safety</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setLanguage(language === 'en' ? 'hi' : 'en')}
            className="ripple flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-semibold text-gray-300 transition-colors"
          >
            <Languages className="w-4 h-4 text-cyan-400" />
            <span>{language === 'en' ? 'हिन्दी' : 'English'}</span>
          </button>
          <button
            onClick={logout}
            className="ripple flex items-center gap-2 px-3 py-1.5 rounded-lg border border-red-500/20 bg-red-950/20 hover:bg-red-950/40 text-xs font-semibold text-red-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>{t('logout')}</span>
          </button>
        </div>
      </motion.header>

      <main className="z-10 flex-1 max-w-6xl w-full mx-auto flex flex-col justify-center">
        {/* Greeting */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="mb-8 flex items-start justify-between"
        >
          <div>
            <p className="text-sm text-gray-500 mb-1">{t('welcome')},</p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              {user?.full_name}
            </h2>
            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-cyan-500" />
              Your safety dashboard is active
            </p>
          </div>
          {/* Live status badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400 font-semibold">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            LIVE
          </div>
        </motion.div>

        {/* Dashboard grid with staggered cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isHovered = hoveredId === item.id;
            return (
              <motion.button
                key={item.id}
                id={item.demoId}
                variants={cardVariants}
                onClick={() => setView(item.id)}
                onHoverStart={() => setHoveredId(item.id)}
                onHoverEnd={() => setHoveredId(null)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="ripple glass-card text-left p-6 md:p-7 rounded-2xl flex items-start gap-5 cursor-pointer relative overflow-hidden group"
                style={{
                  borderColor: isHovered ? `${item.glow}40` : undefined,
                  boxShadow: isHovered ? `0 8px 32px ${item.glow}20, 0 0 0 1px ${item.glow}20` : undefined,
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Left colour stripe */}
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${item.gradient} opacity-70`} />

                {/* Icon */}
                <div
                  className={`p-3.5 rounded-xl bg-gradient-to-br ${item.gradient} text-white shrink-0 transition-transform duration-300 group-hover:scale-110`}
                  style={{ boxShadow: isHovered ? `0 0 16px ${item.glow}60` : undefined }}
                >
                  <Icon className="w-7 h-7" />
                </div>

                {/* Text */}
                <div className="space-y-1.5 flex-1">
                  <h3
                    className="text-lg font-bold text-white transition-colors duration-200"
                    style={{ color: isHovered ? item.glow : undefined }}
                  >
                    {item.title}
                  </h3>
                  <p className="text-gray-400 text-sm font-light leading-relaxed">{item.desc}</p>
                </div>

                {/* Hover arrow indicator */}
                <AnimatePresence>
                  {isHovered && (
                    <motion.div
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -6 }}
                      className="shrink-0 self-center"
                      style={{ color: item.glow }}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </motion.div>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="z-10 mt-10 text-center text-[10px] text-gray-700 w-full max-w-6xl mx-auto border-t border-white/5 pt-4 tracking-widest uppercase"
      >
        SHIELD AI • v2.0 • Safe Traveling Reinvented
      </motion.footer>
    </div>
  );
}
