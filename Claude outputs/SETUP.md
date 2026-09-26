# PriceLabs — Fase 1 (mercado en el Pricing Engine) — SETUP

Fase 1 = mostrar el precio de **PriceLabs (mercado)** junto a nuestra sugerencia en el
Pricing Engine. **Solo lectura, no cambia precios.** Todo está env-gated: si no hay API
key, el endpoint responde `enabled:false` y la UI muestra un aviso — es seguro desplegar ya.

## 1) Backend (repo dashboard-cupontours-backend, rama master) — YA COLOCADO
Archivos escritos en el repo:
- `apps/managements/api/pricing/pricelabs_client.py`  (NUEVO — cliente Customer API)
- `apps/managements/api/pricing/market_views.py`      (NUEVO — endpoint GET `api/pricing/market/`)
- `apps/managements/api/pricing/urls.py`              (EDITADO — agрега la ruta market)

Commit + push:
```
git add apps/managements/api/pricing/pricelabs_client.py apps/managements/api/pricing/market_views.py apps/managements/api/pricing/urls.py
git commit -m "Pricing: Fase 1 PriceLabs (endpoint de mercado, solo lectura)"
git push origin master
```

## 2) Frontend (repo cupontours, rama main) — archivos listos, faltó colocar
Copiar estos dos (están en esta entrega, carpeta front/):
- `app/lib/api/pricing.ts`                              (EDITADO — agrega getMarketPrices)
- `app/(dashboard)/admin/pricing/page.tsx`             (EDITADO — muestra PL por día)

Commit + push:
```
git add "app/lib/api/pricing.ts" "app/(dashboard)/admin/pricing/page.tsx"
git commit -m "Pricing UI: mostrar precio de mercado de PriceLabs por dia"
git push origin main
```

## 3) Variables de entorno (DigitalOcean) — lo único que falta para activarlo
- `PRICELABS_API_KEY`   = <tu Customer API key>   (OBLIGATORIA; sin ella queda en modo aviso)
- `PRICELABS_BASE_URL`  = https://api.pricelabs.co/v1   (opcional, es el default)
- `PRICELABS_PMS`       = hostaway                       (opcional, es el default; cómo PriceLabs identifica el listing)

La key la sacas de PriceLabs: Account Settings → API Details → *Get PriceLabs API Key*.
Costo de la API: ~$1/listing/mes.

## 4) Nota técnica (afinar al probar con la key real)
El cliente usa los endpoints estándar de la Customer API v1:
- `GET  https://api.pricelabs.co/v1/listings`
- `POST https://api.pricelabs.co/v1/listing_prices`  (auth header `X-API-Key`)
El parseo es tolerante, pero al conectar la key real conviene confirmar el shape exacto de
la respuesta contra developers.pricelabs.co y ajustar `_parse_prices` si hiciera falta.
El mapeo listing↔PriceLabs usa `Listing.property_id` (= id de Hostaway).

## Qué se ve
En el Pricing Engine, cada día del calendario muestra debajo del precio un “PL $X”
(azul) con la recomendación de PriceLabs, y el editor de día lo muestra junto a “Sugerido”.
Si PriceLabs no está configurado, aparece un aviso para agregar la key.

## Siguiente (Fase 2 — no incluida aquí)
El agente programado que detecta bajo flujo/temporada baja y ESCRIBE descuentos en PriceLabs
(en dry-run primero). Se construye después de validar la Fase 1 con datos reales.
