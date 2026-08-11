import CarsCatalogClient from './CarsCatalogClient';
import { getCarsPage } from '../../lib/api/cars';

const FALLBACK_PAGE_SIZE = 12;

// Server component: trae la primera página en el servidor para que el HTML
// salga con la flota real (SEO). Los filtros/paginación siguen en el cliente.
export default async function CarsPage() {
  const { items, count } = await getCarsPage(1);
  const initialPageSize =
    items.length > 0 && items.length < count ? items.length : FALLBACK_PAGE_SIZE;
  return (
    <CarsCatalogClient
      initialItems={items}
      initialCount={count}
      initialPageSize={initialPageSize}
    />
  );
}
