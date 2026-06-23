/**
 * Estructura de la carga útil exacta para la solicitud de reserva de autos
 */
export interface CarBookingPayload {
  carId: string;
  carTitle: string;
  pickUpDate: string;
  returnDate: string;
  totalDays: number;
  client: {
    fullName: string;
    email: string;
    phoneNumber: string;
    specialRequests: string;
  };
}

/**
 * Estructura de la respuesta del servidor de Next.js
 */
export interface CarBookingResponse {
  success: boolean;
  message?: string;
}