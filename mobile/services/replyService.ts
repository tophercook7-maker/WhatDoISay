import { ModificationType, ReplyRequest } from '../types';

const FOLLOW_UP_KEYWORDS = [
  'left me on read',
  "didn't respond",
  'didnt respond',
  'has not responded',
  "hasn't responded",
  'no reply',
  'ignored',
  "won't answer",
  'messenger',
  "texted and they didn't answer",
  'texted and they didnt answer',
  'follow up',
  'checking in',
  'get back to me',
];

const SPIRITUAL_KEYWORDS = ['pastor', 'church', 'prayer', 'pray', 'spiritual', 'ministry'];

const BUSINESS_KEYWORDS = [
  'client',
  'customer',
  'invoice',
  'payment',
  'paid',
  'project',
  'website',
  'quote',
  'estimate',
  'business',
  'service',
  'changes',
  'revision',
  'scope',
  'deadline',
];

const PAYMENT_KEYWORDS = [
  'payment',
  'invoice',
  'paid',
  'unpaid',
  'deposit',
  'balance',
  'money owed',
  "hasn't paid",
  'late payment',
];

const BOUNDARY_KEYWORDS = [
  "don't want to",
  'dont want to',
  'say no',
  "can't",
  'cant',
  'not able',
  'boundary',
  'keep asking',
  'borrow money',
  'money again',
  'money',
  'borrow',
  'tired of saying yes',
];

const APOLOGY_KEYWORDS = [
  'sorry',
  'apologize',
  'forgot',
  'my fault',
  'late reply',
  'messed up',
  'i was wrong',
  "didn't mean to",
];

const FRUSTRATION_KEYWORDS = ['pissed', 'mad', 'angry', 'annoyed', 'frustrated', 'tired of', 'done with', 'sick of', 'fed up'];

const RELATIONSHIP_KEYWORDS = [
  'wife',
  'husband',
  'girlfriend',
  'boyfriend',
  'partner',
  'mom',
  'dad',
  'sister',
  'brother',
  'family',
  'friend',
];

const WORK_KEYWORDS = ['boss', 'manager', 'coworker', 'shift', 'work', 'job', 'schedule', 'meeting'];

const SALES_LEAD_KEYWORDS = [
  'price',
  'how much',
  'cost',
  'interested',
  'quote',
  'facebook',
  'lead',
  'marketplace',
  'website price',
];

export async function generateReply(request: ReplyRequest): Promise<string> {
  await simulateNetworkDelay();

  const source = normalize(`${request.userInput} ${request.pastedMessage ?? ''}`);

  if (matches(source, FOLLOW_UP_KEYWORDS)) {
    if (matches(source, SPIRITUAL_KEYWORDS)) {
      if (source.includes('ignored') || source.includes('left me on read')) {
        if (source.includes('ignored')) {
          return `Hey Pastor, I just wanted to check in when you have a moment. I know you’re busy, but I’d still appreciate hearing back when you can.`;
        }

        return `Hey Pastor, I just wanted to follow up when you have a chance. No rush — I know you’re busy.`;
      }

      return `Hey Pastor, I just wanted to follow up when you have a chance. No rush — I know you’re busy.`;
    }

    if (source.includes('ignored')) {
      return `Hey, I just wanted to check in when you have a moment. I know things get busy, but I’d still appreciate hearing back when you can.`;
    }

    return `Hey, just checking in to see if you had a chance to see my message when you get a moment.`;
  }

  if (matches(source, WORK_KEYWORDS)) {
    if (source.includes('meeting') || source.includes('schedule')) {
      return `That time won’t work for me, but I’m happy to find another time that does.`;
    }

    if (source.includes('shift') || source.includes('extra')) {
      return `I’m sorry, but I’m not available to take another shift this week.`;
    }

    return `I’m sorry, but I’m not available to take on anything extra this week.`;
  }

  if (matches(source, SALES_LEAD_KEYWORDS)) {
    return `Thanks for reaching out. Pricing depends on what you need, but I’d be happy to ask a couple quick questions and point you in the right direction.`;
  }

  if (matches(source, BUSINESS_KEYWORDS) || source.includes('changes')) {
    if (
      (source.includes('customer') || source.includes('client')) &&
      source.includes('mad') &&
      source.includes('website') &&
      source.includes('late')
    ) {
      return `You’re right to check in, and I’m sorry for the delay. I’m finishing it up now and will send you an update as soon as it’s ready.`;
    }

    if ((source.includes('behind') || source.includes('late')) && source.includes('tomorrow')) {
      return `Hey, I’m running a little behind, but I’ll have it ready for you tomorrow. Thanks for your patience.`;
    }

    if (source.includes('free changes') || source.includes('outside scope') || source.includes('extra changes')) {
      return `I can make those updates, but they’re outside the original scope, so I’ll need to quote them separately before moving forward.`;
    }

    if (matches(source, PAYMENT_KEYWORDS)) {
      if (source.includes("hasn't paid") || source.includes('unpaid') || source.includes('late payment')) {
        return `I still haven’t received the payment, and I’ll need that taken care of before continuing with any more work.`;
      }

      return `Just checking in on the payment for this. Once that’s taken care of, I’ll be able to move forward.`;
    }

    return `I can make those updates, but they’re outside the original scope, so I’ll need to quote them separately before moving forward.`;
  }

  if (matches(source, PAYMENT_KEYWORDS)) {
    if (source.includes("hasn't paid") || source.includes('unpaid') || source.includes('late payment')) {
      return `I still haven’t received the payment, and I’ll need that taken care of before continuing with any more work.`;
    }

    return `Just checking in on the payment for this. Once that’s taken care of, I’ll be able to move forward.`;
  }

  if (matches(source, BOUNDARY_KEYWORDS)) {
    if (source.includes('sister') || source.includes('brother') || source.includes('mom') || source.includes('dad')) {
      return `I love you, but I’m not able to lend money right now. I hope you understand.`;
    }

    if (source.includes('weekend')) {
      return `I’m sorry, but I’m not able to help this weekend.`;
    }

    return `I’m sorry, but I’m not able to do that. I hope you understand.`;
  }

  if (matches(source, APOLOGY_KEYWORDS)) {
    if (source.includes('late reply') || source.includes('forgot to reply') || source.includes("didn't reply")) {
      return `Hey, I’m sorry I didn’t reply sooner. That was on me. I’ve had a lot going on, but I should’ve gotten back to you.`;
    }

    return `Hey, I’m sorry about that. That was on me, and I should have handled it better.`;
  }

  if (matches(source, FRUSTRATION_KEYWORDS)) {
    if (source.includes('changing the plan') || source.includes('plan keeps changing')) {
      return `I’m frustrated because the plan keeps changing, and I need us to get clear on what we’re actually moving forward with.`;
    }

    return `I’m frustrated, and I want to talk about this clearly without turning it into an argument.`;
  }

  if (matches(source, RELATIONSHIP_KEYWORDS)) {
    if (source.includes('hurt my feelings') || source.includes("don't want to start a fight")) {
      return `I don’t want to argue, but what happened did hurt my feelings. I just wanted to be honest about that.`;
    }

    return `I care about you, and I don’t want this to come out the wrong way. I just want to be honest about how I’m feeling so we can talk through it.`;
  }

  if (source.includes('late') || source.includes('behind') || source.includes('tomorrow')) {
    return `Hey, I’m running a little behind, but I’ll have it ready for you tomorrow. Thanks for your patience.`;
  }

  return `I wanted to say this clearly without making it awkward. I’m not trying to cause a problem, but I do want to be honest about where I’m at.`;
}

