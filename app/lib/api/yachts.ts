import { clientConfig } from "../config";
const API_BASE_URL = clientConfig.api.baseUrl

export interface YachtCatalogItem {
  id: number;
  title: string;
  specs: string;
  price: string;
  rating: string;
  img: string;
}

export async function getYachts(): Promise<YachtCatalogItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/yachts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch yachts");
    const data = await response.json();
    const results = data.results || data.data || data || [];

    return results.map((item: any): YachtCatalogItem => {
      const id = item.id || Math.random();
      
      // Usamos la clave 'name' directo del JSON (Ej: "103' Azimut + Slide")
      const title = item.name || "Luxury Yacht";
      
      // Combinamos la longitud en pies y la capacidad máxima de pasajeros
      const length = item.length ? `${item.length}ft` : "60ft";
      const capacity = item.capacity ? `${item.capacity} Guests` : "12 Guests";
      const specs = `${length} • ${capacity}`;
      
      // Mapeo del precio por día completo
      const price = item.price_full_day ? `$${Math.round(parseFloat(item.price_full_day))} / day` : "$9,500 / day";
      
      // Enlace directo a la imagen principal del bucket de DigitalOcean
      const img = item.principal_image || "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=80";

      return {
        id,
        title,
        specs,
        price,
        rating: "5.0",
        img,
      };
    });
  } catch (error) {
    console.error("Error fetching yachts:", error);
    return [];
  }
}