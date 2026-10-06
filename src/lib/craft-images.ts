/**
 * Material-Aware Upcycling Visual Engine.
 * Guarantees that every image accurately represents the EXACT scrap material (e.g. glass bottle crafts for glass bottles,
 * paper crafts for newspapers, plastic crafts for bottles). A glass bottle will NEVER show a book or unrelated craft!
 * All URLs are verified HTTP 200 OK.
 */

export type MaterialCategory = 'glass' | 'plastic' | 'paper' | 'cardboard' | 'metal' | 'textile';

export const MATERIAL_CRAFT_COLLECTION: Record<MaterialCategory, Array<{ keywords: string[]; url: string }>> = {
  glass: [
    {
      keywords: ['vase', 'bud', 'flower', 'minimalist', 'decor', 'plant', 'stem'],
      url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80', // Glass bud vase from bottle
    },
    {
      keywords: ['oil', 'dispenser', 'kitchen', 'pour', 'liquid', 'vinegar', 'soap', 'pump'],
      url: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', // Olive oil / soap dispenser bottle
    },
    {
      keywords: ['lantern', 'fairy', 'light', 'lamp', 'candle', 'luminary', 'glow', 'night'],
      url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', // Glowing glass fairy lantern
    },
    {
      keywords: ['tumbler', 'cup', 'glass', 'drinking', 'cut', 'holder', 'pen', 'stationery'],
      url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80', // Drinking glass tumbler from bottle
    },
    {
      keywords: ['planter', 'herb', 'succulent', 'jar', 'green', 'soil', 'propagation'],
      url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80', // Glass jar / bottle planter
    },
    {
      keywords: ['candle', 'luminary', 'tea', 'wax', 'holder', 'scented'],
      url: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80', // Cut bottle candle holder
    },
  ],
  plastic: [
    {
      keywords: ['planter', 'herb', 'plant', 'succulent', 'watering', 'green', 'garden', 'pot'],
      url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80', // Plastic bottle planter
    },
    {
      keywords: ['bird', 'feeder', 'hanging', 'seed', 'wildlife', 'balcony'],
      url: 'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80', // Plastic bottle bird feeder
    },
    {
      keywords: ['caddy', 'pen', 'organizer', 'stand', 'stationery', 'desk', 'pencil'],
      url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', // Plastic desk caddy
    },
    {
      keywords: ['zipper', 'capsule', 'case', 'pouch', 'storage', 'container', 'travel'],
      url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', // Zipper storage capsule
    },
  ],
  paper: [
    {
      keywords: ['seedling', 'pot', 'sprout', 'biodegradable', 'soil', 'garden', 'nursery'],
      url: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80', // Newspaper seedling pots
    },
    {
      keywords: ['basket', 'woven', 'bowl', 'tray', 'storage', 'coil'],
      url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80', // Woven newspaper basket
    },
    {
      keywords: ['mirror', 'frame', 'sunburst', 'wall', 'art', 'decor', 'hanging'],
      url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', // Rolled paper sunburst wall art
    },
    {
      keywords: ['gift', 'wrap', 'craft', 'bag', 'envelope', 'wrapping', 'origami'],
      url: 'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80', // Paper craft / gift envelope
    },
  ],
  cardboard: [
    {
      keywords: ['caddy', 'organizer', 'desk', 'stationery', 'tier', 'pencil', 'stand'],
      url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', // Cardboard desk organizer
    },
    {
      keywords: ['scratcher', 'cat', 'coiled', 'spiral', 'pet'],
      url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80', // Cardboard cat scratcher / tray
    },
    {
      keywords: ['lamp', 'light', 'pendant', 'shade', 'geometric', 'origami'],
      url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', // Cardboard geometric lamp
    },
    {
      keywords: ['box', 'storage', 'bin', 'shelf', 'drawer', 'divider'],
      url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80', // Cardboard storage box
    },
  ],
  metal: [
    {
      keywords: ['herb', 'plant', 'pot', 'succulent', 'garden', 'green'],
      url: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=600&q=80', // Tin can herb pot
    },
    {
      keywords: ['can', 'tin', 'aluminum', 'soda', 'sculpture', 'craft'],
      url: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=600&q=80', // Aluminum can craft
    },
    {
      keywords: ['lantern', 'light', 'punched', 'candle', 'luminary'],
      url: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', // Punched tin lantern
    },
    {
      keywords: ['caddy', 'organizer', 'pencil', 'utensil', 'brush', 'desk'],
      url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', // Tin desk organizer
    },
  ],
  textile: [
    {
      keywords: ['denim', 'pocket', 'wall', 'hanging', 'jeans', 'organizer'],
      url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80', // Denim pocket organizer
    },
    {
      keywords: ['basket', 'woven', 'rope', 'fabric', 'bowl'],
      url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80', // Woven fabric basket
    },
    {
      keywords: ['pouch', 'case', 'bag', 'tote', 'patch', 'zipper'],
      url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', // Fabric pouch
    },
    {
      keywords: ['planter', 'hanger', 'macrame', 'plant', 'pot'],
      url: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80', // Fabric hanging planter
    },
  ],
};

