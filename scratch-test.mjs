async function testServerSideGen() {
  const prompt = 'A decorative drinking glass tumbler made from cut and smoothed glass bottle, photorealistic, 4k';
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=400&height=300&nologo=true&model=turbo`;

  console.log('Fetching on server...');
  const startTime = Date.now();
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(12000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    const b64 = Buffer.from(buffer).toString('base64');
    console.log('SUCCESS! Buffer size:', buffer.byteLength, 'Time:', Date.now() - startTime, 'ms');
    console.log('Data URL starts with: data:image/jpeg;base64,' + b64.slice(0, 30));
  } catch (e) {
    console.error('Error:', e.message);
  }
}

testServerSideGen();
