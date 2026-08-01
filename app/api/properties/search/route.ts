// app/api/properties/search/route.ts
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

    const listingsResponse = await getBackendListings({ limit, offset, city, country });

    let result = listingsResponse.result;
    if (guests) {
      result = result.filter(l => (l.personCapacity ?? 0) >= guests);
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          status: 'success',
          result,
          count: result.length,
          limit: listingsResponse.limit,
          offset: listingsResponse.offset,
        },
        searchParams: { limit, offset, city, country, guests },
      },
      { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Search failed' },
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
