async function testImage() {
  const prompt = 'A decorative drinking tumbler glass cup made from the cut and smoothed bottom half of a clear glass bottle, placed on a modern wooden bar table, studio product photograph, clean background, 4k';
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=450&height=320&nologo=true&model=turbo`;
  console.log('Testing URL:', url);
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log('Status:', res.status, 'Type:', res.headers.get('content-type'), 'Length:', res.headers.get('content-length'));
  } catch (e) {
    console.error('Error:', e);
  }
}

testImage();
