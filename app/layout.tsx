import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

export const metadata: Metadata = {
  title: '2026 NFL Draft Simulator | Free Mock Draft Tool | SundayScouts',
  description: '2026 NFL Mock Draft simulator with free trades. Create your own mock drafts, and explore the big board of draft prospects for the 2026 NFL Draft.',
  keywords: 'NFL Draft Simulator, 2026 NFL Draft, Mock Draft Simulator, NFL mock draft 2026, SundayScouts, NFL mock draft, NFL mock draft simulator',
  authors: [{ name: 'SundayScouts' }],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://sundayscouts.com/',
  },
  openGraph: {
    type: 'website',
    url: 'https://sundayscouts.com/',
    title: '2026 NFL Draft Simulators',
    description: 'Make your own NFL Mock Draft. Trade picks, analyze team needs, and draft 2026 prospects with our advanced simulator.',
    images: ['https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl-draft.png'],
  },
  twitter: {
    card: 'summary_large_image',
    site: 'https://sundayscouts.com/',
    title: '2026 NFL Draft Simulator | Free Mock Draft Tool',
    description: 'Make your own NFL Mock Draft. Free Trades, prospect big board, and advanced simulation',
    images: ['https://a.espncdn.com/combiner/i?img=/i/teamlogos/leagues/500/nfl-draft.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Oswald:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
        <Script
          src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"
          strategy="beforeInteractive"
        />
        {/* Google Analytics */}
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-91N1BKBVR6"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-91N1BKBVR6');
          `}
        </Script>
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
