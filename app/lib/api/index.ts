const BACKEND_URL = "https://cupontours.com";

// Reutilizamos la interfaz visual para asegurar compatibilidad de datos
export interface CatalogItem {
  id: number;
  title: string;
  specs: string;
  price: string;
  rating: string;
  img: string;
}

export async function getCatalogItems(type: 'home' | 'car' | 'yacht'): Promise<CatalogItem[]> {
  try {
    // Definimos el endpoint correspondiente según el tipo
    let endpoint = "";
    if (type === 'home') endpoint = "/api/properties";
    else if (type === 'car') endpoint = "/api/cars";
    else if (type === 'yacht') endpoint = "/api/yachts";

    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      next: { revalidate: 300 } // Opcional: Cachea los datos por 5 minutos en Next.js
    });

    if (!response.ok) throw new Error(`Failed to fetch ${type}`);
    const data = await response.json();

    // Adaptamos dinámicamente la estructura del JSON real del backend al diseño visual
    const results = data.results || data || [];
    
    return results.map((item: any): CatalogItem => {
      const id = item.id || item._id || Math.random();
      const title = item.title || item.name || "Exclusive Asset";
      
      // Mapeo de especificaciones según el tipo
      let specs = "";
      if (type === 'home') {
        const beds = item.bedrooms || item.features?.bedrooms || 0;
        const baths = item.bathrooms || item.features?.bathrooms || 0;
        specs = `${beds} bedrooms • ${baths} baths`;
      } else if (type === 'car') {
        specs = item.specs || `${item.seats || 5} Seats • Premium Performance`;
      } else if (type === 'yacht') {
        specs = item.specs || `${item.guests || 12} Guests • ${item.cabins || 3} Cabins`;
      }

      // Mapeo de precios estructurados u objetos
      let price = "";
      if (item.price && typeof item.price === 'object') {
        const amount = item.price.amount || 0;
        const currency = item.price.currency || '$';
        price = type === 'home' ? `${currency}${amount} for 2 nights` : `${currency}${amount} / day`;
      } else {
        price = item.price ? String(item.price) : "$250 / day";
      }

      // Imagen fallback por si el backend no tiene o viene vacía
      const img = item.images?.[0] || item.image || item.img || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80";
      const rating = item.rating ? String(item.rating) : "5.0";

      return { id, title, specs, price, rating, img };
    });

  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return []; // Fallback seguro de arreglo vacío si el backend falla
  }
}