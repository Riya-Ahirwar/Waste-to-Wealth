import { GoogleGenAI } from '@google/genai';
import { AnalyzeResponse, LanguageOption, IdeaItem } from '@/types/craft';

/**
 * Return language instruction prompt tailored to English, Hindi, or Hinglish.
 */
function getLanguageInstruction(language: LanguageOption): string {
  switch (language) {
    case 'hindi':
      return 'Respond entirely in clear, natural Hindi (हिन्दी). Titles, safety warnings, and materials should be in Hindi script.';
    case 'hinglish':
      return 'Respond in conversational Hinglish (Hindi written in Roman English script, e.g., "Plastic bottle ko cut karke ek beautiful self-watering planter bana sakte hain"). Keep it friendly and natural.';
    case 'english':
    default:
      return 'Respond in simple, clear English.';
  }
}

/**
 * Fallback demo analysis with exactly 4 ideas and safety warnings in the requested language.
 */
function getDemoAnalyzeResponse(language: LanguageOption, hint = 'plastic'): AnalyzeResponse {
  if (language === 'hindi') {
    return {
      items: ['प्लास्टिक की पानी की बोतल', 'बोतल का ढक्कन'],
      materials: ['पीईटी प्लास्टिक'],
      safetyWarning: 'सावधानी: प्लास्टिक काटते समय कटर या कैंची का उपयोग ध्यान से करें। किनारों को चिकना करें ताकि हाथ न कटे।',
      isDemo: true,
      ideas: [
        {
          id: 'plastic-planter-hi',
          title: 'सेल्फ-वॉटरिंग हर्ब प्लांटर',
          difficulty: 'Easy',
          timeMinutes: 20,
          materialsNeeded: ['प्लास्टिक की बोतल', 'सूती धागा/बत्ती', 'मिट्टी', 'पौधा'],
          imagePrompt: 'A self-watering green herb planter made from a recycled clear plastic bottle on a sunny balcony, photorealistic, 4k',
        },
        {
          id: 'plastic-bird-feeder-hi',
          title: 'इको हैंगिंग बर्ड फीडर',
          difficulty: 'Easy',
          timeMinutes: 25,
          materialsNeeded: ['प्लास्टिक की बोतल', 'लकड़ी की चम्मच/तीली', 'रस्सी', 'पक्षियों का दाना'],
          imagePrompt: 'A hanging bird feeder made from a clear plastic bottle with wooden perch spoons and small birds feeding, realistic 4k',
        },
        {
          id: 'plastic-desk-caddy-hi',
          title: 'डेस्क पेन व स्टेशनरी स्टैंड',
          difficulty: 'Easy',
          timeMinutes: 15,
          materialsNeeded: ['प्लास्टिक बोतल का निचला हिस्सा', 'एक्रिलिक रंग', 'सजावटी टेप'],
          imagePrompt: 'A cute painted desk stationery organizer made from a plastic bottle bottom holding colorful pens on a wooden table, 4k',
        },
        {
          id: 'plastic-zipper-pouch-hi',
          title: 'ज़िपर स्टोरेज कैप्सूल',
          difficulty: 'Medium',
          timeMinutes: 30,
          materialsNeeded: ['2 बोतल के निचले भाग', 'नायलॉन ज़िपर', 'गोंद/फेविक्विक'],
          imagePrompt: 'Two plastic bottle bases joined with a colorful zipper forming a round trinket storage capsule, studio product photography',
        },
      ],
    };
  }

  if (language === 'hinglish') {
    return {
      items: ['Plastic water bottle', 'Plastic bottle cap'],
      materials: ['PET Plastic'],
      safetyWarning: 'Safety Warning: Plastic ko cut karte waqt sharp scissors ya cutter se dhyan se kaam karein. Cut edges ko sandpaper ya halki heat se smooth kar lein.',
      isDemo: true,
      ideas: [
        {
          id: 'plastic-planter-hng',
          title: 'Self-Watering Kitchen Herb Planter',
          difficulty: 'Easy',
          timeMinutes: 20,
          materialsNeeded: ['Plastic bottle', 'Cotton wick / dhaga', 'Potting soil', 'Herb seedling'],
          imagePrompt: 'A self-watering green herb planter made from a recycled clear plastic bottle on a sunny windowsill, photorealistic, 4k',
        },
        {
          id: 'plastic-bird-feeder-hng',
          title: 'Eco Hanging Bird Feeder',
          difficulty: 'Easy',
          timeMinutes: 25,
          materialsNeeded: ['Plastic bottle', '2 wooden spoons / chopsticks', 'Jute rope', 'Bird seeds'],
          imagePrompt: 'A hanging bird feeder made from a clear plastic bottle with wooden perch spoons and wild birds, realistic 4k',
        },
        {
          id: 'plastic-desk-caddy-hng',
          title: 'Cute Painted Desk Stationery Stand',
          difficulty: 'Easy',
          timeMinutes: 15,
          materialsNeeded: ['Plastic bottle bottom', 'Acrylic paint', 'Decorative tape'],
          imagePrompt: 'A cute painted desk stationery organizer made from a plastic bottle bottom holding pens on a clean study desk, 4k',
        },
        {
          id: 'plastic-zipper-pouch-hng',
          title: 'Compact Zipper Travel Capsule',
          difficulty: 'Medium',
          timeMinutes: 30,
          materialsNeeded: ['2 identical plastic bottle bases', 'Nylon zipper', 'Strong adhesive'],
          imagePrompt: 'Two plastic bottle bases joined with a bright zipper forming a round compact travel capsule, studio product photography',
        },
      ],
    };
  }

  // Default: English
  return {
    items: ['Clear Plastic Water Bottle', 'Screw Cap'],
    materials: ['PET Plastic (Polyethylene Terephthalate)'],
    safetyWarning: 'Safety Warning: Take care when slicing plastic with hobby blades or scissors. Sand down sharp plastic rims before use.',
    isDemo: true,
    ideas: [
      {
        id: 'self-watering-planter-en',
        title: 'Self-Watering Herb Planter',
        difficulty: 'Easy',
        timeMinutes: 20,
        materialsNeeded: ['Plastic bottle', 'Cotton cord wick', 'Potting soil', 'Herb seeds'],
        imagePrompt: 'A clean inverted clear plastic bottle turned into a self-watering herb planter with basil on a sunlit windowsill, photorealistic 4k',
      },
      {
        id: 'eco-canopy-bird-feeder-en',
        title: 'Eco Canopy Bird Feeder',
        difficulty: 'Easy',
        timeMinutes: 25,
        materialsNeeded: ['Plastic bottle', 'Two wooden spoons / dowels', 'Hemp twine', 'Wild bird seed'],
        imagePrompt: 'A rustic hanging bird feeder crafted from a transparent plastic bottle with wooden spoon perches and visiting wild birds, 4k',
      },
      {
        id: 'desktop-stationery-caddy-en',
        title: 'Tiered Desk Stationery Caddy',
        difficulty: 'Easy',
        timeMinutes: 15,
        materialsNeeded: ['Bottle base', 'Acrylic paints', 'Sandpaper', 'Felt base pad'],
        imagePrompt: 'A modern matte pastel painted desk organizer made from plastic bottle base holding stationery pens on a wooden table, 4k',
      },
      {
        id: 'zipper-travel-capsule-en',
        title: 'Rigid Zipper Storage Capsule',
        difficulty: 'Medium',
        timeMinutes: 30,
        materialsNeeded: ['2 bottle bottoms', 'Nylon zipper', 'Hot glue / fabric adhesive'],
        imagePrompt: 'Two plastic bottle bottoms cleanly joined with a bright zipper forming a round trinket storage capsule, studio product photography',
      },
    ],
  };
}

