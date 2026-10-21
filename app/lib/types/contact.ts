/**
 * Estructura de la carga útil exacta para la solicitud de contacto (image_8e9c06.png)
 */
export interface ContactPayload {
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
 * Estructura de la respuesta del servidor para el envío de contacto
 */
export interface ContactResponse {
  success: boolean;
  message?: string;
}