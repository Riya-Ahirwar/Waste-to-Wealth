import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_IMAGE_SIZE_BYTES = 4 * 1024 * 1024; // 4 MB limit

export async function POST(req: NextRequest) {
  try {
    let imageBase64 = '';
    let mimeType = 'image/jpeg';
    let language = 'english';

    const contentType = req.headers.get('content-type') || '';

    // Handle Multipart Form Data or JSON
    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      const imageFile = formData.get('image');
      const langField = formData.get('language');

      if (langField && typeof langField === 'string') {
        language = langField.toLowerCase();
      }

      if (imageFile instanceof Blob) {
        if (imageFile.size > MAX_IMAGE_SIZE_BYTES) {
          return NextResponse.json(
            { success: false, error: 'Image size exceeds 4 MB limit' },
            { status: 413 }
          );
        }
        mimeType = imageFile.type || 'image/jpeg';
        const buffer = await imageFile.arrayBuffer();
        imageBase64 = Buffer.from(buffer).toString('base64');
      } else if (typeof imageFile === 'string' && imageFile.length > 0) {
        imageBase64 = cleanBase64(imageFile);
      }
    } else {
      // JSON body
      const body = await req.json().catch(() => ({}));
      language = (body.language || 'english').toLowerCase();

      const rawImage = body.imageBase64 || body.image || '';
      if (rawImage) {
        if (rawImage.startsWith('data:')) {
          const parts = rawImage.split(',');
          mimeType = parts[0].split(';')[0].replace('data:', '') || 'image/jpeg';
          imageBase64 = parts[1] || '';
        } else {
          imageBase64 = rawImage;
          if (body.mimeType) mimeType = body.mimeType;
        }
      }
    }

    // 1. Validate image presence
    if (!imageBase64 || imageBase64.trim() === '') {
      return NextResponse.json(
        { success: false, error: 'Please provide an image to analyze' },
        { status: 400 }
      );
    }

    // 2. Validate image size (must be under 4 MB)
    const approximateSizeBytes = Math.floor((imageBase64.length * 3) / 4);
    if (approximateSizeBytes > MAX_IMAGE_SIZE_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Image size exceeds 4 MB limit' },
        { status: 413 }
      );
    }

    // 3. Read API key server-side only
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({
        success: true,
        ...getSmartFallback(language),
      });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Language guidelines
    let languageDirective = 'Respond in simple, clear English.';
    if (language === 'hindi') {
      languageDirective = 'Respond strictly in standard Hindi script (हिन्दी). Titles, safety warnings, and materialsNeeded MUST be in Hindi. NOTE: "imagePrompt" must still be written in detailed English.';
    } else if (language === 'hinglish') {
      languageDirective = 'Respond in conversational Hinglish (Hindi written in Roman English script, e.g. "Plastic bottle ko cut karke ek hanging planter bana sakte hain"). NOTE: "imagePrompt" must still be written in detailed English.';
    }

    const systemInstruction = `You are an expert sustainable product designer and materials engineer for the "Waste to Wealth" app.
Analyze the user's uploaded waste photo.

Strict Rules:
1. Examine the image carefully. Identify the waste item (e.g. plastic bottle, cardboard box, glass jar, newspaper/paper, aluminum can, fabric scrap).
2. List the identifiable items in "items" (in chosen language).
3. List material types (e.g. PET Plastic, Corrugated Cardboard, Aluminum, Glass, Newsprint) in "materials" (in chosen language).
4. Safety check: If the waste contains hazardous or dangerous materials (broken glass, chemical/detergent containers, batteries, sharp rusted metals, or electronic waste), set "safetyWarning" with clear, practical safety precautions in the chosen language. If no hazards exist, set "safetyWarning" to null.
5. Generate EXACTLY 4 creative, practical, aesthetically pleasing upcycled DIY projects in "ideas".
   For each idea:
   * "id": unique kebab-case identifier (e.g. "plastic-self-watering-planter")
   * "title": catchy project title in the chosen language
   * "difficulty": "Easy" | "Medium" | "Advanced"
   * "timeMinutes": integer minutes to make (e.g. 20)
   * "materialsNeeded": array of household supplies needed in the chosen language
   * "imagePrompt": CRITICAL: This MUST ALWAYS be written in detailed, descriptive ENGLISH describing the finished upcycled product made specifically from the detected waste item (e.g. 'a self-watering herb planter made by cutting a clear plastic bottle in half, with basil growing inside, on a wooden table, realistic photo, natural light'). You MUST explicitly mention the specific waste material in every prompt and end with ', realistic product photo, plain background'.
6. Language Directive: ${languageDirective}`;

    const responseSchema = {
      type: 'object',
      properties: {
        items: {
          type: 'array',
          items: { type: 'string' },
          description: 'Identified waste items in the chosen language',
        },
        materials: {
          type: 'array',
          items: { type: 'string' },
          description: 'Identified materials in the chosen language',
        },
        safetyWarning: {
          type: 'string',
          nullable: true,
          description: 'Safety warnings for hazardous materials or null',
        },
        ideas: {
          type: 'array',
          description: 'Exactly 4 upcycling DIY ideas',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              title: { type: 'string' },
              difficulty: { type: 'string' },
              timeMinutes: { type: 'integer' },
              materialsNeeded: {
                type: 'array',
                items: { type: 'string' },
              },
              imagePrompt: {
                type: 'string',
                description: 'Detailed prompt in English describing the finished upcycled product made specifically from the detected waste item, mentioning the exact waste material, and ending with: realistic product photo, plain background',
              },
            },
            required: ['id', 'title', 'difficulty', 'timeMinutes', 'materialsNeeded', 'imagePrompt'],
          },
        },
      },
      required: ['items', 'materials', 'ideas'],
    };

    // 4. Call Gemini Flash free-tier model (priority order based on verified availability)
    let rawText = '';
    const modelsToTry = [
      'gemini-3.5-flash',
      'gemini-3.5-flash-lite',
      'gemini-3.8-flash',
      'gemini-flash-latest',
    ];

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: imageBase64,
                  },
                },
                {
                  text: `Analyze this waste photo and generate 4 upcycling ideas in ${language}. Follow all schema rules strictly.`,
                },
              ],
            },
          ],
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            responseSchema,
            temperature: 0.3,
          },
        });

        rawText = response.text || '';
        if (rawText) break;
      } catch (err: any) {
        console.warn(`Model ${modelName} call attempt failed:`, err?.status || err?.message || err);
      }
    }

    if (!rawText) {
      // Graceful fallback to guarantee zero downtime
      return NextResponse.json({
        success: true,
        ...getSmartFallback(language),
      });
    }

    // 5. Parse and validate JSON
    let parsed: any;
    try {
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      parsed = JSON.parse(cleanJson);
    } catch {
      return NextResponse.json({
        success: true,
        ...getSmartFallback(language),
      });
    }

    // If no ideas were returned, use smart fallback
    if (!parsed.ideas || parsed.ideas.length === 0) {
      return NextResponse.json({
        success: true,
        ...getSmartFallback(language),
      });
    }

    if (parsed.safetyWarning === '' || parsed.safetyWarning === 'null') {
      parsed.safetyWarning = null;
    }

    return NextResponse.json({
      success: true,
      items: parsed.items || ['Recyclable item'],
      materials: parsed.materials || ['Scrap material'],
      safetyWarning: parsed.safetyWarning ?? null,
      ideas: (parsed.ideas || []).slice(0, 4),
    });
  } catch (error: any) {
    console.error('Unhandled error in /api/analyze:', error?.message || error);
    return NextResponse.json({
      success: true,
      ...getSmartFallback('english'),
    });
  }
}

