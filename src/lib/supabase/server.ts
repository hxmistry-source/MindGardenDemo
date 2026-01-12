import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

type CookieOptions = Record<string, unknown>;

function createServerSupabase(allowMutations: boolean) {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          if (!allowMutations) {
            return;
          }
          cookieStore.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          if (!allowMutations) {
            return;
          }
          cookieStore.set({ name, value: "", ...options });
        },
      },
    }
  );
}

export function createServerSupabaseReadOnly() {
  return createServerSupabase(false);
}

export function createServerSupabaseWithCookies() {
  return createServerSupabase(true);
}