export async function modifyReply(previousReply: string, modification: ModificationType): Promise<string> {
  await simulateNetworkDelay();

  switch (modification) {
    case 'shorter':
      return shorten(previousReply);
    case 'softer':
      return soften(previousReply);
    case 'firmer':
      return firmUp(previousReply);
    case 'casual':
      return makeCasual(previousReply);
    case 'professional':
      return makeProfessional(previousReply);
    default:
      return previousReply;
  }
}

function shorten(value: string) {
  if (value.includes('outside the original scope')) {
    return `I can make those updates, but I’ll need to quote them separately first.`;
  }

  if (value.includes('Hey Pastor')) {
    return `Hey Pastor, just checking in when you have a chance. No rush.`;
  }

  if (value.includes('I’m frustrated because the plan keeps changing')) {
    return `I’m frustrated because the plan keeps changing, and I need us to get clear.`;
  }

  if (value.includes('not available to take another shift')) {
    return `I’m sorry, but I can’t take another shift this week.`;
  }

  const firstSentence = value.split(/(?<=[.!?])\s+/)[0]?.trim();
  return firstSentence && firstSentence.length > 8 ? firstSentence : value;
}

function soften(value: string) {
  if (value.includes('not able to lend money')) {
    return `I love you, and I wish I could help, but I’m not able to lend money right now. I hope you understand.`;
  }

  if (value.includes('outside the original scope')) {
    return `I’m happy to help with those updates. Since they’re outside the original scope, I’ll need to quote them separately before moving forward.`;
  }

  return `I want to say this gently: ${lowercaseFirst(value)}`;
}

function firmUp(value: string) {
  if (value.includes('not able to lend money')) {
    return `I’m not able to lend money right now, and I need to be clear about that. I hope you understand.`;
  }

  if (value.includes('outside the original scope')) {
    return `Those updates are outside the original scope, so I’ll need to quote them separately before doing the work.`;
  }

  return `I want to be clear: ${lowercaseFirst(value)}`;
}

function makeCasual(value: string) {
  return value
    .replace('I just wanted to follow up', 'Just wanted to follow up')
    .replace('I just wanted to follow up', 'Just wanted to follow up')
    .replace('I just wanted to check in', 'Just checking in')
    .replace('I’d still appreciate hearing back', 'I’d still appreciate hearing back')
    .replace('before moving forward', 'before I move forward')
    .replace('That time won’t work for me', 'That time doesn’t work for me')
    .replace('I am', 'I’m');
}

function makeProfessional(value: string) {
  if (value.startsWith('Hey Pastor')) {
    return value;
  }

  if (value.includes('outside the original scope')) {
    return `I can complete those updates, but they fall outside the original scope. I’ll need to provide a separate quote before moving forward.`;
  }

  return `I wanted to communicate this clearly and respectfully. ${value}`;
}

function lowercaseFirst(value: string) {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function matches(source: string, keywords: string[]) {
  return keywords.some((keyword) => source.includes(keyword));
}

function normalize(value: string) {
  return value.toLowerCase().replace(/[’']/g, "'").replace(/\s+/g, ' ').trim();
}

function simulateNetworkDelay() {
  return new Promise((resolve) => setTimeout(resolve, 450));
}
