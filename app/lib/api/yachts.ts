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
    const response = await fetch(`${API_BASE_URL}/landing/yachts/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error("Failed to fetch yachts");
    const data = await response.json();

    const results = data.results || data.data || data || [];

    return results.map((item: any): YachtCatalogItem => {
      const id = item.id || item._id || Math.random();
      const title = item.title || item.name || "Luxury Yacht";
      const specs = item.specs || `${item.guests || 12} Guests • ${item.cabins || 3} Cabins`;

      let price = "";
      if (item.price && typeof item.price === "object") {
        const amount = item.price.amount || 0;
        const currency = item.price.currency || "$";
        price = `${currency}${amount} / day`;
      } else {
        price = item.price ? String(item.price) : "$1,400 / day";
      }

      const img = item.image || item.img || item.images?.[0] || "https://images.unsplash.com/photo-1567899378494-47b22a2ae96a?auto=format&fit=crop&w=600&q=80";
      const rating = item.rating ? String(item.rating) : "5.0";

      return { id, title, specs, price, rating, img };
    });
  } catch (error) {
    console.error("Error fetching yachts:", error);
    return [];
  }
}