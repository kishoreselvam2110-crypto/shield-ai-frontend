import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { Shield, Eye, EyeOff, Lock, Mail, User, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Landing() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const setUser = useAppStore((state) => state.setUser);
  const setSession = useAppStore((state) => state.setSession);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    const payload = isLogin ? { email, password } : { email, password, full_name: fullName };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setUser(data.user);
      setSession(data.session);

      // Trigger browser notifications permission request
      if ('Notification' in window) {
        Notification.requestPermission();
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden bg-[#030306]">
      {/* Animated Glowing Ambient Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#00f0ff] opacity-10 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#ff007f] opacity-10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="z-10 flex flex-col items-center mb-8"
      >
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-10 h-10 text-cyan-400 drop-shadow-[0_0_8px_#00f0ff]" />
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-300 to-cyan-500 drop-shadow-[0_0_6px_rgba(0,240,255,0.4)]">
            SHIELD AI
          </h1>
        </div>
        <p className="text-gray-400 text-sm md:text-base max-w-md text-center font-light">
          Smart Tourist Safety & Incident Response Ecosystem
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-md glass-card p-8 rounded-2xl relative border border-white/10"
      >
        <h2 className="text-2xl font-bold mb-6 text-center text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]">
          {isLogin ? 'Welcome Back' : 'Create Safety Profile'}
        </h2>

        {error && (
          <div className="mb-4 p-3 bg-red-950/50 border border-red-500/40 rounded-xl flex items-center gap-2 text-red-200 text-sm">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-white transition-all text-sm"
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input
                type="email"
                required
                placeholder="john@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-white transition-all text-sm"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-2.5 bg-black/40 border border-white/10 rounded-xl focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 outline-none text-white transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 w-5 h-5 text-gray-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white font-bold rounded-xl shadow-lg hover:shadow-cyan-500/25 transition-all text-sm tracking-widest uppercase mt-4 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-400">
          <span>{isLogin ? "Don't have a profile? " : "Already have a profile? "}</span>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-cyan-400 hover:text-cyan-300 font-semibold underline transition-colors"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
