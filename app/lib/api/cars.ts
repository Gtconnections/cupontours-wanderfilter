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
      const id = item.id || item._id || Math.random();
      const title = item.title || item.name || "Premium Car";
      const specs = item.specs || `${item.seats || 5} Seats • Premium Performance`;

      let price = "";
      if (item.price && typeof item.price === "object") {
        const amount = item.price.amount || 0;
        const currency = item.price.currency || "$";
        price = `${currency}${amount} / day`;
      } else {
        price = item.price ? String(item.price) : "$250 / day";
      }

      const img = item.image || item.img || item.images?.[0] || "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&w=600&q=80";
      const rating = item.rating ? String(item.rating) : "5.0";

      return { id, title, specs, price, rating, img };
    });
  } catch (error) {
    console.error("Error fetching cars:", error);
    return [];
  }
}