// app/api/properties/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getBackendListing } from '@/app/lib/services/backend-properties';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const listing = await getBackendListing(id);

    if (!listing.result) {
      return NextResponse.json(
        { success: false, error: 'Property not found' },
        { status: 404, headers: { 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return NextResponse.json(
      { success: true, data: listing.result },
      { status: 200, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch property';
    const status = errorMessage.includes('404') ? 404 : 500;

    return NextResponse.json(
      { success: false, error: errorMessage },
      { status, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}

export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await params;
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
