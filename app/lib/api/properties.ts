const BACKEND_URL = "https://www.cupontours.com";

export interface PropertyCatalogItem {
  id: number;
  title: string;
  specs: string;
  price: string;
  rating: string;
  img: string;
}

export async function getProperties(): Promise<PropertyCatalogItem[]> {
  try {
    const response = await fetch(`${BACKEND_URL}/api/properties`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch properties");
    const data = await response.json();

    // Adaptamos la estructura del JSON (data.results o data.data.result)
    const results = data.data?.result || data.data || data.results || data || [];

    return results.map((item: any): PropertyCatalogItem => {
      const id = item.id || item._id || Math.random();
      const title = item.title || item.name || "Exclusive Property";
      
      // Mapeo seguro para habitaciones y baños
      const beds = item.features?.bedrooms || item.bedroomsNumber || 0;
      const baths = item.features?.bathrooms || item.bathroomsNumber || 0;
      const specs = `${beds} bedrooms • ${baths} baths`;

      // Formateo del precio si viene como objeto estructurado o string directo
      let price = "";
      if (item.price && typeof item.price === "object") {
        const amount = item.price.amount || 0;
        const currency = item.price.currency || "$";
        price = `${currency}${amount} for 2 nights`;
      } else {
        price = item.price ? String(item.price) : "$250 / night";
      }

      const img = item.images?.[0] || item.listingImages?.[0]?.url || item.image || item.img || "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80";
      const rating = item.rating ? String(item.rating) : "5.0";

      return { id, title, specs, price, rating, img };
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return [];
  }
}