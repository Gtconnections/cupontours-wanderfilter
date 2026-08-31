# Cupon Tours — Análisis: pedidos de administración (dashboard)

_Creado: 2026-08-26_

Dos pedidos de administración: (1) automatización de limpiezas, (2) dashboard de agentes con roles.
**Decisión:** empezamos por el **dashboard de agentes**. El de limpiezas queda a la espera de corroborar
información con administración (qué equipo limpia cada propiedad, etc.).

---

## Punto 1 — Automatización de limpiezas (EN ESPERA de info de administración)

### Ya existe (la parte difícil) ✅
- **La data de limpiezas se genera sola desde las reservas.** El backend deriva los *turnovers* (checkouts)
  en vivo de las reservas confirmadas de Hostaway: por cada checkout calcula próxima entrada, *same-day*, gap de días.
  (`TurnoversView` en `apps/managements/api/operations/views.py`.)
- **Asignación de equipo:** cada limpieza se asigna a un `cleaner` (modelo `Vendor`, con **teléfono y email**).
- **Estados + checklist** por limpieza (`TurnoverStatus`, `Checklist`).
- **El dashboard ya lo muestra** (módulo Turnovers), con contador de "sin asignar", same-day, etc.
- **Canales listos:** correo (Gmail SMTP) y WhatsApp (Twilio).

### Falta (el ~30%, la automatización en sí) ❌
1. **Regla "qué equipo limpia qué propiedad"** → cleaner por defecto por propiedad (hoy es manual por limpieza).
2. **Job programado** que junta las limpiezas del día, las agrupa por equipo y le manda a cada uno su lista.
3. **WhatsApp iniciado por nosotros** requiere plantillas aprobadas por Meta → para el beta, **empezar por correo**.

### Dependencia ⚠️
- Se alimenta de las reservas de Hostaway, y ese **webhook está pausado** (pendiente del precio).
  Reactivar la sincronización de Hostaway es requisito para tener data real.

**Cobertura estimada:** ~65-70% ya construido. Falta: cleaner por defecto + job de envío + reactivar Hostaway.

---

## Punto 2 — Dashboard de agentes con roles (EMPEZAMOS POR AQUÍ)

### Contexto (definido por administración)
- **Socio (owner):** tiene la propiedad directa → **puede editar** la propiedad.
- **Agente:** trae una propiedad de un socio → **solo lectura** (ver datos).
- El agente debe poder ver: sus **listings asignados**, lo que **produce cada uno** (pay / profit del mes),
  su **contrato** (profit-sharing / reparto de comisión), y **cuándo se hizo el pago** de comisiones.
- Poder **adjuntar el documento** del acuerdo.
- **Control por rol:** agente / owner / admin, cada uno ve lo que le compete.

### Ya existe ✅
- `Listing.owner` (Profile) = el socio/dueño de la propiedad.
- `ProfitAndLoss` = P&L mensual por propiedad (lo que produce).
- `Agreement` = contrato por propiedad (título, vencimiento, archivo).
- `Profile.position` (roles: owner, seller, listing_owner, car_owner…) + `is_staff`.
- Patrón de filtrar data por usuario (ProfileView ya lo hace para no-staff).

### Falta ❌
- **Rol "agente"** (hoy no existe; lo más cercano es "seller").
- **Vínculo agente↔propiedad** (quién trajo cada listing). Hoy solo hay "owner", no "agente que la trajo".
- **Modelo de comisiones / profit-sharing** con % y **pagos** (monto + fecha). No existe como tal.
- **Vistas de solo-lectura** scoped para el agente (sus listings, P&L, contrato, comisiones).

### Diseño de roles (recomendado)
- **agente:** solo lectura, ve únicamente sus listings asignados + P&L + contrato + comisiones.
- **owner (socio):** edita sus propiedades.
- **admin:** acceso total.
- Se apoya en `Profile.position` + `is_staff` + scoping por usuario en cada endpoint.

### Plan por fases (propuesto)
- **Fase 1:** rol "agente" + vínculo agente↔listing + dashboard de agente de solo-lectura
  (sus listings + P&L del mes + contrato descargable).
- **Fase 2:** modelo de comisiones/profit-sharing + registro de pagos (monto, fecha) + su vista.
- **Fase 3:** endurecer control por rol en todo el panel (agente/owner/admin).

---

## Orden acordado
1. **Dashboard de agentes** (esto, ahora).
2. Reactivar Hostaway (requiere JSON de reserva de ejemplo para el precio).
3. Beta de limpiezas por correo (tras corroborar con administración quién limpia qué).
