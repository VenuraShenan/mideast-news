'use client';

import { useEffect, useState } from 'react';

// Simple pin points for conflict zones
const CONFLICT_ZONES = [
  { id: 1, name: 'Gaza Strip', lat: 31.4217, lng: 34.3985, status: 'active', lastHit: '2026-03-01 04:00', type: 'Airstrike' },
  { id: 2, name: 'Lebanon', lat: 33.8547, lng: 35.8623, status: 'active', lastHit: '2026-03-01 03:30', type: 'Artillery' },
  { id: 3, name: 'Syria', lat: 34.8021, lng: 38.9968, status: 'active', lastHit: '2026-03-01 02:15', type: 'Airstrike' },
  { id: 4, name: 'West Bank', lat: 31.9092, lng: 35.3739, status: 'active', lastHit: '2026-03-01 01:00', type: 'Clash' },
  { id: 5, name: 'Israel', lat: 31.0461, lng: 34.8516, status: 'target', lastHit: '2026-03-01 04:15', type: 'Missile Intercept' },
  { id: 6, name: 'Iran', lat: 32.4279, lng: 53.6880, status: 'watch', lastHit: '2026-02-27 12:00', type: 'Nuclear Site' },
  { id: 7, name: 'Iraq', lat: 33.2232, lng: 43.6793, status: 'watch', lastHit: '2026-02-28 22:00', type: 'Military Activity' },
  { id: 8, name: 'Yemen', lat: 15.5527, lng: 48.5164, status: 'watch', lastHit: '2026-02-28 18:00', type: 'Airstrike' },
];

const STATUS_COLORS = {
  active: '#ff3d3d',
  target: '#ff3d3d',
  watch: '#ff9500',
};

export default function MapView() {
  const [mounted, setMounted] = useState(false);
  const [map, setMap] = useState(null);
  const [selectedZone, setSelectedZone] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || map) return;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const mapInstance = L.map('map-container', {
        center: [30, 45],
        zoom: 5,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap',
        maxZoom: 19,
      }).addTo(mapInstance);

      // Add glowing pin markers
      CONFLICT_ZONES.forEach((zone) => {
        const color = STATUS_COLORS[zone.status] || STATUS_COLORS.active;
        
        // Glowing marker
        const icon = L.divIcon({
          html: `
            <div style="
              position: relative;
              width: 20px;
              height: 20px;
            ">
              <div style="
                position: absolute;
                width: 100%;
                height: 100%;
                background: ${color};
                border-radius: 50%;
                border: 2px solid white;
                box-shadow: 0 0 10px ${color}, 0 0 20px ${color}, 0 0 40px ${color}60;
                animation: pulse-pin 2s ease-in-out infinite;
              "></div>
              <div style="
                position: absolute;
                bottom: -8px;
                left: 50%;
                transform: translateX(-50%);
                width: 0;
                height: 0;
                border-left: 6px solid transparent;
                border-right: 6px solid transparent;
                border-top: 10px solid ${color};
                filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
              "></div>
            </div>
            <style>
              @keyframes pulse-pin {
                0%, 100% { transform: scale(1); opacity: 1; }
                50% { transform: scale(1.3); opacity: 0.7; }
              }
            </style>
          `,
          className: 'glowing-marker',
          iconSize: [20, 30],
          iconAnchor: [10, 30],
        });

        const marker = L.marker([zone.lat, zone.lng], { icon }).addTo(mapInstance);

        // Popup
        marker.bindPopup(`
          <div style="font-family: 'Source Sans 3', sans-serif; min-width: 140px;">
            <strong style="font-size: 1rem; color: #fff;">${zone.name}</strong>
            <div style="margin: 6px 0; padding: 3px 10px; background: ${color}20; border: 1px solid ${color}40; border-radius: 12px; display: inline-block; font-size: 0.7rem; color: ${color}; text-transform: uppercase;">${zone.status}</div>
            <div style="font-size: 0.75rem; color: #8b8b9b; margin-top: 4px;">
              <div>Type: ${zone.type}</div>
              <div>Last: ${zone.lastHit}</div>
            </div>
          </div>
        `, { className: 'custom-popup' });

        marker.on('mouseover', function() { this.openPopup(); });
      });

      setMap(mapInstance);
    };

    initMap();

    return () => {
      if (map) map.remove();
    };
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return <div id="map-container" style={{ height: '100%', width: '100%' }} />;
}
