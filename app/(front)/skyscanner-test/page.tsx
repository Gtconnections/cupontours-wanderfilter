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
            Skyscanner <span className="sky-test-accent">Multi-vertical</span>
          </h1>
        </header>

        <section
          className="sky-test-panel"
          aria-label="Skyscanner multi-vertical widget"
        >
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
      </div>
    </main>
  );
}
