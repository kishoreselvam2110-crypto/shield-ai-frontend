import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

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

interface MapLibreMapProps {
  trip?: { itinerary: DayItinerary[] } | null;
  center?: [number, number];
  zoom?: number;
  markers?: Array<{
    lat: number;
    lng: number;
    label?: string;
    color?: string;
    popup?: string;
  }>;
  geofenceZones?: Array<{
    name: string;
    lat: number;
    lng: number;
    radius: number;
    level: 'high' | 'medium';
  }>;
  demoPath?: Array<[number, number]>;
  showDemoPath?: boolean;
}

export default function MapLibreMap({
  trip,
  center,
  zoom = 13,
  markers,
  geofenceZones,
  demoPath,
  showDemoPath,
}: MapLibreMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const defaultCenter: [number, number] = [73.7536, 15.5494]; // Goa fallback [lng, lat]
    const firstAttr = trip?.itinerary?.[0]?.attractions?.[0];
    const initialCenter: [number, number] = center
      ? [center[1], center[0]]
      : firstAttr
      ? [firstAttr.lng, firstAttr.lat]
      : defaultCenter;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'openfreemap': {
            type: 'raster',
            tiles: [
              'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxzoom: 19,
          },
        },
        layers: [
          {
            id: 'openfreemap-layer',
            type: 'raster',
            source: 'openfreemap',
            paint: {
              'raster-opacity': 1,
              'raster-brightness-min': 0,
              'raster-brightness-max': 0.5,
              'raster-saturation': -0.3,
              'raster-contrast': 0.2,
              'raster-hue-rotate': 200,
            },
          },
        ],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      },
      center: initialCenter,
      zoom,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right');
    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-left');

    map.on('load', () => {
      // Add geofence zones if provided
      if (geofenceZones && geofenceZones.length > 0) {
        geofenceZones.forEach((zone, idx) => {
          const circleId = `geofence-${idx}`;
          const center = [zone.lng, zone.lat];
          const points = 64;
          const coords = [];
          const km = zone.radius / 1000;
          for (let i = 0; i < points; i++) {
            const angle = (i / points) * (2 * Math.PI);
            const dx = km / 111.32 * Math.cos(angle);
            const dy = km / (111.32 * Math.cos((zone.lat * Math.PI) / 180)) * Math.sin(angle);
            coords.push([center[0] + dy, center[1] + dx]);
          }
          coords.push(coords[0]);

          map.addSource(circleId, {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: { type: 'Polygon', coordinates: [coords] },
            },
          });
          map.addLayer({
            id: `${circleId}-fill`,
            type: 'fill',
            source: circleId,
            paint: {
              'fill-color': zone.level === 'high' ? '#ff3131' : '#ff9f00',
              'fill-opacity': 0.15,
            },
          });
          map.addLayer({
            id: `${circleId}-line`,
            type: 'line',
            source: circleId,
            paint: {
              'line-color': zone.level === 'high' ? '#ff3131' : '#ff9f00',
              'line-width': 2,
            },
          });
        });
      }

      // Add demo animated path
      if (showDemoPath && demoPath && demoPath.length > 1) {
        const pathCoords = demoPath.map(([lat, lng]) => [lng, lat]);
        map.addSource('demo-path', {
          type: 'geojson',
          data: {
            type: 'Feature',
            properties: {},
            geometry: { type: 'LineString', coordinates: pathCoords },
          },
        });
        map.addLayer({
          id: 'demo-path-layer',
          type: 'line',
          source: 'demo-path',
          paint: {
            'line-color': '#00f0ff',
            'line-width': 3,
            'line-dasharray': [2, 2],
            'line-opacity': 0.8,
          },
        });
      }
    });

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers when trip/markers change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();
    let hasPoints = false;

    // Trip itinerary markers
    if (trip?.itinerary) {
      trip.itinerary.forEach((day) => {
        day.attractions.forEach((attr) => {
          const el = document.createElement('div');
          el.className = 'shield-marker';
          el.style.cssText = `
            width: 28px; height: 28px; border-radius: 50%;
            background: #00f0ff; border: 2px solid white;
            box-shadow: 0 0 12px #00f0ff, 0 0 24px #00f0ff40;
            display: flex; align-items: center; justify-content: center;
            font-size: 10px; font-weight: 900; color: #000;
            cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;
          `;
          el.textContent = `${day.day}`;

          // Bounce animation on add
          el.style.transform = 'scale(0)';
          setTimeout(() => {
            el.style.transform = 'scale(1.3)';
            setTimeout(() => { el.style.transform = 'scale(1)'; }, 150);
          }, day.day * 100);

          el.addEventListener('mouseenter', () => {
            el.style.transform = 'scale(1.2)';
            el.style.boxShadow = '0 0 20px #00f0ff, 0 0 40px #00f0ff60';
          });
          el.addEventListener('mouseleave', () => {
            el.style.transform = 'scale(1)';
            el.style.boxShadow = '0 0 12px #00f0ff, 0 0 24px #00f0ff40';
          });

          const popup = new maplibregl.Popup({ offset: 14, closeButton: false })
            .setHTML(`
              <div style="background:#0a0a12;border:1px solid #00f0ff40;border-radius:8px;padding:10px;max-width:180px;color:white">
                <div style="color:#00f0ff;font-weight:700;font-size:13px;margin-bottom:4px">${attr.name}</div>
                <div style="font-size:11px;color:#9ca3af;margin-bottom:6px">${attr.description}</div>
                <span style="font-size:9px;font-weight:700;padding:2px 6px;border-radius:4px;background:${attr.safety_level === 'safe' ? '#16a34a30' : '#ca8a0430'};color:${attr.safety_level === 'safe' ? '#4ade80' : '#fbbf24'}">${attr.safety_level.toUpperCase()}</span>
              </div>
            `);

          const marker = new maplibregl.Marker({ element: el })
            .setLngLat([attr.lng, attr.lat])
            .setPopup(popup)
            .addTo(map);

          markersRef.current.push(marker);
          bounds.extend([attr.lng, attr.lat]);
          hasPoints = true;
        });
      });
    }

    // Custom markers array
    if (markers) {
      markers.forEach((m) => {
        const el = document.createElement('div');
        el.style.cssText = `
          width: 24px; height: 24px; border-radius: 50%;
          background: ${m.color || '#00f0ff'}; border: 2px solid white;
          box-shadow: 0 0 10px ${m.color || '#00f0ff'};
          cursor: pointer; transition: transform 0.2s;
        `;
        el.addEventListener('mouseenter', () => { el.style.transform = 'scale(1.3)'; });
        el.addEventListener('mouseleave', () => { el.style.transform = 'scale(1)'; });

        const marker = new maplibregl.Marker({ element: el })
          .setLngLat([m.lng, m.lat])
          .addTo(map);

        if (m.popup) {
          marker.setPopup(
            new maplibregl.Popup({ offset: 12, closeButton: false })
              .setHTML(`<div style="background:#0a0a12;color:white;padding:8px;border-radius:6px;border:1px solid #ffffff20;font-size:12px">${m.popup}</div>`)
          );
        }

        markersRef.current.push(marker);
        bounds.extend([m.lng, m.lat]);
        hasPoints = true;
      });
    }

    if (hasPoints && !bounds.isEmpty()) {
      map.fitBounds(bounds, { padding: 60, maxZoom: 15, animate: true });
    }
  }, [trip, markers]);

  return (
    <div
      ref={mapContainerRef}
      className="w-full h-full min-h-[420px] rounded-2xl overflow-hidden"
      style={{ border: '1px solid rgba(0,240,255,0.15)' }}
    />
  );
}
