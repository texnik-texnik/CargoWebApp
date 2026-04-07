import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { message } = req.body;
    // Simple response - AI can be added later with Groq/Gemini API
    const response = `Спасибо за вопрос! Вы написали: "${message}". AI-ассистент будет добавлен позже.`;
    res.status(200).json({ response });
  } catch (e: any) { res.status(500).json({ error: e.message }); }
}
