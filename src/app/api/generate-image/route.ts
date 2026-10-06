import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * Server-side AI Image Generation.
 * Prioritizes free-tier image providers:
 * 1. Cloudflare Workers AI (10,000 free neurons/day - @cf/black-forest-labs/flux-1-schnell)
 * 2. Hugging Face Inference API (if HF_TOKEN is configured)
 * 3. Gemini Image Models (if billed GEMINI_API_KEY is configured)
 *
 * Never returns stock photos. If generation fails, returns structured error so
 * the UI displays the neutral placeholder with a Retry button.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const imagePrompt = (body.imagePrompt || body.prompt || '').trim();
    const ideaId = body.ideaId || '';

    if (!imagePrompt) {
      return NextResponse.json(
        { success: false, error: 'imagePrompt is required' },
        { status: 400 }
      );
    }

    // -------------------------------------------------------------
    // Provider 1: Cloudflare Workers AI (Free 10,000 neurons/day)
    // -------------------------------------------------------------
    const cfAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const cfApiToken = process.env.CLOUDFLARE_API_TOKEN;

    if (cfAccountId && cfApiToken) {
      const cfResult = await generateWithCloudflare(cfAccountId, cfApiToken, imagePrompt, ideaId);
      if (cfResult.success) {
        return NextResponse.json(cfResult);
      }
      console.warn('Cloudflare Workers AI generation failed, checking other providers:', cfResult.error);
    }

    // -------------------------------------------------------------
    // Provider 2: Hugging Face Inference API (if HF_TOKEN is set)
    // -------------------------------------------------------------
    const hfToken = process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY;

    if (hfToken) {
      const hfResult = await generateWithHuggingFace(hfToken, imagePrompt, ideaId);
      if (hfResult.success) {
        return NextResponse.json(hfResult);
      }
      console.warn('Hugging Face generation failed, checking Gemini:', hfResult.error);
    }

    // -------------------------------------------------------------
    // Provider 3: Gemini Image Generation (if billed key is available)
    // -------------------------------------------------------------
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const geminiResult = await generateWithGemini(geminiKey, imagePrompt, ideaId);
      if (geminiResult.success) {
        return NextResponse.json(geminiResult);
      }

      // If Cloudflare/HF were not configured, return clear error with instructions
      if (!cfAccountId && !hfToken) {
        return NextResponse.json(
          {
            success: false,
            error: geminiResult.error,
            isQuotaExceeded: geminiResult.isQuotaExceeded,
            ideaId,
          },
          { status: geminiResult.isQuotaExceeded ? 429 : 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: 'No active AI image provider configured. Please set CLOUDFLARE_API_TOKEN or HF_TOKEN in .env.local',
        ideaId,
      },
      { status: 503 }
    );
  } catch (error: any) {
    console.error('Unhandled error in /api/generate-image:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Image generation failed',
      },
      { status: 500 }
    );
  }
}

/**
 * Generates an image using Cloudflare Workers AI FLUX.1-schnell model.
 */
async function generateWithCloudflare(
  accountId: string,
  apiToken: string,
  prompt: string,
  ideaId: string
) {
  const models = [
    '@cf/black-forest-labs/flux-1-schnell',
    '@cf/stabilityai/stable-diffusion-xl-base-1.0',
  ];

  for (const model of models) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/${model}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
        signal: AbortSignal.timeout(35000),
      });

      if (!response.ok) {
        const errText = await response.text().catch(() => '');
        console.warn(`Cloudflare ${model} returned ${response.status}:`, errText);
        continue;
      }

      const contentType = response.headers.get('content-type') || '';

      // JSON response containing base64 string (standard for flux-1-schnell on Workers AI)
      if (contentType.includes('application/json')) {
        const json = await response.json();
        const base64 = json.result?.image || json.image;
        if (base64) {
          return {
            success: true,
            imageUrl: `data:image/jpeg;base64,${base64}`,
            provider: 'cloudflare',
            model,
            ideaId,
          };
        }
      }

      // Raw binary response (standard for older models like SDXL)
      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer && arrayBuffer.byteLength > 0) {
        const base64 = Buffer.from(arrayBuffer).toString('base64');
        const mime = contentType.includes('image/png') ? 'image/png' : 'image/jpeg';
        return {
          success: true,
          imageUrl: `data:${mime};base64,${base64}`,
          provider: 'cloudflare',
          model,
          ideaId,
        };
      }
    } catch (err: any) {
      console.warn(`Error calling Cloudflare model ${model}:`, err.message);
    }
  }

  return { success: false, error: 'Cloudflare Workers AI generation failed' };
}

/**
 * Generates an image using Hugging Face Serverless Inference API.
 */
async function generateWithHuggingFace(token: string, prompt: string, ideaId: string) {
  const models = [
    'black-forest-labs/FLUX.1-schnell',
    'stabilityai/stable-diffusion-xl-base-1.0',
  ];

  for (const model of models) {
    try {
      const url = `https://api-inference.huggingface.co/models/${model}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ inputs: prompt }),
        signal: AbortSignal.timeout(35000),
      });

      if (!response.ok) {
        continue;
      }

      const buffer = await response.arrayBuffer();
      if (buffer && buffer.byteLength > 0) {
        const base64 = Buffer.from(buffer).toString('base64');
        return {
          success: true,
          imageUrl: `data:image/jpeg;base64,${base64}`,
          provider: 'huggingface',
          model,
          ideaId,
        };
      }
    } catch (err: any) {
      console.warn(`Hugging Face error on ${model}:`, err.message);
    }
  }

  return { success: false, error: 'Hugging Face generation failed' };
}

/**
 * Generates an image using Google Gen AI SDK (if billed account is available).
 */
async function generateWithGemini(apiKey: string, prompt: string, ideaId: string) {
  try {
    const ai = new GoogleGenAI({ apiKey });
    const imageModels = ['gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image', 'gemini-2.5-flash-image'];

    for (const modelName of imageModels) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: prompt,
        });

        const candidates = (response as any).candidates;
        if (candidates && candidates.length > 0) {
          const parts = candidates[0].content?.parts || [];
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              const mimeType = part.inlineData.mimeType || 'image/png';
              return {
                success: true,
                imageUrl: `data:${mimeType};base64,${part.inlineData.data}`,
                provider: 'gemini',
                model: modelName,
                ideaId,
              };
            }
          }
        }
      } catch (err: any) {
        const msg = (err?.message || '').toLowerCase();
        if (msg.includes('quota') || msg.includes('resource_exhausted') || err?.status === 429) {
          return {
            success: false,
            error: 'Gemini Free Tier API key has 0 quota for AI image generation (paid plan / billing required).',
            isQuotaExceeded: true,
          };
        }
      }
    }
    return { success: false, error: 'Gemini image generation returned no content' };
  } catch (err: any) {
    return { success: false, error: err.message || 'Gemini error' };
  }
}
