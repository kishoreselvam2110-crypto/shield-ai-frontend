import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from '../i18n';
import { ArrowLeft, AlertTriangle, ShieldAlert, Wifi, WifiOff, Mic, MicOff, Activity, CloudRain } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import SOSButton from '../components/SOSButton';
import { useToast } from '../components/ToastProvider';
import { MapSkeleton } from '../components/Skeleton';

const MapLibreMap = lazy(() => import('../components/MapLibreMap'));

interface WildernessProps {
  onBack: () => void;
}

export default function Wilderness({ onBack }: WildernessProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const user = useAppStore((state) => state.user);
  const offlineQueue = useAppStore((state) => state.offlineQueue);
  const addToOfflineQueue = useAppStore((state) => state.addToOfflineQueue);
  const removeFromOfflineQueue = useAppStore((state) => state.removeFromOfflineQueue);

  const [lat, setLat] = useState(15.5539);
  const [lng, setLng] = useState(73.7553);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isListening, setIsListening] = useState(false);
  const [geofenceBreach, setGeofenceBreach] = useState(false);
  const [activeBreachedZone, setActiveBreachedZone] = useState<string | null>(null);

  const [fallDetected, setFallDetected] = useState(false);
  const [countdown, setCountdown] = useState(10);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const recognitionRef = useRef<any>(null);
  const socketRef = useRef<Socket | null>(null);

  const simulatedDangerZones = [
    { name: 'Zone Alpha - High Rip Currents', lat: 15.5494, lng: 73.7536, radius: 300, level: 'high' as const },
    { name: 'Zone Beta - Rockfall Hazard', lat: 15.5800, lng: 73.7400, radius: 500, level: 'medium' as const },
    { name: 'Zone Gamma - Restricted Forest', lat: 15.5200, lng: 73.7900, radius: 400, level: 'high' as const },
  ];

  // Online / Offline
  useEffect(() => {
    const goOnline = () => { setIsOnline(true); retryOfflineQueue(); };
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, [offlineQueue]);

  // Socket & Live Tracking
  useEffect(() => {
    socketRef.current = io('http://localhost:3000');
    const trackInterval = setInterval(() => {
      navigator.geolocation.getCurrentPosition(
        (pos) => updatePosition(pos.coords.latitude, pos.coords.longitude),
        () => updatePosition(lat + (Math.random() - 0.5) * 0.001, lng + (Math.random() - 0.5) * 0.001),
        { enableHighAccuracy: true }
      );
    }, 5000);
    return () => { clearInterval(trackInterval); socketRef.current?.disconnect(); };
  }, [lat, lng]);

  // Voice wake word
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      const rec = new SR();
      rec.continuous = true; rec.interimResults = false; rec.lang = 'en-US';
      rec.onresult = (e: any) => {
        const text = e.results[e.results.length - 1][0].transcript.toLowerCase();
        if (text.includes('shield help') || text.includes('help me')) {
          triggerSOS('Voice Activated Wake Word Command Triggered!');
        }
      };
      rec.onerror = () => { if (isListening) rec.start(); };
      recognitionRef.current = rec;
    }
  }, [isListening]);

  // Fall countdown
  useEffect(() => {
    if (fallDetected && countdown > 0) {
      countdownIntervalRef.current = setInterval(() => setCountdown((p) => p - 1), 1000);
    } else if (countdown === 0 && fallDetected) {
      triggerSOS('Auto SOS: Hard fall anomaly telemetry detected.');
      cancelFallAlert();
    }
    return () => { if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current); };
  }, [fallDetected, countdown]);

  const updatePosition = async (latitude: number, longitude: number) => {
    setLat(latitude); setLng(longitude);
    try {
      const res = await fetch('/api/track', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id, latitude, longitude, telemetry: { battery: 94, panic: false } }),
      });
      const data = await res.json();
      if (data.status === 'danger_breach') {
        setGeofenceBreach(true);
        setActiveBreachedZone(data.zones[0].name);
        if (Notification.permission === 'granted') {
          new Notification('⚠️ SHIELD AI Warning', { body: `Entered dangerous area: ${data.zones[0].name}` });
        }
      } else {
        setGeofenceBreach(false); setActiveBreachedZone(null);
      }
    } catch { /* offline fallback */ }
  };

  const triggerSOS = async (customMsg = 'Distress Alert: Immediate assistance required!') => {
    const sosPayload = {
      id: Math.random().toString(36).substring(7),
      latitude: lat, longitude: lng, message: customMsg,
      timestamp: new Date().toISOString(),
      telemetry: { battery: 88, panic: true, fall_detected: fallDetected },
    };

    if (!isOnline) {
      addToOfflineQueue(sosPayload);
      showToast('⚠️ Offline: SOS queued. Will auto-retry when back online.', 'warning');
      return;
    }

    try {
      const res = await fetch('/api/alerts', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id, ...sosPayload, alert_type: 'SOS' }),
      });
      if (!res.ok) throw new Error();
      showToast('🚨 SOS Alert transmitted successfully!', 'error');
    } catch {
      addToOfflineQueue(sosPayload);
      showToast('Transmission failed. Queued offline.', 'warning');
    }
  };

  const retryOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    for (const alert of offlineQueue) {
      try {
        await fetch('/api/alerts', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ user_id: user?.id, latitude: alert.latitude, longitude: alert.longitude, alert_type: 'SOS', message: alert.message, telemetry: alert.telemetry, offline_queued: true }),
        });
        removeFromOfflineQueue(alert.id);
      } catch { break; }
    }
  };

  const toggleVoiceWake = () => {
    if (!recognitionRef.current) { showToast('Speech Recognition not supported', 'warning'); return; }
    if (isListening) { recognitionRef.current.stop(); setIsListening(false); }
    else { recognitionRef.current.start(); setIsListening(true); }
  };

  const simulateSuddenFall = () => { setFallDetected(true); setCountdown(10); };
  const cancelFallAlert = () => { setFallDetected(false); if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current); };

  return (
    <div className="min-h-screen bg-[#030306] flex flex-col p-4 md:p-8 relative overflow-hidden pb-24 md:pb-8">
      {/* Geofence breach flash border */}
      <AnimatePresence>
        {geofenceBreach && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 pointer-events-none z-50 geofence-breach-border rounded-xl"
          />
        )}
      </AnimatePresence>

      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 flex items-center justify-between mb-6 w-full max-w-7xl mx-auto"
      >
        <button onClick={onBack} className="ripple flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>{t('dashboard')}</span>
        </button>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-xs">
            {isOnline ? (<><Wifi className="w-4 h-4 text-emerald-400" /><span className="text-emerald-400">ONLINE</span></>) : (<><WifiOff className="w-4 h-4 text-red-500" /><span className="text-red-500">OFFLINE</span></>)}
          </div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse" />
            <span className="font-extrabold text-white tracking-widest text-sm uppercase">Wilderness Room</span>
          </div>
        </div>
      </motion.header>

      <main className="z-10 flex-grow max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-6">
        {/* Controls Panel */}
        <div className="w-full lg:w-4/12 flex flex-col gap-5">
          {/* Geofence alert */}
          <AnimatePresence>
            {geofenceBreach && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1, transition: { type: 'spring', stiffness: 200 } }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="p-5 bg-red-950/60 border border-red-500 rounded-2xl flex gap-4 items-center animate-breach-pulse"
              >
                <div className="p-3 bg-red-600 rounded-xl text-white shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white uppercase tracking-wider text-sm">{t('highRiskZone')}</h4>
                  <p className="text-xs text-red-200 mt-0.5">{activeBreachedZone}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Fall alert */}
          <AnimatePresence>
            {fallDetected && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness: 200 } }}
                exit={{ opacity: 0 }}
                className="p-5 bg-orange-950/60 border border-orange-500 rounded-2xl space-y-3 animate-breach-pulse"
                style={{ '--tw-ring-color': '#FF5500' } as React.CSSProperties}
              >
                <div className="flex items-center gap-3">
                  <Activity className="w-6 h-6 text-orange-500 animate-pulse" />
                  <h4 className="font-bold text-white text-sm">Hard Fall Detected!</h4>
                </div>
                <p className="text-xs text-gray-300">Auto-sending distress SOS in <span className="font-bold text-orange-500 text-lg">{countdown}s</span>.</p>
                <div className="flex gap-3 mt-1">
                  <button onClick={cancelFallAlert} className="ripple flex-grow py-2 bg-orange-500 hover:bg-orange-400 text-black font-bold text-xs rounded-lg uppercase tracking-wider">I am Safe</button>
                  <button onClick={() => triggerSOS('SOS: Manual fall emergency override.')} className="ripple py-2 px-4 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-lg uppercase tracking-wider">Send Now</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* SOS Controls */}
          <div className="glass-card p-6 rounded-2xl border border-white/8 flex flex-col items-center justify-center text-center space-y-6">
            <h3 className="text-sm font-bold tracking-widest text-gray-400 uppercase">Emergency Distress System</h3>

            <SOSButton
              onTrigger={() => triggerSOS('Emergency SOS: Manual distress override activated.')}
              size="lg"
            />

            {offlineQueue.length > 0 && (
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-[10px] font-bold uppercase"
              >
                {offlineQueue.length} {t('offlinePending')}
              </motion.div>
            )}

            <div className="w-full grid grid-cols-2 gap-3">
              <button onClick={simulateSuddenFall} className="ripple py-2.5 px-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center justify-center gap-2 text-xs font-semibold text-gray-300 transition-colors">
                <Activity className="w-4 h-4 text-orange-500" />
                <span>Test Fall</span>
              </button>
              <button
                onClick={toggleVoiceWake}
                className={`ripple py-2.5 px-3 border rounded-xl flex items-center justify-center gap-2 text-xs font-semibold transition-colors ${isListening ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300' : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'}`}
              >
                {isListening ? <Mic className="w-4 h-4 text-cyan-400" /> : <MicOff className="w-4 h-4 text-gray-500" />}
                <span>Voice Help</span>
              </button>
            </div>

            {/* Telemetry readout */}
            <div className="w-full text-left bg-black/40 p-4 border border-white/5 rounded-xl text-[10px] space-y-1.5 font-mono text-gray-500">
              <div className="flex justify-between"><span>GPS POSITION:</span><span className="text-white">{lat.toFixed(6)}, {lng.toFixed(6)}</span></div>
              <div className="flex justify-between"><span>ACTIVE GEOTRACKING:</span><span className="text-cyan-400">EVERY 5 SECONDS</span></div>
              <div className="flex justify-between"><span>VOICE MONITOR:</span><span className={isListening ? 'text-cyan-400' : 'text-gray-600'}>{isListening ? 'ACTIVE' : 'MUTED'}</span></div>
            </div>
          </div>

          {/* Weather warning */}
          <div className="glass-card p-4 rounded-xl border border-white/5 flex gap-4 items-center">
            <CloudRain className="w-8 h-8 text-cyan-400 shrink-0 glow-idle" />
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Meteorology Warning</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Scattered storms with high wind alerts over coastal corridors.</p>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="flex-grow min-h-[420px] lg:min-h-0 w-full">
          <Suspense fallback={<MapSkeleton />}>
            <MapLibreMap
              center={[lat, lng]}
              zoom={14}
              markers={[{ lat, lng, color: '#00f0ff', popup: 'Your Location' }]}
              geofenceZones={simulatedDangerZones}
            />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
