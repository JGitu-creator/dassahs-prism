import { GoogleGenAI } from '@google/genai';

const apiKey = process.env.GEMINI_API_KEY?.trim();
if (!apiKey) {
  console.error('Missing GEMINI_API_KEY. Set it in .env.local or pass GEMINI_API_KEY=... before running.');
  process.exit(1);
}

const model = process.env.GEMINI_TIER3_MODEL?.trim() || 'gemini-3.5-flash-lite';
const client = new GoogleGenAI({ apiKey });

const interaction = await client.interactions.create({
  model,
  input: 'In 2 short sentences, explain Cognitive Load Theory using one vivid everyday metaphor.',
});

console.log('Model:', model);
console.log('Interaction ID:', interaction.id);
console.log('Reply:\n', interaction.output_text);
