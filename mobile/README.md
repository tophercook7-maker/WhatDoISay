# What Do I Say?

A standalone Expo React Native app for turning messy thoughts, pasted messages, typed notes, and voice transcripts into clear, natural, ready-to-send replies.

Core promise: "Type it, paste it, or say it out loud — get the right words back."

## Current Phase

Phase 3 is implemented:

- Expo React Native + TypeScript
- Warm mobile-first UI
- Lightweight in-app navigation
- Welcome, auth, main input, result, history, usage limit, and settings screens
- Mock reply generation and tone modification flow
- Copy-to-clipboard
- Supabase Auth session restore, sign in, sign up, and sign out
- Supabase-backed profiles, daily usage tracking, and optional reply history
- Supabase Edge Functions for secure OpenAI reply generation and modification
- Backend usage enforcement for real AI calls
- Local mock fallback controlled by `EXPO_PUBLIC_USE_MOCK_AI`
- Loading, empty, usage limit, and error states
- Reusable components, typed request/reply models, and clean service boundaries

## Run Locally

Install dependencies if needed. These are already included in `package.json`, but this is the exact command:

```bash
npx expo install @supabase/supabase-js expo-secure-store react-native-url-polyfill
```

Create `.env` from `.env.example` and add:

```bash
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
EXPO_PUBLIC_USE_MOCK_AI=false
```

Use the base Supabase project URL, not the `/rest/v1/` URL.

```bash
cd ~/Desktop/WhatDoISay?/mobile
npm run ios
```

or:

```bash
npm run android
```

## Phase 3 Scope

This phase adds real AI through Supabase Edge Functions. It intentionally does not include RevenueCat, payments, transcription, voice recording, keyboard extensions, or app store packaging.

Run the SQL in `supabase/schema.sql` in your Supabase project before testing auth-backed usage and history.

## Supabase Setup

1. Open your Supabase project dashboard.
2. Go to SQL Editor.
3. Paste the contents of `supabase/schema.sql`.
4. Run the SQL.
5. Confirm that `profiles`, `usage_daily`, `reply_history`, and `subscriptions` exist and have RLS enabled.

The same SQL is also mirrored in `supabase/migrations/0001_phase2_auth_usage_history.sql` for future migration tracking.

## Edge Function Setup

Install and link Supabase CLI if needed:

```bash
brew install supabase/tap/supabase
supabase login
supabase link --project-ref your-project-ref
```

Set secrets with placeholders:

```bash
supabase secrets set OPENAI_API_KEY=sk-your-openai-key
supabase secrets set OPENAI_MODEL=gpt-4o-mini
supabase secrets set SUPABASE_URL=https://your-project-ref.supabase.co
supabase secrets set SUPABASE_ANON_KEY=your-anon-or-publishable-key
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Deploy functions:

```bash
supabase functions deploy generate-reply
supabase functions deploy modify-reply
```

The Supabase service role key is in Supabase Dashboard -> Project Settings -> API -> Project API keys -> `service_role`. Use it only as an Edge Function secret.

## Mock AI Switch

Use real Edge Functions:

```bash
EXPO_PUBLIC_USE_MOCK_AI=false
```

Use local mock replies:

```bash
EXPO_PUBLIC_USE_MOCK_AI=true
```

Restart Expo after changing `.env`.

## Still Mocked / Not Included

- Local mock reply generation remains available in `services/replyService.ts`.
- Voice recording and transcription are not implemented yet.
- RevenueCat and payments are not implemented yet.
- No OpenAI API key belongs in the mobile app.

See `docs/phase-3-openai-edge-functions.md` for request examples, secrets, deployment, and troubleshooting.

## Next Phases

1. Add voice recording and backend transcription.
2. Add RevenueCat-ready subscriptions and paywall behavior.
3. Add production polish, tests, and app store readiness work.
