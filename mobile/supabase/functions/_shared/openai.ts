import { HttpError } from './cors.ts';
import { REPLY_SYSTEM_PROMPT, RESCUE_SYSTEM_PROMPT } from './prompt.ts';
import { DontSay, Rescue, Strategy } from './types.ts';

interface ChatMessage {
  content: string;
  role: 'system' | 'user';
}

const STRATEGY_IDS: Array<'a' | 'b' | 'c'> = ['a', 'b', 'c'];

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

  return reply as string;
}

export async function createRescue(userMessage: string): Promise<Rescue> {
  const apiKey = Deno.env.get('OPENAI_API_KEY');

  if (!apiKey) {
    throw new HttpError(500, 'Server configuration is missing: OPENAI_API_KEY');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    body: JSON.stringify({
      messages: [
        { role: 'system', content: RESCUE_SYSTEM_PROMPT },
        { role: 'user', content: userMessage },
      ] satisfies ChatMessage[],
      model: Deno.env.get('OPENAI_MODEL') || 'gpt-4o-mini',
      temperature: 0.7,
      response_format: { type: 'json_object' },
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
  const raw = data.choices?.[0]?.message?.content?.trim();

  if (!raw) {
    throw new HttpError(500, 'The AI service returned an empty reply.');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    console.error('Rescue parse failure:', raw);
    throw new HttpError(500, 'The AI service returned a malformed reply.');
  }

  const validated = validateRescue(parsed);
  if (!validated) {
    console.error('Rescue shape validation failed:', JSON.stringify(parsed));
    throw new HttpError(500, 'The AI service returned an unexpected reply shape.');
  }

  return validated;
}

function validateRescue(value: unknown): Rescue | null {
  if (!value || typeof value !== 'object') return null;
  const obj = value as Record<string, unknown>;
  const rawStrategies = obj.strategies;
  const rawDontSay = obj.dontSay;

  if (!Array.isArray(rawStrategies) || rawStrategies.length === 0) return null;
  if (!rawDontSay || typeof rawDontSay !== 'object') return null;

  const strategies: Strategy[] = [];
  for (let i = 0; i < Math.min(rawStrategies.length, 3); i++) {
    const candidate = rawStrategies[i] as Record<string, unknown>;
    if (!candidate || typeof candidate.label !== 'string' || typeof candidate.text !== 'string') {
      return null;
    }
    strategies.push({
      id: STRATEGY_IDS[i],
      label: candidate.label.slice(0, 32).trim(),
      text: candidate.text.trim(),
    });
  }

  if (strategies.length === 0) return null;

  const ds = rawDontSay as Record<string, unknown>;
  if (typeof ds.trap !== 'string' || typeof ds.why !== 'string') return null;

  const dontSay: DontSay = {
    trap: ds.trap.trim(),
    why: ds.why.trim(),
  };

  return { strategies, dontSay };
}
