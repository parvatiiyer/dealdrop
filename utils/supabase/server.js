// utils/supabase/server.js
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export function createServer() {
  // cookies() may be sync or async depending on where it's called
  const cookieStoreOrPromise = cookies();

  async function getCookieStore() {
    return typeof cookieStoreOrPromise.then === "function"
      ? await cookieStoreOrPromise
      : cookieStoreOrPromise;
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        async getAll() {
          const store = await getCookieStore();
          return store.getAll();
        },
        async setAll(cookiesToSet) {
          const store = await getCookieStore();
          cookiesToSet.forEach(({ name, value, options }) =>
            store.set(name, value, options)
          );
        },
      },
    }
  );
}
