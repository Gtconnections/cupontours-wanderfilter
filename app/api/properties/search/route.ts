// app/api/properties/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hostawayService } from '@/app/lib/services/hostaway';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    const params = {
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 50,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : 0,
      city: searchParams.get('city') || undefined,
      country: searchParams.get('country') || undefined,
      guests: searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined,
      availabilityDateStart: searchParams.get('checkIn') || undefined,
      availabilityDateEnd: searchParams.get('checkOut') || undefined,
      sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' || undefined,
    };

    const listingsResponse = await hostawayService.searchListings(params);

    return NextResponse.json(
      {
        success: true,
        data: {
          status: 'success',
          result: listingsResponse.result,
          count: listingsResponse.count,
          limit: listingsResponse.limit,
          offset: listingsResponse.offset,
        },
        searchParams: params,
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
      },
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