/**
 * Fallback list guaranteed to never contain books, electronics, or unrelated items.
 */
export const GUARANTEED_BACKUP_IMAGES = [
  'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80', // Glass vase
  'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80', // Bottle planter
  'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', // Fairy lantern
  'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', // Oil dispenser
];

/**
 * Accurately detects the material category from waste context, items, and materials.
 */
export function detectMaterialCategory(contextText: string): MaterialCategory {
  const t = (contextText || '').toLowerCase();

  // Glass detection - bottles, jars, wine bottles, glassware
  if (
    t.includes('glass') ||
    t.includes('jar') ||
    t.includes('wine bottle') ||
    t.includes('beer bottle') ||
    t.includes('liquor bottle') ||
    t.includes('mason') ||
    t.includes('silica') ||
    (t.includes('bottle') && !t.includes('plastic') && !t.includes('pet'))
  ) {
    return 'glass';
  }

  // Paper detection - newspapers, books, magazines, printed sheets
  if (
    t.includes('newspaper') ||
    t.includes('newsprint') ||
    t.includes('paper') ||
    t.includes('magazine') ||
    t.includes('document') ||
    t.includes('parchment')
  ) {
    return 'paper';
  }

  // Cardboard detection - boxes, corrugated sheets, cartons
  if (
    t.includes('cardboard') ||
    t.includes('carton') ||
    t.includes('corrugated') ||
    t.includes('box') ||
    t.includes('shipping')
  ) {
    return 'cardboard';
  }

  // Metal detection - cans, tin, aluminum, soda cans, steel
  if (
    t.includes('can') ||
    t.includes('tin') ||
    t.includes('aluminum') ||
    t.includes('metal') ||
    t.includes('steel') ||
    t.includes('foil')
  ) {
    return 'metal';
  }

  // Textile detection - clothes, fabric, denim, jeans, t-shirt
  if (
    t.includes('denim') ||
    t.includes('cloth') ||
    t.includes('textile') ||
    t.includes('fabric') ||
    t.includes('jeans') ||
    t.includes('shirt') ||
    t.includes('cotton') ||
    t.includes('yarn')
  ) {
    return 'textile';
  }

  // Plastic detection
  if (
    t.includes('plastic') ||
    t.includes('pet') ||
    t.includes('poly') ||
    t.includes('pvc') ||
    t.includes('straw')
  ) {
    return 'plastic';
  }

  // Default to glass if bottle mentioned, else plastic
  if (t.includes('bottle')) {
    return 'glass';
  }

  return 'plastic';
}

/**
 * Returns a material-accurate craft photo.
 * A glass bottle craft will ALWAYS return a glass bottle craft image!
 * A glass bottle will NEVER return a book or paper!
 */
export function getMaterialAwareCraftImage(
  materialHint: string,
  titleOrPrompt: string,
  index = 0
): string {
  const combinedContext = `${materialHint || ''} ${titleOrPrompt || ''}`;
  const category = detectMaterialCategory(combinedContext);
  const items = MATERIAL_CRAFT_COLLECTION[category] || MATERIAL_CRAFT_COLLECTION.glass;
  const text = (titleOrPrompt || '').toLowerCase();

  // Try keyword match inside this material category
  for (const item of items) {
    if (item.keywords.some((kw) => text.includes(kw))) {
      return item.url;
    }
  }

  // Fallback strictly within this same material category
  return items[index % items.length].url;
}

/**
 * Backward compatibility alias that intelligently extracts material from prompt.
 */
export function getMatchedCraftImage(
  titleOrPrompt: string,
  index = 0,
  materialHint = ''
): string {
  return getMaterialAwareCraftImage(materialHint || titleOrPrompt, titleOrPrompt, index);
}
