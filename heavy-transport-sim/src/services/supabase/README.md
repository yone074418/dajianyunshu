# Supabase Client Service

This module provides the Supabase client instance for the application.

## Setup

1. Copy `.env.example` to `.env.local` in the `heavy-transport-sim` directory.
2. Fill in your Supabase project URL and anon key.
3. Never commit `.env.local` — it is already in `.gitignore`.

## Usage

```ts
import { supabase, hasSupabaseEnv } from '@/services/supabase/client';

if (hasSupabaseEnv()) {
  const { data, error } = await supabase.from('table').select();
}
```

## Security

- Only the **anon key** is used in frontend code. It is safe to expose in the browser.
- **Never** use a service role key in frontend code. It bypasses Row Level Security.
- Store the service role key only in server-side environment variables.
