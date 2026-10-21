/**
 * Anti-spam (Capa 1) para las rutas API de formularios publicos.
 *
 * Tres barreras, sin friccion para el usuario real y sin servicios externos:
 *  - Honeypot: un campo cebo oculto que el humano no ve; si llega con texto, es bot.
 *  - Trampa de tiempo: si el formulario se envia demasiado rapido tras abrirse, es bot.
 *  - Validacion de contenido: email valido, topes de longitud, nada de caracteres de
 *    control / basura, y freno al exceso de enlaces (spam).
 *
 * Uso en una ruta:
 *   const body = await request.json();
 *   if (isBotSubmission(body)) return fakeOk();            // se descarta en silencio
 *   const v = validateLead({ email, names:[...], texts:[...], message });
 *   if (!v.ok) {
 *     if (v.hard) return NextResponse.json({success:false, message:v.message}, {status:400});
 *     return fakeOk();                                     // basura -> se descarta en silencio
 *   }
 */

// Caracteres de control (no imprimibles), excluyendo tab/salto de linea/retorno.
const CONTROL_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Minimo de tiempo (ms) que un humano tarda en llenar y enviar un formulario.
const MIN_FILL_MS = 2500;

// Nombres del/los campo(s) cebo (honeypot). El front los deja ocultos.
const HONEYPOT_FIELDS = ['_hp_url', '_hp', 'website', 'company_website'];

export function isBotSubmission(body: unknown, minFillMs: number = MIN_FILL_MS): boolean {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;

  // 1) Honeypot con contenido -> bot.
  for (const f of HONEYPOT_FIELDS) {
    const v = b[f];
    if (typeof v === 'string' && v.trim() !== '') return true;
  }

  // 2) Enviado demasiado rapido -> bot. (Solo si el front mando el dato.)
  const elapsed = Number(b['_elapsed']);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < minFillMs) return true;

  return false;
}

export function isValidEmail(email: unknown): boolean {
  if (typeof email !== 'string') return false;
  const e = email.trim();
  return e.length > 0 && e.length <= 254 && EMAIL_RE.test(e);
}

function hasControlChars(s: string): boolean {
  return CONTROL_RE.test(s);
}

function letterRatioTooLow(s: string): boolean {
  const t = s.trim();
  if (!t) return false;
  const letters = (t.match(/\p{L}/gu) || []).length;
  if (letters === 0) return true; // sin una sola letra -> basura
  const nonSpace = t.replace(/\s/g, '').length;
  return nonSpace > 0 && letters / nonSpace < 0.3; // mayormente simbolos -> basura
}

function countLinks(s: string): number {
  const m = s.match(/https?:\/\/|www\.|\[url|\[link|<\/?a[\s>]/gi);
  return m ? m.length : 0;
}

export interface LeadInput {
  email?: unknown;
  names?: unknown[];   // campos de nombre (se revisan por basura)
  texts?: unknown[];   // campos de texto libre (longitud + control)
  message?: unknown;   // mensaje largo (enlaces)
  maxNameLen?: number;
  maxTextLen?: number;
  maxMessageLen?: number;
  maxLinks?: number;
}

export interface LeadResult {
  ok: boolean;
  hard?: boolean;      // true -> error que el usuario puede corregir (400). false -> basura (drop silencioso).
  message?: string;
  reason?: string;
}

export function validateLead(input: LeadInput): LeadResult {
  const maxName = input.maxNameLen ?? 80;
  const maxText = input.maxTextLen ?? 300;
  const maxMsg = input.maxMessageLen ?? 5000;
  const maxLinks = input.maxLinks ?? 4;

  // Email (requerido y con formato valido) -> error corregible.
  if (input.email !== undefined) {
    if (!isValidEmail(input.email)) {
      return { ok: false, hard: true, message: 'Please enter a valid email address.', reason: 'bad_email' };
    }
  }

  // Nombres: sin letras / mayormente simbolos / control / demasiado largos -> basura.
  for (const raw of input.names ?? []) {
    if (typeof raw !== 'string') continue;
    if (raw.length > maxName) return { ok: false, reason: 'name_too_long' };
    if (hasControlChars(raw)) return { ok: false, reason: 'name_control' };
    if (letterRatioTooLow(raw)) return { ok: false, reason: 'name_gibberish' };
  }

  // Textos libres: control / demasiado largos -> basura.
  for (const raw of input.texts ?? []) {
    if (typeof raw !== 'string') continue;
    if (raw.length > maxText) return { ok: false, reason: 'text_too_long' };
    if (hasControlChars(raw)) return { ok: false, reason: 'text_control' };
  }

  // Mensaje: control / demasiado largo / exceso de enlaces -> basura.
  if (typeof input.message === 'string') {
    if (input.message.length > maxMsg) return { ok: false, reason: 'message_too_long' };
    if (hasControlChars(input.message)) return { ok: false, reason: 'message_control' };
    if (countLinks(input.message) > maxLinks) return { ok: false, reason: 'link_flood' };
  }

  return { ok: true };
}
