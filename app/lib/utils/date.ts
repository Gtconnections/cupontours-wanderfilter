/**
 * Fechas "solo día" (YYYY-MM-DD) sin corrimiento por zona horaria.
 *
 * `new Date("2026-10-31")` interpreta la fecha como medianoche UTC; al mostrarla
 * en una zona negativa (Miami, UTC-5) se corre al día anterior (30-oct). Esto
 * causaba que el fin de reserva, la fecha del P&L, etc. salieran un día menos.
 *
 * parseLocalDate la construye como fecha LOCAL, así el día mostrado es el mismo
 * que el guardado. Para cadenas con hora (datetime) cae al Date normal.
 */
export function parseLocalDate(dateStr: string | null | undefined): Date {
  if (!dateStr) return new Date(NaN);
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(dateStr).trim());
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  return new Date(dateStr);
}
