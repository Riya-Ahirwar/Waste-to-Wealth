import { GoogleGenAI } from '@google/genai';
import { CraftIdea, WasteAnalysisResult } from '@/types/craft';

/**
 * Creates high-quality visual representation URLs for each craft idea.
 * Uses Pollinations AI generative image endpoint with seed randomization.
 */
export function generateCraftImageUrl(prompt: string, seed = 42): string {
  const cleanPrompt = `${prompt}, beautiful upcycled DIY craft product photograph, high quality, soft studio lighting, realistic, detailed, 4k`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=600&height=450&nologo=true&seed=${seed}&model=flux`;
}

/**
 * Fallback curated mock ideas when no API key is provided or for offline demo.
 */
function getDemoIdeas(materialHint = 'Plastic'): WasteAnalysisResult {
  const isPlastic = materialHint.toLowerCase().includes('plastic') || materialHint.toLowerCase().includes('bottle');
  const isCardboard = materialHint.toLowerCase().includes('cardboard') || materialHint.toLowerCase().includes('box');
  const isGlass = materialHint.toLowerCase().includes('glass') || materialHint.toLowerCase().includes('jar');

  if (isCardboard) {
    return {
      detectedMaterial: 'Corrugated Cardboard Box',
      wasteCategory: 'Paper & Cardboard',
      recyclabilityAssessment: 'Highly recyclable, sturdy structural potential for organizers and home decor.',
      isDemoMode: true,
      ideas: [
        {
          id: 'cardboard-desk-organizer',
          title: 'Geometric Desktop Organizer',
          category: 'Home & Office',
          summary: 'A sleek multi-tiered desk caddy for pens, notebooks, and cables with clean modern lines.',
          difficulty: 'Easy',
          estimatedTime: '30 mins',
          divertedWaste: '150g Cardboard',
          materialsNeeded: ['Cardboard box', 'Ruler', 'Pencil', 'Decorative wrap or acrylic paint'],
          toolsNeeded: ['Utility craft cutter', 'Hot glue gun or PVA glue'],
          imagePrompt: 'Modern minimalist desk organizer made from painted corrugated cardboard holding stationery on a neat wooden desk',
          imageUrl: generateCraftImageUrl('Modern minimalist desk organizer made from cardboard holding stationery', 101),
          quickSteps: [
            'Measure and cut cardboard into tiered rectangular compartments.',
            'Glue the dividers to the base platform with hot glue.',
            'Wrap edges with masking tape or paint with acrylics.',
            'Seal with clear varnish for longevity.',
          ],
        },
        {
          id: 'cardboard-cat-scratcher',
          title: 'Honeycomb Cat Scratcher Lounge',
          category: 'Pets & Home',
          summary: 'Durable, satisfying scratch pad made by coiling cardboard strips.',
          difficulty: 'Medium',
          estimatedTime: '45 mins',
          divertedWaste: '350g Cardboard',
          materialsNeeded: ['Multiple cardboard boxes', 'Non-toxic wood glue', 'Twine'],
          toolsNeeded: ['Box cutter', 'Ruler', 'Cutting mat'],
          imagePrompt: 'Circular coiled corrugated cardboard cat scratcher bed with a sleeping cute cat',
          imageUrl: generateCraftImageUrl('Circular coiled corrugated cardboard cat scratcher bed', 102),
          quickSteps: [
            'Cut cardboard into uniform 2-inch wide strips with visible corrugated flutes.',
            'Tightly roll the first strip into a spiral, gluing as you wrap.',
            'Continue wrapping additional strips until you reach a 14-inch diameter circle.',
            'Secure the outer ring with natural jute twine.',
          ],
        },
        {
          id: 'cardboard-pendant-lamp',
          title: 'Origami Geometric Lamp Shade',
          category: 'Lighting & Decor',
          summary: 'Contemporary faceted lampshade that casts warm, architectural shadows.',
          difficulty: 'Advanced',
          estimatedTime: '60 mins',
          divertedWaste: '200g Cardboard',
          materialsNeeded: ['Thin sturdy cardboard', 'LED bulb fixture (low heat)', 'Craft glue'],
          toolsNeeded: ['Precision knife', 'Bone folder or scoring tool', 'Ruler'],
          imagePrompt: 'Faceted geometric cardboard pendant lampshade glowing warmly in a stylish living room',
          imageUrl: generateCraftImageUrl('Faceted geometric cardboard pendant lampshade glowing warmly', 103),
          quickSteps: [
            'Print or score geometric triangle polygon template onto cardboard.',
            'Carefully fold along scored crease lines.',
            'Assemble faceted panels around an open ring frame.',
            'Insert LED-only light cord assembly.',
          ],
        },
      ],
    };
  }

  if (isGlass) {
    return {
      detectedMaterial: 'Glass Food Preserve Jar',
      wasteCategory: 'Glass',
      recyclabilityAssessment: 'Non-porous, airtight, and infinitely recyclable container.',
      isDemoMode: true,
      ideas: [
        {
          id: 'glass-fairy-lantern',
          title: 'Frosted Terrarium Fairy Lantern',
          category: 'Home Decor',
          summary: 'Warm ambient garden lantern with dried moss, miniature pebbles, and fairy lights.',
          difficulty: 'Easy',
          estimatedTime: '20 mins',
          divertedWaste: '280g Glass',
          materialsNeeded: ['Glass jar', 'Battery fairy light string', 'Pebbles', 'Dried moss'],
          toolsNeeded: ['Wire cutter', 'Hot glue'],
          imagePrompt: 'Glowing frosted glass mason jar fairy lantern with moss and gentle warm light',
          imageUrl: generateCraftImageUrl('Glowing glass mason jar fairy lantern with moss and warm light', 201),
          quickSteps: [
            'Thoroughly clean and dry the glass jar.',
            'Layer river pebbles and preserved moss at the base.',
            'Thread micro fairy lights inside and glue switch under lid.',
            'Wrap hemp cord around jar rim for hanging.',
          ],
        },
        {
          id: 'glass-soap-dispenser',
          title: 'Vintage Upcycled Soap Dispenser',
          category: 'Kitchen & Bath',
          summary: 'Turn an empty sauce or jam jar into a rustic luxury hand soap pump.',
          difficulty: 'Medium',
          estimatedTime: '25 mins',
          divertedWaste: '300g Glass & Metal',
          materialsNeeded: ['Glass jar with metal lid', 'Replacement pump mechanism', 'Waterproof adhesive'],
          toolsNeeded: ['Drill with step bit or metal punch', 'Pliers'],
          imagePrompt: 'Rustic vintage glass jar soap dispenser with matte black metal pump on marble bathroom counter',
          imageUrl: generateCraftImageUrl('Rustic glass jar soap dispenser with matte black pump', 202),
          quickSteps: [
            'Mark center of metal lid and drill hole matching pump neck.',
            'Insert pump mechanism and seal with waterproof silicone.',
            'Fill jar with your favorite liquid hand soap or dish soap.',
            'Screw lid firmly onto jar.',
          ],
        },
      ],
    };
  }

  // Default: Plastic Bottles
  return {
    detectedMaterial: 'Clear PET Plastic Bottle',
    wasteCategory: 'Plastic',
    recyclabilityAssessment: 'High-grade PET plastic, easily pliable, water-resistant, and durable for home crafts.',
    isDemoMode: true,
    ideas: [
      {
        id: 'plastic-self-watering-planter',
        title: 'Self-Watering Herb Planter',
        category: 'Gardening & Greenery',
        summary: 'Sub-irrigated inverted planter that keeps fresh herbs hydrated using natural capillary wick action.',
        difficulty: 'Easy',
        estimatedTime: '20 mins',
        divertedWaste: '60g Plastic',
        materialsNeeded: ['500ml or 1L plastic bottle', 'Cotton string or wick', 'Potting soil', 'Herb seed/seedling'],
        toolsNeeded: ['Craft scissors', 'Hole punch or awl'],
        imagePrompt: 'Inverted clear plastic bottle converted into a self-watering herb planter with lush green basil on a kitchen windowsill',
        imageUrl: generateCraftImageUrl('Inverted plastic bottle self watering herb planter with lush green basil', 301),
        quickSteps: [
          'Cut plastic bottle horizontally about 4 inches below the neck.',
          'Puncture a small hole in the bottle cap and thread 6 inches of cotton wick through.',
          'Invert top half into the bottom reservoir base.',
          'Add potting soil, plant herb, and fill base with water.',
        ],
      },
      {
        id: 'plastic-hanging-bird-feeder',
        title: 'Eco Canopy Bird Feeder',
        category: 'Wildlife & Garden',
        summary: 'Weatherproof bird feeding station with wooden perches and rain shield.',
        difficulty: 'Easy',
        estimatedTime: '25 mins',
        divertedWaste: '80g Plastic',
        materialsNeeded: ['Plastic bottle', '2 wooden chopsticks or spoons', 'Eye screw hook', 'Bird seed'],
        toolsNeeded: ['Scissors or craft knife', 'Marker'],
        imagePrompt: 'Charming hanging bird feeder crafted from plastic bottle with wooden perch spoons and feeding wild birds in a sunny garden',
        imageUrl: generateCraftImageUrl('Hanging bird feeder made from plastic bottle with wooden spoons and wild birds', 302),
        quickSteps: [
          'Cut matching pairs of holes through sides of bottle for chopsticks to pass through.',
          'Carve small 1/2-inch seed access holes just above each perch.',
          'Screw an eye hook into the cap for hanging twine.',
          'Fill with bird seed, seal cap, and hang from tree branch.',
        ],
      },
      {
        id: 'plastic-zipper-case',
        title: 'Compact Zipper Storage Capsule',
        category: 'Accessories & Travel',
        summary: 'Rigid shockproof container for earphones, coins, craft beads, or cosmetics.',
        difficulty: 'Medium',
        estimatedTime: '35 mins',
        divertedWaste: '90g Plastic',
        materialsNeeded: ['2 identical plastic bottle bases', '1 nylon zipper (matched circumference)', 'Fabric glue or needle & thread'],
        toolsNeeded: ['Utility knife', 'Iron or hot surface to smooth edges'],
        imagePrompt: 'Two plastic bottle bottoms joined by a bright colorful zipper forming a round trinket travel pouch',
        imageUrl: generateCraftImageUrl('Two plastic bottle bottoms joined by a bright colorful zipper forming a round trinket pouch', 303),
        quickSteps: [
          'Cut bottom 2.5 inches off two identical plastic bottles.',
          'Smooth the cut rims against a warm iron for 3 seconds.',
          'Glue or stitch one side of zipper to base #1 and other side to base #2.',
          'Zip closed to store jewelry, chargers, or coins.',
        ],
      },
    ],
  };
}

/**
 * Analyzes waste scrap image using Google Gemini (gemini-2.5-flash)
 * or Anthropic Claude (claude-3-5-sonnet-20241022).
 */
export async function analyzeWasteImage({
  imageBase64,
  mimeType = 'image/jpeg',
  descriptionHint = '',
}: {
  imageBase64?: string;
  mimeType?: string;
  descriptionHint?: string;
}): Promise<WasteAnalysisResult> {
  const geminiKey = process.env.GEMINI_API_KEY;
  const anthropicKey = process.env.ANTHROPIC_API_KEY;

  // If no API key is configured yet, gracefully return rich demo data
  if (!geminiKey && !anthropicKey) {
    console.info('No GEMINI_API_KEY or ANTHROPIC_API_KEY found. Serving smart demo ideas.');
    return getDemoIdeas(descriptionHint || 'Plastic Bottle');
  }

  // Primary: Use Google Gemini 2.5 Flash
  if (geminiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey: geminiKey });

      const systemPrompt = `You are an expert sustainable industrial designer and eco-crafting specialist for the "Waste to Wealth" mobile application.
Analyze the user's uploaded waste image or material.
Identify the material and generate 3 to 4 creative, practical, aesthetically pleasing upcycled DIY projects that can be made from this waste.

Output ONLY a valid JSON object matching this exact schema:
{
  "detectedMaterial": "string (specific name, e.g. 'Clear 500ml PET Plastic Water Bottle')",
  "wasteCategory": "string ('Plastic' | 'Paper & Cardboard' | 'Glass' | 'Metal' | 'Textile' | 'Electronic' | 'Organic')",
  "recyclabilityAssessment": "string (1-2 sentence description of properties and upcycling value)",
  "ideas": [
    {
      "id": "string (kebab-case unique id)",
      "title": "string (catchy craft title)",
      "category": "string (e.g. 'Gardening', 'Home Decor', 'Kitchen', 'Accessories')",
      "summary": "string (2 sentences describing what it is and why it's useful)",
      "difficulty": "Easy" | "Medium" | "Advanced",
      "estimatedTime": "string (e.g. '25 mins')",
      "divertedWaste": "string (estimated diverted waste, e.g. '75g Plastic')",
      "materialsNeeded": ["string", "string"],
      "toolsNeeded": ["string", "string"],
      "imagePrompt": "string (a descriptive visual prompt for what the finished craft looks like)",
      "quickSteps": ["Step 1...", "Step 2...", "Step 3...", "Step 4..."]
    }
  ]
}`;

      const contents: Array<{
        role: string;
        parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
      }> = [];

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
        text: `Please analyze this waste scrap item. ${descriptionHint ? `Additional user hint: "${descriptionHint}".` : ''} Return the structured JSON with 3-4 upcycled ideas.`,
      });

      contents.push({
        role: 'user',
        parts: userParts,
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: 'application/json',
          temperature: 0.4,
        },
      });

      const text = response.text || '';
      const parsed = JSON.parse(text) as WasteAnalysisResult;

      // Enhance each idea with visual image URL
      parsed.ideas = parsed.ideas.map((idea: CraftIdea, index: number) => ({
        ...idea,
        imageUrl: generateCraftImageUrl(idea.imagePrompt || idea.title, index + 10),
      }));

      return parsed;
    } catch (err) {
      console.error('Gemini API call failed, falling back to demo ideas:', err);
      return getDemoIdeas(descriptionHint || 'Plastic');
    }
  }

  // Fallback: Anthropic Claude (claude-3-5-sonnet-20241022) via native REST
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
        text: `Analyze this waste scrap and generate 3-4 upcycled DIY projects. Hint: "${descriptionHint}". Return JSON ONLY.`,
      });

      messages.push({ role: 'user', content: userContent });

      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': anthropicKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-5-sonnet-20241022',
          max_tokens: 2000,
          system: 'You are an eco-upcycling designer. Respond ONLY with valid JSON with keys: detectedMaterial, wasteCategory, recyclabilityAssessment, ideas (array with id, title, category, summary, difficulty, estimatedTime, divertedWaste, materialsNeeded, toolsNeeded, imagePrompt, quickSteps).',
          messages,
        }),
      });

      if (!claudeRes.ok) {
        throw new Error(`Claude API error: ${claudeRes.statusText}`);
      }

      const claudeData = await claudeRes.json();
      const rawText = claudeData.content?.[0]?.text || '';
      const parsed = JSON.parse(rawText) as WasteAnalysisResult;

      parsed.ideas = parsed.ideas.map((idea: CraftIdea, index: number) => ({
        ...idea,
        imageUrl: generateCraftImageUrl(idea.imagePrompt || idea.title, index + 20),
      }));

      return parsed;
    } catch (err) {
      console.error('Claude API call failed, falling back to demo ideas:', err);
      return getDemoIdeas(descriptionHint || 'Plastic');
    }
  }

  return getDemoIdeas(descriptionHint || 'Plastic');
}
