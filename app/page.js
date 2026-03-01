'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamic map component
const MapView = dynamic(() => import('./MapView'), { 
  ssr: false,
  loading: () => <div className="loading"><div className="loading-spinner"></div></div>
});

// Free GNews API key (limited requests)
// For production, get your own key from https://gnews.io/
const GNEWS_API_KEY = 'demo'; // Use 'demo' for testing or replace with free key

// Free RSS-to-JSON service
const RSS_FEEDS = [
  { source: 'BBC', url: 'https://feeds.bbci.co.uk/news/world/middle_east/rss.xml' },
  { source: 'Reuters', url: 'https://www.reutersagency.com/feed/?best-regions=middle-east&post_type=post' },
];

// Cache keys
const CACHE_KEY = 'mideast_news_cache';
const CACHE_TIME_KEY = 'mideast_news_time';
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes (shorter for fresher news)

async function fetchFromGNews() {
  try {
    const response = await fetch(
      `https://gnews.io/api/v4/search?q=middle+east+OR+gaza+OR+israel+OR+lebanon&lang=en&max=10&apikey=${GNEWS_API_KEY}`
    );
    
    if (!response.ok) throw new Error('GNews API error');
    
    const data = await response.json();
    
    return data.articles.map((article, index) => ({
      id: index + 1,
      source: article.source.name || 'Unknown',
      title: article.title,
      time: article.publishedAt,
      url: article.url,
      category: getCategory(article.title)
    }));
  } catch (error) {
    console.log('GNews failed:', error.message);
    return null;
  }
}

async function fetchFromRSS() {
  try {
    // Use rss2json to convert RSS to JSON
    const results = [];
    
    for (const feed of RSS_FEEDS) {
      try {
        const response = await fetch(
          `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`
        );
        const data = await response.json();
        
        if (data.status === 'ok' && data.items) {
          data.items.slice(0, 5).forEach((item, idx) => {
            results.push({
              id: `${feed.source}-${idx}`,
              source: feed.source,
              title: item.title,
              time: item.pubDate,
              url: item.link,
              category: getCategory(item.title)
            });
          });
        }
      } catch (e) {
        console.log(`RSS fetch failed for ${feed.source}:`, e.message);
      }
    }
    
    return results.length > 0 ? results : null;
  } catch (error) {
    console.log('RSS fetch failed:', error.message);
    return null;
  }
}

function getCategory(title) {
  const t = title.toLowerCase();
  if (t.includes('gaza') || t.includes('palestin')) return 'gaza';
  if (t.includes('lebanon') || t.includes('hezbollah')) return 'lebanon';
  if (t.includes('syria') || t.includes('idlib')) return 'syria';
  if (t.includes('iran') || t.includes('tehran')) return 'iran';
  if (t.includes('yemen') || t.includes('houthis')) return 'yemen';
  if (t.includes('iraq')) return 'iraq';
  return 'general';
}

async function fetchNews() {
  // Check cache first
  const cachedTime = localStorage.getItem(CACHE_TIME_KEY);
  const cachedData = localStorage.getItem(CACHE_KEY);
  
  if (cachedTime && cachedData) {
    const age = Date.now() - parseInt(cachedTime);
    if (age < CACHE_DURATION) {
      console.log('Using cached news');
      return JSON.parse(cachedData);
    }
  }
  
  // Try GNews API first
  console.log('Fetching from GNews...');
  let news = await fetchFromGNews();
  
  // Fallback to RSS
  if (!news || news.length === 0) {
    console.log('Fetching from RSS...');
    news = await fetchFromRSS();
  }
  
  // Final fallback to mock data
  if (!news || news.length === 0) {
    console.log('Using fallback data');
    news = getFallbackNews();
  }
  
  // Cache the results
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(news));
    localStorage.setItem(CACHE_TIME_KEY, Date.now().toString());
  } catch (e) {
    console.log('Cache write failed');
  }
  
  return news;
}

function getFallbackNews() {
  return [
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
  ];
}

// Skeleton components
function SkeletonNews() {
  return (
    <div className="skeleton-news-item">
      <div className="skeleton-source"></div>
      <div className="skeleton-title"></div>
      <div className="skeleton-title short"></div>
    </div>
  );
}

export default function Home() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({ active: 0, watch: 0, total: 0 });
  const [apiStatus, setApiStatus] = useState('checking');

  const loadNews = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else if (!lastUpdated) setLoading(true);
    setError(null);
    
    try {
      const data = await fetchNews();
      setNews(data);
      setLastUpdated(new Date());
      
      // Calculate stats
      const categories = data.map(n => n.category);
      const active = categories.filter(c => ['gaza', 'lebanon', 'syria'].includes(c)).length;
      const watch = categories.filter(c => ['iran', 'yemen', 'iraq'].includes(c)).length;
      setStats({ active, watch, total: data.length });
      
      setApiStatus('live');
    } catch (err) {
      setError('Failed to load news. Please try again.');
      setApiStatus('offline');
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
            <span>🗺️</span> Live situational awareness
            <span className="api-status" data-status={apiStatus}>
              {apiStatus === 'live' ? '● API Live' : apiStatus === 'offline' ? '● Offline Mode' : '● Checking...'}
            </span>
          </div>
        </div>
        <div className="header-right">
          <div className="live-badge">
            <span className="live-dot"></span>
            LIVE
          </div>
          <button 
            className="refresh-btn" 
            onClick={() => loadNews(true)}
            disabled={isRefreshing}
          >
            {isRefreshing ? '↻ Refreshing...' : '↻ Refresh'}
          </button>
        </div>
      </header>

      <div className="stats-bar">
        <div className="stat-item">
          <div className="stat-icon red">🎯</div>
          <div className="stat-info">
            <h4>{stats.active}</h4>
            <p>Active Conflict</p>
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
            <h4>{stats.watch}</h4>
            <p>Under Watch</p>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <span className="filter-label">Filter:</span>
        <div className="filter-buttons">
          {sources.map(source => (
            <button
              key={source}
              className={`filter-btn ${filter === source ? 'active' : ''}`}
              onClick={() => setFilter(source)}
            >
              {source === 'all' ? 'All' : source}
            </button>
          ))}
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
            {error && (
              <div className="error">
                {error}
                <button onClick={() => loadNews(true)} className="retry-btn">
                  Try Again
                </button>
              </div>
            )}
            
            {!error && loading && news.length === 0 ? (
              <div className="news-list">
                {[...Array(5)].map((_, i) => (
                  <SkeletonNews key={i} />
                ))}
              </div>
            ) : (
              <div className="news-list">
                {filteredNews.map((item) => (
                  <article key={item.id} className="news-item">
                    <span className="news-source">● {item.source}</span>
                    <h3 className="news-title">
                      <a href={item.url} target="_blank" rel="noopener noreferrer">
                        {item.title}
                      </a>
                    </h3>
                    <div className="news-meta">
                      <time className="news-time">{timeAgo(item.time)}</time>
                      <a href={item.url} target="_blank" rel="noopener noreferrer" className="news-link">
                        Read more →
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
