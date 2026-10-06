import { NextRequest, NextResponse } from 'next/server';
import { analyzeWasteImage } from '@/lib/ai-service';

export const runtime = 'nodejs';
// Allow 60 seconds max duration for image analysis & generation
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType, descriptionHint } = body;

    const result = await analyzeWasteImage({
      imageBase64,
      mimeType: mimeType || 'image/jpeg',
      descriptionHint: descriptionHint || '',
    });

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Error in /api/analyze-waste route:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to analyze waste image. Please try again.',
      },
      { status: 500 }
    );
  }
}
