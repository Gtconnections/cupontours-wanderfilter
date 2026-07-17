import { clientConfig } from "../config";
import { RawApiItem } from "../types/raw";
const API_BASE_URL = clientConfig.api.baseUrl

export interface YachtCatalogItem {
  id: number;
  title: string;
  specs: string;
  price: string;
  rating: string;
  img: string;
}

export interface YachtDetail {
  id: number;
  title: string;
  img: string;
  description: string;
  length: string;
  capacity: string;
  staterooms: string;
  bathrooms: string;
  price_full_day: string;
  price_half_day: string | null;
  gallery: string[];
  amenities: {
    certified_captain: boolean;
    fuel: boolean;
    jacuzzi: boolean;
    slide: boolean;
    jet_sky: boolean;
    water_toys: boolean;
  };
}

export async function getYachts(): Promise<YachtCatalogItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/landing/yachts/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch yachts");
    const data = await response.json();
    const results = data.results || data.data || data || [];

    return results.map((item: RawApiItem): YachtCatalogItem => {
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

export async function getYachtById(id: string): Promise<YachtDetail> {
  try {
    const response = await fetch(`${API_BASE_URL}/landing/yachts/${id}/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`Failed to fetch yacht with id ${id}`);
    const item = await response.json();

    // Estructuramos el título y las especificaciones técnicas nativas
    const title = item.name || "Luxury Yacht";
    const img = item.principal_image || "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=80";

    // EXCEPCIÓN CORREGIDA: Normalizamos la galería limpiando cada image_url de la BD
    const gallery = Array.isArray(item.gallery)
      ? item.gallery.map((g: RawApiItem) => {
          if (typeof g === 'string') return g.trim();
          return g.image_url || g.image || g.url || g.file || img;
        })
      : [];

    return {
      id: item.id,
      title,
      img,
      description: item.description || "Experience the ultimate luxury on Miami's pristine waters aboard this magnificent charter vessel. Crafted for comfort and elegance, find the perfect setting for an unforgettable maritime getaway.",
      length: item.length ? `${item.length}ft` : "105ft",
      capacity: item.capacity ? `${item.capacity} guests` : "13 guests",
      staterooms: item.staterooms ? `${item.staterooms} Cabins` : "4 Cabins",
      bathrooms: item.bathrooms ? `${item.bathrooms} Baths` : "4 Baths",
      price_full_day: item.price_full_day ? `$${Math.round(parseFloat(item.price_full_day))}` : "$11,500",
      price_half_day: item.price_half_day && parseFloat(item.price_half_day) > 0 ? `$${Math.round(parseFloat(item.price_half_day))}` : null,
      gallery: gallery.length > 0 ? gallery : [img],
      amenities: {
        certified_captain: item.certified_captain ?? true,
        fuel: item.fuel ?? true,
        jacuzzi: item.jacuzzi ?? false,
        slide: item.slide ?? false,
        jet_sky: item.jet_sky ?? false,
        water_toys: item.water_toys ?? false,
      }
    };
  } catch (error) {
    console.error(`Error fetching yacht id ${id}:`, error);
    throw error;
  }
}