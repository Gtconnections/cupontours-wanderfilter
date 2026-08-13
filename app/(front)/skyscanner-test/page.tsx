import type { Metadata } from "next";
import SkyscannerWidget from "@/components/SkyscannerWidget";
import "./skyscanner-test.css";

export const metadata: Metadata = {
  title: "Skyscanner Widget — Pruebas | Cupontours",
  // Página interna de pruebas: no indexar.
  robots: { index: false, follow: false },
};

export default function SkyscannerTestPage() {
  return (
    <main className="sky-test">
      <div className="sky-test-container">
        <header className="sky-test-header">
          <span className="sky-test-eyebrow">INTEGRACIÓN · PRUEBAS</span>
          <h1>
            Skyscanner · <span className="sky-test-accent">Multi-vertical</span>
          </h1>
          <p>
            Widget reutilizable con carga automática del loader y reconstrucción
            en cambios de ruta y de tema (claro/oscuro). El loader de Skyscanner
            puede devolver <code>403</code> en <code>localhost</code> por su
            protección anti-bot y renderiza bien una vez desplegado.
          </p>
        </header>

        <section className="sky-test-widget" aria-label="Skyscanner multi-vertical widget">
          <SkyscannerWidget
            verticals={["flights", "hotels", "cars"]}
            defaultTab="flights"
            locale="en-US"
            market="US"
            currency="USD"
            borderRadius={16}
            /*
             * TODO: coloca aquí tu Associate/Partner ID de Skyscanner para
             * habilitar el tracking de afiliado:
             *   associateId="ABC_DEF_12345_56789"
             */
          />
        </section>

        <p className="sky-test-note">
          Este widget soporta únicamente <strong>vuelos, hoteles y autos</strong>.
          “Packages” no está disponible como vertical en la integración de
          Skyscanner.
        </p>
      </div>
    </main>
  );
}
