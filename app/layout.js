import './globals.css';

export const metadata = {
  title: 'Middle East Conflict Monitor | Live News & Map',
  description: 'Real-time Middle East conflict news, interactive map, and situational awareness. Track incidents, attacks, and developments across Gaza, Lebanon, Syria, Israel, and the region.',
  keywords: ['Middle East conflict', 'Gaza news', 'Lebanon news', 'Syria war', 'Israel Palestine', 'real-time news', 'conflict map'],
  authors: [{ name: 'AutoLoom Technologies' }],
  openGraph: {
    title: 'Middle East Conflict Monitor',
    description: 'Real-time Middle East conflict news and interactive map',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Middle East Conflict Monitor',
    description: 'Real-time Middle East conflict news and interactive map',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link 
          rel="stylesheet" 
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin=""
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
