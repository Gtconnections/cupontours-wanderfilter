import CarsCatalogClient from './CarsCatalogClient';
import { getAllCars } from '../../lib/api/cars';

// Server component: trae TODA la flota en el servidor (SEO) y el cliente
// pagina de 12 en 12. La pagina actual va en la URL (?page=N).
export default async function CarsPage() {
  const items = await getAllCars();
  return (
    <CarsCatalogClient
      initialItems={items}
      initialCount={items.length}
    />
  );
}
