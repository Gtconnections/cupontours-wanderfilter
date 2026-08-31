# Cupon Tours — Automatizaciones con agentes de IA

_Creado: 2026-08-26_

Objetivo: poner agentes de IA a hacer tareas repetitivas para prescindir de personal.
Reservas ya cubiertas con el webhook de Hostaway. Puntos ordenados por dónde ya hay base construida.

---

## Oportunidades de automatización

### 1. Atención al cliente (24/7, WhatsApp + web)
Responde disponibilidad, precios, detalles de propiedad/auto/yate, estado de reserva y FAQs.
Se apoya en la data de listings + reservas de Hostaway. Escala a humano solo casos raros.
→ Reemplaza el grueso del soporte de primer nivel.

> **Nota de arquitectura (importante):** para atención al cliente se usará un **número de WhatsApp NUEVO/dedicado**.
> El número actual (**+1 754 247 1333**) ya hace **dos cosas distintas**: envío por n8n (outbound) y recepción del clasificador de handoff (inbound).
> Para no afectar esos flujos, el agente de atención al cliente va en **su propio número** — canal aislado.

### 2. Concierge del huésped (pre y post estadía)
Mensajes automáticos por reserva: instrucciones de check-in, código de puerta, normas, y post-checkout el pedido de reseña.
Disparado por la reserva que ya llega del webhook.
→ Quita mensajería manual repetitiva.

### 3. Calificación y seguimiento de leads
Los formularios (contact/invest/jets/booking) hoy solo mandan correo. El agente responde al instante, califica el lead y hace follow-up si no contestan.
→ Reemplaza parte del equipo de ventas/seguimiento.

### 4. Upsell cruzado entre verticales
Ofrecer auto o yate a quien reserva un apartamento, transporte al aeropuerto, etc. (propiedades + autos + yates + jets).
→ Ingresos extra sin vendedor.

### 5. Operaciones / mantenimiento (extender el handoff)
El clasificador ya crea tickets. Siguiente paso: auto-asignar al proveedor correcto, seguimiento de tickets abiertos, escalar los vencidos, avisar reposición de bajo stock.
→ Reduce coordinación manual de operaciones.

### 6. Coordinación de limpieza (turnovers)
Programa la limpieza según los checkouts, avisa al equipo por WhatsApp, y confirma que se hizo (verificación con fotos + checklist).
→ Menos coordinador de limpieza.

### 7. Reseñas y reputación
Pide reseñas automáticamente, monitorea Google/Airbnb, responde las positivas y alerta las negativas para intervención humana.
→ Quita gestión manual de reputación.

### 8. Reportes a propietarios (owners)
Con el modelo de P&L existente, genera el estado mensual por propiedad y lo envía al owner.
→ Reemplaza trabajo administrativo recurrente.

### 9. Contenido y marketing
Genera/optimiza descripciones de listings, posts de redes y correos de campaña.
→ Aligera el equipo de marketing.

---

## Dónde empezar (mayor palanca, menor esfuerzo)

1. **Atención al cliente por WhatsApp** (número dedicado) — el que más carga de personal quita.
2. **Concierge por reserva** — se engancha directo al webhook de Hostaway que ya funciona.
3. **Seguimiento de leads** — reusa los formularios ya migrados.

---

## Principio transversal

Mantener **un humano en el loop** para: reservas de alto valor, quejas serias y pagos.
El agente maneja el ~80% repetitivo y avisa el ~20% delicado.

---

## Detalle definido por el cliente

- **Atención al cliente → número de WhatsApp NUEVO y dedicado** (no reutilizar el +1 754 247 1333).
  Motivo: ese número ya envía (n8n) y recibe (handoff) para dos cosas distintas; no queremos afectarlas.
