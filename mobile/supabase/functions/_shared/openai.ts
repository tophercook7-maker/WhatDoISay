import { HttpError } from './cors.ts';
import { REPLY_SYSTEM_PROMPT } from './prompt.ts';

interface ChatMessage {
  content: string;
  role: 'system' | 'user';
}

export async function createReply(userMessage: string) {
  const apiKey = Deno.env.get('OPENAI_API_KEY');

  if (!apiKey) {
    throw new HttpError(500, 'Server configuration is missing: OPENAI_API_KEY');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    body: JSON.stringify({
      messages: [
        { role: 'system', content: REPLY_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ] satisfies ChatMessage[],
      model: Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini',
      temperature: 0.55,
    }),
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    const message = await response.text();
    console.error('OpenAI error:', message);
    throw new HttpError(500, 'The AI service did not respond. Please try again.');
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content?.trim();

  if (!reply) {
    throw new HttpError(500, 'The AI service returned an empty reply.');
  }

  return reply;
}
