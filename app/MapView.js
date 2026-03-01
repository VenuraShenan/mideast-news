'use client';

import { useEffect, useState } from 'react';

const ZONE_COLORS = {
  active: '#ff3d3d',
  watch: '#ff9500',
  threat: '#6b7280',
  target: '#ff3d3d',
};

export default function MapView({ zones }) {
  const [mounted, setMounted] = useState(false);
  const [map, setMap] = useState(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || map) return;

    // Dynamically import Leaflet
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      
      // Fix leaflet default icon issue
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

      // Dark map tiles
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapInstance);

      // Add zone markers
      zones.forEach((zone) => {
        const color = ZONE_COLORS[zone.status] || ZONE_COLORS.active;
        
        // Create pulsing marker
        const markerHtml = `
          <div style="
            width: 20px;
            height: 20px;
            background: ${color};
            border-radius: 50%;
            border: 3px solid white;
            box-shadow: 0 0 20px ${color}, 0 0 40px ${color}40;
            animation: pulse 2s infinite;
          "></div>
        `;

        const icon = L.divIcon({
          html: markerHtml,
          className: 'custom-marker',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        });

        const marker = L.marker([zone.lat, zone.lng], { icon }).addTo(mapInstance);

        // Popup
        const popupContent = `
          <div style="
            font-family: 'Outfit', sans-serif;
            min-width: 150px;
          ">
            <strong style="font-size: 1.1rem; color: #fff;">${zone.name}</strong>
            <div style="
              margin: 8px 0;
              padding: 4px 10px;
              background: ${color}20;
              border: 1px solid ${color}40;
              border-radius: 20px;
              display: inline-block;
              font-size: 0.75rem;
              color: ${color};
              text-transform: uppercase;
            ">${zone.status}</div>
            <div style="font-size: 0.8rem; color: #6b6b7b; margin-top: 8px;">
              Last activity: ${zone.lastHit}
            </div>
            <div style="font-size: 0.75rem; color: #6b6b7b;">
              Type: ${zone.type}
            </div>
          </div>
        `;

        marker.bindPopup(popupContent, {
          className: 'custom-popup',
        });

        // Click to open popup
        marker.on('mouseover', function (e) {
          this.openPopup();
        });
      });

      setMap(mapInstance);
    };

    initMap();

    return () => {
      if (map) {
        map.remove();
      }
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
