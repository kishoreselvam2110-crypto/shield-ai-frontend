import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useTranslation } from '../i18n';
import { ArrowLeft, Download, Shield, RefreshCw, QrCode } from 'lucide-react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';

interface DigitalIDProps {
  onBack: () => void;
}

export default function DigitalID({ onBack }: DigitalIDProps) {
  const { t } = useTranslation();
  const user = useAppStore((state) => state.user);
  const digitalId = useAppStore((state) => state.digitalId);
  const setDigitalId = useAppStore((state) => state.setDigitalId);

  const [fullName, setFullName] = useState(digitalId?.full_name || user?.full_name || '');
  const [passport, setPassport] = useState(digitalId?.passport_number || '');
  const [destination, setDestination] = useState(digitalId?.destination || '');
  const [emergencyContact, setEmergencyContact] = useState(digitalId?.emergency_contact || '');
  const [loading, setLoading] = useState(false);
  const [qrUrl, setQrUrl] = useState('');
  const [isFlipped, setIsFlipped] = useState(false);

  // Generate QR code URL if digitalId state exists
  useEffect(() => {
    if (digitalId?.qr_data) {
      QRCode.toDataURL(digitalId.qr_data, {
        width: 300,
        margin: 2,
        color: {
          dark: '#00f0ff',
          light: '#050508'
        }
      })
      .then(url => {
        setQrUrl(url);
      })
      .catch(err => {
        console.error('QR code generation error:', err);
      });
    }
  }, [digitalId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/generate-id', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user?.id,
          full_name: fullName,
          passport_number: passport,
          destination,
          emergency_contact: emergencyContact
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to generate ID');

      setDigitalId(data);
      setIsFlipped(true); // Auto flip to show generated ID card
    } catch (error) {
      console.error(error);
      alert('Error generating Digital ID');
    } finally {
      setLoading(false);
    }
  };

  const downloadQR = () => {
    if (!qrUrl) return;
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `${fullName.replace(/\s+/g, '_')}_SHIELD_ID.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#030306] flex flex-col p-4 md:p-8 relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-1/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px]" />

      <header className="z-10 flex items-center justify-between mb-8 w-full max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t('dashboard')}</span>
        </button>

        <div className="flex items-center gap-2">
          <Shield className="w-6 h-6 text-cyan-400 drop-shadow-[0_0_4px_#00f0ff]" />
          <span className="font-bold text-white tracking-widest text-sm">DIGITAL ID PORTAL</span>
        </div>
      </header>

      <main className="z-10 flex-1 max-w-4xl w-full mx-auto flex flex-col lg:flex-row gap-8 items-center justify-center">
        {/* Form panel */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-1/2 glass-card p-6 md:p-8 rounded-2xl border border-white/10"
        >
          <h2 className="text-2xl font-bold mb-6 text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-cyan-300">
            Create Digital Passport
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-white text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Passport Number</label>
              <input
                type="text"
                required
                value={passport}
                onChange={(e) => setPassport(e.target.value)}
                placeholder="Passport ID / Country Code"
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-white text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Destination</label>
              <input
                type="text"
                required
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. Goa, India"
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-white text-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Emergency Contact</label>
              <input
                type="text"
                required
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
                placeholder="Relationship - Phone Number"
                className="w-full px-4 py-2 bg-black/40 border border-white/10 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-white text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all text-sm tracking-widest uppercase flex items-center justify-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'Registering...' : t('generateId')}</span>
            </button>
          </form>
        </motion.div>

        {/* Card visualization panel */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full lg:w-1/2 flex flex-col items-center justify-center"
        >
          {digitalId ? (
            <div className="relative w-80 h-96 [perspective:1000px] cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
              <motion.div
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6 }}
                className="relative w-full h-full [transform-style:preserve-3d] transition-all"
              >
                {/* Front Side: ID Card */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] glass-card p-6 rounded-2xl border border-cyan-500/30 flex flex-col justify-between overflow-hidden">
                  <div className="absolute -top-12 -right-12 w-28 h-28 bg-cyan-500/10 rounded-full blur-xl" />
                  
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold tracking-wider text-white">SHIELD AI</h3>
                      <p className="text-[9px] text-cyan-400 uppercase tracking-widest">Digital Emergency Card</p>
                    </div>
                    <Shield className="w-8 h-8 text-cyan-400 drop-shadow-[0_0_4px_#00f0ff]" />
                  </div>

                  <div className="space-y-4 my-6">
                    <div>
                      <label className="text-[10px] text-gray-500 uppercase block font-semibold">Holder Name</label>
                      <span className="text-white font-bold text-lg">{digitalId.full_name}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase block font-semibold">SHIELD ID</label>
                        <span className="text-cyan-400 font-extrabold text-sm drop-shadow-[0_0_3px_#00f0ff]">{digitalId.shield_id}</span>
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-500 uppercase block font-semibold">Passport</label>
                        <span className="text-white text-xs font-semibold">{digitalId.passport_number}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 uppercase block font-semibold">Destination</label>
                      <span className="text-white text-xs font-semibold">{digitalId.destination}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center border-t border-white/10 pt-4">
                    <div>
                      <label className="text-[9px] text-gray-500 block uppercase font-semibold">Emergency SOS</label>
                      <span className="text-xs text-red-400 font-semibold">{digitalId.emergency_contact}</span>
                    </div>
                    <QrCode className="w-8 h-8 text-white/50" />
                  </div>
                </div>

                {/* Back Side: QR Profile */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] glass-card p-6 rounded-2xl border border-cyan-500/30 flex flex-col justify-between items-center text-center">
                  <div className="w-full flex justify-between items-center">
                    <span className="text-xs font-bold text-cyan-400">{digitalId.shield_id}</span>
                    <span className="text-[9px] text-gray-400">TAP TO FLIP</span>
                  </div>

                  {qrUrl ? (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                      className="p-3 bg-black border border-cyan-500/20 rounded-xl"
                    >
                      <img src={qrUrl} alt="SHIELD QR Code" className="w-44 h-44" />
                    </motion.div>
                  ) : (
                    <div className="w-44 h-44 bg-black/40 rounded-xl flex items-center justify-center border border-white/5">
                      <QrCode className="w-10 h-10 text-cyan-400 animate-pulse" />
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadQR();
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-bold transition-all text-white w-full justify-center"
                  >
                    <Download className="w-4 h-4 text-cyan-400" />
                    <span>{t('downloadQr')}</span>
                  </button>
                </div>
              </motion.div>
            </div>
          ) : (
            <div className="w-80 h-96 border border-white/10 bg-black/40 rounded-2xl flex flex-col items-center justify-center p-6 text-center text-gray-500 space-y-4">
              <QrCode className="w-16 h-16 text-cyan-500/40" />
              <p className="text-sm max-w-[200px]">Fill the emergency details form to generate your Smart Safety Passport.</p>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
}
