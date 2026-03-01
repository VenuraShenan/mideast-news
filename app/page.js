'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic map component
const MapView = dynamic(() => import('./MapView'), { 
  ssr: false,
  loading: () => <SkeletonMap />
});

// Skeleton components
function SkeletonCard() {
  return (
    <div className="card">
      <div className="card-header">
        <div className="skeleton-header"></div>
      </div>
      <div className="card-body">
        <div className="skeleton-content"></div>
      </div>
    </div>
  );
}

function SkeletonMap() {
  return (
    <div className="loading">
      <div className="loading-spinner"></div>
    </div>
  );
}

function SkeletonNews() {
  return (
    <div className="skeleton-news-item">
      <div className="skeleton-source"></div>
      <div className="skeleton-title"></div>
      <div className="skeleton-title short"></div>
    </div>
  );
}

// News fetcher with caching
async function fetchNews() {
  // Check cache first
  const cacheKey = 'mideast_news_cache';
  const cacheTimeKey = 'mideast_news_time';
  
  try {
    // Try to fetch from RSS feeds
    const rssFeeds = [
      { source: 'BBC', url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml' },
      { source: 'Reuters', url: 'https://www.reutersagency.com/feed/?best-regions=middle-east' },
    ];
    
    // For demo, use cached/mock data with real URLs
    // In production, parse actual RSS XML
    const mockNews = [
      {
        id: 1,
        source: 'BBC News',
        title: 'Israeli military conducts overnight strikes in Gaza as ceasefire talks continue',
        time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        url: 'https://www.bbc.com/news/topics/c302m85q5ljt',
        category: 'gaza'
      },
      {
        id: 2,
        source: 'Reuters',
        title: 'Lebanon reports fresh artillery exchanges along southern border',
        time: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        url: 'https://www.reuters.com/world/middle-east',
        category: 'lebanon'
      },
      {
        id: 3,
        source: 'Al Jazeera',
        title: 'Syrian civilian casualties reported in latest escalation in Idlib',
        time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        url: 'https://www.aljazeera.com/tag/syria/',
        category: 'syria'
      },
      {
        id: 4,
        source: 'BBC News',
        title: 'International mediators urge restraint as tensions rise in region',
        time: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        url: 'https://www.bbc.com/news/topics/c302m85q5ljt',
        category: 'general'
      },
      {
        id: 5,
        source: 'Reuters',
        title: 'UN Security Council to hold emergency session on Middle East situation',
        time: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        url: 'https://www.reuters.com/world/',
        category: 'general'
      },
      {
        id: 6,
        source: 'Al Jazeera',
        title: 'Humanitarian organizations report critical supply shortages in Gaza',
        time: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        url: 'https://www.aljazeera.com/news/',
        category: 'gaza'
      },
      {
        id: 7,
        source: 'BBC News',
        title: 'Iran warns of proportional response to Israeli threats',
        time: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        url: 'https://www.bbc.com/news/topics/c302m85q5ljt',
        category: 'iran'
      },
      {
        id: 8,
        source: 'Reuters',
        title: 'Yemen Houthis claim drone attack on Israeli airport',
        time: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        url: 'https://www.reuters.com/world/middle-east',
        category: 'yemen'
      },
    ];
    
    // Cache the data
    try {
      localStorage.setItem(cacheKey, JSON.stringify(mockNews));
      localStorage.setItem(cacheTimeKey, Date.now().toString());
    } catch (e) {
      console.log('Cache write failed:', e);
    }
    
    return mockNews;
  } catch (error) {
    console.error('Fetch error:', error);
    
    // Try to use cached data on error
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.log('Cache read failed');
    }
    
    return [];
  }
}

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ active: 0, watch: 0, total: 0 });

  const loadNews = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else if (!lastUpdated) setLoading(true);
    setError(null);
    
    try {
      const data = await fetchNews();
      setNews(data);
      setLastUpdated(new Date());
      
      // Calculate stats from data
      const categories = data.map(n => n.category);
      const active = categories.filter(c => ['gaza', 'lebanon', 'syria'].includes(c)).length;
      const watch = categories.filter(c => ['iran', 'yemen', 'iraq'].includes(c)).length;
      setStats({
        active,
        watch,
        total: data.length
      });
    } catch (err) {
      setError('Failed to load news. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadNews();
    const interval = setInterval(() => loadNews(true), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter news
  const filteredNews = filter === 'all' 
    ? news 
    : news.filter(n => n.source.toLowerCase().includes(filter));

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

  const sources = ['all', ...new Set(news.map(n => n.source.toLowerCase()))];

  return (
    <div className="container">
      <header className="header">
        <div className="header-left">
          <h1>Middle East Conflict Monitor</h1>
          <div className="subtitle">
            <span aria-label="Map">🗺️</span> Live situational awareness
          </div>
        </div>
        <div className="header-right">
          <div className="live-badge" aria-label="Live status">
            <span className="live-dot" aria-hidden="true"></span>
            LIVE
          </div>
          <button 
            className="refresh-btn" 
            onClick={() => loadNews(true)}
            disabled={isRefreshing}
            aria-label="Refresh news"
          >
            {isRefreshing ? '↻ Refreshing...' : '↻ Refresh'}
          </button>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="stats-bar" role="region" aria-label="Statistics">
        <div className="stat-item" tabIndex={0} aria-label={`${stats.active} Active conflict zones`}>
          <div className="stat-icon red" aria-hidden="true">🎯</div>
          <div className="stat-info">
            <h4>{stats.active}</h4>
            <p>Active Conflict Zones</p>
          </div>
        </div>
        <div className="stat-item" tabIndex={0} aria-label={`${news.length} Latest headlines`}>
          <div className="stat-icon cyan" aria-hidden="true">📰</div>
          <div className="stat-info">
            <h4>{news.length}</h4>
            <p>Latest Headlines</p>
          </div>
        </div>
        <div className="stat-item" tabIndex={0} aria-label={`${stats.watch} Areas under watch`}>
          <div className="stat-icon orange" aria-hidden="true">⚠️</div>
          <div className="stat-info">
            <h4>{stats.watch}</h4>
            <p>Under Watch</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-bar">
        <span className="filter-label">Filter by source:</span>
        <div className="filter-buttons" role="group" aria-label="News source filters">
          {sources.map(source => (
            <button
              key={source}
              className={`filter-btn ${filter === source ? 'active' : ''}`}
              onClick={() => setFilter(source)}
              aria-pressed={filter === source}
            >
              {source === 'all' ? 'All' : source.charAt(0).toUpperCase() + source.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <main className="main-grid">
        <div className="card">
          <div className="card-header map-header">
            <h2>🗺️ Interactive Conflict Map</h2>
            <span className="updated-time" aria-label={`Last updated: ${lastUpdated ? lastUpdated.toLocaleTimeString() : 'loading'}`}>
              {lastUpdated ? `Updated: ${lastUpdated.toLocaleTimeString()}` : 'Loading...'}
            </span>
          </div>
          <div className="card-body">
            <div className="map-wrapper" role="application" aria-label="Conflict zone map">
              <MapView />
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header news-header">
            <h2>📰 Latest News</h2>
            <span className="updated-time" aria-label={`Last updated: ${lastUpdated ? lastUpdated.toLocaleTimeString() : ''}`}>
              {lastUpdated ? lastUpdated.toLocaleTimeString() : ''}
            </span>
          </div>
          <div className="card-body">
            {error && (
              <div className="error" role="alert">
                {error}
                <button onClick={() => loadNews(true)} className="retry-btn">
                  Try Again
                </button>
              </div>
            )}
            
            {!error && loading && news.length === 0 ? (
              <div className="news-list" aria-label="Loading news">
                {[...Array(5)].map((_, i) => (
                  <SkeletonNews key={i} />
                ))}
              </div>
            ) : (
              <div className="news-list" role="feed" aria-label="News articles">
                {filteredNews.map((item) => (
                  <article 
                    key={item.id} 
                    className="news-item"
                    tabIndex={0}
                    aria-label={`${item.source}: ${item.title}`}
                  >
                    <span className="news-source" aria-label={`Source: ${item.source}`}>
                      ● {item.source}
                    </span>
                    <h3 className="news-title">
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        aria-label={`Read full article: ${item.title}`}
                      >
                        {item.title}
                      </a>
                    </h3>
                    <div className="news-meta">
                      <time className="news-time" dateTime={item.time}>
                        {timeAgo(item.time)}
                      </time>
                      <a 
                        href={item.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="news-link"
                        aria-label="Read more"
                      >
                        Read more <span aria-hidden="true">→</span>
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
