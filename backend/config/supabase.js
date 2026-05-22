import { createClient } from '@supabase/supabase-js';
import { env, providerStatus } from './env.js';

export const supabase = providerStatus.supabase
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: { persistSession: false }
    })
  : null;
