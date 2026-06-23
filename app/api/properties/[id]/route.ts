// app/api/properties/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hostawayService } from '@/app/lib/services/hostaway';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const listing = await hostawayService.getListing(id);

    return NextResponse.json(
      {
        success: true,
        data: listing.result,
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch property';
    const status = errorMessage.includes('404') ? 404 : 500;

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status }
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