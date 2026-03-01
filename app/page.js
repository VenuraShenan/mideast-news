'use client';

import { useState, useEffect } from 'react';

// Conflict zones data
const CONFLICT_ZONES = [
  { id: 1, name: 'Gaza Strip', lat: 31.4217, lng: 34.3985, status: 'active', lastHit: '2026-03-01 04:00' },
  { id: 2, name: 'Lebanon', lat: 33.8547, lng: 35.8623, status: 'active', lastHit: '2026-03-01 03:30' },
  { id: 3, name: 'Syria', lat: 34.8021, lng: 38.9968, status: 'active', lastHit: '2026-03-01 02:15' },
  { id: 4, name: 'Iraq', lat: 33.2232, lng: 43.6793, status: 'watch', lastHit: '2026-02-28 22:00' },
  { id: 5, name: 'Yemen', lat: 15.5527, lng: 48.5164, status: 'watch', lastHit: '2026-02-28 18:00' },
  { id: 6, name: 'Iran', lat: 32.4279, lng: 53.6880, status: 'threat', lastHit: '2026-02-27 12:00' },
  { id: 7, name: 'Israel', lat: 31.0461, lng: 34.8516, status: 'target', lastHit: '2026-03-01 04:15' },
  { id: 8, name: 'West Bank', lat: 31.9092, lng: 35.3739, status: 'active', lastHit: '2026-03-01 01:00' },
];

// News fetcher (simulated for demo - in production, fetch from APIs)
async function fetchNews() {
  // In production, fetch from BBC, Al Jazeera, Reuters APIs
  // For demo, return structured news
  const news = [
    {
      id: 1,
      source: 'BBC News',
      title: 'Israeli military conducts overnight strikes in Gaza as ceasefire talks continue',
      time: '2026-03-01T03:45:00Z',
      url: 'https://www.bbc.com/news/middle-east'
    },
    {
      id: 2,
      source: 'Reuters',
      title: 'Lebanon reports fresh artillery exchanges along southern border',
      time: '2026-03-01T02:30:00Z',
      url: 'https://www.reuters.com/world/middle-east'
    },
    {
      id: 3,
      source: 'Al Jazeera',
      title: 'Syrian civilian casualties reported in latest escalation in Idlib',
      time: '2026-03-01T01:15:00Z',
      url: 'https://www.aljazeera.com/news'
    },
    {
      id: 4,
      source: 'BBC News',
      title: 'International mediators urge restraint as tensions rise in region',
      time: '2026-02-29T23:00:00Z',
      url: 'https://www.bbc.com/news/middle-east'
    },
    {
      id: 5,
      source: 'Reuters',
      title: 'UN Security Council to emergency session on Middle East situation',
      time: '2026-02-29T20:30:00Z',
      url: 'https://www.reuters.com/world/middle-east'
    },
    {
      id: 6,
      source: 'Al Jazeera',
      title: 'Humanitarian organizations report critical supply shortages in Gaza',
      time: '2026-02-29T18:00:00Z',
      url: 'https://www.aljazeera.com/news'
    },
  ];
  
  return news;
}

function MapComponent() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  if (!mounted) {
    return <div className="loading">Loading map...</div>;
  }
  
  // Dynamic import for Leaflet (only on client)
  const { MapContainer, TileLayer, CircleMarker, Popup } = require('react-leaflet');
  
  return (
    <div className="map-wrapper">
      <MapContainer 
        center={[30, 45]} 
        zoom={5} 
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        {CONFLICT_ZONES.map((zone) => (
          <CircleMarker
            key={zone.id}
            center={[zone.lat, zone.lng]}
            radius={zone.status === 'active' ? 15 : 10}
            pathOptions={{
              color: zone.status === 'active' ? '#e63946' : zone.status === 'watch' ? '#f59e0b' : '#6b7280',
              fillColor: zone.status === 'active' ? '#e63946' : zone.status === 'watch' ? '#f59e0b' : '#6b7280',
              fillOpacity: 0.7
            }}
          >
            <Popup>
              <div style={{ color: '#000', padding: '5px' }}>
                <strong>{zone.name}</strong><br/>
                Status: {zone.status}<br/>
                Last activity: {zone.lastHit}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  const loadNews = async () => {
    setLoading(true);
    try {
      const data = await fetchNews();
      setNews(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching news:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadNews();
    
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const timeAgo = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Middle East Conflict Monitor</h1>
        <div className="status">
          <span className="status-dot"></span>
          <span>Live Updates</span>
        </div>
      </header>

      <main className="main-grid">
        <div className="map-container">
          <div className="map-header">
            <h2>🗺️ Conflict Zones</h2>
          </div>
          <MapComponent />
        </div>

        <div className="news-container">
          <div className="news-header">
            <h2>📰 Latest News</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              {lastUpdated && (
                <span className="last-updated">
                  Updated: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
              <button className="refresh-btn" onClick={loadNews}>
                Refresh
              </button>
            </div>
          </div>
          
          <div className="news-list">
            {loading && news.length === 0 ? (
              <div className="loading">Loading news...</div>
            ) : news.length === 0 ? (
              <div className="error">
                Unable to load news. Please try again.
              </div>
            ) : (
              news.map((item) => (
                <div key={item.id} className="news-item">
                  <span className="news-source">{item.source}</span>
                  <h3 className="news-title">
                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                      {item.title}
                    </a>
                  </h3>
                  <span className="news-time">{timeAgo(item.time)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
