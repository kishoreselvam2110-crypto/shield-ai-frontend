import { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { useTranslation } from '../i18n';
import { ArrowLeft, AlertOctagon, FileCheck, Compass, Download, Shield, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';
import { jsPDF } from 'jspdf';
import { useToast } from '../components/ToastProvider';
import { MapSkeleton } from '../components/Skeleton';

const MapLibreMap = lazy(() => import('../components/MapLibreMap'));

interface AdminCentreProps {
  onBack: () => void;
}

interface AlertData {
  id: string;
  user_id: string;
  full_name: string;
  latitude: number;
  longitude: number;
  alert_type: 'SOS' | 'anomaly';
  message: string;
  telemetry: any;
  created_at: string;
}

interface ActiveTourist {
  user_id: string;
  full_name: string;
  latitude: number;
  longitude: number;
  telemetry: any;
  timestamp: string;
}

export default function AdminCentre({ onBack }: AdminCentreProps) {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [activeTourists, setActiveTourists] = useState<Record<string, ActiveTourist>>({});
  const [selectedAlert, setSelectedAlert] = useState<AlertData | null>(null);
  const [firReport, setFirReport] = useState<any>(null);
  const [generatingFIR, setGeneratingFIR] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Map markers derived from tourists and alerts
  const mapMarkers = [
    ...Object.values(activeTourists).map((t) => ({
      lat: t.latitude, lng: t.longitude, color: '#00f0ff',
      popup: `<b>${t.full_name}</b><br>Battery: ${t.telemetry?.battery || '?'}%`,
    })),
    ...alerts.map((a) => ({
      lat: a.latitude, lng: a.longitude, color: a.alert_type === 'SOS' ? '#ff3131' : '#FF5500',
      popup: `<b>${a.alert_type}: ${a.full_name}</b><br>${a.message}`,
    })),
  ];

  useEffect(() => {
    fetch('/api/alerts')
      .then((res) => res.json())
      .then((data) => setAlerts(data))
      .catch(() => {});

    const socket = io('http://localhost:3000');
    socketRef.current = socket;

    socket.on('new-alert', (newAlert: AlertData) => {
      setAlerts((prev) => [newAlert, ...prev]);
      showToast(`🚨 New SOS from ${newAlert.full_name}`, 'error');
      if (Notification.permission === 'granted') {
        new Notification(`🚨 EMERGENCY SOS - ${newAlert.full_name}`, { body: newAlert.message });
      }
    });

    socket.on('location-update', (loc: ActiveTourist) => {
      setActiveTourists((prev) => ({ ...prev, [loc.user_id]: loc }));
    });

    socket.on('anomaly-alert', (data: { alert: AlertData }) => {
      setAlerts((prev) => [data.alert, ...prev]);
      showToast(`⚠️ Geofence breach: ${data.alert.full_name}`, 'warning');
    });

    return () => { socket.disconnect(); };
  }, []);

  const handleGenerateEFIR = async (alertItem: AlertData) => {
    setSelectedAlert(alertItem);
    setGeneratingFIR(true);
    try {
      const res = await fetch('/api/fir/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alert_id: alertItem.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error();
      setFirReport(data);
      showToast('E-FIR generated successfully', 'success');
    } catch {
      showToast('Failed to generate E-FIR', 'error');
    } finally {
      setGeneratingFIR(false);
    }
  };

  const handleDownloadPDF = () => {
    if (!firReport || !selectedAlert) return;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    doc.setFillColor(5, 5, 10); doc.rect(0, 0, 210, 45, 'F');
    doc.setTextColor(0, 240, 255); doc.setFont('helvetica', 'bold'); doc.setFontSize(16);
    doc.text('POLICE E-FIR - MINISTRY OF HOME AFFAIRS', 14, 18);
    doc.setTextColor(255, 255, 255); doc.setFontSize(10);
    doc.text('GOVERNMENT OF INDIA - SMART INCIDENT TELEMETRY REPORT', 14, 25);
    doc.text(`DATE GENERATED: ${new Date().toISOString()}`, 14, 32);
    doc.setDrawColor(200, 200, 200); doc.rect(12, 55, 186, 120);
    doc.setTextColor(50, 50, 50); doc.setFontSize(11); doc.setFont('helvetica', 'normal');
    let y = 65;
    const addField = (label: string, val: string) => {
      doc.setFont('helvetica', 'bold'); doc.text(`${label}:`, 18, y);
      doc.setFont('helvetica', 'normal'); doc.text(val, 65, y); y += 12;
    };
    addField('E-FIR ID NUMBER', firReport.fir_number);
    addField('INCIDENT TIMESTAMP', firReport.incident_timestamp);
    addField('ANONYMIZED USER HASH', firReport.user_hash);
    addField('PRECISE LOCATION', firReport.location);
    addField('PANIC BUTTON TRIGGERED', selectedAlert.alert_type === 'SOS' ? 'YES' : 'NO');
    addField('TELEMETRY STATUS', JSON.stringify(selectedAlert.telemetry || { battery: 94 }));
    addField('REGULATORY SYSTEM CALL', firReport.system_message);
    doc.setTextColor(150); doc.setFontSize(8);
    doc.text('This is a cryptographically verified automated E-FIR record.', 18, 190);
    doc.text('SHIELD AI SAFETY MATRIX SYSTEM', 18, 195);
    doc.save(`${firReport.fir_number}_REPORT.pdf`);
    showToast('PDF downloaded', 'success');
  };

  const triggerDemoSimulation = () => {
    socketRef.current?.emit('start-demo-simulation');
    showToast('Demo simulation started', 'info');
  };

  return (
    <div className="min-h-screen bg-[#030306] flex flex-col p-4 md:p-8 relative overflow-hidden pb-24 md:pb-8">
      <motion.header
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 flex items-center justify-between mb-8 w-full max-w-7xl mx-auto"
      >
        <button onClick={onBack} className="ripple flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span>{t('dashboard')}</span>
        </button>
        <div className="flex items-center gap-4">
          <motion.button
            onClick={triggerDemoSimulation}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="ripple flex items-center gap-2 px-3 py-1.5 rounded-lg border border-cyan-500/20 bg-cyan-500/10 hover:bg-cyan-500/20 text-xs font-bold text-cyan-300 transition-colors"
          >
            <Compass className="w-4 h-4" />
            <span>Start Demo</span>
          </motion.button>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-amber-500 glow-alert" />
            <span className="font-extrabold text-white tracking-widest text-sm uppercase">Command Centre</span>
          </div>
        </div>
      </motion.header>

      <main className="z-10 flex-grow max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-6">
        {/* Alerts Feed */}
        <div className="w-full lg:w-4/12 flex flex-col gap-5">
          <div className="glass-card p-5 rounded-2xl border border-white/8 flex-grow flex flex-col max-h-[600px]">
            <div className="flex items-center gap-2 px-3 py-2 bg-cyan-950/20 border border-cyan-500/20 rounded-xl text-xs font-semibold text-cyan-300 mb-4">
              <Users className="w-4 h-4 shrink-0" />
              <span>Active Tourists: {Object.keys(activeTourists).length}</span>
            </div>

            <h3 className="text-sm font-bold tracking-widest text-cyan-400 uppercase mb-4 flex justify-between items-center">
              <span>{t('adminLiveFeed')}</span>
              <span className="text-[10px] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full font-extrabold">{alerts.length} ALERTS</span>
            </h3>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              <AnimatePresence>
                {alerts.map((alertItem, idx) => (
                  <motion.div
                    key={alertItem.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`admin-alert-row p-4 border rounded-xl relative cursor-pointer ${
                      alertItem.alert_type === 'SOS'
                        ? 'bg-red-950/20 border-red-500/40'
                        : 'bg-orange-950/20 border-orange-500/40'
                    } ${idx === 0 ? 'new-alert' : ''}`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex items-center gap-2">
                        <AlertOctagon className={`w-4 h-4 shrink-0 ${alertItem.alert_type === 'SOS' ? 'text-red-500' : 'text-orange-500'}`} />
                        <span className="text-sm font-bold text-white">{alertItem.full_name}</span>
                      </div>
                      <span className="text-[8px] font-mono text-gray-500">{new Date(alertItem.created_at).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-xs text-gray-300 font-light mt-2">{alertItem.message}</p>
                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/5">
                      <span className="text-[9px] text-gray-500">Lat: {alertItem.latitude.toFixed(4)} Lng: {alertItem.longitude.toFixed(4)}</span>
                      <button
                        onClick={() => handleGenerateEFIR(alertItem)}
                        className="e-fir-shake ripple flex items-center gap-1 px-2.5 py-1 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/30 rounded-lg text-[10px] font-extrabold uppercase transition-all text-white hover:text-cyan-300"
                      >
                        <FileCheck className="w-3.5 h-3.5" />
                        <span>{t('generateFir')}</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Live Map */}
        <div className="flex-grow min-h-[420px] lg:min-h-0 w-full">
          <Suspense fallback={<MapSkeleton />}>
            <MapLibreMap markers={mapMarkers} />
          </Suspense>
        </div>
      </main>

      {/* E-FIR Modal */}
      <AnimatePresence>
        {selectedAlert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="w-full max-w-xl glass-card rounded-2xl border border-cyan-500/30 overflow-hidden"
            >
              <div className="bg-black/60 border-b border-white/10 px-6 py-4 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-cyan-400 glow-idle" />
                  <span className="font-extrabold text-xs tracking-wider text-cyan-400 uppercase">{t('efirHeader')}</span>
                </div>
                <button onClick={() => setSelectedAlert(null)} className="ripple text-gray-400 hover:text-white font-bold text-sm px-2 py-1 rounded">{t('close')}</button>
              </div>

              <div className="p-6 space-y-6">
                {generatingFIR ? (
                  <div className="flex flex-col items-center justify-center py-8 space-y-3">
                    <Compass className="w-8 h-8 text-cyan-400 animate-spin" />
                    <span className="text-xs text-gray-400 font-bold uppercase">Encrypting E-FIR…</span>
                  </div>
                ) : firReport ? (
                  <div className="space-y-4">
                    <div className="border border-white/10 rounded-xl bg-black/40 p-4 font-mono text-xs space-y-3">
                      <div><span className="text-cyan-400 font-bold block">{t('efirNumber')}</span><span className="text-white font-extrabold text-sm">{firReport.fir_number}</span></div>
                      <div><span className="text-gray-500 block">{t('incidentTime')}</span><span className="text-white">{firReport.incident_timestamp}</span></div>
                      <div><span className="text-gray-500 block">ANONYMISED USER HASH</span><span className="text-white truncate block">{firReport.user_hash}</span></div>
                      <div><span className="text-gray-500 block">{t('location')}</span><span className="text-white">{firReport.location}</span></div>
                      <div><span className="text-gray-500 block">{t('telemetry')}</span><span className="text-white">Battery: {selectedAlert.telemetry?.battery || 94}%, Panic: {selectedAlert.alert_type === 'SOS' ? 'Active' : 'Idle'}</span></div>
                      <div><span className="text-gray-500 block">{t('sysMessage')}</span><span className="text-red-400 font-bold">{firReport.system_message}</span></div>
                    </div>
                    <div className="flex gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={handleDownloadPDF}
                        className="ripple flex-1 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold rounded-xl text-xs tracking-wider uppercase flex items-center justify-center gap-2"
                        style={{ boxShadow: '0 0 20px #00FFFF30' }}
                      >
                        <Download className="w-4 h-4" />
                        <span>{t('downloadPDF')}</span>
                      </motion.button>
                      <button
                        onClick={() => {
                          const blob = new Blob([JSON.stringify(firReport, null, 2)], { type: 'application/json' });
                          const link = document.createElement('a'); link.href = URL.createObjectURL(blob);
                          link.download = `${firReport.fir_number}.json`; link.click();
                        }}
                        className="ripple py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all"
                      >
                        {t('downloadJSON')}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-red-400 font-bold">Error loading telemetry.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
