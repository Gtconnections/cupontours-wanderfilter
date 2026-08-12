import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getPropertiesPage, searchProperties, PropertyCardData } from '../../../lib/api/properties';
import PropertiesCatalogClient from '../../properties/PropertiesCatalogClient';

const PAGE_SIZE = 8;

type SP = { [key: string]: string | string[] | undefined };

function firstStr(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v ?? undefined;
}

export async function generateMetadata(
  { searchParams }: { searchParams: Promise<SP> }
): Promise<Metadata> {
  const sp = await searchParams;
  const city = firstStr(sp.city);
  const title = city
    ? `Propiedades en ${city} | Cupontours`
    : 'Propiedades vacacionales de lujo en Miami y Hallandale | Cupontours';
  const description = city
    ? `Explora alquileres vacacionales de lujo en ${city}. Reserva propiedades exclusivas gestionadas por Cupontours.`
    : 'Villas y apartamentos premium gestionados por Cupontours en Miami, Hallandale y Orlando. Disponibilidad en tiempo real.';
  const canonical = city ? `/es/properties?city=${encodeURIComponent(city)}` : '/es/properties';
  return {
    title,
    description,
    alternates: { canonical, languages: { en: '/properties', es: '/es/properties', 'x-default': '/properties' } },
    openGraph: { title, description, url: canonical, type: 'website' },
  };
}

export default async function PropertiesPageEs(
  { searchParams }: { searchParams: Promise<SP> }
) {
  const sp = await searchParams;
  const city = firstStr(sp.city);
  const checkIn = firstStr(sp.checkIn);
  const checkOut = firstStr(sp.checkOut);
  const guests = firstStr(sp.guests);

  let initialItems: PropertyCardData[] = [];
  let initialCount = 0;
  let initialHasSearched = false;

  try {
    if (city || checkIn || checkOut || guests) {
      const data = await searchProperties({
        city, checkIn, checkOut,
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
    initialItems = [];
    initialCount = 0;
    initialHasSearched = Boolean(city || checkIn || checkOut || guests);
  }

  return (
    <Suspense fallback={
      <div className="w-full text-center py-20 text-sm text-gray-400">Cargando catálogo...</div>
    }>
      <PropertiesCatalogClient
        initialItems={initialItems}
        initialCount={initialCount}
        initialHasSearched={initialHasSearched}
        locale="es"
      />
    </Suspense>
  );
}
