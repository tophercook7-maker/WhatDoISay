#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$ROOT_DIR/.env"

if ! command -v supabase >/dev/null 2>&1; then
  echo "Supabase CLI is not installed or not in PATH."
  echo "Install it with: brew install supabase/tap/supabase"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing .env file at: $ENV_FILE"
  exit 1
fi

get_env_value() {
  local key="$1"
  local value
  value="$(grep -E "^${key}=" "$ENV_FILE" | tail -n 1 | cut -d '=' -f 2- || true)"
  echo "$value"
}

SUPABASE_URL="$(get_env_value "EXPO_PUBLIC_SUPABASE_URL")"
SUPABASE_ANON_KEY="$(get_env_value "EXPO_PUBLIC_SUPABASE_ANON_KEY")"

if [[ -z "$SUPABASE_URL" || -z "$SUPABASE_ANON_KEY" ]]; then
  echo "Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env"
  exit 1
fi

echo "This will set Supabase Edge Function secrets for:"
echo "  Project URL: $SUPABASE_URL"
echo "  OPENAI_MODEL: gpt-4o-mini"
echo
echo "Secrets you type below are not saved to disk."
echo

read -r -s -p "Paste OPENAI_API_KEY: " OPENAI_API_KEY
echo
read -r -s -p "Paste SUPABASE_SERVICE_ROLE_KEY: " SUPABASE_SERVICE_ROLE_KEY
echo

if [[ -z "$OPENAI_API_KEY" || -z "$SUPABASE_SERVICE_ROLE_KEY" ]]; then
  echo "OPENAI_API_KEY and SUPABASE_SERVICE_ROLE_KEY are required."
  exit 1
fi

cd "$ROOT_DIR"

echo "Setting Edge Function secrets..."
supabase secrets set \
  OPENAI_API_KEY="$OPENAI_API_KEY" \
  OPENAI_MODEL="gpt-4o-mini" \
  SUPABASE_URL="$SUPABASE_URL" \
  SUPABASE_ANON_KEY="$SUPABASE_ANON_KEY" \
  SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"

echo
echo "Secrets set."
echo
read -r -p "Redeploy generate-reply and modify-reply now? [y/N] " DEPLOY_REPLY

if [[ "$DEPLOY_REPLY" =~ ^[Yy]$ ]]; then
  supabase functions deploy generate-reply
  supabase functions deploy modify-reply
  echo "Functions redeployed."
else
  echo "Skipped deploy. Deploy later with:"
  echo "  supabase functions deploy generate-reply"
  echo "  supabase functions deploy modify-reply"
fi

echo
echo "Done. Restart Expo after changing .env values."
