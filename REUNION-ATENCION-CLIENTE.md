# Atención al cliente con IA — resumen para la reunión

_Para decidir con la administración. Estado: el agente ya responde en pruebas (sandbox de WhatsApp)._

## Qué ya funciona
Un agente de IA (WhatsApp) que responde a clientes: info de propiedades/autos/yates,
**disponibilidad y precio en vivo** desde nuestra base, estado de una reserva, y
**escala a un humano** los casos delicados. Va en un número dedicado (hoy se prueba en sandbox).

## Cómo pasa la conversación a un humano
Escala automáticamente cuando el cliente: quiere **reservar o pagar**, pedir un
**cambio/cancelación**, tiene una **queja seria**, es un **caso de alto valor**, o
**pide hablar con una persona**. En ese momento:
- Al cliente le llega "un asesor te contactará en breve".
- El bot **se calla** en ese chat (deja de responder).
- Llega una **alerta al número del equipo** con el resumen del caso.

## Decisión clave (esto es lo de la reunión)
El cliente **siempre sigue en el mismo número** (el del agente). El punto a decidir es
**cómo atiende el humano una vez escalado**:

- **Opción A (recomendada, ya construida por dentro):** el asesor responde desde el
  **dashboard**; su respuesta sale por el **mismo número del agente**. El cliente vive
  una sola conversación fluida (bot → humano), sin cambiar de contacto.
  Falta solo la pantalla de bandeja en el dashboard (los datos/endpoints ya están).

- **Opción B:** el asesor responde desde **su propia WhatsApp**. Se puede, pero WhatsApp
  no "transfiere" chats entre números: el cliente vería un **contacto nuevo** y una
  conversación aparte. Menos fluido (o requiere una app de bandeja compartida).

> Recomendación: Opción A. Un solo número de cara al cliente, historial completo, y el
> asesor toma el control cuando quiere.

## Segundo tema a validar: ¿el agente puede cerrar reservas?
Hoy "crear reserva" en el dashboard **graba solo en nuestra base local**, sin pago y sin
empujar a Hostaway. Para que el agente cierre reservas con "sincronía perfecta" hacen
falta tres piezas que hoy NO están conectadas:
1. **Push a Hostaway** al crear (para bloquear Airbnb/Booking y evitar sobreventa).
2. **Reactivar el webhook de Hostaway** (hoy pausado) para disponibilidad en tiempo real.
3. Un **link de pago seguro** que el cliente completa (el bot nunca toca la tarjeta).

Propuesta por fases:
- **v1 (bajo riesgo):** "reserva asistida" — el agente reúne todo y cotiza, y luego crea
  una reserva **pendiente** + escala a un humano (o manda link de pago). No compromete
  inventario ni maneja pagos.
- **v2:** auto-reserva de punta a punta, una vez cableadas las tres piezas de arriba.

## Preguntas para la administración
1. ¿Atención tras escalar por **dashboard** (Opción A) o por WhatsApp del asesor (B)?
2. ¿A qué **número del equipo** llegan las alertas de escalación?
3. ¿Arrancamos con **reserva asistida** (v1) o priorizamos ir al **auto-booking** (v2)?
4. ¿Qué debe **siempre** pasar a humano sí o sí? (montos altos, grupos, quejas, etc.)
