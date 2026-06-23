// app/api/properties/cities/route.ts
import { NextResponse } from 'next/server';
import { hostawayService } from '@/app/lib/services/hostaway';

export async function GET() {
  try {
    const citiesData = await hostawayService.getAvailableCities();

    return NextResponse.json(
      {
        success: true,
        data: citiesData,
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
        error: error instanceof Error ? error.message : 'Failed to fetch cities',
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