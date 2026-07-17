import { LoginPayload, AuthResponse } from "./types/auth"; // Ajusta tus tipos si los tienes, si no puedes usar 'any' o tiparlo inline
import { ContactPayload, ContactResponse } from "./types/contact";
import { AlliancePayload, AllianceResponse } from "./types/alliance";
import { InvestPayload, InvestResponse } from "./types/invest";
import { JetQuotePayload, JetQuoteResponse } from "./types/aviation";
import { CarBookingPayload, CarBookingResponse } from "./types/cars";
import { YachtBookingPayload, YachtBookingResponse } from "./types/yachts";

import { clientConfig } from "./config";
const API_BASE_URL = clientConfig.api.baseUrl
const AUX_URL = 'https://cupontours.com/api'
/**
 * Realiza la petición de inicio de sesión al servidor
 * @param payload Objeto con las credenciales del usuario (username y password)
 * @returns Promesa con la respuesta del servidor o lanza un error
 */
export async function loginUser(payload: LoginPayload): Promise<AuthResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/authenticate/login/`, { // Ajusta el endpoint real de tu API aquí
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong during authentication.");
    }

    return data;
  } catch (error) {
    console.error("Fetch API login error:", error);
    throw error;
  }
}

export async function sendContactRequest(payload: ContactPayload): Promise<ContactResponse> {
  try {
    // Apunta al Route Handler local creado en app/api/contact/route.ts
    const response = await fetch("/api/contact", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "An error occurred while dispatching the message locally.");
    }

    return data;
  } catch (error) {
    console.error("Local Next.js fetch contact API error:", error);
    throw error;
  }
}

export async function sendAllianceRequest(payload: AlliancePayload): Promise<AllianceResponse> {
  try {
    const response = await fetch("/api/alliance", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "An error occurred while dispatching your alliance request.");
    }

    return data;
  } catch (error) {
    console.error("Local Next.js fetch alliance API error:", error);
    throw error;
  }
}

export async function sendInvestRequest(payload: InvestPayload): Promise<InvestResponse> {
  try {
    const response = await fetch("/api/invest", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "An error occurred while dispatching your property investment request.");
    }

    return data;
  } catch (error) {
    console.error("Local Next.js fetch invest API error:", error);
    throw error;
  }
}

export async function sendAboutContactRequest(payload: AlliancePayload): Promise<AllianceResponse> {
  try {
    const response = await fetch("/api/alliance", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "An error occurred while dispatching your alliance request.");
    }

    return data;
  } catch (error) {
    console.error("Local Next.js fetch alliance API error:", error);
    throw error;
  }
}

export async function sendJetQuoteRequest(payload: JetQuotePayload): Promise<JetQuoteResponse> {
  try {
    const response = await fetch("/api/jets", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "An error occurred while dispatching your aviation booking request.");
    }

    return data;
  } catch (error) {
    console.error("Local Next.js fetch jets API error:", error);
    throw error;
  }
}

export async function sendCarBookingRequest(payload: CarBookingPayload): Promise<CarBookingResponse> {
  try {
    const response = await fetch("/api/booking/cars", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "An error occurred while dispatching your vehicle booking request.");
    }

    return data;
  } catch (error) {
    console.error("Local Next.js fetch car booking API error:", error);
    throw error;
  }
}

export async function sendYachtBookingRequest(payload: YachtBookingPayload): Promise<YachtBookingResponse> {
  try {
    const response = await fetch("/api/booking/yachts", { 
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "An error occurred while dispatching your yacht charter request.");
    }

    return data;
  } catch (error) {
    console.error("Local Next.js fetch yacht booking API error:", error);
    throw error;
  }
}