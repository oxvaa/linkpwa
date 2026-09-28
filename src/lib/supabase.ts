import { createClient } from '@supabase/supabase-js'

const fallbackUrl = 'https://sbszhchbhlvyftdrimjv.supabase.co'
const fallbackKey = 'sb_publishable_HG49rojoBc1BLA-b9VTNzw_iTo5GQaf'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL || fallbackUrl,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || fallbackKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      storageKey: 'link-pwa-3-auth',
    },
    global: {
      headers: {
        'x-link-client': 'link-pwa-3.0',
        'x-link-build': '300-react-tailwind',
      },
    },
  },
)
