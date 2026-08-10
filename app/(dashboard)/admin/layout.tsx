import React from "react";
import "./admin.css"; // Estilos estructurales del Back Office
import "@/app/(front)/globals.css"; // Cargamos tus variables globales (--bg-main, etc.)
import { Sidebar } from "./components/Sidebar";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";

import { SpeedInsights } from "@vercel/speed-insights/next";

export const metadata = {
  icons: { icon: "/icon_cupon.svg" },
  title: "Cupontours Back Office - Wander Style",
  description: "Ecosistema premium de administración integrada.",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>
        <div className="wander-admin-wrapper">
          {/* 1. COMPONENTE SIDEBAR (MENÚ LATERAL FIJO) */}
          <Sidebar />

          {/* CONTENEDOR DE TRABAJO DERECHO */}
          <div className="wander-admin-main">
            {/* 2. COMPONENTE NAVBAR (BARRA SUPERIOR) */}
            <Navbar />

            {/* 3. VIEWPORT DE CONTENIDO VARIABLE (AQUÍ CAEN LAS TABLAS Y FILTROS) */}
            <main className="wander-admin-viewport">
              {children}
            </main>

            {/* 4. COMPONENTE FOOTER */}
            <Footer />
          </div>
        </div>
      <SpeedInsights />
      </body>
    </html>
  );
}