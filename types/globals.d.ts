declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.scss" {
  const content: { [className: string]: string };
  export default content;
}

declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

// API Response Types
export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface GalleryImage {
  id: number;
  image_url: string;
}

// Car API Types
export interface Car {
  id: number;
  principal_image: string;
  description: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
  status: string;
  rent_price: string;
  miles: string;
  gallery: GalleryImage[];
}

export type CarApiResponse = ApiResponse<Car>

// Yacht API Types
export interface Yacht {
  id: number;
  name: string;
  principal_image: string | null;
  description: string | null;
  length: number;
  capacity: number;
  staterooms: number;
  bathrooms: number;
  price_full_day: string;
  price_half_day: string;
  certified_captain: boolean;
  fuel: boolean;
  water_toys: boolean;
  vip_host: boolean;
  crew: boolean;
  jet_sky: boolean;
  jacuzzi: boolean;
  slide: boolean;
  seabob: boolean;
  gallery: GalleryImage[];
}

export type YachtApiResponse = ApiResponse<Yacht>