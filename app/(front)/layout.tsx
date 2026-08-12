import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import WishlistDrawer from "@/components/wishlist/WishlistDrawer";

import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { SITE_URL, SITE_NAME, DEFAULT_OG_IMAGE } from "@/app/lib/seo";
import { StructuredData } from "@/components/seo/structured-data";
import HtmlLang from "@/components/i18n/HtmlLang";

const DEFAULT_TITLE = "Luxury Rentals, Exotic Cars & Yacht Charters in Miami | Cupontours";
const DEFAULT_DESCRIPTION =
  "Premium hospitality management and direct bookings in Miami — villas, exotic cars, yachts and private jets. Book direct, no middlemen.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  icons: { icon: "/icon_cupon.svg" },
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  robots: { index: true, follow: true },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
};

// Script anti-parpadeo (FOUC): fija el tema en <html> antes de pintar.
// Prioridad: elección guardada > preferencia del sistema.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('cupontours_theme');if(t==='dark'||(t!=='light'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`;

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body>
        <ThemeProvider>
          <WishlistProvider>
            <Header />
            {children} {/* Aquí se cargarán las páginas que te genere */}
            <Footer />
            <WishlistDrawer />
          </WishlistProvider>
        </ThemeProvider>
      {/* Ajusta <html lang> según el idioma de la ruta */}
      <HtmlLang />
      {/* JSON-LD global: TravelAgency (organización) en todas las páginas */}
      <StructuredData type="Organization" />
      <SpeedInsights />
      <Analytics />
      </body>
    </html>
  );
}
