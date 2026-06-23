/**
 * Estructura de la carga útil exacta para la solicitud de contacto (image_8e9c06.png)
 */
export interface ContactPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  message: string;
}

/**
 * Estructura de la respuesta del servidor para el envío de contacto
 */
export interface ContactResponse {
  success: boolean;
  message?: string;
}