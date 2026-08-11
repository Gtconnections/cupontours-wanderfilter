import YachtsCatalogClient from './YachtsCatalogClient';
import { getYachtsPage } from '../../lib/api/yachts';

const FALLBACK_PAGE_SIZE = 12;

// Server component: trae la primera página en el servidor para que el HTML
// salga con la flota real (SEO). Los filtros/paginación siguen en el cliente.
export default async function YachtsPage() {
  const { items, count } = await getYachtsPage(1);
  const initialPageSize =
    items.length > 0 && items.length < count ? items.length : FALLBACK_PAGE_SIZE;
  return (
    <YachtsCatalogClient
      initialItems={items}
      initialCount={count}
      initialPageSize={initialPageSize}
    />
  );
}
