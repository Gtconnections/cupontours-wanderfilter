import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { WishlistProvider } from "@/components/wishlist/WishlistProvider";
import WishlistDrawer from "@/components/wishlist/WishlistDrawer";

export const metadata = {
  icons: { icon: "/icon_cupon.svg" },
  title: "Cupontours | Luxury Vacation Rentals, Car & Yacht Charters",
  description: "Book exclusive luxury vacation rentals, premium car rentals, and yacht charters worldwide with Cupontours.",
};

// Script anti-parpadeo (FOUC): fija el tema en <html> antes de pintar.
// Prioridad: elección guardada > preferencia del sistema.
const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('cupontours_theme');if(t==='dark'||(t!=='light'&&window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`;

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es" suppressHydrationWarning>
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
      </body>
    </html>
  );
}
