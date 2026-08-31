# Cupon Tours — Pendientes

_Última actualización: 2026-08-26_

Lista de temas abiertos, ordenados por prioridad. Marca con `[x]` a medida que se cierren.

---

## 🔴 Seguridad (urgente)

- [ ] **Rotar la API key de Anthropic** que quedó expuesta en el chat.
  - Generar una nueva en la consola de Anthropic → actualizarla en DigitalOcean (`ANTHROPIC_API_KEY`) → **revocar la vieja**.
  - Riesgo: una llave filtrada la puede usar cualquiera y consumir crédito.

---

## 🟠 Hostaway — precio de reservas (destraba la sincronización)

Arrastrado desde el inicio. El **webhook de Hostaway está pausado** hasta resolver esto.

- [ ] Definir qué representa el campo `earnings`: ¿**bruto / neto / payout**?
  - Para decidirlo, conseguir el **JSON de una reserva real** de ejemplo (ver cómo llega la data).
- [ ] Ajustar `apps/managements/reservations_sync.py` (línea ~100: hoy guarda `totalPrice` = bruto).
- [ ] **Reactivar el webhook** de Hostaway una vez validado el precio.

---

## 🟡 Automatización de operaciones (WhatsApp / handoff)

- [ ] **Registrar los `wa_codes`** (alias) de las propiedades que el equipo nombra distinto en WhatsApp.
  - Se editan en el admin de Django (`/admin/managements/listing/`, columna editable) o en el formulario de propiedades del dashboard.
- [ ] **Notificaciones de limpieza por WhatsApp** (el correo ya existe; falta el canal WhatsApp de ese módulo).
- [ ] (Opcional) Si sube el volumen, evaluar un proveedor de IA más barato (Groq/Gemini free tier). Por ahora se decidió quedarse con `claude-fable-5`.

---

## 🟢 Verificación / QA de lo reciente

- [ ] Confirmar que **info@cupontours.com** sea un buzón real que el equipo recibe (destino de los formularios del front).
- [ ] Confirmar que **www.cupontour.com** pasó a "Valid Configuration" en Vercel (el DNS ya resolvía bien).
- [ ] Probar en producción:
  - [ ] Plantilla elegante de correos de formularios.
  - [ ] Reordenamiento móvil en los 3 detalles: **propiedades, autos, yates** (calendario + info clave tras la galería).
  - [ ] Reseteo de clave desde el panel de admin (solo staff).
  - [ ] Recuperación de clave por Gmail (enlace apunta a `cupontours.com/login`).

---

## ⚪ Limpieza (sin prisa)

- [ ] Quitar variables `SENDGRID_*` viejas en Vercel y DigitalOcean (ya no se usan).
- [ ] Quitar la dependencia `@sendgrid/mail` del `package.json` del front (migrado a Gmail SMTP / nodemailer).

---

## 🔵 Features aparcadas ("para luego")

- [ ] Integración del **widget de Skyscanner** (multi-vertical). Ya existe una página de pruebas (`/skyscanner-test`).
- [ ] **Eventos de CRO / tracking** más allá del GTM + Meta Pixel base que ya está instalado.

---

## ✅ Cerrado recientemente (referencia)

- Matcheo de propiedades por alias (`wa_codes`) + campo en modelo/admin/dashboard.
- Bot de WhatsApp en **producción** (número +1 754 247 1333 reutilizado, sin romper el envío de n8n) creando tickets.
- Correos migrados de SendGrid (trial caducado) a **Gmail SMTP** (backend y front).
- Plantilla elegante branded para los correos de formularios del front.
- Cambiar/recuperar contraseña (reseteo desde admin + fix de timeout en recuperación).
- Paginado + skeleton de carga en el inicio del dashboard.
- Reordenamiento móvil del calendario en los detalles (propiedades/autos/yates).
- Dominio nuevo `cupontour.com` encaminado en Vercel + DigitalOcean DNS.
