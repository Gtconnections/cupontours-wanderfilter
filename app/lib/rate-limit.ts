/**
 * Rate limiter en memoria para las rutas API del front.
 *
 * Frena el abuso de los formularios públicos (contacto, booking, invest, etc.):
 * sin esto, cualquiera puede disparar envíos de correo en bucle y agotar la
 * cuota de Gmail SMTP o usar el formulario como vector de spam.
 *
 * Nota: el contador es por instancia (no distribuido). En serverless cada
 * instancia lleva el suyo; suficiente como primera barrera. Para un límite
 * global, usar Redis/Upstash.
 */

const hits = new Map<string, number[]>();

const WINDOW_MS = 60_000; // ventana de 1 minuto
const MAX_HITS = 5; // 5 envíos por minuto por IP
const MAX_KEYS = 5000; // cota de memoria del mapa

function getClientIp(request: Request): string {
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  return request.headers.get('x-real-ip')?.trim() || 'unknown';
}

export function checkRateLimit(
  request: Request,
  maxHits: number = MAX_HITS,
  windowMs: number = WINDOW_MS
): { ok: boolean; retryAfter: number } {
  const now = Date.now();
  const key = getClientIp(request);
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);

  if (recent.length >= maxHits) {
    const retryAfter = Math.max(1, Math.ceil((recent[0] + windowMs - now) / 1000));
    return { ok: false, retryAfter };
  }

  recent.push(now);
  hits.set(key, recent);

  // Limpieza ocasional para no crecer sin cota.
  if (hits.size > MAX_KEYS) {
    for (const [k, times] of hits) {
      const last = times[times.length - 1];
      if (last === undefined || now - last > windowMs) hits.delete(k);
      if (hits.size <= MAX_KEYS - 1000) break;
    }
  }

  return { ok: true, retryAfter: 0 };
}

export function rateLimitedResponse(retryAfter: number) {
  return new Response(
    JSON.stringify({
      success: false,
      message: 'Too many requests. Please wait a moment and try again.',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(retryAfter),
      },
    }
  );
}
