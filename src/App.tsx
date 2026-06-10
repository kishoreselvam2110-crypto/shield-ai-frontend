import { useState, useEffect } from 'react';
import { useAppStore } from './store/useAppStore';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import DigitalID from './pages/DigitalID';
import TripPlanner from './pages/TripPlanner';
import Wilderness from './pages/Wilderness';
import AdminCentre from './pages/AdminCentre';
import { AnimatePresence, motion } from 'framer-motion';
import { ToastProvider } from './components/ToastProvider';
import BottomNavBar from './components/BottomNavBar';
import DemoMode from './components/DemoMode';

type ViewType = 'dashboard' | 'digital-id' | 'trip-planner' | 'wilderness' | 'admin';

const pageVariants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { opacity: 0, scale: 0.97, y: -6, transition: { duration: 0.2, ease: 'easeIn' } },
};

export default function App() {
  const user = useAppStore((state) => state.user);
  const [view, setView] = useState<ViewType>('dashboard');
  const [showDemo, setShowDemo] = useState(false);

  // Register PWA service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((reg) => console.log('🛡️ SW registered:', reg.scope))
          .catch((err) => console.error('🛡️ SW failed:', err));
      });
    }
  }, []);

  // Auto-start demo tour after login
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => setShowDemo(true), 1200);
      return () => clearTimeout(timer);
    }
  }, [user]);

  if (!user) return (
    <ToastProvider>
      <Landing />
    </ToastProvider>
  );

  return (
    <ToastProvider>
      {/* Demo tour overlay */}
      {showDemo && (
        <DemoMode
          showMicVisualizer={view === 'wilderness'}
          onComplete={() => setShowDemo(false)}
        />
      )}

      {/* Main page with AnimatePresence transitions */}
      <AnimatePresence mode="wait">
        {view === 'dashboard' && (
          <motion.div key="dashboard" {...pageVariants}>
            <Dashboard setView={setView} />
          </motion.div>
        )}
        {view === 'digital-id' && (
          <motion.div key="digital-id" {...pageVariants}>
            <DigitalID onBack={() => setView('dashboard')} />
          </motion.div>
        )}
        {view === 'trip-planner' && (
          <motion.div key="trip-planner" {...pageVariants}>
            <TripPlanner onBack={() => setView('dashboard')} />
          </motion.div>
        )}
        {view === 'wilderness' && (
          <motion.div key="wilderness" {...pageVariants}>
            <Wilderness onBack={() => setView('dashboard')} />
          </motion.div>
        )}
        {view === 'admin' && (
          <motion.div key="admin" {...pageVariants}>
            <AdminCentre onBack={() => setView('dashboard')} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom nav – only shown when logged in */}
      <BottomNavBar currentView={view} onNavigate={setView} />
    </ToastProvider>
  );
}
