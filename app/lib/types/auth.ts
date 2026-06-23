/**
 * Estructura de los datos necesarios para enviar la solicitud de inicio de sesión
 */
export interface LoginPayload {
  username: string;
  password: string;
  // Puedes expandirlo en el futuro si necesitas más campos (ej. rememberMe: boolean;)
}

/**
 * Estructura del objeto de usuario que retorna el servidor al autenticarse
 */
export interface UserSession {
  id: string;
  name: string;
  lastName?: string;
  email: string;
  username: string;
  role: 'admin' | 'host' | 'guest' | 'ally'; // Configura los roles reales de tu app
  avatar?: string;
}

/**
 * Estructura de la respuesta exitosa del servidor tras un inicio de sesión
 */
export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string; // Token JWT o identificador de sesión
  user?: UserSession; // Información del usuario autenticado
}