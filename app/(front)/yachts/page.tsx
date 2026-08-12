import YachtsCatalogClient from './YachtsCatalogClient';
import { getAllYachts } from '../../lib/api/yachts';

// Server component: trae TODA la flota en el servidor (SEO) y el cliente
// pagina de 12 en 12. La pagina actual va en la URL (?page=N).
export default async function YachtsPage() {
  const items = await getAllYachts();
  return (
    <YachtsCatalogClient
      initialItems={items}
      initialCount={items.length}
    />
  );
}
