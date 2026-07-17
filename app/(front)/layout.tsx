import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Cupontours | Luxury Vacation Rentals, Car & Yacht Charters",
  description: "Book exclusive luxury vacation rentals, premium car rentals, and yacht charters worldwide with Cupontours.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="es">
      <body>
        <Header />
        {children} {/* Aquí se cargarán las páginas que te genere */}
        <Footer />
      </body>
    </html>
  );
}