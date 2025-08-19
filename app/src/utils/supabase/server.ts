import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // Reading auth cookies
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // Called from a Server Component, read-only, can't modify cookies
          // Updating the auth cookies with new tokens
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch (error) {
            // Setting cookies should fail silently
            if (process.env.NODE_ENV === "development") {
              console.warn(
                "Cookie setting failed in Server Component (this is expected):",
                error
              );
            }
          }
        },
      },
    }
  );
}
