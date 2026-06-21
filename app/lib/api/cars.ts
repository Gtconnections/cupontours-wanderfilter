import { clientConfig } from "../config";
const API_BASE_URL = clientConfig.api.baseUrl

export interface CarCatalogItem {
  id: number;
  title: string;
  specs: string;
  price: string;
  rating: string;
  img: string;
}

export async function getCars(): Promise<CarCatalogItem[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/landing/cars/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch cars");
    const data = await response.json();
    const results = data.results || data.data || data || [];

    return results.map((item: any): CarCatalogItem => {
      const id = item.id || Math.random();
      
      // Combinamos la marca y el modelo (Ej: "Chevrolet Tahoe SRT")
      const title = item.brand && item.model ? `${item.brand} ${item.model}` : "Premium Car";
      
      // Especificación limpia usando el año real del vehículo
      const specs = item.year ? `Model ${item.year} • Premium Fleet` : "Automatic • Luxury SUV";
      
      // Mapeo del precio real de renta
      const price = item.rent_price ? `$${Math.round(parseFloat(item.rent_price))} / day` : "$199 / day";
      
      // Enlace directo a la imagen principal del bucket
      const img = item.principal_image || "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80";

      return {
        id,
        title,
        specs,
        price,
        rating: "5.0", // Fallback estático si el carro no maneja rating en BD
        img,
      };
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    return [];
  }
}