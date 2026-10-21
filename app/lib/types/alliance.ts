/**
 * Estructura de la carga útil exacta para la solicitud de aliados
 */
export interface AlliancePayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message: string;
  // Anti-spam (honeypot + temporizador); el usuario real no los ve.
  _hp_url?: string;
  _elapsed?: number;
}

/**
 * Estructura de la respuesta del servidor de Next.js
 */
export interface AllianceResponse {
  success: boolean;
  message?: string;
}