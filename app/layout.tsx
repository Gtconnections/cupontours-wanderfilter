import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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