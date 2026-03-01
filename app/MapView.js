'use client';

import { useEffect, useState } from 'react';

// Simplified GeoJSON-like coordinates for Middle East countries
const COUNTRIES_GEO = {
  gaza: {
    name: 'Gaza Strip',
    threat: 'critical',
    color: '#ff3d3d',
    // Approximate polygon coordinates
    bounds: [[31.2, 34.2], [31.7, 34.6]],
    hits: [
      { lat: 31.5, lng: 34.35, time: '2026-03-01 04:00', type: 'Airstrike' },
      { lat: 31.35, lng: 34.25, time: '2026-03-01 03:30', type: 'Artillery' },
      { lat: 31.55, lng: 34.4, time: '2026-03-01 02:15', type: 'Missile' },
    ]
  },
  israel: {
    name: 'Israel',
    threat: 'target',
    color: '#ff3d3d',
    bounds: [[29.5, 34.2], [33.3, 36.0]],
    hits: [
      { lat: 31.2, lng: 34.5, time: '2026-03-01 04:15', type: 'Missile Intercept' },
      { lat: 32.1, lng: 34.9, time: '2026-03-01 03:00', type: 'Rocket' },
    ]
  },
  lebanon: {
    name: 'Lebanon',
    threat: 'high',
    color: '#ff6b35',
    bounds: [[33.0, 35.0], [34.7, 36.6]],
    hits: [
      { lat: 33.5, lng: 35.5, time: '2026-03-01 03:30', type: 'Artillery' },
      { lat: 33.2, lng: 35.3, time: '2026-03-01 02:00', type: 'Airstrike' },
    ]
  },
  syria: {
    name: 'Syria',
    threat: 'high',
    color: '#ff6b35',
    bounds: [[32.3, 35.5], [37.3, 42.4]],
    hits: [
      { lat: 35.2, lng: 36.8, time: '2026-03-01 02:15', type: 'Airstrike' },
      { lat: 33.5, lng: 36.5, time: '2026-03-01 01:00', type: 'Clash' },
    ]
  },
  westbank: {
    name: 'West Bank',
    threat: 'high',
    color: '#ff6b35',
    bounds: [[31.3, 34.9], [32.5, 35.6]],
    hits: [
      { lat: 31.9, lng: 35.2, time: '2026-03-01 01:00', type: 'Clash' },
    ]
  },
  jordan: {
    name: 'Jordan',
    threat: 'medium',
    color: '#ff9500',
    bounds: [[29.2, 34.6], [33.4, 39.3]],
    hits: []
  },
  iraq: {
    name: 'Iraq',
    threat: 'low',
    color: '#6b7280',
    bounds: [[29.5, 38.9], [37.4, 49.0]],
    hits: []
  },
  iran: {
    name: 'Iran',
    threat: 'medium',
    color: '#ff9500',
    bounds: [[25.0, 44.0], [39.8, 63.3]],
    hits: [
      { lat: 32.5, lng: 53.5, time: '2026-02-27 12:00', type: 'Nuclear Site' },
    ]
  },
  yemen: {
    name: 'Yemen',
    threat: 'low',
    color: '#6b7280',
    bounds: [[12.1, 41.8], [19.0, 56.5]],
    hits: []
  },
  saudi: {
    name: 'Saudi Arabia',
    threat: 'low',
    color: '#6b7280',
    bounds: [[16.4, 34.5], [32.2, 55.7]],
    hits: []
  },
  turkey: {
    name: 'Turkey',
    threat: 'low',
    color: '#6b7280',
    bounds: [[35.8, 26.0], [42.1, 44.8]],
    hits: []
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

      // Draw country borders with threat coloring
      Object.entries(COUNTRIES_GEO).forEach(([key, country]) => {
        const threatLevel = THREAT_LEVELS[country.threat];
        
        // Create rectangle polygon for country
        const bounds = country.bounds;
        const polygon = L.rectangle(bounds, {
          color: country.color,
          weight: country.threat === 'critical' || country.threat === 'target' ? 4 : 
                  country.threat === 'high' ? 3 : 2,
          fillColor: country.color,
          fillOpacity: country.threat === 'critical' || country.threat === 'target' ? 0.3 :
                      country.threat === 'high' ? 0.2 : 0.1,
          dashArray: country.threat === 'low' ? '5, 10' : null,
        }).addTo(mapInstance);

        // Click to select country
        polygon.on('click', () => {
          setSelectedCountry(COUNTRIES_GEO[key]);
          const center = [
            (bounds[0][0] + bounds[1][0]) / 2,
            (bounds[0][1] + bounds[1][1]) / 2
          ];
          mapInstance.flyTo(center, 7, { duration: 1 });
        });

        // Hover effects
        polygon.on('mouseover', function() {
          this.setStyle({ 
            fillOpacity: country.threat === 'critical' || country.threat === 'target' ? 0.5 : 0.35,
            weight: country.threat === 'critical' || country.threat === 'target' ? 6 : 
                    country.threat === 'high' ? 5 : 3,
          });
        });
        polygon.on('mouseout', function() {
          this.setStyle({ 
            fillOpacity: country.threat === 'critical' || country.threat === 'target' ? 0.3 :
                        country.threat === 'high' ? 0.2 : 0.1,
            weight: country.threat === 'critical' || country.threat === 'target' ? 4 :
                    country.threat === 'high' ? 3 : 2,
          });
        });

        // Add country name label
        const center = [
          (bounds[0][0] + bounds[1][0]) / 2,
          (bounds[0][1] + bounds[1][1]) / 2
        ];
        
        const label = L.divIcon({
          html: `<div style="
            background: ${threatLevel.bg};
            border: 1px solid ${threatLevel.color};
            color: ${threatLevel.color};
            padding: 3px 8px;
            border-radius: 12px;
            font-size: 10px;
            font-weight: 600;
            white-space: nowrap;
            font-family: 'Source Sans 3', sans-serif;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          ">${country.name}</div>`,
          className: 'country-label',
          iconSize: [80, 24],
          iconAnchor: [40, 12],
        });

        L.marker(center, { icon: label, interactive: false }).addTo(mapInstance);
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
            padding: '10px 20px',
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
          border: `2px solid ${threatLevel.color}`
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
