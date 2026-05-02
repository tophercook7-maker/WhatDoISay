# Phase 3: OpenAI Through Supabase Edge Functions

## Architecture

The mobile app never talks to OpenAI directly. It calls authenticated Supabase Edge Functions using the signed-in user's session JWT. The Edge Function verifies the user, checks plan and usage, calls OpenAI with the server-side system prompt, increments usage after a successful AI response, and saves reply history when enabled.

Flow:

1. Mobile app calls `generate-reply` or `modify-reply` with `supabase.functions.invoke`.
2. Supabase verifies the user's JWT.
3. Function loads `profiles`, `subscriptions`, and today's `usage_daily` row.
4. Free users are blocked after 5 text replies per day.
5. Pro users are not blocked by the free daily limit during development.
6. Function calls OpenAI using `OPENAI_API_KEY` stored as a Supabase secret.
7. Function returns only the sendable reply plus usage summary.

## Why The OpenAI Key Is Server-Side

Expo public environment variables are bundled into the app. Anything in `EXPO_PUBLIC_*` can be extracted from a mobile build. OpenAI and Supabase service role keys must only live in Supabase Edge Function secrets.

## Functions

- `supabase/functions/generate-reply/index.ts`
- `supabase/functions/modify-reply/index.ts`

Shared helpers live in:

- `supabase/functions/_shared/auth.ts`
- `supabase/functions/_shared/cors.ts`
- `supabase/functions/_shared/openai.ts`
- `supabase/functions/_shared/prompt.ts`
- `supabase/functions/_shared/types.ts`
- `supabase/functions/_shared/usage.ts`

## Required Secrets

Set these in Supabase Edge Function secrets:

```bash
supabase secrets set OPENAI_API_KEY=sk-your-openai-key
supabase secrets set OPENAI_MODEL=gpt-4o-mini
supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your-anon-or-publishable-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Get the service role key from:

Supabase Dashboard -> Project Settings -> API -> Project API keys -> `service_role`.

Do not put that key in `.env`, Expo config, source files, screenshots, or the mobile app.

## Deploy

```bash
supabase login
supabase link --project-ref your-project-ref
supabase functions deploy generate-reply
supabase functions deploy modify-reply
```

## Mobile Mock Switch

In `.env`:

```bash
EXPO_PUBLIC_USE_MOCK_AI=true
```

uses the local mock service.

```bash
EXPO_PUBLIC_USE_MOCK_AI=false
```

calls Supabase Edge Functions.

Restart Expo after changing env values.

## Request Examples

Generate:

```json
{
  "userInput": "my pastor left me on read in messenger",
  "pastedMessage": "",
  "mode": "auto",
  "inputType": "text"
}
```

Response:

```json
{
  "reply": "Hey Pastor, I just wanted to follow up when you have a chance. No rush — I know you’re busy.",
  "source": "openai",
  "usage": {
    "plan": "free",
    "textRepliesUsed": 1,
    "textRepliesLimit": 5,
    "remainingTextReplies": 4
  }
}
```

Modify:

```json
{
  "previousReply": "Hey, just checking in to see if you had a chance to see my message when you get a moment.",
  "actionType": "softer",
  "originalInput": "they have not responded",
  "mode": "auto"
}
```

## Troubleshooting

- `401`: The user is not signed in, the function was called without an `Authorization` header, or the JWT is invalid. Sign out and sign back in, then retry.
- `403`: The signed-in user hit the free daily usage limit. Set `profiles.plan = 'pro'`, or add an active pro row in `subscriptions`.
- `500`: Check Edge Function logs. Common causes are missing `OPENAI_API_KEY`, missing `SUPABASE_SERVICE_ROLE_KEY`, or an OpenAI API failure.
- Empty or awkward replies: review the prompt in `supabase/functions/_shared/prompt.ts` and compare against `docs/reply-quality-test-set.md`.

## Local Testing

Serve functions locally with a local secrets file:

```bash
supabase functions serve --env-file supabase/functions/.env.local
```

Then call the hosted or local function with a signed-in user's JWT in the `Authorization` header.
