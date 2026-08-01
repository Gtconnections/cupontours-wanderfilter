// app/api/properties/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBackendListings } from '@/app/lib/services/backend-properties';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0;
    const city = searchParams.get('city') || undefined;
    const country = searchParams.get('country') || undefined;
    const guests = searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined;
    const bedrooms = searchParams.get('bedrooms') ? parseInt(searchParams.get('bedrooms')!) : undefined;
    const bathrooms = searchParams.get('bathrooms') ? parseInt(searchParams.get('bathrooms')!) : undefined;
    const minPrice = searchParams.get('minPrice') ? parseInt(searchParams.get('minPrice')!) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? parseInt(searchParams.get('maxPrice')!) : undefined;

    // Leer del backend (mirror de Hostaway + precio del pricing engine)
    const listingsResponse = await getBackendListings({ limit, offset, city, country });

    let filteredListings = listingsResponse.result;

    if (guests) {
      filteredListings = filteredListings.filter(l => (l.personCapacity ?? 0) >= guests);
    }
    if (bedrooms) {
      filteredListings = filteredListings.filter(l => (l.bedroomsNumber ?? 0) >= bedrooms);
    }
    if (bathrooms) {
      filteredListings = filteredListings.filter(l => (l.bathroomsNumber ?? 0) >= bathrooms);
    }
    if (minPrice) {
      filteredListings = filteredListings.filter(l => (l.price ?? 0) >= minPrice);
    }
    if (maxPrice) {
      filteredListings = filteredListings.filter(l => (l.price ?? 0) <= maxPrice);
    }

    return NextResponse.json(
      {
        success: true,
        data: filteredListings,
        pagination: {
          total: filteredListings.length,
          limit,
          offset,
        },
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch properties',
      },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
}
