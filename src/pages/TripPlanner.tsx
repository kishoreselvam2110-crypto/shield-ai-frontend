import React, { useState, Suspense, lazy } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from '../i18n';
import { ArrowLeft, Loader2, Sparkles, Navigation, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapSkeleton } from '../components/Skeleton';
import { useToast } from '../components/ToastProvider';

const MapLibreMap = lazy(() => import('../components/MapLibreMap'));

interface TripPlannerProps {
  onBack: () => void;
}

export default function TripPlanner({ onBack }: TripPlannerProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const trip = useAppStore((state) => state.trip);
  const setTrip = useAppStore((state) => state.setTrip);

  const [destination, setDestination] = useState(trip?.destination || '');
  const [days, setDays] = useState(trip?.days || 2);
  const [budget, setBudget] = useState(trip?.budget || '');
  const [prefLanguage, setPrefLanguage] = useState(trip?.language || 'en');
  const [loading, setLoading] = useState(false);

  const handlePlanTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    showToast('Planning your safest trip…', 'info');

    try {
      const response = await fetch('/api/smart-trip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ destination, days, budget, language: prefLanguage }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error('Failed to plan trip');

      setTrip(data);
      showToast(`✈️ Itinerary for ${destination} ready!`, 'success');
    } catch (error) {
      console.error(error);
      showToast('Failed to generate trip plan. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#030306] flex flex-col p-4 md:p-8 relative overflow-hidden pb-24 md:pb-8">
      {/* Ambient */}
      <div className="absolute top-[-5%] right-[-5%] w-80 h-80 bg-purple-500/8 rounded-full blur-[100px] pointer-events-none" />

      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 flex items-center justify-between mb-8 w-full max-w-6xl mx-auto"
      >
        <button
          onClick={onBack}
          className="ripple flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('dashboard')}</span>
        </button>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-400" style={{ filter: 'drop-shadow(0 0 4px #8B5CF6)' }} />
          <span className="font-bold text-white tracking-widest text-sm uppercase">Smart Trip Planner</span>
        </div>
      </motion.header>

      <main className="z-10 flex-grow max-w-6xl w-full mx-auto flex flex-col lg:flex-row gap-6">
        {/* Left Panel */}
        <div className="w-full lg:w-5/12 flex flex-col gap-5">
          {/* Form */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="glass-card p-6 rounded-2xl border border-white/8"
          >
            <h3 className="text-lg font-bold text-white mb-4">Plan Your Safest Trip</h3>
            <form onSubmit={handlePlanTrip} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Destination</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goa, Paris, Tokyo…"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none text-white text-sm transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">{t('tripDays')}</label>
                  <input
                    type="number" min={1} max={14}
                    value={days}
                    onChange={(e) => setDays(Number(e.target.value))}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none text-white text-sm transition-colors"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">{t('tripBudget')}</label>
                  <input
                    type="text"
                    placeholder="Budget ($)"
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none text-white text-sm transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">{t('tripLang')}</label>
                <select
                  value={prefLanguage}
                  onChange={(e) => setPrefLanguage(e.target.value)}
                  className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-purple-400 focus:ring-1 focus:ring-purple-400 outline-none text-white text-sm transition-colors"
                >
                  <option value="en">English</option>
                  <option value="hi">हिन्दी</option>
                </select>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                className="ripple w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-extrabold rounded-xl transition-all text-xs tracking-wider uppercase flex items-center justify-center gap-2 disabled:opacity-60"
                style={{ boxShadow: '0 0 20px #8B5CF640' }}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                <span>{loading ? 'Analyzing Routes…' : t('planTrip')}</span>
              </motion.button>
            </form>
          </motion.div>

          {/* Itinerary list */}
          <AnimatePresence>
            {trip && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex-1 overflow-y-auto max-h-[380px] space-y-3 pr-1"
              >
                <h4 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-2">Itinerary Routes</h4>
                {trip.itinerary.map((dayData, idx) => (
                  <motion.div
                    key={dayData.day}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.12 }}
                    className="glass-card p-4 rounded-xl border border-white/5 space-y-2"
                  >
                    <div className="flex justify-between items-center border-b border-white/8 pb-2">
                      <span className="text-sm font-bold text-white">Day {dayData.day}</span>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-bold">OPTIMAL SAFETY</span>
                    </div>
                    {dayData.attractions.map((attr, aIdx) => (
                      <div key={aIdx} className="flex gap-3 items-start">
                        <MapPin className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h5 className="text-sm font-semibold text-white">{attr.name}</h5>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${attr.safety_level === 'safe' ? 'bg-green-500/25 text-green-300' : 'bg-yellow-500/25 text-yellow-300'}`}>
                              {(attr.safety_level as string).toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">{attr.description}</p>
                        </div>
                      </div>
                    ))}
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Map panel */}
        <div className="flex-1 min-h-[420px] lg:min-h-0 w-full">
          <Suspense fallback={<MapSkeleton />}>
            <MapLibreMap trip={trip} />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
