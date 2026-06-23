/**
 * Estructura de la carga útil exacta para la solicitud de inversión e ingresos
 */
export interface InvestPayload {
  interestType: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message: string;
}

/**
 * Estructura de la respuesta del servidor de Next.js
 */
export interface InvestResponse {
  success: boolean;
  message?: string;
}