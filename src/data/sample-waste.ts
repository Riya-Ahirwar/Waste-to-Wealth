export interface SampleWasteItem {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  samplePrompt: string;
}

export const SAMPLE_WASTE_ITEMS: SampleWasteItem[] = [
  {
    id: 'sample-plastic-bottle',
    name: 'Plastic Water Bottles',
    category: 'Plastic',
    description: 'Empty 500ml PET water bottles with caps.',
    imageUrl: 'https://images.unsplash.com/photo-1572061486743-1627c2448375?auto=format&fit=crop&w=400&q=80',
    samplePrompt: 'Empty clear plastic beverage bottle with screw cap.',
  },
  {
    id: 'sample-cardboard-box',
    name: 'Corrugated Cardboard Box',
    category: 'Paper & Cardboard',
    description: 'Brown delivery parcel packaging box.',
    imageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=400&q=80',
    samplePrompt: 'Medium size brown corrugated cardboard shipping box.',
  },
  {
    id: 'sample-glass-jar',
    name: 'Glass Jam Jar',
    category: 'Glass',
    description: 'Empty transparent glass jar with metal lid.',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80',
    samplePrompt: 'Clear glass food preserve jar with a metal twist lid.',
  },
  {
    id: 'sample-aluminum-cans',
    name: 'Soda Aluminum Cans',
    category: 'Metal',
    description: 'Empty beverage drink cans.',
    imageUrl: 'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=400&q=80',
    samplePrompt: 'Emptied soda drink aluminum metal cans.',
  },
  {
    id: 'sample-denim-scraps',
    name: 'Old Denim & Fabric Scraps',
    category: 'Textile',
    description: 'Worn out jeans scraps and textile offcuts.',
    imageUrl: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=400&q=80',
    samplePrompt: 'Worn out blue denim jeans fabric remnants and patches.',
  },
];
