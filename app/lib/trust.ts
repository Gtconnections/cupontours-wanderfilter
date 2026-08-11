/**
 * Fuente ÚNICA de las métricas de confianza del sitio.
 * Regla: todas las páginas (home, about-us, invest-with-us, etc.) deben leer
 * de aquí. NO poner cifras sueltas en las páginas — si un número cambia, se
 * cambia SOLO en este archivo y queda consistente en todo el sitio.
 *
 * Valores reconciliados de forma conservadora a partir de los que ya estaban
 * publicados (se tomó el más bajo donde había contradicción, para no inflar).
 * Ajusta aquí con tus cifras reales cuando las confirmes.
 */
export const TRUST_STATS = {
  propertiesManaged: "100+",   // antes: 100+ (about) vs 500+ (invest) -> conservador
  guestSatisfaction: "95%",    // antes: 98% (about) vs 95% (invest)  -> conservador
  nightsBooked: "65K+",
  yearsExperience: "10+",
  revenueGenerated: "$2M+",
};
