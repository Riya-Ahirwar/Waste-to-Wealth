const MATERIAL_IMAGES = {
  glass: [
    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80', // Glass jar / vase
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80', // Olive oil bottle dispenser
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', // Glowing fairy lantern
    'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=600&q=80', // Glass drinking tumbler
  ],
  plastic: [
    'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80', // Plastic bottle planter
    'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?auto=format&fit=crop&w=600&q=80', // Hanging bottle bird feeder
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', // Bottle desk caddy
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', // Zipper storage capsule
  ],
  paper: [
    'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80', // Newspaper seedling pots
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80', // Woven newspaper basket
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', // Sunburst paper mirror frame
    'https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=600&q=80', // Gift wrap / rolled paper crafts
  ],
  cardboard: [
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', // Cardboard desktop organizer
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80', // Cardboard coiled scratcher/basket
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', // Cardboard pendant light
    'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80', // Cardboard storage box
  ],
  metal: [
    'https://images.unsplash.com/photo-1463320726281-696a485928c7?auto=format&fit=crop&w=600&q=80', // Tin can herb pot
    'https://images.unsplash.com/photo-1558449028-b53a39d100fc?auto=format&fit=crop&w=600&q=80', // Aluminum can craft
    'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=600&q=80', // Punched tin lantern
    'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', // Desk tin organizer
  ],
  textile: [
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=600&q=80', // Denim pocket organizer
    'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80', // Woven fabric basket
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=600&q=80', // Upcycled fabric pouch
    'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80', // Fabric hanging planter
  ]
};

async function testAll() {
  const allUrls = Object.values(MATERIAL_IMAGES).flat();
  console.log(`Testing ${allUrls.length} material URLs...`);
  const results = await Promise.all(allUrls.map(u => fetch(u).then(r => ({ status: r.status, url: u }))));
  const failed = results.filter(r => r.status !== 200);
  if (failed.length === 0) {
    console.log('ALL URLs ARE 200 OK! Zero broken images!');
  } else {
    console.log('Failed URLs:', failed);
  }
}

testAll();
