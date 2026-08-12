import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getPropertiesPage, searchProperties, PropertyCardData } from '../../lib/api/properties';
import PropertiesCatalogClient from './PropertiesCatalogClient';

const PAGE_SIZE = 8;

type SP = { [key: string]: string | string[] | undefined };

function firstStr(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v ?? undefined;
}

// Metadata dinámico por ciudad → cada /properties?city=X tiene su propio título/descr
export async function generateMetadata(
  { searchParams }: { searchParams: Promise<SP> }
): Promise<Metadata> {
  const sp = await searchParams;
  const city = firstStr(sp.city);
  const title = city
    ? `Properties in ${city} | Cupontours`
    : 'Luxury Vacation Rentals in Miami & Hallandale | Cupontours';
  const description = city
    ? `Explore luxury vacation rentals in ${city}. Book exclusive, professionally managed properties with Cupontours.`
    : 'Premium villas and apartments managed by Cupontours in Miami, Hallandale and Orlando. Real-time availability.';
  const canonical = city ? `/properties?city=${encodeURIComponent(city)}` : '/properties';
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical, type: 'website' },
  };
}

export default async function PropertiesPage(
  { searchParams }: { searchParams: Promise<SP> }
) {
  const sp = await searchParams;
  const city = firstStr(sp.city);
  const checkIn = firstStr(sp.checkIn);
  const checkOut = firstStr(sp.checkOut);
  const guests = firstStr(sp.guests);

  // Traemos los datos EN EL SERVIDOR para que el HTML salga con las tarjetas
  // reales (Google ya no ve "Loading..."). Los filtros/sort/paginación siguen
  // en cliente dentro de PropertiesCatalogClient.
  let initialItems: PropertyCardData[] = [];
  let initialCount = 0;
  let initialHasSearched = false;

  try {
    if (city || checkIn || checkOut || guests) {
      const data = await searchProperties({
        city,
        checkIn,
        checkOut,
        guests: guests ? parseInt(guests, 10) : undefined,
        limit: 50,
      });
      initialItems = data;
      initialCount = data.length;
      initialHasSearched = true;
    } else {
      const { items, count } = await getPropertiesPage({ page: 1, pageSize: PAGE_SIZE });
      initialItems = items;
      initialCount = count;
      initialHasSearched = false;
    }
  } catch {
    // Si el backend falla durante el SSR, entregamos vacío y el sitio sigue vivo.
    initialItems = [];
    initialCount = 0;
    initialHasSearched = Boolean(city || checkIn || checkOut || guests);
  }

  return (
    <Suspense fallback={
      <div className="w-full text-center py-20 text-sm text-gray-400">Loading catalog horizon...</div>
    }>
      <PropertiesCatalogClient
        initialItems={initialItems}
        initialCount={initialCount}
        initialHasSearched={initialHasSearched}
      />
    </Suspense>
  );
}
