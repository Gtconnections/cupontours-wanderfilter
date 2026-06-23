/**
 * Estructura de la carga útil exacta para la solicitud de aliados
 */
export interface AlliancePayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message: string;
}

/**
 * Estructura de la respuesta del servidor de Next.js
 */
export interface AllianceResponse {
  success: boolean;
  message?: string;
}