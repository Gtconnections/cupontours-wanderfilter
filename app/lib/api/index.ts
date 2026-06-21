// CORREGIDO: Añadido 'www.' para hacer match exacto con el origen del backend viejo
const BACKEND_URL = "https://www.cupontours.com"; 

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
    let endpoint = "";
    if (type === 'home') endpoint = "/api/properties";
    else if (type === 'car') endpoint = "/api/cars";
    else if (type === 'yacht') endpoint = "/api/yachts";

    // Nota: Eliminamos los query params innecesarios si vas a manejar límites fijos en tu UI
    const response = await fetch(`${BACKEND_URL}${endpoint}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      }
    });

    if (!response.ok) throw new Error(`Failed to fetch ${type}`);
    const data = await response.json();

    const results = data.data?.result || data.data || data.results || data || [];
    
    return results.map((item: any): CatalogItem => {
      const id = item.id || item._id || Math.random();
      const title = item.title || item.name || "Exclusive Asset";
      
      let specs = "";
      if (type === 'home') {
        const beds = item.features?.bedrooms || item.bedroomsNumber || 0;
        const baths = item.features?.bathrooms || item.bathroomsNumber || 0;
        specs = `${beds} bedrooms • ${baths} baths`;
      } else if (type === 'car') {
        specs = item.specs || `${item.seats || 5} Seats • Premium Performance`;
      } else if (type === 'yacht') {
        specs = item.specs || `${item.guests || 12} Guests • ${item.cabins || 3} Cabins`;
      }

      let price = "";
      if (item.price && typeof item.price === 'object') {
        const amount = item.price.amount || 0;
        const currency = item.price.currency || '$';
        price = type === 'home' ? `${currency}${amount} for 2 nights` : `${currency}${amount} / day`;
      } else {
        price = item.price ? String(item.price) : "$250 / day";
      }

      const img = item.images?.[0] || item.listingImages?.[0]?.url || item.image || item.img || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80";
      const rating = item.rating ? String(item.rating) : "5.0";

      return { id, title, specs, price, rating, img };
    });

  } catch (error) {
    console.error(`Error fetching ${type}:`, error);
    return [];
  }
}