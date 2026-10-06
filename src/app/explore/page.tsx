'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Gauge, Clock, Recycle, Bookmark } from 'lucide-react';
import { SAMPLE_WASTE_ITEMS } from '@/data/sample-waste';
import { CraftIdea } from '@/types/craft';

const CATEGORIES = ['All', 'Plastic', 'Cardboard', 'Glass', 'Metal', 'Textile'];

const FEATURED_IDEAS: CraftIdea[] = [
  {
    id: 'plastic-hanging-planter',
    title: 'Hanging Self-Watering Planter',
    category: 'Plastic',
    summary: 'Turn standard 1-liter plastic bottles into vertical hanging greenery for herbs and succulents.',
    difficulty: 'Easy',
    estimatedTime: '20 mins',
    divertedWaste: '70g Plastic',
    materialsNeeded: ['Plastic Bottle', 'Cotton Wick', 'Soil', 'Jute Cord'],
    toolsNeeded: ['Craft Scissors', 'Hole Punch'],
    imagePrompt: 'Inverted hanging plastic bottle self watering herb planter on a balcony',
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80',
    quickSteps: [
      'Cut bottle in half.',
      'Punch wick hole in cap.',
      'Invert upper half into lower reservoir.',
      'Add soil and plant succulent.',
    ],
  },
  {
    id: 'cardboard-desk-organizer',
    title: 'Geometric Desktop Organizer',
    category: 'Cardboard',
    summary: 'A sleek tiered desk caddy for pens, notebooks, and cables with clean modern lines.',
    difficulty: 'Easy',
    estimatedTime: '30 mins',
    divertedWaste: '150g Cardboard',
    materialsNeeded: ['Cardboard box', 'Ruler', 'Pencil', 'Decorative wrap'],
    toolsNeeded: ['Utility craft cutter', 'Hot glue gun'],
    imagePrompt: 'Modern minimalist desk organizer made from cardboard holding stationery',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80',
    quickSteps: [
      'Measure and cut cardboard into tiered compartments.',
      'Glue dividers to the base platform.',
      'Wrap edges with decorative paper.',
    ],
  },
  {
    id: 'glass-fairy-lantern',
    title: 'Frosted Terrarium Fairy Lantern',
    category: 'Glass',
    summary: 'Warm ambient garden lantern with dried moss, miniature pebbles, and fairy lights.',
    difficulty: 'Easy',
    estimatedTime: '20 mins',
    divertedWaste: '280g Glass',
    materialsNeeded: ['Glass jar', 'Battery fairy light string', 'Pebbles', 'Dried moss'],
    toolsNeeded: ['Wire cutter', 'Hot glue'],
    imagePrompt: 'Glowing frosted glass mason jar fairy lantern with moss and gentle warm light',
    imageUrl: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80',
    quickSteps: [
      'Clean and dry the glass jar thoroughly.',
      'Layer river pebbles and preserved moss at the base.',
      'Thread micro fairy lights inside and glue switch under lid.',
    ],
  },
  {
    id: 'tin-can-desk-caddy',
    title: 'Rustic Herb & Cutlery Tin Pots',
    category: 'Metal',
    summary: 'Embossed aluminum drink cans upcycled into vintage kitchen herb pots or utensil holders.',
    difficulty: 'Easy',
    estimatedTime: '15 mins',
    divertedWaste: '110g Aluminum',
    materialsNeeded: ['Aluminum can', 'Sisal rope', 'Drainage gravel'],
    toolsNeeded: ['Can opener', 'Metal file to smooth edges'],
    imagePrompt: 'Rustic painted tin cans wrapped with burlap and sisal rope with green herbs on kitchen counter',
    imageUrl: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=600&q=80',
    quickSteps: [
      'Remove rim cleanly and file smooth.',
      'Punch drainage holes in bottom.',
      'Wrap exterior with twine or paint.',
    ],
  },
  {
    id: 'denim-pocket-organizer',
    title: 'Wall-Hanging Denim Pocket Board',
    category: 'Textile',
    summary: 'Cut rear pockets from worn jeans into a wall organizer for phones, remotes, and sunglasses.',
    difficulty: 'Medium',
    estimatedTime: '40 mins',
    divertedWaste: '240g Denim',
    materialsNeeded: ['Old jeans pockets', 'Wooden dowel or branch', 'Fabric glue or needle'],
    toolsNeeded: ['Fabric shears', 'Sewing needle'],
    imagePrompt: 'Chic boho wall hanging organizer made from blue denim jeans pockets on a wooden dowel',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80',
    quickSteps: [
      'Carefully cut around jeans pockets leaving 1/2 inch border.',
      'Mount pockets onto canvas backing.',
      'Hang from natural driftwood branch.',
    ],
  },
];

export default function ExplorePage() {
  const router = useRouter();
  const [selectedCat, setSelectedCat] = useState('All');

  const filteredIdeas = selectedCat === 'All'
    ? FEATURED_IDEAS
    : FEATURED_IDEAS.filter((i) => (i.category || '').toLowerCase() === selectedCat.toLowerCase());

  const handleSelectCraft = (idea: CraftIdea) => {
    sessionStorage.setItem('activeCraft', JSON.stringify(idea));
    router.push(`/craft/${idea.id}`);
  };

  return (
    <div className="space-y-5 pb-8 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-700 to-emerald-700 p-5 rounded-3xl text-white shadow-lg">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-xs font-semibold mb-2">
          <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
          <span>Curated Eco-Designs</span>
        </div>
        <h2 className="text-xl font-extrabold tracking-tight">Explore Craft Blueprints</h2>
        <p className="text-xs text-emerald-100/90 mt-1">
          Browse popular DIY projects sorted by scrap material type.
        </p>
      </div>

      {/* Material Filters */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCat(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedCat === cat
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Ideas List */}
      <div className="space-y-4">
        {filteredIdeas.map((idea) => (
          <div
            key={idea.id}
            onClick={() => handleSelectCraft(idea)}
            className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col"
          >
            <div className="relative w-full h-44 bg-slate-100">
              <Image
                src={idea.imageUrl}
                alt={idea.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                unoptimized
              />
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold backdrop-blur-xs">
                {idea.category}
              </div>
            </div>

            <div className="p-4 space-y-2">
              <h3 className="font-bold text-slate-800 text-sm group-hover:text-emerald-700 transition-colors">
                {idea.title}
              </h3>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                {idea.summary}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {idea.difficulty}
                  </span>
                  <span className="text-slate-500 font-medium">
                    {idea.estimatedTime}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-emerald-600 font-bold">
                  <span>Start Crafting</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
