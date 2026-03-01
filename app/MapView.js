'use client';

import { useEffect, useState } from 'react';

// Country threat data with GeoJSON-style coordinates
const COUNTRIES = {
  gaza: { 
    name: 'Gaza Strip', 
    lat: 31.5, 
    lng: 34.3, 
    threat: 'critical',
    color: '#ff3d3d',
    hits: [
      { lat: 31.5, lng: 34.35, time: '2026-03-01 04:00', type: 'Airstrike' },
      { lat: 31.35, lng: 34.25, time: '2026-03-01 03:30', type: 'Artillery' },
      { lat: 31.55, lng: 34.4, time: '2026-03-01 02:15', type: 'Missile' },
    ]
  },
  lebanon: { 
    name: 'Lebanon', 
    lat: 33.8, 
    lng: 35.8, 
    threat: 'high',
    color: '#ff6b35',
    hits: [
      { lat: 33.5, lng: 35.5, time: '2026-03-01 03:30', type: 'Artillery' },
      { lat: 33.2, lng: 35.3, time: '2026-03-01 02:00', type: 'Airstrike' },
    ]
  },
  syria: { 
    name: 'Syria', 
    lat: 34.8, 
    lng: 38.5, 
    threat: 'high',
    color: '#ff6b35',
    hits: [
      { lat: 35.2, lng: 36.8, time: '2026-03-01 02:15', type: 'Airstrike' },
      { lat: 33.5, lng: 36.5, time: '2026-03-01 01:00', type: 'Clash' },
    ]
  },
  israel: { 
    name: 'Israel', 
    lat: 31.0, 
    lng: 34.8, 
    threat: 'target',
    color: '#ff3d3d',
    hits: [
      { lat: 31.2, lng: 34.5, time: '2026-03-01 04:15', type: 'Missile Intercept' },
      { lat: 32.1, lng: 34.9, time: '2026-03-01 03:00', type: 'Rocket' },
    ]
  },
  iran: { 
    name: 'Iran', 
    lat: 32.4, 
    lng: 53.6, 
    threat: 'medium',
    color: '#ff9500',
    hits: [
      { lat: 32.5, lng: 53.5, time: '2026-02-27 12:00', type: 'Nuclear Site' },
    ]
  },
  iraq: { 
    name: 'Iraq', 
    lat: 33.2, 
    lng: 43.6, 
    threat: 'low',
    color: '#6b7280',
    hits: []
  },
  yemen: { 
    name: 'Yemen', 
    lat: 15.5, 
    lng: 48.5, 
    threat: 'low',
    color: '#6b7280',
    hits: []
  },
  westbank: { 
    name: 'West Bank', 
    lat: 31.9, 
    lng: 35.3, 
    threat: 'high',
    color: '#ff6b35',
    hits: [
      { lat: 31.9, lng: 35.2, time: '2026-03-01 01:00', type: 'Clash' },
    ]
  },
};

const THREAT_LEVELS = {
  critical: { label: 'Critical', color: '#ff3d3d', bg: 'rgba(255, 61, 61, 0.2)' },
  high: { label: 'High', color: '#ff6b35', bg: 'rgba(255, 107, 53, 0.2)' },
  medium: { label: 'Medium', color: '#ff9500', bg: 'rgba(255, 149, 0, 0.2)' },
  low: { label: 'Low', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.2)' },
  target: { label: 'Target', color: '#ff3d3d', bg: 'rgba(255, 61, 61, 0.2)' },
};

export default function MapView({ zones }) {
  const [mounted, setMounted] = useState(false);
  const [map, setMap] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [markers, setMarkers] = useState([]);

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

      // Add country circles with threat coloring
      Object.entries(COUNTRIES).forEach(([key, country]) => {
        const threatLevel = THREAT_LEVELS[country.threat];
        
        // Country circle
        const circle = L.circle([country.lat, country.lng], {
          color: country.color,
          fillColor: country.color,
          fillOpacity: 0.3,
          radius: country.threat === 'critical' ? 150000 : 120000,
          weight: 2,
        }).addTo(mapInstance);

        // Click handler
        circle.on('click', () => {
          setSelectedCountry(COUNTRIES[key]);
          mapInstance.flyTo([country.lat, country.lng], 8, { duration: 1 });
        });

        // Hover effects
        circle.on('mouseover', function() {
          this.setStyle({ fillOpacity: 0.6, weight: 4 });
        });
        circle.on('mouseout', function() {
          this.setStyle({ fillOpacity: 0.3, weight: 2 });
        });

        // Label
        const label = L.divIcon({
          html: `<div style="
            background: ${threatLevel.bg};
            border: 1px solid ${threatLevel.color};
            color: ${threatLevel.color};
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
            white-space: nowrap;
            font-family: 'Outfit', sans-serif;
          ">${country.name}</div>`,
          className: 'country-label',
          iconSize: [100, 30],
          iconAnchor: [50, 15],
        });

        L.marker([country.lat, country.lng], { icon: label, interactive: false }).addTo(mapInstance);
      });

      setMap(mapInstance);
    };

    initMap();

    return () => {
      if (map) map.remove();
    };
  }, [mounted]);

  const handleBack = () => {
    setSelectedCountry(null);
    if (map) {
      map.flyTo([30, 45], 5, { duration: 1 });
    }
  };

  if (!mounted) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  // Country detail view
  if (selectedCountry) {
    const threatLevel = THREAT_LEVELS[selectedCountry.threat];
    return (
      <div style={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        background: 'var(--darker)',
        padding: '20px'
      }}>
        <button 
          onClick={handleBack}
          style={{
            background: 'var(--card)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: 'var(--text)',
            padding: '10',
            borderRadius: '10px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            marginBottom: '15px',
            width: 'fit-content'
          }}
        >
          ← Back to Map
        </button>
        
        <div style={{
          background: 'var(--card)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '15px',
          border: `1px solid ${threatLevel.color}40`
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ fontSize: '1.4rem', color: 'var(--text)' }}>{selectedCountry.name}</h3>
            <span style={{
              background: threatLevel.bg,
              color: threatLevel.color,
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {threatLevel.label} THREAT
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
            {selectedCountry.hits.length} incident{selectedCountry.hits.length !== 1 ? 's' : ''} recorded
          </p>
        </div>

        <div style={{ flex: 1, overflow: 'auto' }}>
          {selectedCountry.hits.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: 'var(--text-muted)' 
            }}>
              No recent incidents recorded
            </div>
          ) : (
            selectedCountry.hits.map((hit, i) => (
              <div key={i} style={{
                background: 'var(--card)',
                borderRadius: '12px',
                padding: '15px',
                marginBottom: '10px',
                borderLeft: `3px solid ${threatLevel.color}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{ fontWeight: '600', color: 'var(--text)', marginBottom: '4px' }}>
                    {hit.type}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    📍 {hit.lat.toFixed(4)}, {hit.lng.toFixed(4)}
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  {hit.time}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  return <div id="map-container" style={{ height: '100%', width: '100%' }} />;
}
