import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';
import { persist } from 'zustand/middleware';

export interface Attraction {
  name: string;
  lat: number;
  lng: number;
  description: string;
  safety_level: string;
}

export interface ItineraryDay {
  day: number;
  attractions: Attraction[];
}

export interface DigitalIdDetails {
  id?: string;
  shield_id: string;
  qr_data: string;
  full_name: string;
  passport_number: string;
  destination: string;
  emergency_contact: string;
}

export interface OfflineSOS {
  id: string;
  latitude: number;
  longitude: number;
  message: string;
  timestamp: string;
  telemetry: {
    battery: number;
    panic: boolean;
    fall_detected: boolean;
  };
}

interface AppState {
  user: { id: string; email: string; full_name: string } | null;
  session: { access_token: string } | null;
  digitalId: DigitalIdDetails | null;
  trip: {
    destination: string;
    days: number;
    budget: string;
    language: string;
    itinerary: ItineraryDay[];
  } | null;
  offlineQueue: OfflineSOS[];
  language: 'en' | 'hi';
  
  setUser: (user: any) => void;
  setSession: (session: any) => void;
  setDigitalId: (id: DigitalIdDetails | null) => void;
  setTrip: (trip: any) => void;
  setLanguage: (lang: 'en' | 'hi') => void;
  addToOfflineQueue: (alert: OfflineSOS) => void;
  removeFromOfflineQueue: (id: string) => void;
  clearOfflineQueue: () => void;
  logout: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      digitalId: null,
      trip: null,
      offlineQueue: [],
      language: 'en',

      // Synchronous mutators
      setUser: (user) => set({ user }),
      setSession: (session) => set({ session }),
      setDigitalId: (digitalId) => set({ digitalId }),
      setTrip: (trip) => set({ trip }),
      setLanguage: (language) => set({ language }),
      addToOfflineQueue: (alert) =>
        set((state) => ({ offlineQueue: [...state.offlineQueue, alert] })),
      removeFromOfflineQueue: (id) =>
        set((state) => ({
          offlineQueue: state.offlineQueue.filter((item) => item.id !== id),
        })),
      clearOfflineQueue: () => set({ offlineQueue: [] }),
      logout: () => set({ user: null, session: null, digitalId: null, trip: null, offlineQueue: [] }),

      // Async Supabase helpers
      loadUser: async (userId: string) => {
        const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
        if (error) throw error;
        set({ user: data });
      },
      loadTrip: async (tripId: string) => {
        const { data, error } = await supabase.from('trips').select('*').eq('id', tripId).single();
        if (error) throw error;
        set({ trip: data });
      },
      saveTrip: async (tripData: any) => {
        const { data, error } = await supabase.from('trips').upsert(tripData, { returning: 'representation' });
        if (error) throw error;
        set({ trip: data[0] });
        return data[0];
      },
      createAlert: async (alert: any) => {
        const { data, error } = await supabase.from('alerts').insert(alert);
        if (error) throw error;
        return data;
      },
    }),
    {
      name: 'shield-ai-storage', // key name in localStorage
    }
  )
);
