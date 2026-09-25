import { env } from '../config/env.js';

export async function explainWithGemini({ question, topic }) {
  if (!env.geminiApiKey) {
    const error = new Error('AI Tutor is not configured. Add GEMINI_API_KEY on the server.');
    error.statusCode = 503;
    throw error;
  }

  const model = env.geminiModel;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(env.geminiApiKey)}`;
  const prompt = [
    'You are StudyTrack AI Tutor.',
    'Explain the learner question clearly and concisely.',
    'Use simple language and a practical example when useful.',
    topic ? `Topic context: ${topic}` : '',
    `Learner question: ${question}`
  ].filter(Boolean).join('\n\n');

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.4, maxOutputTokens: 800 }
    })
  });

  if (!response.ok) {
    const providerBody = await response.text();
    console.error('Gemini provider error:', providerBody);
    const error = new Error('AI provider request failed.');
    error.statusCode = 502;
    throw error;
  }

  const data = await response.json();
  const answer = data?.candidates?.[0]?.content?.parts?.map((part) => part.text).join('\n').trim();

  if (!answer) {
    const error = new Error('AI provider returned an empty response.');
    error.statusCode = 502;
    throw error;
  }

  return answer;
}
