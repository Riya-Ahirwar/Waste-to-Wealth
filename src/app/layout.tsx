import type { Metadata, Viewport } from 'next';
import './globals.css';
import Header from '@/components/Header';
import BottomNav from '@/components/BottomNav';
import InstallPrompt from '@/components/InstallPrompt';
import PWARegister from '@/components/PWARegister';

export const metadata: Metadata = {
  title: 'Waste to Wealth | AI Upcycling Assistant',
  description: 'Turn everyday scrap and waste into valuable DIY crafts with AI-powered ideas, step-by-step guides, and visual inspiration.',
  applicationName: 'Waste2Wealth',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon.svg', type: 'image/svg+xml' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Waste2Wealth',
  },
};

export const viewport: Viewport = {
  themeColor: '#059669',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-100">
      <body className="h-full antialiased text-slate-900 bg-slate-100 flex flex-col items-center">
        {/* Mobile Viewport Wrapper - Centers app on desktop, full-width on mobile */}
        <div className="w-full max-w-md min-h-screen bg-slate-50 flex flex-col shadow-2xl relative border-x border-slate-200/60 pb-20">
          <PWARegister />
          <InstallPrompt />
          <Header />
          <main className="flex-1 w-full p-4 overflow-y-auto">
            {children}
          </main>
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
