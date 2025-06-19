const cache = new Map();

const fallbackCaptions = ['Doge hacks the matrix!', 'To the MOON!', 'HODL forever!'];
const fallbackVibes = ['Neon Crypto Chaos', 'Retro Stonks Vibes', 'Cyber Crypto Frenzy'];

const generateCaption = async (tags) => {
  const cacheKey = `caption:${tags.join(',')}`;
  if (cache.has(cacheKey)) {
    console.log(`Cache hit for caption: ${cache.get(cacheKey)}`);
    return cache.get(cacheKey);
  }

  try {
    const caption = fallbackCaptions[Math.floor(Math.random() * fallbackCaptions.length)];
    console.log(`Generated caption: ${caption}`);
    cache.set(cacheKey, caption);
    return caption;
  } catch (error) {
    console.error('Caption error:', error);
    const fallback = 'YOLO to the moon!';
    cache.set(cacheKey, fallback);
    return fallback;
  }
};

const generateVibe = async (tags) => {
  const cacheKey = `vibe:${tags.join(',')}`;
  if (cache.has(cacheKey)) {
    console.log(`Cache hit for vibe: ${cache.get(cacheKey)}`);
    return cache.get(cacheKey);
  }

  try {
    // Mock response for hackathon
    const vibe = fallbackVibes[Math.floor(Math.random() * fallbackVibes.length)];
    console.log(`Generated vibe: ${vibe}`);
    cache.set(cacheKey, vibe);
    return vibe;
  } catch (error) {
    console.error('Vibe error:', error);
    const fallback = 'Retro Stonks Vibes';
    cache.set(cacheKey, fallback);
    return fallback;
  }
};

module.exports = { generateCaption, generateVibe };