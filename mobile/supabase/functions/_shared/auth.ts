import { createClient } from 'npm:@supabase/supabase-js@2';

import { HttpError } from './cors.ts';

export function getUserClient(authHeader: string) {
  return createClient(getRequiredEnv('SUPABASE_URL'), getRequiredEnv('SUPABASE_ANON_KEY'), {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
}

export function getAdminClient() {
  return createClient(getRequiredEnv('SUPABASE_URL'), getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: {
      persistSession: false,
    },
  });
}

export async function requireUser(req: Request) {
  const authHeader = req.headers.get('Authorization') ?? req.headers.get('authorization');
  console.log('[auth] Authorization header exists:', Boolean(authHeader));

  if (!authHeader) {
    throw new HttpError(401, 'Missing authorization token.');
  }

  if (!authHeader.startsWith('Bearer ')) {
    throw new HttpError(401, 'Invalid authorization header format.');
  }

  const supabase = getUserClient(authHeader);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new HttpError(401, 'Invalid or expired session. Please sign in again.');
  }

  return user;
}

export function getRequiredEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new HttpError(500, `Server configuration is missing: ${name}`);
  }

  return value;
}