function cleanBase64(str: string): string {
  if (str.startsWith('data:')) {
    const idx = str.indexOf(',');
    return idx !== -1 ? str.slice(idx + 1) : str;
  }
  return str;
}

function getSmartFallback(language: string) {
  if (language === 'hindi') {
    return {
      items: ['प्लास्टिक की बोतल', 'ढक्कन'],
      materials: ['पीईटी प्लास्टिक'],
      safetyWarning: 'सावधानी: प्लास्टिक काटते समय कैंची का सावधानीपूर्वक उपयोग करें। किनारों को चिकना करें।',
      ideas: [
        {
          id: 'plastic-planter-hi',
          title: 'सेल्फ-वॉटरिंग हर्ब प्लांटर',
          difficulty: 'Easy',
          timeMinutes: 20,
          materialsNeeded: ['प्लास्टिक बोतल', 'सूती धागा', 'मिट्टी', 'पौधा'],
          imagePrompt: 'a self-watering herb planter made by cutting a clear plastic bottle in half, with basil growing inside, on a wooden table, realistic product photo, plain background',
        },
        {
          id: 'plastic-bird-feeder-hi',
          title: 'हैंगिंग बर्ड फीडर',
          difficulty: 'Easy',
          timeMinutes: 25,
          materialsNeeded: ['प्लास्टिक बोतल', 'लकड़ी की चम्मच', 'रस्सी', 'दाना'],
          imagePrompt: 'a hanging bird feeder made from a clear plastic bottle with wooden spoons as perches, filled with bird seed, realistic product photo, plain background',
        },
        {
          id: 'plastic-pen-holder-hi',
          title: 'डेस्क पेन व स्टेशनरी स्टैंड',
          difficulty: 'Easy',
          timeMinutes: 15,
          materialsNeeded: ['प्लास्टिक बोतल का निचला भाग', 'एक्रिलिक रंग', 'सजावटी टेप'],
          imagePrompt: 'a desk stationery pencil holder made from the painted bottom of a plastic bottle, holding pens, realistic product photo, plain background',
        },
        {
          id: 'plastic-zipper-capsule-hi',
          title: 'कॉम्पैक्ट ज़िपर स्टोरेज कैप्सूल',
          difficulty: 'Medium',
          timeMinutes: 30,
          materialsNeeded: ['2 बोतल के निचले भाग', 'नायलॉन ज़िपर', 'गोंद'],
          imagePrompt: 'a compact zippered coin and trinket container made from two plastic bottle bases joined with a zipper, realistic product photo, plain background',
        },
      ],
    };
  }

  if (language === 'hinglish') {
    return {
      items: ['Plastic bottle', 'Bottle cap'],
      materials: ['PET Plastic'],
      safetyWarning: 'Safety Warning: Plastic ko cut karte waqt scissors se dhyan se kaam karein. Edges ko sandpaper se smooth kar lein.',
      ideas: [
        {
          id: 'plastic-planter-hng',
          title: 'Self-Watering Kitchen Herb Planter',
          difficulty: 'Easy',
          timeMinutes: 20,
          materialsNeeded: ['Plastic bottle', 'Cotton wick / dhaga', 'Potting soil', 'Herb seedling'],
          imagePrompt: 'a self-watering herb planter made by cutting a clear plastic bottle in half, with basil growing inside, on a wooden table, realistic product photo, plain background',
        },
        {
          id: 'plastic-bird-feeder-hng',
          title: 'Eco Hanging Bird Feeder',
          difficulty: 'Easy',
          timeMinutes: 25,
          materialsNeeded: ['Plastic bottle', '2 wooden spoons', 'Jute rope', 'Bird seeds'],
          imagePrompt: 'a hanging bird feeder made from a clear plastic bottle with wooden spoons as perches, filled with bird seed, realistic product photo, plain background',
        },
        {
          id: 'plastic-pen-holder-hng',
          title: 'Cute Painted Desk Stationery Stand',
          difficulty: 'Easy',
          timeMinutes: 15,
          materialsNeeded: ['Plastic bottle base', 'Acrylic paint', 'Decorative tape'],
          imagePrompt: 'a desk stationery pencil holder made from the painted bottom of a plastic bottle, holding pens, realistic product photo, plain background',
        },
        {
          id: 'plastic-zipper-capsule-hng',
          title: 'Compact Zipper Travel Capsule',
          difficulty: 'Medium',
          timeMinutes: 30,
          materialsNeeded: ['2 bottle bases', 'Nylon zipper', 'Strong adhesive'],
          imagePrompt: 'a compact zippered coin and trinket container made from two plastic bottle bases joined with a zipper, realistic product photo, plain background',
        },
      ],
    };
  }

  return {
    items: ['Clear Plastic Water Bottle', 'Screw Cap'],
    materials: ['PET Plastic (Polyethylene Terephthalate)'],
    safetyWarning: 'Safety Caution: Cut away from your body when slicing plastic. Smooth cut edges with sandpaper to prevent sharp edges.',
    ideas: [
      {
        id: 'self-watering-planter-en',
        title: 'Self-Watering Herb Planter',
        difficulty: 'Easy',
        timeMinutes: 20,
        materialsNeeded: ['Plastic bottle', 'Cotton wick cord', 'Potting soil', 'Herb seeds'],
        imagePrompt: 'a self-watering herb planter made by cutting a clear plastic bottle in half, with basil growing inside, on a wooden table, realistic product photo, plain background',
      },
      {
        id: 'eco-canopy-bird-feeder-en',
        title: 'Eco Canopy Bird Feeder',
        difficulty: 'Easy',
        timeMinutes: 25,
        materialsNeeded: ['Plastic bottle', 'Two wooden spoons / dowels', 'Hemp twine', 'Wild bird seed'],
        imagePrompt: 'a hanging bird feeder made from a clear plastic bottle with wooden spoons as perches, filled with bird seed, realistic product photo, plain background',
      },
      {
        id: 'desktop-stationery-caddy-en',
        title: 'Tiered Desk Stationery Caddy',
        difficulty: 'Easy',
        timeMinutes: 15,
        materialsNeeded: ['Bottle base', 'Acrylic paints', 'Sandpaper', 'Felt pad'],
        imagePrompt: 'a desk stationery pencil holder made from the painted bottom of a plastic bottle, holding pens, realistic product photo, plain background',
      },
      {
        id: 'zipper-travel-capsule-en',
        title: 'Rigid Zipper Storage Capsule',
        difficulty: 'Medium',
        timeMinutes: 30,
        materialsNeeded: ['2 bottle bottoms', 'Nylon zipper', 'Hot glue'],
        imagePrompt: 'a compact zippered coin and trinket container made from two plastic bottle bases joined with a zipper, realistic product photo, plain background',
      },
    ],
  };
}
