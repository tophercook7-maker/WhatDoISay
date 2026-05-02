import { generateReply } from '../services/replyService';
import { ReplyRequest } from '../types';

interface ReplyQualityCase {
  name: string;
  input: string;
  expected: string;
  required: string[];
}

const BAD_PATTERNS = [
  "here's",
  'here is',
  'you could say',
  'as an ai',
  'dear valued',
  'i can help you craft',
  'certainly!',
];

const CASES: ReplyQualityCase[] = [
  {
    name: 'pastor left on read',
    input: 'my pastor left me on read in messenger',
    expected: 'Respectful pastor follow-up with patient wording.',
    required: ['pastor', 'follow up', 'when you have a chance', 'no rush'],
  },
  {
    name: 'pastor ignored feeling',
    input: 'my pastor left me on read and I feel ignored',
    expected: 'Respectful check-in that mentions hearing back without sounding accusatory.',
    required: ['pastor', 'check in', 'hearing back'],
  },
  {
    name: 'client free changes',
    input: 'client keeps asking for free changes',
    expected: 'Professional scope boundary with separate quote.',
    required: ['outside the original scope', 'quote'],
  },
  {
    name: 'sister borrow money',
    input: 'my sister keeps asking to borrow money',
    expected: 'Kind but firm money boundary.',
    required: ['love you', 'not able to lend money'],
  },
  {
    name: 'forgot friend reply',
    input: 'I forgot to reply to my friend for a week',
    expected: 'Natural apology for late reply.',
    required: ['sorry', "didn't reply sooner", 'should'],
  },
  {
    name: 'customer mad website late',
    input: 'my customer is mad the website is late',
    expected: 'Apology and update language for delayed client work.',
    required: ['sorry for the delay', 'update'],
  },
  {
    name: 'boss extra work',
    input: "tell my boss I can't work extra this week",
    expected: 'Clear work boundary about not being available.',
    required: ['not available', 'this week'],
  },
  {
    name: 'facebook website lead',
    input: 'someone replied to my Facebook ad asking how much a website costs',
    expected: 'Lead reply that asks quick questions and explains pricing depends on needs.',
    required: ['pricing depends', 'couple quick questions'],
  },
  {
    name: 'angry plan changes',
    input: "I'm pissed because they keep changing the plan",
    expected: 'Clean frustration into a calm request for clarity.',
    required: ["i'm frustrated", 'plan keeps changing', 'clear'],
  },
  {
    name: 'kind refusal',
    input: 'I need to say no but not sound mean',
    expected: 'Simple kind refusal.',
    required: ['sorry', 'not able'],
  },
];

async function main() {
  const failures: string[] = [];

  for (const testCase of CASES) {
    const reply = await generateReply(toRequest(testCase.input));
    const normalized = normalizeForCheck(reply);
    const missing = testCase.required.filter((phrase) => !normalized.includes(normalizeForCheck(phrase)));
    const badPattern = BAD_PATTERNS.find((pattern) => normalized.includes(pattern));

    if (!reply.trim()) {
      failures.push(`${testCase.name}: empty output`);
      continue;
    }

    if (missing.length > 0) {
      failures.push(`${testCase.name}: missing ${missing.join(', ')}\n  reply: ${reply}`);
    }

    if (badPattern) {
      failures.push(`${testCase.name}: contains bad pattern "${badPattern}"\n  reply: ${reply}`);
    }
  }

  if (failures.length > 0) {
    console.error(`Reply quality checks failed (${failures.length}):\n`);
    console.error(failures.join('\n\n'));
    process.exit(1);
  }

  console.log(`Reply quality checks passed (${CASES.length} cases).`);
}

function toRequest(userInput: string): ReplyRequest {
  return {
    inputType: 'typed',
    mode: 'auto',
    userInput,
  };
}

function normalizeForCheck(value: string) {
  return value.toLowerCase().replace(/[’‘]/g, "'").replace(/\s+/g, ' ').trim();
}

void main();
