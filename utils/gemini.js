const { GoogleGenerativeAI } = require('@google/generative-ai');
const cache = new Map();

const fallbackCaptions = ['Doge hacks the matrix!', 'To the MOON!', 'HODL forever!'];
const fallbackVibes = ['Neon Crypto Chaos', 'Retro Stonks Vibes', 'Cyber Crypto Frenzy'];

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

const generateCaption = async (tags) => {
  const cacheKey = `caption:${tags.join(',')}`;
  if (cache.has(cacheKey)) {
    console.log(`Cache hit for caption: ${cache.get(cacheKey)}`);
    return cache.get(cacheKey);
  }

  try {
    const prompt = `Generate a short, witty meme caption for a meme with the following tags: ${tags.join(', ')}.`;
    const result = await model.generateContent(prompt);
    const caption = result?.response?.text?.trim() || result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (caption) {
      cache.set(cacheKey, caption);
      return caption;
    }
    throw new Error('No caption generated');
  } catch (error) {
    console.error('Gemini caption error:', error);
    const fallback = fallbackCaptions[Math.floor(Math.random() * fallbackCaptions.length)];
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
    const prompt = `Suggest a creative, short "vibe" or theme for a meme with these tags: ${tags.join(', ')}.`;
    const result = await model.generateContent(prompt);
    const vibe = result?.response?.text?.trim() || result?.response?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (vibe) {
      cache.set(cacheKey, vibe);
      return vibe;
    }
    throw new Error('No vibe generated');
  } catch (error) {
    console.error('Gemini vibe error:', error);
    const fallback = fallbackVibes[Math.floor(Math.random() * fallbackVibes.length)];
    cache.set(cacheKey, fallback);
    return fallback;
  }
};

module.exports = { generateCaption, generateVibe };