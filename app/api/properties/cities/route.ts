// app/api/properties/cities/route.ts
import { NextResponse } from 'next/server';
import { getBackendListings } from '@/app/lib/services/backend-properties';

export async function GET() {
  try {
    const resp = await getBackendListings({ limit: 1000, offset: 0 });

    const cities = new Set<string>();
    const countries = new Set<string>();
    resp.result.forEach(l => {
      if (l.city) cities.add(l.city);
      if (l.country) countries.add(l.country);
    });

    return NextResponse.json(
      {
        success: true,
        data: {
          cities: Array.from(cities).sort(),
          countries: Array.from(countries).sort(),
        },
      },
      { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to fetch cities' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
