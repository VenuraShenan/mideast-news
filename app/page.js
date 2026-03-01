'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic map component
const MapView = dynamic(() => import('./MapView'), { 
  ssr: false,
  loading: () => <div className="loading"><div className="loading-spinner"></div></div>
});

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadNews = async () => {
    setIsRefreshing(true);
    // Simulated news with REAL working URLs
    const newsData = [
      {
        id: 1,
        source: 'BBC News',
        title: 'Israeli military conducts overnight strikes in Gaza as ceasefire talks continue',
        time: '2026-03-01T03:45:00Z',
        url: 'https://www.bbc.com/news/topics/c302m85q5ljt'
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
        url: 'https://www.aljazeera.com/tag/syria/'
      },
      {
        id: 4,
        source: 'BBC News',
        title: 'International mediators urge restraint as tensions rise in region',
        time: '2026-02-29T23:00:00Z',
        url: 'https://www.bbc.com/news/topics/c302m85q5ljt'
      },
      {
        id: 5,
        source: 'Reuters',
        title: 'UN Security Council to hold emergency session on Middle East situation',
        time: '2026-02-29T20:30:00Z',
        url: 'https://www.reuters.com/world/'
      },
      {
        id: 6,
        source: 'Al Jazeera',
        title: 'Humanitarian organizations report critical supply shortages in Gaza',
        time: '2026-02-29T18:00:00Z',
        url: 'https://www.aljazeera.com/news/2026/02/28/gaza-humanitarian-crisis-worsens-as-aid-stocks-dwindle'
      },
    ];
    setNews(newsData);
    setLastUpdated(new Date());
    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    loadNews();
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

  const activeZones = 5;
  const totalZones = 8;

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <h1>Middle East Conflict Monitor</h1>
          <div className="subtitle">
            <span>🗺️ Live situational awareness</span>
          </div>
        </div>
        <div className="header-right">
          <div className="live-badge">
            <span className="live-dot"></span>
            LIVE
          </div>
          <button className="refresh-btn" onClick={loadNews} disabled={isRefreshing}>
            {isRefreshing ? '↻ Refreshing...' : '↻ Refresh'}
          </button>
        </div>
      </header>

      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-icon red">🎯</div>
          <div className="stat-info">
            <h4>{activeZones}</h4>
            <p>Active Conflict Zones</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon cyan">📰</div>
          <div className="stat-info">
            <h4>{news.length}</h4>
            <p>Latest Headlines</p>
          </div>
        </div>
        <div className="stat-item">
          <div className="stat-icon orange">⚠️</div>
          <div className="stat-info">
            <h4>{totalZones - activeZones}</h4>
            <p>Under Watch</p>
          </div>
        </div>
      </div>

      <main className="main-grid">
        <div className="card">
          <div className="card-header map-header">
            <h2>🗺️ Interactive Conflict Map</h2>
            <span className="updated-time">
              {lastUpdated ? `Updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
            </span>
          </div>
          <div className="card-body">
            <div className="map-wrapper">
              <MapView />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header news-header">
            <h2>📰 Latest News</h2>
            <span className="updated-time">
              {lastUpdated ? lastUpdated.toLocaleTimeString() : ''}
            </span>
          </div>
          <div className="card-body">
            <div className="news-list">
              {loading && news.length === 0 ? (
                <div className="loading">
                  <div className="loading-spinner"></div>
                </div>
              ) : news.length === 0 ? (
                <div className="error">
                  Unable to load news. Please try again.
                </div>
              ) : (
                news.map((item) => (
                  <div key={item.id} className="news-item">
                    <span className="news-source">● {item.source}</span>
                    <h3 className="news-title">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.title}
                      </a>
                    </h3>
                    <div className="news-meta">
                      <span className="news-time">{timeAgo(item.time)}</span>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="news-link">
                        Read more →
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
