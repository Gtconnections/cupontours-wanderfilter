/**
 * Estructura de la carga útil exacta para la solicitud de cotización de Jets
 */
export interface JetQuotePayload {
  flightCriteria: {
    departureCity: string;
    destinationCity: string;
    passengers: string;
    tripType: string;
    departureTime: string;
    departureDate: string;
    returnDate: string;
  };
  contact: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    instagram: string;
  };
}

/**
 * Estructura de la respuesta del servidor de Next.js
 */
export interface JetQuoteResponse {
  success: boolean;
  message?: string;
}