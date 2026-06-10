import React, { useEffect, useRef } from 'react';
import L from 'leaflet';

interface Attraction {
  name: string;
  description: string;
  lat: number;
  lng: number;
  safety_level: 'safe' | 'caution' | 'danger';
}

interface DayItinerary {
  day: number;
  attractions: Attraction[];
}

interface TripMapProps {
  /**
   * The full itinerary passed from the store. If undefined, a placeholder will be rendered.
   */
  trip?: { itinerary: DayItinerary[] } | null;
}

export default function TripMap({ trip }: TripMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);
  const mapContainerId = 'trip-map';

  useEffect(() => {
    // Initialize map only once
    if (!mapRef.current) {
      const defaultCenter: [number, number] = [15.5494, 73.7536]; // Goa fallback
      const firstDay = trip?.itinerary?.[0];
      const initialCenter: [number, number] =
        firstDay && firstDay.attractions.length > 0
          ? [firstDay.attractions[0].lat, firstDay.attractions[0].lng]
          : defaultCenter;

      const map = L.map(mapContainerId, { zoomControl: false }).setView(initialCenter, 13);

      // CARTO Dark tiles – works without a token
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd',
        maxZoom: 20,
      }).addTo(map);

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      mapRef.current = map;
      markersGroupRef.current = L.featureGroup().addTo(map);
    }

    // Update markers whenever the itinerary changes
    if (trip && mapRef.current && markersGroupRef.current) {
      const bounds = L.latLngBounds([]);
      trip.itinerary.forEach((day) => {
        day.attractions.forEach((attr) => {
          const icon = L.divIcon({
            className: 'custom-leaflet-marker',
            html: `<div class="w-6 h-6 rounded-full bg-[#00f0ff] border-2 border-white shadow-[0_0_10px_#00f0ff] flex items-center justify-center text-[10px] font-bold text-black">${day.day}</div>`,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const marker = L.marker([attr.lat, attr.lng], { icon })
            .bindPopup(`
              <div class="p-2 text-white bg-black/85 rounded-lg border border-cyan-500/20 max-w-[200px]">
                <h5 class="font-bold text-cyan-400 text-sm">${attr.name}</h5>
                <p class="text-[10px] text-gray-300 mt-1">${attr.description}</p>
                <span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[8px] font-bold ${attr.safety_level === 'safe' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}">${attr.safety_level.toUpperCase()}</span>
              </div>
            `);
          markersGroupRef.current?.addLayer(marker);
          bounds.extend([attr.lat, attr.lng]);
        });
      });

      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
      }
    }

    // Cleanup on component unmount
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersGroupRef.current = null;
      }
    };
  }, [trip]);

  return <div id={mapContainerId} className="w-full h-full min-h-[450px] lg:h-full rounded-2xl relative overflow-hidden" />;
}