/**
 * Analyzes waste scrap image using Claude 3.5 Sonnet (or Gemini 2.5 Flash as fallback)
 * and returns the exact strict JSON schema with safety warning and language localization.
 */
export async function analyzeWaste({
  imageBase64,
  mimeType = 'image/jpeg',
  language = 'english',
}: {
  imageBase64?: string;
  mimeType?: string;
  language?: LanguageOption;
}): Promise<AnalyzeResponse> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!anthropicKey && !geminiKey) {
    console.info('No ANTHROPIC_API_KEY or GEMINI_API_KEY set. Returning localized demo response.');
    return getDemoAnalyzeResponse(language);
  }

  const langInstruction = getLanguageInstruction(language);

  const systemPrompt = `You are a world-class sustainable product designer and materials specialist for "Waste to Wealth".
Inspect the uploaded waste item photograph.

Requirements:
1. Identify all waste items visible in "items" array.
2. Identify all material types (e.g. "PET Plastic", "Corrugated Cardboard", "Tin-plated Steel", "Soda-lime Glass") in "materials" array.
3. Check for hazards: If the waste contains glass shards, sharp jagged metals, toxic chemical containers, batteries, or pressurized cans, include a prominent "safetyWarning" string with practical precautions. Otherwise set "safetyWarning" to null or a general safe-handling note.
4. Generate EXACTLY 4 creative, high-value, realistic DIY upcycling ideas in the "ideas" array.
   Each idea MUST have:
   - "id": unique kebab-case string
   - "title": catchy, encouraging name
   - "difficulty": "Easy" | "Medium" | "Advanced"
   - "timeMinutes": integer number of minutes (e.g. 20)
   - "materialsNeeded": array of household supplies needed
   - "imagePrompt": a photorealistic, detailed prompt for generating an image of the finished upcycled craft (e.g. "A beautiful hanging herb planter crafted from a green plastic bottle with lush basil on a sunlit balcony, photorealistic, 4k")
5. Language: ${langInstruction}

Return STRICT JSON ONLY matching this format:
{
  "items": ["string"],
  "materials": ["string"],
  "safetyWarning": "string or null",
  "ideas": [
    {
      "id": "string",
      "title": "string",
      "difficulty": "Easy",
      "timeMinutes": 20,
      "materialsNeeded": ["string"],
      "imagePrompt": "string"
    }
  ]
}`;

  // 1. Primary: Claude 3.5 Sonnet Vision
  if (anthropicKey) {
    try {
      const messages: Array<{
        role: string;
        content: Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }>;
      }> = [];

      const userContent: Array<{ type: string; text?: string; source?: { type: string; media_type: string; data: string } }> = [];

      if (imageBase64) {
        userContent.push({
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType,
            data: imageBase64,
          },
        });
      }

      userContent.push({
        type: 'text',
        text: `Analyze this waste photo and provide 4 upcycling ideas in ${language}. Return ONLY strict JSON.`,
      });

      messages.push({ role: 'user', content: userContent });

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2500,
          system: systemPrompt,
          messages,
        }),
      });

      if (!response.ok) {
        throw new Error(`Claude API returned status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const rawText = data.content?.[0]?.text || '';
      // Parse JSON from text (strip markdown fences if present)
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson) as AnalyzeResponse;
      parsed.language = language;
      return parsed;
    } catch (err) {
      console.warn('Claude vision failed or encountered error, falling back to Gemini 2.5 Flash:', err);
    }
  }

  // 2. Secondary: Gemini 2.5 Flash Vision
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });

      const userParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [];

      if (imageBase64) {
        userParts.push({
          inlineData: {
            mimeType,
            data: imageBase64,
          },
        });
      }

      userParts.push({
        text: `Analyze this waste item photograph and generate exactly 4 upcycling ideas. Output strictly in ${language}.`,
      });

      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ role: 'user', parts: userParts }],
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const rawText = result.text || '{}';
      const parsed = JSON.parse(rawText) as AnalyzeResponse;
      parsed.language = language;
      return parsed;
    } catch (err) {
      console.error('Gemini vision also failed:', err);
    }
  }

  return getDemoAnalyzeResponse(language);
}
